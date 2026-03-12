# QA 전략 및 테스트 계획: 오아테크 블로그 자동 작성기

> 분석일: 2026-03-12
> QA Strategist: bkit-qa-strategist (Claude Agent)
> 대상: `c:\contents\블로그 자동 작성기`

---

## 1. 현재 테스트 커버리지 상태

### 결론: 테스트 코드 전무 (0%)

프로젝트에 테스트 관련 도구가 전혀 설치되어 있지 않습니다.

| 항목 | 상태 |
|------|------|
| Jest / Vitest | 미설치 |
| Playwright / Cypress | 미설치 |
| Testing Library | 미설치 |
| package.json 테스트 스크립트 | 없음 (`test` 명령 없음) |
| `*.test.*` / `*.spec.*` 파일 | 없음 (프로젝트 src 내) |

**현재 품질 게이트**: `pnpm lint` (ESLint) + TypeScript 컴파일만 존재.

### 기존 품질 보호 장치 (긍정 요소)

- TypeScript strict 타입 검사: `src/lib/types.ts`의 `Post`, `PostFrontmatter`, `Category` 타입 정의로 컴파일 타임 검증
- ESLint (`eslint-config-next`): Next.js 권장 규칙 적용
- `generateStaticParams()` + `notFound()`: 잘못된 slug 접근 시 404 처리 내장
- `getAllPosts()`의 `draft` 필터: 임시저장 글 자동 제외

---

## 2. 필요한 테스트 종류 및 우선순위

### 위험 기반 우선순위 매트릭스

| 우선순위 | 영역 | 위험 | 이유 |
|---------|------|------|------|
| P0 (Critical) | AI 생성 스크립트 (`generate.ts`) | 파일 생성 실패, API 오류 시 워크플로우 전체 중단 | GitHub Actions에서 무인 실행 |
| P0 (Critical) | MDX frontmatter 파싱 (`posts.ts`) | 잘못된 frontmatter → 빌드 실패 또는 런타임 오류 | 모든 페이지의 데이터 소스 |
| P1 (High) | SEO 메타태그 생성 (`SEOMeta.tsx`) | 누락/오염된 메타태그 → SEO 목표 미달 | 프로젝트 핵심 KPI |
| P1 (High) | GitHub Actions 워크플로우 | cron 실패 시 발행 중단 | 자동화의 핵심 |
| P2 (Medium) | 반응형 레이아웃 | 모바일 사용자 이탈 | 숙박업 운영자 모바일 비중 높음 |
| P2 (Medium) | CTA 클릭 추적 | 전환율 측정 불가 | 비즈니스 KPI |
| P3 (Low) | 카테고리 페이지 | 글 없을 때 빈 화면 처리 | 이미 구현됨 |

### 권장 테스트 계층 구조

```
테스트 피라미드 (권장)
         /\
        /E2E\         Playwright - 핵심 사용자 경로만 (2~3개)
       /------\
      / 통합 테스트 \   Next.js build + 실제 MDX 파일 렌더링 검증
     /------------\
    /   단위 테스트  \  posts.ts, SEOMeta.tsx 유틸 함수 (Vitest)
   /________________\
```

---

## 3. MDX 렌더링 검증 방법

### 3.1 현재 MDX 처리 흐름

```
content/posts/*.mdx
    → gray-matter (frontmatter 파싱)
    → getAllPosts() / getPostBySlug()
    → MDXRemote (next-mdx-remote/rsc)
    → PostContent.tsx (prose 클래스 적용)
    → InlineCTA, BottomCTA 컴포넌트 주입
```

### 3.2 검증이 필요한 MDX 케이스

| 케이스 | 위험도 | 검증 방법 |
|--------|--------|----------|
| frontmatter 필수 필드 누락 (`title`, `date`, `category`) | Critical | 단위 테스트: posts.ts 함수 |
| `date` 필드가 잘못된 형식 (YYYY-MM-DD 아님) | High | 단위 테스트: date 파싱 검증 |
| `category`가 허용되지 않은 값 | High | TypeScript 타입 + 단위 테스트 |
| `<InlineCTA />` 미삽입 (AI가 규칙 무시) | Medium | 생성 후 파일 내용 검증 |
| 마크다운 내 XSS 삽입 가능성 | Medium | MDXRemote 기본 처리 확인 |
| `draft: true` 글이 목록에 노출 | Low | posts.ts 필터 단위 테스트 |

