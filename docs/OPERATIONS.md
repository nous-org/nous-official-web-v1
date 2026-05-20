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
- `TURSO_CONTACT_URL`
- `TURSO_CONTACT_TOKEN`
- `TURSO_NEWSLETTER_URL`
- `TURSO_NEWSLETTER_TOKEN`
- `HERMES_LEAD_WEBHOOK_URL`
- `HERMES_LEAD_WEBHOOK_SECRET`
- `HERMES_WORKFLOW_API_TOKEN`
- `CLERK_SECRET_KEY` if blog author profiles should resolve from Clerk user IDs

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
curl -I https://nous.cr/admin
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
- `/admin` redirects to `https://admin.nous.cr`
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

For a targeted contact validation check without sending e-mail:

```bash
curl -i -X POST https://nous.cr/api/contact \
  -H 'content-type: application/json' \
  --data '{"name":"Codex Smoke","email":"codex-smoke@example.com","phone":"+506 8888-8888","preferredContact":"email","interests":["ai-strategy"],"subject":"Smoke test","message":"short","locale":"en"}'
```

Expected result: `400` with a message-length validation error.

After contact e-mail template changes, verify the public logo asset used by inboxes:

```bash
curl -I https://nous.cr/images/nous-email-logo.png
```

Expected result: `200`.

Do not run a valid contact delivery smoke test unless the goal is to send real e-mail. A valid production submission should send both the internal NOUS notification and the external confirmation e-mail through Resend.

## Rollback

If a deployment causes production issues:

1. Identify the last known good deployment in Cloudflare or GitHub Actions.
2. Prefer reverting the offending commit and merging a fix through `main`.
3. For urgent Worker rollback, use Cloudflare's deployment/version rollback controls or Wrangler rollback if available for the current service.
4. After rollback, run the smoke test above.
5. Document the incident cause and follow-up fix in the PR or internal operations notes.

## Common Issues

### Blog author profile is not enriched

Likely cause: `CLERK_SECRET_KEY` is missing or the Turso row does not use a Clerk-backed author ID. The public blog should still render with the default NOUS author fallback.

### Contact form returns service unavailable

Likely cause: `RESEND_API_KEY` or recipient config is missing, or Resend is unavailable. Confirm Cloudflare secrets and Resend account state.

### Contact e-mail is not received

Confirm `RESEND_API_KEY` is configured as a Cloudflare secret, `CONTACT_RECIPIENT_EMAIL` is configured as a Worker variable, the `noreply@nous.cr` sending domain is healthy in Resend, and the recipient inbox did not classify the message as spam. Then check Cloudflare Worker logs for Resend API errors or contact rate-limit responses.

### Sitemap contains unexpected pages

Check `astro.config.mjs` sitemap filter and route additions. Retired, private, and noindex routes should not appear in the generated sitemap.

### Redirect behavior differs between preview and production

Check both `src/middleware.ts` and `public/_redirects`. Middleware handles Worker runtime behavior; `_redirects` supports Cloudflare-compatible static redirect parsing in preview/deploy contexts.
