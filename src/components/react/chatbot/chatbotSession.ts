import type { ChatbotMessage } from "../../../lib/chatbot/types.ts";

export const CHATBOT_SESSION_KEY = "nous-chatbot-session-v2";
export const CHATBOT_SESSION_TIMEOUT_MS = 30 * 60 * 1000;

export interface StoredChatbotSession {
  messages?: ChatbotMessage[];
  previousResponseId?: string | null;
  updatedAt?: number;
}

export function parseStoredChatbotSession(
  raw: string | null,
  now = Date.now(),
): StoredChatbotSession | null {
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as StoredChatbotSession;
    const updatedAt = typeof parsed.updatedAt === "number" ? parsed.updatedAt : 0;

    if (!updatedAt || now - updatedAt >= CHATBOT_SESSION_TIMEOUT_MS) {
      return null;
    }

    return {
      messages: Array.isArray(parsed.messages) ? parsed.messages.slice(-8) : [],
      previousResponseId:
        typeof parsed.previousResponseId === "string"
          ? parsed.previousResponseId
          : null,
      updatedAt,
    };
  } catch {
    return null;
  }
}
