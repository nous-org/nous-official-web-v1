import type { MiddlewareHandler } from 'astro';

export const onRequest: MiddlewareHandler = async (context, next) => {
  try {
    // Keep deprecated placeholder routes unavailable even if a stale file reappears.
    const pathname = context.url.pathname;
    if (pathname === '/products' || pathname === '/pricing' || 
        pathname === '/products/' || pathname === '/pricing/') {
      return new Response(null, {
        status: 404,
        statusText: 'Not Found'
      });
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
