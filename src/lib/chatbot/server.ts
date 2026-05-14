import { z } from "zod";
import {
  CHATBOT_MAX_HISTORY_MESSAGE_LENGTH,
  CHATBOT_MAX_HISTORY_MESSAGES,
  CHATBOT_MAX_MESSAGE_LENGTH,
  CHATBOT_MAX_OUTPUT_TOKENS,
  CHATBOT_MAX_PAGE_TEXT_LENGTH,
  CHATBOT_MAX_SELECTED_TEXT_LENGTH,
  getPublicSiteProfile,
  normalizeChatbotLocale,
} from "./site-context.ts";
import { buildChatbotInstructions } from "./prompt.ts";
import type { ChatbotMessage, ChatbotPageContext, ChatbotRequestPayload } from "./types.ts";

export interface ChatbotRuntimeEnv {
  OPENAI_API_KEY?: string;
  OPENAI_MODEL?: string;
  OPENAI_CHATBOT_ENABLED?: string;
  OPENAI_CHATBOT_STORE_RESPONSES?: string;
  OPENAI_VECTOR_STORE_ID?: string;
}

export interface ChatbotRuntimeConfig {
  enabled: boolean;
  available: boolean;
  reason?: "disabled" | "missing_api_key" | "missing_model";
  apiKey?: string;
  model?: string;
  storeResponses: boolean;
  vectorStoreId?: string;
  maxOutputTokens: number;
}

const boundedText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .transform((value) => normalizeWhitespace(value));

const requiredBoundedText = (max: number) =>
  z
    .string()
    .trim()
    .min(1, "Message is required")
    .max(max)
    .transform((value) => normalizeWhitespace(value));

const pageContextSchema = z
  .object({
    url: z.string().trim().max(240).optional(),
    title: boundedText(180).optional(),
    description: boundedText(320).optional(),
    headings: z.array(boundedText(120)).max(12).optional(),
    selectedText: boundedText(CHATBOT_MAX_SELECTED_TEXT_LENGTH).optional(),
    visibleTextSnippet: boundedText(CHATBOT_MAX_PAGE_TEXT_LENGTH).optional(),
  })
  .strip();

const visibleMessageSchema = z
  .object({
    id: z.string().max(120).optional(),
    role: z.enum(["user", "assistant"]),
    content: boundedText(CHATBOT_MAX_HISTORY_MESSAGE_LENGTH),
    createdAt: z.string().max(80).optional(),
    status: z.enum(["pending", "streaming", "complete", "error"]).optional(),
  })
  .strip();

export const chatbotPayloadSchema = z
  .object({
    message: requiredBoundedText(CHATBOT_MAX_MESSAGE_LENGTH),
    previousResponseId: z
      .string()
      .trim()
      .max(160)
      .regex(/^[a-zA-Z0-9_.:-]+$/)
      .optional(),
    messages: z.array(visibleMessageSchema).max(CHATBOT_MAX_HISTORY_MESSAGES).optional(),
    pageContext: pageContextSchema.optional(),
    locale: z.enum(["en", "es"]).optional(),
  })
  .strip();

export function validateChatbotPayload(raw: unknown):
  | { success: true; data: ChatbotRequestPayload }
  | { success: false; message: string; issues: z.core.$ZodIssue[] } {
  const parsed = chatbotPayloadSchema.safeParse(raw);

  if (!parsed.success) {
    return {
      success: false,
      message: "Please send a shorter message with valid page context.",
      issues: parsed.error.issues,
    };
  }

  return { success: true, data: parsed.data as ChatbotRequestPayload };
}

export function resolveChatbotConfig(env: ChatbotRuntimeEnv): ChatbotRuntimeConfig {
  const enabled = parseBoolean(env.OPENAI_CHATBOT_ENABLED, false);
  const storeResponses = parseBoolean(env.OPENAI_CHATBOT_STORE_RESPONSES, false);
  const model = env.OPENAI_MODEL?.trim();
  const apiKey = env.OPENAI_API_KEY?.trim();
  const vectorStoreId = env.OPENAI_VECTOR_STORE_ID?.trim();

  if (!enabled) {
    return {
      enabled,
      available: false,
      reason: "disabled",
      storeResponses,
      maxOutputTokens: CHATBOT_MAX_OUTPUT_TOKENS,
    };
  }

  if (!apiKey) {
    return {
      enabled,
      available: false,
      reason: "missing_api_key",
      model,
      storeResponses,
      vectorStoreId,
      maxOutputTokens: CHATBOT_MAX_OUTPUT_TOKENS,
    };
  }

  if (!model) {
    return {
      enabled,
      available: false,
      reason: "missing_model",
      apiKey,
      storeResponses,
      vectorStoreId,
      maxOutputTokens: CHATBOT_MAX_OUTPUT_TOKENS,
    };
  }

  return {
    enabled,
    available: true,
    apiKey,
    model,
    storeResponses,
    vectorStoreId,
    maxOutputTokens: CHATBOT_MAX_OUTPUT_TOKENS,
  };
}

