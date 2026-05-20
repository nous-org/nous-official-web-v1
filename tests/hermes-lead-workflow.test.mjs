import assert from 'node:assert/strict';
import { createHmac } from 'node:crypto';
import test from 'node:test';
import {
  buildHermesLeadWebhookPayload,
  createHermesWebhookSignature,
  isHermesLeadWebhookConfigured,
} from '../src/lib/hermes-lead-workflow.ts';

test('Hermes lead webhook config requires URL and secret', () => {
  assert.equal(isHermesLeadWebhookConfigured({}), false);
  assert.equal(isHermesLeadWebhookConfigured({ HERMES_LEAD_WEBHOOK_URL: 'https://n8n.example/webhook' }), false);
  assert.equal(isHermesLeadWebhookConfigured({ HERMES_LEAD_WEBHOOK_SECRET: 'secret' }), false);
  assert.equal(
    isHermesLeadWebhookConfigured({
      HERMES_LEAD_WEBHOOK_URL: 'https://n8n.example/webhook',
      HERMES_LEAD_WEBHOOK_SECRET: 'secret',
    }),
    true,
  );
});

test('Hermes webhook signature matches HMAC SHA-256 contract', async () => {
  const timestamp = '2026-05-19T20:00:00.000Z';
  const body = JSON.stringify({ event: 'contact.submitted', lead: { submissionId: 'lead_123' } });
  const expected = `sha256=${createHmac('sha256', 'shared-secret')
    .update(`${timestamp}.${body}`)
    .digest('hex')}`;

  assert.equal(await createHermesWebhookSignature('shared-secret', timestamp, body), expected);
});

test('Hermes lead payload carries contact context and requested channel', () => {
  const payload = buildHermesLeadWebhookPayload({
    submissionId: 'lead_123',
    deliveryId: 'delivery_123',
    createdAt: '2026-05-19T20:00:00.000Z',
    submittedAtUtc: '2026-05-19T19:59:00.000Z',
    submittedAtCr: '2026-05-19 13:59:00',
    submittedDateCr: '2026-05-19',
    submittedHourCr: 13,
    locale: 'en',
    name: 'Codex Smoke',
    email: 'codex@example.com',
    phone: '+506 8888-8888',
    preferredContact: 'whatsapp',
    interests: ['ai-strategy'],
    interestsText: 'AI strategy',
    subject: 'AI discovery',
    message: 'We want help understanding our AI opportunity.',
    sourcePath: '/contact?utm_source=test',
    ipCountry: 'CR',
    cfRay: 'abc123-SJO',
    userAgent: 'node-test',
  });

  assert.equal(payload.event, 'contact.submitted');
  assert.equal(payload.version, 1);
  assert.equal(payload.deliveryId, 'delivery_123');
  assert.equal(payload.lead.submissionId, 'lead_123');
  assert.equal(payload.lead.preferredContact, 'whatsapp');
  assert.equal(payload.source.path, '/contact?utm_source=test');
  assert.equal(payload.source.ipCountry, 'CR');
  assert.equal(payload.hermes.agent, 'Hermes');
  assert.equal(payload.hermes.requestedChannel, 'whatsapp');
  assert.equal(payload.hermes.objective, 'initial_contact_and_lead_qualification');
});
