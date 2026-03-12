# 오아테크 블로그 보안 취약점 분석 보고서

- **분석일**: 2026-03-12
- **분석 대상**: oatech-blog (Next.js 16 + MDX + Claude API)
- **분석자**: Security Architect Agent

---

## 요약

| 심각도 | 건수 | 설명 |
|--------|------|------|
| Critical | 1 | MDX 렌더링을 통한 XSS / 원격 코드 실행 가능성 |
| High | 2 | 보안 헤더 미설정, GitHub Actions 입력값 인젝션 |
| Medium | 3 | CSP 미설정, Path Traversal 가능성, 의존성 감사 미수행 |
| Low | 1 | JSON-LD 구조화 데이터 부재 (보안과 직접 관련 없으나 무결성 연관) |

**종합 보안 점수: 45/100** (개선 필요)

---

## 1. MDX 렌더링의 XSS 위험성 [Critical]

### OWASP: A03 (Injection), A08 (Software and Data Integrity Failures)

**현재 코드** (`src/components/blog/PostContent.tsx`):

```tsx
<MDXRemote source={content} components={mdxComponents} />
```

**위험 분석**:

`next-mdx-remote`는 MDX 소스를 **서버에서 컴파일하고 실행**합니다. MDX는 일반 Markdown과 달리 **임의의 JSX/JavaScript 표현식을 실행**할 수 있습니다.

현재 이 프로젝트에서 MDX 콘텐츠는 **Claude API가 자동 생성**하여 파일 시스템에 저장합니다. 공격 시나리오:

1. **AI 프롬프트 인젝션**: Claude API 응답에 악성 JSX가 포함될 수 있음 (프롬프트 인젝션 공격으로 LLM이 악성 코드를 생성하도록 유도)
2. **파일 시스템 직접 변조**: Git 저장소에 접근 권한이 있는 사람이 악성 MDX를 커밋
3. **Supply chain**: keywords.json이 변조되어 악성 프롬프트가 주입되는 경우

**구체적 위험**:
- MDX 내에서 `{(() => { /* 임의 JS */ })()}` 같은 코드 실행 가능
- `<script>` 태그 삽입 (MDX는 HTML도 허용)
- 커스텀 컴포넌트 외의 HTML 요소를 통한 이벤트 핸들러 삽입 (`<img onerror="...">`)

**완화 요소**:
- SSG(정적 생성) 방식이므로 빌드 시점에만 코드가 실행됨 (런타임 사용자 입력 기반 MDX 렌더링은 아님)
- 콘텐츠 소스가 자동 생성 + Git 커밋 파이프라인이므로 코드 리뷰로 방어 가능

**권장 조치**:
1. MDX 콘텐츠 생성 후 커밋 전에 위험한 패턴을 검증하는 스크립트 추가 (`<script>`, `onerror`, `onload`, `javascript:`, `{(` 등)
2. `next-mdx-remote`의 `components` 옵션에서 허용할 HTML 요소를 화이트리스트로 제한
3. `rehype-sanitize` 플러그인 추가로 HTML 산화(sanitization) 적용
4. GitHub Actions에서 생성된 MDX를 자동 검증하는 단계 추가

---

## 2. /admin 페이지 접근 제어 [해당 없음]

**분석 결과**: `/admin` 경로에 해당하는 페이지가 존재하지 않습니다.

이 프로젝트는 **관리 페이지 없이** 운영됩니다:
- 콘텐츠 생성: CLI 스크립트 (`scripts/generate.ts`) + GitHub Actions 자동화
- 콘텐츠 관리: Git 저장소 기반

**현재 상태**: 위험 없음. 단, 향후 관리 페이지 추가 시 반드시 인증/인가 미들웨어를 적용해야 합니다.

---

## 3. API 키 관리 (ANTHROPIC_API_KEY) [적절함, 개선 여지 있음]

### OWASP: A02 (Cryptographic Failures), A05 (Security Misconfiguration)

**현재 상태**:

| 항목 | 상태 | 평가 |
|------|------|------|
| `.env*` 파일 .gitignore 포함 | O | 양호 |
| 소스코드에 하드코딩된 API 키 | X (없음) | 양호 |
| GitHub Secrets 사용 | O (`secrets.ANTHROPIC_API_KEY`) | 양호 |
| `NEXT_PUBLIC_` 접두사 사용 | X (없음) | 양호 |
| .env 파일 존재 여부 | 없음 | 양호 (로컬에서는 환경변수 직접 설정 방식) |

**양호한 점**:
- `new Anthropic()` 호출 시 SDK가 자동으로 `ANTHROPIC_API_KEY` 환경변수를 읽음
- 빌드 타임 스크립트에서만 사용되므로 클라이언트에 노출될 경로 없음
- `.gitignore`에 `.env*` 패턴 포함

