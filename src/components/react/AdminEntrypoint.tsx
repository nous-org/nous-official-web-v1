import { useEffect, useRef, useState } from 'react';
import { dark } from '@clerk/themes'
import {
  ClerkProvider,
  ClerkLoaded,
  ClerkLoading,
  SignedIn,
  SignedOut,
  SignInButton,
  UserButton,
  useAuth,
} from '@clerk/clerk-react';

import { EditorContent, useEditor } from '@tiptap/react';

import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Link from '@tiptap/extension-link';
import Underline from '@tiptap/extension-underline';
import Highlight from '@tiptap/extension-highlight';
import HorizontalRule from '@tiptap/extension-horizontal-rule';
import TextAlign from '@tiptap/extension-text-align';

import BubbleMenu from '@tiptap/extension-bubble-menu';

import DOMPurify from 'dompurify';

type Props = { publishableKey: string };

function ToolbarButton({
  onClick,
  active,
  label,
}: {
  onClick: () => void;
  active?: boolean;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        'rounded-md border px-2 py-1 text-xs transition-colors hover:cursor-pointer ' +
        (active
          ? 'border-outline/60 bg-outline/15 text-outline'
          : 'border-white/10 bg-white/[0.035] text-neutral-200 hover:border-outline/40 hover:bg-outline/10')
      }
      title={label}
      aria-label={label}
    >
      {label}
    </button>
  );
}

