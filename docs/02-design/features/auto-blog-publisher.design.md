# Design: 블로그 자동 발행 시스템

> Plan 문서: `docs/01-plan/features/auto-blog-publisher.plan.md`

## 1. 기술 스택 확정

| 영역 | 기술 | 버전 |
|------|------|------|
| Framework | Next.js (App Router) | 15.x |
| Language | TypeScript | 5.x |
| Styling | Tailwind CSS | 4.x |
| Content | MDX (next-mdx-remote) | latest |
| AI | @anthropic-ai/sdk | latest |
| Deploy | Vercel | - |
| CI/CD | GitHub Actions | - |
| Package Manager | pnpm | latest |

## 2. 프로젝트 구조

```
블로그 자동 작성기/
├── content/
│   └── posts/                    # MDX 블로그 글
│       └── YYYY-MM-DD-slug.mdx
├── src/
│   ├── app/
│   │   ├── layout.tsx            # 루트 레이아웃 (반응형)
│   │   ├── page.tsx              # 메인: 글 목록
│   │   ├── blog/
│   │   │   └── [slug]/
│   │   │       └── page.tsx      # 개별 글 페이지
│   │   ├── category/
│   │   │   └── [category]/
│   │   │       └── page.tsx      # 카테고리별 글 목록
│   │   └── admin/
│   │       └── page.tsx          # 관리자 대시보드
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Header.tsx        # 네비게이션
│   │   │   ├── Footer.tsx        # 푸터
│   │   │   └── Sidebar.tsx       # 사이드바 (카테고리, 인기글)
│   │   ├── blog/
│   │   │   ├── PostCard.tsx      # 글 카드 (목록용)
│   │   │   ├── PostContent.tsx   # 글 본문 렌더링
│   │   │   └── PostMeta.tsx      # 날짜, 태그, 카테고리
│   │   ├── cta/
│   │   │   ├── InlineCTA.tsx     # 본문 중간 CTA
│   │   │   └── BottomCTA.tsx     # 글 하단 CTA
│   │   └── seo/
│   │       └── SEOMeta.tsx       # 메타태그 컴포넌트
│   └── lib/
│       ├── posts.ts              # MDX 파일 읽기/파싱
│       ├── types.ts              # 타입 정의
│       └── constants.ts          # 상수 (사이트 정보 등)
├── scripts/
│   ├── generate.ts               # AI 콘텐츠 생성
│   ├── keywords.json             # 키워드 DB
│   └── prompt-template.ts        # 프롬프트 템플릿
├── public/
│   └── images/                   # 정적 이미지
├── .github/
│   └── workflows/
│       └── publish.yml           # 자동 발행 cron
├── tailwind.config.ts
├── next.config.ts
├── tsconfig.json
└── package.json
```

## 3. 데이터 모델

### 3.1 Post Frontmatter (MDX)

```typescript
interface PostFrontmatter {
  title: string;           // 글 제목
  date: string;            // 발행일 (YYYY-MM-DD)
  category: Category;      // 카테고리
  tags: string[];           // 태그 목록
  description: string;     // SEO 설명 (160자 이내)
  thumbnail?: string;      // 썸네일 경로 (선택)
  draft?: boolean;         // 임시 저장 여부
}

type Category = '운영팁' | '창업가이드' | '트렌드' | '사례';
```

### 3.2 Keywords DB

```typescript
interface KeywordDB {
  categories: {
    [key in Category]: KeywordEntry[];
  };
}

interface KeywordEntry {
  keyword: string;        // 메인 키워드
  subKeywords: string[];  // 관련 키워드
  used: boolean;          // 사용 여부
  lastUsedAt?: string;    // 마지막 사용일
}
```

## 4. 핵심 컴포넌트 설계

### 4.1 페이지 라우팅

| 경로 | 컴포넌트 | 설명 |
|------|----------|------|
| `/` | `page.tsx` | 최신 글 목록 (페이지네이션) |
| `/blog/[slug]` | `blog/[slug]/page.tsx` | 개별 글 상세 |
| `/category/[category]` | `category/[category]/page.tsx` | 카테고리별 목록 |
| `/admin` | `admin/page.tsx` | 관리자 대시보드 |

### 4.2 반응형 브레이크포인트

| 뷰포트 | 크기 | 레이아웃 |
|--------|------|----------|
| Mobile | < 768px | 1컬럼, 햄버거 메뉴 |
| Tablet | 768px~1024px | 2컬럼 그리드 |
| Desktop | > 1024px | 3컬럼 그리드 + 사이드바 |

