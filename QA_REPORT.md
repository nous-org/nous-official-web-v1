# Full Website QA Report

Date: 2026-05-11
Repository: `/Users/rpu/Documents/work/nous/website/nous-website-rpu-v0`
Scope: full pre-launch QA audit of the local working tree.
Mode: report only. No product code was fixed.

## Executive Summary

- Overall production readiness: Not ready for production launch.
- Overall score: 6.3 / 10.
- Biggest risks:
  - Live-looking secrets are committed in `wrangler.toml`.
  - Dependency audit reports 86 vulnerabilities, including critical Clerk middleware bypass and high-risk Astro/Cloudflare advisories.
  - Admin API authorization appears to verify Clerk identity but not explicit admin permission.
  - Contact and newsletter endpoints are exposed without rate limiting or abuse protection.
  - Sitemap/robots output is inconsistent and currently exposes stale, redirected, blocked, and admin routes.
  - Several accessibility issues affect keyboard and screen-reader users, especially the mobile menu and form labeling.
- Highest-leverage fixes:
  - Rotate and remove all committed secrets.
  - Upgrade vulnerable dependencies and re-run `pnpm audit --prod`.
  - Reintroduce deny-by-default admin authorization.
  - Fix sitemap generation and remove stale `public/sitemap.xml`.
  - Add lint, typecheck, and basic route/accessibility tests.
  - Fix accessible names, labels, mobile menu state, and duplicate H1s.
- Recommended launch decision: Do not launch until the critical and high-priority security, SEO, accessibility, and production-readiness issues below are resolved.

## Scores

| Category | Score / 10 | Notes |
|---|---:|---|
| Code Quality | 6.2 | Good component coverage, but too many stale patterns, duplicated scripts, unsafe HTML paths, and missing test/lint gates. |
| Architecture | 6.4 | Astro structure is understandable, but routes/content/API/admin concerns are mixed and several legacy pages remain indexed. |
| Functionality | 7.0 | Core routes render and most navigation works; external submit flows were not fully tested to avoid sending real e-mails. |
| UX | 7.3 | Current site direction is strong, but contact/form clarity, mobile nav behavior, and sitemap/user flow polish still need work. |
| UI Design | 7.6 | Brand system is much improved; remaining issues are consistency, responsive rhythm, stale components, and legal/admin polish. |
| Responsiveness | 6.8 | Main layouts generally stack, but mobile menu accessibility, service tab overflow, scroll animations, and some card rhythms need fixes. |
| Accessibility | 5.7 | Missing labels, duplicate H1s, closed mobile nav in the accessibility tree, weak button names, and incomplete reduced-motion support. |
| SEO | 5.6 | Page-level content is better, but metadata/schema/sitemap/robots are materially inconsistent with the current brand and routes. |
| Performance | 6.2 | Production build passes, but admin chunk is large, animation canvases are always active, images/fonts need cleanup, and audit advisories remain. |
| Security/Privacy | 3.0 | Committed secrets, vulnerable dependencies, weak admin authorization, no rate limiting, and form HTML injection risk block launch. |
| Copywriting | 7.8 | Core AI transformation positioning is strong; stale brand phrases and a few hype/legacy lines remain. |
| Conversion Quality | 7.4 | Clearer than before, but trust signals, contact flow specificity, and CTA consistency can improve. |
| Production Readiness | 4.0 | Build succeeds, but security, dependency, sitemap, repo hygiene, and QA automation gaps make launch risky. |

## Command Results

| Command | Result | Notes |
|---|---|---|
| `pwd` | Pass | Confirmed repo at `/Users/rpu/Documents/work/nous/website/nous-website-rpu-v0`. |
| `ls -la` | Pass | Astro app with `src`, `public`, `functions`, `dist`, `wrangler.toml`, `package.json`, `pnpm-lock.yaml`. |
| `git status --short` | Warning | Very dirty working tree with many modified and untracked product files. This is expected from recent iteration but not launch-safe. |
| `pnpm build` | Pass with warnings | Build succeeded. Warnings: missing `src/content/blog/` and large `AdminEntrypoint` chunk over 500 kB. |
| `pnpm lint` | Fail | No lint script exists. |
| `pnpm typecheck` | Fail | No typecheck script exists. |
| `pnpm test` | Fail | No test script exists. |
| `pnpm exec astro check` | Not completed | Prompted to install `@astrojs/check` and `typescript`; not installed because this was a no-fix/no-dependency-change audit. |
| `pnpm audit --prod` | Fail | 86 vulnerabilities: 1 critical, 33 high, 41 moderate, 11 low. |
| Route fetch sweep | Warning | Core routes return 200; `/about-us` and `/contact-us` 301; `/pricing`, `/products`, `/404`, and unknown routes return 404. |
| Browser home QA | Warning | Home renders, title is `Home / NOUS`, no console errors, but motion warning and accessibility issues were detected. |
| Browser responsive QA | Warning | Tested 320, 375, 390, 430, 768, 1024, 1280, 1440, and 1920 widths across major routes. Mobile nav and service tabs have issues. |
| Contact form empty-submit QA | Pass with warnings | Native required-field validation blocks submit; no custom accessible error summary. |
| Newsletter empty-submit QA | Pass with warnings | Native required-field validation blocks submit; input has no label. |

## Critical Findings

### [Critical] Live-looking secrets are committed in `wrangler.toml`

- Location: `wrangler.toml:9-18`
- Category: Security / production readiness
- Evidence: `RESEND_API_KEY`, Turso URLs/tokens, `GITHUB_CLIENT_SECRET`, `CLERK_SECRET_KEY`, `JWT_SECRET`, and related values are present under `[vars]`.
- Why it matters: Anyone with repository access can use or leak these credentials. If the repo has ever been pushed, these secrets must be treated as compromised. This can expose e-mail sending, database access, authentication signing, and private integrations.
- Steps to reproduce: Open `wrangler.toml` and inspect the `[vars]` section.
- Recommended fix: Rotate every exposed credential, remove secrets from the repository, purge them from history if needed, and store them in Cloudflare secrets or deployment environment variables.
- Suggested implementation: Replace sensitive values with non-secret names in `.env.example`, use `wrangler secret put`, and keep only non-sensitive public config in `wrangler.toml`.
- Estimated effort: 2-4 hours plus provider-side rotation time.

### [Critical] Production dependencies contain critical and high-risk advisories

- Location: `package.json`, `pnpm-lock.yaml`
- Category: Security / dependency management
- Evidence: `pnpm audit --prod` reported 86 vulnerabilities: 1 critical, 33 high, 41 moderate, and 11 low. Notable advisories include Clerk middleware route-protection bypass, Astro reflected XSS, `@astrojs/cloudflare` SSRF via `/_image`, Wrangler command injection, `devalue` prototype pollution/DoS, `trim` ReDoS through Decap CMS, and `tar` arbitrary file overwrite.
- Why it matters: Several advisories affect auth, SSR, deployment tooling, and content rendering. These are not theoretical polish issues; they can become exploitable depending on deployment and routing.
- Steps to reproduce: Run `pnpm audit --prod`.
- Recommended fix: Upgrade affected packages, starting with Clerk, Astro, `@astrojs/cloudflare`, Wrangler, and transitive packages that have patched versions.
- Suggested implementation: Run targeted upgrades first, rebuild, then re-run `pnpm audit --prod`; avoid `--force` broad upgrades unless tested because Astro/Cloudflare integrations may have breaking changes.
- Estimated effort: 4-8 hours depending on breaking changes.

### [Critical] Admin APIs appear to allow any valid Clerk identity, not explicit admins only

- Location: `src/lib/auth.ts:3-13`, `src/pages/api/admin/posts.ts:33-37`, `src/pages/api/admin/blog-posts.ts:33-37`, `src/pages/api/admin/drafts/[slug].ts`, `src/pages/api/admin/posts/[slug].ts`
- Category: Security / authorization
- Evidence: `requireClerk()` verifies `locals.auth()` and returns `userId` / `sessionId`, but no allowlist, org role, or claim-based admin policy is enforced before admin read/write/delete handlers run.
- Why it matters: Authentication is not authorization. If any non-admin user can sign into the Clerk app or obtain a valid token, they may be able to access admin APIs.
- Steps to reproduce: Inspect `requireClerk()` and admin route handlers. They only call `requireClerk()` and proceed.
- Recommended fix: Restore deny-by-default admin authorization using explicit environment-driven admin user IDs, org roles, or session claims.
- Suggested implementation: Add an `assertAdmin()` layer that checks `CLERK_ADMIN_USER_IDS`, `CLERK_ADMIN_ORG_IDS`, `CLERK_ADMIN_ORG_ROLES`, or a signed session claim before route handlers execute; return structured 401/403 JSON errors.
- Estimated effort: 3-5 hours including verification with admin and non-admin accounts.

### [Critical] Contact e-mail HTML uses raw user input despite preparing escaped values

- Location: `src/pages/api/contact.ts:49-53`, `src/pages/api/contact.ts:105-116`, `src/pages/api/contact.ts:202-216`
- Category: Security / form handling
- Evidence: The handler creates escaped variables such as `safeName`, `safeEmail`, `safePhone`, `safeSubject`, and `safeMessage`, but the HTML e-mail template interpolates raw `name`, `email`, `phone`, `subject`, and `message`.
- Why it matters: An attacker can inject HTML into e-mails sent to NOUS or to customers. This can enable phishing, broken rendering, tracking pixels, misleading links, and unsafe internal handling.
- Steps to reproduce: Submit form fields containing HTML such as `<a href="https://evil.example">urgent</a>` and inspect the generated e-mail body.
- Recommended fix: Use the already-created escaped variables everywhere inside HTML templates.
- Suggested implementation: Replace raw variables in template literals with `safeName`, `safeEmail`, `safePhone`, `safeSubject`, and `safeMessage`; keep raw values only for structured validation and plain-text logging if needed.
- Estimated effort: 30-60 minutes.

