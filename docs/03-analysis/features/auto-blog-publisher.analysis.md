# auto-blog-publisher Analysis Report (v2)

> **Analysis Type**: Comprehensive Gap Analysis (All Design Documents vs Implementation)
>
> **Project**: oatech-blog
> **Version**: 0.1.0
> **Analyst**: Claude (gap-detector)
> **Date**: 2026-03-12
> **Design Docs**:
> - [auto-blog-publisher.design.md](../../02-design/features/auto-blog-publisher.design.md)
> - [auto-blog-publisher.plan.md](../../01-plan/features/auto-blog-publisher.plan.md)
> - [blog-enhancement-v2.plan.md](../../01-plan/features/blog-enhancement-v2.plan.md)
> - [content-strategy-improvement.plan.md](../../01-plan/features/content-strategy-improvement.plan.md)

---

## 1. Analysis Overview

### 1.1 Analysis Purpose

3개의 Plan 문서와 1개의 Design 문서에 정의된 모든 기능 사양을 실제 구현 코드와 비교하여 Gap을 식별한다. 이번 분석은 v1 기본 설계(auto-blog-publisher.design.md)뿐 아니라, v2 고도화 계획(blog-enhancement-v2.plan.md)과 콘텐츠 전략 개선 계획(content-strategy-improvement.plan.md)도 함께 포함한다.

### 1.2 Analysis Scope

| Document | Type | Items Checked |
|----------|------|:------------:|
| `auto-blog-publisher.design.md` | Design (v1) | 46 |
| `blog-enhancement-v2.plan.md` | Plan (v2 Enhancement) | 17 FRs + 34 tasks |
| `content-strategy-improvement.plan.md` | Plan (Content Strategy) | 9 FRs |

- **Implementation Path**: `src/`, `scripts/`, `.github/`, `content/`, `next.config.ts`, `package.json`
- **Analysis Date**: 2026-03-12

---

## 2. Overall Scores

| Category | Score | Status |
|----------|:-----:|:------:|
| v1 Design Match (구조/기능) | 87% | Pass |
| v2 Enhancement Match | 35% | FAIL |
| Content Strategy Match | 15% | FAIL |
| Architecture Compliance | 95% | Pass |
| Convention Compliance | 93% | Pass |
| Security | 90% | Pass |
| SEO | 75% | Warn |
| **Overall (v1 Only)** | **87%** | **Pass** |
| **Overall (All Documents)** | **55%** | **FAIL** |

---

## 3. v1 Design Gap Analysis (design.md vs Implementation)

### 3.1 Project Structure

| Design Path | Implementation | Status | Notes |
|-------------|----------------|:------:|-------|
| `content/posts/YYYY-MM-DD-slug.mdx` | 2 MDX files exist | Match | Naming pattern correct |
| `src/app/layout.tsx` | Exists | Match | |
| `src/app/page.tsx` | Exists | Match | |
| `src/app/blog/[slug]/page.tsx` | Exists | Match | |
| `src/app/category/[category]/page.tsx` | Exists | Match | |
| `src/app/admin/page.tsx` | Missing | NOT IMPL | Admin dashboard missing |
| `src/components/layout/Header.tsx` | Exists | Match | |
| `src/components/layout/Footer.tsx` | Exists | Match | |
| `src/components/layout/Sidebar.tsx` | Missing | NOT IMPL | Sidebar missing |
| `src/components/blog/PostCard.tsx` | Exists | Match | |
| `src/components/blog/PostContent.tsx` | Exists | Match | |
| `src/components/blog/PostMeta.tsx` | Exists | Match | |
| `src/components/cta/InlineCTA.tsx` | Exists | Match | |
| `src/components/cta/BottomCTA.tsx` | Exists | Match | |
| `src/components/seo/SEOMeta.tsx` | Exists | Match | |
| `src/lib/posts.ts` | Exists | Match | |
| `src/lib/types.ts` | Exists | Match | |
| `src/lib/constants.ts` | Exists | Match | |
| `scripts/generate.ts` | Exists | Match | |
| `scripts/keywords.json` | Exists | Match | |
| `scripts/prompt-template.ts` | Exists | Match | File exists but unused by generate.ts |
| `.github/workflows/publish.yml` | Exists | Match | |

