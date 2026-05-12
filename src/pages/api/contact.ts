import type { APIRoute } from 'astro';
import { z } from 'zod';
import { Resend } from 'resend';
import { checkRateLimit, escapeHtml, getClientIp, isHoneypotFilled } from '@/lib/security';
import { getRuntimeEnv } from '@/lib/runtime-env';

const contactSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be less than 100 characters'),
  email: z.email('Please enter a valid e-mail address'),
  subject: z.string().min(1, 'Subject is required').max(200, 'Subject must be less than 200 characters'),
  message: z.string().min(10, 'Message must be at least 10 characters').max(2000, 'Message must be less than 2000 characters'),
  phone: z.string().optional(),
  preferredContact: z.enum(['email', 'whatsapp'], {
    error: 'Please select a valid preferred contact method'
  }),
  interests: z.array(z.string()).optional().default([]),
  locale: z.enum(['en', 'es']).optional().default('en')
});

function inferLocale(request: Request, formData?: FormData): 'en' | 'es' {
  if (formData?.get('locale') === 'es') return 'es';
  const referer = request.headers.get('referer') || '';
  try {
    return new URL(referer).pathname.startsWith('/es') ? 'es' : 'en';
  } catch {
    return 'en';
  }
}

const responseCopy = {
  en: {
    unavailable: 'Contact service is temporarily unavailable. Please e-mail hello@nous.cr directly.',
    rateLimited: 'Too many messages were submitted. Please try again shortly.',
    emailLimited: 'Too many messages were submitted from this e-mail address. Please try again later.',
    sendError: 'There was an error sending your message. Please try again or contact us directly.',
    success: 'Thank you for your message. Hermes will establish first contact shortly.',
    checkForm: 'Please check your form data',
    processingError: 'There was an error processing your request. Please try again later.',
  },
  es: {
    unavailable: 'El servicio de contacto no está disponible temporalmente. Por favor escribe directamente a hello@nous.cr.',
    rateLimited: 'Se enviaron demasiados mensajes. Inténtalo de nuevo en unos minutos.',
    emailLimited: 'Se enviaron demasiados mensajes desde esta dirección de e-mail. Inténtalo de nuevo más tarde.',
    sendError: 'Hubo un error enviando tu mensaje. Inténtalo de nuevo o contáctanos directamente.',
    success: 'Gracias por tu mensaje. Hermes establecerá el primer contacto pronto.',
    checkForm: 'Revisa la información del formulario',
    processingError: 'Hubo un error procesando tu solicitud. Inténtalo de nuevo más tarde.',
  },
} as const;

