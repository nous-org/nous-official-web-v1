export type ChatbotLocale = "en" | "es";

export type ChatbotRole = "user" | "assistant" | "system_status";

export type ChatbotMessageStatus =
  | "pending"
  | "streaming"
  | "complete"
  | "error";

export interface ChatbotMessage {
  id: string;
  role: ChatbotRole;
  content: string;
  createdAt: string;
  status: ChatbotMessageStatus;
}

export interface ChatbotPageContext {
  url?: string;
  title?: string;
  description?: string;
  headings?: string[];
  selectedText?: string;
  visibleTextSnippet?: string;
}

export interface ChatbotRequestPayload {
  message: string;
  previousResponseId?: string;
  messages?: ChatbotMessage[];
  pageContext?: ChatbotPageContext;
  locale?: ChatbotLocale;
}