### 3.2 Data Model

| Field | Design Type | Impl Type | Status |
|-------|-------------|-----------|:------:|
| `PostFrontmatter.title` | `string` | `z.string().min(1)` | Match (improved with Zod) |
| `PostFrontmatter.date` | `string` | `z.string().regex(YYYY-MM-DD)` | Match (improved) |
| `PostFrontmatter.category` | `Category` | `z.enum(VALID_CATEGORIES)` | Match (improved) |
| `PostFrontmatter.tags` | `string[]` | `z.array(z.string())` | Match |
| `PostFrontmatter.description` | `string` | `z.string().max(200)` | Match (improved) |
| `PostFrontmatter.thumbnail` | `string?` | `z.string().optional()` | Match |
| `PostFrontmatter.draft` | `boolean?` | `z.boolean().optional()` | Match |
| `Category` | union type | `VALID_CATEGORIES` const | Match |
| `Post` (extended) | Not in design | `PostFrontmatter + slug + content + readingTime` | Added (useful) |
| `KeywordEntry` | Design spec | Matches exactly | Match |
| `KeywordDB` | Design spec | Matches exactly | Match |

### 3.3 Page Routing

| Route | Design Description | Implementation | Status |
|-------|-------------------|----------------|:------:|
| `/` | Latest posts + pagination | Posts list, NO pagination | Partial |
| `/blog/[slug]` | Post detail | Implemented | Match |
| `/category/[category]` | Category list | Implemented | Match |
| `/admin` | Admin dashboard | NOT implemented | NOT IMPL |

### 3.4 SEO Auto-generated Files

| File | Design | Implementation | Status |
|------|--------|----------------|:------:|
| `sitemap.xml` | Next.js generateSitemap | `src/app/sitemap.ts` | Match |
| `robots.txt` | Static file | `src/app/robots.ts` (dynamic) | Match (improved) |
| RSS Feed `/feed.xml` | Route handler | `src/app/feed/route.ts` at `/feed` | Match (path differs slightly) |

### 3.5 AI Content Generation Script

| Feature | Design | Implementation | Status |
|---------|--------|----------------|:------:|
| Keyword selection | From keywords.json | `pickUnusedKeyword()` | Match |
| Prompt construction | keyword + category inject | `buildPrompt()` | Match |
| Claude API call | claude-sonnet-4-6 | claude-sonnet-4-6 | Match |
| File save | content/posts/ | Implemented | Match |
| used flag update | keywords.json update | `saveKeywords()` | Match |
| `keyword` option | Specific keyword select | NOT implemented | Missing |
| `category` option | Category filter | Implemented | Match |
| `count` option | Generation count | Implemented | Match |
| `dryRun` option | Preview mode | Implemented | Match |
| prompt-template.ts import | Used by generate.ts | NOT used (duplicate code) | Mismatch |

### 3.6 GitHub Actions Workflow

| Feature | Design | Implementation | Status |
|---------|--------|----------------|:------:|
| Cron schedule | `0 0 * * 1,3,5` | Same | Match |
| workflow_dispatch | Manual trigger | + category/count inputs | Match+ |
| ANTHROPIC_API_KEY | secrets | secrets | Match |
| Git bot name | `blog-bot` | `oatech-blog-bot` | Changed |
| Commit message | `publish: new blog post` | `publish: auto-generated blog post [skip ci]` | Changed (improved) |
| MDX validation step | Not in design | `validate-mdx.ts` step added | Added (improvement) |

### 3.7 v1 Design Match Summary

```
+---------------------------------------------+
|  v1 Design Match Rate: 87%                   |
+---------------------------------------------+
|  Total items checked:      46                |
|  Match:                    38 items (83%)    |
|  Partial/Changed:           4 items (8%)     |
|  Not implemented:           4 items (9%)     |
+---------------------------------------------+
```

**Missing from v1 Design:**

