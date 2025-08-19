import type { APIContext, MiddlewareHandler } from 'astro';

export const onRequest: MiddlewareHandler = async (context, next) => {
  try {
    // Add security headers
    const response = await next();
    
    // Add security headers to all responses
    const newResponse = new Response(response.body, response);
    newResponse.headers.set('X-Content-Type-Options', 'nosniff');
    newResponse.headers.set('X-Frame-Options', 'DENY');
    newResponse.headers.set('X-XSS-Protection', '1; mode=block');
    
    return newResponse;
  } catch (error) {
    console.error('Error in middleware:', error);
    
    // Return a proper error response
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    return new Response(
      JSON.stringify({
        error: 'Internal Server Error',
        message: errorMessage,
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
