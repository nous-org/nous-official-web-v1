/// <reference types="astro/client" />

interface Env {
  SITE_URL?: string;
  CONTACT_RECIPIENT_EMAIL?: string;
  SUPPORT_EMAIL?: string;
  RESEND_API_KEY?: string;
  TURSO_DATABASE_URL?: string;
  TURSO_AUTH_TOKEN?: string;
  TURSO_NEWSLETTER_URL?: string;
  TURSO_NEWSLETTER_TOKEN?: string;
  SESSION?: KVNamespace;
  OAUTH_BASE_URL?: string;
  CLERK_PUBLISHABLE_KEY?: string;
  CLERK_SECRET_KEY?: string;
  CLERK_ADMIN_USER_IDS?: string;
  CLERK_ADMIN_ORG_IDS?: string;
  CLERK_ADMIN_ORG_ROLES?: string;
  CLERK_ADMIN_SESSION_CLAIM?: string;
  CLERK_ADMIN_SESSION_CLAIM_VALUES?: string;
}

declare namespace App {
  interface Locals {
    runtime: {
      env: Env;
    };
  }
}
