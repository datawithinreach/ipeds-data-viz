'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signInWithPopup,
} from 'firebase/auth';
import { getFirebaseAuth } from '@/lib/firebase/client';
import './signup.scss';

function SignupForm() {
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

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const cred = await createUserWithEmailAndPassword(
        getFirebaseAuth(),
        email,
        password,
      );
      try {
        await sendEmailVerification(cred.user);
      } catch {
        // best-effort
      }
      const idToken = await cred.user.getIdToken();
      await createSession(idToken);
      router.replace(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Signup failed');
    } finally {
      setBusy(false);
    }
  }

  async function handleGoogle() {
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
        <h1 className="authPage__title">Sign up</h1>
        <p className="authPage__subtitle">
          Create an account to generate articles from IPEDS data.
        </p>
      </div>

      {error && <div className="authPage__error">{error}</div>}

      <form className="authPage__form" onSubmit={handleSignup}>
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
          placeholder="Password (min 8 chars)"
          value={password}
          autoComplete="new-password"
          required
          minLength={8}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button
          className="authPage__primaryBtn"
          type="submit"
          disabled={busy}
        >
          {busy ? 'Creating account…' : 'Create account'}
        </button>
      </form>

      <div className="authPage__divider">or</div>

      <button
        className="authPage__secondaryBtn"
        type="button"
        onClick={handleGoogle}
        disabled={busy}
      >
        Continue with Google
      </button>

      <div className="authPage__footer">
        Already have an account?{' '}
        <Link href={`/login?next=${encodeURIComponent(next)}`}>Log in</Link>
      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="authPage">Loading…</div>}>
      <SignupForm />
    </Suspense>
  );
}
