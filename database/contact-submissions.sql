-- Contact form submissions table for the NOUS website.
-- Apply this to the Turso database used by TURSO_CONTACT_URL.

CREATE TABLE IF NOT EXISTS contact_submissions (
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
  preferred_contact TEXT NOT NULL CHECK (preferred_contact IN ('email', 'whatsapp')),
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
