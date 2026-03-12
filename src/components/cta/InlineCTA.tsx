import { SITE_CONFIG } from '@/lib/constants';

export default function InlineCTA() {
  return (
    <div className="my-10 border-l-4 border-primary bg-gradient-to-r from-primary-light to-white rounded-r-card p-6 not-prose">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
          <svg
            className="w-5 h-5 text-primary"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 10V3L4 14h7v7l9-11h-7z"
            />
          </svg>
        </div>
        <div className="flex-1">
          <p className="text-sm font-bold text-foreground mb-1.5">
            숙박업 운영, 더 쉽게 할 수 있습니다
          </p>
          <p className="text-sm text-muted leading-relaxed mb-3">
            예약 관리, 객실 관리, 매출 분석까지 하나의 플랫폼에서 해결하세요.
            통합 관리 솔루션으로 운영 효율을 높이고 매출을 성장시킬 수 있습니다.
          </p>
          <a
            href={SITE_CONFIG.company.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:text-primary-dark transition-colors"
          >
            자세히 알아보기
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </a>
        </div>
      </div>
    </div>
  );
}
