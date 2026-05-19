import { createClient } from '@libsql/client/web';

export type ContactDatabaseEnv = {
  TURSO_CONTACT_URL?: string;
  TURSO_CONTACT_TOKEN?: string;
};

export type ContactEmailDeliveryStatus = 'pending' | 'sent' | 'failed' | 'skipped';

export type ContactSubmissionInput = {
  id?: string;
  submittedAtUtc: string;
  submittedAtCr: string;
  submittedDateCr: string;
  submittedHourCr: number;
  locale: 'en' | 'es';
  name: string;
  email: string;
  phone: string;
  preferredContact: 'email' | 'whatsapp';
  interests: string[];
  interestsText: string;
  subject: string;
  message: string;
  ipAddress: string;
  ipCountry: string | null;
  userAgent: string;
  cfRay: string | null;
  sourcePath: string | null;
};

export type ContactEmailDeliveryUpdate = {
  status: ContactEmailDeliveryStatus;
  internalEmailId?: string | null;
  confirmationEmailId?: string | null;
  errorMessage?: string | null;
};

function truncate(value: string | null | undefined, maxLength: number) {
  if (!value) return null;
  return value.slice(0, maxLength);
}

function getCostaRicaTimeParts(value: Date) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Costa_Rica',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(value);

  const mappedParts = Object.fromEntries(
    parts
      .filter((part) => part.type !== 'literal')
      .map((part) => [part.type, part.value]),
  );

  const date = `${mappedParts.year}-${mappedParts.month}-${mappedParts.day}`;
  const time = `${mappedParts.hour}:${mappedParts.minute}:${mappedParts.second}`;

  return {
    submittedAtCr: `${date} ${time}`,
    submittedDateCr: date,
    submittedHourCr: Number(mappedParts.hour),
  };
}

function getCloudflareCountry(request: Request) {
  const country = request.headers.get('cf-ipcountry')?.trim().toUpperCase();
  if (!country || country === 'XX') return null;
  return /^[A-Z0-9]{2}$/.test(country) ? country : null;
}

function createContactClient(env: ContactDatabaseEnv) {
  if (!env.TURSO_CONTACT_URL || !env.TURSO_CONTACT_TOKEN) {
    throw new Error('Contact database is not configured');
  }

  return createClient({
    url: env.TURSO_CONTACT_URL,
    authToken: env.TURSO_CONTACT_TOKEN,
  });
}

export function isContactDatabaseConfigured(env: ContactDatabaseEnv) {
  return Boolean(env.TURSO_CONTACT_URL && env.TURSO_CONTACT_TOKEN);
}

export function getContactSourcePath(request: Request) {
  const referer = request.headers.get('referer') || '';
  if (!referer) return null;

  try {
    const url = new URL(referer);
    return truncate(`${url.pathname}${url.search}`, 512);
  } catch {
    return null;
  }
}

export function serializeContactInterests(interests: string[]) {
  return JSON.stringify(interests);
}

export function buildContactSubmissionMetadata(request: Request, now = new Date()) {
  return {
    submittedAtUtc: now.toISOString(),
    ...getCostaRicaTimeParts(now),
    ipCountry: getCloudflareCountry(request),
    cfRay: truncate(request.headers.get('cf-ray'), 255),
  };
}

export async function saveContactSubmission(
  env: ContactDatabaseEnv,
  input: ContactSubmissionInput,
) {
  if (!isContactDatabaseConfigured(env)) return null;

  const id = input.id || crypto.randomUUID();
  const client = createContactClient(env);

  await client.execute({
    sql: `
      INSERT INTO contact_submissions (
        id,
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
        email_delivery_status
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')
    `,
    args: [
      id,
      input.submittedAtUtc,
      input.submittedAtCr,
      input.submittedDateCr,
      input.submittedHourCr,
      input.locale,
      input.name,
      input.email,
      input.phone,
      input.preferredContact,
      serializeContactInterests(input.interests),
      input.interestsText,
      input.subject,
      input.message,
      input.sourcePath,
      truncate(input.ipAddress, 64),
      truncate(input.ipCountry, 16),
      truncate(input.userAgent, 512),
      truncate(input.cfRay, 255),
    ],
  });

  return id;
}

export async function updateContactSubmissionEmailStatus(
  env: ContactDatabaseEnv,
  id: string | null,
  update: ContactEmailDeliveryUpdate,
) {
  if (!id || !isContactDatabaseConfigured(env)) return;

  const client = createContactClient(env);
  await client.execute({
    sql: `
      UPDATE contact_submissions
      SET
        email_delivery_status = ?,
        internal_email_id = ?,
        confirmation_email_id = ?,
        email_delivery_error = ?,
        updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
      WHERE id = ?
    `,
    args: [
      update.status,
      truncate(update.internalEmailId, 255),
      truncate(update.confirmationEmailId, 255),
      truncate(update.errorMessage, 500),
      id,
    ],
  });
}
