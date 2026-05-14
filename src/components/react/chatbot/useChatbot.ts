import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from "react";
import { CHATBOT_MAX_MESSAGE_LENGTH } from "../../../lib/chatbot/site-context.ts";
import { capturePageContext, streamChatbotResponse } from "./chatbotApi";
import {
  chatbotReducer,
  createChatbotMessage,
  getPersistableMessages,
  initialChatbotState,
} from "./chatbotState";
import {
  CHATBOT_SESSION_KEY,
  CHATBOT_SESSION_TIMEOUT_MS,
  parseStoredChatbotSession,
  type StoredChatbotSession,
} from "./chatbotSession";

const CHATBOT_SESSION_CHECK_MS = 60 * 1000;

export function useChatbot({
  locale,
  storeResponses,
}: {
  locale: "en" | "es";
  storeResponses: boolean;
}) {
  const [state, dispatch] = useReducer(chatbotReducer, initialChatbotState);
  const [isSessionReady, setIsSessionReady] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const latestResponseIdRef = useRef<string | null>(null);
  const lastUserMessageRef = useRef<string>("");
  const lastActivityAtRef = useRef(Date.now());

  useEffect(() => {
    const stored = readSession();
    if (stored) {
      lastActivityAtRef.current = stored.updatedAt || Date.now();

      dispatch({
        type: "hydrate",
        messages: stored.messages || [],
        previousResponseId: storeResponses ? stored.previousResponseId || null : null,
      });
    }

    setIsSessionReady(true);
  }, [storeResponses]);

  useEffect(() => {
    if (!isSessionReady) return;

    const updatedAt = Date.now();
    lastActivityAtRef.current = updatedAt;

    const session: StoredChatbotSession = {
      messages: getPersistableMessages(state.messages),
      previousResponseId: storeResponses ? state.previousResponseId : null,
      updatedAt,
    };

    try {
      sessionStorage.setItem(CHATBOT_SESSION_KEY, JSON.stringify(session));
    } catch {
      // Session continuity is optional.
    }
  }, [isSessionReady, state.messages, state.previousResponseId, storeResponses]);

  useEffect(() => {
    if (!isSessionReady) return;

    const id = window.setInterval(() => {
      const hasConversation = state.messages.length > 0 || Boolean(state.previousResponseId);
      if (!hasConversation) return;

      if (Date.now() - lastActivityAtRef.current < CHATBOT_SESSION_TIMEOUT_MS) {
        return;
      }

      abortControllerRef.current?.abort();
      latestResponseIdRef.current = null;
      lastUserMessageRef.current = "";
      clearSession();
      dispatch({ type: "reset", keepOpen: state.isOpen });
    }, CHATBOT_SESSION_CHECK_MS);

    return () => window.clearInterval(id);
  }, [
    isSessionReady,
    state.isOpen,
    state.messages.length,
    state.previousResponseId,
  ]);

  const visibleHistory = useMemo(
    () => getPersistableMessages(state.messages),
    [state.messages],
  );

  const sendMessage = useCallback(
    async (messageOverride?: string) => {
      const content = (messageOverride ?? state.input).trim();
      if (!content || state.isStreaming) return;

      const boundedContent = content.slice(0, CHATBOT_MAX_MESSAGE_LENGTH);
      const userMessage = createChatbotMessage("user", boundedContent, "complete");
      const assistantMessage = createChatbotMessage("assistant", "", "streaming");
      const abortController = new AbortController();
      latestResponseIdRef.current = null;
      abortControllerRef.current = abortController;
      lastUserMessageRef.current = boundedContent;

      dispatch({ type: "add_user_message", message: userMessage });
      dispatch({ type: "assistant_started", message: assistantMessage });

      try {
        await streamChatbotResponse(
          {
            message: boundedContent,
            previousResponseId: storeResponses
              ? state.previousResponseId || undefined
              : undefined,
            messages: storeResponses ? undefined : visibleHistory,
            pageContext: capturePageContext(),
            locale,
          },
          {
            onDelta: (text) => {
              dispatch({ type: "assistant_delta", id: assistantMessage.id, text });
            },
            onResponseId: (id) => {
              latestResponseIdRef.current = id;
              if (storeResponses) {
                dispatch({ type: "set_previous_response_id", previousResponseId: id });
              }
            },
            onDone: () => {
              dispatch({
                type: "assistant_complete",
                id: assistantMessage.id,
                previousResponseId: storeResponses ? latestResponseIdRef.current : null,
              });
            },
            onError: (message) => {
              dispatch({ type: "assistant_error", id: assistantMessage.id, message });
            },
          },
          abortController.signal,
        );
      } catch (error) {
        if (abortController.signal.aborted) {
          dispatch({
            type: "assistant_complete",
            id: assistantMessage.id,
            previousResponseId: storeResponses ? latestResponseIdRef.current : null,
          });
        } else {
          dispatch({
            type: "assistant_error",
            id: assistantMessage.id,
            message: error instanceof Error
              ? error.message
              : "The assistant is unavailable.",
          });
        }
      } finally {
        abortControllerRef.current = null;
      }
    },
    [
      locale,
      state.input,
      state.isStreaming,
      state.previousResponseId,
      storeResponses,
      visibleHistory,
    ],
  );

  const stop = useCallback(() => {
    abortControllerRef.current?.abort();
  }, []);

  const reset = useCallback(() => {
    abortControllerRef.current?.abort();
    latestResponseIdRef.current = null;
    lastUserMessageRef.current = "";
    clearSession();
    dispatch({ type: "reset", keepOpen: true });
  }, []);

  const retry = useCallback(() => {
    if (lastUserMessageRef.current) {
      void sendMessage(lastUserMessageRef.current);
    }
  }, [sendMessage]);

  return {
    state,
    dispatch,
    sendMessage,
    stop,
    reset,
    retry,
  };
}

function readSession(): StoredChatbotSession | null {
  try {
    const raw = sessionStorage.getItem(CHATBOT_SESSION_KEY);
    const parsed = parseStoredChatbotSession(raw);
    if (!parsed && raw) {
      clearSession();
    }

    return parsed;
  } catch {
    return null;
  }
}

function clearSession() {
  try {
    sessionStorage.removeItem(CHATBOT_SESSION_KEY);
  } catch {
    // Optional cleanup only.
  }
}
