import type { APIRoute } from 'astro';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

export const GET: APIRoute = async ({ params }) => {
  try {
    const { slug } = params;
    
    if (!slug) {
      return new Response(JSON.stringify({
        success: false,
        message: 'Slug is required'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const filename = slug.endsWith('.md') ? slug : `${slug}.md`;
    const filepath = join(process.cwd(), 'src', 'content', 'blog', filename);
    
    if (!existsSync(filepath)) {
      return new Response(JSON.stringify({
        success: false,
        message: 'Blog post not found'
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const content = await readFile(filepath, 'utf-8');
    
    // Parse frontmatter and content
    const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
    
    if (!frontmatterMatch) {
      return new Response(JSON.stringify({
        success: false,
        message: 'Invalid markdown format'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const [, frontmatterText, markdownContent] = frontmatterMatch;
    
    // Parse frontmatter (simple YAML parsing)
    const frontmatter: any = {};
    const lines = frontmatterText.split('\n');
    let currentKey = '';
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
            .map(tag => tag.trim().replace(/^"(.*)"$/, '$1'))
            .filter(tag => tag);
        } else if (value === 'true' || value === 'false') {
          frontmatter[key] = value === 'true';
        } else if (value.match(/^\d{4}-\d{2}-\d{2}/)) {
          frontmatter[key] = value;
        } else {
          frontmatter[key] = value.replace(/^"(.*)"$/, '$1');
        }
      }
    }

    return new Response(JSON.stringify({
      success: true,
      frontmatter,
      content: markdownContent.trim(),
      slug: slug.replace('.md', '')
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error loading blog post:', error);
    
    return new Response(JSON.stringify({
      success: false,
      message: 'Error loading blog post',
      error: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