## High Priority Findings

### [High] Contact and newsletter endpoints have no abuse controls

- Location: `src/pages/api/contact.ts`, `src/pages/api/subscribe.ts`
- Category: Security / spam prevention / privacy
- Evidence: Public endpoints accept submissions and trigger e-mail/database writes without rate limiting, CAPTCHA/Turnstile, honeypot, origin policy, or throttling.
- Why it matters: Attackers can spam inboxes, exhaust Resend limits, poison the subscriber database, and create operational noise.
- Steps to reproduce: Inspect handlers or repeatedly POST valid payloads.
- Recommended fix: Add Cloudflare Turnstile or equivalent, IP/user-agent rate limiting, a honeypot field, and per-address throttling.
- Suggested implementation: Use Cloudflare WAF/rate limiting at the edge plus handler-level checks. Log only what is needed for abuse review.
- Estimated effort: 4-6 hours.

### [High] Sitemap and robots output are inconsistent with the actual site

- Location: `public/sitemap.xml`, `dist/sitemap-0.xml`, `public/robots.txt:10-15`, `astro.config.mjs:33-39`
- Category: SEO / production readiness
- Evidence: Generated sitemap includes duplicate root entries, slash/no-slash duplicates, `/admin/`, `/pricing/`, `/products/`, `/about-us/`, and `/contact-us/`. The manual `public/sitemap.xml` is stale, has 2025 dates, and references wrong legal slugs such as `termsAndConditions` and `privacyPolicy`. `robots.txt` points to `/sitemap.xml`, which may serve the stale manual sitemap.
- Why it matters: Search engines can index wrong URLs, crawl admin/disabled routes, waste crawl budget, and miss canonical pages.
- Steps to reproduce: Inspect `dist/sitemap-0.xml`, `dist/sitemap-index.xml`, `public/sitemap.xml`, and `public/robots.txt`.
- Recommended fix: Remove the manual sitemap or ensure it redirects to the generated sitemap index; exclude admin, redirects, disabled pages, and duplicate trailing-slash variants.
- Suggested implementation: Configure `@astrojs/sitemap` with a filter for public canonical routes only and update `robots.txt` to reference the generated sitemap index.
- Estimated effort: 2-4 hours.

### [High] Closed mobile navigation remains available to screen readers and keyboard users

- Location: `src/components/ui-main-components/Header.astro:58-103`
- Category: Accessibility / navigation
- Evidence: Browser accessibility snapshot at 390px showed `navigation "Mobile navigation"` and `Close menu` in the tree before the menu was visually opened. The menu is translated offscreen rather than hidden/inert.
- Why it matters: Keyboard and screen-reader users can tab into hidden links and controls. This creates confusing focus order and can trap users in invisible UI.
- Steps to reproduce: Load the home page at mobile width, do not open the menu, inspect accessibility tree or tab order.
- Recommended fix: Add `hidden`, `inert`, and `aria-hidden="true"` while closed; remove those states only when open.
- Suggested implementation: Update the mobile menu script to manage actual visibility/accessibility state, not only transform classes.
- Estimated effort: 1-2 hours.

### [High] Footer newsletter input has no accessible label

- Location: `src/components/ui-main-components/Footer.astro:77-84`
- Category: Accessibility / forms
- Evidence: Browser inspection showed `footer-email-address` has no label. Placeholder text is not a valid accessible label.
- Why it matters: Screen-reader users may not understand the field purpose. Placeholder-only labels also disappear as soon as users type.
- Steps to reproduce: Inspect the footer newsletter form with accessibility tooling.
- Recommended fix: Add a visible or `sr-only` `<label for="footer-email-address">E-mail address</label>`.
- Suggested implementation: Add an `sr-only` label if the visual design should remain unchanged.
- Estimated effort: 15 minutes.

### [High] Generic button component overrides accessible names with `aria-label="Button"`

- Location: `src/components/ui/Buttons/ButtonVariant.astro:31`, `src/components/ui/Buttons/ButtonVariant.astro:57`
- Category: Accessibility / component system
- Evidence: The default `ariaLabel` value is `"Button"` and the component always renders `aria-label={ariaLabel}`. Browser snapshot showed footer buttons named `Button`.
- Why it matters: Screen-reader users hear "Button" instead of the actual action. This affects every button using the component without an explicit label.
- Steps to reproduce: Inspect footer buttons or any `ButtonVariant` instance without an explicit `ariaLabel`.
- Recommended fix: Remove the default `aria-label` entirely unless the consumer passes a custom value.
- Suggested implementation: Render `aria-label` conditionally only for icon-only buttons or when `ariaLabel` is provided.
- Estimated effort: 30-60 minutes.

### [High] Homepage has multiple H1 elements

- Location: `src/components/ui-main-components/Hero.astro`, `src/components/ui-main-components/NousOffer.astro:9`
- Category: Accessibility / SEO / semantic structure
- Evidence: Browser heading audit found two H1s on the home page: the hero headline and "The AI transformation partner for ambitious organizations."
- Why it matters: Multiple H1s are not automatically invalid, but here the second one is a section heading and should be an H2 for cleaner document hierarchy and SEO.
- Steps to reproduce: Inspect headings on `/`.
- Recommended fix: Change the section heading in `NousOffer.astro` from H1 to H2 while preserving visual style.
- Suggested implementation: Use an `as` prop on the title component or render `<h2>`.
- Estimated effort: 15-30 minutes.

### [High] Blog pages can fail hard if database or environment variables fail

- Location: `src/pages/blog/index.astro:12-18`, `src/pages/blog/[slug].astro:18-24`
- Category: Reliability / production readiness
- Evidence: Blog routes instantiate Turso clients and query the database during SSR with no top-level fallback. If env variables or DB are unavailable, the route can fail.
- Why it matters: A database outage should not take down the entire blog page without a controlled error or fallback state.
- Steps to reproduce: Run without required Turso variables or with DB unavailable.
- Recommended fix: Add defensive error handling, fallback content, and monitoring around blog data loading.
- Suggested implementation: Wrap DB calls in `try/catch`; render a graceful empty/error state and log server-side diagnostics.
- Estimated effort: 2-4 hours.

### [High] Unsanitized Markdown/HTML rendering creates XSS risk if content becomes untrusted

- Location: `src/components/ui/BlogContentRenderer.astro:54-70`, `src/components/ui/FoundersCard.astro:67`, `src/components/ui/Tittles/GradientTittle.astro:13`
- Category: Security / content rendering
- Evidence: `marked.parse()` output and other strings are rendered through `set:html` without DOM sanitization.
- Why it matters: If admin content, imported Markdown, or future CMS fields are compromised, scripts or unsafe HTML can render on public pages.
- Steps to reproduce: Insert unsafe HTML in blog content or founder description and view the rendered page.
- Recommended fix: Sanitize HTML or restrict content to trusted, typed, structured fields.
- Suggested implementation: Use a sanitizer such as DOMPurify on the server side, or use Astro content collections/MDX with controlled components.
- Estimated effort: 2-4 hours.

### [High] Footer service links point to a missing anchor

- Location: `src/components/ui-main-components/Footer.astro:137`, `src/components/ui-main-components/Footer.astro:142`, `src/components/ui-main-components/Footer.astro:147`, `src/pages/services.astro:239`
- Category: Functionality / navigation
- Evidence: Footer links use `/services#our-services`, but the services page section ID is `services`.
- Why it matters: Users who click those links land at the top or an unexpected scroll position instead of the intended services section.
- Steps to reproduce: Click footer service links and observe scroll behavior.
- Recommended fix: Standardize on one anchor ID.
- Suggested implementation: Either change footer links to `/services#services` or rename the section ID to `our-services`.
- Estimated effort: 15 minutes.

### [High] Header mobile-menu listeners can accumulate across client-side route transitions

- Location: `src/components/ui-main-components/Header.astro:192-210`, `src/layouts/Layout.astro:141`
- Category: Functionality / performance / maintainability
- Evidence: `initializeMobileMenu()` is called on `DOMContentLoaded` and `astro:page-load`. A cleanup callback is created only in one path, so listeners can duplicate with Astro `ClientRouter`.
- Why it matters: After navigating around the site, menu clicks may fire multiple times, animation state can drift, and performance can degrade.
- Steps to reproduce: Navigate client-side between routes several times, then open/close the mobile menu and inspect event behavior.
- Recommended fix: Use a single initialization path with reliable cleanup before reinitializing.
- Suggested implementation: Store cleanup on `window`, call it before new initialization, and ensure only one listener exists per element.
- Estimated effort: 1-2 hours.

### [High] The project lacks lint, typecheck, and test gates

