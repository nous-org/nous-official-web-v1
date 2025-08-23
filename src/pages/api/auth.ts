// src/pages/api/auth.ts
import type { APIRoute } from 'astro';
export const prerender = false;

export const GET: APIRoute = async ({ locals, redirect }) => {
  const clientId = locals.runtime?.env?.GITHUB_CLIENT_ID;
  const redirectUri = locals.runtime?.env?.AUTH_REDIRECT_URI || 'https://nous.cr/api/callback';
  if (!clientId) return new Response('GITHUB_CLIENT_ID missing', { status: 500 });

  const state = crypto.randomUUID();
  const gh = new URL('https://github.com/login/oauth/authorize');
  gh.searchParams.set('client_id', clientId);
  gh.searchParams.set('redirect_uri', redirectUri);
  gh.searchParams.set('scope', 'repo'); // o 'public_repo' si tu repo es público
  gh.searchParams.set('state', state);

  const res = redirect(gh.toString());
  res.headers.append('Set-Cookie', `oauth_state=${state}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=600`);
  return res;
};