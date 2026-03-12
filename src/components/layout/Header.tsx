'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { SITE_CONFIG, CATEGORIES } from '@/lib/constants';

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/80 backdrop-blur-xl shadow-sm border-b border-border/50'
          : 'bg-white/60 backdrop-blur-md border-b border-transparent'
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-violet-600 flex items-center justify-center text-white text-sm font-bold shadow-sm">
            O
          </span>
          <span className="text-lg font-bold text-foreground group-hover:text-primary transition-colors">
            {SITE_CONFIG.name}
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1">
          {Object.entries(CATEGORIES).map(([key, { label }]) => (
            <Link
              key={key}
              href={`/category/${encodeURIComponent(key)}`}
              className="px-3 py-2 text-sm text-muted hover:text-foreground hover:bg-primary-light rounded-lg transition-all"
            >
              {label}
            </Link>
          ))}
          <a
            href={SITE_CONFIG.company.url}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-3 bg-primary text-white px-4 py-2 rounded-button text-sm font-medium hover:bg-primary-dark hover:shadow-md transition-all"
          >
            {SITE_CONFIG.company.cta}
          </a>
        </nav>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden relative w-10 h-10 flex items-center justify-center rounded-lg hover:bg-primary-light transition-colors"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label={menuOpen ? '메뉴 닫기' : '메뉴 열기'}
          aria-expanded={menuOpen}
        >
          <div className="w-5 flex flex-col gap-1.5">
            <span
              className={`block h-0.5 bg-foreground rounded-full transition-all duration-300 ${
                menuOpen ? 'rotate-45 translate-y-2' : ''
              }`}
            />
            <span
              className={`block h-0.5 bg-foreground rounded-full transition-all duration-300 ${
                menuOpen ? 'opacity-0 scale-0' : ''
              }`}
            />
            <span
              className={`block h-0.5 bg-foreground rounded-full transition-all duration-300 ${
                menuOpen ? '-rotate-45 -translate-y-2' : ''
              }`}
            />
          </div>
        </button>
      </div>

      {/* Mobile Nav */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
          menuOpen ? 'max-h-80 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <nav className="bg-white/95 backdrop-blur-xl border-t border-border/50 px-4 py-3 space-y-1">
          {Object.entries(CATEGORIES).map(([key, { label }]) => (
            <Link
              key={key}
              href={`/category/${encodeURIComponent(key)}`}
              className="block px-3 py-2.5 text-muted hover:text-foreground hover:bg-primary-light rounded-lg transition-all"
              onClick={() => setMenuOpen(false)}
            >
              {label}
            </Link>
          ))}
          <a
            href={SITE_CONFIG.company.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block mt-2 bg-primary text-white px-4 py-2.5 rounded-button text-sm font-medium text-center hover:bg-primary-dark transition-colors"
          >
            {SITE_CONFIG.company.cta}
          </a>
        </nav>
      </div>
    </header>
  );
}