- Location: `package.json:scripts`
- Category: Engineering quality / production readiness
- Evidence: `pnpm lint`, `pnpm typecheck`, and `pnpm test` do not exist or fail.
- Why it matters: This site is changing quickly. Without automated checks, regressions in routes, forms, accessibility, and content are likely.
- Steps to reproduce: Run `pnpm lint`, `pnpm typecheck`, and `pnpm test`.
- Recommended fix: Add baseline scripts before launch.
- Suggested implementation: Add `astro check`, ESLint or Biome, Playwright smoke tests for major routes, and an accessibility smoke pass with Axe.
- Estimated effort: 4-8 hours.

### [High] Very dirty working tree creates release risk

- Location: Git working tree
- Category: Release management / production readiness
- Evidence: `git status --short` shows dozens of modified files and many untracked files, including new pages, components, and generated assets.
- Why it matters: It is difficult to know what will ship, what is experimental, and what must be included. Untracked images/components can be missed in deployment or review.
- Steps to reproduce: Run `git status --short`.
- Recommended fix: Commit intentionally after QA fixes, or split changes into reviewable branches.
- Suggested implementation: Stage only intended files, run build/audit after staging, and use a PR checklist before deploy.
- Estimated effort: 1-2 hours.

### [High] Admin page shows local dev hydration/optimized dependency failures

- Location: `/admin`, `src/components/react/AdminEntrypoint.tsx`
- Category: Functionality / developer experience
- Evidence: Browser QA produced `504 (Outdated Optimize Dep)` and hydration errors for admin chunks in local dev.
- Why it matters: Admin is a high-risk area. If it is unstable locally, validating auth and content management becomes difficult.
- Steps to reproduce: Open `/admin` in local dev after recent dependency/component changes and inspect the console.
- Recommended fix: Clear Vite optimized deps, verify admin hydration, and add an admin smoke test.
- Suggested implementation: Remove stale `.astro`/Vite caches if needed, restart dev server, and test login/admin entry separately.
- Estimated effort: 1-3 hours.

### [High] CSP is broad and permits unsafe JavaScript patterns

- Location: `public/_headers:9`
- Category: Security / browser hardening
- Evidence: Content Security Policy includes `'unsafe-inline'`, `'unsafe-eval'`, and broad `https:` sources.
- Why it matters: A weak CSP reduces protection against XSS and third-party script abuse.
- Steps to reproduce: Inspect `public/_headers`.
- Recommended fix: Tighten CSP after auditing required scripts/styles.
- Suggested implementation: Remove `unsafe-eval`, limit `script-src` and `connect-src`, use nonces/hashes for inline scripts, and explicitly list required domains.
- Estimated effort: 4-8 hours.

## Medium Priority Findings

### [Medium] SEO metadata and schema still use stale "Nous Technologies" positioning

- Location: `src/layouts/Layout.astro:37-54`, `src/components/seo/SEO.astro:23-27`, `src/components/seo/OrganizationSchema.astro:5-9`
- Category: SEO / copy / brand consistency
- Evidence: Defaults still say "Nous Technologies", "AI Consulting & Web Development", and generic web-development positioning.
- Why it matters: Metadata is often the first copy users see in search, previews, and social cards. It should match the new AI transformation/deployment positioning.
- Steps to reproduce: Inspect layout, SEO component, and organization schema.
- Recommended fix: Update all default metadata to `NOUS` and AI deployment/transformation language.
- Suggested implementation: Use one shared metadata object and apply it consistently across layout, SEO, schema, and social tags.
- Estimated effort: 1-2 hours.

### [Medium] Organization schema contains unsupported or stale claims

- Location: `src/components/seo/OrganizationSchema.astro:115-117`
- Category: SEO / trust / legal
- Evidence: Schema lists awards such as "Best AI Consulting Firm Costa Rica 2024" and "Top Web Development Agency Latin America 2024".
- Why it matters: Unsupported claims can reduce trust and may be risky if search engines or users verify them.
- Steps to reproduce: Inspect organization schema JSON-LD.
- Recommended fix: Remove awards unless they are real, externally verifiable, and intentionally part of the brand.
- Suggested implementation: Replace with factual fields: service area, founder/team, contact points, sameAs profiles, and services.
- Estimated effort: 30-60 minutes.

### [Medium] Contact API sends internal notifications to stale address and stale brand name

- Location: `src/pages/api/contact.ts:205`, `src/pages/api/contact.ts:212-214`
- Category: Functionality / copy / operations
- Evidence: Internal recipient is `contacto@nous.cr`, sender uses `Nous Technologies`, and customer subject says "Thank you for contacting Nous Technologies".
- Why it matters: Contact operations and customer-facing confirmation e-mails should match the site's public identity and actual inbox routing.
- Steps to reproduce: Inspect the handler or submit a test form in a safe environment.
- Recommended fix: Use configured recipient variables and the current `NOUS` brand.
- Suggested implementation: Replace hardcoded recipient with `CONTACT_RECIPIENT_EMAIL`; update e-mail copy to `NOUS`.
- Estimated effort: 30-60 minutes.

### [Medium] Contact API uses Mexico City timezone instead of Costa Rica

- Location: `src/pages/api/contact.ts:129`
- Category: Operations / localization
- Evidence: Submission timestamp uses `America/Mexico_City`.
- Why it matters: NOUS is based in Costa Rica; timestamps should align with operational timezone.
- Steps to reproduce: Inspect timestamp formatting.
- Recommended fix: Use `America/Costa_Rica` or store UTC and format in the admin UI.
- Suggested implementation: Prefer UTC in storage/e-mail metadata and localized display when needed.
- Estimated effort: 15-30 minutes.

### [Medium] Contact and newsletter forms rely only on native validation

- Location: `src/components/ui/ContactPageForm.astro`, `src/components/ui/ContactForm.astro`, `src/components/ui-main-components/Footer.astro`
- Category: UX / accessibility
- Evidence: Empty submit correctly triggers browser validation, but there is no custom error summary or status region.
- Why it matters: Native validation varies by browser and is not enough for a polished, accessible production form.
- Steps to reproduce: Submit empty contact/newsletter forms.
- Recommended fix: Add inline error messages, an accessible form-level alert, and clear success/error states.
- Suggested implementation: Use `aria-invalid`, `aria-describedby`, and a `role="status"` / `role="alert"` region.
- Estimated effort: 2-4 hours.

### [Medium] Newsletter script logs personal data to the browser console

- Location: `src/components/ui-main-components/Footer.astro:281`, `src/components/ui-main-components/Footer.astro:291`
- Category: Privacy / code quality
- Evidence: The footer newsletter script logs submitted e-mail addresses and API responses.
- Why it matters: Console logs can expose user data in shared devices, support screenshots, or third-party logging tools.
- Steps to reproduce: Submit newsletter form and inspect console.
- Recommended fix: Remove production console logs for personal data.
- Suggested implementation: Gate diagnostics behind a development check or remove them entirely.
- Estimated effort: 15 minutes.

### [Medium] Some routes exist but intentionally return 404 while still appearing in generated sitemap

- Location: `src/pages/pricing.astro`, `src/pages/products.astro`, `dist/sitemap-0.xml`
- Category: SEO / routing
- Evidence: `/pricing` and `/products` return 404, but generated sitemap includes them.
- Why it matters: Search engines and users can discover dead pages.
- Steps to reproduce: Fetch `/pricing`, `/products`, and inspect sitemap output.
- Recommended fix: Remove disabled pages from sitemap or replace them with real redirects/noindex pages.
- Suggested implementation: Delete stale route files or exclude them from sitemap generation.
- Estimated effort: 30-60 minutes.

### [Medium] Blog article missing slug redirects to `/blog` instead of returning 404

- Location: `src/pages/blog/[slug].astro:26-28`
- Category: SEO / UX
- Evidence: Missing posts call `Astro.redirect('/blog')`.
- Why it matters: Search engines and users receive a soft-404 style experience rather than a clear missing-page status.
- Steps to reproduce: Visit a non-existing `/blog/some-missing-post`.
- Recommended fix: Return a true 404 page for missing articles.
- Suggested implementation: Use `return Astro.redirect('/404', 302)` only for intentional UX, or better return `new Response(..., { status: 404 })` with the custom 404 layout.
- Estimated effort: 30-60 minutes.

### [Medium] Service tabs can visually overflow on narrow mobile screens

- Location: Home page service section, `src/components/react/ServiceTabs.tsx`
- Category: Responsive design / UX
- Evidence: Browser responsive QA at 320-430px showed service tab labels extending beyond the viewport area even though document scroll width was constrained.
- Why it matters: The UI looks cramped and can reduce perceived polish on common mobile widths.
- Steps to reproduce: Open `/` at 320px, 375px, or 390px and inspect the service tabs.
- Recommended fix: Use a horizontally scrollable segmented control with visible affordance, or stack tabs into a compact 1-column/2-column layout.
- Suggested implementation: Add `overflow-x-auto`, snap points, and shorter labels on mobile, or convert to select-like controls.
- Estimated effort: 1-2 hours.

### [Medium] Scroll animation classes can place content offscreen before animation

- Location: `src/styles/global.css:96-150`
- Category: Responsive design / browser compatibility
- Evidence: Browser QA saw `.appear-left` content positioned with negative left offsets at several viewport widths before animation. CSS uses View Timeline features and large transforms.
- Why it matters: Unsupported or delayed animations can make content appear clipped or missing.
- Steps to reproduce: Inspect animated sections at 375, 390, 430, 768, and 1024 widths during initial load/scroll.
- Recommended fix: Reduce transform distances and provide non-animated default states for unsupported browsers.
- Suggested implementation: Wrap view-timeline animation in `@supports` and keep default visible state outside the feature query.
- Estimated effort: 2-4 hours.

