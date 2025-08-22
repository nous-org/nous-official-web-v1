import type { APIRoute } from 'astro';

export const prerender = false;

function renderBody(status: 'success' | 'error', content: unknown): string {
  const safe = JSON.stringify(content).replace(/</g, '\\u003c');

  return /* html */ `
    <!doctype html>
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

export const GET: APIRoute = async ({ url, locals }) => {
  const env = locals.runtime?.env;
  const clientId = env?.GITHUB_CLIENT_ID;
  const clientSecret = env?.GITHUB_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return new Response(renderBody('error', { message: 'Missing env' }), {
      status: 500,
      headers: { 'content-type': 'text/html;charset=utf-8' }
    });
  }

  // 1. “code” que envía GitHub
  const code = url.searchParams.get('code');
  if (!code) {
    return new Response(renderBody('error', { message: 'Missing code' }), {
      status: 400,
      headers: { 'content-type': 'text/html;charset=utf-8' }
    });
  }

  // 2. Intercambiamos code → token
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

  // 3. Éxito → devolvemos HTML que cierra el popup y manda al admin
  const token = ghJson.access_token;
  return new Response(
    renderBody('success', { token, provider: 'github' }),
    {
      status: 200,
      headers: { 'content-type': 'text/html;charset=utf-8' }
    }
  );
};