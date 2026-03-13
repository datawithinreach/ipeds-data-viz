import Link from 'next/link';

export function Navbar() {
  return (
    <nav className="bg-navbar text-primary px-32 py-4">
      <section className="flex items-center justify-between font-medium">
        <div className="flex items-center gap-2">
          <svg width="28" height="16" viewBox="0 0 28 16" fill="none">
            <line
              x1="2"
              y1="2"
              x2="26"
              y2="14"
              stroke="#501315"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            <line
              x1="26"
              y1="2"
              x2="2"
              y2="14"
              stroke="#501315"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          </svg>
        </div>
        <div className="flex items-center gap-8">
          <Link href="/">Home</Link>
          <Link href="/data-explorer">Data Explorer</Link>
          <Link href="/about">About</Link>
        </div>
      </section>
    </nav>
  );
}
