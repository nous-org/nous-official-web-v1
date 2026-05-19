# NOUS Website Chatbot

## What changed

- `src/pages/api/chatbot.ts` exposes a server-only `POST /api/chatbot` endpoint.
- `src/lib/chatbot/` owns request validation, site context, prompt rules, and Responses API request construction.
- `src/components/react/chatbot/` owns the floating React widget, streaming client, reducer, and page-context capture.
- `src/layouts/Layout.astro` mounts the widget globally when `OPENAI_CHATBOT_ENABLED=true`. The legacy in-repo admin routes now redirect to the external CMS at `https://admin.nous.cr`.

## Design decisions

- The widget uses the existing NOUS visual language: dark translucent surfaces, outline lavender borders, compact rounded controls, calm motion, and Geist typography.
- Assistant output is rendered as plain text with preserved whitespace. No raw HTML or unsafe markdown is injected.
- The client sends only bounded public page context: path, title, meta description, visible headings, selected visible text, and a short visible text snippet.
- The server adds a compact static public site profile. It excludes source internals, unpublished drafts, credentials, and private implementation details.
- The OpenAI SDK is instantiated only inside the server route.

## Conversation state

When `OPENAI_CHATBOT_STORE_RESPONSES=true`, the server sets `store: true` and passes `previous_response_id` on later turns. The instructions are sent on every request because Responses API instructions do not carry forward with `previous_response_id`.

When storage is disabled, the server sets `store: false` and the client sends only the last few visible messages from the current browser session.

The widget stores browser-session continuity in `sessionStorage` only. It clears the visible conversation and response id after 30 minutes of inactivity, when the tab/browser session ends, or when the visitor uses the reset control.

## Streaming protocol

The API route streams server-sent events:

- `delta`: assistant text delta
- `response_id`: final or current OpenAI response id
- `done`: completion or client abort
- `error`: user-safe error message

## Known limitations

- Rate limiting uses the existing in-memory limiter, which is fine for local/dev and small deployments but not enough for distributed production traffic.
- Retrieval is static by default. `OPENAI_VECTOR_STORE_ID` is supported for future curated file-search retrieval, but no vector store is provisioned by the repo.
- The assistant is intentionally conservative and will route users to `/contact` when public context does not support an answer.

## Production recommendations

- Store `OPENAI_API_KEY` as a Cloudflare secret.
- Use Redis, Upstash, Cloudflare KV/Durable Objects, or provider-native rate limiting for production scale.
- Add privacy-safe analytics events for open, send, complete, and error if the analytics policy allows it.
- Add a human handoff or CRM/contact-form bridge once the operating workflow is defined.
