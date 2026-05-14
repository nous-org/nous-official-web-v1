import type { APIRoute } from 'astro';
import { z } from 'zod';
import { Resend } from 'resend';
import { checkRateLimit, escapeHtml, getClientIp, isHoneypotFilled } from '@/lib/security';
import { getRuntimeEnv } from '@/lib/runtime-env';

const validationCopy = {
  en: {
    nameRequired: 'Name is required',
    nameMax: 'Name must be less than 100 characters',
    emailRequired: 'E-mail is required',
    emailInvalid: 'Please enter a valid e-mail address',
    phoneRequired: 'Phone number is required',
    phoneMax: 'Phone number must be less than 50 characters',
    preferredContactRequired: 'Please select a valid preferred contact method',
    interestsRequired: 'Please select at least one area of interest',
    subjectRequired: 'Subject is required',
    subjectMax: 'Subject must be less than 200 characters',
    messageRequired: 'Message is required',
    messageMin: 'Message must be at least 10 characters',
    messageMax: 'Message must be less than 2000 characters',
  },
  es: {
    nameRequired: 'El nombre es obligatorio',
    nameMax: 'El nombre debe tener menos de 100 caracteres',
    emailRequired: 'El e-mail es obligatorio',
    emailInvalid: 'Escribe un e-mail válido',
    phoneRequired: 'El número de teléfono es obligatorio',
    phoneMax: 'El número de teléfono debe tener menos de 50 caracteres',
    preferredContactRequired: 'Selecciona un método de contacto válido',
    interestsRequired: 'Selecciona al menos un área de interés',
    subjectRequired: 'El asunto es obligatorio',
    subjectMax: 'El asunto debe tener menos de 200 caracteres',
    messageRequired: 'El mensaje es obligatorio',
    messageMin: 'El mensaje debe tener al menos 10 caracteres',
    messageMax: 'El mensaje debe tener menos de 2000 caracteres',
  },
} as const;

function createContactSchema(locale: 'en' | 'es') {
  const copy = validationCopy[locale];

  return z.object({
    name: z.string().trim().min(1, copy.nameRequired).max(100, copy.nameMax),
    email: z.string().trim().min(1, copy.emailRequired).pipe(z.email(copy.emailInvalid)),
    subject: z.string().trim().min(1, copy.subjectRequired).max(200, copy.subjectMax),
    message: z.string().trim().min(1, copy.messageRequired).min(10, copy.messageMin).max(2000, copy.messageMax),
    phone: z.string().trim().min(1, copy.phoneRequired).max(50, copy.phoneMax),
    preferredContact: z.enum(['email', 'whatsapp'], {
      error: copy.preferredContactRequired
    }),
    interests: z.array(z.string()).min(1, copy.interestsRequired),
    locale: z.enum(['en', 'es']).optional().default('en')
  });
}

function getFormString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === 'string' ? value : '';
}

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
    localSuccess: 'Local test received. No e-mail was sent because RESEND_API_KEY is not configured locally.',
    checkForm: 'Please check your form data',
    processingError: 'There was an error processing your request. Please try again later.',
  },
  es: {
    unavailable: 'El servicio de contacto no está disponible temporalmente. Por favor escribe directamente a hello@nous.cr.',
    rateLimited: 'Se enviaron demasiados mensajes. Inténtalo de nuevo en unos minutos.',
    emailLimited: 'Se enviaron demasiados mensajes desde esta dirección de e-mail. Inténtalo de nuevo más tarde.',
    sendError: 'Hubo un error enviando tu mensaje. Inténtalo de nuevo o contáctanos directamente.',
    success: 'Gracias por tu mensaje. Hermes establecerá el primer contacto pronto.',
    localSuccess: 'Prueba local recibida. No se envió ningún e-mail porque RESEND_API_KEY no está configurado localmente.',
    checkForm: 'Revisa la información del formulario',
    processingError: 'Hubo un error procesando tu solicitud. Inténtalo de nuevo más tarde.',
  },
} as const;

export const POST: APIRoute = async ({ request }) => {
  let locale = inferLocale(request);
  try {
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

    // Read submitted data before checking mail-provider configuration so invalid
    // submissions still receive actionable 400 validation responses.
    let rawData: unknown;
    const contentType = request.headers.get('content-type') || '';

    if (contentType.includes('application/json')) {
      const jsonData = await request.json().catch(() => ({})) as Record<string, unknown>;
      locale = jsonData.locale === 'es' ? 'es' : locale;
      rawData = {
        name: typeof jsonData.name === 'string' ? jsonData.name : '',
        email: typeof jsonData.email === 'string' ? jsonData.email : '',
        subject: typeof jsonData.subject === 'string' ? jsonData.subject : '',
        message: typeof jsonData.message === 'string' ? jsonData.message : '',
        phone: typeof jsonData.phone === 'string' ? jsonData.phone : '',
        preferredContact: typeof jsonData.preferredContact === 'string' ? jsonData.preferredContact : '',
        interests: Array.isArray(jsonData.interests) ? jsonData.interests.filter((item): item is string => typeof item === 'string') : [],
        locale
      };
    } else {
      const formData = await request.formData();
      locale = inferLocale(request, formData);
      if (isHoneypotFilled(formData)) {
        return new Response(JSON.stringify({ success: true }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      rawData = {
        name: getFormString(formData, 'name'),
        email: getFormString(formData, 'email'),
        subject: getFormString(formData, 'subject'),
        message: getFormString(formData, 'message'),
        phone: getFormString(formData, 'phone'),
        preferredContact: getFormString(formData, 'preferredContact'),
        interests: formData.getAll('interests') as string[],
        locale: getFormString(formData, 'locale') || locale
      };
    }

    // Validate with Zod before using any submitted values.
    const validatedData = createContactSchema(locale).parse(rawData);
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

    const { RESEND_API_KEY, CONTACT_RECIPIENT_EMAIL } = getRuntimeEnv();
    if (!RESEND_API_KEY) {
      if (import.meta.env.DEV) {
        return new Response(JSON.stringify({
          success: true,
          dryRun: true,
          message: responseCopy[locale].localSuccess
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      return new Response(JSON.stringify({
        success: false,
        message: responseCopy[locale].unavailable
      }), {
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const resend = new Resend(RESEND_API_KEY);

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

    console.error('Contact form submission error:', error instanceof Error ? error.message : 'Unknown error');

    return new Response(JSON.stringify({
      success: false,
      message: responseCopy[locale].processingError
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
