# Operations Runbook

This runbook covers local validation, deployment, smoke testing, and recovery steps for `nous.cr`.

## Production

| Item | Value |
|---|---|
| Production URL | `https://nous.cr` |
| Canonical host | `nous.cr` |
| Redirected host | `www.nous.cr` |
| Cloudflare Worker | `nous-cr` |
| Deploy branch | `main` |
| Deploy command | `pnpm exec wrangler deploy -c dist/server/wrangler.json --keep-vars` |

## Local Validation

Run the full local gate:

```bash
pnpm validate
```

Run a Cloudflare dry run:

```bash
pnpm build
pnpm exec wrangler deploy -c dist/server/wrangler.json --dry-run --keep-vars
```

Run local production preview:

```bash
pnpm preview
```

## Deployment

Deployments normally happen through GitHub Actions:

1. Merge a PR into `main`.
2. GitHub Actions installs dependencies and builds the site.
3. The generated Worker config at `dist/server/wrangler.json` is deployed.
4. `--keep-vars` preserves dashboard-managed Cloudflare variables and secrets.

Manual deploy, when needed:

```bash
pnpm build
pnpm exec wrangler deploy -c dist/server/wrangler.json --keep-vars
```

Use manual deploys sparingly. After any manual deploy, make sure the exact source state is committed and pushed.

## Required Secrets

Cloudflare/GitHub/provider secrets must include:

- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`
- `RESEND_API_KEY`
- `TURSO_DATABASE_URL`
- `TURSO_AUTH_TOKEN`
- `TURSO_NEWSLETTER_URL`
- `TURSO_NEWSLETTER_TOKEN`
- `CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`
- at least one explicit Clerk admin authorization policy

Do not store those values in committed files.

## Post-Deploy Smoke Test

Check representative public routes:

```bash
curl -I https://nous.cr/
curl -I https://nous.cr/es
curl -I https://nous.cr/services
curl -I https://nous.cr/sitemap-index.xml
curl -I https://nous.cr/robots.txt
```

Check redirects:

```bash
curl -I https://www.nous.cr/
curl -I http://nous.cr/
curl -I https://nous.cr/services/
curl -I https://nous.cr/about-us
curl -I https://nous.cr/contact-us
curl -I https://nous.cr/pricing
curl -I https://nous.cr/products
```

Expected behavior:

- canonical pages return `200`
- `www` redirects to `https://nous.cr`
- HTTP redirects to HTTPS
- trailing slashes redirect to slashless URLs
- retired routes redirect to current canonical routes
- missing pages return `404`

Check form validation without sending real leads:

```bash
curl -i -X POST https://nous.cr/api/contact \
  -H 'content-type: application/json' \
  --data '{}'

curl -i -X POST https://nous.cr/api/subscribe \
  -H 'content-type: application/json' \
  --data '{}'
```

Expected result: `400` validation responses.

Check unauthenticated admin API behavior:

```bash
curl -i https://nous.cr/api/admin/posts
```

Expected result: `401` or `403`, depending on auth configuration.

## Rollback

If a deployment causes production issues:

1. Identify the last known good deployment in Cloudflare or GitHub Actions.
2. Prefer reverting the offending commit and merging a fix through `main`.
3. For urgent Worker rollback, use Cloudflare's deployment/version rollback controls or Wrangler rollback if available for the current service.
4. After rollback, run the smoke test above.
5. Document the incident cause and follow-up fix in the PR or internal operations notes.

## Common Issues

### Admin returns unavailable

Likely cause: Clerk env vars or admin authorization policy are missing. Confirm `CLERK_SECRET_KEY` and at least one admin policy variable are configured.

### Contact form returns service unavailable

Likely cause: `RESEND_API_KEY` or recipient config is missing, or Resend is unavailable. Confirm Cloudflare secrets and Resend account state.

### Sitemap contains unexpected pages

Check `astro.config.mjs` sitemap filter and route additions. Retired, private, and noindex routes should not appear in the generated sitemap.

### Redirect behavior differs between preview and production

Check both `src/middleware.ts` and `public/_redirects`. Middleware handles Worker runtime behavior; `_redirects` supports Cloudflare-compatible static redirect parsing in preview/deploy contexts.
