import Image from 'next/image';
import Link from 'next/link';
import { withBasePath } from '@/lib/basePath';
import './Navbar.scss';

export function Navbar() {
  return (
    <nav className="navbar" aria-label="Primary">
      <section className="navbar__content">
        <Link href="/" className="navbar__logo" aria-label="Home">
          <Image
            src={withBasePath('/icons/home.png')}
            alt=""
            width={22}
            height={20}
            className="navbar__homeIcon"
          />
        </Link>
        <div className="navbar__links">
          <Link href="/">Home</Link>
          <Link href="/article">Articles</Link>
        </div>
      </section>
    </nav>
  );
}
