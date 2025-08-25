import { useEffect, useRef, useState } from 'react';
import { dark } from '@clerk/themes'
import {
  ClerkProvider,
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

// Menús v3: se importan como extensiones
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
          ? 'border-primary-turquoise/60 bg-primary-turquoise/15 text-primary-turquoise'
          : 'border-neutral-800 bg-neutral-900/40 text-neutral-200 hover:border-primary-turquoise/40 hover:bg-neutral-900/60')
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
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');

  // Refs para los menús (v3 requiere elementos DOM)
  const bubbleMenuRef = useRef<HTMLDivElement | null>(null);
  const [menusReady, setMenusReady] = useState(false);

  // Marca los menús como listos cuando los refs existen
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
          placeholder: 'Escribe / para comandos… (H1, enlaces, separadores, etc.)',
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

        // Menú burbuja v3
        BubbleMenu.configure({
          element: bubbleMenuRef.current!,
        }),
      ],
      content: '<p>Empieza a escribir…</p>',
      editorProps: {
        attributes: {
          class: 'min-h-[240px] outline-none max-w-none',
        },
      },
    },
    // Dependencias: recrea el editor cuando los menús estén listos
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
    const res = await authFetch('/api/admin/posts');
    if (res.ok) setPosts(await res.json());
  }

  useEffect(() => {
    void loadPosts();
  }, []);

  function setLink() {
    if (!editor) return;
    const previousUrl = editor.getAttributes('link').href as string | undefined;
    const url = window.prompt('URL del enlace', previousUrl ?? '');
    if (url === null) return; // cancelado
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

  async function save(publish = false) {
    if (!editor) return;

    const rawHtml = editor.getHTML();
    // Incluye 'mark' para Highlight y atributos usados por alineación
    const html = sanitizeCurrentHtml(rawHtml);

    const json = editor.getJSON();

    const res = await authFetch('/api/admin/posts', {
      method: 'POST',
      body: JSON.stringify({
        title,
        slug,
        contentHtml: html,
        contentJson: json,
        publish,
      }),
    });

    if (res.ok || res.status === 204) {
      setTitle('');
      setSlug('');
      editor.commands.setContent('<p></p>');
      await loadPosts();
      alert(publish ? 'Publicado' : 'Guardado');
    } else {
      alert('Error guardando');
    }
  }

  // ---- NUEVOS ENDPOINTS: drafts y posts por slug ----
  async function loadDraftBySlug(s: string) {
    const res = await authFetch(`/api/admin/drafts/${encodeURIComponent(s)}`);
    if (!res.ok) {
      alert('Borrador no encontrado');
      return;
    }
    const data = (await res.json()) as { draft: { slug: string; title: string; content_html: string } };
    setTitle(data.draft.title);
    setSlug(data.draft.slug);
    editor?.commands.setContent(data.draft.content_html || '<p></p>');
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
      alert('Borrador actualizado');
      await loadPosts();
    } else {
      const err = await res.text();
      alert('Error actualizando borrador: ' + err);
    }
  }

  async function deleteDraftBySlug(s: string) {
    if (!confirm('¿Eliminar este borrador? Esta acción no se puede deshacer.')) return;
    const res = await authFetch(`/api/admin/drafts/${encodeURIComponent(s)}`, { method: 'DELETE' });
    if (res.status === 204) {
      // si el borrador eliminado es el que está en el formulario, limpia
      if (slug === s) {
        setTitle('');
        setSlug('');
        editor?.commands.setContent('<p></p>');
      }
      await loadPosts();
      alert('Borrador eliminado');
    } else {
      alert('No se pudo eliminar el borrador');
    }
  }

  async function deletePostBySlug(s: string) {
    if (!confirm('¿Eliminar este post publicado? Esta acción no se puede deshacer.')) return;
    const res = await authFetch(`/api/admin/posts/${encodeURIComponent(s)}`, { method: 'DELETE' });
    if (res.status === 204) {
      await loadPosts();
      alert('Post eliminado');
    } else {
      alert('No se pudo eliminar el post');
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 pt-12">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight text-neutral-100">Panel de Admin</h1>
        <div className="rounded-md border border-neutral-800 bg-neutral-900/40 p-1 transition-colors hover:border-primary-turquoise/40">
          <UserButton />
        </div>
      </div>

      <section className="mb-8 rounded-xl border border-neutral-800 bg-neutral-900/30 p-4 shadow-sm shadow-primary-turquoise/10">
        <div className="grid gap-3">
          <input
            placeholder="Título"
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
            className="w-full rounded-md border border-neutral-800 bg-neutral-900/50 px-3 py-2 text-neutral-100 placeholder-neutral-500 outline-none ring-0 transition-colors focus:border-primary-turquoise/70 focus:ring-2 focus:ring-primary-turquoise/40"
          />
          <input
            placeholder="slug-ejemplo"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            className="w-full rounded-md border border-neutral-800 bg-neutral-900/50 px-3 py-2 text-neutral-100 placeholder-neutral-500 outline-none ring-0 transition-colors focus:border-primary-turquoise/70 focus:ring-2 focus:ring-primary-turquoise/40"
          />

          {/* Toolbar superior */}
          {editor && (
            <div className="flex flex-wrap gap-2 rounded-md border border-neutral-800 bg-neutral-900/40 p-2">
              {/* Inline */}
              <ToolbarButton
                label="Negrita"
                active={editor.isActive('bold')}
                onClick={() => editor.chain().focus().toggleBold().run()}
              />
              <ToolbarButton
                label="Itálica"
                active={editor.isActive('italic')}
                onClick={() => editor.chain().focus().toggleItalic().run()}
              />
              <ToolbarButton
                label="Subrayado"
                active={editor.isActive('underline')}
                onClick={() => editor.chain().focus().toggleUnderline().run()}
              />
              <ToolbarButton
                label="Código"
                active={editor.isActive('code')}
                onClick={() => editor.chain().focus().toggleCode().run()}
              />
              <ToolbarButton
                label="Resaltado"
                active={editor.isActive('highlight')}
                onClick={() => editor.chain().focus().toggleHighlight().run()}
              />
              <ToolbarButton label="Enlace" onClick={setLink} />

              {/* Bloques */}
              <div className="mx-2 h-6 w-px self-center bg-neutral-800" />
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
                label="Separador"
                onClick={() => editor.chain().focus().setHorizontalRule().run()}
              />

              {/* Alineación */}
              <div className="mx-2 h-6 w-px self-center bg-neutral-800" />
              <ToolbarButton
                label="Izq"
                active={editor.isActive({ textAlign: 'left' })}
                onClick={() => editor.chain().focus().setTextAlign('left').run()}
              />
              <ToolbarButton
                label="Centro"
                active={editor.isActive({ textAlign: 'center' })}
                onClick={() => editor.chain().focus().setTextAlign('center').run()}
              />
              <ToolbarButton
                label="Der"
                active={editor.isActive({ textAlign: 'right' })}
                onClick={() => editor.chain().focus().setTextAlign('right').run()}
              />
            </div>
          )}

          {/* Área del editor */}
          <div className="rounded-lg border border-neutral-800 bg-neutral-900/40 p-3 focus-within:ring-2 focus-within:ring-primary-turquoise/40">
            {/* Editor */}
            <EditorContent editor={editor} className="tiptap-content min-h-[280px] text-neutral-100" />

            {/* Menú burbuja (v3: elemento DOM) */}
            <div
              ref={bubbleMenuRef}
              className="flex gap-1 rounded-md border border-neutral-800 bg-neutral-900/90 p-1 shadow-md"
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

            {/* Menú flotante eliminado */}
          </div>

          <div className="mt-2 flex flex-wrap gap-3">
            <button
              onClick={() => save(false)}
              className="inline-flex items-center justify-center rounded-md border border-primary-turquoise/40 bg-transparent px-4 py-2 text-sm font-medium text-primary-turquoise transition-colors hover:border-primary-turquoise hover:bg-primary-turquoise/10 focus:outline-none focus:ring-2 focus:ring-primary-turquoise/40 hover:cursor-pointer"
            >
              Guardar borrador
            </button>
            <button
              onClick={() => save(true)}
              className="inline-flex items-center justify-center rounded-md bg-primary-turquoise px-4 py-2 text-sm font-semibold text-neutral-950 shadow-sm shadow-primary-turquoise/20 transition-colors hover:bg-primary-turquoise/90 focus:outline-none focus:ring-2 focus:ring-neutral-100/20 hover:cursor-pointer"
            >
              Publicar
            </button>
            {/* Acciones sobre el borrador cargado (por slug actual) */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => slug && updateDraftBySlug(slug)}
                className="inline-flex items-center justify-center rounded-md border border-neutral-700 bg-neutral-800/40 px-3 py-2 text-xs font-medium text-neutral-200 transition-colors hover:border-primary-turquoise/40 hover:bg-neutral-800/60 focus:outline-none focus:ring-2 focus:ring-primary-turquoise/30 hover:cursor-pointer"
                title="Actualizar borrador actual"
                aria-label="Actualizar borrador actual"
              >
                Actualizar borrador
              </button>
              <button
                onClick={() => slug && deleteDraftBySlug(slug)}
                className="inline-flex items-center justify-center rounded-md border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs text-red-300 transition-colors hover:border-red-400 hover:bg-red-500/20 focus:outline-none focus:ring-2 focus:ring-red-400/30 hover:cursor-pointer"
                title="Eliminar borrador actual"
                aria-label="Eliminar borrador actual"
              >
                Eliminar borrador
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-neutral-100">Entradas</h2>
        <ul className="space-y-2">
          {posts.map((p: any) => (
            <li
              key={p.id}
              className="flex items-center justify-between gap-3 rounded-lg border border-neutral-800 bg-neutral-900/30 px-4 py-3 text-neutral-200 transition-colors hover:border-primary-turquoise/30 hover:bg-neutral-900/40"
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
                  {p.published_at ? 'Publicado' : 'Borrador'}
                </span>
                {!p.published_at && (
                  <>
                    <button
                      onClick={() => loadDraftBySlug(p.slug)}
                      className="inline-flex items-center justify-center rounded-md border border-neutral-700 bg-neutral-800/40 px-2.5 py-1.5 text-xs text-neutral-200 transition-colors hover:border-primary-turquoise/40 hover:bg-neutral-800/60 focus:outline-none focus:ring-2 focus:ring-primary-turquoise/30 hover:cursor-pointer"
                      title="Editar borrador"
                      aria-label="Editar borrador"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => updateDraftBySlug(p.slug)}
                      className="inline-flex items-center justify-center rounded-md border border-neutral-700 bg-neutral-800/40 px-2.5 py-1.5 text-xs text-neutral-200 transition-colors hover:border-primary-turquoise/40 hover:bg-neutral-800/60 focus:outline-none focus:ring-2 focus:ring-primary-turquoise/30 hover:cursor-pointer"
                      title="Actualizar borrador"
                      aria-label="Actualizar borrador"
                    >
                      Actualizar
                    </button>
                    <button
                      onClick={() => deleteDraftBySlug(p.slug)}
                      className="inline-flex items-center justify-center rounded-md border border-red-500/40 bg-red-500/10 px-2.5 py-1.5 text-xs text-red-300 transition-colors hover:border-red-400 hover:bg-red-500/20 focus:outline-none focus:ring-2 focus:ring-red-400/30 hover:cursor-pointer"
                      title="Eliminar borrador"
                      aria-label="Eliminar borrador"
                    >
                      Eliminar
                    </button>
                  </>
                )}
                {p.published_at && (
                  <button
                    onClick={() => deletePostBySlug(p.slug)}
                    className="inline-flex items-center justify-center rounded-md border border-red-500/40 bg-red-500/10 px-2.5 py-1.5 text-xs text-red-300 transition-colors hover:border-red-400 hover:bg-red-500/20 focus:outline-none focus:ring-2 focus:ring-red-400/30 hover:cursor-pointer"
                    title="Eliminar post publicado"
                    aria-label="Eliminar post publicado"
                  >
                    Eliminar
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
      <SignedIn>
        <AdminApp />
      </SignedIn >
      <SignedOut>
        <div className="grid min-h-auto place-items-center">
          <SignInButton mode="modal" >
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-md border border-primary-turquoise px-4 py-2 text-sm font-medium text-primary-turquoise transition-colors hover:border-primary-turquoise/90 hover:bg-primary-turquoise/10 focus:outline-none focus:ring-2 focus:ring-primary-turquoise/40 cursor-pointer"
            >
              Iniciar sesión
            </button>
          </SignInButton>
        </div>
      </SignedOut>
    </ClerkProvider>
  );
}