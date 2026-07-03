import Link from 'next/link';
import './Footer.scss';

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="footer">
      <div className="footer__inner">
        <div className="footer__brand">
          <div className="footer__logo">
            <svg width="22" height="14" viewBox="0 0 28 16" fill="none" aria-hidden="true">
              <line x1="2" y1="2" x2="26" y2="14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
              <line x1="26" y1="2" x2="2" y2="14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
            <span>Inside College Data</span>
          </div>
          <p className="footer__tagline">
            IPEDS-driven stories about US higher education.
          </p>
        </div>

        <div className="footer__cols">
          <div className="footer__col">
            <h4>Read</h4>
            <Link href="/">Latest stories</Link>
            <Link href="/data-explorer">Data explorer</Link>
            <Link href="/about">About</Link>
          </div>
          <div className="footer__col">
            <h4>Contribute</h4>
            <Link href="/generate">Generate an article</Link>
            <Link href="/my-articles">My articles</Link>
            <Link href="/signup">Create an account</Link>
          </div>
          <div className="footer__col">
            <h4>Sources</h4>
            <a href="https://nces.ed.gov/ipeds" target="_blank" rel="noreferrer">IPEDS / NCES</a>
            <a href="https://nces.ed.gov/ipeds/use-the-data" target="_blank" rel="noreferrer">Use the IPEDS data</a>
          </div>
        </div>
      </div>
      <div className="footer__base">
        <span>© {year} Inside College Data</span>
        <span>
          Data: IPEDS / National Center for Education Statistics, US Department of Education.
        </span>
      </div>
    </footer>
  );
}
