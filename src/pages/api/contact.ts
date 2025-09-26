import type { APIRoute } from 'astro';
import { z } from 'astro:schema';
import { Resend } from 'resend';

const contactSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be less than 100 characters'),
  email: z.string().email('Please enter a valid email address'),
  subject: z.string().min(1, 'Subject is required').max(200, 'Subject must be less than 200 characters'),
  message: z.string().min(10, 'Message must be at least 10 characters').max(2000, 'Message must be less than 2000 characters'),
  phone: z.string().optional(),
  preferredContact: z.enum(['email', 'whatsapp', 'phone', 'video-call', 'any'], {
    errorMap: () => ({ message: 'Please select a valid preferred contact method' })
  }),
  interests: z.array(z.string()).optional().default([])
});

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const { RESEND_API_KEY } = locals.runtime.env;
    const resend = new Resend(RESEND_API_KEY);
    
    // Extraer datos del formulario
    const formData = await request.formData();
    const rawData = {
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      subject: formData.get('subject') as string,
      message: formData.get('message') as string,
      phone: formData.get('phone') as string,
      preferredContact: formData.get('preferredContact') as string,
      interests: formData.getAll('interests') as string[] // Para múltiples checkboxes
    };

    // Validar con zod
    const validatedData = contactSchema.parse(rawData);
    const { name, email, subject, message, phone, preferredContact, interests } = validatedData;
    
    const interestsText = interests && interests.length > 0 
      ? interests.map(interest => {
          switch(interest) {
            case 'technology-advisory': return 'Technology Advisory';
            case 'web-development': return 'Web Development';
            case 'ai-automation': return 'AI Automation';
            default: return interest;
          }
        }).join(', ')
      : 'Not specified';

    // Format preferred contact method for display
    const formatPreferredContact = (method: string) => {
      switch(method) {
        case 'email': return 'Email';
        case 'whatsapp': return 'WhatsApp';
        case 'phone': return 'Phone Call';
        case 'video-call': return 'Video Call';
        case 'any': return 'Any method is fine';
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
          <title>New Contact Form Submission - Nous Technologies</title>
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 1000px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #060114 0%, #04000F 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 24px;">New Contact Form Submission</h1>
            <p style="color: white; margin: 10px 0 0 0; opacity: 0.9;">Nous Technologies</p>
          </div>
          
          <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
            <div style="background: white; padding: 25px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
              <h2 style="color: #060114; margin-top: 0; font-size: 20px;">Contact Details</h2>
              
              <div style="font-family: Arial, Helvetica, sans-serif; line-height: 1.6; color:#333;">
                <p>
                  <strong>Hello!</strong> 👋<br><br>
                  My name is <strong>${name}</strong> and you can reach me at
                  <a href="mailto:${email}" style="color:#060114; text-decoration:none;">
                    ${email}
                  </a>${phone ? ` or by phone at <strong>${phone}</strong>` : ''}.<br><br>
                  ${preferredContact ? `My preferred contact method is <em>${formattedPreferredContact}</em>.<br><br>` : ''}
                  I'm interested in <em>${interestsText}</em> and the subject of my message is
                  <strong>"${subject}"</strong>.<br><br>
                  Here's what I'd like to share:
                </p>

                <div style="background:#f8f9fa; padding:15px; border-radius:5px; border-left:4px solid #060114; margin:15px 0;">
                  <p style="margin:0; white-space:pre-wrap;">${message}</p>
                </div>

                <p>
                  I look forward to hearing from you!<br>
                  Best regards,
                </p>
                <p><strong>${name}</strong></p>
              </div>
              
              <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; text-align: center;">
                <p style="color: #666; font-size: 14px; margin: 0;">
                  Submitted on ${new Date().toLocaleString('en-US', { 
                    timeZone: 'America/Mexico_City',
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
          <title>Thank you for contacting Nous Technologies</title>
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 1000px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #060114 0%, #04000F 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 24px;">Thank You for Contacting Us!</h1>
            <p style="color: white; margin: 10px 0 0 0; opacity: 0.9;">Nous Technologies</p>
          </div>
          
          <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
            <div style="background: white; padding: 25px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
              <p style="font-size: 16px; margin-top: 0;">Hi ${name},</p>
              
              <p style="font-size: 16px; margin: 20px 0;">
                Thank you for reaching out to <strong>Nous Technologies</strong>! 🚀<br><br>
                We've received your message about <em>"${subject}"</em> and our team will review it carefully. 
                ${preferredContact ? `We'll contact you via your preferred method: <strong>${formattedPreferredContact}</strong>.` : 'We\'ll get back to you via email.'}<br><br>
                <strong>What happens next?</strong><br>
                • We'll review your project details within 1 business day<br>
                • Our team will prepare a personalized response<br>
                • We'll reach out with next steps and any questions
              </p>
              
              <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #060114;">
                <h3 style="color: #060114; margin-top: 0; font-size: 18px;">Your Contact Information</h3>
                <p style="margin: 10px 0;">Email: <a href="mailto:${email}" style="color:#060114; text-decoration:none;">${email}</a></p>
                ${phone ? `<p style="margin: 10px 0;">Phone: <strong>${phone}</strong></p>` : ''}
              </div>
              
              <p style="font-size: 16px;">In the meantime, feel free to explore our services and learn more about how we can help transform your business with AI automation, web development, and technology consulting.</p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="https://nous.cr/services" target="_blank" style="background: #060114; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Explore Our Services</a>
              </div>
              
              <p style="font-size: 16px;">Best regards,<br>
              <strong>The Nous Technologies Team</strong></p>
              
              <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; text-align: center;">
                <p style="color: #666; font-size: 14px; margin: 5px 0;">
                  <strong>Nous Technologies</strong><br>
                  Intelligent Automation | Web Development | AI Consulting
                </p>
                <p style="color: #666; font-size: 12px; margin: 10px 0 0 0;">
                  This is an automated response. Please do not reply to this email.
                </p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;

    // Enviar emails
    const companyEmailResult = await resend.emails.send({
      from: 'Contact Form <noreply@nous.cr>',
      to: ['contacto@nous.cr'], 
      subject: `New Contact: ${subject}`,
      html: companyEmailHtml,
      replyTo: email
    });

    const clientEmailResult = await resend.emails.send({
      from: 'Nous Technologies <noreply@nous.cr>',
      to: [email],
      subject: 'Thank you for contacting Nous Technologies',
      html: clientEmailHtml
    });

    if (companyEmailResult.error || clientEmailResult.error) {
      console.error('Email sending error:', {
        companyError: companyEmailResult.error,
        clientError: clientEmailResult.error
      });
      
      return new Response(JSON.stringify({
        success: false,
        message: 'There was an error sending your message. Please try again or contact us directly.',
        error: 'Email delivery failed'
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({
      success: true,
      message: 'Thank you for your message! We\'ll get back to you within 24 hours.',
      data: {
        companyEmailId: companyEmailResult.data?.id,
        clientEmailId: clientEmailResult.data?.id
      }
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Contact form submission error:', error);
    
    // Manejar errores de validación de zod
    if (error instanceof z.ZodError) {
      return new Response(JSON.stringify({
        success: false,
        message: 'Please check your form data',
        errors: error.errors
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    return new Response(JSON.stringify({
      success: false,
      message: 'There was an error processing your request. Please try again later.',
      error: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};