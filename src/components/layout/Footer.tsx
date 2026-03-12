import Link from 'next/link';
import { SITE_CONFIG, CATEGORIES } from '@/lib/constants';

export default function Footer() {
  return (
    <footer className="bg-foreground text-white mt-16">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-violet-600 flex items-center justify-center text-white text-sm font-bold">
                O
              </span>
              <span className="text-lg font-bold">{SITE_CONFIG.name}</span>
            </div>
            <p className="text-white/60 text-sm leading-relaxed">
              {SITE_CONFIG.description}
            </p>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white/40 mb-4">
              카테고리
            </h3>
            <ul className="space-y-2.5">
              {Object.entries(CATEGORIES).map(([key, { label }]) => (
                <li key={key}>
                  <Link
                    href={`/category/${encodeURIComponent(key)}`}
                    className="text-sm text-white/60 hover:text-white transition-colors"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white/40 mb-4">
              오아테크
            </h3>
            <ul className="space-y-2.5">
              <li>
                <a
                  href={SITE_CONFIG.company.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-white/60 hover:text-white transition-colors"
                >
                  홈페이지
                </a>
              </li>
              <li>
                <a
                  href={SITE_CONFIG.company.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-white/60 hover:text-white transition-colors"
                >
                  무료 상담 신청
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider + Copyright */}
        <div className="border-t border-white/10 mt-10 pt-6 flex flex-col md:flex-row justify-between items-center gap-2">
          <p className="text-xs text-white/40">
            &copy; {new Date().getFullYear()} {SITE_CONFIG.company.name}. All rights reserved.
          </p>
          <p className="text-xs text-white/30">
            Powered by Next.js
          </p>
        </div>
      </div>
    </footer>
  );
}