### [Medium] Reduced-motion support is incomplete

- Location: `src/styles/global.css:7`, `src/components/react/ShootingStars.tsx`, `src/components/react/StarBackground.tsx`, `src/components/react/timeLine/Globe.tsx`
- Category: Accessibility / performance
- Evidence: Global smooth scrolling is always enabled; canvas/star/globe animations run continuously; only some React components check reduced motion.
- Why it matters: Users with vestibular sensitivity may be affected, and continuous animations cost CPU/GPU.
- Steps to reproduce: Enable reduced motion in the OS/browser and inspect animated sections.
- Recommended fix: Add global `prefers-reduced-motion` handling and pause/degrade decorative animations.
- Suggested implementation: Use CSS media queries plus React hooks to disable animation loops or render static fallbacks.
- Estimated effort: 2-4 hours.

### [Medium] Decorative canvas animations may waste CPU/GPU

- Location: `src/components/react/ShootingStars.tsx:73-78`, `src/components/react/StarBackground.tsx:126`, `src/components/react/timeLine/Globe.tsx:12-17`
- Category: Performance
- Evidence: Star background and globe render loops are continuous; `ShootingStars` creates a timeout but cleanup does not clear it; globe uses high samples and device pixel ratio.
- Why it matters: Continuous effects can degrade battery life and interaction responsiveness, especially on mobile.
- Steps to reproduce: Inspect performance timeline on pages with star/globe effects.
- Recommended fix: Pause animations offscreen, respect reduced motion, and clear timers/animation frames on unmount.
- Suggested implementation: Use `IntersectionObserver`, cleanup callbacks, and lower fidelity on mobile.
- Estimated effort: 3-6 hours.

### [Medium] Admin JavaScript chunk is large

- Location: Build output, `src/components/react/AdminEntrypoint.tsx`
- Category: Performance / maintainability
- Evidence: Build warning reports `AdminEntrypoint...js` around 506.54 kB before gzip and 158.63 kB gzip.
- Why it matters: Admin may be private, but large chunks slow local/admin use and indicate dependency bloat.
- Steps to reproduce: Run `pnpm build`.
- Recommended fix: Lazy-load heavy editor/admin modules and split admin routes.
- Suggested implementation: Dynamically import TipTap/editor components only after admin auth and when editing is active.
- Estimated effort: 4-8 hours.

### [Medium] Font and asset strategy is inconsistent

- Location: `src/layouts/Layout.astro:136-138`, `dist/fonts`, `src/styles/global.css:21-22`
- Category: Performance / design system
- Evidence: Layout loads Google-hosted Geist while local font assets and old variable names remain. Tokens reference `--font-archivo-black` and `--font-tiktok-sans` even though values are Geist.
- Why it matters: Extra font requests and stale naming make the design system harder to maintain.
- Steps to reproduce: Inspect layout and global CSS.
- Recommended fix: Decide on either self-hosted or Google-hosted font loading and rename tokens to current font roles.
- Suggested implementation: Use `--font-display` and `--font-body` naming and remove unused font files/imports.
- Estimated effort: 1-3 hours.

### [Medium] External links need consistent `rel` handling

- Location: `src/components/ui/Buttons/ButtonVariant.astro:58`, social/profile links site-wide
- Category: Security / SEO
- Evidence: Button component supports `target`, but does not automatically add `rel="noopener noreferrer"` for `_blank`.
- Why it matters: External tabs can access `window.opener` if `rel` is missing.
- Steps to reproduce: Inspect rendered external links that open in new tabs.
- Recommended fix: Add automatic `rel` when `target="_blank"`.
- Suggested implementation: In link/button components, compute `rel={target === '_blank' ? 'noopener noreferrer' : rel}`.
- Estimated effort: 30-60 minutes.

### [Medium] Homepage copy still contains one "AI shift" phrase

- Location: Home CTA/timeline copy
- Category: Copywriting / brand consistency
- Evidence: Browser snapshot showed "Do not watch the AI shift from the sidelines."
- Why it matters: The user has intentionally moved the brand language toward "AI transformation"; inconsistent phrasing weakens positioning.
- Steps to reproduce: Open the home page and inspect the CTA cards.
- Recommended fix: Replace "AI shift" with "AI transformation" or a more natural line.
- Suggested implementation: Suggested replacement: "Do not wait for the AI transformation to happen around you."
- Estimated effort: 15 minutes.

### [Medium] Legacy contact/about routes are correctly redirected but still appear as first-class pages in sitemap output

- Location: `src/pages/about-us.astro`, `src/pages/contact-us.astro`, generated sitemap
- Category: SEO / routing
- Evidence: `/about-us` and `/contact-us` return 301, but generated sitemap includes them.
- Why it matters: Sitemaps should list canonical URLs, not redirecting aliases.
- Steps to reproduce: Fetch routes and inspect sitemap output.
- Recommended fix: Exclude redirect-only pages from sitemap.
- Suggested implementation: Add sitemap filtering or remove route files if server redirects are handled elsewhere.
- Estimated effort: 30-60 minutes.

## Low Priority Findings

### [Low] Browser theme colors still use old cyan palette

- Location: `src/components/seo/SEO.astro:158-159`
- Category: Brand consistency
- Evidence: `theme-color` and `msapplication-TileColor` use `#00D4FF`, which does not match the current purple/lavender system.
- Why it matters: Browser UI and app previews should feel consistent with the site.
- Steps to reproduce: Inspect SEO component.
- Recommended fix: Use the current deep purple/lavender color.
- Suggested implementation: Replace with a brand token such as `#090015` or the current lavender accent.
- Estimated effort: 15 minutes.

### [Low] Default author and content config are stale

- Location: `src/content/config.ts:51-52`
- Category: Copy / maintainability
- Evidence: Defaults use `Nous Technologies` and a Spanish web-development bio.
- Why it matters: Future blog posts may inherit outdated bylines and descriptions.
- Steps to reproduce: Inspect content config.
- Recommended fix: Update default author metadata to current NOUS identity.
- Suggested implementation: Use `NOUS` and AI transformation/deployment language.
- Estimated effort: 15-30 minutes.

### [Low] Legal pages use inline `onclick` for back-to-top

- Location: `src/pages/privacy-policy.astro:59-61`, `src/pages/terms-and-conditions.astro:59-61`
- Category: Code quality / accessibility
- Evidence: Buttons call `window.scrollTo(...)` inline.
- Why it matters: Inline JS complicates CSP tightening and does not account for reduced motion.
- Steps to reproduce: Inspect legal page source.
- Recommended fix: Move behavior to a small script or anchor link and respect reduced motion.
- Suggested implementation: Use `<a href="#top">Back to top</a>` or event listener with reduced-motion check.
- Estimated effort: 30 minutes.

### [Low] Form autocomplete is disabled globally for many inputs

- Location: `src/components/ui/Inputs.astro:38`, `src/components/ui/Inputs.astro:87`
- Category: UX / accessibility
- Evidence: Component renders `autocomplete="off"` for inputs and textarea.
- Why it matters: Users benefit from autofill for name, e-mail, and phone fields.
- Steps to reproduce: Inspect rendered contact fields.
- Recommended fix: Use specific autocomplete values.
- Suggested implementation: `name`, `email`, `tel`, and `organization` where appropriate; omit autocomplete for freeform message.
- Estimated effort: 30-60 minutes.

### [Low] Touch target sizing is slightly under best-practice guidance in some controls

- Location: `src/components/ui/Inputs.astro`, tab/button controls
- Category: Mobile UX / accessibility
- Evidence: Some controls use `min-h-10` or compact pill sizing, around 40px.
- Why it matters: WCAG target-size guidance and mobile usability generally prefer 44px or more.
- Steps to reproduce: Inspect mobile forms and tab controls.
- Recommended fix: Set mobile touch controls to at least 44px high.
- Suggested implementation: Use `min-h-11` or equivalent on mobile interactive elements.
- Estimated effort: 1 hour.

### [Low] Old labels remain in CSS token names

- Location: `src/styles/global.css:21-22`
- Category: Maintainability
- Evidence: Font variables still mention `archivo-black` and `tiktok-sans`.
- Why it matters: Stale token names create confusion when future design changes happen.
- Steps to reproduce: Inspect global CSS variables.
- Recommended fix: Rename to semantic font roles.
- Suggested implementation: `--font-heading`, `--font-body`, `--font-ui`.
- Estimated effort: 30 minutes.

## Nitpicks and Polish

### [Nit] Legal text justification may create rivers on narrow widths

- Location: `src/pages/privacy-policy.astro`, `src/pages/terms-and-conditions.astro`
- Category: Typography
- Evidence: Long legal paragraphs are justified.
- Why it matters: Justified text can look formal, but it can reduce readability at smaller widths.
- Steps to reproduce: Read legal pages at tablet/mobile widths.
- Recommended fix: Keep justification only at comfortable desktop widths.
- Suggested implementation: Use `text-left md:text-justify` or add hyphenation support.
- Estimated effort: 15 minutes.

### [Nit] Button copy should stay consultative, not hype-driven

- Location: Home and CTA sections
- Category: Copywriting / conversion
- Evidence: The overall direction is professional, but any phrase like "Start your AI transformation!" can sound salesy if it reappears.
- Why it matters: NOUS is positioning as a serious AI deployment partner, not a hype agency.
- Steps to reproduce: Review CTA strings site-wide.
- Recommended fix: Use practical, discovery-oriented CTAs.
- Suggested implementation: Prefer "Find your AI opportunity", "Talk to NOUS", or "Plan your first deployment".
- Estimated effort: 30 minutes.