### 3.3 단위 테스트 전략 (Vitest 기준)

```typescript
// 테스트 픽스처: 최소 유효 MDX
const validMdx = `---
title: "테스트 글"
date: "2026-03-12"
category: "운영팁"
tags: ["펜션", "예약"]
description: "테스트 설명입니다"
---

본문 내용입니다.
`;

// 검증 시나리오
describe('posts.ts - getAllPosts', () => {
  it('draft 글을 제외해야 한다');
  it('날짜 내림차순으로 정렬해야 한다');
  it('content/posts 디렉토리 없어도 빈 배열 반환');
});

describe('posts.ts - getPostBySlug', () => {
  it('존재하지 않는 slug는 null 반환');
  it('draft 글도 slug로 직접 조회 가능해야 한다');
});
```

### 3.4 빌드 기반 통합 검증 (현재 즉시 적용 가능)

테스트 코드 없이도 다음 방법으로 MDX 렌더링을 검증할 수 있습니다:

```bash
# 1. 샘플 MDX 파일 생성 후 빌드
pnpm generate:dry  # AI 없이 구조 확인
pnpm build         # SSG 빌드 시 모든 MDX 파싱 실행

# 2. 빌드 아티팩트 확인
# .next/server/app/blog/[slug]/ 에 생성된 HTML 파일 내용 검증
```

---

## 4. AI 생성 콘텐츠 품질 검증 방법

### 4.1 현재 AI 생성 파이프라인 분석

**`scripts/generate.ts`** 흐름:
1. `keywords.json`에서 미사용 키워드 선택
2. `buildPrompt()` 함수로 프롬프트 생성 (Claude sonnet-4-6 호출)
3. 응답 텍스트를 그대로 `.mdx` 파일에 저장
4. frontmatter 파싱 없이 저장 → **gray-matter가 Next.js 빌드 시점에 파싱**

**발견된 위험**: `generate.ts`는 AI 응답이 올바른 frontmatter 형식인지 검증하지 않고 저장합니다.

### 4.2 콘텐츠 품질 체크리스트 (생성 후 검증)

```
구조 검증:
□ frontmatter의 --- 구분자가 정확한가
□ title, date, category, tags, description 모두 존재하는가
□ description이 160자 이하인가
□ category가 허용값(운영팁|창업가이드|트렌드|사례)인가

SEO 품질:
□ 메인 키워드가 제목에 포함되어 있는가
□ 메인 키워드가 본문에 3~5회 자연스럽게 등장하는가
□ description에 메인 키워드가 포함되어 있는가

콘텐츠 품질:
□ h2 소제목이 4~6개 존재하는가
□ 본문 길이가 1500~2500자인가 (공백 포함)
□ <InlineCTA /> 컴포넌트가 정확히 1회 삽입되었는가
□ "오아테크"를 직접 언급하지 않는가 (간접 언급만 허용)

브랜드 안전:
□ 경쟁사 직접 언급이 없는가
□ 허위/과장 정보가 없는가 (사실 확인 가능한 수치 사용)
```

### 4.3 자동 검증 스크립트 설계 (generate.ts에 추가할 로직)

