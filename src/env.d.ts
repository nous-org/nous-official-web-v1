/// <reference types="astro/client" />

// Describe solo lo que realmente usas
export interface Env {
  RESEND_API_KEY:      string;
  TURSO_DATABASE_URL:  string;
  TURSO_AUTH_TOKEN:    string;
  GITHUB_CLIENT_ID:    string;
  TURSO_NEWSLETTER_URL: string;
  TURSO_NEWSLETTER_TOKEN: string;
  GITHUB_CLIENT_SECRET: string;
  SESSION:             KVNamespace;
  OAUTH_BASE_URL: string;
  CLERK_PUBLISHABLE_KEY: string;
  CLERK_SECRET_KEY: string;
}

declare module 'astro' {
  interface Locals {
    runtime: {
      env: Env;
    };
  }
  }