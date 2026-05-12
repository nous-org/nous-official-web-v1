import type { APIContext } from 'astro';
import { createDbClient } from '@/lib/db';
import { authErrorResponse, requireClerk } from '@/lib/auth';
import { getRuntimeEnv } from '@/lib/runtime-env';

function json(data: unknown, init: number | ResponseInit = 200) {
  const initObj = typeof init === 'number' ? { status: init } : init;
  return new Response(JSON.stringify(data), {
    ...initObj,
    headers: { 'content-type': 'application/json', ...(initObj as ResponseInit).headers },
  });
}

export async function DELETE({ params, request }: APIContext) {
  const env = getRuntimeEnv();

  try {
    await requireClerk(request, env);
  } catch (error) {
    return authErrorResponse(error);
  }

  const slug = params?.slug?.trim();
  if (!slug) return json({ error: 'Missing slug' }, 400);

  const db = createDbClient(env as { TURSO_DATABASE_URL: string; TURSO_AUTH_TOKEN?: string });

  // Only delete published posts from this endpoint.
  await db.execute('DELETE FROM posts WHERE slug = ? AND status = ?', [slug, 'PUBLISHED']);

  return new Response(null, { status: 204 });
}
