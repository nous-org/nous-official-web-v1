// src/pages/api/callback.ts
import type { APIRoute } from 'astro';

export const prerender = false;

function getCookie(cookies: string | null, name: string): string | null {
  if (!cookies) return null;
  const m = cookies.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return m ? decodeURIComponent(m[1]) : null;
}

function okHTML(token: string, targetOrigin: string) {
  const payload = JSON.stringify({ token });
  return `<!doctype html><html><head><meta charset="utf-8"></head><body>
<script>
  (function () {
    var msg = 'authorization:github:success:' + ${JSON.stringify(payload)};
    try { window.opener && window.opener.postMessage(msg, ${JSON.stringify(targetOrigin)}); }
    catch (e) { window.opener && window.opener.postMessage(msg, '*'); }
    setTimeout(() => window.close(), 20);
  })();
</script></body></html>`;
}

function errHTML(content: unknown, targetOrigin: string) {
  const json = JSON.stringify(content).replace(/</g, '\\u003c');
  return `<!doctype html><html><head><meta charset="utf-8"></head><body>
<script>
  (function () {
    var msg = 'authorization:github:error:' + ${JSON.stringify(json)};
    try { window.opener && window.opener.postMessage(msg, ${JSON.stringify(targetOrigin)}); }
    catch (e) { window.opener && window.opener.postMessage(msg, '*'); }
    setTimeout(() => window.close(), 20);
  })();
</script></body></html>`;
}

export const GET: APIRoute = async ({ url, locals, request }) => {
  const env = locals.runtime?.env;
  const clientId = env?.GITHUB_CLIENT_ID;
  const clientSecret = env?.GITHUB_CLIENT_SECRET;
  const redirectUri = env?.AUTH_REDIRECT_URI || 'https://nous.cr/api/callback';
  const adminOrigin = new URL(redirectUri).origin; // https://nous.cr

  if (!clientId || !clientSecret) {
    return new Response(errHTML({ message: 'Missing env' }, adminOrigin), {
      status: 500, headers: { 'content-type': 'text/html;charset=utf-8' },
    });
  }

  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  const cookieState = getCookie(request.headers.get('cookie'), 'oauth_state');

  if (!code) {
    return new Response(errHTML({ message: 'Missing code' }, adminOrigin), {
      status: 400, headers: { 'content-type': 'text/html;charset=utf-8' },
    });
  }
  if (!state || !cookieState || state !== cookieState) {
    return new Response(errHTML({ message: 'Invalid state' }, adminOrigin), {
      status: 400, headers: { 'content-type': 'text/html;charset=utf-8' },
    });
  }

  const ghRes = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: { accept: 'application/json', 'content-type': 'application/json', 'user-agent': 'nous-cms-oauth' },
    body: JSON.stringify({ client_id: clientId, client_secret: clientSecret, code, redirect_uri: redirectUri }),
  });
  const ghJson: any = await ghRes.json();

  if (!ghRes.ok || ghJson.error || !ghJson.access_token) {
    return new Response(errHTML(ghJson, adminOrigin), {
      status: 401, headers: { 'content-type': 'text/html;charset=utf-8' },
    });
  }

  return new Response(okHTML(ghJson.access_token, adminOrigin), {
    status: 200,
    headers: {
      'content-type': 'text/html;charset=utf-8',
      'Set-Cookie': 'oauth_state=; Max-Age=0; Path=/; HttpOnly; Secure; SameSite=Lax',
    },
  });
};