| # | Item | Severity | Description |
|---|------|:--------:|-------------|
| 1 | Admin Dashboard (`/admin`) | Major | Entire page missing |
| 2 | Sidebar component | Minor | Category/popular posts sidebar |
| 3 | Pagination | Minor | `POSTS_PER_PAGE` constant exists but unused |
| 4 | `keyword` CLI option | Minor | Only category/count/dryRun supported |

---

## 4. v2 Enhancement Gap Analysis (blog-enhancement-v2.plan.md)

### 4.1 Phase 1: Design Foundation

| # | Task | Expected | Actual | Status |
|---|------|----------|--------|:------:|
| 1-1 | Design tokens (color, typo, spacing) | `globals.css @theme inline` | Partial - colors/radius/fonts defined, missing semantic dark mode tokens, shadow tokens, spacing tokens | Partial |
| 1-2 | Pretendard Korean font | `next/font/local` woff2 | CDN link tag (not next/font) | Partial |
| 1-3 | Dark mode infra (next-themes) | next-themes + CSS variables | NOT implemented - no dark mode at all | NOT IMPL |
| 1-4 | ThemeToggle component | `components/ui/ThemeToggle.tsx` | NOT implemented | NOT IMPL |

### 4.2 Phase 2: Core UI Redesign

| # | Task | Expected | Actual | Status |
|---|------|----------|--------|:------:|
| 2-1 | Hero section redesign | Gradient bg, stats, highlight card | Gradient bg implemented, no stats counter | Partial |
| 2-2 | PostCard redesign | OG thumbnail, hover, reading time, gradient badge | Gradient banner, reading time, hover effect - no OG thumbnail | Partial |
| 2-3 | Header redesign | Sticky + blur + logo + category nav + theme toggle | Sticky + blur + logo + category nav - no theme toggle | Partial |
| 2-4 | Footer redesign | 3-column layout | 3-column layout implemented | Match |
| 2-5 | Category filter tab UI | `components/ui/CategoryFilter.tsx` | Category chips on main page (inline, not separate component) | Partial |
| 2-6 | Pagination component | `components/ui/Pagination.tsx` | NOT implemented | NOT IMPL |

### 4.3 Phase 3: Post Detail UX

| # | Task | Expected | Actual | Status |
|---|------|----------|--------|:------:|
| 3-1 | 2-column layout (content + sidebar) | `blog/[slug]/page.tsx` | Single column only (max-w-3xl) | NOT IMPL |
| 3-2 | ToC (Table of Contents) sidebar | `components/blog/TableOfContents.tsx` | NOT implemented | NOT IMPL |
| 3-3 | Reading time util + UI | `lib/reading-time.ts`, `PostMeta.tsx` | `calculateReadingTime()` in posts.ts, displayed in PostMeta | Match |
| 3-4 | Scroll progress indicator | `components/blog/ReadingProgress.tsx` | `ScrollProgress.tsx` implemented | Match |
| 3-5 | Related posts section | `components/blog/RelatedPosts.tsx` | NOT implemented | NOT IMPL |
| 3-6 | CTA v2 (3 variants) | `components/cta/` | Only 1 variant each for InlineCTA/BottomCTA | NOT IMPL |
| 3-7 | MDX custom components (callout, tip) | `components/mdx/` | NOT implemented (only InlineCTA, SafeLink, SafeImage) | NOT IMPL |

### 4.4 Phase 4: SEO + Content Quality

| # | Task | Expected | Actual | Status |
|---|------|----------|--------|:------:|
| 4-1 | Schema.org Article JSON-LD | `components/seo/JsonLd.tsx` | `generateArticleJsonLd()` in SEOMeta.tsx | Match (different file) |
| 4-2 | OG image auto-generation | `app/api/og/route.tsx` (next/og) | NOT implemented | NOT IMPL |
| 4-3 | AI prompt v2 | `scripts/prompt-template.ts` | Still v1 prompt, prompt-template.ts unused by generate.ts | NOT IMPL |
| 4-4 | Content quality validation | `scripts/validate-content.ts` | `scripts/validate-mdx.ts` exists (basic validation) | Partial |
| 4-5 | Search (Fuse.js client-side) | `components/ui/SearchModal.tsx` | NOT implemented | NOT IMPL |
| 4-6 | RSS Feed | `app/feed.xml/route.ts` | `app/feed/route.ts` (path differs) | Match |

