-- Adds reporting-friendly submission time and request metadata columns.
-- Safe for the initial empty Turso contact database created for NOUS leads.

ALTER TABLE contact_submissions ADD COLUMN submitted_at_utc TEXT;
ALTER TABLE contact_submissions ADD COLUMN submitted_at_cr TEXT;
ALTER TABLE contact_submissions ADD COLUMN submitted_date_cr TEXT;
ALTER TABLE contact_submissions ADD COLUMN submitted_hour_cr INTEGER;
ALTER TABLE contact_submissions ADD COLUMN ip_country TEXT;
ALTER TABLE contact_submissions ADD COLUMN cf_ray TEXT;

UPDATE contact_submissions
SET
  submitted_at_utc = COALESCE(submitted_at_utc, created_at),
  submitted_at_cr = COALESCE(submitted_at_cr, datetime(created_at, '-6 hours')),
  submitted_date_cr = COALESCE(submitted_date_cr, date(created_at, '-6 hours')),
  submitted_hour_cr = COALESCE(submitted_hour_cr, CAST(strftime('%H', datetime(created_at, '-6 hours')) AS INTEGER));

CREATE INDEX IF NOT EXISTS idx_contact_submissions_submitted_date_hour
  ON contact_submissions(submitted_date_cr, submitted_hour_cr);

CREATE INDEX IF NOT EXISTS idx_contact_submissions_ip_country
  ON contact_submissions(ip_country);
