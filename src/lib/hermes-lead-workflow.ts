import type { ContactSubmissionInput } from './contact-submissions';
import type { RuntimeEnv } from './runtime-env';

export const HERMES_LEAD_WEBHOOK_EVENT = 'contact.submitted';
export const HERMES_LEAD_WEBHOOK_VERSION = 1;

export type HermesLeadWebhookStatus = 'not_configured' | 'queued' | 'webhook_failed';

export type HermesLeadWebhookPayload = {
  event: typeof HERMES_LEAD_WEBHOOK_EVENT;
  version: typeof HERMES_LEAD_WEBHOOK_VERSION;
  deliveryId: string;
  createdAt: string;
  lead: {
    submissionId: string;
    locale: ContactSubmissionInput['locale'];
    name: string;
    email: string;
    phone: string;
    preferredContact: ContactSubmissionInput['preferredContact'];
    interests: string[];
    interestsText: string;
    subject: string;
    message: string;
  };
  source: {
    path: string | null;
    submittedAtUtc: string;
    submittedAtCr: string;
    submittedDateCr: string;
    submittedHourCr: number;
    ipCountry: string | null;
    cfRay: string | null;
    userAgent: string;
  };
  hermes: {
    agent: 'Hermes';
    requestedChannel: ContactSubmissionInput['preferredContact'];
    objective: 'initial_contact_and_lead_qualification';
    handoffTarget: 'NOUS team';
  };
};

export type BuildHermesLeadWebhookPayloadInput = Pick<
  ContactSubmissionInput,
  | 'locale'
  | 'name'
  | 'email'
  | 'phone'
  | 'preferredContact'
  | 'interests'
  | 'interestsText'
  | 'subject'
  | 'message'
  | 'submittedAtUtc'
  | 'submittedAtCr'
  | 'submittedDateCr'
  | 'submittedHourCr'
  | 'ipCountry'
  | 'cfRay'
  | 'sourcePath'
  | 'userAgent'
> & {
  submissionId: string;
  createdAt?: string;
  deliveryId?: string;
};

export type HermesLeadWebhookResult = {
  status: HermesLeadWebhookStatus;
  deliveryId: string;
  responseStatus?: number;
  errorMessage?: string;
};

type HermesLeadWebhookEnv = Pick<RuntimeEnv, 'HERMES_LEAD_WEBHOOK_URL' | 'HERMES_LEAD_WEBHOOK_SECRET'>;

function trimEnvValue(value: string | undefined) {
  const trimmed = value?.trim();
  return trimmed || undefined;
}

function toHex(buffer: ArrayBuffer) {
  return [...new Uint8Array(buffer)]
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}

function normalizeWebhookError(error: unknown) {
  if (error instanceof Error) {
    if (error.name === 'AbortError') return 'Hermes lead webhook timed out';
    return error.message.slice(0, 500);
  }

  return 'Hermes lead webhook failed';
}

export function isHermesLeadWebhookConfigured(env: HermesLeadWebhookEnv) {
  return Boolean(trimEnvValue(env.HERMES_LEAD_WEBHOOK_URL) && trimEnvValue(env.HERMES_LEAD_WEBHOOK_SECRET));
}

export function buildHermesLeadWebhookPayload(input: BuildHermesLeadWebhookPayloadInput): HermesLeadWebhookPayload {
  return {
    event: HERMES_LEAD_WEBHOOK_EVENT,
    version: HERMES_LEAD_WEBHOOK_VERSION,
    deliveryId: input.deliveryId || crypto.randomUUID(),
    createdAt: input.createdAt || new Date().toISOString(),
    lead: {
      submissionId: input.submissionId,
      locale: input.locale,
      name: input.name,
      email: input.email,
      phone: input.phone,
      preferredContact: input.preferredContact,
      interests: input.interests,
      interestsText: input.interestsText,
      subject: input.subject,
      message: input.message,
    },
    source: {
      path: input.sourcePath,
      submittedAtUtc: input.submittedAtUtc,
      submittedAtCr: input.submittedAtCr,
      submittedDateCr: input.submittedDateCr,
      submittedHourCr: input.submittedHourCr,
      ipCountry: input.ipCountry,
      cfRay: input.cfRay,
      userAgent: input.userAgent,
    },
    hermes: {
      agent: 'Hermes',
      requestedChannel: input.preferredContact,
      objective: 'initial_contact_and_lead_qualification',
      handoffTarget: 'NOUS team',
    },
  };
}

export async function createHermesWebhookSignature(secret: string, timestamp: string, body: string) {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(`${timestamp}.${body}`));
  return `sha256=${toHex(signature)}`;
}

export async function dispatchHermesLeadWebhook(
  env: HermesLeadWebhookEnv,
  payload: HermesLeadWebhookPayload,
  options: { timeoutMs?: number } = {},
): Promise<HermesLeadWebhookResult> {
  const webhookUrl = trimEnvValue(env.HERMES_LEAD_WEBHOOK_URL);
  const webhookSecret = trimEnvValue(env.HERMES_LEAD_WEBHOOK_SECRET);

  if (!webhookUrl || !webhookSecret) {
    return {
      status: 'not_configured',
      deliveryId: payload.deliveryId,
      errorMessage: 'HERMES_LEAD_WEBHOOK_URL or HERMES_LEAD_WEBHOOK_SECRET is not configured',
    };
  }

  const body = JSON.stringify(payload);
  const timestamp = new Date().toISOString();
  const signature = await createHermesWebhookSignature(webhookSecret, timestamp, body);
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), options.timeoutMs ?? 5000);

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-NOUS-Source': 'NOUS-Website-Hermes-Lead-Handoff/1.0',
        'X-NOUS-Event': HERMES_LEAD_WEBHOOK_EVENT,
        'X-NOUS-Delivery-Id': payload.deliveryId,
        'X-NOUS-Timestamp': timestamp,
        'X-NOUS-Signature': signature,
      },
      body,
      signal: controller.signal,
    });

    if (!response.ok) {
      return {
        status: 'webhook_failed',
        deliveryId: payload.deliveryId,
        responseStatus: response.status,
        errorMessage: `Hermes lead webhook returned ${response.status} ${response.statusText}`.slice(0, 500),
      };
    }

    return {
      status: 'queued',
      deliveryId: payload.deliveryId,
      responseStatus: response.status,
    };
  } catch (error) {
    return {
      status: 'webhook_failed',
      deliveryId: payload.deliveryId,
      errorMessage: normalizeWebhookError(error),
    };
  } finally {
    clearTimeout(timeoutId);
  }
}
