import Image from 'next/image';
import Link from 'next/link';
import './Navbar.scss';

export function Navbar() {
  return (
    <nav className="navbar" aria-label="Primary">
      <section className="navbar__content">
        <Link href="/" className="navbar__logo" aria-label="Home">
          <Image
            src="/icons/home.png"
            alt=""
            width={22}
            height={20}
            className="navbar__homeIcon"
          />
        </Link>
        <div className="navbar__links">
          <Link href="/">Home</Link>
          <Link href="/data-explorer">Data Explorer</Link>
          <Link href="/about">About</Link>
        </div>
      </section>
    </nav>
  );
}
