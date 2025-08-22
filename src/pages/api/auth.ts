import type { APIRoute } from 'astro';

export const prerender = false; // ← ¡importante! esto es server-only

export const GET: APIRoute = async ({ url, locals, redirect }) => {
  // 1. Variables de entorno inyectadas por el adapter-cloudflare
  const clientId = locals.runtime?.env?.GITHUB_CLIENT_ID;
  if (!clientId) {
    return new Response('GITHUB_CLIENT_ID missing', { status: 500 });
  }

  // 2. Construimos la URL de autorización de GitHub
  const githubAuth = new URL('https://github.com/login/oauth/authorize');
  githubAuth.searchParams.set('client_id', clientId);
  
  // Permite configurar explícitamente el dominio/base para redirect_uri desde el entorno (p. ej. https://nous.cr o https://auth.nous.cr)
  // Si no está definido, usa el origin actual (útil en dev/preview)
  const baseUrl = (locals.runtime?.env?.OAUTH_BASE_URL as string | undefined) ?? url.origin;
  githubAuth.searchParams.set('redirect_uri', `${baseUrl}/api/callback`);
  
  githubAuth.searchParams.set('scope', 'repo user');
  githubAuth.searchParams.set('state', crypto.randomUUID());

  // 3. Redirigimos (302 por defecto)
  return redirect(githubAuth.toString());
};