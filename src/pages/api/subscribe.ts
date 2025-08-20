import type { APIRoute } from 'astro';
import { z } from 'astro:schema';
import { createClient } from '@libsql/client/web';

const subscriptionSchema = z.object({
  email: z.string()
    .email('Please enter a valid email address')
    .min(5, 'Email must be at least 5 characters')
    .max(254, 'Email must be less than 254 characters')
    .toLowerCase()
    .trim()
});

export const POST: APIRoute = async ({ request,locals }) => {
  try {
    const { TURSO_DATABASE_URL, TURSO_AUTH_TOKEN } = locals.runtime.env;
    const turso = createClient({
      url: TURSO_DATABASE_URL!,
      authToken: TURSO_AUTH_TOKEN!,
    });

    // Manejar tanto FormData como URLSearchParams
    let rawData;
    const contentType = request.headers.get('content-type') || '';
    
    if (contentType.includes('application/x-www-form-urlencoded')) {
      const params = new URLSearchParams(await request.text());
      rawData = {
        email: params.get('email') || ''
      };
    } else {
      // Fallback para FormData
      const formData = await request.formData();
      rawData = {
        email: formData.get('email') as string
      };
    }

    // Validar con zod
    const validatedData = subscriptionSchema.parse(rawData);
    const { email } = validatedData;

    // Validación adicional con regex
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

    if (!emailRegex.test(email)) {
      return new Response(JSON.stringify({
        success: false,
        message: 'Please enter a valid email address',
        error: 'INVALID_EMAIL_FORMAT'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Verificar dominios desechables
    const disposableDomains = [
      '10minutemail.com', 'tempmail.org', 'guerrillamail.com',
      'mailinator.com', 'yopmail.com', 'temp-mail.org'
    ];

    const emailDomain = email.split('@')[1]?.toLowerCase();
    if (disposableDomains.includes(emailDomain)) {
      return new Response(JSON.stringify({
        success: false,
        message: 'Please use a permanent email address',
        error: 'DISPOSABLE_EMAIL_DETECTED'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Obtener información del request
    const ipAddress = request.headers.get('x-forwarded-for') ||
                     request.headers.get('x-real-ip') ||
                     request.headers.get('cf-connecting-ip') || // Cloudflare específico
                     'unknown';
    
    const userAgent = request.headers.get('user-agent')?.substring(0, 255) || 'unknown';

    // Manejar transacción de base de datos
    const transaction = await turso.transaction();

    try {
      // Verificar si el email ya existe
      const existingSubscription = await transaction.execute({
        sql: 'SELECT id FROM SUBSCRIPTIONS WHERE LOWER(correo_electronico) = LOWER(?)',
        args: [email]
      });

      if (existingSubscription.rows.length > 0) {
        await transaction.rollback();
        return new Response(JSON.stringify({
          success: false,
          message: 'This email is already subscribed to our newsletter',
          error: 'EMAIL_ALREADY_EXISTS'
        }), {
          status: 409, // Conflict
          headers: { 'Content-Type': 'application/json' }
        });
      }

      // Insertar nueva suscripción
      const result = await transaction.execute({
        sql: `INSERT INTO SUBSCRIPTIONS (correo_electronico, created_at, status, ip_address, user_agent) 
              VALUES (?, datetime('now'), 'active', ?, ?)`,
        args: [email, ipAddress, userAgent]
      });

      await transaction.commit();

      // Fix: Manejo robusto del BigInt
      const subscriptionId = typeof result.lastInsertRowid === 'bigint' 
        ? result.lastInsertRowid.toString()
        : result.lastInsertRowid || 'unknown';

      return new Response(JSON.stringify({
        success: true,
        message: 'Thank you for subscribing! You\'ll receive our latest updates and insights.',
        data: {
          subscriptionId,
          correo_electronico: email,
          subscribedAt: new Date().toISOString()
        }
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
      email: (error as any)?.email || 'unknown',
      timestamp: new Date().toISOString(),
      stack: error instanceof Error ? error.stack : undefined
    });

    // Manejar errores de validación de zod
    if (error instanceof z.ZodError) {
      return new Response(JSON.stringify({
        success: false,
        message: 'Please check your email format',
        errors: error.errors
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Manejar errores específicos de base de datos
    if (error instanceof Error) {
      if (error.message.includes('UNIQUE constraint failed')) {
        return new Response(JSON.stringify({
          success: false,
          message: 'This email is already subscribed to our newsletter',
          error: 'EMAIL_ALREADY_EXISTS'
        }), {
          status: 409,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      if (error.message.includes('no such table')) {
        return new Response(JSON.stringify({
          success: false,
          message: 'Service temporarily unavailable. Please try again later.',
          error: 'DATABASE_TABLE_NOT_FOUND'
        }), {
          status: 503, // Service Unavailable
          headers: { 'Content-Type': 'application/json' }
        });
      }

      if (error.message.includes('Content-Type')) {
        return new Response(JSON.stringify({
          success: false,
          message: 'Invalid request format. Please try again.',
          error: 'INVALID_CONTENT_TYPE'
        }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      if (error.message.includes('BigInt')) {
        return new Response(JSON.stringify({
          success: false,
          message: 'Data processing error. Please try again.',
          error: 'SERIALIZATION_ERROR'
        }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }

    return new Response(JSON.stringify({
      success: false,
      message: 'There was an error processing your subscription. Please try again later.',
      error: 'SUBSCRIPTION_FAILED'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};