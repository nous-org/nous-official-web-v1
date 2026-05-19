/// <reference types="astro/client" />

interface Env {
  SITE_URL?: string;
  CONTACT_RECIPIENT_EMAIL?: string;
  SUPPORT_EMAIL?: string;
  RESEND_API_KEY?: string;
  TURSO_DATABASE_URL?: string;
  TURSO_AUTH_TOKEN?: string;
  TURSO_CONTACT_URL?: string;
  TURSO_CONTACT_TOKEN?: string;
  TURSO_NEWSLETTER_URL?: string;
  TURSO_NEWSLETTER_TOKEN?: string;
  SESSION?: KVNamespace;
  OAUTH_BASE_URL?: string;
  CLERK_SECRET_KEY?: string;
  OPENAI_API_KEY?: string;
  OPENAI_MODEL?: string;
  OPENAI_CHATBOT_ENABLED?: string;
  OPENAI_CHATBOT_STORE_RESPONSES?: string;
  OPENAI_VECTOR_STORE_ID?: string;
}

declare namespace App {
  interface Locals {
    runtime: {
      env: Env;
    };
  }
}
