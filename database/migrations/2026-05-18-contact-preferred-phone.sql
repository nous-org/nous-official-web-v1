-- Allows "Phone Call" as a preferred contact method while preserving existing leads.

PRAGMA foreign_keys = OFF;

CREATE TABLE IF NOT EXISTS contact_submissions_new (
  id TEXT PRIMARY KEY,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  submitted_at_utc TEXT NOT NULL,
  submitted_at_cr TEXT NOT NULL,
  submitted_date_cr TEXT NOT NULL,
  submitted_hour_cr INTEGER NOT NULL CHECK (submitted_hour_cr BETWEEN 0 AND 23),
  locale TEXT NOT NULL CHECK (locale IN ('en', 'es')),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  preferred_contact TEXT NOT NULL CHECK (preferred_contact IN ('email', 'phone', 'whatsapp')),
  interests_json TEXT NOT NULL,
  interests_text TEXT NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  source_path TEXT,
  ip_address TEXT,
  ip_country TEXT,
  user_agent TEXT,
  cf_ray TEXT,
  email_delivery_status TEXT NOT NULL DEFAULT 'pending'
    CHECK (email_delivery_status IN ('pending', 'sent', 'failed', 'skipped')),
  internal_email_id TEXT,
  confirmation_email_id TEXT,
  email_delivery_error TEXT
);

INSERT INTO contact_submissions_new (
  id,
  created_at,
  updated_at,
  submitted_at_utc,
  submitted_at_cr,
  submitted_date_cr,
  submitted_hour_cr,
  locale,
  name,
  email,
  phone,
  preferred_contact,
  interests_json,
  interests_text,
  subject,
  message,
  source_path,
  ip_address,
  ip_country,
  user_agent,
  cf_ray,
  email_delivery_status,
  internal_email_id,
  confirmation_email_id,
  email_delivery_error
)
SELECT
  id,
  created_at,
  updated_at,
  submitted_at_utc,
  submitted_at_cr,
  submitted_date_cr,
  submitted_hour_cr,
  locale,
  name,
  email,
  phone,
  preferred_contact,
  interests_json,
  interests_text,
  subject,
  message,
  source_path,
  ip_address,
  ip_country,
  user_agent,
  cf_ray,
  email_delivery_status,
  internal_email_id,
  confirmation_email_id,
  email_delivery_error
FROM contact_submissions;

DROP TABLE contact_submissions;
ALTER TABLE contact_submissions_new RENAME TO contact_submissions;

CREATE INDEX IF NOT EXISTS idx_contact_submissions_created_at
  ON contact_submissions(created_at);

CREATE INDEX IF NOT EXISTS idx_contact_submissions_submitted_date_hour
  ON contact_submissions(submitted_date_cr, submitted_hour_cr);

CREATE INDEX IF NOT EXISTS idx_contact_submissions_email
  ON contact_submissions(email);

CREATE INDEX IF NOT EXISTS idx_contact_submissions_ip_country
  ON contact_submissions(ip_country);

CREATE INDEX IF NOT EXISTS idx_contact_submissions_delivery_status
  ON contact_submissions(email_delivery_status);

PRAGMA foreign_keys = ON;