### 4.3 CTA 컴포넌트 전략

```
글 본문 구조:
┌─────────────────────────────┐
│  제목 + 메타 정보            │
├─────────────────────────────┤
│  본문 상반부                 │
├─────────────────────────────┤
│  [InlineCTA] 오아테크 소개   │  ← 자연스러운 맥락 삽입
├─────────────────────────────┤
│  본문 하반부                 │
├─────────────────────────────┤
│  [BottomCTA] 무료 상담 신청  │  ← 강한 전환 유도
└─────────────────────────────┘
```

## 5. AI 콘텐츠 생성 설계

### 5.1 생성 플로우

```
1. keywords.json에서 미사용 키워드 선택
2. 프롬프트 템플릿에 키워드 + 카테고리 주입
3. Claude API 호출 (claude-sonnet-4-6)
4. 응답을 frontmatter + MDX로 포맷팅
5. content/posts/ 에 파일 저장
6. keywords.json의 used 플래그 업데이트
```

### 5.2 프롬프트 구조

```typescript
const promptTemplate = `
당신은 중소숙박업 전문 블로그 작가입니다.

## 규칙
- 타겟: 펜션/모텔/게스트하우스 운영자 및 창업 준비자
- 톤: 전문적이지만 친근한 조언 형태
- 분량: 1500~2500자
- SEO: 키워드를 자연스럽게 3~5회 포함
- CTA: 본문에 오아테크 서비스를 자연스럽게 언급할 수 있는 맥락 포함

## 작성할 글
- 키워드: {keyword}
- 카테고리: {category}
- 관련 키워드: {subKeywords}

## 출력 형식
frontmatter(YAML) + Markdown 본문
`;
```

### 5.3 생성 스크립트 인터페이스

```typescript
// scripts/generate.ts
async function generatePost(options: {
  keyword?: string;      // 특정 키워드 지정 (선택)
  category?: Category;   // 특정 카테고리 (선택)
  count?: number;        // 생성 개수 (기본: 1)
  dryRun?: boolean;      // 파일 저장 없이 미리보기
}): Promise<void>;
```

## 6. SEO 설계

### 6.1 메타태그

```typescript
// 각 페이지에 자동 생성
interface SEOData {
  title: string;                    // "{글제목} | 오아테크 블로그"
  description: string;              // frontmatter.description
  openGraph: {
    title: string;
    description: string;
    type: 'article';
    url: string;
    image: string;
    siteName: '오아테크 블로그';
  };
  alternates: { canonical: string };
}
```

### 6.2 자동 생성 파일

| 파일 | 방식 | 설명 |
|------|------|------|
| `sitemap.xml` | Next.js generateSitemap | 모든 글 URL 포함 |
| `robots.txt` | 정적 파일 | 크롤러 허용 설정 |
| RSS Feed | `/feed.xml` route | RSS 구독 지원 |

## 7. GitHub Actions 워크플로우

```yaml
# .github/workflows/publish.yml
name: Auto Publish Blog Post
on:
  schedule:
    - cron: '0 0 * * 1,3,5'  # 월/수/금 UTC 00:00 (KST 09:00)
  workflow_dispatch:           # 수동 트리거 지원

jobs:
  generate-and-publish:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
      - run: pnpm install
      - run: pnpm generate        # AI 글 생성
        env:
          ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
      - name: Commit and Push
        run: |
          git config user.name "blog-bot"
          git config user.email "bot@oatech.co"
          git add content/posts/
          git add scripts/keywords.json
          git commit -m "publish: new blog post" || exit 0
          git push
```

## 8. 구현 순서

| 순서 | 작업 | 의존성 |
|------|------|--------|
| 1 | Next.js 프로젝트 초기화 + Tailwind 설정 | 없음 |
| 2 | 레이아웃 및 반응형 UI (Header, Footer, Layout) | 1 |
| 3 | MDX 시스템 구축 (파싱, 렌더링) + 샘플 글 | 1 |
| 4 | 블로그 목록/상세 페이지 구현 | 2, 3 |
| 5 | SEO 최적화 (메타태그, sitemap, robots.txt) | 4 |
| 6 | CTA 컴포넌트 구현 | 4 |
| 7 | AI 콘텐츠 생성 스크립트 | 3 |
| 8 | GitHub Actions 자동 발행 워크플로우 | 7 |
| 9 | 관리자 대시보드 (간단) | 3 |