### [Nit] Stale local/generated artifacts should be cleaned before release

- Location: `public/1.png`, `public/images/logo.jpg`, old image assets, `.playwright-cli/`
- Category: Repo hygiene / performance
- Evidence: Asset inventory shows old images and generated tooling folders in the working tree.
- Why it matters: Unused assets bloat the repo and can create confusion.
- Steps to reproduce: Run `find public src/assets -type f -size +300k`.
- Recommended fix: Remove or archive unused assets after confirming references.
- Suggested implementation: Use `rg` to confirm no references, then delete unused files in a cleanup PR.
- Estimated effort: 1-2 hours.

## Page-by-Page Audit

### Home (`/`)

1. Purpose of the page: Communicate NOUS as an AI transformation/deployment company and guide users toward contact.
2. What works well:
   - Strong visual identity and clear AI transformation positioning.
   - Hero logo and motion direction are distinctive.
   - Service/category structure is relevant to the current strategy.
   - CTA and contact sections are much stronger than the original placeholder direction.
3. Bugs:
   - Footer links to `/services#our-services`, but services section uses `#services`.
   - Hidden mobile nav is accessible while closed.
   - Social icon links in the final CTA have weak/missing accessible names.
4. Design issues:
   - Service tabs can feel cramped on 320-430px.
   - Scroll-in animation can place content too far offscreen before reveal.
   - Some old components still feel heavier/bolder than the refined font direction.
5. UX issues:
   - Multiple CTAs are mostly clear, but the home page should ensure one primary conversion path.
   - The final contact form requires phone in the home variant if `phoneRequired` is not explicitly false.
6. Copy issues:
   - "AI shift" should become "AI transformation".
   - Some metadata still says web development even though the page copy is AI-first.
7. Responsiveness issues:
   - Mobile service tabs and reveal animations need refinement.
8. Accessibility issues:
   - Duplicate H1.
   - Icon-only social links need proper labels.
   - Motion needs reduced-motion support.
9. SEO issues:
   - Default schema/meta do not match page positioning.
10. Performance concerns:
   - Star/canvas/globe animations and images should be audited for mobile cost.
11. Recommended fixes:
   - Fix H1 hierarchy, service anchor, mobile nav accessibility, social labels, and reduced-motion behavior.
12. Overall rating: 7.4 / 10.

### Services (`/services`)

1. Purpose of the page: Explain NOUS services around AI deployment and AI-ready systems.
2. What works well:
   - The new page direction is strong and aligned with the OpenAI deployment-company inspiration.
   - The page avoids pricing and focuses on capability.
   - FAQ expansion is useful for buyer objections.
3. Bugs:
   - Footer service anchors target `#our-services`, but the page uses `#services`.
4. Design issues:
   - The page should keep card widths and text rhythm consistent with home cards.
5. UX issues:
   - FAQs are helpful, but answers should be scanned for repeated abstraction.
6. Copy issues:
   - Strong overall. Keep language concrete: workflows, systems, training, deployment, measurement.
7. Responsiveness issues:
   - Needs manual final pass at 320/375/390 after content changes.
8. Accessibility issues:
   - Verify accordion/FAQ keyboard behavior if interactive.
9. SEO issues:
   - Page metadata should target AI deployment and Costa Rica/LatAm without stuffing.
10. Performance concerns:
   - Visuals should be optimized and lazy-loaded below the fold.
11. Recommended fixes:
   - Fix anchor mismatch, verify FAQ semantics, and update metadata/schema.
12. Overall rating: 8.0 / 10.

### About (`/about`)

1. Purpose of the page: Explain NOUS mission, team, and operating philosophy.
2. What works well:
   - Founder/team card layout is cleaner after moving to wider two-column rows.
   - Mission direction is aligned with "abundant intelligence" and AI deployment.
3. Bugs:
   - Team imagery is still being manually tuned and should be finalized consistently.
4. Design issues:
   - Portrait framing must be consistent across all six team cards.
   - Hierarchy of founder vs non-founder roles should be visually clear without becoming an org chart.
5. UX issues:
   - Social links should have clear accessible names.
6. Copy issues:
   - Some team bios may still read slightly generic. They should clearly map role to business contribution.
7. Responsiveness issues:
   - Team cards need verification at 320, 390, 768, and 1024 after all images are final.
8. Accessibility issues:
   - Verify portrait alt text and social icon labels.
9. SEO issues:
   - About metadata should use NOUS, not stale Nous Technologies language.
10. Performance concerns:
   - Portrait images should use optimized formats and dimensions.
11. Recommended fixes:
   - Finalize portraits, alt text, social labels, and team copy.
12. Overall rating: 7.5 / 10.

### Blog Index (`/blog`)

1. Purpose of the page: Present NOUS thinking and field notes.
2. What works well:
   - Top card direction matches the rest of the site.
   - Featured-only structure is acceptable while there is only one article.
3. Bugs:
   - DB failure can break the page.
4. Design issues:
   - Featured article card should keep visual alignment with other content pages.
5. UX issues:
   - With one article, "Featured Articles" is acceptable; once more posts exist, add filters/categories/search only if useful.
6. Copy issues:
   - Subtitle should stay rooted in field notes on abundant intelligence rather than generic company blog copy.
7. Responsiveness issues:
   - Needs final mobile/tablet verification after more posts are added.
8. Accessibility issues:
   - Verify article card link labels and heading hierarchy.
9. SEO issues:
   - Blog index should have a distinct meta description and canonical.
10. Performance concerns:
   - Avoid fetching Clerk author data per request without caching.
11. Recommended fixes:
   - Add data-loading fallback and cache author metadata.
12. Overall rating: 7.2 / 10.

### Blog Article (`/blog/building-a-more-intelligent-world`)

1. Purpose of the page: Publish Roberto's thesis on abundant intelligence.
2. What works well:
   - Article hero card now feels more premium.
   - Author/tags/date area is clearer after the recent pass.
3. Bugs:
   - Markdown/HTML rendering is unsanitized.
   - Missing article slugs redirect to `/blog` instead of returning 404.
4. Design issues:
   - Body width and typographic hierarchy were improved, but long-form readability still needs final desktop/mobile reading QA.
5. UX issues:
   - End card should stay concise and not compete with the article body.
6. Copy issues:
   - Article itself is strong; avoid over-formatting headings into similar weights.
7. Responsiveness issues:
   - Check title wrapping and tag stacking at 320-430px.
8. Accessibility issues:
   - Ensure tags are not only visual pills if they are links; if not links, they should not be focusable.
9. SEO issues:
   - Add article structured data if not already generated.
10. Performance concerns:
   - Author avatar and card images should be optimized.
11. Recommended fixes:
   - Sanitize rendered HTML, return true 404 for missing posts, and add article schema.
12. Overall rating: 7.0 / 10.

### Contact (`/contact`)

1. Purpose of the page: Convert interested organizations into a guided first contact.
2. What works well:
   - Single-column flow is cleaner than the earlier two-column design.
   - Hermes copy is candid and differentiates the intake process.
   - Mailto and WhatsApp cards work.
3. Bugs:
   - Form endpoint risks described above.
4. Design issues:
   - Form option layout is better, but still needs strict visual QA after any copy changes.
5. UX issues:
   - Valid submission was not tested to avoid sending real e-mails.
   - Success/error state should be more explicit and accessible.
6. Copy issues:
   - "Tell us what you are exploring" is okay, but "Start with what you want to improve" is more consultative.
7. Responsiveness issues:
   - Single-column layout is mobile-friendly; verify form spacing at 320px.
8. Accessibility issues:
   - Native validation exists, but custom accessible error handling is missing.
9. SEO issues:
   - Contact page should be included once in sitemap as `/contact/`, not also `/contact-us/`.
10. Performance concerns:
   - Low.
11. Recommended fixes:
   - Add abuse controls, custom validation messaging, and endpoint hardening.
12. Overall rating: 7.4 / 10.

### Portfolio (`/portfolio`)

1. Purpose of the page: Temporary construction page.
2. What works well:
   - Simple "in construction" direction is appropriate for now.
3. Bugs:
   - None observed.
4. Design issues:
   - Ensure it does not look like a dead end; provide a clear path to services/contact.
5. UX issues:
   - Since this page is not ready, it should not be over-promoted in navigation until portfolio content exists.
6. Copy issues:
   - Keep wording minimal and confident.
7. Responsiveness issues:
   - Needs quick mobile QA only.
8. Accessibility issues:
   - Verify heading hierarchy and link labels.
9. SEO issues:
   - Consider noindex until real portfolio content exists.
10. Performance concerns:
   - Low.
11. Recommended fixes:
   - Add noindex or keep out of primary nav until launch-ready.
12. Overall rating: 7.0 / 10 as a placeholder.

### Privacy Policy (`/privacy-policy`)

1. Purpose of the page: Explain data collection, use, retention, rights, and contact methods.
2. What works well:
   - Page design is much more aligned with the rest of the site.
   - Legal content is more complete than the original.
   - `privacy@nous.cr` / `legal@nous.cr` direction is appropriate.
3. Bugs:
   - None observed in basic route test.
4. Design issues:
   - Justified legal text should be checked for readability on narrow widths.
