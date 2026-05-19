import assert from 'node:assert/strict';
import test from 'node:test';
import {
  buildContactSubmissionMetadata,
  getContactSourcePath,
  isContactDatabaseConfigured,
  serializeContactInterests,
} from '../src/lib/contact-submissions.ts';

test('contact database config requires both Turso values', () => {
  assert.equal(isContactDatabaseConfigured({}), false);
  assert.equal(isContactDatabaseConfigured({ TURSO_CONTACT_URL: 'libsql://example.turso.io' }), false);
  assert.equal(isContactDatabaseConfigured({ TURSO_CONTACT_TOKEN: 'token' }), false);
  assert.equal(
    isContactDatabaseConfigured({
      TURSO_CONTACT_URL: 'libsql://example.turso.io',
      TURSO_CONTACT_TOKEN: 'token',
    }),
    true,
  );
});

test('contact source path keeps path and query only', () => {
  const request = new Request('https://nous.cr/api/contact', {
    headers: {
      referer: 'https://nous.cr/es/contact?utm_source=linkedin',
    },
  });

  assert.equal(getContactSourcePath(request), '/es/contact?utm_source=linkedin');
});

test('contact source path returns null for missing or invalid referer', () => {
  assert.equal(getContactSourcePath(new Request('https://nous.cr/api/contact')), null);
  assert.equal(
    getContactSourcePath(new Request('https://nous.cr/api/contact', {
      headers: { referer: 'not a url' },
    })),
    null,
  );
});

test('contact interests are serialized as stable JSON', () => {
  assert.equal(
    serializeContactInterests(['ai-strategy', 'automation-agents']),
    '["ai-strategy","automation-agents"]',
  );
});

test('contact submission metadata captures utc time, costa rica hour, country, and cf ray', () => {
  const request = new Request('https://nous.cr/api/contact', {
    headers: {
      'cf-ipcountry': 'cr',
      'cf-ray': 'abc123-SJO',
    },
  });

  const metadata = buildContactSubmissionMetadata(
    request,
    new Date('2026-05-19T01:30:45.123Z'),
  );

  assert.deepEqual(metadata, {
    submittedAtUtc: '2026-05-19T01:30:45.123Z',
    submittedAtCr: '2026-05-18 19:30:45',
    submittedDateCr: '2026-05-18',
    submittedHourCr: 19,
    ipCountry: 'CR',
    cfRay: 'abc123-SJO',
  });
});

test('contact submission metadata ignores invalid country values', () => {
  const request = new Request('https://nous.cr/api/contact', {
    headers: {
      'cf-ipcountry': 'unknown',
    },
  });

  assert.equal(buildContactSubmissionMetadata(request).ipCountry, null);
});
