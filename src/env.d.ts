/// <reference types="astro/client" />

// Describe solo lo que realmente usas
export interface Env {
  RESEND_API_KEY:      string;
  TURSO_DATABASE_URL:  string;
  TURSO_AUTH_TOKEN:    string;
  GITHUB_CLIENT_ID:    string;
  GITHUB_CLIENT_SECRET: string;
  SESSION:             KVNamespace;
  OAUTH_BASE_URL: string;
}

declare module 'astro' {
  interface Locals {
    runtime: {
      env: Env;
    };
  }
  }