import type { MiddlewareHandler } from 'astro';

const permanentRedirect = (url: URL) => new Response(null, {
  status: 301,
  headers: {
    Location: url.toString(),
    'Cache-Control': 'public, max-age=3600',
  },
});

const hasFileExtension = (pathname: string) =>
  /\/[^/]+\.[a-z0-9]{2,8}$/i.test(pathname);

const isLocalHost = (hostname: string) =>
  hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1';

export const onRequest: MiddlewareHandler = async (context, next) => {
  try {
    const pathname = context.url.pathname;

    if (context.url.hostname === 'www.nous.cr') {
      const canonicalHost = new URL(context.url);
      canonicalHost.hostname = 'nous.cr';
      return permanentRedirect(canonicalHost);
    }

    if (
      import.meta.env.PROD
      && context.url.protocol === 'http:'
      && !isLocalHost(context.url.hostname)
    ) {
      const httpsUrl = new URL(context.url);
      httpsUrl.protocol = 'https:';
      return permanentRedirect(httpsUrl);
    }

    const redirectMap: Record<string, string> = {
      '/about-us': '/about',
      '/about-us/': '/about',
      '/contact-us': '/contact',
      '/contact-us/': '/contact',
      '/es/about-us': '/es/about',
      '/es/about-us/': '/es/about',
      '/es/contact-us': '/es/contact',
      '/es/contact-us/': '/es/contact',
      '/pricing': '/services',
      '/pricing/': '/services',
      '/products': '/services',
      '/products/': '/services',
      '/es/pricing': '/es/services',
      '/es/pricing/': '/es/services',
      '/es/products': '/es/services',
      '/es/products/': '/es/services',
      '/blog/chatgpt-5-is-here-learn-about-its-improvements-use-cases-in-education-business-and-programming-and-the-future-of-ai': '/blog/building-a-more-intelligent-world',
      '/blog/chatgpt-5-is-here-learn-about-its-improvements-use-cases-in-education-business-and-programming-and-the-future-of-ai/': '/blog/building-a-more-intelligent-world',
      '/admin': 'https://admin.nous.cr',
      '/admin/': 'https://admin.nous.cr',
      '/es/admin': 'https://admin.nous.cr',
      '/es/admin/': 'https://admin.nous.cr',
    };

    const mappedPath = redirectMap[pathname];
    if (mappedPath) {
      const redirectUrl = mappedPath.startsWith('https://')
        ? new URL(mappedPath)
        : new URL(context.url);
      if (!mappedPath.startsWith('https://')) {
        redirectUrl.pathname = mappedPath;
      }
      return permanentRedirect(redirectUrl);
    }

    if (
      pathname.length > 1
      && pathname.endsWith('/')
      && !hasFileExtension(pathname.slice(0, -1))
    ) {
      const noSlashUrl = new URL(context.url);
      noSlashUrl.pathname = pathname.replace(/\/+$/, '');
      return permanentRedirect(noSlashUrl);
    }

    const response = await next();
    
    // Add baseline security headers to all responses.
    const newResponse = new Response(response.body, response);
    newResponse.headers.set('X-Content-Type-Options', 'nosniff');
    newResponse.headers.set('X-Frame-Options', 'DENY');
    newResponse.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    newResponse.headers.set('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');

    if (import.meta.env.PROD) {
      newResponse.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
    }
    
    return newResponse;
  } catch (error) {
    console.error('Middleware error:', error instanceof Error ? error.message : 'Unknown error');
    return new Response(
      JSON.stringify({
        error: 'Internal Server Error',
        message: 'An unexpected error occurred.',
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
};
