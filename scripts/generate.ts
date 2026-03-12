import Anthropic from '@anthropic-ai/sdk';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

interface KeywordEntry {
  keyword: string;
  subKeywords: string[];
  used: boolean;
  lastUsedAt?: string;
}

interface KeywordDB {
  categories: Record<string, KeywordEntry[]>;
}

const POSTS_DIR = path.join(process.cwd(), 'content', 'posts');
const KEYWORDS_PATH = path.join(__dirname, 'keywords.json');
const MAX_RETRIES = 2;

function loadKeywords(): KeywordDB {
  return JSON.parse(fs.readFileSync(KEYWORDS_PATH, 'utf-8'));
}

function saveKeywords(db: KeywordDB): void {
  fs.writeFileSync(KEYWORDS_PATH, JSON.stringify(db, null, 2), 'utf-8');
}

function pickUnusedKeyword(db: KeywordDB, category?: string): { category: string; entry: KeywordEntry } | null {
  const categories = category ? [category] : Object.keys(db.categories);

  for (const cat of categories) {
    const entries = db.categories[cat];
    if (!entries) continue;
    const unused = entries.find((e) => !e.used);
    if (unused) return { category: cat, entry: unused };
  }
  return null;
}

// 한글 키워드를 영문 슬러그로 변환하는 매핑
const SLUG_MAP: Record<string, string> = {
  '펜션 예약률': 'pension-reservation-rate',
  '숙박업 객실 관리': 'room-management',
  '모텔 매출 올리기': 'motel-revenue-boost',
  '게스트하우스 운영 노하우': 'guesthouse-tips',
  '숙박업 고객 관리': 'guest-crm',
  '펜션 창업 비용': 'pension-startup-cost',
  '숙박업 인허가': 'lodging-permits',
  '민박 창업 절차': 'minbak-startup-guide',
  '숙박업 수익 구조': 'lodging-revenue-model',
  '2026 숙박 트렌드': '2026-lodging-trends',
  '에어비앤비 대응 전략': 'airbnb-strategy',
  '숙박업 디지털 전환': 'digital-transformation',
  '성공 펜션 사례': 'pension-success-story',
  '숙박업 실패 사례': 'lodging-failure-lessons',
};

function slugify(keyword: string): string {
  if (SLUG_MAP[keyword]) return SLUG_MAP[keyword];

  return keyword
    .replace(/[^\w\s가-힣-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
    .toLowerCase()
    .slice(0, 60);
}

function buildPrompt(keyword: string, category: string, subKeywords: string[]): string {
  return `당신은 중소숙박업 전문 블로그 작가입니다. 오아테크(OaTech)라는 숙박업 SaaS 플랫폼의 블로그에 글을 작성합니다.

## 규칙
- 타겟 독자: 펜션/모텔/게스트하우스 운영자 및 숙박업 창업 준비자
- 톤: 전문적이지만 친근한 조언 형태. "~합니다" 체로 작성
- 분량: 1500~2500자 (공백 포함)
- SEO: 메인 키워드를 자연스럽게 본문에 3~5회 포함
- 구성: h2 소제목 4~6개로 구조화
- CTA: 본문 중간에 자연스럽게 "숙박업 관리 시스템" 또는 "통합 관리 솔루션"에 대한 필요성을 언급 (오아테크를 직접 언급하지 말 것)
- MDX: 본문 중간 적절한 위치에 <InlineCTA /> 컴포넌트를 1회 삽입

## 작성할 글
- 메인 키워드: ${keyword}
- 카테고리: ${category}
- 관련 키워드: ${subKeywords.join(', ')}

## 출력 형식
반드시 아래 형식으로 출력하세요. frontmatter와 본문만 출력하고, 다른 설명은 하지 마세요.

---
title: "제목 (메인 키워드 포함, 호기심 유발)"
date: "${new Date().toISOString().split('T')[0]}"
category: "${category}"
tags: [${subKeywords.map((k) => `"${k}"`).join(', ')}]
description: "SEO 설명 (메인 키워드 포함, 160자 이내)"
---

(여기에 Markdown 본문 작성. h2 소제목으로 구조화. 중간에 <InlineCTA /> 1회 삽입)
`;
}

function validateMdx(content: string): { valid: boolean; error?: string } {
  // frontmatter 존재 확인
  if (!content.startsWith('---')) {
    return { valid: false, error: 'frontmatter가 없습니다' };
  }

  try {
    const { data, content: body } = matter(content);

    if (!data.title) return { valid: false, error: 'title이 없습니다' };
    if (!data.date) return { valid: false, error: 'date가 없습니다' };
    if (!data.category) return { valid: false, error: 'category가 없습니다' };
    if (!data.description) return { valid: false, error: 'description이 없습니다' };

    // 본문 최소 길이
    const bodyLength = body.replace(/\s/g, '').length;
    if (bodyLength < 500) {
      return { valid: false, error: `본문이 너무 짧습니다 (${bodyLength}자)` };
    }

    // h2 소제목 확인
    const h2Count = (body.match(/^## /gm) || []).length;
    if (h2Count < 3) {
      return { valid: false, error: `h2 소제목이 ${h2Count}개뿐입니다 (최소 3개)` };
    }

    // 위험한 패턴 체크
    const dangerousPatterns = [/<script/i, /onerror\s*=/i, /onload\s*=/i, /javascript:/i];
    for (const pattern of dangerousPatterns) {
      if (pattern.test(body)) {
        return { valid: false, error: `위험한 패턴 감지: ${pattern}` };
      }
    }

    return { valid: true };
  } catch {
    return { valid: false, error: 'frontmatter 파싱 실패' };
  }
}

async function callWithRetry(
  client: Anthropic,
  prompt: string,
  retries = MAX_RETRIES,
): Promise<string> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const message = await client.messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: 4096,
        messages: [{ role: 'user', content: prompt }],
      });

      const content = message.content[0];
      if (content.type !== 'text') {
        throw new Error('예상치 못한 응답 형식');
      }

      return content.text.trim();
    } catch (err) {
      const isLast = attempt === retries;
      if (isLast) throw err;

      const waitSec = (attempt + 1) * 5;
      console.warn(`  API 호출 실패 (시도 ${attempt + 1}/${retries + 1}), ${waitSec}초 후 재시도...`);
      await new Promise((r) => setTimeout(r, waitSec * 1000));
    }
  }
  throw new Error('unreachable');
}

