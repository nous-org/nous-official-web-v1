# Security Policy

## Supported Branch

Security fixes are applied to `main`, which is the production deployment branch for `nous.cr`.

## Reporting A Vulnerability

If you discover a vulnerability, do not open a public issue with exploit details. Contact the NOUS team through the internal operations channel or send a private report to the repository maintainers.

Please include:

- affected URL, route, or file
- reproduction steps
- expected impact
- screenshots, request/response examples, or logs if available
- whether the issue is already exploitable in production

## Secret Handling

Do not commit secrets. This includes:

- API keys
- auth tokens
- JWT secrets
- database URLs with credentials
- Clerk or author-profile lookup secret keys
- Resend keys
- Cloudflare tokens
- local `.env` files

Production secrets belong in Cloudflare, GitHub Actions secrets, or the relevant provider dashboard. If a secret is accidentally committed, rotate it immediately and treat it as compromised.

## Admin Surface

This repository should not expose in-repo publishing routes or admin APIs. Blog publishing is handled by the separate `admin.nous.cr` CMS. If an admin route is needed, it should live in that app, not in this website repository.

## Public Form Endpoints

The contact and newsletter endpoints must keep:

- structured input validation
- safe error responses
- honeypot or abuse controls where applicable
- escaped or sanitized e-mail rendering
- no secret leakage in responses
- authenticated NOUS sender domains for transactional e-mail, with user e-mail addresses limited to reply-to behavior when needed

## Release Gate

Before merging production changes:

```bash
pnpm validate
```

For deployment-sensitive changes:

```bash
pnpm build
pnpm exec wrangler deploy -c dist/server/wrangler.json --dry-run --keep-vars
```

Do not bypass failing security, dependency, or deployment checks without documenting the risk and owner.
