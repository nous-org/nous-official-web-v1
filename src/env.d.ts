/// <reference types="astro/client" />

// Describe solo lo que realmente usas
export interface Env {
  RESEND_API_KEY:      string;
  TURSO_DATABASE_URL:  string;
  TURSO_AUTH_TOKEN:    string;
  SESSION:             KVNamespace;   // si tienes el KV
}

declare module 'astro' {
  interface Locals {
    runtime: {
      env: Env;
    };
  }
  }