async function generatePost(options: {
  category?: string;
  count?: number;
  dryRun?: boolean;
} = {}): Promise<void> {
  const { category, count = 1, dryRun = false } = options;

  // API 키 검증
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error('❌ ANTHROPIC_API_KEY 환경변수가 설정되지 않았습니다.');
    console.error('   export ANTHROPIC_API_KEY="sk-ant-..."');
    process.exit(1);
  }

  const client = new Anthropic();
  const db = loadKeywords();
  let generated = 0;

  for (let i = 0; i < count; i++) {
    const picked = pickUnusedKeyword(db, category);
    if (!picked) {
      console.log('사용 가능한 키워드가 없습니다.');
      break;
    }

    console.log(`\n[${i + 1}/${count}] 생성 중: "${picked.entry.keyword}" (${picked.category})`);

    const prompt = buildPrompt(picked.entry.keyword, picked.category, picked.entry.subKeywords);

    let mdxContent: string;
    try {
      mdxContent = await callWithRetry(client, prompt);
    } catch (err) {
      console.error(`  ❌ "${picked.entry.keyword}" 생성 실패:`, err instanceof Error ? err.message : err);
      continue;
    }

    // 생성 결과 검증
    const validation = validateMdx(mdxContent);
    if (!validation.valid) {
      console.error(`  ❌ 검증 실패: ${validation.error}`);
      console.error('  생성된 내용을 건너뜁니다.');
      continue;
    }

    if (dryRun) {
      console.log('\n--- DRY RUN ---');
      console.log(mdxContent);
      console.log('--- END ---\n');
      continue;
    }

    // 파일명 생성
    const date = new Date().toISOString().split('T')[0];
    const slug = slugify(picked.entry.keyword);
    const filename = `${date}-${slug}.mdx`;
    const filePath = path.join(POSTS_DIR, filename);

    // 디렉토리 확인
    if (!fs.existsSync(POSTS_DIR)) {
      fs.mkdirSync(POSTS_DIR, { recursive: true });
    }

    fs.writeFileSync(filePath, mdxContent, 'utf-8');
    console.log(`  ✅ 저장됨: ${filename}`);

    // 키워드 사용 표시
    picked.entry.used = true;
    picked.entry.lastUsedAt = date;
    saveKeywords(db);
    generated++;
  }

  console.log(`\n완료! (${generated}건 생성)`);
}

// CLI 인자 파싱 (직접 인자 + 환경변수 모두 지원)
const args = process.argv.slice(2);
const categoryArg =
  args.find((a) => a.startsWith('--category='))?.split('=')[1] ||
  process.env.INPUT_CATEGORY ||
  undefined;
const countArg = parseInt(
  args.find((a) => a.startsWith('--count='))?.split('=')[1] ||
  process.env.INPUT_COUNT ||
  '1',
  10,
);
const dryRun = args.includes('--dry-run');

generatePost({ category: categoryArg || undefined, count: countArg, dryRun });
