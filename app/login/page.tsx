'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  signInWithPopup,
} from 'firebase/auth';
import { getFirebaseAuth } from '@/lib/firebase/client';
import './login.scss';

function LoginForm() {
  const router = useRouter();
  const search = useSearchParams();
  const next = search.get('next') || '/';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function createSession(idToken: string) {
    await fetch('/api/auth/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken }),
    });
  }

  async function handleEmailLogin(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const cred = await signInWithEmailAndPassword(
        getFirebaseAuth(),
        email,
        password,
      );
      const idToken = await cred.user.getIdToken();
      await createSession(idToken);
      router.replace(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setBusy(false);
    }
  }

  async function handleGoogleLogin() {
    setError(null);
    setBusy(true);
    try {
      const cred = await signInWithPopup(
        getFirebaseAuth(),
        new GoogleAuthProvider(),
      );
      const idToken = await cred.user.getIdToken();
      await createSession(idToken);
      router.replace(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Google sign-in failed');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="authPage">
      <div>
        <h1 className="authPage__title">Log in</h1>
        <p className="authPage__subtitle">
          Sign in to generate community articles.
        </p>
      </div>

      {error && <div className="authPage__error">{error}</div>}

      <form className="authPage__form" onSubmit={handleEmailLogin}>
        <input
          className="authPage__input"
          type="email"
          placeholder="you@example.com"
          value={email}
          autoComplete="email"
          required
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          className="authPage__input"
          type="password"
          placeholder="Password"
          value={password}
          autoComplete="current-password"
          required
          onChange={(e) => setPassword(e.target.value)}
        />
        <button
          className="authPage__primaryBtn"
          type="submit"
          disabled={busy}
        >
          {busy ? 'Signing in…' : 'Sign in'}
        </button>
      </form>

      <div className="authPage__divider">or</div>

      <button
        className="authPage__secondaryBtn"
        type="button"
        onClick={handleGoogleLogin}
        disabled={busy}
      >
        Continue with Google
      </button>

      <div className="authPage__footer">
        New here?{' '}
        <Link href={`/signup?next=${encodeURIComponent(next)}`}>
          Create an account
        </Link>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="authPage">Loading…</div>}>
      <LoginForm />
    </Suspense>
  );
}