### 4.5 v2 Functional Requirements Status

| ID | Requirement | Priority | Status |
|----|-------------|:--------:|:------:|
| FR-01 | Design system (color, typo, component tokens) | Critical | Partial (basic tokens only) |
| FR-02 | Hero section redesign | High | Partial |
| FR-03 | PostCard redesign | High | Partial |
| FR-04 | ToC auto-generation | High | NOT IMPL |
| FR-05 | Reading time display | Medium | Match |
| FR-06 | Related posts | Medium | NOT IMPL |
| FR-07 | Dark mode toggle | High | NOT IMPL |
| FR-08 | Korean web font (Pretendard) | High | Partial (CDN, not next/font) |
| FR-09 | Pagination | High | NOT IMPL |
| FR-10 | Search (client-side) | Medium | NOT IMPL |
| FR-11 | OG image auto-generation | Medium | NOT IMPL |
| FR-12 | Schema.org Article structured data | High | Match |
| FR-13 | AI prompt v2 | Critical | NOT IMPL |
| FR-14 | CTA A/B variants (3 types) | Medium | NOT IMPL |
| FR-15 | Category filter UI | Medium | Partial |
| FR-16 | Scroll progress indicator | Low | Match |
| FR-17 | Code block highlighting + copy | Low | NOT IMPL |

### 4.6 v2 Enhancement Match Summary

```
+---------------------------------------------+
|  v2 Enhancement Match Rate: 35%              |
+---------------------------------------------+
|  Functional Requirements:    17              |
|  Match/Implemented:           4 (24%)        |
|  Partial:                     5 (29%)        |
|  NOT Implemented:             8 (47%)        |
+---------------------------------------------+
```

---

## 5. Content Strategy Gap Analysis (content-strategy-improvement.plan.md)

### 5.1 Functional Requirements Status

| ID | Requirement | Priority | Status | Notes |
|----|-------------|:--------:|:------:|-------|
| FR-01 | Prompt word count enforcement (re-gen if < 1500) | Must | NOT IMPL | generate.ts validates min 500 chars (body only), no re-generation |
| FR-02 | Content format options (how-to/checklist/case/FAQ) | Must | NOT IMPL | Single format only |
| FR-03 | Keyword intent field | Must | NOT IMPL | keywords.json has no `intent` field |
| FR-04 | Keyword expansion (13 -> 50+) | Must | NOT IMPL | Still 14 keywords total |
| FR-05 | InlineCTA position optimization (60-70%) | Should | NOT IMPL | Position determined by AI in prompt |
| FR-06 | Context-aware CTA messages | Should | NOT IMPL | InlineCTA has fixed message |
| FR-07 | Long-tail keyword clusters | Should | NOT IMPL | No `subKeywords` expansion |
| FR-08 | Info table in prompt | Could | NOT IMPL | |
| FR-09 | Case/interview format prompt | Could | NOT IMPL | |

### 5.2 Content Strategy Match Summary

```
+---------------------------------------------+
|  Content Strategy Match Rate: 15%            |
+---------------------------------------------+
|  Functional Requirements:    9               |
|  Implemented:                0 (0%)          |
|  Partial:                    1 (11%)         |
|  NOT Implemented:            8 (89%)         |
+---------------------------------------------+

Note: FR-01 scored "Partial" because validate-mdx.ts does
check minimum body length, but lacks the re-generation logic.
```

---

## 6. Architecture & Convention Compliance

### 6.1 Architecture (Starter Level - Appropriate)

| Expected | Exists | Contents Correct | Status |
|----------|:------:|:----------------:|:------:|
| `src/components/` | Yes | Proper sub-folders (blog/, cta/, layout/, seo/) | Match |
| `src/lib/` | Yes | types.ts, constants.ts, posts.ts | Match |
| `src/app/` | Yes | App Router pages | Match |
| `scripts/` | Yes | AI generation scripts | Match |

Architecture is Starter level, which is appropriate for an SSG blog.

