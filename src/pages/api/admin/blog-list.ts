import type { APIRoute } from 'astro';
import { readdir, readFile } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

export const GET: APIRoute = async () => {
  try {
    const blogDir = join(process.cwd(), 'src', 'content', 'blog');
    
    if (!existsSync(blogDir)) {
      return new Response(JSON.stringify([]), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const files = await readdir(blogDir);
    const markdownFiles = files.filter(file => file.endsWith('.md'));
    
    const posts = await Promise.all(
      markdownFiles.map(async (file, index) => {
        try {
          const filepath = join(blogDir, file);
          const content = await readFile(filepath, 'utf-8');
          
          // Extract frontmatter
          const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
          let title = file.replace('.md', '');
          let published_at = null;
          let draft = true;
          
          if (frontmatterMatch) {
            const frontmatter = frontmatterMatch[1];
            const titleMatch = frontmatter.match(/title:\s*"([^"]+)"/);
            const draftMatch = frontmatter.match(/draft:\s*(true|false)/);
            const dateMatch = frontmatter.match(/date:\s*(.+)/);
            
            if (titleMatch) title = titleMatch[1];
            if (draftMatch) draft = draftMatch[1] === 'true';
            if (dateMatch && !draft) published_at = dateMatch[1];
          }
          
          return {
            id: index + 1,
            slug: file.replace('.md', ''),
            title,
            published_at,
            updated_at: new Date().toISOString()
          };
        } catch (error) {
          console.error(`Error reading file ${file}:`, error);
          return {
            id: index + 1,
            slug: file.replace('.md', ''),
            title: file.replace('.md', ''),
            published_at: null,
            updated_at: new Date().toISOString()
          };
        }
      })
    );

    return new Response(JSON.stringify(posts), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error listing blog posts:', error);
    
    return new Response(JSON.stringify({
      success: false,
      message: 'Error listing blog posts',
      error: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