function AdminApp() {
  const { getToken } = useAuth();
  const [posts, setPosts] = useState<
    Array<{ id: number; slug: string; title: string; published_at: string | null; updated_at: string }>
  >([]);
  
  // Blog post fields matching Astro content schema
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [authorName, setAuthorName] = useState('NOUS');
  const [authorBio, setAuthorBio] = useState('AI deployment and technology systems.');
  const [featured, setFeatured] = useState(false);
  const [category, setCategory] = useState<'AI' | 'AI Deployment' | 'Business' | 'Technology' | 'Tutorial'>('AI');
  const [, setDraft] = useState(false);

  const bubbleMenuRef = useRef<HTMLDivElement | null>(null);
  const [menusReady, setMenusReady] = useState(false);

  useEffect(() => {
    if (bubbleMenuRef.current) {
      setMenusReady(true);
    }
  }, []);

  const editor = useEditor(
    {
      extensions: [
        StarterKit.configure({
          codeBlock: false, // lo reemplazamos por CodeBlockLowlight
          heading: { levels: [1, 2, 3] },
        }),
        Placeholder.configure({
          placeholder: 'Start writing... Use the toolbar for headings, links, dividers, and formatting.',
        }),
        Link.configure({
          autolink: true,
          openOnClick: true,
          linkOnPaste: true,
          protocols: ['http', 'https', 'mailto', 'tel'],
        }),
        Underline,
        Highlight,
        HorizontalRule,
        TextAlign.configure({ types: ['heading', 'paragraph'] }),

        BubbleMenu.configure({
          element: bubbleMenuRef.current!,
        }),
      ],
      content: '<p>Start writing...</p>',
      editorProps: {
        attributes: {
          class: 'min-h-[240px] outline-none max-w-none',
        },
      },
    },
    [menusReady],
  );

  async function authFetch(input: RequestInfo, init?: RequestInit) {
    const token = await getToken();
    return fetch(input, {
      ...init,
      headers: {
        ...(init?.headers || {}),
        authorization: token ? `Bearer ${token}` : '',
        ...(init?.body ? { 'content-type': 'application/json' } : {}),
      },
    });
  }

  async function loadPosts() {
    try {
      // For now, we'll use a simple approach to list blog posts
      // In a real implementation, you might want to create an API endpoint
      // that reads the blog directory and returns post metadata
      const res = await authFetch('/api/admin/blog-list');
      if (res.ok) {
        setPosts(await res.json());
      } else {
        // Fallback: show empty list if endpoint doesn't exist yet
        setPosts([]);
      }
    } catch (error) {
      console.error('Error loading posts:', error);
      setPosts([]);
    }
  }

  useEffect(() => {
    void loadPosts();
  }, []);

  function setLink() {
    if (!editor) return;
    const previousUrl = editor.getAttributes('link').href as string | undefined;
    const url = window.prompt('Link URL', previousUrl ?? '');
    if (url === null) return;
    if (url === '') {
      editor.chain().focus().unsetLink().run();
      return;
    }
    editor
      .chain()
      .focus()
      .setLink({ href: url, target: '_blank', rel: 'noopener noreferrer' })
      .run();
  }

  // Sanitiza HTML del editor con la misma whitelist usada en save()
  function sanitizeCurrentHtml(rawHtml: string) {
    return DOMPurify.sanitize(rawHtml, {
      ALLOW_DATA_ATTR: true,
      ALLOWED_TAGS: [
        'p',
        'h1',
        'h2',
        'h3',
        'strong',
        'em',
        'u',
        's',
        'a',
        'code',
        'hr',
        'br',
        'span',
        'div',
        'mark',
      ],
      ALLOWED_ATTR: ['href', 'target', 'rel', 'class', 'data-type', 'data-checked', 'style'],
    });
  }

  // Helper functions for tags
  function addTag() {
    if (tagInput.trim() && tags.length < 5 && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  }

  function removeTag(tagToRemove: string) {
    setTags(tags.filter(tag => tag !== tagToRemove));
  }

  function clearForm() {
    setTitle('');
    setSlug('');
    setDescription('');
    setExcerpt('');
    setTags([]);
    setTagInput('');
    setAuthorName('NOUS');
    setAuthorBio('AI deployment and technology systems.');
    setFeatured(false);
    setCategory('AI');
    setDraft(false);
    editor?.commands.setContent('<p>Start writing...</p>');
  }

  async function save(publish = false) {
    if (!editor) return;

    // Validation
    if (!title.trim()) {
      alert('Title is required');
      return;
    }
    if (!slug.trim()) {
      alert('Slug is required');
      return;
    }
    if (!description.trim()) {
      alert('Description is required');
      return;
    }
    if (!excerpt.trim()) {
      alert('Excerpt is required');
      return;
    }
    if (excerpt.length > 200) {
      alert('Excerpt must be 200 characters or fewer');
      return;
    }

    // Convert HTML to Markdown (simplified conversion)
    const htmlContent = editor.getHTML();
    const markdownContent = htmlToMarkdown(htmlContent);

    // Create frontmatter
    const frontmatter = {
      title,
      date: new Date().toISOString(),
      draft: !publish,
      description,
      excerpt,
      tags,
      author: {
        name: authorName,
        bio: authorBio
      },
      featured,
      category
    };

    const res = await authFetch('/api/admin/blog-posts', {
      method: 'POST',
      body: JSON.stringify({
        slug,
        frontmatter,
        content: markdownContent,
        publish
      }),
    });

    if (res.ok || res.status === 204) {
      clearForm();
      await loadPosts();
      alert(publish ? 'Post published' : 'Draft saved');
    } else {
      const error = await res.text();
      alert('Error saving: ' + error);
    }
  }

  // Simple HTML to Markdown conversion
  function htmlToMarkdown(html: string): string {
    return html
      .replace(/<h1[^>]*>(.*?)<\/h1>/gi, '# $1')
      .replace(/<h2[^>]*>(.*?)<\/h2>/gi, '## $1')
      .replace(/<h3[^>]*>(.*?)<\/h3>/gi, '### $1')
      .replace(/<strong[^>]*>(.*?)<\/strong>/gi, '**$1**')
      .replace(/<em[^>]*>(.*?)<\/em>/gi, '*$1*')
      .replace(/<u[^>]*>(.*?)<\/u>/gi, '$1')
      .replace(/<code[^>]*>(.*?)<\/code>/gi, '`$1`')
      .replace(/<a[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>/gi, '[$2]($1)')
      .replace(/<hr[^>]*>/gi, '\n---\n')
      .replace(/<br[^>]*>/gi, '\n')
      .replace(/<p[^>]*>(.*?)<\/p>/gi, '$1\n\n')
      .replace(/<[^>]*>/g, '') // Remove remaining HTML tags
      .replace(/\n\n+/g, '\n\n') // Clean up multiple newlines
      .trim();
  }

  // ---- Blog post management functions ----
  async function loadBlogPostBySlug(s: string) {
    const res = await authFetch(`/api/admin/blog-post/${encodeURIComponent(s)}`);
    if (!res.ok) {
      alert('Post not found');
      return;
    }
    const data: { frontmatter: any; content: string } = await res.json();
    
    // Load all the fields from the blog post
    setTitle(data.frontmatter.title || '');
    setSlug(s);
    setDescription(data.frontmatter.description || '');
    setExcerpt(data.frontmatter.excerpt || '');
    setTags(data.frontmatter.tags || []);
    setAuthorName(data.frontmatter.author?.name || 'NOUS');
    setAuthorBio(data.frontmatter.author?.bio || 'AI deployment and technology systems.');
    setFeatured(data.frontmatter.featured || false);
    setCategory(data.frontmatter.category || 'AI');
    setDraft(data.frontmatter.draft || false);
    
    // Convert markdown back to HTML for the editor
    const htmlContent = markdownToHtml(data.content);
    editor?.commands.setContent(htmlContent);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Simple Markdown to HTML conversion for editing
  function markdownToHtml(markdown: string): string {
    return markdown
      .replace(/^# (.*$)/gim, '<h1>$1</h1>')
      .replace(/^## (.*$)/gim, '<h2>$1</h2>')
      .replace(/^### (.*$)/gim, '<h3>$1</h3>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code>$1</code>')
      .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2">$1</a>')
      .replace(/^---$/gm, '<hr>')
      .replace(/\n\n/g, '</p><p>')
      .replace(/^(.+)$/gm, '<p>$1</p>')
      .replace(/<p><\/p>/g, '')
      .replace(/<p>(<h[1-6]>.*<\/h[1-6]>)<\/p>/g, '$1')
      .replace(/<p>(<hr>)<\/p>/g, '$1');
  }

  async function updateDraftBySlug(s: string) {
    if (!editor) return;
    const rawHtml = editor.getHTML();
    const html = sanitizeCurrentHtml(rawHtml);

    const res = await authFetch(`/api/admin/drafts/${encodeURIComponent(s)}`, {
      method: 'PATCH',
      body: JSON.stringify({
        title,
        content_html: html,
      }),
    });
    if (res.ok) {
      alert('Draft updated');
      await loadPosts();
    } else {
      const err = await res.text();
      alert('Error updating draft: ' + err);
    }
  }

  async function deleteDraftBySlug(s: string) {
    if (!confirm('Delete this draft? This action cannot be undone.')) return;
    const res = await authFetch(`/api/admin/drafts/${encodeURIComponent(s)}`, { method: 'DELETE' });
    if (res.status === 204) {
      if (slug === s) {
        setTitle('');
        setSlug('');
        editor?.commands.setContent('<p></p>');
      }
      await loadPosts();
      alert('Draft deleted');
    } else {
      alert('Could not delete draft');
    }
  }

  async function deletePostBySlug(s: string) {
    if (!confirm('Delete this published post? This action cannot be undone.')) return;
    const res = await authFetch(`/api/admin/posts/${encodeURIComponent(s)}`, { method: 'DELETE' });
    if (res.status === 204) {
      await loadPosts();
      alert('Post deleted');
    } else {
      alert('Could not delete post');
    }
  }

  return (
    <div className="mx-auto max-w-none">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-outline">Signed in</p>
          <h2 className="mt-2 text-xl font-medium tracking-normal text-neutral-100">Admin panel</h2>
        </div>
        <div className="rounded-full border border-outline/20 bg-white/[0.035] p-1 transition-colors hover:border-outline/45">
          <UserButton />
        </div>
      </div>

      <section className="mb-8 rounded-[1.5rem] border border-white/10 bg-white/[0.025] p-4 shadow-[0_24px_80px_rgba(0,0,0,0.18)] sm:p-5">
        <div className="grid gap-3">
          <input
            placeholder="Title"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (!slug) {
                setSlug(
                  e.target.value
                    .toLowerCase()
                    .trim()
                    .replace(/[^\w\s-]/g, '')
                    .replace(/\s+/g, '-'),
                );
              }
            }}
            className="w-full rounded-lg border border-white/10 bg-white/[0.035] px-3 py-2 text-neutral-100 placeholder-neutral-500 outline-none ring-0 transition-colors focus:border-outline/70 focus:ring-2 focus:ring-outline/35"
          />
          <input
            placeholder="example-slug"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            className="w-full rounded-lg border border-white/10 bg-white/[0.035] px-3 py-2 text-neutral-100 placeholder-neutral-500 outline-none ring-0 transition-colors focus:border-outline/70 focus:ring-2 focus:ring-outline/35"
          />

          <textarea
            placeholder="Post description (SEO)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            className="w-full resize-none rounded-lg border border-white/10 bg-white/[0.035] px-3 py-2 text-neutral-100 placeholder-neutral-500 outline-none ring-0 transition-colors focus:border-outline/70 focus:ring-2 focus:ring-outline/35"
          />

          <div className="relative">
            <textarea
              placeholder="Excerpt (maximum 200 characters)"
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              rows={2}
              maxLength={200}
              className="w-full resize-none rounded-lg border border-white/10 bg-white/[0.035] px-3 py-2 text-neutral-100 placeholder-neutral-500 outline-none ring-0 transition-colors focus:border-outline/70 focus:ring-2 focus:ring-outline/35"
            />
            <div className="absolute bottom-2 right-2 text-xs text-neutral-500">
              {excerpt.length}/200
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex gap-2">
              <input
                placeholder="Add tag (maximum 5)"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                disabled={tags.length >= 5}
                className="flex-1 rounded-lg border border-white/10 bg-white/[0.035] px-3 py-2 text-neutral-100 placeholder-neutral-500 outline-none ring-0 transition-colors focus:border-outline/70 focus:ring-2 focus:ring-outline/35 disabled:opacity-50"
              />
              <button
                type="button"
                onClick={addTag}
                disabled={tags.length >= 5 || !tagInput.trim()}
                className="rounded-full border border-outline/45 bg-outline/10 px-4 py-2 text-xs font-medium text-outline transition-colors hover:bg-outline/15 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Add
              </button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 rounded-full border border-outline/20 bg-outline/10 px-2 py-1 text-xs text-outline"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="hover:text-red-400 transition-colors"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <input
              placeholder="Author name"
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-white/[0.035] px-3 py-2 text-neutral-100 placeholder-neutral-500 outline-none ring-0 transition-colors focus:border-outline/70 focus:ring-2 focus:ring-outline/35"
            />
            <input
              placeholder="Author bio"
              value={authorBio}
              onChange={(e) => setAuthorBio(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-white/[0.035] px-3 py-2 text-neutral-100 placeholder-neutral-500 outline-none ring-0 transition-colors focus:border-outline/70 focus:ring-2 focus:ring-outline/35"
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as any)}
              className="w-full rounded-lg border border-white/10 bg-white/[0.035] px-3 py-2 text-neutral-100 outline-none ring-0 transition-colors focus:border-outline/70 focus:ring-2 focus:ring-outline/35"
            >
              <option value="AI">AI</option>
              <option value="AI Deployment">AI Deployment</option>
              <option value="Business">Business</option>
              <option value="Technology">Technology</option>
              <option value="Tutorial">Tutorial</option>
            </select>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-sm text-neutral-300">
                <input
                  type="checkbox"
                  checked={featured}
                  onChange={(e) => setFeatured(e.target.checked)}
                  className="rounded border-white/10 bg-white/[0.035] text-outline focus:ring-outline/40"
                />
                Featured
              </label>
            </div>
          </div>

          {editor && (
            <div className="flex flex-wrap gap-2 rounded-lg border border-white/10 bg-white/[0.025] p-2">
              <ToolbarButton
                label="Bold"
                active={editor.isActive('bold')}
                onClick={() => editor.chain().focus().toggleBold().run()}
              />
              <ToolbarButton
                label="Italic"
                active={editor.isActive('italic')}
                onClick={() => editor.chain().focus().toggleItalic().run()}
              />
              <ToolbarButton
                label="Underline"
                active={editor.isActive('underline')}
                onClick={() => editor.chain().focus().toggleUnderline().run()}
              />
              <ToolbarButton
                label="Code"
                active={editor.isActive('code')}
                onClick={() => editor.chain().focus().toggleCode().run()}
              />
              <ToolbarButton
                label="Highlight"
                active={editor.isActive('highlight')}
                onClick={() => editor.chain().focus().toggleHighlight().run()}
              />
              <ToolbarButton label="Link" onClick={setLink} />

              <div className="mx-2 h-6 w-px self-center bg-white/10" />
              <ToolbarButton
                label="H1"
                active={editor.isActive('heading', { level: 1 })}
                onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
              />
              <ToolbarButton
                label="H2"
                active={editor.isActive('heading', { level: 2 })}
                onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
              />
              <ToolbarButton
                label="H3"
                active={editor.isActive('heading', { level: 3 })}
                onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
              />
              <ToolbarButton
                label="Divider"
                onClick={() => editor.chain().focus().setHorizontalRule().run()}
              />

              <div className="mx-2 h-6 w-px self-center bg-white/10" />
              <ToolbarButton
                label="Left"
                active={editor.isActive({ textAlign: 'left' })}
                onClick={() => editor.chain().focus().setTextAlign('left').run()}
              />
              <ToolbarButton
                label="Center"
                active={editor.isActive({ textAlign: 'center' })}
                onClick={() => editor.chain().focus().setTextAlign('center').run()}
              />
              <ToolbarButton
                label="Right"
                active={editor.isActive({ textAlign: 'right' })}
                onClick={() => editor.chain().focus().setTextAlign('right').run()}
              />
            </div>
          )}

          <div className="rounded-xl border border-white/10 bg-white/[0.025] p-3 focus-within:ring-2 focus-within:ring-outline/35">
            <EditorContent editor={editor} className="tiptap-content min-h-[280px] text-neutral-100" />

            <div
              ref={bubbleMenuRef}
              className="flex gap-1 rounded-lg border border-white/10 bg-primary-blue/95 p-1 shadow-md"
            >
              <ToolbarButton
                label="B"
                active={!!editor?.isActive('bold')}
                onClick={() => editor?.chain().focus().toggleBold().run()}
              />
              <ToolbarButton
                label="I"
                active={!!editor?.isActive('italic')}
                onClick={() => editor?.chain().focus().toggleItalic().run()}
              />
              <ToolbarButton
                label="U"
                active={!!editor?.isActive('underline')}
                onClick={() => editor?.chain().focus().toggleUnderline().run()}
              />
              <ToolbarButton label="Link" onClick={setLink} />
            </div>
          </div>

          <div className="mt-2 flex flex-wrap gap-3">
            <button
              onClick={() => save(false)}
              className="inline-flex items-center justify-center rounded-full border border-outline/35 bg-transparent px-4 py-2 text-sm font-medium text-outline transition-colors hover:border-outline/70 hover:bg-outline/10 focus:outline-none focus:ring-2 focus:ring-outline/40 hover:cursor-pointer"
            >
              Save draft
            </button>
            <button
              onClick={() => save(true)}
              className="inline-flex items-center justify-center rounded-full bg-outline px-4 py-2 text-sm font-medium text-primary-black transition-colors hover:bg-hover focus:outline-none focus:ring-2 focus:ring-outline/40 hover:cursor-pointer"
            >
              Publish
            </button>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => slug && updateDraftBySlug(slug)}
                className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/[0.035] px-3 py-2 text-xs font-medium text-neutral-200 transition-colors hover:border-outline/40 hover:bg-outline/10 focus:outline-none focus:ring-2 focus:ring-outline/30 hover:cursor-pointer"
                title="Update current draft"
                aria-label="Update current draft"
              >
                Update draft
              </button>
              <button
                onClick={() => slug && deleteDraftBySlug(slug)}
                className="inline-flex items-center justify-center rounded-full border border-red-500/35 bg-red-500/10 px-3 py-2 text-xs text-red-300 transition-colors hover:border-red-400 hover:bg-red-500/20 focus:outline-none focus:ring-2 focus:ring-red-400/30 hover:cursor-pointer"
                title="Delete current draft"
                aria-label="Delete current draft"
              >
                Delete draft
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-medium text-neutral-100">Posts</h2>
        <ul className="space-y-2">
          {posts.map((p: any) => (
            <li
              key={p.id}
              className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.025] px-4 py-3 text-neutral-200 transition-colors hover:border-outline/30 hover:bg-outline/10"
            >
              <div className="min-w-0">
                <strong className="text-neutral-100">{p.title}</strong>
                <p className="ml-2 text-neutral-400">/blog/{p.slug}</p>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={
                    p.published_at
                      ? 'inline-flex items-center gap-1 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-300'
                      : 'inline-flex items-center gap-1 rounded-full border border-amber-500/40 bg-amber-500/10 px-2 py-0.5 text-xs font-medium text-amber-300'
                  }
                >
                  {p.published_at ? 'Published' : 'Draft'}
                </span>
                {!p.published_at && (
                  <>
                    <button
                      onClick={() => loadBlogPostBySlug(p.slug)}
                      className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/[0.035] px-2.5 py-1.5 text-xs text-neutral-200 transition-colors hover:border-outline/40 hover:bg-outline/10 focus:outline-none focus:ring-2 focus:ring-outline/30 hover:cursor-pointer"
                      title="Edit draft"
                      aria-label="Edit draft"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => updateDraftBySlug(p.slug)}
                      className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/[0.035] px-2.5 py-1.5 text-xs text-neutral-200 transition-colors hover:border-outline/40 hover:bg-outline/10 focus:outline-none focus:ring-2 focus:ring-outline/30 hover:cursor-pointer"
                      title="Update draft"
                      aria-label="Update draft"
                    >
                      Update
                    </button>
                    <button
                      onClick={() => deleteDraftBySlug(p.slug)}
                      className="inline-flex items-center justify-center rounded-full border border-red-500/35 bg-red-500/10 px-2.5 py-1.5 text-xs text-red-300 transition-colors hover:border-red-400 hover:bg-red-500/20 focus:outline-none focus:ring-2 focus:ring-red-400/30 hover:cursor-pointer"
                      title="Delete draft"
                      aria-label="Delete draft"
                    >
                      Delete
                    </button>
                  </>
                )}
                {p.published_at && (
                  <button
                    onClick={() => deletePostBySlug(p.slug)}
                    className="inline-flex items-center justify-center rounded-full border border-red-500/35 bg-red-500/10 px-2.5 py-1.5 text-xs text-red-300 transition-colors hover:border-red-400 hover:bg-red-500/20 focus:outline-none focus:ring-2 focus:ring-red-400/30 hover:cursor-pointer"
                    title="Delete published post"
                    aria-label="Delete published post"
                  >
                    Delete
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

export function AdminEntrypoint({ publishableKey }: Props) {
  return (
    <ClerkProvider publishableKey={publishableKey} appearance={{ theme: dark }}>
      <ClerkLoading>
        <div className="grid min-h-[420px] place-items-center rounded-[1.5rem] border border-white/10 bg-white/[0.025] p-6 text-center">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-outline">Secure session</p>
            <h2 className="mt-3 text-2xl font-medium text-white">Loading admin workspace</h2>
            <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-neutral-400">
              We are preparing the NOUS authentication layer.
            </p>
          </div>
        </div>
      </ClerkLoading>
      <ClerkLoaded>
        <SignedIn>
          <AdminApp />
        </SignedIn>
        <SignedOut>
          <div className="grid min-h-[420px] place-items-center rounded-[1.5rem] border border-white/10 bg-white/[0.025] p-6 text-center">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-outline">Authorized access</p>
              <h2 className="mt-3 text-2xl font-medium text-white">Sign in to continue</h2>
              <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-neutral-400">
                Use your authorized NOUS account to access the admin workspace.
              </p>
              <div className="mt-6">
                <SignInButton mode="modal">
                  <button
                    type="button"
                    className="inline-flex min-h-11 items-center justify-center rounded-full border border-transparent bg-outline px-5 py-2.5 text-sm font-medium text-primary-black transition-colors hover:bg-hover focus:outline-none focus:ring-2 focus:ring-outline/40 cursor-pointer"
                  >
                    Sign in
                  </button>
                </SignInButton>
              </div>
            </div>
          </div>
        </SignedOut>
      </ClerkLoaded>
    </ClerkProvider>
  );
}
