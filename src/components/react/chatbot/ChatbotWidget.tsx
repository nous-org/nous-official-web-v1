"use client";

import { AnimatePresence, motion } from "motion/react";
import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import {
  FiCopy,
  FiMessageSquare,
  FiRefreshCw,
  FiX,
} from "react-icons/fi";
import { getChatbotQuickPrompts } from "../../../lib/chatbot/site-context.ts";
import type { ChatbotMessage } from "../../../lib/chatbot/types.ts";
import { parseAssistantContent } from "./messageFormatting";
import { useChatbot } from "./useChatbot";

interface ChatbotWidgetProps {
  locale?: "en" | "es";
  storeResponses?: boolean;
}

const copy = {
  en: {
    launcher: "Talk to Hermes",
    launcherAria: "Open Hermes, AI Support Agent for NOUS",
    title: "Hermes",
    subtitle: "AI Support Agent for NOUS.",
    reset: "Reset conversation",
    close: "Close assistant",
    placeholder: "Ask me a question!",
    send: "Send message",
    stop: "Stop response",
    sendShort: "Send",
    stopShort: "Stop",
    emptyTitle: "Hi! I'm Hermes.",
    emptyText:
      "I'm NOUS' AI Support Agent. Ask about NOUS, this page, or where AI could create leverage in your organization. I'm here to help.",
    suggestionsLabel: "Suggested questions",
    keyboardInstruction: "Press Enter to send. Use Shift+Enter for a new line.",
    disclaimer: "AI can make mistakes. For project details, use the contact form.",
    errorRetry: "Try again",
    copied: "Copied",
    copy: "Copy response",
  },
  es: {
    launcher: "Habla con Hermes",
    launcherAria: "Abrir Hermes, agente de soporte con IA de NOUS",
    title: "Hermes",
    subtitle: "Agente de soporte con IA para NOUS.",
    reset: "Reiniciar conversacion",
    close: "Cerrar asistente",
    placeholder: "Hazme una pregunta!",
    send: "Enviar mensaje",
    stop: "Detener respuesta",
    sendShort: "Enviar",
    stopShort: "Alto",
    emptyTitle: "Hola! Soy Hermes.",
    emptyText:
      "Soy el agente de soporte con IA de NOUS. Pregunta sobre NOUS, esta pagina o donde la IA podria crear ventaja en tu organizacion. Estoy aqui para ayudarte.",
    suggestionsLabel: "Preguntas sugeridas",
    keyboardInstruction: "Presiona Enter para enviar. Usa Shift+Enter para una nueva linea.",
    disclaimer: "La IA puede equivocarse. Para detalles de proyecto, usa el formulario.",
    errorRetry: "Intentar de nuevo",
    copied: "Copiado",
    copy: "Copiar respuesta",
  },
} as const;