5. UX issues:
   - Back-to-top behavior uses inline JS.
6. Copy issues:
   - Legal copy should be reviewed by counsel before launch.
7. Responsiveness issues:
   - Long lists/sections need mobile readability pass.
8. Accessibility issues:
   - Ensure list semantics are preserved and headings remain sequential.
9. SEO issues:
   - Browser title is correct; sitemap should use canonical slug only.
10. Performance concerns:
   - Low.
11. Recommended fixes:
   - Legal review, remove inline JS, keep e-mail spelling consistent.
12. Overall rating: 8.0 / 10.

### Terms and Conditions (`/terms-and-conditions`)

1. Purpose of the page: Define website/service terms for NOUS.
2. What works well:
   - Design matches privacy policy.
   - Copy is more serious and appropriate for a technology/AI company.
3. Bugs:
   - None observed in basic route test.
4. Design issues:
   - Same justified-text readability caution as privacy policy.
5. UX issues:
   - Back-to-top inline JS.
6. Copy issues:
   - Needs legal review before production.
7. Responsiveness issues:
   - Long legal paragraphs should be checked at 320-430px.
8. Accessibility issues:
   - Ensure headings/lists are semantic.
9. SEO issues:
   - Fix stale manual sitemap slugs.
10. Performance concerns:
   - Low.
11. Recommended fixes:
   - Legal review and sitemap cleanup.
12. Overall rating: 8.0 / 10.

### Admin (`/admin`)

1. Purpose of the page: Content/admin management.
2. What works well:
   - Page is marked noindex/nofollow.
   - Admin UI is moving toward the same visual system.
3. Bugs:
   - Local hydration/optimized dependency errors observed in dev.
   - Admin authorization appears insufficient at the API layer.
4. Design issues:
   - Admin should be minimal and functional, but state cards need clear hierarchy.
5. UX issues:
   - Unauthenticated and error states need explicit QA.
6. Copy issues:
   - Ensure every instance says `NOUS`, not `NOUS Technologies`.
7. Responsiveness issues:
   - Admin mobile behavior not fully tested.
8. Accessibility issues:
   - Browser heading audit found two H1s: "Admin" and "Content management".
9. SEO issues:
   - Good that page has noindex; bad that sitemap output includes `/admin/`.
10. Performance concerns:
   - Admin chunk is large.
11. Recommended fixes:
   - Fix admin auth, hydration, heading hierarchy, sitemap exclusion, and bundle splitting.
12. Overall rating: 4.5 / 10 until security is fixed.

### 404 (`/404` and unknown routes)

1. Purpose of the page: Gracefully handle missing routes.
2. What works well:
   - Unknown routes return 404.
   - Current design matches the site better than the old placeholder.
3. Bugs:
   - `/404` itself returns 404, which is acceptable.
4. Design issues:
   - Verify top/bottom spacing across mobile.
5. UX issues:
   - Should provide clear links to Home, Services, Blog, and Contact.
6. Copy issues:
   - Tone should stay calm and professional.
7. Responsiveness issues:
   - Needs quick check at 320px.
8. Accessibility issues:
   - Confirm buttons/links have clear names.
9. SEO issues:
   - Ensure unknown routes do not render a 200 soft 404.
10. Performance concerns:
   - Low.
11. Recommended fixes:
   - Keep status 404 and verify CTAs.
12. Overall rating: 7.6 / 10.

### Legacy Redirects (`/about-us`, `/contact-us`)

1. Purpose of the page: Redirect old URLs to new canonical routes.
2. What works well:
   - Both return 301.
3. Bugs:
   - They appear in generated sitemap.
4. Design issues:
   - Not applicable.
5. UX issues:
   - Redirect is fine.
6. Copy issues:
   - Not applicable.
7. Responsiveness issues:
   - Not applicable.
8. Accessibility issues:
   - Not applicable.
9. SEO issues:
   - Remove redirect URLs from sitemap.
10. Performance concerns:
   - Low.
11. Recommended fixes:
   - Sitemap filtering.
12. Overall rating: 8.0 / 10 as redirects, 5.0 / 10 for SEO hygiene.

### Disabled Pages (`/pricing`, `/products`)

1. Purpose of the page: Currently disabled/redirected to 404.
2. What works well:
   - Runtime returns 404.
3. Bugs:
   - Generated sitemap includes them.
4. Design issues:
   - Not applicable.
5. UX issues:
   - If users find these links externally, they get a 404.
6. Copy issues:
   - Not applicable.
7. Responsiveness issues:
   - Not applicable.
8. Accessibility issues:
   - Not applicable.
9. SEO issues:
   - Do not include disabled pages in sitemap.
10. Performance concerns:
   - Low.
11. Recommended fixes:
   - Exclude or remove route files until these pages exist.
12. Overall rating: 4.0 / 10 from launch hygiene perspective.

## Component-Level Audit

### Header / Navbar

- File path: `src/components/ui-main-components/Header.astro`
- Role: Site-wide fixed header, desktop nav, mobile menu.
- Issues found:
  - Closed mobile menu remains in accessibility tree.
  - Mobile menu duplicates controls and can expose hidden list items.
  - Event listeners can accumulate across Astro client-side navigation.
  - No skip link before header.
- Reusability concerns: Navigation links are duplicated between desktop and mobile markup.
- Accessibility concerns: Hidden menu focusability, focus order, and missing skip link.
- Design consistency concerns: Desktop visual style is strong; mobile menu behavior needs polish.
- Recommended improvements: Use data-driven nav list, manage `hidden/inert/aria-hidden`, add skip link, and centralize listener lifecycle.

### Footer

- File path: `src/components/ui-main-components/Footer.astro`
- Role: Site-wide footer, contact links, newsletter form, legal/nav links.
- Issues found:
  - Newsletter input missing label.
  - Footer buttons inherit `aria-label="Button"`.
  - Newsletter script logs personal data.
  - Footer service anchors are wrong.
- Reusability concerns: Many links/buttons are manually coded.
- Accessibility concerns: Labels and button names.
- Design consistency concerns: Footer alignment was recently improved, but should be rechecked after anchor/button fixes.
- Recommended improvements: Add labels, fix anchors, remove console logs, and normalize button accessible naming.

### ButtonVariant

- File path: `src/components/ui/Buttons/ButtonVariant.astro`
- Role: Generic Astro button/link component.
- Issues found:
  - Default `aria-label="Button"` overrides visible text.
  - No automatic `rel` for `_blank`.
- Reusability concerns: A single component can spread accessibility defects site-wide.
- Accessibility concerns: Incorrect names.
- Design consistency concerns: Visual system is mostly good.
- Recommended improvements: Conditional `aria-label`, automatic `rel`, and clear variants for text vs icon-only buttons.

### HeaderButton

- File path: `src/components/ui/Buttons/HeaderButton.astro`
- Role: Header CTA.
- Issues found:
  - Mobile/tablet icon label says "Send message" rather than the actual CTA.
  - Multiple responsive variants can appear in accessibility tree.
- Reusability concerns: Separate responsive links make accessibility harder.
- Accessibility concerns: CTA labels should match visible intent.
- Design consistency concerns: CTA visually catches attention, which is good.
- Recommended improvements: Use one accessible link with responsive visual children, or hide inactive variants from assistive tech.

### Inputs

- File path: `src/components/ui/Inputs.astro`
- Role: Reusable form input, textarea, checkbox, and radio.
- Issues found:
  - Autocomplete disabled globally.
  - Touch targets can be slightly under 44px.
  - Duplicate `radio` type union entry.
- Reusability concerns: Defaults affect all forms.
- Accessibility concerns: Autofill and target size.
- Design consistency concerns: Visual style is aligned.
- Recommended improvements: Use semantic autocomplete values and larger mobile hit areas.

### ContactPageForm / ContactForm

- File path: `src/components/ui/ContactPageForm.astro`, `src/components/ui/ContactForm.astro`
- Role: Contact intake forms.
- Issues found:
  - Native validation only.
  - Possible event-listener duplication with `astro:page-load`.
  - Home form and contact page form may differ in phone requirement.
- Reusability concerns: Two similar forms can drift.
- Accessibility concerns: Missing custom error/status handling.
- Design consistency concerns: The visual direction is good; option layout still needs strict mobile QA.
- Recommended improvements: Consolidate form logic, add accessible status/errors, and confirm field requirements are intentional.

### Hero

- File path: `src/components/ui-main-components/Hero.astro`, `src/components/ui/HeroNousLogo.astro`
- Role: Home first impression.
- Issues found:
  - Strong visual effect, but motion should respect reduced motion.
  - Long hero headline should be verified at all widths.
- Reusability concerns: Logo animation is specialized and should stay scoped.
- Accessibility concerns: Motion/reduced-motion.
- Design consistency concerns: Works well with current brand.
- Recommended improvements: Add static fallback and reduced-motion behavior.

### NousOffer

- File path: `src/components/ui-main-components/NousOffer.astro`
- Role: Home positioning and intro section.
- Issues found:
  - Uses second H1 on home.
- Reusability concerns: Title component should allow semantic heading level.
- Accessibility concerns: Heading hierarchy.
- Design consistency concerns: Good visual rhythm.
- Recommended improvements: Change section heading to H2.

### Service Cards / Info Cards

- File path: `src/components/react/InfoCard.tsx`, `src/components/react/ServiceTabs.tsx`
- Role: Home service/category cards.
- Issues found:
  - Mobile tab overflow/cramping.
  - Some text weight still feels heavy.
  - Reduced-motion support is partial but better than other components.
