# Contributing

This repository is the production source for `nous.cr`. Treat changes as production work: keep them scoped, validated, and easy to review.

## Workflow

1. Branch from `main`.
2. Make the smallest coherent change that solves the problem.
3. Run local validation.
4. Open a pull request into `main`.
5. Wait for GitHub Actions and Cloudflare checks.
6. Merge only after the deployment and code-quality gates pass.

Recommended branch naming:

```text
feature/<short-description>
fix/<short-description>
content/<short-description>
seo/<short-description>
docs/<short-description>
```

## Local Gate

Run this before requesting review:

```bash
pnpm validate
```

For deployment-sensitive changes, also run:

```bash
pnpm exec wrangler deploy -c dist/server/wrangler.json --dry-run --keep-vars
```

## Pull Request Checklist

- The PR explains what changed and why.
- `pnpm validate` passes locally.
- New or changed redirects are covered in `public/_redirects`, `src/middleware.ts`, and tests where relevant.
- New indexable pages have title, meta description, canonical URL, Open Graph image, and appropriate schema.
- New Spanish pages have the equivalent `/es` route and language metadata.
- No generated folders or local reports are committed.
- No secrets, API tokens, private keys, or live credentials are committed.
- Form, admin, or API changes include validation/security notes.

## Coding Standards

- Prefer Astro for static and server-rendered markup.
- Use React islands only where interaction requires client state.
- Keep accessibility semantics explicit: real links for navigation, labels for inputs, and meaningful alt text for content images.
- Keep page metadata close to the page template unless there is a shared SEO component pattern.
- Keep route changes compatible with the SEO strategy in `docs/SEO_AND_CONTENT.md`.
- Keep secrets and environment-specific values outside the repo.

## Content Standards

- Position NOUS as an AI transformation agency, not a generic web-development shop.
- Write for executive and operational buyers in Costa Rica and LatAm.
- Prefer concrete service language: AI strategy, automation, intelligent systems, deployment, adoption, and operational leverage.
- Avoid vague claims that are not supported by content, examples, or proof.

## Release Notes

The deploy workflow runs automatically on merges to `main`. After merge, verify:

- `https://nous.cr/`
- `https://nous.cr/es`
- `https://nous.cr/services`
- `https://nous.cr/sitemap-index.xml`
- key redirects such as `/pricing`, `/products`, `/about-us`, and `/contact-us`
- contact/newsletter validation behavior when affected
