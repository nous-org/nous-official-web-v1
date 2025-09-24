import type { APIRoute } from 'astro';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

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

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json() as BlogPostRequest;
    const { slug, frontmatter, content, publish } = body;

    // Validate required fields
    if (!slug || !frontmatter || !content) {
      return new Response(JSON.stringify({
        success: false,
        message: 'Missing required fields: slug, frontmatter, or content'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Create the markdown content with frontmatter
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

    const markdownContent = `---
${yamlFrontmatter}
---

${content}`;

    // Create the blog directory if it doesn't exist
    const blogDir = join(process.cwd(), 'src', 'content', 'blog');
    if (!existsSync(blogDir)) {
      await mkdir(blogDir, { recursive: true });
    }

    // Create the filename (ensure it ends with .md)
    const filename = slug.endsWith('.md') ? slug : `${slug}.md`;
    const filepath = join(blogDir, filename);

    // Write the file
    await writeFile(filepath, markdownContent, 'utf-8');

    return new Response(JSON.stringify({
      success: true,
      message: publish ? 'Post published successfully' : 'Draft saved successfully',
      data: {
        slug,
        filepath: filepath.replace(process.cwd(), ''),
        published: publish
      }
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error saving blog post:', error);
    
    return new Response(JSON.stringify({
      success: false,
      message: 'Error saving blog post',
      error: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
