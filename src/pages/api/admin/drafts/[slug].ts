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

export async function GET({ params, request }: APIContext) {
  const env = getRuntimeEnv();

  try {
    await requireClerk(request, env);
  } catch (error) {
    return authErrorResponse(error);
  }

  const slug = params?.slug?.trim();
  if (!slug) return json({ error: 'Missing slug' }, 400);

  const db = createDbClient(env as { TURSO_DATABASE_URL: string; TURSO_AUTH_TOKEN?: string });
  const rs = await db.execute(
    'SELECT slug, title, content FROM posts WHERE slug = ? AND status = ?',
    [slug, 'DRAFT']
  );

  if (rs.rows.length === 0) return json({ error: 'Draft not found' }, 404);

  const row = rs.rows[0] as any;
  return json({ draft: { slug: row.slug, title: row.title, content_html: row.content } });
}

export async function PATCH({ params, request }: APIContext) {
  const env = getRuntimeEnv();

  try {
    await requireClerk(request, env);
  } catch (error) {
    return authErrorResponse(error);
  }

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
    updates.push('content = ?');
    values.push(content);
  }

  if (updates.length === 0) return json({ error: 'No valid fields to update' }, 400);

  const db = createDbClient(env as { TURSO_DATABASE_URL: string; TURSO_AUTH_TOKEN?: string });
  // Only update draft posts from this endpoint.
  updates.push('updatedAt = ?');
  values.push(Date.now());
  
  const sql = `UPDATE posts SET ${updates.join(', ')} WHERE slug = ? AND status = ?`;
  values.push(slug, 'DRAFT');

  await db.execute(sql, values);

  // Return the updated draft.
  const rs = await db.execute(
    'SELECT slug, title, content FROM posts WHERE slug = ? AND status = ?',
    [slug, 'DRAFT']
  );
  if (rs.rows.length === 0) return json({ error: 'Draft not found after update' }, 404);

  const row = rs.rows[0] as any;
  return json({ draft: { slug: row.slug, title: row.title, content_html: row.content } });
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

  // Only delete draft posts from this endpoint.
  await db.execute('DELETE FROM posts WHERE slug = ? AND status = ?', [slug, 'DRAFT']);

  return new Response(null, { status: 204 });
}