**개선 권장**:
1. `scripts/generate.ts`에서 API 키 존재 여부를 명시적으로 검증하고, 없을 때 명확한 에러 메시지 출력
2. API 키에 사용량 제한(rate limit) 설정 (Anthropic 콘솔에서)
3. `.env.example` 파일 추가하여 필요한 환경변수 목록 문서화

---

## 4. GitHub Actions 워크플로우 보안 [High]

### OWASP: A03 (Injection), A08 (Software and Data Integrity Failures)

**파일**: `.github/workflows/publish.yml`

#### 4-1. 입력값 인젝션 위험 [High]

```yaml
run: npx tsx scripts/generate.ts ${{ inputs.category && format('--category={0}', inputs.category) || '' }} --count=${{ inputs.count || '1' }}
```

`${{ inputs.category }}`와 `${{ inputs.count }}`가 **쉘 명령어에 직접 삽입**됩니다. `workflow_dispatch` 입력은 GitHub에서 수동 트리거하는 사용자가 제공하므로, 저장소 쓰기 권한이 있는 사용자만 트리거할 수 있지만:

- `inputs.category`에 `; rm -rf /` 같은 값이 들어갈 수 있음
- `inputs.count`에 셸 메타문자 삽입 가능

**권장 조치**:
1. 입력값을 환경변수로 전달하고 스크립트 내에서 파싱:
```yaml
env:
  INPUT_CATEGORY: ${{ inputs.category }}
  INPUT_COUNT: ${{ inputs.count }}
run: npx tsx scripts/generate.ts
```
2. 스크립트에서 `process.env.INPUT_CATEGORY`를 읽어 검증

#### 4-2. Git 설정의 불충분한 보안 [Medium]

```yaml
git config user.name "oatech-blog-bot"
git config user.email "bot@oatech.co"
```

- `GITHUB_TOKEN` 기본 권한으로 push하므로 현재 동작은 정상
- 단, `permissions` 블록이 명시되지 않아 기본 토큰 권한이 과도할 수 있음

**권장 조치**:
```yaml
permissions:
  contents: write
```
를 job 레벨에 추가하여 최소 권한 원칙 적용

#### 4-3. 의존성 설치 보안

- `pnpm install`에 `--frozen-lockfile` 옵션이 없어 lockfile과 다른 버전이 설치될 수 있음

**권장 조치**: `pnpm install --frozen-lockfile` 사용

---

## 5. 의존성 보안 (Supply Chain) [Medium]

### OWASP: A06 (Vulnerable and Outdated Components)

**현재 의존성**:

| 패키지 | 버전 | 비고 |
|--------|------|------|
| next | 16.1.6 | 최신 |
| react / react-dom | 19.2.3 | 최신 |
| next-mdx-remote | ^6.0.0 | MDX 원격 렌더링 |
| gray-matter | ^4.0.3 | Frontmatter 파싱 |
| @anthropic-ai/sdk | ^0.78.0 | AI API |

**위험 요소**:
1. **자동 보안 감사 미수행**: `pnpm audit` 또는 Dependabot/Renovate 설정 없음
2. **lockfile 검증 없음**: CI에서 `--frozen-lockfile` 미사용
3. **gray-matter의 알려진 문제**: gray-matter v4는 YAML frontmatter를 `js-yaml`로 파싱하는데, `!!js/function` 같은 YAML 태그를 통한 코드 실행이 가능할 수 있음 (gray-matter는 기본적으로 `safeLoad` 사용하므로 완화됨)

**권장 조치**:
1. GitHub Dependabot 또는 Renovate 설정 추가
2. CI 파이프라인에 `pnpm audit --audit-level=high` 단계 추가
3. `.github/dependabot.yml` 파일 생성

---

## 6. CSP (Content Security Policy) 헤더 설정 [Medium]

### OWASP: A05 (Security Misconfiguration)

**현재 상태**: `next.config.ts`에 **보안 헤더가 전혀 설정되어 있지 않습니다.**

```ts
const nextConfig: NextConfig = {
  /* config options here */
};
```

**누락된 보안 헤더들**:

| 헤더 | 목적 | 현재 | 필요성 |
|------|------|------|--------|
| Content-Security-Policy | XSS 방어, 리소스 로딩 제한 | 없음 | High |
| Strict-Transport-Security | HTTPS 강제 | 없음 | High |
| X-Frame-Options | 클릭재킹 방지 | 없음 | Medium |
| X-Content-Type-Options | MIME 스니핑 방지 | 없음 | Medium |
| Referrer-Policy | 리퍼러 정보 제어 | 없음 | Medium |
| X-DNS-Prefetch-Control | DNS 프리페치 제어 | 없음 | Low |
| Permissions-Policy | 브라우저 기능 제한 | 없음 | Low |

**권장 CSP 정책** (이 프로젝트에 적합한 설정):