- Reusability concerns: Service definitions should remain data-driven.
- Accessibility concerns: Tab semantics should be verified.
- Design consistency concerns: Images are strong after regeneration.
- Recommended improvements: Improve mobile tab behavior and confirm ARIA tabs/listbox semantics.

### Timeline / Method Of Work / Globe

- File path: `src/components/react/TimeLineNous.tsx`, `src/components/react/timeLine/MethodOfWork.tsx`, `src/components/react/timeLine/Globe.tsx`
- Role: Explain deployment process and systems capability.
- Issues found:
  - Continuous animated globe/canvas cost.
  - Purple dots/globe palette already improved, but needs performance QA.
- Reusability concerns: Motion and copy are tightly coupled.
- Accessibility concerns: Reduced motion and canvas fallback.
- Design consistency concerns: Visual direction is differentiated.
- Recommended improvements: Pause offscreen, reduce fidelity on mobile, and add static fallback.

### Blog Content Renderer

- File path: `src/components/ui/BlogContentRenderer.astro`
- Role: Render article Markdown/HTML.
- Issues found:
  - Uses `marked.parse()` and `set:html` without sanitization.
  - Heading normalization is heuristic.
- Reusability concerns: Markdown rendering should be centralized and safe.
- Accessibility concerns: Generated heading order must be verified per article.
- Design consistency concerns: Article body style was improved but should stay readable.
- Recommended improvements: Use sanitized Markdown pipeline and a tested typography component.

### ContentPagesHero

- File path: `src/components/ui/ContentPagesHero.astro`
- Role: Shared top card for content pages.
- Issues found:
  - Much better than old left-aligned container design.
  - Buttons are no longer needed on legal/services/contact contexts.
- Reusability concerns: Component should support no-button variant cleanly.
- Accessibility concerns: Ensure one H1 per page.
- Design consistency concerns: Strong shared pattern.
- Recommended improvements: Keep as canonical page-header system and remove stale variants.

### AdminEntrypoint

- File path: `src/components/react/AdminEntrypoint.tsx`
- Role: React admin app.
- Issues found:
  - Large bundle.
  - Local hydration/optimized dep errors observed.
  - Needs stronger auth integration at API layer.
- Reusability concerns: Admin code should be isolated from public bundles.
- Accessibility concerns: Admin UI needs its own keyboard/form QA.
- Design consistency concerns: Recently redesigned, but not fully validated.
- Recommended improvements: Split editor imports, fix hydration, add admin smoke tests.

## Responsive QA

| Viewport | Key findings |
|---:|---|
| 320px | Home service tabs are cramped; mobile menu is present in accessibility tree while closed; all touch targets should be checked for 44px minimum. |
| 375px | Same mobile nav issue; reveal animations can place content far offscreen before animation; form spacing should be verified after every copy change. |
| 390px | Contact page generally works; home hidden menu issue confirmed; service category controls need polish. |
| 430px | Mobile layouts stack, but pill/tab labels can still feel tight. |
| 768px | Tablet layouts generally hold; scroll animation offsets still visible in some sections before animation. |
| 1024px | Layout is mostly stable; check card grids and top-card widths for consistent alignment. |
| 1280px | Desktop layouts are strong; legal/article width and H1 hierarchy need correction. |
| 1440px | Primary QA viewport. Home, services, contact, blog, legal, admin, and 404 render; duplicate H1/home and admin issues remain. |
| 1920px | Wide layouts should be checked for excessive line length and hero vertical rhythm; no fatal route issue observed. |

## Accessibility Audit

### High-priority accessibility issues

- Closed mobile nav is accessible while visually hidden.
- Footer newsletter input lacks a label.
- Generic button component creates `aria-label="Button"` names.
- Home and admin pages have duplicate H1s.
- Social/icon-only links need descriptive labels.
- Forms need accessible error and success states beyond native validation.
- Reduced-motion support is incomplete.
- No skip link is present before the fixed header.

### Practical WCAG mapping

| Area | Risk | Recommendation |
|---|---|---|
| Keyboard navigation | Hidden mobile menu can receive focus | Hide/inert closed menu and test tab order. |
| Labels | Newsletter and icon links weak | Add labels and accessible names. |
| Headings | Duplicate H1s | Use one H1 and ordered H2/H3 structure. |
| Motion | Continuous decorative animation | Respect `prefers-reduced-motion`. |
| Forms | Native validation only | Add `aria-invalid`, descriptions, and status regions. |
| Focus | Fixed header/no skip link | Add skip link to main content. |

## SEO Audit

### Major SEO issues

- Stale manual sitemap conflicts with generated sitemap.
- Generated sitemap includes disabled, admin, redirect, duplicate slash/no-slash, and blocked routes.
- Metadata/schema still use `Nous Technologies`, "web development", stale social handles, and old cyan theme colors.
- Organization schema includes unsupported award claims.
- Blog missing slugs redirect to `/blog` instead of returning a true 404.
- Home duplicate H1 weakens document hierarchy.
- `robots.txt` does not disallow `/admin` or `/api/admin`, and intentionally allows many AI crawlers. That may be fine strategically, but it should be an explicit business decision.

### Exact metadata recommendation

Suggested default title pattern:

```text
NOUS / AI Deployment Company
```

Suggested default description:

```text
NOUS helps organizations in Costa Rica and Latin America build, deploy, and adopt AI systems that turn intelligence into practical work.
```

Suggested organization name:

```text
NOUS
```

Suggested schema service positioning:

```text
AI transformation strategy, intelligence deployment, automation, AI-ready systems, training, integrations, and custom technology development.
```

## Performance Audit

### Performance risks

- Admin bundle is above 500 kB before gzip.
- Continuous canvas/star/globe animations can affect CPU/GPU, battery, and INP.
- Large and unused image assets remain in `public` and `src/assets`.
- Font strategy mixes Google-loaded Geist with local font artifacts and stale token names.
- `@astrojs/cloudflare` image SSRF advisory must be patched.
- Service card/background images should be confirmed as responsive and lazy-loaded where below the fold.

### Core Web Vitals risk assessment

| Metric | Risk | Notes |
|---|---|---|
| LCP | Medium | Hero/logo and background visuals need final asset sizing checks. |
| CLS | Low-Medium | Fixed dimensions are mostly present, but image/card loading should be verified. |
| INP | Medium | Continuous animations and duplicated event listeners can hurt interaction responsiveness. |
| TTFB | Medium | SSR blog pages depend on Turso/Clerk calls without fallback/caching. |

## Security and Privacy Audit

### Security risks

- Committed secrets block launch.
- Dependency advisories include critical/high issues.
- Admin authorization is not explicit enough.
- Contact form HTML injection risk.
- Public form endpoints lack rate limiting.
- Unsanitized Markdown/HTML rendering.
- CSP is broad and uses `unsafe-inline` / `unsafe-eval`.
- External link `rel` handling is inconsistent.
- Newsletter logs personal data.
- Contact/subscribe error paths may expose more detail than necessary.

### Privacy risks

- Newsletter stores IP address and user agent; the privacy policy should clearly cover this.
- Console logs expose e-mail addresses during newsletter submission.
- Form submissions need retention, routing, and bot-first-contact behavior clearly documented internally.

## Copywriting Audit

### Strong copy

- "AI is the next transformation. NOUS helps you lead it."
- "AI deployment for real organizations."
- "Building a more intelligent world."
- The general intelligence-on-tap/deployment framing is differentiated and strategically coherent.

### Copy issues and exact replacements

| Current copy | Issue | Suggested replacement |
|---|---|---|
| "Do not watch the AI shift from the sidelines." | "Shift" is less aligned with the selected "transformation" frame. | "Do not wait for the AI transformation to happen around you." |
| "Tell us what you are exploring." | Slightly asks the customer to self-diagnose. | "Start with what you want to improve." |
| "Nous Technologies" | Stale brand. | "NOUS" |
| "AI Consulting & Web Development" | Too generic and web-first. | "AI deployment and AI-ready systems" |
| "Leading AI consulting and web development..." | Old positioning. | "NOUS helps organizations build, deploy, and adopt practical AI systems." |
| "Thank you for contacting Nous Technologies" | Stale confirmation e-mail. | "Thank you for contacting NOUS" |
| "Experts in web development and AI solutions" | Generic and outdated. | "Field notes from the age of abundant intelligence." |

### Copy principles to keep

- Lead with AI transformation and deployment.
- Avoid hype words that sound like generic AI marketing.
- Talk about workflows, systems, adoption, training, and measurable operational capability.
- Use "NOUS" consistently.
- Keep CTAs consultative: "Talk to NOUS", "Find your AI opportunity", "Plan your first deployment".

## CTA/Button/Link Audit

