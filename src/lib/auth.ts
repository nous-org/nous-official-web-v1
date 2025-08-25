import { verifyToken } from '@clerk/backend';

export async function requireClerk(req: Request, env: { CLERK_SECRET_KEY: string }) {
  const auth = req.headers.get('authorization') || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
  if (!token) throw new Error('Missing token');


  await verifyToken(token, { secretKey: env.CLERK_SECRET_KEY });
}