import 'server-only';
import { cookies } from 'next/headers';
import { adminAuth, verifySession } from '@/lib/firebase/admin';

const adminEmails: Set<string> = new Set(
  (process.env.ADMIN_EMAILS ?? '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean),
);

export function isAdminEmail(email: string): boolean {
  return adminEmails.has(email.toLowerCase());
}

export async function getSessionUser() {
  const jar = await cookies();
  const token = jar.get('session')?.value;
  if (!token) return null;
  try {
    return await verifySession(token);
  } catch {
    return null;
  }
}

export async function requireAuth(request?: Request) {
  const user = await getSessionUser();
  if (user) return user;

  if (request) {
    const authHeader = request.headers.get('Authorization');
    if (authHeader?.startsWith('Bearer ')) {
      const idToken = authHeader.slice(7);
      try {
        return await adminAuth.verifyIdToken(idToken);
      } catch {
        // fall through to throw
      }
    }
  }

  throw new Error('Unauthorized');
}

export async function requireAdmin() {
  const user = await requireAuth();
  if (!user.email || !isAdminEmail(user.email)) {
    throw new Error('Forbidden');
  }
  return user;
}

export async function setAdminClaimIfNeeded(uid: string, email: string) {
  if (!isAdminEmail(email)) return;
  const existing = await adminAuth.getUser(uid);
  if (existing.customClaims?.admin) return;
  await adminAuth.setCustomUserClaims(uid, {
    ...existing.customClaims,
    admin: true,
  });
}
