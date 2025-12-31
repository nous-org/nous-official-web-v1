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

export async function GET({ request, locals }: APIContext) {
  try {
    await requireClerk(request, locals.runtime.env as { CLERK_SECRET_KEY: string });

    const db = createDbClient(locals.runtime.env as { TURSO_DATABASE_URL: string; TURSO_AUTH_TOKEN?: string });
    
    // Get all posts (both drafts and published)
    const result = await db.execute(
      'SELECT id, slug, title, status, updatedAt FROM posts ORDER BY updatedAt DESC'
    );

    const posts = result.rows.map((row: any) => ({
      id: row.id,
      slug: row.slug,
      title: row.title,
      published_at: row.status === 'PUBLISHED' ? new Date(row.updatedAt).toISOString() : null,
      updated_at: new Date(row.updatedAt).toISOString()
    }));

    return json(posts);

  } catch (error) {
    console.error('Error listing blog posts:', error);
    
    return json({
      success: false,
      message: 'Error listing blog posts',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
}