| CTA / Link | Location | Expected | Actual | Status | Severity | Notes |
|---|---|---|---|---|---|---|
| Home nav | Header | Navigate to `/` | Works | Pass | Low | Label should be uppercase visually only if desired; semantic text can remain normal. |
| Services nav | Header | Navigate to `/services` | Works | Pass | Low | Footer anchor mismatch separate. |
| About nav | Header | Navigate to `/about` | Works | Pass | Low | `/about-us` redirects. |
| Blog nav | Header | Navigate to `/blog` | Works | Pass | Low | Blog data fallback still needed. |
| Talk to NOUS | Header | Navigate to `/contact` or contact form | Works visually | Warning | Medium | Ensure icon/compact variants have correct accessible name. |
| Hero primary CTA | Home | Lead to contact | Appears correct | Warning | Low | Keep copy consultative. |
| Explore CTA | Home | Lead to services/content | Appears correct | Warning | Low | Confirm anchor target. |
| Footer service links | Footer | Scroll to services section | Target mismatch | Fail | High | `/services#our-services` missing. |
| Footer hello e-mail | Footer/contact | Open mail client | Mailto present in contact cards; footer should be verified | Warning | Medium | Earlier user saw no action; ensure anchor is not blocked by overlay. |
| Footer WhatsApp | Footer/contact | Open WhatsApp link | Works in contact card | Pass | Low | Use `https://wa.me/50661865634`. |
| Newsletter submit | Footer | Validate, subscribe, show status | Empty validation works; valid not tested | Warning | Medium | Add label, status, abuse protection. |
| Contact form submit | Contact | Validate, send, show status | Empty validation works; valid not tested | Warning | High | Endpoint security issues block launch. |
| Privacy Policy | Footer | Navigate to legal page | Works | Pass | Low | Hover color fixed visually, but verify link states. |
| Terms and Conditions | Footer | Navigate to legal page | Works | Pass | Low | Hover color should remain on-brand. |
| Social icons | Home/footer/team | Open profiles with accessible labels | Accessible names weak/missing in at least one CTA section | Fail | High | Add `aria-label`. |
| Back to top | Legal pages | Scroll top | Likely works | Warning | Low | Inline JS and reduced motion. |

## Animation and Interaction Audit

| Area | Issue | Severity | Recommendation |
|---|---|---|---|
| Hero NOUS logo | Strong effect, but needs reduced-motion fallback | Medium | Render static logo when reduced motion is enabled. |
| Star background | Continuous canvas animation | Medium | Pause offscreen and reduce on mobile. |
| Shooting stars | Timeout cleanup missing | Medium | Clear pending timeouts on unmount. |
| Globe | High-sample continuous render | Medium | Lower fidelity on mobile, pause offscreen. |
| Scroll reveal | Large transforms and View Timeline compatibility | Medium | Default visible state plus `@supports` animations. |
| Buttons | Visual hover likely polished, but accessible names inconsistent | High | Fix component-level names. |
| Mobile menu | Hidden state is visual only | High | Manage `hidden`, `inert`, focus, and `aria-expanded`. |
| Form submit | Native validation only | Medium | Add custom accessible states. |

## Testing Matrix

| Area | Action | Expected | Actual | Status | Severity | Notes |
|---|---|---|---|---|---|---|
| Home route | Open `/` | 200, correct title | 200, `Home / NOUS` | Pass | Low | Motion warning in console. |
| Services route | Open `/services` | 200 | 200 | Pass | Low | Footer anchor mismatch. |
| About route | Open `/about` | 200 | 200 | Pass | Low | Team images need final QA. |
| Blog route | Open `/blog` | 200 | 200 | Pass | Medium | DB fallback risk remains. |
| Article route | Open article | 200 | 200 | Pass | Medium | Renderer sanitization risk. |
| Contact route | Open `/contact` | 200 | 200 | Pass | High | Endpoint hardening needed. |
| Privacy route | Open `/privacy-policy` | 200 | 200 | Pass | Low | Legal review needed. |
| Terms route | Open `/terms-and-conditions` | 200 | 200 | Pass | Low | Legal review needed. |
| Portfolio route | Open `/portfolio` | 200 | 200 | Pass | Low | Consider noindex until real work exists. |
| Admin route | Open `/admin` | Admin shell/noindex | 200, hydration/dev warnings | Warning | High | Auth and hydration need QA. |
| 404 route | Open unknown route | 404 | 404 | Pass | Low | Good. |
| Legacy about | Open `/about-us` | 301 to `/about` | 301 | Pass | Medium | Remove from sitemap. |
| Legacy contact | Open `/contact-us` | 301 to `/contact` | 301 | Pass | Medium | Remove from sitemap. |
| Pricing | Open `/pricing` | Not indexed if disabled | 404 but in sitemap | Fail | Medium | Exclude from sitemap. |
| Products | Open `/products` | Not indexed if disabled | 404 but in sitemap | Fail | Medium | Exclude from sitemap. |
| Desktop nav | Click nav links | Navigate correctly | Appears correct | Pass | Low | Full click automation not repeated for every link. |
| Mobile nav closed | Inspect tree before opening | Hidden from AT/focus | Visible in AT tree | Fail | High | Fix hidden/inert state. |
| Contact empty form | Submit empty | Required validation | Browser validation triggers | Pass | Medium | Add custom accessible errors. |
| Contact valid form | Submit valid payload | Send e-mail and success | Not tested | Not tested | High | Avoided real e-mail send. |
| Newsletter empty form | Submit empty | Required validation | Browser validation triggers | Pass | Medium | Missing label. |
| Newsletter valid form | Submit valid e-mail | Subscribe and success | Not tested | Not tested | High | Avoided DB write. |
| Footer legal links | Hover/click | On-brand hover, navigate | Link routes work | Warning | Low | Hover color should be visually confirmed after CSS changes. |
| Social icon links | Inspect accessible names | Descriptive names | Weak/missing names found | Fail | High | Add labels. |
| Build | `pnpm build` | Clean pass | Pass with warnings | Warning | Medium | Missing content dir and admin chunk. |
| Audit | `pnpm audit --prod` | No critical/high vulns | 86 vulnerabilities | Fail | Critical | Must fix. |
| Lint | `pnpm lint` | Pass | No script | Fail | High | Add lint gate. |
| Typecheck | `pnpm typecheck` | Pass | No script | Fail | High | Add typecheck gate. |
| Tests | `pnpm test` | Pass | No script | Fail | High | Add test gate. |

## Recommended Fix Plan

### 1. Must fix before launch

1. Rotate and remove all committed secrets from `wrangler.toml`.
2. Upgrade critical/high security dependencies and re-run `pnpm audit --prod`.
3. Restore explicit deny-by-default admin authorization.
4. Fix contact e-mail HTML injection by using escaped values.
5. Add abuse protection to contact and newsletter endpoints.
6. Remove admin, disabled, redirected, and duplicate URLs from sitemap output.
7. Remove stale manual `public/sitemap.xml` or make it canonical.
8. Fix mobile menu hidden/focus/accessibility behavior.
9. Fix footer newsletter label and button accessible names.
10. Fix duplicate H1s on home and admin.

### 2. Should fix before launch

11. Add lint, typecheck, and test scripts.
12. Add basic Playwright route and form smoke tests.
13. Add accessible form error/success states.
14. Update all stale metadata/schema from `Nous Technologies` to `NOUS`.
15. Remove unsupported award claims from Organization schema.
16. Fix footer service anchor mismatch.
17. Add `rel="noopener noreferrer"` for external `_blank` links.
18. Add reduced-motion support across decorative animations.
19. Add graceful blog DB failure handling.
20. Fix admin hydration/dev dependency instability.

### 3. Can fix after launch

1. Split/lazy-load admin editor bundle.
2. Clean unused assets and stale local font artifacts.
3. Add article structured data.
4. Improve mobile service tab UI.
5. Add caching for blog author metadata.
6. Replace inline legal-page back-to-top JS.
7. Improve autocomplete and mobile touch target defaults.

### 4. Nice-to-have polish

1. Final desktop/mobile typography pass on long-form article and legal copy.
2. Final portrait crop QA for all team cards.
3. Add richer trust signals once real case studies exist.
4. Add content governance checklist for future blog/admin updates.

## Top 20 Fixes Checklist

1. Rotate every secret currently committed in `wrangler.toml`.
2. Remove secrets from the repo and move them to Cloudflare secrets/env.
3. Upgrade vulnerable dependencies until no critical/high production advisories remain.
4. Re-add explicit admin authorization beyond Clerk token verification.
5. Sanitize or escape all contact form HTML output.
6. Add rate limiting and Turnstile/honeypot protection to public forms.
7. Remove stale `public/sitemap.xml` or align it with generated canonical sitemap.
8. Exclude `/admin`, `/pricing`, `/products`, `/about-us`, and `/contact-us` from sitemap.
9. Fix footer `/services#our-services` links.
10. Hide/inert the closed mobile navigation.
11. Remove default `aria-label="Button"` from the generic button component.
12. Add a label to the footer newsletter e-mail input.
13. Add descriptive labels to social/icon links.
14. Change secondary home/admin H1s to H2s.
15. Add lint, typecheck, and smoke-test scripts.
16. Add accessible form error and success states.
17. Update all metadata/schema/copy from `Nous Technologies` to `NOUS`.
18. Add reduced-motion fallbacks for logo, stars, scroll reveals, and globe.
19. Add blog DB error fallback and true 404 for missing articles.
20. Clean repo state and commit only intentional launch files.

## Final Launch Verdict

Not ready -- critical blockers.

The public-facing design and copy are substantially stronger than the earlier version, and the site now has a much clearer AI transformation/deployment position. However, the current working tree should not launch as-is because security and production hygiene issues are severe: committed secrets, vulnerable dependencies, incomplete admin authorization, exposed form endpoints, sitemap/indexing drift, and accessibility defects all need to be fixed first.

After the critical and high-priority items are resolved, this can become launchable quickly. The design foundation is good; the remaining launch risk is mostly in security, metadata/indexing, accessibility, and release discipline.
