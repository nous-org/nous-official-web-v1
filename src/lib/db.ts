import { createClient, type Client } from '@libsql/client/web';

export function createDbClient(env: { TURSO_DATABASE_URL: string; TURSO_AUTH_TOKEN?: string }): Client {
  return createClient({
    url: env.TURSO_DATABASE_URL,
    authToken: env.TURSO_AUTH_TOKEN,
  });
}