```
default-src 'self';
script-src 'self' 'unsafe-inline' 'unsafe-eval';
style-src 'self' 'unsafe-inline';
img-src 'self' data: https:;
font-src 'self' https://fonts.gstatic.com;
connect-src 'self';
frame-ancestors 'none';
```

참고: Next.js 16에서는 `next.config.ts`의 `headers()` 함수에서 설정하거나, `middleware.ts`에서 응답 헤더를 추가하는 방식으로 구현합니다.

---

## 7. 외부 링크 보안 (noopener, noreferrer) [양호]

### 분석 결과: 적절하게 처리됨

프로젝트 내 모든 외부 링크(`target="_blank"`)에 `rel="noopener noreferrer"`가 올바르게 적용되어 있습니다:

| 파일 | 위치 | rel 속성 |
|------|------|----------|
| `Header.tsx` (데스크톱 링크) | L28-35 | `noopener noreferrer` |
| `Header.tsx` (모바일 링크) | L67-74 | `noopener noreferrer` |
| `Footer.tsx` | L13-17 | `noopener noreferrer` |
| `InlineCTA.tsx` | L13-18 | `noopener noreferrer` |
| `BottomCTA.tsx` | L13-18 | `noopener noreferrer` |

**평가**: 양호. `window.opener` 접근 차단 및 리퍼러 누출 방지가 정상적으로 적용됨.

단, MDX 콘텐츠 내에서 AI가 생성하는 `<a>` 태그에는 이 속성이 자동 적용되지 않습니다.

**권장 조치**: MDX 컴포넌트 매핑에서 `a` 태그를 오버라이드하여 외부 링크에 자동으로 `rel="noopener noreferrer"` 및 `target="_blank"` 적용:

```tsx
const mdxComponents = {
  InlineCTA,
  a: ({ href, children, ...props }) => {
    const isExternal = href?.startsWith('http');
    return (
      <a
        href={href}
        {...(isExternal ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
        {...props}
      >
        {children}
      </a>
    );
  },
};
```

---

## 추가 발견 사항

### 8. Path Traversal 가능성 [Medium]

**파일**: `src/lib/posts.ts`

```ts
export function getPostBySlug(slug: string): Post | null {
  const filePath = path.join(POSTS_DIR, `${slug}.mdx`);
```

`slug`는 URL 파라미터에서 가져옵니다. `generateStaticParams()`로 정적 생성되므로 빌드 타임에는 안전하지만, ISR/SSR 모드로 전환 시 `../../../etc/passwd` 같은 경로 조작이 가능합니다.

**현재 완화 요소**: Next.js의 `generateStaticParams` + 정적 생성 모드로 동작하므로 런타임에서는 미리 생성된 경로만 접근 가능.

**권장 조치**: 방어적 코딩으로 slug 검증 추가:
```ts
if (slug.includes('..') || slug.includes('/') || slug.includes('\\')) return null;
```

### 9. 에러 처리 및 정보 노출 [Low]

- `scripts/generate.ts`에서 API 호출 실패 시 에러 스택이 콘솔에 노출될 수 있음
- 빌드 스크립트이므로 사용자 대면 위험은 낮지만, CI 로그에 민감 정보가 포함될 수 있음

### 10. middleware.ts 부재 [참고]

`src/middleware.ts` 파일이 없습니다. 현재 정적 블로그로는 문제없으나, 향후 기능 확장 시:
- Rate limiting
- 보안 헤더 주입
- 인증 체크
등을 위해 미들웨어 레이어가 필요합니다.

---

## 보안 개선 우선순위 (권장)

| 순위 | 항목 | 심각도 | 예상 작업량 |
|------|------|--------|-------------|
| 1 | MDX 콘텐츠 산화(sanitization) 및 검증 파이프라인 | Critical | 중 |
| 2 | next.config.ts에 보안 헤더 추가 | High | 소 |
| 3 | GitHub Actions 입력값 안전 처리 | High | 소 |
| 4 | GitHub Actions permissions 최소화 | High | 소 |
| 5 | MDX `<a>` 태그 오버라이드 (외부 링크 보안) | Medium | 소 |
| 6 | CI에 pnpm audit 및 --frozen-lockfile 추가 | Medium | 소 |
| 7 | slug 검증 추가 (Path Traversal 방어) | Medium | 소 |
| 8 | Dependabot/Renovate 설정 | Medium | 소 |
| 9 | .env.example 문서화 | Low | 소 |

---

## 결론

이 프로젝트는 **정적 블로그**라는 특성상 공격 표면이 제한적이며, 외부 링크 보안과 API 키 관리는 양호합니다. 그러나 **MDX 렌더링의 코드 실행 가능성**과 **보안 헤더 완전 부재**는 반드시 개선해야 합니다. GitHub Actions의 입력값 인젝션 위험도 쉽게 해결 가능하므로 빠르게 적용할 것을 권장합니다.
