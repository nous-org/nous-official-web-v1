import type { ChatbotMessage, ChatbotMessageStatus, ChatbotRole } from "../../../lib/chatbot/types.ts";

export interface ChatbotState {
  isOpen: boolean;
  messages: ChatbotMessage[];
  input: string;
  isStreaming: boolean;
  error: string | null;
  previousResponseId: string | null;
}

export type ChatbotAction =
  | { type: "open" }
  | { type: "close" }
  | { type: "set_input"; input: string }
  | { type: "hydrate"; messages: ChatbotMessage[]; previousResponseId: string | null }
  | { type: "add_user_message"; message: ChatbotMessage }
  | { type: "assistant_started"; message: ChatbotMessage }
  | { type: "assistant_delta"; id: string; text: string }
  | { type: "assistant_complete"; id: string; previousResponseId?: string | null }
  | { type: "assistant_error"; id: string; message: string }
  | { type: "set_previous_response_id"; previousResponseId: string | null }
  | { type: "reset"; keepOpen?: boolean };

export const initialChatbotState: ChatbotState = {
  isOpen: false,
  messages: [],
  input: "",
  isStreaming: false,
  error: null,
  previousResponseId: null,
};

export function chatbotReducer(state: ChatbotState, action: ChatbotAction): ChatbotState {
  switch (action.type) {
    case "open":
      return { ...state, isOpen: true };
    case "close":
      return { ...state, isOpen: false };
    case "set_input":
      return { ...state, input: action.input };
    case "hydrate":
      return {
        ...state,
        messages: action.messages,
        previousResponseId: action.previousResponseId,
      };
    case "add_user_message":
      return {
        ...state,
        messages: [...state.messages, action.message],
        input: "",
        error: null,
      };
    case "assistant_started":
      return {
        ...state,
        messages: [...state.messages, action.message],
        isStreaming: true,
        error: null,
      };
    case "assistant_delta":
      return {
        ...state,
        messages: state.messages.map((message) =>
          message.id === action.id
            ? {
                ...message,
                content: `${message.content}${action.text}`,
                status: "streaming",
              }
            : message,
        ),
      };
    case "assistant_complete":
      return {
        ...state,
        messages: state.messages.map((message) =>
          message.id === action.id
            ? {
                ...message,
                status: "complete",
              }
            : message,
        ),
        isStreaming: false,
        previousResponseId:
          action.previousResponseId === undefined
            ? state.previousResponseId
            : action.previousResponseId,
      };
    case "assistant_error":
      return {
        ...state,
        messages: state.messages.map((message) =>
          message.id === action.id
            ? {
                ...message,
                content: message.content || action.message,
                status: "error",
              }
            : message,
        ),
        isStreaming: false,
        error: action.message,
      };
    case "set_previous_response_id":
      return { ...state, previousResponseId: action.previousResponseId };
    case "reset":
      return {
        ...initialChatbotState,
        isOpen: action.keepOpen ?? state.isOpen,
      };
    default:
      return state;
  }
}

export function createChatbotMessage(
  role: ChatbotRole,
  content: string,
  status: ChatbotMessageStatus = "complete",
): ChatbotMessage {
  return {
    id: crypto.randomUUID(),
    role,
    content,
    status,
    createdAt: new Date().toISOString(),
  };
}

export function getPersistableMessages(messages: ChatbotMessage[]) {
  return messages
    .filter((message) => message.role === "user" || message.role === "assistant")
    .filter((message) => message.status === "complete")
    .slice(-8);
}