```typescript
// generate.ts에 저장 전 검증 추가 (설계안)
function validateGeneratedContent(mdxContent: string, keyword: string): {
  valid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  // 1. frontmatter 파싱 가능 여부
  try {
    const { data } = matter(mdxContent);
    const required = ['title', 'date', 'category', 'tags', 'description'];
    required.forEach(field => {
      if (!data[field]) errors.push(`frontmatter 필드 누락: ${field}`);
    });

    // category 유효성
    const validCategories = ['운영팁', '창업가이드', '트렌드', '사례'];
    if (!validCategories.includes(data.category)) {
      errors.push(`잘못된 카테고리: ${data.category}`);
    }

    // description 길이
    if (data.description?.length > 160) {
      warnings.push(`description이 160자 초과: ${data.description.length}자`);
    }
  } catch {
    errors.push('frontmatter 파싱 실패');
  }

  // 2. InlineCTA 삽입 확인
  const ctaCount = (mdxContent.match(/<InlineCTA/g) || []).length;
  if (ctaCount === 0) warnings.push('<InlineCTA /> 미삽입');
  if (ctaCount > 1) warnings.push(`<InlineCTA /> 중복 삽입: ${ctaCount}회`);

  // 3. 키워드 빈도
  const bodyText = mdxContent.split('---')[2] || '';
  const freq = (bodyText.match(new RegExp(keyword, 'g')) || []).length;
  if (freq < 3) warnings.push(`키워드 빈도 부족: ${freq}회 (권장: 3~5회)`);
  if (freq > 5) warnings.push(`키워드 과다 사용: ${freq}회`);

  return { valid: errors.length === 0, errors, warnings };
}
```

### 4.4 dry-run 검증 워크플로우

```bash
# 1단계: dry-run으로 콘텐츠 확인
pnpm generate:dry

# 2단계: 실제 생성 후 검증
pnpm generate
# → 생성된 파일을 수동으로 검토

# 3단계: 빌드로 파싱 오류 확인
pnpm build
```

---

## 5. SEO 메타태그 자동 검증 방안

### 5.1 현재 SEO 구현 상태 분석

| SEO 요소 | 구현 위치 | 상태 |
|---------|----------|------|
| `<title>` | `layout.tsx` + `SEOMeta.tsx` | 구현됨 |
| `<meta description>` | `SEOMeta.tsx` | 구현됨 |
| Open Graph (`og:title`, `og:description`, `og:url`, `og:image`) | `SEOMeta.tsx` | 구현됨 |
| Canonical URL | `SEOMeta.tsx` | 구현됨 |
| `sitemap.xml` | `app/sitemap.ts` | 구현됨 |
| `robots.txt` | `app/robots.ts` | 구현됨 |
| RSS Feed | 미구현 | 설계에 있으나 없음 |
| `og:article:published_time` | 미구현 | 블로그 글에 권장 |
| `og:image` 기본값 | `/images/og-default.png` (파일 없음) | 실제 파일 미존재 |

### 5.2 SEO 검증 시나리오

#### 블로그 글 페이지 (`/blog/[slug]`)
```
기대값:
- title: "{글제목} | 오아테크 블로그"
- description: frontmatter.description (160자 이하)
- og:type: "article"
- og:url: "https://blog.oatech.co/blog/{slug}"
- og:image: frontmatter.thumbnail 또는 "/images/og-default.png"
- canonical: "https://blog.oatech.co/blog/{slug}"
```

#### 카테고리 페이지 (`/category/[category]`)
```
기대값:
- title: "{카테고리} | 오아테크 블로그"
- canonical: "https://blog.oatech.co/category/{인코딩된 카테고리}"
```

### 5.3 자동 검증 방법

**방법 A: 빌드 후 HTML 검사 스크립트 (즉시 구현 가능)**

```bash
# Next.js 빌드 후 생성된 HTML에서 메타태그 추출
pnpm build
# .next/server/app/blog/[slug]/page.html 확인

# grep으로 메타태그 검증
grep -r 'og:title' .next/server/
grep -r 'canonical' .next/server/
```

**방법 B: Playwright를 이용한 런타임 메타태그 검증 (권장)**

```typescript
// tests/seo.spec.ts
test('블로그 글 SEO 메타태그', async ({ page }) => {
  await page.goto('/blog/2026-03-12-펜션-예약률');

  const title = await page.title();
  expect(title).toMatch(/오아테크 블로그/);

  const ogTitle = await page.locator('meta[property="og:title"]').getAttribute('content');
  expect(ogTitle).toBeTruthy();

  const canonical = await page.locator('link[rel="canonical"]').getAttribute('href');
  expect(canonical).toMatch(/https:\/\/blog\.oatech\.co/);
});
```

