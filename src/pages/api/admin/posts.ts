import type { APIContext } from 'astro';
import { createDbClient } from '@/lib/db';
import { requireClerk } from '@/lib/auth';

export const prerender = false;

export async function GET(ctx: APIContext) {
  const env = ctx.locals.runtime.env as {
    TURSO_DATABASE_URL: string;
    TURSO_AUTH_TOKEN?: string;
  };

  await requireClerk(ctx.request, ctx.locals.runtime.env as any);

  const db = createDbClient(env);
  const rs = await db.execute({
    sql: `SELECT id, slug, title, published_at, updated_at FROM posts ORDER BY updated_at DESC`,
    args: [],
  });

  return new Response(JSON.stringify(rs.rows), {
    headers: { 'content-type': 'application/json', 'cache-control': 'no-store' },
  });
}

export async function POST(ctx: APIContext) {
  const env = ctx.locals.runtime.env as {
    TURSO_DATABASE_URL: string;
    TURSO_AUTH_TOKEN?: string;
    CLERK_SECRET_KEY: string;
  };

  try {
    await requireClerk(ctx.request, env);
  } catch {
    return new Response('Unauthorized', { status: 401 });
  }

  const db = createDbClient(env);
  const body = await ctx.request.json().catch(() => null) as null | {
    id?: number;
    title: string;
    slug: string;
    contentJson: unknown;
    contentHtml: string;
    publish?: boolean;
  };

  if (!body || !body.title || !body.slug || !body.contentHtml || !body.contentJson) {
    return new Response('Bad Request', { status: 400 });
  }

  const now = new Date().toISOString();
  const publishedAt = body.publish ? now : null;

  if (body.id) {
    await db.execute({
      sql: `
        UPDATE posts
        SET title = ?, slug = ?, content_json = ?, content_html = ?, updated_at = ?, published_at = CASE WHEN ? IS NOT NULL THEN ? ELSE published_at END
        WHERE id = ?
      `,
      args: [body.title, body.slug, JSON.stringify(body.contentJson), body.contentHtml, now, publishedAt, publishedAt, body.id],
    });
  } else {
    await db.execute({
      sql: `
        INSERT INTO posts (title, slug, content_json, content_html, published_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?)
      `,
      args: [body.title, body.slug, JSON.stringify(body.contentJson), body.contentHtml, publishedAt, now],
    });
  }

  return new Response(null, { status: 204, headers: { 'cache-control': 'no-store' } });
}