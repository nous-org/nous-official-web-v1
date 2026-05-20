import type { APIRoute } from 'astro';
import { z } from 'zod';
import {
  isContactDatabaseConfigured,
  updateContactSubmissionHermesWorkflowStatus,
} from '@/lib/contact-submissions';
import { getRuntimeEnv } from '@/lib/runtime-env';

const workflowStatusSchema = z.object({
  submissionId: z.string().trim().min(1).max(128),
  status: z.enum(['queued', 'in_progress', 'awaiting_reply', 'completed', 'failed', 'manual_review']),
  channel: z.enum(['email', 'phone', 'whatsapp']).optional(),
  webhookDeliveryId: z.string().trim().max(255).optional(),
  workflowRunId: z.string().trim().max(255).optional(),
  summary: z.string().trim().max(4000).optional(),
  nextStep: z.string().trim().max(1000).optional(),
  transcript: z.string().trim().max(20000).optional(),
  errorMessage: z.string().trim().max(1000).optional(),
  lastEventAt: z.string().trim().max(64).optional(),
});

function getBearerToken(request: Request) {
  const authorization = request.headers.get('authorization') || '';
  const match = authorization.match(/^Bearer\s+(.+)$/i);
  return match?.[1]?.trim() || '';
}

function jsonResponse(body: Record<string, unknown>, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

export const POST: APIRoute = async ({ request }) => {
  const runtimeEnv = getRuntimeEnv();
  const configuredToken = runtimeEnv.HERMES_WORKFLOW_API_TOKEN?.trim();

  if (!configuredToken) {
    return jsonResponse({ success: false, message: 'Hermes workflow status API is not configured' }, 503);
  }

  if (getBearerToken(request) !== configuredToken) {
    return jsonResponse({ success: false, message: 'Unauthorized' }, 401);
  }

  if (!isContactDatabaseConfigured(runtimeEnv)) {
    return jsonResponse({ success: false, message: 'Contact database is not configured' }, 503);
  }

  let jsonData: unknown;
  try {
    jsonData = await request.json();
  } catch {
    return jsonResponse({ success: false, message: 'Invalid JSON body' }, 400);
  }

  const result = workflowStatusSchema.safeParse(jsonData);
  if (!result.success) {
    return jsonResponse({
      success: false,
      message: 'Please check your workflow status payload',
      errors: result.error.issues,
    }, 400);
  }

  const {
    submissionId,
    status,
    channel,
    webhookDeliveryId,
    workflowRunId,
    summary,
    nextStep,
    transcript,
    errorMessage,
    lastEventAt,
  } = result.data;

  try {
    await updateContactSubmissionHermesWorkflowStatus(runtimeEnv, submissionId, {
      status,
      channel,
      webhookDeliveryId,
      workflowRunId,
      summary,
      nextStep,
      transcript,
      errorMessage,
      lastEventAt,
    });

    return jsonResponse({ success: true }, 200);
  } catch (error) {
    console.error('Hermes workflow status update error:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      submissionId,
      timestamp: new Date().toISOString(),
    });

    return jsonResponse({ success: false, message: 'Unable to update workflow status' }, 500);
  }
};