**방법 C: 외부 도구를 이용한 검증 (배포 후)**

```
- Google Search Console: 크롤링 오류 및 색인 상태
- Open Graph Debugger (https://developers.facebook.com/tools/debug/): OG 태그 검증
- Twitter Card Validator: 트위터 공유 미리보기
- PageSpeed Insights: Core Web Vitals + SEO 점수
```

### 5.4 발견된 SEO 이슈

| 이슈 | 심각도 | 권고사항 |
|------|--------|---------|
| `og:image` 기본 파일 (`/images/og-default.png`) 미존재 | High | public/images/og-default.png 파일 생성 필요 |
| RSS Feed 미구현 | Medium | `/app/feed.xml/route.ts` 추가 권장 |
| `og:article:published_time` 누락 | Low | 블로그 글 OpenGraph에 날짜 추가 권장 |
| sitemap에 카테고리 URL 미포함 | Low | sitemap.ts에 카테고리 URL 추가 고려 |

---

## 6. 반응형 레이아웃 시각 테스트 방법

### 6.1 현재 반응형 구현 분석

```
브레이크포인트 (Tailwind CSS 4 기준):
- Mobile: < 768px  → 1컬럼 그리드, 햄버거 메뉴
- Tablet: 768px~   → 2컬럼 그리드 (md:grid-cols-2)
- Desktop: 1024px~ → 3컬럼 그리드 (lg:grid-cols-3)
```

**구현된 반응형 패턴:**
- `Header.tsx`: `hidden md:flex` (데스크톱 nav) / 햄버거 메뉴 토글 (`md:hidden`)
- `page.tsx`: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`
- `Footer.tsx`: `flex-col md:flex-row`
- `PostMeta.tsx`: `text-2xl md:text-3xl`

### 6.2 시각 테스트 체크리스트

**Mobile (375px / iPhone SE 기준)**
```
□ 햄버거 메뉴 아이콘 표시
□ 햄버거 메뉴 클릭 시 드롭다운 열림/닫힘
□ 글 목록이 1컬럼으로 표시
□ PostCard 텍스트가 잘리지 않음 (line-clamp-2)
□ InlineCTA, BottomCTA가 모바일에서 가독성 있음
□ Header 로고 + 버튼이 16px 이내에서 겹치지 않음
```

**Tablet (768px / iPad 기준)**
```
□ 데스크톱 nav 표시 (카테고리 링크 + CTA 버튼)
□ 글 목록이 2컬럼으로 전환
□ Footer가 flex-row로 전환
```

**Desktop (1280px 기준)**
```
□ 글 목록이 3컬럼 그리드
□ max-w-6xl 레이아웃이 중앙 정렬
□ max-w-3xl 블로그 글 본문이 가독성 있음
```

### 6.3 시각 테스트 방법

**방법 A: 브라우저 DevTools (즉시 가능, 수동)**
```bash
pnpm dev
# Chrome DevTools → Toggle Device Toolbar
# 375px, 768px, 1280px 순서로 확인
```

**방법 B: Playwright 시각 테스트 (스크린샷 비교)**
```typescript
// tests/visual/responsive.spec.ts
const viewports = [
  { width: 375, height: 667, name: 'mobile' },
  { width: 768, height: 1024, name: 'tablet' },
  { width: 1280, height: 800, name: 'desktop' },
];

for (const vp of viewports) {
  test(`홈 페이지 - ${vp.name}`, async ({ page }) => {
    await page.setViewportSize({ width: vp.width, height: vp.height });
    await page.goto('/');
    await expect(page).toHaveScreenshot(`home-${vp.name}.png`);
  });
}
```

**방법 C: Chromatic / Percy (CI 통합 시각 리그레션)**
```
- Chromatic: Storybook 기반 컴포넌트 시각 테스트
- 단, 현재 프로젝트에 Storybook 없음
- 향후 컴포넌트 라이브러리 확장 시 도입 고려
```

---

## 7. GitHub Actions 워크플로우 검증

### 7.1 현재 워크플로우 분석 (`.github/workflows/publish.yml`)

```yaml
트리거:
  - schedule: 월/수/금 UTC 00:00 (KST 09:00)
  - workflow_dispatch: 수동 (category, count 입력)

