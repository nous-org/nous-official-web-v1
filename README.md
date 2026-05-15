# NOUS Official Website

[![Deploy to Cloudflare](https://github.com/nous-org/nous-official-web-v1/actions/workflows/deploy.yml/badge.svg?branch=main)](https://github.com/nous-org/nous-official-web-v1/actions/workflows/deploy.yml)
[![Production](https://img.shields.io/badge/production-nous.cr-DCD4FF)](https://nous.cr)
[![Astro](https://img.shields.io/badge/Astro-6.x-FF5D01)](https://astro.build)
[![Cloudflare Workers](https://img.shields.io/badge/Cloudflare-Workers-F38020)](https://workers.cloudflare.com)

This repository powers [nous.cr](https://nous.cr), the official website for NOUS: an AI transformation agency helping organizations in Costa Rica and LatAm design, deploy, and adopt useful intelligence in real work.

The site is built as a fast, bilingual, SEO-conscious Astro application with selective React islands, Cloudflare Workers deployment, admin-protected publishing tools, and production-grade guardrails for redirects, metadata, structured data, and form handling.

## Repository Status

| Area | Current Standard |
|---|---|
| Production URL | `https://nous.cr` |
| Default branch | `main` |
| Runtime | Cloudflare Workers via `@astrojs/cloudflare` |
| Package manager | `pnpm` |
| Node target | `>=22.12.0` |
| Validation gate | `pnpm validate` |
| Deployment | GitHub Actions deploys `main` with Wrangler |
| Primary markets | Costa Rica, LatAm |
| Languages | English on canonical routes, Spanish under `/es` |

## What This Repo Owns

- Public marketing website for NOUS.
- English and Spanish page routes.
- SEO metadata, canonical URLs, sitemap generation, `robots.txt`, and structured data.
- Cloudflare Worker configuration and route handling.
- Legacy URL redirects for retired pages and old slugs.
- Contact and newsletter API endpoints, including contact form validation and Resend e-mail templates.
- Clerk-protected admin surface for content workflows.
- Static QA checks that protect SEO, security, and repo hygiene decisions.

## Product Surface

| Surface | Route |
|---|---|
| Homepage | `/`, `/es` |
| Services | `/services`, `/es/services` |
| About | `/about`, `/es/about` |
| Contact | `/contact`, `/es/contact` |
| Blog | `/blog`, `/es/blog` |
| Legal | `/privacy-policy`, `/terms-and-conditions` plus Spanish equivalents |
| Admin | `/admin`, `/es/admin` |

Retired URLs such as `/pricing`, `/products`, `/about-us`, and `/contact-us` are intentionally handled as permanent redirects. Do not reintroduce source pages for those paths unless the URL strategy changes.

## Architecture

```text
Browser / crawler
  -> Cloudflare route: nous.cr/*
  -> Astro middleware
       - apex host enforcement
       - HTTPS enforcement
       - legacy redirects
       - trailing-slash canonicalization
       - baseline security headers
  -> Astro server-rendered routes
  -> React islands where interaction is needed
  -> Turso, Clerk, Resend, and KV bindings where required
```

Core implementation notes:

- `src/layouts/Layout.astro` is the shared metadata, schema, navigation, and page shell.
- `src/lib/i18n.ts` owns locale normalization, route localization, and shared copy.
- `src/middleware.ts` owns canonical host, redirect, slash, and response-header behavior.
- `astro.config.mjs` owns sitemap filtering, Cloudflare adapter configuration, and chunk boundaries.
- `wrangler.toml` owns Worker routes, non-secret vars, and Cloudflare bindings.
- `tests/static-qa.test.mjs` protects security, SEO, redirect, sitemap, and repo-hygiene rules.

For deeper implementation context, read [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

## Tech Stack

| Layer | Tooling |
|---|---|
| Framework | Astro 6 |
| UI islands | React 19 |
| Styling | Tailwind CSS 4 |
| Hosting/runtime | Cloudflare Workers |
| Sessions | Cloudflare KV |
| Auth | Clerk |
| Database | Turso/libSQL |
| E-mail | Resend |
| Content rendering | Astro content collections, Markdown, TipTap editor tooling |
| Validation | Astro check, Node test runner, `pnpm audit`, Cloudflare dry runs |

## Local Development

Install dependencies:

```bash
pnpm install
```

Start the dev server:

```bash
pnpm dev
```

The default local URL is `http://localhost:4321`.

Run a production-style preview after building:

```bash
pnpm build
pnpm preview
```

## Environment

Copy `.env.example` for local placeholders. Production secrets must be configured in Cloudflare or the relevant provider dashboard, never committed to the repository.

Required runtime integrations:

| Variable | Purpose | Secret? |
|---|---|---|
| `SITE_URL` | Canonical site URL | No |
| `CONTACT_RECIPIENT_EMAIL` | Contact form recipient | No |
| `SUPPORT_EMAIL` | Support identity in templates | No |
| `RESEND_API_KEY` | E-mail delivery | Yes |
| `TURSO_DATABASE_URL` | Blog/admin database | Yes |
| `TURSO_AUTH_TOKEN` | Blog/admin database token | Yes |
| `TURSO_NEWSLETTER_URL` | Newsletter database | Yes |
| `TURSO_NEWSLETTER_TOKEN` | Newsletter database token | Yes |
| `CLERK_PUBLISHABLE_KEY` | Clerk frontend configuration | Environment-specific |
| `CLERK_SECRET_KEY` | Clerk backend verification | Yes |
| `CLERK_ADMIN_USER_IDS` or equivalent policy | Admin authorization allowlist | Yes |
| `OPENAI_API_KEY` | Server-side OpenAI Responses API access for the website assistant | Yes |
| `OPENAI_MODEL` | Model used by the website assistant | No |
| `OPENAI_CHATBOT_ENABLED` | Enables the public chatbot widget and API route when set to `true` | No |
| `OPENAI_CHATBOT_STORE_RESPONSES` | Uses stored Responses state and `previous_response_id` when set to `true` | No |
| `OPENAI_VECTOR_STORE_ID` | Optional OpenAI vector store for file-search-backed retrieval | No |

Admin APIs fail closed when Clerk or admin authorization config is missing.

## Contact And E-mail Flow

The public contact forms post to `POST /api/contact`, which validates required fields, applies abuse controls, and sends two Resend e-mails:

- an internal notification to the NOUS team
- a confirmation e-mail to the person who submitted the form

The repo owns the HTML e-mail templates, sender display names, subject lines, inline validation copy, and delivery behavior. Local development returns a dry-run success when `RESEND_API_KEY` is missing; production requires the Cloudflare secret and falls back to a service-unavailable message if delivery cannot be configured.

See [docs/CONTACT_AND_EMAIL.md](docs/CONTACT_AND_EMAIL.md) for template standards, smoke tests, and runtime notes.

## Website AI Assistant

The site includes a native NOUS chatbot widget powered by the OpenAI Responses API.

Configuration:

```bash
OPENAI_API_KEY="sk-..."
OPENAI_MODEL="your-model-id"
OPENAI_CHATBOT_ENABLED=true
OPENAI_CHATBOT_STORE_RESPONSES=true
```

The browser never calls OpenAI directly. The React widget posts to `POST /api/chatbot`, which validates the payload, applies the existing in-memory rate limiter, adds bounded public page/site context, and streams assistant text back as SSE events.

Conversation state:

- With `OPENAI_CHATBOT_STORE_RESPONSES=true`, the client keeps only the latest `previousResponseId` in `sessionStorage` and sends it on the next turn.
- With storage disabled, the client sends a short bounded visible history instead.
- The browser session clears automatically after 30 minutes of inactivity, when the tab/browser session ends, or when the visitor uses the reset control.
- Raw prompts and assistant responses are not logged by default.

Customization:

- Prompt rules live in `src/lib/chatbot/prompt.ts`.
- Public site context and quick prompts live in `src/lib/chatbot/site-context.ts`.
- The widget UI lives in `src/components/react/chatbot/ChatbotWidget.tsx`.

Local test flow:

```bash
pnpm dev
```

Set the OpenAI variables in your local environment, open `http://localhost:4321`, and use the floating assistant button. For review without a live key, leave `OPENAI_CHATBOT_ENABLED=false` or unset.

Production notes:

- Configure `OPENAI_API_KEY` as a Cloudflare secret, not in `wrangler.toml`.
- Replace the in-memory limiter with Redis, Upstash, Cloudflare KV/Durable Objects, or provider-native rate limiting before high-traffic launch.
- Consider `OPENAI_VECTOR_STORE_ID` when a curated public content corpus exists.

## Validation

Run the full local gate before opening a PR:

```bash
pnpm validate
```

Individual checks:

```bash
pnpm check
pnpm test
pnpm build
pnpm audit:prod
```

Cloudflare deployment validation:

```bash
pnpm build
pnpm exec wrangler deploy -c dist/server/wrangler.json --dry-run --keep-vars
```

## Deployment

Deployments are handled by GitHub Actions.

1. Merge into `main`.
2. `.github/workflows/deploy.yml` installs dependencies, builds Astro, and deploys the generated Cloudflare Worker with Wrangler.
3. Cloudflare serves both `nous.cr/*` and `www.nous.cr/*`.
4. `www` and HTTP variants are redirected to the canonical HTTPS apex URL.

Manual deploys should use the same generated config and preserve dashboard variables:

```bash
pnpm build
pnpm exec wrangler deploy -c dist/server/wrangler.json --keep-vars
```

See [docs/OPERATIONS.md](docs/OPERATIONS.md) for smoke tests, rollback notes, and deployment troubleshooting.

## SEO And Content Standards

- English canonical routes live at root paths.
- Spanish routes live under `/es`.
- Canonicals must be absolute `https://nous.cr` URLs.
- Sitemap output is generated by Astro; do not add a manual `public/sitemap.xml`.
- Low-value or private routes such as `/admin`, `/portfolio`, and `404` are excluded or noindexed as appropriate.
- Retired pages are handled through permanent redirects, not duplicate content.
- Page metadata should be written for AI transformation, automation, intelligent systems, Costa Rica, and LatAm search intent.

See [docs/SEO_AND_CONTENT.md](docs/SEO_AND_CONTENT.md) for route-level rules and content governance.

## Repository Structure

```text
.github/
  workflows/              GitHub Actions deployment workflow
docs/                     Architecture, operations, contact/e-mail, chatbot, and SEO guidance
public/                   Static assets served directly
src/
  assets/                 Build-processed images and brand assets
  components/             Astro, React, UI, icon, and SEO components
  content/                Legal and content collections
  layouts/                Shared page shell
  lib/                    Auth, database, i18n, metadata, runtime helpers
  pages/                  Astro routes and API endpoints
  styles/                 Global CSS
  types/                  Shared content and UI types
tests/                    Static QA regression tests
wrangler.toml             Cloudflare Worker routes and bindings
astro.config.mjs          Astro, sitemap, adapter, and build config
```

## Contribution Standard

- Work from a short-lived branch.
- Keep production routes, redirects, and SEO directives intentional.
- Do not commit generated folders such as `dist/`, `.astro/`, `.wrangler/`, reports, screenshots, or local audit files.
- Do not commit secrets, live credentials, or provider tokens.
- Run `pnpm validate` before requesting review.
- Include route-level smoke notes for changes that touch navigation, redirects, forms, admin, metadata, or deployment.

See [CONTRIBUTING.md](CONTRIBUTING.md) for the full workflow.

## Security

Security posture is documented in [SECURITY.md](SECURITY.md). The short version:

- Treat this as a production system.
- Keep secrets in Cloudflare/GitHub/provider secret stores.
- Admin access must remain deny-by-default.
- Public form endpoints need validation and abuse protection.
- Dependency and static QA checks are part of the release gate.

## Maintainers

This repository is maintained by the NOUS team. Production questions, release coordination, and access requests should go through the internal NOUS engineering/operations channel.
