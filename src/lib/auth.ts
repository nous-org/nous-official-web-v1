import { verifyToken } from '@clerk/backend';

type AdminAuthEnv = {
  CLERK_SECRET_KEY?: string;
  CLERK_ADMIN_USER_IDS?: string;
  CLERK_ADMIN_ORG_IDS?: string;
  CLERK_ADMIN_ORG_ROLES?: string;
  CLERK_ADMIN_SESSION_CLAIM?: string;
  CLERK_ADMIN_SESSION_CLAIM_VALUES?: string;
};

export class AuthError extends Error {
  status: number;
  code: string;

  constructor(status: number, code: string, message: string) {
    super(message);
    this.name = 'AuthError';
    this.status = status;
    this.code = code;
  }
}

const splitList = (value?: string) =>
  value
    ?.split(',')
    .map((item) => item.trim())
    .filter(Boolean) ?? [];

const getClaim = (claims: Record<string, unknown>, path: string) =>
  path.split('.').reduce<unknown>((current, part) => {
    if (current && typeof current === 'object' && part in current) {
      return (current as Record<string, unknown>)[part];
    }
    return undefined;
  }, claims);

function hasAdminPolicy(env: AdminAuthEnv) {
  return Boolean(
    env.CLERK_ADMIN_USER_IDS
    || env.CLERK_ADMIN_ORG_IDS
    || env.CLERK_ADMIN_SESSION_CLAIM
  );
}

function isAuthorizedAdmin(verifiedToken: Record<string, unknown>, env: AdminAuthEnv) {
  const userId = String(verifiedToken.sub || '');
  const orgId = String(verifiedToken.org_id || '');
  const orgRole = String(verifiedToken.org_role || '');

  const adminUserIds = splitList(env.CLERK_ADMIN_USER_IDS);
  if (userId && adminUserIds.includes(userId)) return true;

  const adminOrgIds = splitList(env.CLERK_ADMIN_ORG_IDS);
  const adminOrgRoles = splitList(env.CLERK_ADMIN_ORG_ROLES);
  if (
    orgId
    && adminOrgIds.includes(orgId)
    && (adminOrgRoles.length === 0 || adminOrgRoles.includes(orgRole))
  ) {
    return true;
  }

  if (env.CLERK_ADMIN_SESSION_CLAIM) {
    const claim = getClaim(verifiedToken, env.CLERK_ADMIN_SESSION_CLAIM);
    const allowedValues = splitList(env.CLERK_ADMIN_SESSION_CLAIM_VALUES || 'admin,true');
    if (Array.isArray(claim)) {
      return claim.some((value) => allowedValues.includes(String(value)));
    }
    return allowedValues.includes(String(claim));
  }

  return false;
}

export function authErrorResponse(error: unknown) {
  if (error instanceof AuthError) {
    return new Response(JSON.stringify({
      success: false,
      error: error.code,
      message: error.message,
    }), {
      status: error.status,
      headers: { 'content-type': 'application/json', 'cache-control': 'no-store' },
    });
  }

  return new Response(JSON.stringify({
    success: false,
    error: 'AUTHENTICATION_FAILED',
    message: 'Authentication failed.',
  }), {
    status: 401,
    headers: { 'content-type': 'application/json', 'cache-control': 'no-store' },
  });
}

export async function requireClerk(req: Request, env: AdminAuthEnv) {
  if (!env.CLERK_SECRET_KEY) {
    throw new AuthError(403, 'ADMIN_AUTH_UNAVAILABLE', 'Admin access is unavailable.');
  }

  const auth = req.headers.get('authorization') || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
  if (!token) throw new AuthError(401, 'AUTH_TOKEN_MISSING', 'Missing authentication token.');

  const verifiedToken = await verifyToken(token, { secretKey: env.CLERK_SECRET_KEY }) as Record<string, unknown>;

  if (!hasAdminPolicy(env)) {
    throw new AuthError(403, 'ADMIN_POLICY_MISSING', 'Admin access is not configured.');
  }

  if (!isAuthorizedAdmin(verifiedToken, env)) {
    throw new AuthError(403, 'ADMIN_ACCESS_DENIED', 'Admin access denied.');
  }
  
  return {
    userId: String(verifiedToken.sub || ''),
    sessionId: verifiedToken.sid ? String(verifiedToken.sid) : undefined
  };
}
