import { getRuntimeEnv, type RuntimeEnv } from "@/lib/runtime-env";

const OPENAI_ENV_KEYS = [
  "OPENAI_API_KEY",
  "OPENAI_MODEL",
  "OPENAI_CHATBOT_ENABLED",
  "OPENAI_CHATBOT_STORE_RESPONSES",
  "OPENAI_VECTOR_STORE_ID",
] as const;

export function getChatbotRuntimeEnv(): RuntimeEnv {
  const runtimeEnv = getRuntimeEnv();
  if (!import.meta.env.DEV) return runtimeEnv;

  const merged: RuntimeEnv = { ...runtimeEnv };
  const localEnv = import.meta.env as Record<string, string | undefined>;

  for (const key of OPENAI_ENV_KEYS) {
    if (localEnv[key] !== undefined) {
      merged[key] = localEnv[key];
    }
  }

  return merged;
}
