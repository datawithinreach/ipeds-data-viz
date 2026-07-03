import { NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase/admin';
import { setAdminClaimIfNeeded } from '@/lib/auth/admin';

const FIVE_DAYS_MS = 60 * 60 * 24 * 5 * 1000;

export async function POST(request: Request) {
  try {
    const { idToken } = (await request.json()) as { idToken?: string };
    if (!idToken) {
      return NextResponse.json({ error: 'Missing idToken' }, { status: 400 });
    }

    const decoded = await adminAuth.verifyIdToken(idToken);

    if (decoded.email) {
      await setAdminClaimIfNeeded(decoded.uid, decoded.email);
    }

    const sessionCookie = await adminAuth.createSessionCookie(idToken, {
      expiresIn: FIVE_DAYS_MS,
    });

    const res = NextResponse.json({ status: 'ok' });
    res.cookies.set('session', sessionCookie, {
      maxAge: FIVE_DAYS_MS / 1000,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      sameSite: 'lax',
    });

    return res;
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Session creation failed';
    return NextResponse.json({ error: message }, { status: 401 });
  }
}
