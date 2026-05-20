-- Adds Hermes/n8n workflow tracking for contact-form lead qualification.

ALTER TABLE contact_submissions ADD COLUMN hermes_workflow_status TEXT NOT NULL DEFAULT 'not_configured'
  CHECK (hermes_workflow_status IN (
    'not_configured',
    'queued',
    'webhook_failed',
    'in_progress',
    'awaiting_reply',
    'completed',
    'failed',
    'manual_review'
  ));
ALTER TABLE contact_submissions ADD COLUMN hermes_channel TEXT
  CHECK (hermes_channel IN ('email', 'phone', 'whatsapp'));
ALTER TABLE contact_submissions ADD COLUMN hermes_webhook_delivery_id TEXT;
ALTER TABLE contact_submissions ADD COLUMN hermes_workflow_run_id TEXT;
ALTER TABLE contact_submissions ADD COLUMN hermes_summary TEXT;
ALTER TABLE contact_submissions ADD COLUMN hermes_next_step TEXT;
ALTER TABLE contact_submissions ADD COLUMN hermes_transcript TEXT;
ALTER TABLE contact_submissions ADD COLUMN hermes_error TEXT;
ALTER TABLE contact_submissions ADD COLUMN hermes_last_event_at TEXT;

CREATE INDEX IF NOT EXISTS idx_contact_submissions_hermes_status
  ON contact_submissions(hermes_workflow_status);

CREATE INDEX IF NOT EXISTS idx_contact_submissions_hermes_channel
  ON contact_submissions(hermes_channel);