### 6.2 Naming Convention

| Category | Convention | Compliance | Violations |
|----------|-----------|:----------:|------------|
| Components | PascalCase | 100% | None |
| Functions | camelCase | 100% | None |
| Constants | UPPER_SNAKE_CASE | 100% | `SITE_CONFIG`, `CATEGORIES`, `POSTS_PER_PAGE`, `MAX_RETRIES` |
| Files (component) | PascalCase.tsx | 100% | None |
| Files (utility) | camelCase.ts | 100% | None |
| Folders | kebab-case | 100% | None |

### 6.3 Import Order

All files follow: External libs -> Internal `@/` imports -> Type imports. No violations found.

### 6.4 Environment Variables

| Variable | Convention | Location | Status |
|----------|-----------|----------|:------:|
| `ANTHROPIC_API_KEY` | `API_*` prefix expected | `.env.example`, GitHub Secrets | Warn (uses `ANTHROPIC_` prefix, but vendor-specific is acceptable) |
| `NEXT_PUBLIC_GA_ID` | `NEXT_PUBLIC_*` | `.env.example` | Match |
| `NEXT_PUBLIC_GOOGLE_VERIFICATION` | `NEXT_PUBLIC_*` | `.env.example` | Match |
| `NEXT_PUBLIC_NAVER_VERIFICATION` | `NEXT_PUBLIC_*` | `.env.example` | Match |
| `NEXT_PUBLIC_SITE_URL` | Required by v2 Plan | NOT in .env.example | Missing |

### 6.5 Security Review

| Item | Status | Notes |
|------|:------:|-------|
| Security headers (CSP, X-Frame, etc.) | Match | next.config.ts has comprehensive headers |
| External links `rel="noopener noreferrer"` | Match | All external links have proper rel |
| MDX sanitization (script/iframe/embed blocked) | Match | mdxComponents blocks dangerous elements |
| API key in Secrets only | Match | ANTHROPIC_API_KEY in GitHub Secrets |
| XSS prevention in MDX | Match | SafeLink, SafeImage, blocked elements |
| Input validation (slug) | Match | Regex check in getPostBySlug |
| Dependency audit | Not verified | Should run `pnpm audit` |

### 6.6 Code Quality Issues

| Issue | File | Severity | Description |
|-------|------|:--------:|-------------|
| Duplicate prompt code | `generate.ts` + `prompt-template.ts` | Major | `buildPrompt()` exists in both files, generate.ts ignores prompt-template.ts |
| No caching in getAllPosts | `posts.ts` | Minor | Every call reads filesystem (acceptable for SSG) |
| Hardcoded CDN font URL | `layout.tsx` line 66 | Minor | v2 Plan requires next/font/local instead |
| Missing `keyword` CLI option | `generate.ts` | Minor | Design specifies but not implemented |

---

## 7. Detailed Gap List (All Documents Combined)

### 7.1 CRITICAL Gaps (Must fix for MVP+)

| # | Item | Source Document | Description | Effort |
|---|------|-----------------|-------------|:------:|
| 1 | Dark mode | v2 Plan FR-07, Phase 1 | next-themes + ThemeToggle + CSS vars for dark | Medium |
| 2 | AI prompt v2 | v2 Plan FR-13, Content Plan FR-01/02 | Prompt quality improvement, format branching, word count enforcement | Medium |
| 3 | Keyword expansion | Content Plan FR-03/04 | 14 -> 50+ keywords with intent field | Low |

### 7.2 MAJOR Gaps (High priority)

| # | Item | Source Document | Description | Effort |
|---|------|-----------------|-------------|:------:|
| 4 | Admin dashboard | v1 Design 4.1 | `/admin` page - post list, keyword status | Medium |
| 5 | Pagination | v1 Design 4.1, v2 Plan FR-09 | Main + category page pagination | Low |
| 6 | ToC sidebar | v2 Plan FR-04 | 2-column layout + h2/h3 extraction + sticky sidebar | Medium |
| 7 | OG image generation | v2 Plan FR-11 | `app/api/og/route.tsx` with next/og (Satori) | Medium |
| 8 | Pretendard font via next/font | v2 Plan FR-08 | Replace CDN link with next/font/local woff2 | Low |
| 9 | Related posts | v2 Plan FR-06 | Same category + shared tags, mini PostCard x3 | Low |
| 10 | Search (Fuse.js) | v2 Plan FR-10 | Client-side full-text search modal | Medium |
| 11 | InlineCTA context-aware | Content Plan FR-05/06 | Category-based message, UTM params | Low |

