import type { APIRoute } from 'astro';
import { z } from 'zod';
import { Resend } from 'resend';
import { checkRateLimit, escapeHtml, getClientIp, isHoneypotFilled } from '@/lib/security';
import { getRuntimeEnv } from '@/lib/runtime-env';
import {
  buildContactSubmissionMetadata,
  getContactSourcePath,
  saveContactSubmission,
  updateContactSubmissionEmailStatus,
  type ContactEmailDeliveryUpdate,
} from '@/lib/contact-submissions';

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

type Locale = keyof typeof validationCopy;

function createContactSchema(locale: Locale) {
  const copy = validationCopy[locale];

  return z.object({
    name: z.string().trim().min(1, copy.nameRequired).max(100, copy.nameMax),
    email: z.string().trim().min(1, copy.emailRequired).pipe(z.email(copy.emailInvalid)),
    subject: z.string().trim().min(1, copy.subjectRequired).max(200, copy.subjectMax),
    message: z.string().trim().min(1, copy.messageRequired).min(10, copy.messageMin).max(2000, copy.messageMax),
    phone: z.string().trim().min(1, copy.phoneRequired).max(50, copy.phoneMax),
    preferredContact: z.enum(['email', 'phone', 'whatsapp'], {
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

function inferLocale(request: Request, formData?: FormData): Locale {
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

const emailCopy = {
  en: {
    htmlLang: 'en',
    dateLocale: 'en-US',
    tagline: 'Building a more intelligent world.',
    companySubject: 'New Contact Form Submission',
    companyTitle: 'New Contact Form Submission',
    companyPreheader: 'New contact form submission from',
    companyDetailsHeading: 'Contact Details',
    companyHello: 'Hello.',
    companyNameLead: 'My name is',
    companyReachLead: 'and you can reach me at',
    companyPhoneLead: 'or by phone at',
    companyPreferredLead: 'My preferred contact method is',
    companyInterestsLead: "I'm interested in",
    companySubjectLead: 'and the subject of my message is',
    companyMessageLead: "Here's what I'd like to share:",
    companySignoff: 'I look forward to hearing from you!',
    companyClosing: 'Best regards,',
    submittedOn: 'Submitted on',
    customerSubject: 'Thank you for contacting NOUS!',
    customerTitle: 'Thank you for contacting us!',
    customerPreheader: 'We received your message. Hermes will establish first contact shortly.',
    customerGreeting: 'Hi',
    customerThanks: 'Thank you for reaching out to',
    customerReceivedPrefix: "We've received your message about",
    customerReceivedSuffix: 'Hermes, our customer service and support agent, will help establish first contact and ask a few initial questions before we move forward. It seems like your preferred contact method is',
    whatNextHeading: 'What happens next?',
    whatNextItems: [
      'This confirmation lets you know the message arrived.',
      'Hermes will help clarify the first details.',
      "We'll use that context to define the most useful next step.",
    ],
    contactInfoHeading: 'Your Contact Information',
    emailLabel: 'E-mail',
    phoneLabel: 'Phone number',
    exploreText: 'In the meantime, feel free to explore our services and learn more about how we help organizations turn AI from isolated experiments into a working layer for better decisions, faster operations, smarter customer support, and systems that compound institutional knowledge.',
    servicesCta: 'Explore NOUS services',
    servicesUrl: 'https://nous.cr/services',
    customerClosing: 'Best regards,',
    notSpecified: 'Not specified',
  },
  es: {
    htmlLang: 'es',
    dateLocale: 'es-CR',
    tagline: 'Construyendo un mundo más inteligente.',
    companySubject: 'Nueva solicitud del formulario de contacto',
    companyTitle: 'Nueva solicitud del formulario de contacto',
    companyPreheader: 'Nueva solicitud de contacto de',
    companyDetailsHeading: 'Detalles del contacto',
    companyHello: 'Hola.',
    companyNameLead: 'Mi nombre es',
    companyReachLead: 'y pueden contactarme en',
    companyPhoneLead: 'o por teléfono al',
    companyPreferredLead: 'Mi método de contacto preferido es',
    companyInterestsLead: 'Me interesa',
    companySubjectLead: 'y el asunto de mi mensaje es',
    companyMessageLead: 'Esto es lo que me gustaría compartir:',
    companySignoff: '¡Quedo atento a su respuesta!',
    companyClosing: 'Saludos,',
    submittedOn: 'Enviado el',
    customerSubject: '¡Gracias por contactar a NOUS!',
    customerTitle: '¡Gracias por contactarnos!',
    customerPreheader: 'Recibimos tu mensaje. Hermes establecerá el primer contacto pronto.',
    customerGreeting: 'Hola',
    customerThanks: 'Gracias por contactar a',
    customerReceivedPrefix: 'Recibimos tu mensaje sobre',
    customerReceivedSuffix: 'Hermes, nuestro agente de atención y soporte, te ayudará a establecer el primer contacto y hará algunas preguntas iniciales antes de avanzar. Parece que tu método de contacto preferido es',
    whatNextHeading: '¿Qué sigue?',
    whatNextItems: [
      'Esta confirmación te avisa que el mensaje llegó.',
      'Hermes ayudará a aclarar los primeros detalles.',
      'Usaremos ese contexto para definir el siguiente paso más útil.',
    ],
    contactInfoHeading: 'Tu información de contacto',
    emailLabel: 'E-mail',
    phoneLabel: 'Número de teléfono',
    exploreText: 'Mientras tanto, puedes explorar nuestros servicios y conocer cómo ayudamos a las organizaciones a convertir la IA en una capa de trabajo para tomar mejores decisiones, operar con más claridad, atender mejor a sus clientes y construir sistemas que acumulen conocimiento institucional.',
    servicesCta: 'Explorar servicios de NOUS',
    servicesUrl: 'https://nous.cr/es/services',
    customerClosing: 'Saludos,',
    notSpecified: 'No especificado',
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

    const emailLocaleCopy = emailCopy[locale];
    const interestsText = interests && interests.length > 0
      ? interests.map(interest => {
          const interestLabels = locale === 'es'
            ? {
                'technology-advisory': 'Estrategia de IA',
                'ai-strategy': 'Estrategia de IA',
                'web-development': 'Agentes de IA',
                'ai-automation': 'Implementación de inteligencia',
                'automation': 'Automatización',
                'systems': 'Sistemas',
                'automation-agents': 'Automatización y agentes',
                'systems-integrations': 'Sistemas e integraciones',
                'training-adoption': 'Capacitación y adopción',
                'not-sure': 'No estoy seguro todavía',
              }
            : {
                'technology-advisory': 'AI Strategy',
                'ai-strategy': 'AI strategy',
                'web-development': 'AI Agents',
                'ai-automation': 'Intelligence Deployment',
                'automation': 'Automation',
                'systems': 'Systems',
                'automation-agents': 'Automation & agents',
                'systems-integrations': 'Systems & integrations',
                'training-adoption': 'Training & adoption',
                'not-sure': 'Not sure yet',
              };
          return interestLabels[interest as keyof typeof interestLabels] || interest;
        }).join(', ')
      : emailLocaleCopy.notSpecified;

    const runtimeEnv = getRuntimeEnv();
    const userAgent = request.headers.get('user-agent') || 'unknown';
    const submissionMetadata = buildContactSubmissionMetadata(request);
    const contactSubmissionId = await saveContactSubmission(runtimeEnv, {
      ...submissionMetadata,
      locale,
      name,
      email,
      phone,
      preferredContact,
      interests,
      interestsText,
      subject,
      message,
      ipAddress: clientIp,
      userAgent,
      sourcePath: getContactSourcePath(request),
    }).catch((error) => {
      console.error('Contact database save error:', {
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      });
      return null;
    });

    const updateSavedSubmissionStatus = async (update: ContactEmailDeliveryUpdate) => {
      await updateContactSubmissionEmailStatus(runtimeEnv, contactSubmissionId, update).catch((error) => {
        console.error('Contact database status update error:', {
          error: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date().toISOString(),
        });
      });
    };

    const { RESEND_API_KEY, CONTACT_RECIPIENT_EMAIL } = runtimeEnv;
    if (!RESEND_API_KEY) {
      await updateSavedSubmissionStatus({
        status: import.meta.env.DEV ? 'skipped' : 'failed',
        errorMessage: 'RESEND_API_KEY is not configured',
      });

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
    const safeInterestsText = escapeHtml(interestsText);

    // Format preferred contact method for display
    const formatPreferredContact = (method: string) => {
      switch(method) {
        case 'email': return 'E-mail';
        case 'phone': return locale === 'es' ? 'Llamada Telefónica' : 'Phone Call';
        case 'whatsapp': return 'WhatsApp';
        default: return method;
      }
    };

    const formattedPreferredContact = formatPreferredContact(preferredContact);
    const safePreferredContact = escapeHtml(formattedPreferredContact);
    const submittedDate = new Date().toLocaleString(emailLocaleCopy.dateLocale, {
      timeZone: 'America/Costa_Rica',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    const customerNextRows = emailLocaleCopy.whatNextItems.map((item, index) => `
                              <tr>
                                <td width="18" valign="top" style="color: #DCD4FF; font-size: 17px; line-height: 1.55${index === 0 ? '' : '; padding-top: 8px'};">&bull;</td>
                                <td style="color: #D8D3EA; font-size: 15px; line-height: 1.55${index === 0 ? '' : '; padding-top: 8px'};">${item}</td>
                              </tr>
    `).join('');

    const companyEmailHtml = `
      <!DOCTYPE html>
      <html lang="${emailLocaleCopy.htmlLang}">
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${emailLocaleCopy.companyTitle}</title>
        </head>
        <body style="margin: 0; padding: 0; background: #F3F0FF; color: #F7F3FF; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;">
          <div style="display: none; max-height: 0; overflow: hidden; opacity: 0; color: transparent;">
            ${emailLocaleCopy.companyPreheader} ${safeName}.
          </div>

          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background: #F3F0FF; background: linear-gradient(135deg, #FFFFFF 0%, #F5F1FF 46%, #DCD4FF 100%); margin: 0; padding: 40px 16px 48px 16px;">
            <tr>
              <td align="center">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 640px; border-collapse: separate; border-spacing: 0; overflow: hidden; background: #070116; border: 1px solid #2A2341; border-radius: 8px;">
                  <tr>
                    <td style="padding: 34px 28px 24px 28px; background: #060114; border-bottom: 1px solid #2A2341; text-align: center;">
                      <img src="https://nous.cr/images/nous-email-logo.png" width="176" height="176" alt="NOUS" style="display: block; width: 176px; height: 176px; margin: 0 auto 16px auto; border: 0;">
                      <p style="margin: 0; color: #FFFFFF; font-size: 13px; font-weight: 700; letter-spacing: 0; text-transform: uppercase;">NOUS</p>
                      <p style="margin: 5px 0 0 0; color: #BEB7D8; font-size: 14px; line-height: 1.5;">${emailLocaleCopy.tagline}</p>
                      <h1 style="margin: 28px 0 0 0; color: #FFFFFF; font-size: 30px; line-height: 1.15; font-weight: 600; letter-spacing: 0;">${emailLocaleCopy.companyTitle}</h1>
                    </td>
                  </tr>

                  <tr>
                    <td style="padding: 32px 28px 28px 28px;">
                      <h2 style="margin: 0 0 18px 0; color: #FFFFFF; font-size: 18px; line-height: 1.3; font-weight: 600; letter-spacing: 0;">${emailLocaleCopy.companyDetailsHeading}</h2>

                      <p style="margin: 0 0 24px 0; color: #DED9EE; font-size: 16px; line-height: 1.7; text-align: justify; text-justify: inter-word;">
                        ${emailLocaleCopy.companyHello}<br><br>
                        ${emailLocaleCopy.companyNameLead} <strong style="color: #FFFFFF;">${safeName}</strong> ${emailLocaleCopy.companyReachLead} <a href="mailto:${safeEmail}" style="color: #DCD4FF; text-decoration: none;">${safeEmail}</a>${safePhone ? ` ${emailLocaleCopy.companyPhoneLead} <strong style="color: #FFFFFF;">${safePhone}</strong>` : ''}.<br><br>
                        ${preferredContact ? `${emailLocaleCopy.companyPreferredLead} <em style="color: #FFFFFF;">${safePreferredContact}</em>.<br><br>` : ''}
                        ${emailLocaleCopy.companyInterestsLead} <em style="color: #FFFFFF;">${safeInterestsText}</em> ${emailLocaleCopy.companySubjectLead} <em style="color: #FFFFFF;">&quot;${safeSubject}&quot;</em>.<br><br>
                        ${emailLocaleCopy.companyMessageLead}
                      </p>

                      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin: 0 0 24px 0; border-top: 1px solid #2A2341; border-bottom: 1px solid #2A2341;">
                        <tr>
                          <td style="padding: 22px 0;">
                            <p style="margin: 0; color: #D8D3EA; font-size: 15px; line-height: 1.7; white-space: pre-wrap;">${safeMessage}</p>
                          </td>
                        </tr>
                      </table>

                      <p style="margin: 0; color: #DED9EE; font-size: 16px; line-height: 1.7;">${emailLocaleCopy.companySignoff}<br><br>${emailLocaleCopy.companyClosing}<br><strong style="color: #FFFFFF;">${safeName}</strong></p>
                    </td>
                  </tr>

                  <tr>
                    <td style="padding: 22px 28px 30px 28px; border-top: 1px solid #2B2343; background: #04000F;">
                      <p style="margin: 0; color: #BEB7D8; font-size: 13px; line-height: 1.6; text-align: center;">${emailLocaleCopy.submittedOn} ${submittedDate}</p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `;

    const clientEmailHtml = `
      <!DOCTYPE html>
      <html lang="${emailLocaleCopy.htmlLang}">
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${emailLocaleCopy.customerTitle}</title>
        </head>
        <body style="margin: 0; padding: 0; background: #F3F0FF; color: #F7F3FF; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;">
          <div style="display: none; max-height: 0; overflow: hidden; opacity: 0; color: transparent;">
            ${emailLocaleCopy.customerPreheader}
          </div>

          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background: #F3F0FF; background: linear-gradient(135deg, #FFFFFF 0%, #F5F1FF 46%, #DCD4FF 100%); margin: 0; padding: 40px 16px 48px 16px;">
            <tr>
              <td align="center">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 640px; border-collapse: separate; border-spacing: 0; overflow: hidden; background: #070116; border: 1px solid #2A2341; border-radius: 8px;">
                  <tr>
                    <td style="padding: 34px 28px 24px 28px; background: #060114; border-bottom: 1px solid #2A2341; text-align: center;">
                      <img src="https://nous.cr/images/nous-email-logo.png" width="176" height="176" alt="NOUS" style="display: block; width: 176px; height: 176px; margin: 0 auto 16px auto; border: 0;">
                      <p style="margin: 0; color: #FFFFFF; font-size: 13px; font-weight: 700; letter-spacing: 0; text-transform: uppercase;">NOUS</p>
                      <p style="margin: 5px 0 0 0; color: #BEB7D8; font-size: 14px; line-height: 1.5;">${emailLocaleCopy.tagline}</p>
                      <h1 style="margin: 28px 0 0 0; color: #FFFFFF; font-size: 30px; line-height: 1.15; font-weight: 600; letter-spacing: 0;">${emailLocaleCopy.customerTitle}</h1>
                    </td>
                  </tr>

                  <tr>
                    <td style="padding: 32px 28px 28px 28px;">
                      <p style="margin: 0 0 20px 0; color: #F7F3FF; font-size: 17px; line-height: 1.65;">${emailLocaleCopy.customerGreeting} ${safeName},</p>

                      <p style="margin: 0 0 18px 0; color: #DED9EE; font-size: 16px; line-height: 1.7; text-align: justify; text-justify: inter-word;">${emailLocaleCopy.customerThanks} <strong style="color: #FFFFFF;">NOUS</strong>.</p>

                      <p style="margin: 0 0 28px 0; color: #DED9EE; font-size: 16px; line-height: 1.7; text-align: justify; text-justify: inter-word;">
                        ${emailLocaleCopy.customerReceivedPrefix} <em style="color: #FFFFFF;">&quot;${safeSubject}&quot;</em>. ${emailLocaleCopy.customerReceivedSuffix} <em style="color: #FFFFFF;">&quot;${safePreferredContact}&quot;</em>.
                      </p>

                      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin: 0 0 28px 0; border-top: 1px solid #2A2341; border-bottom: 1px solid #2A2341;">
                        <tr>
                          <td style="padding: 22px 0;">
                            <h2 style="margin: 0 0 16px 0; color: #FFFFFF; font-size: 18px; line-height: 1.3; font-weight: 600; letter-spacing: 0;">${emailLocaleCopy.whatNextHeading}</h2>
                            <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                              ${customerNextRows}
                            </table>
                          </td>
                        </tr>
                      </table>

                      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin: 0 0 28px 0;">
                        <tr>
                          <td>
                            <h2 style="margin: 0 0 14px 0; color: #FFFFFF; font-size: 18px; line-height: 1.3; font-weight: 600; letter-spacing: 0;">${emailLocaleCopy.contactInfoHeading}</h2>
                            <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                              <tr>
                                <td width="18" valign="top" style="color: #DCD4FF; font-size: 17px; line-height: 1.55;">&bull;</td>
                                <td style="color: #D8D3EA; font-size: 15px; line-height: 1.55;">${emailLocaleCopy.emailLabel}: <a href="mailto:${safeEmail}" style="color: #DCD4FF; text-decoration: none;">${safeEmail}</a></td>
                              </tr>
                              <tr>
                                <td width="18" valign="top" style="color: #DCD4FF; font-size: 17px; line-height: 1.55; padding-top: 8px;">&bull;</td>
                                <td style="color: #D8D3EA; font-size: 15px; line-height: 1.55; padding-top: 8px;">${emailLocaleCopy.phoneLabel}: ${safePhone}</td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                      </table>

                      <p style="margin: 0 0 24px 0; color: #DED9EE; font-size: 16px; line-height: 1.7; text-align: justify; text-justify: inter-word;">
                        ${emailLocaleCopy.exploreText}
                      </p>

                      <table role="presentation" cellspacing="0" cellpadding="0" style="margin: 0 0 30px 0;">
                        <tr>
                          <td style="background: #DCD4FF; border-radius: 8px;">
                            <a href="${emailLocaleCopy.servicesUrl}" target="_blank" style="display: inline-block; padding: 13px 18px; color: #060114; font-size: 14px; font-weight: 700; line-height: 1; text-decoration: none;">${emailLocaleCopy.servicesCta}</a>
                          </td>
                        </tr>
                      </table>

                      <p style="margin: 0; color: #DED9EE; font-size: 16px; line-height: 1.7;">${emailLocaleCopy.customerClosing}<br><strong style="color: #FFFFFF;">NOUS</strong></p>
                    </td>
                  </tr>

                  <tr>
                    <td style="padding: 22px 28px 30px 28px; border-top: 1px solid #2B2343; background: #04000F;">
                      <p style="margin: 0; color: #BEB7D8; font-size: 13px; line-height: 1.6; text-align: center;"><a href="mailto:hello@nous.cr" style="color: #DCD4FF; text-decoration: none;">hello@nous.cr</a> | <a href="https://wa.me/50661865634" style="color: #DCD4FF; text-decoration: none;">+506 6186-5634</a> | San José, Costa Rica</p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `;

    // Send e-mails.
    const companyEmailResult = await resend.emails.send({
      from: 'NOUS <noreply@nous.cr>',
      to: [CONTACT_RECIPIENT_EMAIL || 'hello@nous.cr'],
      subject: emailLocaleCopy.companySubject,
      html: companyEmailHtml,
      replyTo: email
    });

    const clientEmailResult = await resend.emails.send({
      from: 'NOUS <noreply@nous.cr>',
      to: [email],
      subject: emailLocaleCopy.customerSubject,
      html: clientEmailHtml
    });

    if (companyEmailResult.error || clientEmailResult.error) {
      console.error('Contact e-mail delivery error:', {
        companyError: companyEmailResult.error ? 'delivery_failed' : null,
        clientError: clientEmailResult.error ? 'delivery_failed' : null
      });

      await updateSavedSubmissionStatus({
        status: 'failed',
        internalEmailId: companyEmailResult.data?.id,
        confirmationEmailId: clientEmailResult.data?.id,
        errorMessage: [
          companyEmailResult.error ? 'internal_email_failed' : null,
          clientEmailResult.error ? 'confirmation_email_failed' : null,
        ].filter(Boolean).join('; '),
      });

      return new Response(JSON.stringify({
        success: false,
        message: responseCopy[locale].sendError
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    await updateSavedSubmissionStatus({
      status: 'sent',
      internalEmailId: companyEmailResult.data?.id,
      confirmationEmailId: clientEmailResult.data?.id,
    });

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
