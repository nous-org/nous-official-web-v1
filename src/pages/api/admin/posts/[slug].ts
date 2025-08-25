import type { APIContext } from 'astro';
import { createDbClient } from '@/lib/db';
import { requireClerk } from '@/lib/auth';

function json(data: unknown, init: number | ResponseInit = 200) {
  const initObj = typeof init === 'number' ? { status: init } : init;
  return new Response(JSON.stringify(data), {
    ...initObj,
    headers: { 'content-type': 'application/json', ...(initObj as ResponseInit).headers },
  });
}

export async function DELETE({ params, locals, request }: APIContext) {
  await requireClerk(request, locals.runtime.env as { CLERK_SECRET_KEY: string });

  const slug = params?.slug?.trim();
  if (!slug) return json({ error: 'Missing slug' }, 400);

  const db = createDbClient(locals.runtime.env as { TURSO_DATABASE_URL: string; TURSO_AUTH_TOKEN?: string });

  // Solo elimina si está publicado
  await db.execute('DELETE FROM posts WHERE slug = ? AND published_at IS NOT NULL', [slug]);

  return new Response(null, { status: 204 });
}