export default function ChatbotWidget({
  locale = "en",
  storeResponses = false,
}: ChatbotWidgetProps) {
  const currentLocale = locale === "es" ? "es" : "en";
  const text = copy[currentLocale];
  const prompts = getChatbotQuickPrompts(currentLocale);
  const { state, dispatch, sendMessage, stop, reset, retry } = useChatbot({
    locale: currentLocale,
    storeResponses,
  });
  const panelRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);
  const launcherRef = useRef<HTMLButtonElement | null>(null);
  const [isUserScrolledUp, setIsUserScrolledUp] = useState(false);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!state.isOpen) return;

      if (event.key === "Escape") {
        dispatch({ type: "close" });
        launcherRef.current?.focus();
      }

      if (event.key === "Tab") {
        trapFocus(event, panelRef.current);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [dispatch, state.isOpen]);

  useEffect(() => {
    if (!state.isOpen) return;
    const id = window.setTimeout(() => inputRef.current?.focus(), 120);
    return () => window.clearTimeout(id);
  }, [state.isOpen]);

  useEffect(() => {
    if (isUserScrolledUp) return;
    listRef.current?.scrollTo({
      top: listRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [isUserScrolledUp, state.messages]);

  const openPanel = () => dispatch({ type: "open" });
  const closePanel = () => {
    dispatch({ type: "close" });
    launcherRef.current?.focus();
  };

  return (
    <div className="fixed bottom-[calc(1rem+env(safe-area-inset-bottom))] right-4 z-[70] sm:right-6">
      <AnimatePresence>
        {state.isOpen && (
          <motion.div
            ref={panelRef}
            id="nous-chatbot-panel"
            role="dialog"
            aria-modal="true"
            aria-labelledby="nous-chatbot-title"
            initial={{ opacity: 0, y: 18, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="fixed inset-x-3 bottom-[calc(0.75rem+env(safe-area-inset-bottom))] top-auto flex h-[min(86dvh,44rem)] flex-col overflow-hidden rounded-[1.5rem] border border-outline/20 bg-[#060114]/92 text-neutral-100 shadow-[0_28px_90px_-34px_rgba(220,212,255,0.72)] backdrop-blur-2xl sm:inset-x-auto sm:bottom-[calc(5.5rem+env(safe-area-inset-bottom))] sm:right-6 sm:h-[min(74dvh,42rem)] sm:w-[min(27rem,calc(100vw-2rem))]"
          >
            <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-outline/60 to-transparent" />
            <header className="flex items-center justify-between gap-4 border-b border-white/10 px-4 py-3.5">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="grid h-8 w-8 place-items-center rounded-full border border-outline/25 bg-outline/10 text-outline">
                    <HermesBubbleIcon variant="header" />
                  </span>
                  <div className="min-w-0">
                    <h2 id="nous-chatbot-title" className="text-sm font-medium text-white">
                      {text.title}
                    </h2>
                    <p className="truncate text-xs text-neutral-400">{text.subtitle}</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <IconButton label={text.reset} onClick={reset}>
                  <FiRefreshCw aria-hidden="true" />
                </IconButton>
                <IconButton label={text.close} onClick={closePanel}>
                  <FiX aria-hidden="true" />
                </IconButton>
              </div>
            </header>

            <div
              ref={listRef}
              className="no-visible-scrollbar flex-1 overflow-y-auto px-4 py-4"
              role="log"
              aria-live="polite"
              onScroll={(event) => {
                const target = event.currentTarget;
                const distanceFromBottom =
                  target.scrollHeight - target.scrollTop - target.clientHeight;
                setIsUserScrolledUp(distanceFromBottom > 120);
              }}
            >
              {state.messages.length === 0 ? (
                <EmptyState
                  title={text.emptyTitle}
                  text={text.emptyText}
                  suggestionsLabel={text.suggestionsLabel}
                  prompts={prompts}
                  onPrompt={(prompt) => void sendMessage(prompt)}
                />
              ) : (
                <div className="space-y-3">
                  {state.messages.map((message) => (
                    <ChatMessage
                      key={message.id}
                      message={message}
                      copyLabel={text.copy}
                      copiedLabel={text.copied}
                    />
                  ))}
                </div>
              )}
            </div>

            {state.error && (
              <div className="mx-4 mb-3 rounded-2xl border border-red-300/20 bg-red-400/10 px-3 py-2 text-sm text-red-100">
                <div className="flex items-center justify-between gap-3">
                  <p>{state.error}</p>
                  <button
                    type="button"
                    onClick={retry}
                    className="shrink-0 rounded-full border border-red-200/25 px-3 py-1 text-xs font-medium transition-colors hover:bg-red-200/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-200/50"
                  >
                    {text.errorRetry}
                  </button>
                </div>
              </div>
            )}

            <form
              className="border-t border-white/10 p-3"
              onSubmit={(event) => {
                event.preventDefault();
                void sendMessage();
              }}
            >
              <div className="flex items-center gap-2 rounded-[1.15rem] border border-outline/20 bg-white/[0.035] p-2 shadow-inner shadow-black/10 focus-within:border-outline/45">
                <textarea
                  ref={inputRef}
                  value={state.input}
                  maxLength={1200}
                  rows={1}
                  placeholder={text.placeholder}
                  onChange={(event) =>
                    dispatch({ type: "set_input", input: event.target.value })
                  }
                  onKeyDown={(event) => {
                    if (event.key === "Enter" && !event.shiftKey) {
                      event.preventDefault();
                      void sendMessage();
                    }
                  }}
                  className="max-h-28 min-h-10 flex-1 resize-none bg-transparent px-2 py-2.5 text-sm leading-relaxed text-white placeholder:text-neutral-500 focus:outline-none"
                  aria-label={text.placeholder}
                  disabled={state.isStreaming}
                />
                <button
                  type={state.isStreaming ? "button" : "submit"}
                  onClick={state.isStreaming ? stop : undefined}
                  disabled={!state.isStreaming && !state.input.trim()}
                  className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-[0.85rem] border border-transparent bg-outline px-3.5 text-sm font-medium leading-none text-primary-black shadow-sm shadow-outline/10 transition-all hover:bg-hover hover:shadow-outline/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-outline/60 disabled:cursor-not-allowed disabled:border-white/10 disabled:bg-white/10 disabled:text-neutral-500 disabled:shadow-none"
                  aria-label={state.isStreaming ? text.stop : text.send}
                >
                  {state.isStreaming ? (
                    <>
                      <StopGlyph />
                      <span>{text.stopShort}</span>
                    </>
                  ) : (
                    <>
                      <span>{text.sendShort}</span>
                      <SendGlyph />
                    </>
                  )}
                </button>
              </div>
              <div className="mt-2 space-y-0.5 px-2 text-[0.68rem] leading-relaxed text-neutral-500">
                <p>{text.keyboardInstruction}</p>
                <p>{text.disclaimer}</p>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        ref={launcherRef}
        type="button"
        aria-label={text.launcherAria}
        aria-expanded={state.isOpen}
        aria-controls="nous-chatbot-panel"
        onClick={state.isOpen ? closePanel : openPanel}
        whileTap={{ scale: 0.96 }}
        className="group flex min-h-12 items-center gap-2 rounded-full border border-outline/25 bg-[#090316]/88 px-4 py-3 text-sm font-medium text-outline shadow-[0_20px_70px_-30px_rgba(220,212,255,0.85)] backdrop-blur-xl transition-all hover:border-outline/55 hover:bg-outline/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-outline/60"
      >
        <span className="grid h-8 w-8 place-items-center rounded-full bg-outline text-primary-black transition-transform group-hover:scale-105">
          {state.isOpen ? <FiX aria-hidden="true" /> : <HermesBubbleIcon variant="launcher" />}
        </span>
        <span>{text.launcher}</span>
      </motion.button>
    </div>
  );
}

function EmptyState({
  title,
  text,
  suggestionsLabel,
  prompts,
  onPrompt,
}: {
  title: string;
  text: string;
  suggestionsLabel: string;
  prompts: readonly string[];
  onPrompt: (prompt: string) => void;
}) {
  return (
    <div className="flex min-h-full flex-col justify-end py-2">
      <div className="rounded-[1.35rem] border border-outline/15 bg-white/[0.025] p-4">
        <p className="text-base font-medium text-white">{title}</p>
        <p className="mt-2 text-sm leading-relaxed text-neutral-400">{text}</p>
        <p className="mt-4 text-[0.68rem] font-medium uppercase tracking-[0.18em] text-outline/70">
          {suggestionsLabel}
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {prompts.map((prompt) => (
            <button
              key={prompt}
              type="button"
              onClick={() => onPrompt(prompt)}
              className="rounded-full border border-outline/20 bg-outline/[0.055] px-3 py-2 text-left text-xs font-medium text-outline transition-colors hover:border-outline/45 hover:bg-outline/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-outline/50"
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function ChatMessage({
  message,
  copyLabel,
  copiedLabel,
}: {
  message: ChatbotMessage;
  copyLabel: string;
  copiedLabel: string;
}) {
  const [copied, setCopied] = useState(false);
  const isUser = message.role === "user";
  const isStreaming = message.status === "streaming" && !message.content;

  return (
    <article className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={[
          "group relative max-w-[86%] rounded-[1.15rem] px-3.5 py-3 text-sm leading-relaxed",
          isUser
            ? "bg-outline text-primary-black"
            : "border border-white/10 bg-white/[0.045] text-neutral-100",
          message.status === "error" ? "border-red-300/25 bg-red-400/10 text-red-100" : "",
        ].join(" ")}
      >
        {isStreaming ? (
          <TypingIndicator />
        ) : (
          <p className="whitespace-pre-wrap break-words">
            {isUser ? message.content : renderAssistantContent(message.content)}
          </p>
        )}
        {!isUser && message.content && message.status !== "streaming" && (
          <button
            type="button"
            aria-label={copyLabel}
            onClick={async () => {
              try {
                await navigator.clipboard?.writeText(message.content);
                setCopied(true);
                window.setTimeout(() => setCopied(false), 1200);
              } catch {
                setCopied(false);
              }
            }}
            className="absolute -right-2 -top-2 grid h-7 w-7 place-items-center rounded-full border border-outline/20 bg-[#090316] text-xs text-outline opacity-0 shadow-lg transition-opacity hover:bg-outline/10 focus:opacity-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-outline/50 group-hover:opacity-100"
          >
            <FiCopy aria-hidden="true" />
            <span className="sr-only">{copied ? copiedLabel : copyLabel}</span>
          </button>
        )}
      </div>
    </article>
  );
}

function TypingIndicator() {
  return (
    <span className="flex items-center gap-1.5 py-1" aria-label="Assistant is writing">
      {[0, 1, 2].map((item) => (
        <span
          key={item}
          className="h-1.5 w-1.5 animate-pulse rounded-full bg-outline/70"
          style={{ animationDelay: `${item * 120}ms` }}
        />
      ))}
    </span>
  );
}

function renderAssistantContent(content: string) {
  return parseAssistantContent(content).map((token, index) => {
    if (token.type === "text") return token.text;

    if (token.type === "strong") {
      return (
        <strong key={`strong-${index}`} className="font-medium text-white">
          {token.text}
        </strong>
      );
    }

    return (
      <a
        key={`link-${index}`}
        href={token.href}
        className="font-medium text-outline underline decoration-outline/45 underline-offset-4 transition-colors hover:text-hover hover:decoration-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-outline/50"
      >
        {token.text}
      </a>
    );
  });
}

function IconButton({
  label,
  onClick,
  children,
  showLabel = false,
}: {
  label: string;
  onClick: () => void;
  children: ReactNode;
  showLabel?: boolean;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className={[
        "inline-flex h-9 items-center justify-center rounded-full border border-white/10 bg-white/[0.035] text-neutral-300 transition-colors hover:border-outline/40 hover:bg-outline/10 hover:text-outline focus:outline-none focus-visible:ring-2 focus-visible:ring-outline/50",
        showLabel ? "gap-2 px-3 text-xs font-medium" : "w-9",
      ].join(" ")}
    >
      {children}
      {showLabel && <span>{label.replace(" conversation", "")}</span>}
    </button>
  );
}

function HermesBubbleIcon({ variant = "launcher" }: { variant?: "launcher" | "header" }) {
  return (
    <FiMessageSquare
      aria-hidden="true"
      className={variant === "header" ? "block h-4 w-4" : "block h-[1.12rem] w-[1.12rem]"}
      strokeWidth={2.2}
    />
  );
}

function SendGlyph() {
  return (
    <svg
      aria-hidden="true"
      className="h-4 w-4"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M3 8H12M8.75 4.75L12 8L8.75 11.25"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function StopGlyph() {
  return (
    <span
      aria-hidden="true"
      className="h-2.5 w-2.5 rounded-[0.18rem] bg-current"
    />
  );
}

function trapFocus(event: KeyboardEvent, panel: HTMLDivElement | null) {
  if (!panel) return;

  const focusable = Array.from(
    panel.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])',
    ),
  ).filter((element) => !element.hasAttribute("disabled"));

  if (!focusable.length) return;

  const first = focusable[0];
  const last = focusable[focusable.length - 1];

  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
}
