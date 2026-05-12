import type { APIRoute } from 'astro';
import { z } from 'zod';
import { createClient } from '@libsql/client/web';
import { checkRateLimit, getClientIp, isHoneypotFilled } from '@/lib/security';
import { getRuntimeEnv } from '@/lib/runtime-env';

const subscriptionSchema = z.object({
  email: z.email('Please enter a valid e-mail address')
    .min(5, 'E-mail must be at least 5 characters')
    .max(254, 'E-mail must be less than 254 characters')
    .toLowerCase()
    .trim()
});

export const POST: APIRoute = async ({ request }) => {
  try {
    const { TURSO_NEWSLETTER_URL, TURSO_NEWSLETTER_TOKEN } = getRuntimeEnv();
    if (!TURSO_NEWSLETTER_URL || !TURSO_NEWSLETTER_TOKEN) {
      return new Response(JSON.stringify({
        success: false,
        message: 'Newsletter service is temporarily unavailable. Please try again later.'
      }), {
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const clientIp = getClientIp(request);
    const ipLimit = checkRateLimit(`subscribe:ip:${clientIp}`, 8, 10 * 60_000);
    if (ipLimit.limited) {
      return new Response(JSON.stringify({
        success: false,
        message: 'Too many subscription attempts. Please try again shortly.'
      }), {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Retry-After': String(ipLimit.retryAfter)
        }
      });
    }

    const turso = createClient({
      url: TURSO_NEWSLETTER_URL,
      authToken: TURSO_NEWSLETTER_TOKEN,
    });

    // Accept both FormData and URLSearchParams submissions.
    let rawData;
    const contentType = request.headers.get('content-type') || '';
    
    if (contentType.includes('application/x-www-form-urlencoded')) {
      const params = new URLSearchParams(await request.text());
      if (params.get('website')) {
        return new Response(JSON.stringify({ success: true }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      rawData = {
        email: params.get('email') || ''
      };
    } else {
      const formData = await request.formData();
      if (isHoneypotFilled(formData)) {
        return new Response(JSON.stringify({ success: true }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      rawData = {
        email: formData.get('email') as string
      };
    }

    // Validate with Zod before storing the submitted e-mail.
    const validatedData = subscriptionSchema.parse(rawData);
    const { email } = validatedData;

    // Additional format validation for broad browser/client compatibility.
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

    if (!emailRegex.test(email)) {
      return new Response(JSON.stringify({
        success: false,
        message: 'Please enter a valid e-mail address'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Reject common disposable e-mail providers.
    const disposableDomains = [
      '10minutemail.com', 'tempmail.org', 'guerrillamail.com',
      'mailinator.com', 'yopmail.com', 'temp-mail.org'
    ];

    const emailDomain = email.split('@')[1]?.toLowerCase();
    if (disposableDomains.includes(emailDomain)) {
      return new Response(JSON.stringify({
        success: false,
        message: 'Please use a permanent e-mail address'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const ipAddress = clientIp;
    const userAgent = request.headers.get('user-agent')?.substring(0, 255) || 'unknown';

    const transaction = await turso.transaction();

    try {
      const existingSubscription = await transaction.execute({
        sql: 'SELECT id FROM SUBSCRIPTIONS WHERE LOWER(correo_electronico) = LOWER(?)',
        args: [email]
      });

      if (existingSubscription.rows.length > 0) {
        await transaction.rollback();
        return new Response(JSON.stringify({
          success: false,
          message: 'This e-mail is already subscribed to our newsletter'
        }), {
          status: 409,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      await transaction.execute({
        sql: `INSERT INTO SUBSCRIPTIONS (correo_electronico, created_at, status, ip_address, user_agent) 
              VALUES (?, datetime('now'), 'active', ?, ?)`,
        args: [email, ipAddress, userAgent]
      });

      await transaction.commit();

      return new Response(JSON.stringify({
        success: true,
        message: 'Thank you for subscribing. You will receive field notes from NOUS.'
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });

    } catch (dbError) {
      await transaction.rollback();
      throw dbError;
    }

  } catch (error) {
    console.error('Newsletter subscription error:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    });

    if (error instanceof z.ZodError) {
      return new Response(JSON.stringify({
        success: false,
        message: 'Please check your e-mail format',
        errors: error.issues
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (error instanceof Error) {
      if (error.message.includes('UNIQUE constraint failed')) {
        return new Response(JSON.stringify({
          success: false,
          message: 'This e-mail is already subscribed to our newsletter'
        }), {
          status: 409,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      if (error.message.includes('no such table')) {
        return new Response(JSON.stringify({
          success: false,
          message: 'Service temporarily unavailable. Please try again later.'
        }), {
          status: 503,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      if (error.message.includes('Content-Type')) {
        return new Response(JSON.stringify({
          success: false,
          message: 'Invalid request format. Please try again.'
        }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }

    return new Response(JSON.stringify({
      success: false,
      message: 'There was an error processing your subscription. Please try again later.'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
