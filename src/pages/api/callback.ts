// src/pages/api/callback.ts
import type { APIRoute } from 'astro';

export const prerender = false;

function getCookie(cookies: string | null, name: string): string | null {
  if (!cookies) return null;
  const m = cookies.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return m ? decodeURIComponent(m[1]) : null;
}

function renderBody(status: 'success' | 'error', content: unknown): string {
  const safe = JSON.stringify(content).replace(/</g, '\\u003c');
  // HTML mínimo que notifica a Decap en el opener
  return `<!doctype html>
    <html>
      <head><meta charset="utf-8" /></head>
      <body>
        <script>
          (function () {
            const payload = 'authorization:github:${status}:${safe}';
            // Entrega el resultado a la ventana que abrió el popup
            window.opener?.postMessage(payload, '*');

            // Lleva al usuario a /admin/ (si ya estaba allí solo recarga)
            window.opener?.location.replace('/admin/');

            // Pequeño delay para evitar que algunos navegadores
            // bloqueen window.close() inmediatamente
            setTimeout(() => window.close(), 50);
          })();
        </script>
      </body>
    </html>`;
}

export const GET: APIRoute = async ({ url, locals, request }) => {
  const env = locals.runtime?.env;
  const clientId = env?.GITHUB_CLIENT_ID;
  const clientSecret = env?.GITHUB_CLIENT_SECRET;
  const redirectUri = env?.AUTH_REDIRECT_URI || 'https://nous.cr/api/callback';
  if (!clientId || !clientSecret) {
    return new Response(renderBody('error', { message: 'Missing env' }), {
      status: 500,
      headers: { 'content-type': 'text/html;charset=utf-8' }
    });
  }

  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  const cookieState = getCookie(request.headers.get('cookie'), 'oauth_state');

  if (!code) {
    return new Response(renderBody('error', { message: 'Missing code' }), {
      status: 400, headers: { 'content-type': 'text/html;charset=utf-8' }
    });
  }

  // Valida CSRF
  if (!state || !cookieState || state !== cookieState) {
    return new Response(renderBody('error', { message: 'Invalid state' }), {
      status: 400, headers: { 'content-type': 'text/html;charset=utf-8' }
    });
  }

  const ghRes = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: {
      accept: 'application/json',
      'content-type': 'application/json',
      'user-agent': 'nous-cms-oauth'
    },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      code,
      redirect_uri: redirectUri // coherente con el paso de autorización
    })
  });

  const ghJson: any = await ghRes.json();
  if (!ghRes.ok || ghJson.error) {
    return new Response(renderBody('error', ghJson), {
      status: 401, headers: { 'content-type': 'text/html;charset=utf-8' }
    });
  }

  const token = ghJson.access_token;
  return new Response(renderBody('success', { token, provider: 'github' }), {
    status: 200,
    headers: {
      'content-type': 'text/html;charset=utf-8',
      // Opcional: borra el state
      'Set-Cookie': 'oauth_state=; Max-Age=0; Path=/; HttpOnly; Secure; SameSite=Lax; Domain=.nous.cr'
    }
  });
};