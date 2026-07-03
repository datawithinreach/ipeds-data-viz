'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signOut } from 'firebase/auth';
import { getFirebaseAuth } from '@/lib/firebase/client';
import { useAuth } from '@/components/auth/useAuth';

export function NavbarAuth() {
  const { user, loading, isAdmin } = useAuth();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  if (loading) return <div className="navbar__auth" />;

  if (!user) {
    return (
      <div className="navbar__auth">
        <Link href="/login" className="navbar__authLink">
          Log in
        </Link>
        <Link href="/signup" className="navbar__signupBtn">
          Sign up
        </Link>
      </div>
    );
  }

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    await signOut(getFirebaseAuth());
    setMenuOpen(false);
    router.push('/');
  }

  return (
    <div className="navbar__auth">
      <Link href="/generate" className="navbar__authLink">
        Generate
      </Link>
      <Link href="/my-articles" className="navbar__authLink">
        My Articles
      </Link>
      {isAdmin && (
        <Link href="/admin" className="navbar__authLink">
          Admin
        </Link>
      )}
      <div className="navbar__dropdown">
        <button
          className="navbar__avatarBtn"
          onClick={() => setMenuOpen((o) => !o)}
        >
          {(user.email ?? 'U')[0].toUpperCase()}
        </button>
        {menuOpen && (
          <div className="navbar__dropdownMenu">
            <div className="navbar__dropdownEmail">{user.email}</div>
            <button className="navbar__dropdownItem" onClick={handleLogout}>
              Log out
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
