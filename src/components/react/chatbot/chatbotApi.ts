import type { ChatbotMessage, ChatbotPageContext } from "../../../lib/chatbot/types.ts";

export interface ChatbotStreamPayload {
  message: string;
  previousResponseId?: string;
  messages?: ChatbotMessage[];
  pageContext: ChatbotPageContext;
  locale: "en" | "es";
}

export interface ParsedSseEvent {
  event: string;
  data: Record<string, unknown>;
}

export async function streamChatbotResponse(
  payload: ChatbotStreamPayload,
  callbacks: {
    onDelta: (text: string) => void;
    onResponseId: (id: string) => void;
    onDone: () => void;
    onError: (message: string) => void;
  },
  signal: AbortSignal,
) {
  const response = await fetch("/api/chatbot", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "text/event-stream, application/json",
    },
    body: JSON.stringify(payload),
    signal,
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => null) as { message?: string } | null;
    throw new Error(errorBody?.message || "The assistant is unavailable.");
  }

  if (!response.body) {
    throw new Error("The assistant returned an empty stream.");
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const parsed = extractSseEvents(buffer);
    buffer = parsed.remainder;

    for (const event of parsed.events) {
      if (event.event === "delta" && typeof event.data.text === "string") {
        callbacks.onDelta(event.data.text);
      } else if (event.event === "response_id" && typeof event.data.id === "string") {
        callbacks.onResponseId(event.data.id);
      } else if (event.event === "done") {
        callbacks.onDone();
      } else if (event.event === "error") {
        callbacks.onError(
          typeof event.data.message === "string"
            ? event.data.message
            : "The assistant could not complete that answer.",
        );
      }
    }
  }
}

export function extractSseEvents(buffer: string): {
  events: ParsedSseEvent[];
  remainder: string;
} {
  const chunks = buffer.split("\n\n");
  const remainder = chunks.pop() || "";
  const events = chunks
    .map(parseSseEvent)
    .filter((event): event is ParsedSseEvent => Boolean(event));

  return { events, remainder };
}

export function capturePageContext(): ChatbotPageContext {
  const main = document.querySelector("main");
  const visibleText = normalizeText(main?.textContent || document.body.textContent || "");
  const selection = window.getSelection()?.toString() || "";
  const metaDescription = document
    .querySelector('meta[name="description"]')
    ?.getAttribute("content") || "";

  return {
    url: window.location.pathname,
    title: document.title,
    description: normalizeText(metaDescription).slice(0, 320),
    headings: Array.from(document.querySelectorAll("main h1, main h2"))
      .map((heading) => normalizeText(heading.textContent || ""))
      .filter(Boolean)
      .slice(0, 10),
    selectedText: normalizeText(selection).slice(0, 900),
    visibleTextSnippet: visibleText.slice(0, 1400),
  };
}

function parseSseEvent(chunk: string): ParsedSseEvent | null {
  const lines = chunk.split("\n");
  const eventLine = lines.find((line) => line.startsWith("event:"));
  const dataLines = lines.filter((line) => line.startsWith("data:"));
  const event = eventLine?.replace(/^event:\s*/, "").trim();
  const rawData = dataLines.map((line) => line.replace(/^data:\s*/, "")).join("\n");

  if (!event) return null;

  try {
    return {
      event,
      data: rawData ? JSON.parse(rawData) : {},
    };
  } catch {
    return {
      event,
      data: {},
    };
  }
}

function normalizeText(value: string) {
  return value.replace(/\s+/g, " ").trim();
}
