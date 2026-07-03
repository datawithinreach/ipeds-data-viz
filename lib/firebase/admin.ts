import 'server-only';
import {
  cert,
  getApps,
  initializeApp,
  type ServiceAccount,
} from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

function initAdmin() {
  if (getApps().length > 0) return getApps()[0];

  const raw = process.env.FIREBASE_ADMIN_SERVICE_ACCOUNT_JSON;
  if (!raw) {
    throw new Error(
      'Missing FIREBASE_ADMIN_SERVICE_ACCOUNT_JSON environment variable',
    );
  }

  const sa: ServiceAccount = JSON.parse(raw);
  return initializeApp({ credential: cert(sa) });
}

const app = initAdmin();

export const adminAuth = getAuth(app);
export const adminDb = getFirestore(app);

export async function verifySession(cookie: string) {
  return adminAuth.verifySessionCookie(cookie, true);
}
