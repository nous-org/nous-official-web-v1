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

export async function GET({ params, request, locals }: APIContext) {
  try {
    await requireClerk(request, locals.runtime.env as { CLERK_SECRET_KEY: string });

    const { slug } = params;
    
    if (!slug) {
      return json({
        success: false,
        message: 'Slug is required'
      }, 400);
    }

    const db = createDbClient(locals.runtime.env as { TURSO_DATABASE_URL: string; TURSO_AUTH_TOKEN?: string });
    
    const result = await db.execute(
      'SELECT slug, title, content FROM posts WHERE slug = ?',
      [slug]
    );
    
    if (result.rows.length === 0) {
      return json({
        success: false,
        message: 'Blog post not found'
      }, 404);
    }

    const row = result.rows[0] as any;
    const markdownContent = row.content;
    
    // Parse frontmatter and content from stored markdown
    const frontmatterMatch = markdownContent.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
    
    if (!frontmatterMatch) {
      return json({
        success: false,
        message: 'Invalid markdown format'
      }, 400);
    }

    const [, frontmatterText, content] = frontmatterMatch;
    
    // Parse frontmatter (simple YAML parsing)
    const frontmatter: any = {};
    const lines = frontmatterText.split('\n');
    let inAuthor = false;
    
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;
      
      if (trimmed === 'author:') {
        inAuthor = true;
        frontmatter.author = {};
        continue;
      }
      
      if (inAuthor && trimmed.startsWith('  ')) {
        const [key, ...valueParts] = trimmed.substring(2).split(':');
        const value = valueParts.join(':').trim().replace(/^"(.*)"$/, '$1');
        frontmatter.author[key.trim()] = value;
        continue;
      } else if (inAuthor) {
        inAuthor = false;
      }
      
      if (trimmed.includes(':')) {
        const [key, ...valueParts] = trimmed.split(':');
        const value = valueParts.join(':').trim();
        
        if (key === 'tags' && value.startsWith('[') && value.endsWith(']')) {
          // Parse array
          frontmatter[key] = value
            .slice(1, -1)
            .split(',')
            .map((tag: string) => tag.trim().replace(/^"(.*)"$/, '$1'))
            .filter((tag: string) => tag);
        } else if (value === 'true' || value === 'false') {
          frontmatter[key] = value === 'true';
        } else if (value.match(/^\d{4}-\d{2}-\d{2}/)) {
          frontmatter[key] = value;
        } else {
          frontmatter[key] = value.replace(/^"(.*)"$/, '$1');
        }
      }
    }

    return json({
      success: true,
      frontmatter,
      content: content.trim(),
      slug: slug
    });

  } catch (error) {
    console.error('Error loading blog post:', error);
    
    return json({
      success: false,
      message: 'Error loading blog post',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
}