### 7.3 MINOR Gaps (Lower priority)

| # | Item | Source Document | Description | Effort |
|---|------|-----------------|-------------|:------:|
| 12 | Sidebar component | v1 Design 2 | Category + popular posts sidebar | Low |
| 13 | CTA A/B variants | v2 Plan FR-14 | 3 CTA design variants | Low |
| 14 | MDX custom components | v2 Plan Phase 3-7 | Callout, StepGuide components | Low |
| 15 | Code block highlight + copy | v2 Plan FR-17 | Syntax highlighting with copy button | Low |
| 16 | Category filter component | v2 Plan Phase 2-5 | Separate CategoryFilter.tsx | Low |
| 17 | prompt-template.ts dedup | v1 Design | generate.ts should import from prompt-template.ts | Low |
| 18 | keyword CLI option | v1 Design 5.3 | `--keyword=` argument support | Low |
| 19 | Long-tail keyword clusters | Content Plan FR-07 | Main keyword -> 3-5 derived keywords | Low |
| 20 | Content format branching | Content Plan FR-02 | how-to/checklist/case/FAQ format param | Low |
| 21 | NEXT_PUBLIC_SITE_URL env | v2 Plan 10.3 | Add to .env.example | Low |

---

## 8. Match Rate Calculation

### 8.1 v1 Design Only

| Category | Items | Matched | Rate |
|----------|:-----:|:-------:|:----:|
| Project Structure | 22 | 19 | 86% |
| Data Model | 12 | 12 | 100% |
| Page Routing | 4 | 2.5 | 63% |
| Component Features | 6 | 6 | 100% |
| SEO Files | 3 | 3 | 100% |
| AI Script | 10 | 8 | 80% |
| CI/CD Workflow | 8 | 7 | 88% |
| Tech Stack | 6 | 5.5 | 92% |
| **Total** | **71** | **63** | **87%** |

### 8.2 All Documents Combined

| Document | Items | Matched | Rate |
|----------|:-----:|:-------:|:----:|
| v1 Design | 71 | 63 | 87% |
| v2 Enhancement (17 FRs) | 17 | 6.5 | 38% |
| Content Strategy (9 FRs) | 9 | 0.5 | 6% |
| Architecture/Convention | 20 | 19 | 95% |
| **Total** | **117** | **89** | **55%** |

### 8.3 Visual Summary

```
v1 Design Match:
[==================|  ] 87%  -- Pass (>= 70%)

v2 Enhancement Match:
[=======|             ] 35%  -- FAIL (< 70%)

Content Strategy Match:
[===|                 ] 15%  -- FAIL (< 70%)

Architecture Compliance:
[===================| ] 95%  -- Pass

Convention Compliance:
[==================|  ] 93%  -- Pass

Combined Overall:
[===========|         ] 55%  -- FAIL (< 70%)
```

---

## 9. Recommended Actions

### 9.1 Immediate Actions (v1 -> 90% target)

v1 Design 기준 87% -> 90% 달성을 위해:

| Priority | Item | Effort | Impact on v1 Rate |
|:--------:|------|:------:|:-----------------:|
| 1 | Pagination (main + category) | Low | +3% |
| 2 | prompt-template.ts import dedup | Low | +1% |
| 3 | keyword CLI option | Low | +1% |

### 9.2 Short-term Actions (v2 Enhancement Start)

| Priority | Item | Effort | Impact |
|:--------:|------|:------:|--------|
| 1 | Dark mode (next-themes + ThemeToggle) | Medium | FR-07 (High priority) |
| 2 | Pretendard next/font/local | Low | FR-08 (High priority) |
| 3 | Pagination component | Low | FR-09 (High priority) |
| 4 | ToC sidebar (2-column layout) | Medium | FR-04 (High priority) |
| 5 | Schema.org already done | - | FR-12 (already Match) |

