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

export async function GET({ params, locals, request }: APIContext) {
  await requireClerk(request, locals.runtime.env as { CLERK_SECRET_KEY: string });

  const slug = params?.slug?.trim();
  if (!slug) return json({ error: 'Missing slug' }, 400);

  const db = createDbClient(locals.runtime.env as { TURSO_DATABASE_URL: string; TURSO_AUTH_TOKEN?: string });
  const rs = await db.execute(
    'SELECT slug, title, content FROM posts WHERE slug = ? AND status = ?',
    [slug, 'DRAFT']
  );

  if (rs.rows.length === 0) return json({ error: 'Draft not found' }, 404);

  const row = rs.rows[0] as any;
  return json({ draft: { slug: row.slug, title: row.title, content_html: row.content } });
}

export async function PATCH({ params, locals, request }: APIContext) {
  await requireClerk(request, locals.runtime.env as { CLERK_SECRET_KEY: string });

  const slug = params?.slug?.trim();
  if (!slug) return json({ error: 'Missing slug' }, 400);

  let body: any;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Invalid JSON' }, 400);
  }

  const updates: string[] = [];
  const values: any[] = [];

  if (typeof body.title === 'string') {
    const title = body.title.trim();
    if (title.length === 0) return json({ error: 'title cannot be empty' }, 400);
    updates.push('title = ?');
    values.push(title);
  }

  if (typeof body.content_html === 'string') {
    const content = body.content_html;
    // si quieres limitar tamaño, valida aquí
    updates.push('content = ?');
    values.push(content);
  }

  if (updates.length === 0) return json({ error: 'No valid fields to update' }, 400);

  const db = createDbClient(locals.runtime.env as { TURSO_DATABASE_URL: string; TURSO_AUTH_TOKEN?: string });
  // Asegura que solo actualizas drafts
  updates.push('updatedAt = ?');
  values.push(Date.now());
  
  const sql = `UPDATE posts SET ${updates.join(', ')} WHERE slug = ? AND status = ?`;
  values.push(slug, 'DRAFT');

  await db.execute(sql, values);

  // Devuelve el borrador actualizado
  const rs = await db.execute(
    'SELECT slug, title, content FROM posts WHERE slug = ? AND status = ?',
    [slug, 'DRAFT']
  );
  if (rs.rows.length === 0) return json({ error: 'Draft not found after update' }, 404);

  const row = rs.rows[0] as any;
  return json({ draft: { slug: row.slug, title: row.title, content_html: row.content } });
}

export async function DELETE({ params, locals, request }: APIContext) {
  await requireClerk(request, locals.runtime.env as { CLERK_SECRET_KEY: string });

  const slug = params?.slug?.trim();
  if (!slug) return json({ error: 'Missing slug' }, 400);

  const db = createDbClient(locals.runtime.env as { TURSO_DATABASE_URL: string; TURSO_AUTH_TOKEN?: string });

  // Solo elimina si es borrador
  await db.execute('DELETE FROM posts WHERE slug = ? AND status = ?', [slug, 'DRAFT']);

  // Puedes verificar existencia previa, pero para simplicidad retornamos 204
  return new Response(null, { status: 204 });
}