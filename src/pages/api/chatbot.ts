import type { APIRoute } from "astro";
import OpenAI from "openai";
import { checkRateLimit, getClientIp } from "@/lib/security";
import { getChatbotRuntimeEnv } from "@/lib/chatbot/env";
import {
  buildOpenAIResponsesRequest,
  resolveChatbotConfig,
  validateChatbotPayload,
} from "@/lib/chatbot/server";

export const prerender = false;

const encoder = new TextEncoder();

type StreamEvent = {
  type?: string;
  delta?: string;
  response?: {
    id?: string;
    error?: {
      code?: string;
      message?: string;
    } | null;
  };
  error?: {
    code?: string;
    message?: string;
  } | string | null;
};

export const POST: APIRoute = async ({ request }) => {
  const startedAt = Date.now();
  const requestId = crypto.randomUUID();
  const clientIp = getClientIp(request);

  console.info("Chatbot request started", { requestId });

  try {
    const ipLimit = checkRateLimit(`chatbot:ip:${clientIp}`, 10);
    if (ipLimit.limited) {
      logCompletion(requestId, startedAt, "rate_limited");
      return jsonError("Too many chatbot messages. Please try again shortly.", 429, {
        "Retry-After": String(ipLimit.retryAfter),
      });
    }

    const config = resolveChatbotConfig(getChatbotRuntimeEnv());
    if (!config.available) {
      logCompletion(requestId, startedAt, config.reason || "unavailable");
      return jsonError(
        "The NOUS assistant is not available right now. Please use the contact form instead.",
        503,
      );
    }

    const rawPayload = await request.json().catch(() => null);
    const payload = validateChatbotPayload(rawPayload);
    if (!payload.success) {
      logCompletion(requestId, startedAt, "validation_error");
      return new Response(
        JSON.stringify({
          success: false,
          message: payload.message,
          errors: payload.issues.map((issue) => ({
            path: issue.path.join("."),
            message: issue.message,
          })),
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    const client = new OpenAI({ apiKey: config.apiKey });
    const responsesRequest = buildOpenAIResponsesRequest(payload.data, config);
    const openAIStream = await client.responses.create(responsesRequest as any, {
      signal: request.signal,
    }) as unknown as AsyncIterable<StreamEvent>;

    let completed = false;

    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const event of openAIStream) {
            if (request.signal.aborted) break;

            if (event.type === "response.created" && event.response?.id) {
              controller.enqueue(sse("response_id", { id: event.response.id }));
              continue;
            }

            if (event.type === "response.output_text.delta" && event.delta) {
              controller.enqueue(sse("delta", { text: event.delta }));
              continue;
            }

            if (event.type === "response.completed") {
              completed = true;
              if (event.response?.id) {
                controller.enqueue(sse("response_id", { id: event.response.id }));
              }
              controller.enqueue(sse("done", {}));
              logCompletion(requestId, startedAt, "completed");
              break;
            }

            if (
              event.type === "response.failed"
              || event.type === "response.incomplete"
              || event.type === "error"
            ) {
              const message = getStreamErrorMessage(event);
              controller.enqueue(sse("error", { message }));
              logCompletion(requestId, startedAt, "openai_stream_error");
              break;
            }
          }

          if (!completed && request.signal.aborted) {
            controller.enqueue(sse("done", { aborted: true }));
            logCompletion(requestId, startedAt, "aborted");
          }
        } catch (error) {
          if (request.signal.aborted) {
            controller.enqueue(sse("done", { aborted: true }));
            logCompletion(requestId, startedAt, "aborted");
          } else {
            controller.enqueue(sse("error", { message: getUserSafeErrorMessage(error) }));
            logCompletion(requestId, startedAt, "stream_exception");
          }
        } finally {
          controller.close();
        }
      },
      cancel() {
        logCompletion(requestId, startedAt, "client_cancelled");
      },
    });

    return new Response(stream, {
      status: 200,
      headers: {
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
        "X-Accel-Buffering": "no",
      },
    });
  } catch (error) {
    console.error("Chatbot request error", {
      requestId,
      category: getErrorCategory(error),
      latencyMs: Date.now() - startedAt,
    });

    return jsonError(getUserSafeErrorMessage(error), 500);
  }
};

function sse(event: string, data: unknown) {
  return encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
}

function jsonError(message: string, status: number, extraHeaders: Record<string, string> = {}) {
  return new Response(
    JSON.stringify({
      success: false,
      message,
    }),
    {
      status,
      headers: {
        "Content-Type": "application/json",
        ...extraHeaders,
      },
    },
  );
}

function getStreamErrorMessage(event: StreamEvent) {
  if (typeof event.error === "object" && event.error?.message) {
    return "The assistant could not complete that answer. Please try again.";
  }

  if (event.response?.error?.message) {
    return "The assistant could not complete that answer. Please try again.";
  }

  return "The assistant could not complete that answer. Please try again.";
}

function getUserSafeErrorMessage(error: unknown) {
  const maybeStatus = typeof error === "object" && error !== null && "status" in error
    ? Number((error as { status?: number }).status)
    : undefined;

  if (maybeStatus === 401 || maybeStatus === 403) {
    return "The NOUS assistant is not configured correctly yet.";
  }

  if (maybeStatus === 429) {
    return "The assistant is receiving too many requests. Please try again shortly.";
  }

  return "The NOUS assistant is temporarily unavailable. Please use the contact form instead.";
}

function getErrorCategory(error: unknown) {
  if (typeof error === "object" && error !== null && "status" in error) {
    return `openai_status_${String((error as { status?: number }).status || "unknown")}`;
  }

  return error instanceof Error ? error.name : "unknown_error";
}

function logCompletion(requestId: string, startedAt: number, category: string) {
  console.info("Chatbot request completed", {
    requestId,
    category,
    latencyMs: Date.now() - startedAt,
  });
}