### 9.3 Medium-term Actions

| Priority | Item | Effort | Impact |
|:--------:|------|:------:|--------|
| 1 | AI prompt v2 (quality + format branching) | Medium | FR-13 (Critical) |
| 2 | Keyword DB expansion (50+) | Low | Content Plan FR-04 |
| 3 | OG image generation | Medium | FR-11 |
| 4 | Related posts | Low | FR-06 |
| 5 | Search modal (Fuse.js) | Medium | FR-10 |
| 6 | Admin dashboard | Medium | v1 Design requirement |

### 9.4 Design Document Updates Needed

v1 Design 문서에 반영이 필요한 구현 변경 사항:

- [ ] Next.js 버전: 15.x -> 16.x
- [ ] Tailwind config: `tailwind.config.ts` -> CSS-based `@theme inline`
- [ ] `Post` interface: `slug`, `content`, `readingTime` fields added
- [ ] RSS Feed path: `/feed.xml` -> `/feed`
- [ ] Git bot name: `blog-bot` -> `oatech-blog-bot`
- [ ] Commit message: `[skip ci]` suffix added
- [ ] MDX validation step added to CI pipeline
- [ ] workflow_dispatch inputs (category, count)
- [ ] Security headers in next.config.ts
- [ ] Zod runtime validation for frontmatter

---

## 10. Implementation Additions (Not in Design)

These are features implemented but not present in any design document:

| # | Item | Location | Value |
|---|------|----------|-------|
| 1 | `validate-mdx.ts` | `scripts/validate-mdx.ts` | MDX quality validation in CI |
| 2 | `generate:dry` script | `package.json` | Dry-run preview command |
| 3 | Security headers | `next.config.ts` | CSP, X-Frame-Options, HSTS, etc. |
| 4 | Zod frontmatter validation | `src/lib/types.ts` | Runtime type checking |
| 5 | SafeLink/SafeImage | `PostContent.tsx` | XSS prevention in MDX |
| 6 | `ScrollProgress` component | `src/components/blog/ScrollProgress.tsx` | Reading progress bar |
| 7 | `SLUG_MAP` | `scripts/generate.ts` | Korean keyword -> English slug mapping |
| 8 | API retry logic | `scripts/generate.ts` | `callWithRetry()` with backoff |
| 9 | Animated hero + fade-in | `globals.css`, `page.tsx` | CSS animations |
| 10 | Category gradient badges | `constants.ts`, components | Per-category gradient colors |

All additions are beneficial improvements. Design documents should be updated to reflect these.

---

## 11. Conclusion

### v1 Design vs Implementation: 87% Match -- Near Target

The core v1 design is well-implemented. Only 4 items remain: admin dashboard, sidebar, pagination, and keyword CLI option. Reaching 90% requires only the pagination implementation (the most impactful low-effort item).

### v2 Enhancement: 35% Match -- Significant Gap

The v2 enhancement plan is largely unimplemented. Key missing features: dark mode, ToC sidebar, OG image generation, search, pagination, and multiple CTA variants. However, several foundation items are partially done (design tokens, hero redesign, reading time, scroll progress, structured data).

### Content Strategy: 15% Match -- Not Started

The content strategy plan (prompt v2, keyword expansion, CTA optimization, format branching) has essentially not begun implementation. The existing validate-mdx.ts provides minimal overlap.

### Recommendation

The project should proceed in this order:

1. **Close v1 gaps first** (pagination, prompt-template dedup) to reach 90%
2. **Implement v2 Phase 1** (dark mode, font optimization) as the next PDCA cycle
3. **Content strategy improvements** can be done incrementally alongside v2 phases
4. **Update design documents** to reflect all implementation additions

---

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 0.1 | 2026-03-12 | Initial gap analysis (v1 only) | Claude (gap-detector) |
| 0.2 | 2026-03-12 | Comprehensive analysis including v2 + content strategy plans | Claude (gap-detector) |
