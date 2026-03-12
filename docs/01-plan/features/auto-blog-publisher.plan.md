# Plan: 블로그 자동 발행 시스템

> 오아테크(OaTech) 마케팅을 위한 AI 기반 블로그 자동 생성 및 발행 시스템

## 1. User Intent Discovery

### 핵심 문제
중소숙박업 SaaS 기업 오아테크의 마케팅 채널 부재. SEO 유입과 업계 전문성 브랜딩을 동시에 달성할 독립 블로그가 필요하며, 최소 인력으로 주기적 콘텐츠 발행이 가능해야 함.

### 타겟 독자
- **기존 숙박업 운영자**: 펜션, 모텔, 게스트하우스 등 중소숙박업 대표/매니저
- **창업 준비자**: 숙박업 창업을 계획 중인 예비 사업자

### 성공 기준
| 지표 | 목표 |
|------|------|
| 블로그 → 오아테크 전환율 | 측정 가능한 CTA 클릭률 추적 |
| 콘텐츠 생산 효율성 | 주 3회 이상 자동 발행 |
| SEO 유입 | 발행 3개월 후 오가닉 트래픽 확인 |

## 2. Alternatives Explored

| 접근법 | 장점 | 단점 | 결정 |
|--------|------|------|------|
| **Next.js SSG + Vercel** | SEO 최강, 무료 운영, Git 자동화 용이 | 초기 개발 필요 | ✅ 채택 |
| Headless CMS + Next.js | 관리 UI 제공 | 비용 증가, 이중 관리 | ❌ |
| Ghost/WordPress 자체 호스팅 | 생태계 풍부 | 서버 관리, SEO 제한 | ❌ |

**채택 이유**: SSG는 로딩 속도가 빨라 모바일 SEO에 유리하고, Vercel 무료 티어로 운영비 없음. Git 기반이라 AI 자동 발행 파이프라인 구축이 가장 자연스러움.

## 3. YAGNI Review

### ✅ v1 포함
- AI 콘텐츠 자동 생성 (Claude API)
- 자동 발행 스케줄링 (GitHub Actions cron)
- SEO 최적화 (메타태그, 시멘틱 HTML, sitemap)
- 오아테크 전환 CTA 컴포넌트
- 관리자 대시보드 (간단한 /admin 페이지)
- 반응형 디자인 (Tailwind CSS)

### ❌ Out of Scope (후순위)
- 댓글/소셜 공유 기능
- 뉴스레터 구독
- 다국어 지원

## 4. Architecture Overview

```
┌───────────────────────────────────────┐
│  1. AI 콘텐츠 생성기 (Node.js)        │
│  - Claude API로 글 생성              │
│  - 키워드/주제 기반 프롬프트           │
│  - Markdown/MDX 출력                 │
└────────────────┬──────────────────────┘
                 │ Markdown 파일
                 ▼
┌───────────────────────────────────────┐
│  2. Next.js 블로그 (SSG)              │
│  - Tailwind CSS 반응형 디자인         │
│  - MDX 렌더링                        │
│  - SEO 메타태그 자동 생성             │
│  - 오아테크 CTA 컴포넌트              │
└────────────────┬──────────────────────┘
                 │ Git Push
                 ▼
┌───────────────────────────────────────┐
│  3. 배포 및 자동화                     │
│  - Vercel 자동 배포                   │
│  - GitHub Actions 스케줄러            │
│  - 독립 도메인 연결                    │
└───────────────────────────────────────┘

┌───────────────────────────────────────┐
│  4. 관리자 대시보드 (간단)             │
│  - 콘텐츠 상태 확인                   │
│  - 발행 스케줄 관리                   │
│  - Next.js 내 /admin 페이지           │
└───────────────────────────────────────┘
```

## 5. 콘텐츠 생성 플로우

### 5.1 키워드 전략
```
keywords.json
├── 운영팁: ["펜션 예약률", "객실 관리", "매출 증대", ...]
├── 창업가이드: ["펜션 창업 비용", "숙박업 인허가", ...]
├── 트렌드: ["2026 숙박 트렌드", "에어비앤비 대응", ...]
└── 사례: ["성공 펜션 사례", "오아테크 도입 후기", ...]
```

### 5.2 AI 글 생성
- **입력**: 키워드 + 카테고리 + 톤가이드
- **처리**: Claude API로 블로그 글 생성
- **출력**: frontmatter 포함 MDX 파일

```yaml
---
title: "펜션 예약률 높이는 5가지 방법"
date: "2026-03-12"
category: "운영팁"
tags: ["펜션", "예약률", "매출"]
description: "중소 펜션 운영자를 위한 실전 예약률 개선 전략"
---
```

### 5.3 자동 발행
- GitHub Actions cron 스케줄러 (예: 월/수/금 오전 9시)
- 생성된 MDX → Git commit & push
- Vercel 자동 빌드 & 배포

## 6. 기술 스택

| 영역 | 기술 | 이유 |
|------|------|------|
| 프론트엔드 | Next.js 14 (App Router) | SSG + SEO 최적화 |
| 스타일링 | Tailwind CSS | 반응형 디자인, 빠른 개발 |
| 콘텐츠 | MDX | Markdown + React 컴포넌트 |
| AI | Claude API | 고품질 한국어 글 생성 |
| 배포 | Vercel | 무료, Git 연동 자동 배포 |
| 자동화 | GitHub Actions | cron 스케줄링, CI/CD |
| 도메인 | 독립 도메인 (예: blog.oatech.co) | 브랜드 신뢰도 |

## 7. 프로젝트 구조 (예상)

```
블로그 자동 작성기/
├── content/               # MDX 콘텐츠
│   └── posts/
├── src/
│   ├── app/               # Next.js App Router
│   │   ├── page.tsx       # 메인 (글 목록)
│   │   ├── [slug]/        # 개별 글 페이지
│   │   └── admin/         # 관리자 대시보드
│   ├── components/
│   │   ├── BlogPost.tsx
│   │   ├── CTA.tsx        # 오아테크 전환 CTA
│   │   ├── SEOHead.tsx
│   │   └── Layout.tsx
│   └── lib/
│       ├── mdx.ts         # MDX 파싱
│       └── seo.ts         # SEO 유틸
├── scripts/
│   ├── generate.ts        # AI 콘텐츠 생성 스크립트
│   └── keywords.json      # 키워드 DB
├── .github/
│   └── workflows/
│       └── publish.yml    # 자동 발행 스케줄러
└── package.json
```

## 8. Brainstorming Log

| Phase | 결정 사항 |
|-------|----------|
| Intent Discovery | SEO + 브랜딩 복합 목적, 타겟: 숙박업 운영자 + 창업자 |
| Alternatives | Next.js SSG + Vercel 채택 (비용/SEO/자동화 최적) |
| YAGNI | 4개 핵심 기능 + 관리자 대시보드 포함, 댓글/뉴스레터/다국어 제외 |
| Architecture | AI 생성기 → Next.js SSG → Vercel 자동 배포 3단 구조 |
| Data Flow | keywords.json → Claude API → MDX → Git → Vercel 파이프라인 |
