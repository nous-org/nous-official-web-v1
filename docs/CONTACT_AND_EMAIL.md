# Contact And E-mail Workflow

This document covers the public contact form, validation behavior, and Resend e-mail templates owned by this repo.

## User Flow

The public contact forms live on the homepage CTA and the dedicated contact pages:

- `/contact`
- `/es/contact`
- homepage contact section

Both form variants post to `POST /api/contact`. The endpoint validates the payload, applies abuse controls, and sends two transactional e-mails:

- an internal notification to the NOUS team
- a confirmation e-mail to the person who submitted the form

The submitted `locale` controls API response copy and e-mail copy. English submissions use English subjects and body text; Spanish submissions use Spanish subjects and body text.

## Source Ownership

| Surface | File |
|---|---|
| Homepage form | `src/components/ui/ContactForm.astro` |
| Contact page form | `src/components/ui/ContactPageForm.astro` |
| Client validation and error states | `src/components/ui/ContactFormClientScript.astro` |
| Shared input error markup | `src/components/ui/Inputs.astro` |
| Server validation and e-mail delivery | `src/pages/api/contact.ts` |
| Contact submission storage helper | `src/lib/contact-submissions.ts` |
| Contact submission Turso schema | `database/contact-submissions.sql` |
| Email logo asset | `public/images/nous-email-logo.png` |
| Static regression tests | `tests/static-qa.test.mjs` |

## Validation Standard

Client-side validation exists for speed and clarity, but server-side validation is authoritative.

Required fields:

- name
- e-mail
- phone number
- preferred contact method
- at least one interest
- subject
- message

The message must be at least 10 characters. Invalid fields should be shown inline in the form and the form should not submit until the visible errors are resolved.

The API should return structured `400` validation errors for invalid payloads and safe, user-readable messages for delivery failures.

## Contact Submission Database

When `TURSO_CONTACT_URL` and `TURSO_CONTACT_TOKEN` are configured, validated contact submissions are saved to the `contact_submissions` table before Resend delivery is attempted. The table stores the submitted contact fields, selected interests as JSON and readable text, UTC and Costa Rica submission timestamps, the source path, limited IP/user-agent metadata, Cloudflare country/ray metadata when available, and the final e-mail delivery status.

The database write is intentionally server-side only. The browser never receives Turso credentials, and missing Turso contact configuration does not break local development or the existing e-mail flow.

Use `database/contact-submissions.sql` to create or update the Turso table. See [CONTACT_FORM_DATABASE.md](CONTACT_FORM_DATABASE.md) for first-time Turso setup, Cloudflare secret configuration, and query examples.

## Abuse And Security Controls

The contact endpoint must keep:

- Zod validation on every accepted field
- honeypot handling for bot submissions
- IP and e-mail rate limiting
- escaped user-provided values before rendering HTML e-mails
- no secret leakage in response bodies

User-submitted e-mail addresses may be used as `replyTo`, but the sender identity should remain the authenticated NOUS sending domain.

## Delivery Behavior

Resend delivery is controlled by runtime configuration:

| Variable | Purpose | Secret? |
|---|---|---|
| `RESEND_API_KEY` | Authenticates Resend delivery | Yes |
| `CONTACT_RECIPIENT_EMAIL` | Internal recipient for contact submissions | No |
| `SUPPORT_EMAIL` | Support identity used in public templates | No |
| `TURSO_CONTACT_URL` | Contact submissions database URL | Yes |
| `TURSO_CONTACT_TOKEN` | Contact submissions database token | Yes |

In local development, missing `RESEND_API_KEY` returns a dry-run success and sends no e-mail. In production, missing `RESEND_API_KEY` returns the contact-service-unavailable message so visitors are directed to e-mail NOUS directly.

## E-mail Templates

The HTML templates are currently defined inside `src/pages/api/contact.ts` so copy, escaping, and delivery stay in one server-side boundary.

### Customer Confirmation

Purpose: confirm that the submission arrived and set expectations for the first follow-up.

Current standard:

- English subject: `Thank you for contacting NOUS!`
- Spanish subject: `¡Gracias por contactar a NOUS!`
- from: `NOUS <noreply@nous.cr>`
- includes the NOUS logo and the localized tagline
- uses the same minimal visual system as the internal notification
- explains that Hermes will help establish first contact
- includes the submitter's e-mail and phone number
- includes NOUS contact details in the footer
- links to `/services` for English submissions and `/es/services` for Spanish submissions

### Internal Notification

Purpose: give the NOUS team the full submission context in a readable format.

Current standard:

- English subject: `New Contact Form Submission`
- Spanish subject: `Nueva solicitud del formulario de contacto`
- from: `NOUS <noreply@nous.cr>`
- reply-to: the submitter's e-mail address
- includes contact details, selected interests, message, and submission time
- localizes selected interest labels and submission date formatting
- preserves the submitter's message spacing where practical

## Copy And Design Rules

Contact e-mails should feel like NOUS: minimal, precise, and useful. Avoid generic SaaS colors, heavy decoration, and unsupported claims.

When editing templates:

- keep the HTML compatible with common e-mail clients
- prefer inline styles over external CSS
- do not rely on scripts, web fonts, or client-side rendering
- keep user-provided variables visually clear but not over-emphasized
- keep English and Spanish copy in sync when changing subject lines, headings, CTA labels, or body copy
- keep list items as HTML bullets, not plain hyphen lines
- keep footer contact information centered in the current design

## Smoke Testing

Validation smoke test that should not send e-mail:

```bash
curl -i -X POST https://nous.cr/api/contact \
  -H 'content-type: application/json' \
  --data '{}'
```

Expected result: `400` with validation errors.

Targeted invalid-message smoke test that should not send e-mail:

```bash
curl -i -X POST https://nous.cr/api/contact \
  -H 'content-type: application/json' \
  --data '{"name":"Codex Smoke","email":"codex-smoke@example.com","phone":"+506 8888-8888","preferredContact":"email","interests":["ai-strategy"],"subject":"Smoke test","message":"short","locale":"en"}'
```

Expected result: `400` with a message-length validation error.

Delivery smoke tests send real e-mail. Use them only when intentionally validating Resend delivery, sender identity, template rendering, and inbox behavior.

After template changes, also verify the public logo asset:

```bash
curl -I https://nous.cr/images/nous-email-logo.png
```

Expected result: `200`.

## Change Checklist

When changing the contact form or e-mails:

- update this document if the workflow, copy standard, or runtime behavior changes
- update `tests/static-qa.test.mjs` for approved subjects, sender names, template copy, and critical validation guarantees
- run `pnpm test`
- run the production smoke tests after deploy when the API behavior or e-mail delivery path changed
