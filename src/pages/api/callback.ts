import type { APIRoute } from 'astro';

export const prerender = false; // ← debe ejecutarse solo en runtime

/**
 * Devuelve la página HTML que Decap CMS espera para completar el login.
 */
function renderBody(
  status: 'success' | 'error',
  content: unknown
): string {
  // Evita que "</script>" rompa la página
  const safe = JSON.stringify(content).replace(/</g, '\\u003c');

  return /* html */ `
    <!doctype html>
    <html>
      <head><meta charset="utf-8" /></head>
      <body>
        <script>
          (function () {
            function receiveMessage(e) {
              window.opener.postMessage(
                'authorization:github:${status}:${safe}',
                e.origin
              );
              window.removeEventListener('message', receiveMessage, false);
              window.close();
            }
            window.addEventListener('message', receiveMessage, false);
            window.opener.postMessage('authorizing:github', '*');
          })();
        </script>
      </body>
    </html>`;
}

export const GET: APIRoute = async ({ url, locals }) => {
  const env = locals.runtime?.env;
  const clientId = env?.GITHUB_CLIENT_ID;
  const clientSecret = env?.GITHUB_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return new Response(
      renderBody('error', { message: 'Missing GitHub credentials' }),
      { status: 500, headers: { 'content-type': 'text/html;charset=utf-8' } }
    );
  }

  const code = url.searchParams.get('code');
  if (!code) {
    return new Response(
      renderBody('error', { message: 'Missing OAuth “code”' }),
      { status: 400, headers: { 'content-type': 'text/html;charset=utf-8' } }
    );
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
      code
    })
  });

  const ghJson: any = await ghRes.json();

  if (!ghRes.ok || ghJson.error) {
    return new Response(renderBody('error', ghJson), {
      status: 401,
      headers: { 'content-type': 'text/html;charset=utf-8' }
    });
  }

  const token = ghJson.access_token;
  return new Response(
    renderBody('success', { token, provider: 'github' }),
    {
      status: 200,
      headers: { 'content-type': 'text/html;charset=utf-8' }
    }
  );
};