실행 순서:
  1. actions/checkout@v4
  2. pnpm/action-setup@v4 (latest)
  3. actions/setup-node@v4 (Node 20 + pnpm cache)
  4. pnpm install
  5. npx tsx scripts/generate.ts (ANTHROPIC_API_KEY 주입)
  6. git commit & push ([skip ci] 태그로 무한 루프 방지)
```

### 7.2 워크플로우 위험 분석

| 위험 | 발생 조건 | 현재 보호 장치 |
|------|----------|---------------|
| API 키 노출 | secrets 설정 오류 | GitHub Secrets 사용 |
| 무한 루프 배포 | push가 새 빌드 트리거 | `[skip ci]` 커밋 메시지 |
| 키워드 소진 | 모든 키워드 used=true | `console.log`로 안내만 (파일 변경 없음) |
| API 실패 시 커밋 | Claude API 오류 | `|| exit 0` 아님, git add 후 diff check |
| pnpm version 불안정 | `latest` 사용 | pnpm version 고정 권장 |

### 7.3 워크플로우 검증 방법

**방법 A: workflow_dispatch 수동 실행 (즉시 가능)**
```
GitHub → Actions → Auto Publish Blog Post → Run workflow
→ category: 운영팁, count: 1 입력
→ 실행 로그에서 각 스텝 확인
→ content/posts/에 새 파일 생성 여부 확인
```

**방법 B: act 로컬 실행 (GitHub Actions 로컬 시뮬레이션)**
```bash
# act 도구 설치 후
act schedule -e .github/workflows/event.json
```

**방법 C: 워크플로우 린팅**
```bash
# actionlint 사용
actionlint .github/workflows/publish.yml
```

### 7.4 발견된 워크플로우 이슈

| 이슈 | 심각도 | 권고사항 |
|------|--------|---------|
| `pnpm/action-setup@v4` version을 `latest`로 설정 | Medium | 버전 고정 (예: `version: 9`) |
| 키워드 소진 시 빈 커밋 방지 로직 없음 | Medium | `git diff --staged --quiet` 이미 존재 (OK) |
| API 실패 시 명시적 실패 처리 없음 | Medium | `generate.ts`에 try-catch + process.exit(1) 추가 권장 |
| Node.js 버전 고정 (`'20'`) | Low | `'20.x'`보다 LTS 버전 명시 고려 |
| ANTHROPIC_API_KEY 없을 때 오류 메시지 불명확 | Low | SDK가 자체 오류 발생 (허용 가능) |

---

## 8. 발견된 코드 품질 이슈

### 8.1 중복 코드

| 위치 | 문제 |
|------|------|
| `scripts/generate.ts` 내 `buildPrompt` 함수 | `scripts/prompt-template.ts`에 동일 함수 중복 존재 |
| `generate.ts`의 `KeywordEntry`, `KeywordDB` 인터페이스 | `src/lib/types.ts`에 이미 정의됨 (중복) |

**권고**: `generate.ts`에서 `prompt-template.ts` import 및 `src/lib/types.ts` 타입 재사용

### 8.2 누락 파일

| 파일 | 참조 위치 | 영향 |
|------|----------|------|
| `public/images/og-default.png` | `src/lib/constants.ts:SITE_CONFIG.ogImage` | OG 이미지 404 |
| `content/posts/` 디렉토리 | 빌드 시 자동 처리됨 | 문제 없음 |

### 8.3 `@tailwindcss/typography` 미설치

`PostContent.tsx`에서 `prose` 클래스를 사용하지만 `@tailwindcss/typography` 플러그인이 설치되어 있지 않습니다. 현재는 `globals.css`에 수동으로 `.prose h2`, `.prose p` 등을 정의하여 동작 중이나, 코드 테이블, 인라인 코드, 링크 스타일 등이 누락된 상태입니다.

---

## 9. 테스트 도입 로드맵

### Phase 1: 즉시 가능 (코드 추가 없음)

```
우선순위 | 작업
---------|-----
즉시     | pnpm build 실행 → 빌드 성공 여부 확인
즉시     | pnpm generate:dry → AI 출력 형식 검증
즉시     | workflow_dispatch 수동 실행 → 워크플로우 검증
즉시     | public/images/og-default.png 파일 추가
즉시     | DevTools로 375px/768px/1280px 반응형 확인
```

### Phase 2: 단위 테스트 도입 (Vitest)

```bash
# 설치
pnpm add -D vitest @vitest/coverage-v8

