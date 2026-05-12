import type { APIContext } from 'astro';
import { createDbClient } from '@/lib/db';
import { authErrorResponse, requireClerk } from '@/lib/auth';
import { getRuntimeEnv } from '@/lib/runtime-env';

interface BlogPostRequest {
  slug: string;
  frontmatter: {
    title: string;
    date: string;
    draft: boolean;
    description: string;
    excerpt: string;
    tags: string[];
    author: {
      name: string;
      bio: string;
    };
    featured: boolean;
    category: string;
  };
  content: string;
  publish: boolean;
}

function json(data: unknown, init: number | ResponseInit = 200) {
  const initObj = typeof init === 'number' ? { status: init } : init;
  return new Response(JSON.stringify(data), {
    ...initObj,
    headers: { 'content-type': 'application/json', ...(initObj as ResponseInit).headers },
  });
}

export async function POST({ request }: APIContext) {
  try {
    const env = getRuntimeEnv();
    const { userId } = await requireClerk(request, env);

    const body = await request.json() as BlogPostRequest;
    const { slug, frontmatter, content, publish } = body;

    // Validate required fields
    if (!slug || !frontmatter || !content) {
      return json({
        success: false,
        message: 'Missing required fields: slug, frontmatter, or content'
      }, 400);
    }

    // Create the markdown content with frontmatter for storage
    const yamlFrontmatter = Object.entries(frontmatter)
      .map(([key, value]) => {
        if (key === 'tags' && Array.isArray(value)) {
          return `${key}: [${value.map(tag => `"${tag}"`).join(', ')}]`;
        }
        if (key === 'author' && typeof value === 'object') {
          const author = value as { name: string; bio: string };
          return `${key}:\n  name: "${author.name}"\n  bio: "${author.bio}"`;
        }
        if (typeof value === 'string') {
          return `${key}: "${value}"`;
        }
        if (typeof value === 'boolean') {
          return `${key}: ${value}`;
        }
        return `${key}: ${value}`;
      })
      .join('\n');

    const markdownContent = `---\n${yamlFrontmatter}\n---\n\n${content}`;

    const db = createDbClient(env as { TURSO_DATABASE_URL: string; TURSO_AUTH_TOKEN?: string });

    // Generate ID for new posts (timestamp-based)
    const postId = `post_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
    const now = Date.now();

    // Check if post already exists
    const existing = await db.execute('SELECT id FROM posts WHERE slug = ?', [slug]);
    
    if (existing.rows.length > 0) {
      // Update existing post
      await db.execute(
        `UPDATE posts SET 
          title = ?,
          content = ?,
          categorie = ?,
          tags = ?,
          status = ?,
          updatedAt = ?
         WHERE slug = ?`,
        [
          frontmatter.title,
          markdownContent,
          frontmatter.category || 'AI',
          JSON.stringify(frontmatter.tags || []),
          publish ? 'PUBLISHED' : 'DRAFT',
          now,
          slug
        ]
      );
    } else {
      // Insert new post - without excerpt column (doesn't exist in actual DB)
      await db.execute(
        `INSERT INTO posts (id, slug, title, content, categorie, tags, status, authorId, views, createdAt, updatedAt) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          postId,
          slug,
          frontmatter.title,
          markdownContent,
          frontmatter.category || 'AI',
          JSON.stringify(frontmatter.tags || []),
          publish ? 'PUBLISHED' : 'DRAFT',
          userId, // Clerk user ID from authenticated user
          0, // Initial views
          now,
          now
        ]
      );
    }

    return json({
      success: true,
      message: publish ? 'Post published successfully' : 'Draft saved successfully',
      data: {
        slug,
        published: publish
      }
    });

  } catch (error) {
    if ((error as { name?: string })?.name === 'AuthError') {
      return authErrorResponse(error);
    }

    console.error('Error saving blog post:', error);
    
    return json({
      success: false,
      message: 'Error saving blog post',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
}