export const POST: APIRoute = async ({ request }) => {
  let locale = inferLocale(request);
  try {
    const { RESEND_API_KEY, CONTACT_RECIPIENT_EMAIL } = getRuntimeEnv();
    if (!RESEND_API_KEY) {
      return new Response(JSON.stringify({
        success: false,
        message: responseCopy[locale].unavailable
      }), {
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const clientIp = getClientIp(request);
    const ipLimit = checkRateLimit(`contact:ip:${clientIp}`, 5);
    if (ipLimit.limited) {
      return new Response(JSON.stringify({
        success: false,
        message: responseCopy[locale].rateLimited
      }), {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Retry-After': String(ipLimit.retryAfter)
        }
      });
    }

    const resend = new Resend(RESEND_API_KEY);

    // Read form data.
    const formData = await request.formData();
    locale = inferLocale(request, formData);
    if (isHoneypotFilled(formData)) {
      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const rawData = {
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      subject: formData.get('subject') as string,
      message: formData.get('message') as string,
      phone: formData.get('phone') as string,
      preferredContact: formData.get('preferredContact') as string,
      interests: formData.getAll('interests') as string[],
      locale: formData.get('locale') as string || locale
    };

    // Validate with Zod before using any submitted values.
    const validatedData = contactSchema.parse(rawData);
    const { name, email, subject, message, phone, preferredContact, interests } = validatedData;
    locale = validatedData.locale;
    const safeName = escapeHtml(name);
    const safeEmail = escapeHtml(email);
    const safeSubject = escapeHtml(subject);
    const safeMessage = escapeHtml(message);
    const safePhone = phone ? escapeHtml(phone) : '';
    const safeSubjectLine = subject.replace(/[\r\n]+/g, ' ').trim();

    const emailLimit = checkRateLimit(`contact:email:${email.toLowerCase()}`, 3, 10 * 60_000);
    if (emailLimit.limited) {
      return new Response(JSON.stringify({
        success: false,
        message: responseCopy[locale].emailLimited
      }), {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Retry-After': String(emailLimit.retryAfter)
        }
      });
    }

    const interestsText = interests && interests.length > 0
      ? interests.map(interest => {
          switch(interest) {
            case 'technology-advisory': return 'AI Strategy';
            case 'ai-strategy': return 'AI strategy';
            case 'web-development': return 'AI Agents';
            case 'ai-automation': return 'Intelligence Deployment';
            case 'automation': return 'Automation';
            case 'systems': return 'Systems';
            case 'automation-agents': return 'Automation & agents';
            case 'systems-integrations': return 'Systems & integrations';
            case 'training-adoption': return 'Training & adoption';
            case 'not-sure': return 'Not sure yet';
            default: return escapeHtml(interest);
          }
        }).join(', ')
      : 'Not specified';
    const safeInterestsText = escapeHtml(interestsText);

    // Format preferred contact method for display
    const formatPreferredContact = (method: string) => {
      switch(method) {
        case 'email': return 'E-mail';
        case 'whatsapp': return 'WhatsApp';
        default: return method;
      }
    };

    const formattedPreferredContact = formatPreferredContact(preferredContact);

    const companyEmailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>New Contact Form Submission - NOUS</title>
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 1000px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #060114 0%, #04000F 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 24px;">New Contact Form Submission</h1>
            <p style="color: white; margin: 10px 0 0 0; opacity: 0.9;">NOUS</p>
          </div>

          <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
            <div style="background: white; padding: 25px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
              <h2 style="color: #060114; margin-top: 0; font-size: 20px;">Contact Details</h2>

              <div style="font-family: Arial, Helvetica, sans-serif; line-height: 1.6; color:#333;">
                <p>
                  <strong>Hello.</strong><br><br>
                  My name is <strong>${safeName}</strong> and you can reach me at
                  <a href="mailto:${safeEmail}" style="color:#060114; text-decoration:none;">
                    ${safeEmail}
                  </a>${safePhone ? ` or by phone at <strong>${safePhone}</strong>` : ''}.<br><br>
                  ${preferredContact ? `My preferred contact method is <em>${formattedPreferredContact}</em>.<br><br>` : ''}
                  I'm interested in <em>${safeInterestsText}</em> and the subject of my message is
                  <strong>"${safeSubject}"</strong>.<br><br>
                  Here's what I'd like to share:
                </p>

                <div style="background:#f8f9fa; padding:15px; border-radius:5px; border-left:4px solid #060114; margin:15px 0;">
                  <p style="margin:0; white-space:pre-wrap;">${safeMessage}</p>
                </div>

                <p>
                  I look forward to hearing from you!<br>
                  Best regards,
                </p>
                <p><strong>${safeName}</strong></p>
              </div>

              <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; text-align: center;">
                <p style="color: #666; font-size: 14px; margin: 0;">
                  Submitted on ${new Date().toLocaleString('en-US', {
                    timeZone: 'America/Costa_Rica',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;

    const clientEmailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Thank you for contacting NOUS</title>
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 1000px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #060114 0%, #04000F 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 24px;">Thank You for Contacting Us!</h1>
            <p style="color: white; margin: 10px 0 0 0; opacity: 0.9;">NOUS</p>
          </div>

          <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
            <div style="background: white; padding: 25px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
              <p style="font-size: 16px; margin-top: 0;">Hi ${safeName},</p>

              <p style="font-size: 16px; margin: 20px 0;">
                Thank you for reaching out to <strong>NOUS</strong>.<br><br>
                We've received your message about <em>"${safeSubject}"</em>. Hermes, our customer service agent, will help establish first contact and ask a few initial questions before we move forward.
                ${preferredContact ? `Your preferred contact method is <strong>${formattedPreferredContact}</strong>.` : 'We have your e-mail as the main contact method.'}<br><br>
                <strong>What happens next?</strong><br>
                • This confirmation lets you know the message arrived<br>
                • Hermes will help clarify the first details<br>
                • We'll use that context to define the most useful next step
              </p>

              <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #060114;">
                <h3 style="color: #060114; margin-top: 0; font-size: 18px;">Your Contact Information</h3>
                <p style="margin: 10px 0;">E-mail: <a href="mailto:${safeEmail}" style="color:#060114; text-decoration:none;">${safeEmail}</a></p>
                ${safePhone ? `<p style="margin: 10px 0;">Phone: <strong>${safePhone}</strong></p>` : ''}
              </div>

              <p style="font-size: 16px;">In the meantime, feel free to explore our services and learn more about how we help organizations with AI transformation, intelligence deployment, and AI-ready systems.</p>

              <div style="text-align: center; margin: 30px 0;">
                <a href="https://nous.cr/services" target="_blank" style="background: #060114; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Explore Our Services</a>
              </div>

              <p style="font-size: 16px;">Best regards,<br>
              <strong>The NOUS Team</strong></p>

              <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; text-align: center;">
                <p style="color: #666; font-size: 14px; margin: 5px 0;">
                  <strong>NOUS</strong><br>
                  AI Transformation | Intelligence Deployment | AI-Ready Systems
                </p>
                <p style="color: #666; font-size: 12px; margin: 10px 0 0 0;">
                  This is an automated confirmation.
                </p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;

    // Send e-mails.
    const companyEmailResult = await resend.emails.send({
      from: 'Contact Form <noreply@nous.cr>',
      to: [CONTACT_RECIPIENT_EMAIL || 'hello@nous.cr'],
      subject: `New Contact: ${safeSubjectLine}`,
      html: companyEmailHtml,
      replyTo: email
    });

    const clientEmailResult = await resend.emails.send({
      from: 'NOUS <noreply@nous.cr>',
      to: [email],
      subject: 'Thank you for contacting NOUS',
      html: clientEmailHtml
    });

    if (companyEmailResult.error || clientEmailResult.error) {
      console.error('Contact e-mail delivery error:', {
        companyError: companyEmailResult.error ? 'delivery_failed' : null,
        clientError: clientEmailResult.error ? 'delivery_failed' : null
      });

      return new Response(JSON.stringify({
        success: false,
        message: responseCopy[locale].sendError
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({
      success: true,
      message: responseCopy[locale].success
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Contact form submission error:', error instanceof Error ? error.message : 'Unknown error');

    if (error instanceof z.ZodError) {
      return new Response(JSON.stringify({
        success: false,
        message: responseCopy[locale].checkForm,
        errors: error.issues
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({
      success: false,
      message: responseCopy[locale].processingError
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
