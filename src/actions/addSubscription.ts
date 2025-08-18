import { defineAction } from 'astro:actions';
import { z } from 'astro:schema';
import { createClient } from '@libsql/client';


const turso = createClient({
  url: import.meta.env.TURSO_DATABASE_URL!,
  authToken: import.meta.env.TURSO_AUTH_TOKEN!,
});

export const addSubscription = defineAction({
  accept: 'form',
  input: z.object({
    email: z.string()
      .email('Please enter a valid email address')
      .min(5, 'Email must be at least 5 characters')
      .max(254, 'Email must be less than 254 characters')
      .toLowerCase()
      .trim()
  }),
  handler: async (input, context) => {
    try {
      const { email } = input;

      const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

      if (!emailRegex.test(email)) {
        return {
          success: false,
          message: 'Please enter a valid email address',
          error: 'INVALID_EMAIL_FORMAT'
        };
      }

      const disposableDomains = [
        '10minutemail.com', 'tempmail.org', 'guerrillamail.com',
        'mailinator.com', 'yopmail.com', 'temp-mail.org'
      ];

      const emailDomain = email.split('@')[1]?.toLowerCase();
      if (disposableDomains.includes(emailDomain)) {
        return {
          success: false,
          message: 'Please use a permanent email address',
          error: 'DISPOSABLE_EMAIL_DETECTED'
        };
      }

      const transaction = await turso.transaction();

      try {
        const existingSubscription = await transaction.execute({
          sql: 'SELECT id FROM SUBSCRIPTIONS WHERE LOWER(correo_electronico) = LOWER(?)',
          args: [email]
        });

        if (existingSubscription.rows.length > 0) {
          await transaction.rollback();
          return {
            success: false,
            message: 'This email is already subscribed to our newsletter',
            error: 'EMAIL_ALREADY_EXISTS'
          };
        }

        const result = await transaction.execute({
          sql: `INSERT INTO SUBSCRIPTIONS (correo_electronico, created_at, status, ip_address, user_agent) 
                VALUES (?, datetime('now'), 'active', ?, ?)`,
          args: [
            email,
            context.request?.headers.get('x-forwarded-for') ||
            context.request?.headers.get('x-real-ip') || 'unknown',
            context.request?.headers.get('user-agent')?.substring(0, 255) || 'unknown'
          ]
        });

        await transaction.commit();

        return {
          success: true,
          message: 'Thank you for subscribing! You\'ll receive our latest updates and insights.',
          data: {
            subscriptionId: result.lastInsertRowid,
            correo_electronico: email,
            subscribedAt: new Date().toISOString()
          }
        };

      } catch (dbError) {
        await transaction.rollback();
        throw dbError;
      }

    } catch (error) {
      console.error('Newsletter subscription error:', {
        error: error instanceof Error ? error.message : 'Unknown error',
        email: input.email,
        timestamp: new Date().toISOString(),
        stack: error instanceof Error ? error.stack : undefined
      });

      if (error instanceof Error) {
        if (error.message.includes('UNIQUE constraint failed')) {
          return {
            success: false,
            message: 'This email is already subscribed to our newsletter',
            error: 'EMAIL_ALREADY_EXISTS'
          };
        }

        if (error.message.includes('no such table')) {
          return {
            success: false,
            message: 'Service temporarily unavailable. Please try again later.',
            error: 'DATABASE_TABLE_NOT_FOUND'
          };
        }
      }

      return {
        success: false,
        message: 'There was an error processing your subscription. Please try again later.',
        error: 'SUBSCRIPTION_FAILED'
      };
    }
  }
});

export default addSubscription;