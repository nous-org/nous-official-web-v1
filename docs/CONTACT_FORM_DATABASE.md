# Contact Form Database

This guide sets up Turso storage for validated `POST /api/contact` submissions.

## What Gets Stored

The `contact_submissions` table stores:

- submitted name, e-mail, phone, preferred contact method (`email`, `phone`, or `whatsapp`), subject, and message
- selected interests as JSON and readable text
- UTC submission timestamp plus Costa Rica local timestamp, date, and hour
- locale, source path, limited IP address, Cloudflare country code when available, Cloudflare ray ID, and user agent metadata
- Resend delivery status and e-mail IDs when available

Do not expose Turso credentials in the browser, forms, checked-in files, screenshots, or chat messages. Configure them only as local environment values or Cloudflare secrets.

## First-Time Turso Setup

Install and log in to the Turso CLI:

```bash
brew tap libsql/sqld
brew install tursodatabase/tap/turso
turso auth login
```

Create a dedicated database for contact leads:

```bash
turso db create nous-contact-submissions --wait
```

Apply the schema from this repo:

```bash
turso db shell nous-contact-submissions < database/contact-submissions.sql
```

For an existing contact database created before the request-metadata fields were added, apply the migration:

```bash
turso db shell nous-contact-submissions < database/migrations/2026-05-18-contact-submission-request-metadata.sql
```

For an existing contact database created before phone calls were accepted as a preferred contact method, apply:

```bash
turso db shell nous-contact-submissions < database/migrations/2026-05-18-contact-preferred-phone.sql
```

Get the database URL:

```bash
turso db show nous-contact-submissions --url
```

Create a database-scoped token for the Worker:

```bash
turso db tokens create nous-contact-submissions \
  -p contact_submissions:data_read,data_add,data_update
```

## Cloudflare Configuration

Store the database URL and token as Worker secrets:

```bash
pnpm exec wrangler secret put TURSO_CONTACT_URL
pnpm exec wrangler secret put TURSO_CONTACT_TOKEN
```

For local testing, put the same names in an uncommitted `.env` file:

```bash
TURSO_CONTACT_URL="libsql://..."
TURSO_CONTACT_TOKEN="..."
```

## Verify Captured Submissions

After submitting the form, inspect recent leads:

```bash
turso db shell nous-contact-submissions \
  "SELECT submitted_at_cr, submitted_hour_cr, ip_address, ip_country, name, email, subject, email_delivery_status FROM contact_submissions ORDER BY submitted_at_utc DESC LIMIT 10;"
```

Delivery status values:

- `pending`: saved before e-mail delivery finished
- `sent`: internal and confirmation e-mails were sent
- `failed`: e-mail delivery or production e-mail configuration failed
- `skipped`: local dry-run path without `RESEND_API_KEY`

## Runtime Behavior

The database write happens only after server-side validation and rate limiting pass. If Turso is not configured, the existing contact e-mail behavior continues. If Turso is configured but temporarily fails, the endpoint logs the database error and still attempts Resend delivery so the lead can still reach the NOUS inbox.
