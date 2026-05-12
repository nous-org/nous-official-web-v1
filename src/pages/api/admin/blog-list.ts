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

export async function GET({ request }: APIContext) {
  try {
    const env = getRuntimeEnv();
    await requireClerk(request, env);

    const db = createDbClient(env as { TURSO_DATABASE_URL: string; TURSO_AUTH_TOKEN?: string });
    
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
    if ((error as { name?: string })?.name === 'AuthError') {
      return authErrorResponse(error);
    }

    console.error('Error listing blog posts:', error);
    
    return json({
      success: false,
      message: 'Error listing blog posts',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
}
