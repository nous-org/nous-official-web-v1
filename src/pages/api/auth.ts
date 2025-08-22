// src/pages/api/auth.ts
import type { APIRoute } from 'astro';
export const prerender = false;

export const GET: APIRoute = async ({ url, locals, redirect }) => {
  const clientId = locals.runtime?.env?.GITHUB_CLIENT_ID;
  const redirectUri = locals.runtime?.env?.AUTH_REDIRECT_URI || 'https://nous.cr/api/callback'; // Fijo
  if (!clientId) return new Response('GITHUB_CLIENT_ID missing', { status: 500 });

  // Genera y guarda state en cookie para validarlo luego
  const state = crypto.randomUUID();

  const githubAuth = new URL('https://github.com/login/oauth/authorize');
  githubAuth.searchParams.set('client_id', clientId);
  githubAuth.searchParams.set('redirect_uri', redirectUri);
  githubAuth.searchParams.set('scope', 'repo'); // o 'public_repo' si el repo es público
  githubAuth.searchParams.set('state', state);

  // Cookie segura (ajusta el dominio si usas subdominios)
  const res = redirect(githubAuth.toString());
  res.headers.append(
    'Set-Cookie',
    `oauth_state=${state}; Path=/; HttpOnly; Secure; SameSite=Lax; Domain=.nous.cr; Max-Age=600`
  );
  return res;
};