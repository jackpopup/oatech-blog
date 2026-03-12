# Blog Enhancement v2 Planning Document

> **Summary**: 오아테크 블로그 자동 발행 시스템의 디자인, 콘텐츠 품질, UX 전반 고도화
>
> **Project**: oatech-blog
> **Version**: 0.2.0
> **Author**: 최준호 (CTO Lead Agent)
> **Date**: 2026-03-12
> **Status**: Draft

---

## 1. Overview

### 1.1 Purpose

현재 구현된 블로그 시스템(v0.1)의 디자인, 콘텐츠 품질, UX를 "현대적이고 모던하게" 전면 개선하여 오아테크의 브랜드 신뢰도를 높이고, SEO 유입 → 전환(CTA 클릭)의 퍼널을 강화한다.

### 1.2 Background

v0.1 현황 분석 결과:

**[구조적 완성도: 7/10]**
- Next.js 16 App Router + Tailwind CSS 4 + MDX 파이프라인이 정상 작동
- SSG 빌드 성공, GitHub Actions 자동 발행, robots.txt/sitemap.xml 존재
- 타입 시스템, 키워드 DB, 프롬프트 템플릿 구조 양호

**[디자인 완성도: 3/10]**
- 최소한의 Tailwind 유틸리티만 사용, 커스텀 디자인 시스템 부재
- 색상 팔레트가 기본 blue (#2563eb) 한 가지, 브랜드 아이덴티티 없음
- PostCard에 썸네일/이미지 없음 (텍스트만으로 구성)
- Hero 섹션이 텍스트 2줄로 단조로움
- 다크모드 미지원, 애니메이션/마이크로인터랙션 전무
- 타이포그래피: Geist 폰트만 사용, 한글 최적화 없음

**[콘텐츠 품질: 4/10]**
- 프롬프트가 단순하여 AI 생성 글이 일반적이고 깊이 부족
- 구조화 데이터(Schema.org Article) 미적용
- 읽기 예상 시간, 목차(ToC) 없음
- 관련 글 추천 없음
- 썸네일 자동 생성 없음

**[UX 완성도: 4/10]**
- 페이지네이션 미구현 (글이 늘어나면 문제)
- 검색 기능 없음
- 카테고리 네비게이션이 Header에만 존재
- 글 읽기 경험: 사이드바/ToC 없이 단순 스크롤
- 로딩 상태, 에러 바운더리 없음
- 접근성(a11y) 미검토

**[자동화/운영: 6/10]**
- GitHub Actions cron 작동
- 키워드 사용 추적 있으나, 키워드 고갈 시 대응 없음
- 관리자 대시보드 미구현 (Plan에는 있으나 코드 없음)
- 콘텐츠 품질 검증 단계 없음 (AI 출력 → 바로 발행)

### 1.3 Related Documents

- 기존 Plan: `docs/01-plan/features/auto-blog-publisher.plan.md`
- 기존 Design: `docs/02-design/features/auto-blog-publisher.design.md`

---

## 2. Scope

### 2.1 In Scope

- [x] 디자인 시스템 수립 (색상, 타이포그래피, 스페이싱, 컴포넌트)
- [x] Hero 섹션 리디자인 (시각적 임팩트)
- [x] PostCard 리디자인 (썸네일, 호버 이펙트, 읽기 시간)
- [x] 글 상세 페이지 UX 개선 (ToC, 읽기 시간, 관련 글)
- [x] CTA 컴포넌트 고도화 (디자인 + A/B 변형)
- [x] 한글 웹폰트 최적화 (Pretendard 또는 Noto Sans KR)
- [x] 다크모드 지원
- [x] 페이지네이션/무한 스크롤
- [x] AI 프롬프트 고도화 (콘텐츠 품질 향상)
- [x] 구조화 데이터(Schema.org) 적용
- [x] OG 이미지 자동 생성
- [x] 글 검색 기능 (클라이언트 사이드)
- [x] 접근성(a11y) 기본 준수

### 2.2 Out of Scope

- 댓글 시스템 (향후 Giscus 등 검토)
- 뉴스레터 구독
- 다국어 지원
- 관리자 대시보드 (별도 PDCA 사이클로)
- 서버 사이드 검색 / Algolia 연동

---

## 3. Requirements

### 3.1 Functional Requirements

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| FR-01 | 디자인 시스템 구축 (색상, 타이포, 컴포넌트 토큰) | Critical | Pending |
| FR-02 | Hero 섹션 리디자인 (그래디언트, 일러스트, 최신글 하이라이트) | High | Pending |
| FR-03 | PostCard 리디자인 (썸네일, 카테고리 뱃지, 읽기시간, 호버) | High | Pending |
| FR-04 | 글 상세 ToC(목차) 자동 생성 | High | Pending |
| FR-05 | 글 상세 읽기 예상 시간 표시 | Medium | Pending |
| FR-06 | 관련 글 추천 (같은 카테고리/태그 기반) | Medium | Pending |
| FR-07 | 다크모드 토글 | High | Pending |
| FR-08 | 한글 웹폰트 적용 (Pretendard) | High | Pending |
| FR-09 | 페이지네이션 (메인, 카테고리) | High | Pending |
| FR-10 | 글 검색 기능 (클라이언트 사이드 전문 검색) | Medium | Pending |
| FR-11 | OG 이미지 자동 생성 (next/og) | Medium | Pending |
| FR-12 | Schema.org Article 구조화 데이터 | High | Pending |
| FR-13 | AI 프롬프트 v2 (사례/데이터 포함, 단계별 생성) | Critical | Pending |
| FR-14 | CTA 컴포넌트 A/B 변형 (최소 3종) | Medium | Pending |
| FR-15 | 카테고리 필터 UI (메인 페이지) | Medium | Pending |
| FR-16 | 스크롤 진행률 인디케이터 (글 상세) | Low | Pending |
| FR-17 | 코드 블록 하이라이팅 + 복사 버튼 | Low | Pending |

### 3.2 Non-Functional Requirements

| Category | Criteria | Measurement Method |
|----------|----------|-------------------|
| Performance | LCP < 2.5s, FID < 100ms, CLS < 0.1 | Lighthouse CI |
| SEO | Lighthouse SEO 점수 95+ | Lighthouse |
| Accessibility | WCAG 2.1 AA 기본 준수 | axe-core |
| Bundle Size | JS 번들 < 150KB gzipped | next build analyze |
| Build Time | 50개 글 기준 빌드 < 60s | CI 로그 |

---

## 4. Success Criteria

### 4.1 Definition of Done

- [ ] 모든 Critical/High 요구사항 구현 완료
- [ ] Lighthouse Performance 80+, SEO 95+, Accessibility 80+
- [ ] 다크모드/라이트모드 전환 정상
- [ ] 모바일(375px), 태블릿(768px), 데스크톱(1280px) 반응형 정상
- [ ] 빌드 성공 + 기존 콘텐츠 호환
- [ ] AI 생성 글 품질 검토 (최소 3개 샘플)

### 4.2 Quality Criteria

- [ ] Zero lint errors
- [ ] Build succeeds
- [ ] 모든 페이지 hydration 오류 없음
- [ ] CTA 클릭 이벤트 추적 가능 상태

---

## 5. Risks and Mitigation

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| Tailwind CSS 4 + 커스텀 테마 호환 이슈 | High | Medium | @theme inline 활용, 단계별 적용 |
| 한글 웹폰트 로딩 지연 (LCP 악화) | High | High | font-display: swap, subset, next/font |
| AI 프롬프트 변경 후 기존 글과 톤 불일치 | Medium | Medium | 기존 글은 그대로 유지, 신규 글부터 적용 |
| OG 이미지 생성 빌드 시간 증가 | Medium | Low | ISR 또는 on-demand 생성 |
| 다크모드 적용 시 기존 색상 깨짐 | Medium | High | CSS 변수 기반 전환, 전체 컴포넌트 검토 |

---

## 6. Architecture Considerations

### 6.1 Project Level Selection

| Level | Characteristics | Selected |
|-------|-----------------|:--------:|
| **Starter** | Simple structure | ---- |
| **Dynamic** | Feature-based modules, BaaS integration | [x] |
| **Enterprise** | Strict layer separation, DI, microservices | ---- |

**결정**: Dynamic 레벨 유지. SSG 블로그 특성상 백엔드 서비스 없이 정적 생성으로 충분.

### 6.2 Key Architectural Decisions

| Decision | Options | Selected | Rationale |
|----------|---------|----------|-----------|
| Framework | Next.js 16 | Next.js 16 | 이미 사용 중, App Router SSG 최적 |
| Styling | Tailwind CSS 4 | Tailwind CSS 4 | @theme 시스템 활용한 디자인 토큰 |
| Font | Pretendard / Noto Sans KR / Geist | Pretendard + Geist | 한글 최적화 + 영문 가독성 |
| Dark Mode | CSS variables / next-themes | next-themes + CSS variables | 안정적, SSR 호환 |
| ToC | rehype-toc / 커스텀 | 커스텀 (heading 파싱) | 의존성 최소화 |
| OG Image | next/og (Satori) | next/og | Next.js 내장, 별도 서비스 불필요 |
| Search | Fuse.js / 커스텀 | Fuse.js | 경량, 클라이언트 사이드 |
| Animation | Framer Motion / CSS | CSS + 최소 Framer Motion | 번들 사이즈 제어 |

### 6.3 디자인 시스템 구조

```
globals.css (@theme inline)
├── Color Tokens
│   ├── Primary: 오아테크 브랜드 블루 계열
│   ├── Secondary: 보조 색상 (웜 그레이, 그린 포인트)
│   ├── Semantic: success, warning, error, info
│   └── Dark Mode: 대응 색상 전체 정의
├── Typography Tokens
│   ├── font-family: Pretendard (한글) + Geist (영문/코드)
│   ├── Scale: xs ~ 4xl (모바일 대응 clamp)
│   └── Line Height: 본문 1.8, 제목 1.3
├── Spacing Tokens
│   └── 4px 베이스 시스템
└── Component Tokens
    ├── Card: 라운딩, 섀도, 호버
    ├── Button: 사이즈, 색상, 상태
    └── Badge: 카테고리 컬러 매핑
```

---

## 7. 고도화 로드맵

### Phase 1: 디자인 파운데이션 (단기 / 1-2일)

| # | 작업 | 파일 | 담당 Agent |
|---|------|------|-----------|
| 1-1 | 디자인 토큰 정의 (색상, 타이포, 스페이싱) | `globals.css` | frontend-architect |
| 1-2 | Pretendard 한글 폰트 적용 | `layout.tsx` | frontend-architect |
| 1-3 | 다크모드 인프라 (next-themes + CSS 변수) | `layout.tsx`, `globals.css` | frontend-architect |
| 1-4 | 다크모드 토글 컴포넌트 | `components/ui/ThemeToggle.tsx` | frontend-architect |

### Phase 2: 핵심 UI 리디자인 (단기 / 2-3일)

| # | 작업 | 파일 | 담당 Agent |
|---|------|------|-----------|
| 2-1 | Hero 섹션 리디자인 (그래디언트 배경, 통계, 최신글 하이라이트) | `page.tsx` | frontend-architect |
| 2-2 | PostCard 리디자인 (OG 이미지 썸네일, 호버, 읽기시간, 그라데이션 카테고리 뱃지) | `PostCard.tsx` | frontend-architect |
| 2-3 | Header 리디자인 (로고 영역 강화, 카테고리 필터, 테마 토글) | `Header.tsx` | frontend-architect |
| 2-4 | Footer 리디자인 (3컬럼 레이아웃, 카테고리 링크, 소셜) | `Footer.tsx` | frontend-architect |
| 2-5 | 카테고리 필터 탭 UI (메인 페이지) | `components/ui/CategoryFilter.tsx` | frontend-architect |
| 2-6 | 페이지네이션 컴포넌트 | `components/ui/Pagination.tsx` | frontend-architect |

### Phase 3: 글 상세 UX 고도화 (중기 / 2-3일)

| # | 작업 | 파일 | 담당 Agent |
|---|------|------|-----------|
| 3-1 | 글 상세 레이아웃 리디자인 (2컬럼: 본문 + 사이드바) | `blog/[slug]/page.tsx` | frontend-architect |
| 3-2 | ToC(목차) 자동 생성 사이드바 | `components/blog/TableOfContents.tsx` | frontend-architect |
| 3-3 | 읽기 시간 계산 유틸 + UI | `lib/reading-time.ts`, `PostMeta.tsx` | frontend-architect |
| 3-4 | 스크롤 진행률 인디케이터 | `components/blog/ReadingProgress.tsx` | frontend-architect |
| 3-5 | 관련 글 추천 섹션 | `components/blog/RelatedPosts.tsx` | frontend-architect |
| 3-6 | CTA 컴포넌트 v2 (3종 변형) | `components/cta/` | frontend-architect |
| 3-7 | MDX 커스텀 컴포넌트 (callout, tip, warning) | `components/mdx/` | frontend-architect |

### Phase 4: SEO + 콘텐츠 품질 (중기 / 1-2일)

| # | 작업 | 파일 | 담당 Agent |
|---|------|------|-----------|
| 4-1 | Schema.org Article 구조화 데이터 | `components/seo/JsonLd.tsx` | product-manager |
| 4-2 | OG 이미지 자동 생성 (next/og) | `app/api/og/route.tsx` | frontend-architect |
| 4-3 | AI 프롬프트 v2 (고품질 콘텐츠) | `scripts/prompt-template.ts` | product-manager |
| 4-4 | 콘텐츠 품질 검증 스크립트 | `scripts/validate-content.ts` | qa-strategist |
| 4-5 | 검색 기능 (Fuse.js 클라이언트 사이드) | `components/ui/SearchModal.tsx` | frontend-architect |
| 4-6 | RSS Feed 생성 | `app/feed.xml/route.ts` | frontend-architect |

---

## 8. 개선 영역 우선순위 매트릭스

| 영역 | 현재 수준 | 목표 수준 | 비즈니스 임팩트 | 구현 난이도 | 우선순위 |
|------|----------|----------|---------------|-----------|---------|
| **디자인 시스템** | 3/10 | 8/10 | 매우 높음 (첫인상) | 중간 | **P0** |
| **한글 폰트** | 2/10 | 9/10 | 높음 (가독성) | 낮음 | **P0** |
| **다크모드** | 0/10 | 8/10 | 중간 (모던함) | 중간 | **P1** |
| **PostCard 디자인** | 4/10 | 9/10 | 매우 높음 (클릭율) | 중간 | **P0** |
| **Hero 섹션** | 3/10 | 8/10 | 높음 (브랜드) | 중간 | **P1** |
| **글 상세 UX (ToC)** | 2/10 | 8/10 | 높음 (체류시간) | 중간 | **P1** |
| **AI 프롬프트 품질** | 4/10 | 8/10 | 매우 높음 (SEO) | 낮음 | **P0** |
| **구조화 데이터** | 0/10 | 9/10 | 높음 (SEO) | 낮음 | **P1** |
| **OG 이미지** | 0/10 | 8/10 | 중간 (소셜 공유) | 중간 | **P2** |
| **페이지네이션** | 0/10 | 8/10 | 중간 (UX) | 낮음 | **P1** |
| **검색** | 0/10 | 7/10 | 중간 (UX) | 중간 | **P2** |
| **접근성** | 3/10 | 7/10 | 낮음 (법적) | 낮음 | **P2** |

---

## 9. 에이전트별 구체적 지시사항

### 9.1 frontend-architect

**역할**: 디자인 시스템 수립 + 전체 UI/UX 구현의 핵심 담당

**Phase 1 지시 (디자인 파운데이션)**:
1. `globals.css`에 @theme inline 확장:
   - 브랜드 컬러: primary를 오아테크 브랜드 블루(#1E40AF ~ #3B82F6 계열)로 재정의. secondary(그린 #059669), accent(앰버 #F59E0B) 추가
   - 다크모드 대응 색상 전체 정의 (`--color-dark-*` 또는 `dark:` 접두사)
   - 시멘틱 컬러: `--color-surface`, `--color-surface-elevated`, `--color-text-primary`, `--color-text-secondary`
   - 섀도 토큰: `--shadow-card`, `--shadow-card-hover`, `--shadow-elevated`
   - 라운딩 토큰: `--radius-sm`, `--radius-md`, `--radius-lg`, `--radius-xl`
2. Pretendard 한글 폰트 next/font/local로 적용 (woff2 subset)
3. `next-themes` 패키지 도입, ThemeProvider 래핑, ThemeToggle 컴포넌트 제작
4. 모든 기존 컴포넌트의 하드코딩 색상을 CSS 변수로 전환

**Phase 2 지시 (핵심 UI)**:
1. Hero 섹션: 그래디언트 배경 + 글 개수/카테고리 통계 표시 + 최신 글 1개 하이라이트 카드
2. PostCard: aspect-ratio 썸네일 영역(OG 이미지 fallback), 카테고리 컬러 뱃지, 읽기시간 뱃지, hover시 translate-y + shadow 트랜지션
3. Header: sticky + 스크롤시 backdrop-blur + 로고 좌측, 카테고리 nav 중앙, 테마토글+CTA 우측
4. Footer: 3컬럼 (회사정보 / 카테고리 / 연락처), 상단 그래디언트 구분선
5. 카테고리 필터: 메인 페이지 상단 가로 스크롤 탭 (전체 / 운영팁 / 창업가이드 / ...)
6. 페이지네이션: 숫자 + 이전/다음 버튼, URL 파라미터 기반

**Phase 3 지시 (글 상세)**:
1. 2컬럼 레이아웃: 좌측 본문(max-w-3xl) + 우측 sticky 사이드바(ToC)
2. ToC: MDX 본문에서 h2/h3 추출, 스크롤 위치 연동 하이라이트, 클릭시 smooth scroll
3. 읽기 진행률: 페이지 상단 고정 프로그레스 바 (primary 색상)
4. 관련 글: 같은 카테고리 + 공통 태그 기반, PostCard 미니 버전 3개
5. MDX 커스텀 컴포넌트: `<Callout type="tip|warning|info" />`, `<StepGuide />` 등

**기술 제약**:
- Tailwind CSS 4의 `@theme inline` 시스템 사용 (tailwind.config.ts 아님)
- next/font로 폰트 로딩 (CDN link 사용 금지)
- Server Component 우선, Client Component는 인터랙션 필요 시에만
- CSS 애니메이션 우선, Framer Motion은 복잡한 인터랙션에만 제한적 사용

### 9.2 product-manager

**역할**: 콘텐츠 전략 + SEO 최적화 + AI 프롬프트 고도화

**지시사항**:

1. **AI 프롬프트 v2 설계**:
   - 현재 프롬프트의 문제점: 너무 일반적, 구체적 데이터/사례 부재, 구조가 단순
   - 개선 방향:
     a. 페르소나 강화: "당신은 10년차 숙박업 컨설턴트입니다" → 구체적 경험/사례 기반
     b. 구조 템플릿: 서론(공감) → 문제 정의 → 해결책 3-5개(구체적 수치 포함) → 실행 가이드 → 결론
     c. 톤 가이드: "~입니다" 체 유지하되, 실제 숙박업 용어와 시장 데이터 포함 지시
     d. CTA 삽입 전략: 맥락에 따른 자연스러운 솔루션 언급 위치 지정
     e. MDX 컴포넌트 활용 지시: `<Callout>`, `<StepGuide>` 등 신규 컴포넌트 삽입 위치
   - 2단계 생성 고려: 1차 아웃라인 → 2차 본문 확장

2. **Schema.org 구조화 데이터**:
   - Article (BlogPosting) JSON-LD 컴포넌트 설계
   - 필수 필드: headline, datePublished, dateModified, author, publisher, description, image
   - BreadcrumbList 스키마 추가
   - Organization 스키마 (오아테크 정보)

3. **키워드 DB 확장**:
   - 현재 14개 키워드 → 최소 50개로 확장 방안
   - 롱테일 키워드 전략 수립
   - 시즌별 키워드 우선순위 시스템

4. **콘텐츠 카테고리 재정의**:
   - 현재 4개 카테고리 검토
   - 각 카테고리별 컬러, 아이콘, 대표 이미지 정의

### 9.3 qa-strategist

**역할**: 품질 보증 전략 수립 + 콘텐츠/UI 검증 체계

**지시사항**:

1. **Lighthouse CI 기준선 수립**:
   - Performance: 80+
   - SEO: 95+
   - Accessibility: 80+
   - Best Practices: 90+
   - 빌드 시마다 자동 측정 (GitHub Actions 연동)

2. **콘텐츠 품질 검증 스크립트** (`scripts/validate-content.ts`):
   - frontmatter 필수 필드 검증 (title, date, category, tags, description)
   - description 길이 (80~160자)
   - 본문 길이 (1500~3000자)
   - InlineCTA 컴포넌트 존재 여부
   - 이미지 alt 텍스트 존재 여부
   - 메인 키워드 출현 빈도 (3~7회)
   - 한글 맞춤법 기본 검증 (선택)

3. **반응형 디자인 검증 체크리스트**:
   - 375px (iPhone SE), 390px (iPhone 14), 768px (iPad), 1280px (Desktop), 1920px (Wide)
   - 각 뷰포트에서 레이아웃 깨짐, 텍스트 오버플로우, 터치 타겟 크기 검증

4. **다크모드 검증 매트릭스**:
   - 모든 컴포넌트에 대해 라이트/다크 모드 시각적 검증
   - 컬러 대비(Contrast Ratio) WCAG AA 기준 검증

5. **E2E 테스트 시나리오 (향후 Playwright)**:
   - 메인 → 글 상세 → CTA 클릭 플로우
   - 카테고리 필터 → 페이지네이션 플로우
   - 다크모드 토글 → 페이지 이동 → 상태 유지
   - 검색 → 결과 클릭 플로우

### 9.4 security-architect

**역할**: 보안 검토 + 외부 링크 안전성

**지시사항**:

1. **외부 리소스 보안**:
   - 모든 외부 링크에 `rel="noopener noreferrer"` 확인 (이미 적용됨, 지속 감시)
   - CSP(Content Security Policy) 헤더 설정 검토
   - next.config.ts에 보안 헤더 추가 (X-Frame-Options, X-Content-Type-Options 등)

2. **API 키 보호**:
   - ANTHROPIC_API_KEY가 GitHub Secrets에만 존재하는지 확인
   - 클라이언트 사이드 번들에 서버 전용 코드 노출 여부 검증
   - `.env.local` 패턴 가이드

3. **MDX 보안**:
   - MDX 렌더링 시 XSS 벡터 검토 (next-mdx-remote의 sanitization 확인)
   - 허용 컴포넌트 화이트리스트 확인 (mdxComponents 객체)

4. **의존성 보안**:
   - pnpm audit 실행 및 취약점 확인
   - 의존성 최신 상태 검증

### 9.5 code-analyzer

**역할**: 코드 품질 분석 + 리팩토링 제안

**지시사항**:

1. **현재 코드 이슈 분석**:
   - `scripts/generate.ts`와 `scripts/prompt-template.ts`의 프롬프트 중복 (buildPrompt가 2곳에 존재)
   - `posts.ts`의 getAllPosts()가 매 호출마다 파일시스템 접근 (캐싱 없음)
   - 타입 안전성: `PostFrontmatter`의 `category`가 문자열 유니온이지만 런타임 검증 없음
   - constants.ts의 CATEGORIES와 types.ts의 Category 타입 간 동기화 보장 없음

2. **리팩토링 권장사항**:
   - `scripts/generate.ts`는 prompt-template.ts의 함수를 import하도록 통합
   - posts.ts에 빌드 타임 캐싱 또는 메모이제이션 적용
   - Zod 스키마로 frontmatter 런타임 검증 추가
   - 유틸 함수 분리: `lib/utils.ts` (읽기 시간 계산, 날짜 포맷팅 등)

3. **코드 구조 개선 제안**:
   - `components/ui/` 디렉토리 신설 (범용 UI 컴포넌트)
   - `components/mdx/` 디렉토리 신설 (MDX 전용 컴포넌트)
   - `hooks/` 디렉토리 (useTheme, useScrollProgress, useSearch 등)

4. **빌드 최적화**:
   - next.config.ts에 이미지 최적화 설정 추가
   - 번들 분석 설정 (@next/bundle-analyzer)
   - Turbopack 호환성 확인

---

## 10. Convention Prerequisites

### 10.1 Existing Project Conventions

- [x] ESLint configuration (eslint.config.mjs)
- [x] TypeScript configuration (tsconfig.json)
- [ ] CLAUDE.md has coding conventions section
- [ ] Prettier configuration
- [ ] Component naming convention documented
- [ ] Git commit convention documented

### 10.2 Conventions to Define

| Category | Current State | To Define | Priority |
|----------|---------------|-----------|:--------:|
| **Naming** | 일부 적용 (PascalCase 컴포넌트) | 파일명, 변수, CSS 변수 규칙 통일 | High |
| **Folder structure** | 기본 구조 존재 | ui/, mdx/, hooks/ 추가 규칙 | High |
| **Import order** | 없음 | React → Next → 외부 → 내부 → 타입 | Medium |
| **CSS convention** | @theme inline 사용 | 다크모드 변수 명명, 반응형 규칙 | High |
| **Component pattern** | 없음 | Server vs Client 구분 기준 | High |

### 10.3 Environment Variables Needed

| Variable | Purpose | Scope | To Be Created |
|----------|---------|-------|:-------------:|
| `ANTHROPIC_API_KEY` | AI 콘텐츠 생성 | Server (CI) | 존재 (GitHub Secrets) |
| `NEXT_PUBLIC_SITE_URL` | OG 이미지, 구조화 데이터 | Client | [x] |
| `NEXT_PUBLIC_GA_ID` | Google Analytics (향후) | Client | [ ] |

---

## 11. Next Steps

1. [ ] 이 Plan 문서 리뷰 및 승인
2. [ ] Design 문서 작성 (`blog-enhancement-v2.design.md`)
3. [ ] Phase 1 (디자인 파운데이션) 구현 시작
4. [ ] Phase 2 (핵심 UI) 구현
5. [ ] Phase 3 (글 상세 UX) 구현
6. [ ] Phase 4 (SEO + 콘텐츠) 구현
7. [ ] 전체 Gap Analysis 실행

---

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 0.1 | 2026-03-12 | Initial draft - CTO 레벨 고도화 전략 | 최준호 (CTO Lead) |
