import { SITE_CONFIG } from '@/lib/constants';

export default function BottomCTA() {
  return (
    <div className="mt-14 relative overflow-hidden bg-gradient-to-br from-primary via-primary-dark to-violet-900 rounded-2xl p-8 md:p-12 text-white text-center not-prose">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(255,255,255,0.1),transparent_50%)]" />

      <div className="relative">
        <span className="inline-block bg-white/15 text-white/90 text-xs font-semibold px-3 py-1 rounded-full mb-4">
          숙박업 통합 관리
        </span>

        <h3 className="text-xl md:text-2xl font-extrabold mb-3">
          숙박업 운영, 지금 바로 시작하세요
        </h3>

        <p className="text-sm text-white/70 mb-8 max-w-md mx-auto leading-relaxed">
          예약 관리부터 매출 분석까지, 숙박업 운영의 모든 것을 손쉽게 관리할 수 있습니다.
          이미 많은 숙박업 운영자가 함께하고 있습니다.
        </p>

        <a
          href={SITE_CONFIG.company.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-white text-primary font-bold px-8 py-3.5 rounded-button hover:bg-primary-light hover:shadow-lg transition-all"
        >
          {SITE_CONFIG.company.cta}
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </a>

        {/* Trust signals */}
        <div className="mt-8 flex items-center justify-center gap-6 text-xs text-white/50">
          <span>무료 상담</span>
          <span className="w-1 h-1 rounded-full bg-white/30" />
          <span>빠른 도입</span>
          <span className="w-1 h-1 rounded-full bg-white/30" />
          <span>전문 지원</span>
        </div>
      </div>
    </div>
  );
}