# 테스트 파일 위치
src/lib/__tests__/posts.test.ts     # getAllPosts, getPostBySlug 검증
src/lib/__tests__/seo.test.ts       # generatePostMetadata 검증
scripts/__tests__/validate.test.ts  # AI 생성 콘텐츠 검증 함수
```

**목표 커버리지**: `src/lib/*.ts` 80% 이상

### Phase 3: E2E 테스트 도입 (Playwright)

```bash
# 설치
pnpm add -D @playwright/test
npx playwright install chromium

# 테스트 시나리오 (최소)
tests/e2e/home.spec.ts              # 홈 페이지 렌더링
tests/e2e/blog-post.spec.ts         # 글 상세 + CTA 클릭
tests/e2e/seo.spec.ts               # 메타태그 검증
tests/e2e/responsive.spec.ts        # 반응형 레이아웃
```

### Phase 4: CI 통합

```yaml
# .github/workflows/ci.yml (추가)
name: CI
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: pnpm install
      - run: pnpm lint
      - run: pnpm type-check  # tsc --noEmit
      - run: pnpm test        # vitest
      - run: pnpm build       # SSG 빌드 검증
```

---

## 10. 품질 임계값 및 합격 기준

| 메트릭 | 현재 | 목표 (Phase 2 완료) | 목표 (Phase 3 완료) |
|--------|------|---------------------|---------------------|
| 단위 테스트 커버리지 | 0% | 60% (lib/*.ts) | 80% |
| E2E 핵심 경로 | 0% | - | 100% (3개 경로) |
| ESLint 에러 | 0 | 0 | 0 |
| TypeScript 오류 | 0 | 0 | 0 |
| 빌드 성공률 | 미확인 | 100% | 100% |
| SEO 메타태그 완성도 | 85% | 95% | 100% |
| Lighthouse SEO 점수 | 미측정 | 90+ | 95+ |

---

## 11. Zero Script QA 접근 (현재 단계 권장)

현재 테스트 코드가 없는 상태에서 가장 빠르게 품질을 확인하는 방법입니다.

### 11.1 로컬 검증 체크리스트

```bash
# 1. 타입 검사
npx tsc --noEmit

# 2. 린트
pnpm lint

# 3. dry-run으로 AI 출력 확인
pnpm generate:dry

# 4. 빌드
pnpm build

# 5. 개발 서버 실행 후 수동 검증
pnpm dev
# → http://localhost:3000 접속
# → 홈 페이지, 글 상세, 카테고리 페이지 수동 확인
# → Chrome DevTools → 반응형 확인
# → View Page Source → 메타태그 확인
```

### 11.2 수동 검증 경로 (Critical Path)

```
1. 홈 페이지 (/)
   → 글 목록 표시 여부
   → 반응형 그리드 확인
   → Header 네비게이션 동작

2. 글 상세 (/blog/[slug])
   → MDX 렌더링 정상
   → InlineCTA 표시
   → BottomCTA 표시
   → 카테고리 링크 동작

3. 카테고리 페이지 (/category/운영팁)
   → 해당 카테고리 글만 표시
   → 빈 카테고리 처리 확인

4. SEO 확인
   → View Source → <title>, <meta description>, og: 태그
   → /sitemap.xml 접근 → XML 형식 확인
   → /robots.txt 접근 → 내용 확인
```

---

*이 문서는 QA Strategist Agent가 코드 정적 분석을 통해 작성했습니다. 실제 런타임 검증은 개발 서버 실행 후 수동으로 수행하세요.*