export function buildOpenAIResponsesRequest(
  payload: ChatbotRequestPayload,
  config: ChatbotRuntimeConfig,
) {
  const locale = inferLocale(payload);
  const request: Record<string, unknown> = {
    model: config.model,
    instructions: buildChatbotInstructions(locale),
    input: buildResponsesInput(payload, config.storeResponses),
    stream: true,
    store: config.storeResponses,
    max_output_tokens: config.maxOutputTokens,
    metadata: {
      feature: "nous_website_chatbot",
      locale,
      page_path: normalizePathOnly(payload.pageContext?.url || ""),
    },
  };

  if (config.storeResponses && payload.previousResponseId) {
    request.previous_response_id = payload.previousResponseId;
  }

  if (config.vectorStoreId) {
    request.tools = [
      {
        type: "file_search",
        vector_store_ids: [config.vectorStoreId],
      },
    ];
  }

  return request;
}

export function buildResponsesInput(
  payload: ChatbotRequestPayload,
  storeResponses: boolean,
) {
  const locale = inferLocale(payload);
  const parts = [
    "Visitor message:",
    payload.message,
    "",
    "Current public page context:",
    formatPageContext(payload.pageContext),
    "",
    "Public site context:",
    getPublicSiteProfile(locale),
  ];

  if (!storeResponses && payload.messages?.length) {
    parts.push("", "Recent visible conversation:", formatRecentMessages(payload.messages));
  }

  return parts.join("\n");
}

export function formatPageContext(pageContext?: ChatbotPageContext) {
  if (!pageContext) return "No page context was provided.";

  const lines = [
    `Path: ${normalizePathOnly(pageContext.url || "") || "unknown"}`,
    `Title: ${pageContext.title || "unknown"}`,
    `Description: ${pageContext.description || "none"}`,
  ];

  if (pageContext.headings?.length) {
    lines.push(`Visible headings: ${pageContext.headings.join(" | ")}`);
  }

  if (pageContext.selectedText) {
    lines.push(`Selected visible text: ${pageContext.selectedText}`);
  }

  if (pageContext.visibleTextSnippet) {
    lines.push(`Visible text snippet: ${pageContext.visibleTextSnippet}`);
  }

  return lines.join("\n");
}

export function formatRecentMessages(messages: ChatbotMessage[]) {
  return messages
    .filter((message) => message.role === "user" || message.role === "assistant")
    .slice(-CHATBOT_MAX_HISTORY_MESSAGES)
    .map((message) => `${message.role}: ${message.content}`)
    .join("\n");
}

export function inferLocale(payload: Pick<ChatbotRequestPayload, "locale" | "pageContext">) {
  if (payload.locale) return normalizeChatbotLocale(payload.locale);
  const path = normalizePathOnly(payload.pageContext?.url || "");
  return path === "/es" || path.startsWith("/es/") ? "es" : "en";
}

export function normalizePathOnly(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return "";

  try {
    const parsed = new URL(trimmed, "https://nous.cr");
    return sanitizePath(parsed.pathname);
  } catch {
    return sanitizePath(trimmed.split("?")[0]?.split("#")[0] || "");
  }
}

function sanitizePath(path: string) {
  if (!path.startsWith("/")) return "";
  return path.replace(/[^\w\-./]/g, "").slice(0, 120) || "/";
}

function normalizeWhitespace(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function parseBoolean(value: string | undefined, fallback: boolean) {
  if (typeof value !== "string") return fallback;
  const normalized = value.trim().toLowerCase();
  if (["1", "true", "yes", "on"].includes(normalized)) return true;
  if (["0", "false", "no", "off"].includes(normalized)) return false;
  return fallback;
}
