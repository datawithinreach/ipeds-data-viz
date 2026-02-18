'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { topicsByGroup } from '@/lib/topicCatalog';

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <nav className="border-accent/20 bg-primary-dark/95 sticky top-0 z-50 border-b backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3">
          <div className="bg-accent flex h-8 w-8 items-center justify-center rounded-lg">
            <svg
              className="text-primary-dark h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z"
              />
            </svg>
          </div>
          <span className="text-lg font-bold text-white">IPEDS DataViz</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden items-center gap-8 md:flex">
          {/* Browse By Topic dropdown */}
          <div ref={dropdownRef} className="relative">
            <button
              onClick={() => setOpen((v) => !v)}
              className="text-accent-light/80 hover:text-accent-light flex items-center gap-1 text-sm font-medium transition-colors"
            >
              Browse By Topic
              <svg
                className={`h-4 w-4 transition-transform ${open ? 'rotate-180' : ''}`}
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19.5 8.25l-7.5 7.5-7.5-7.5"
                />
              </svg>
            </button>

            {open && (
              <div className="border-accent/20 absolute top-full right-0 mt-3 w-[640px] rounded-xl border bg-white p-6 shadow-xl">
                <div className="mb-4 border-b border-gray-100 pb-3">
                  <span className="text-accent-dark text-xs font-semibold tracking-wider uppercase">
                    Explore Topics
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-6">
                  {topicsByGroup.map((group) => (
                    <div key={group.heading}>
                      <h4 className="text-primary mb-2 text-sm font-bold">
                        {group.heading}
                      </h4>
                      <ul className="space-y-1.5">
                        {group.links.map((link) => (
                          <li key={link.label}>
                            <Link
                              href={link.href}
                              onClick={() => setOpen(false)}
                              className="hover:text-primary block text-sm text-gray-600 transition-colors"
                            >
                              {link.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <a
            href="#"
            className="text-accent-light/80 hover:text-accent-light text-sm font-medium transition-colors"
          >
            About
          </a>
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMobileOpen((v) => !v)}
          className="md:hidden"
          aria-label="Toggle menu"
        >
          <svg
            className="text-accent-light h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
          >
            {mobileOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
              />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-accent/20 bg-primary-dark border-t px-6 pt-4 pb-6 md:hidden">
          <div className="pt-1">
            <span className="text-accent-dark text-xs font-semibold tracking-wider uppercase">
              Browse By Topic
            </span>
            {topicsByGroup.map((group) => (
              <div key={group.heading} className="mt-3">
                <h4 className="text-accent text-sm font-bold">
                  {group.heading}
                </h4>
                <ul className="mt-1 space-y-1 pl-3">
                  {group.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        onClick={() => setMobileOpen(false)}
                        className="text-accent-light/60 hover:text-accent-light block py-1 text-sm"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="border-accent/10 mt-3 border-t pt-3">
            <a
              href="#"
              onClick={() => setMobileOpen(false)}
              className="text-accent-light/80 hover:text-accent block py-2 text-sm font-medium"
            >
              About
            </a>
          </div>
        </div>
      )}
    </nav>
  );
}
