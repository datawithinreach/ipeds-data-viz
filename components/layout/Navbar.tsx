import Link from 'next/link';
import './Navbar.scss';

function HomeIcon() {
  return (
    <svg
      className="navbar__homeIcon"
      width="22"
      height="20"
      viewBox="0 0 24 22"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        d="M3 10.5L12 4l9 6.5V19a1.5 1.5 0 01-1.5 1.5H4.5A1.5 1.5 0 013 19v-8.5z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
      <path
        d="M9 21V12.5h6V21"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Navbar() {
  return (
    <nav className="navbar" aria-label="Primary">
      <section className="navbar__content">
        <Link href="/" className="navbar__logo" aria-label="Home">
          <HomeIcon />
        </Link>
        <div className="navbar__links">
          <Link href="/#recent-articles">Articles</Link>
          <Link href="/about">About Us</Link>
        </div>
      </section>
    </nav>
  );
}
