/**
 * MDX 콘텐츠 검증 스크립트
 * - CI에서 생성된 MDX 파일의 품질을 자동 검증
 * - 단독 실행: npx tsx scripts/validate-mdx.ts
 * - 특정 파일: npx tsx scripts/validate-mdx.ts content/posts/2026-03-12-xxx.mdx
 */
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const POSTS_DIR = path.join(process.cwd(), 'content', 'posts');

const DANGEROUS_PATTERNS = [
  { pattern: /<script/i, name: '<script> 태그' },
  { pattern: /onerror\s*=/i, name: 'onerror 핸들러' },
  { pattern: /onload\s*=/i, name: 'onload 핸들러' },
  { pattern: /onclick\s*=/i, name: 'onclick 핸들러' },
  { pattern: /javascript:/i, name: 'javascript: URL' },
  { pattern: /\{[\s]*\([\s]*\(\)/, name: 'IIFE 표현식' },
  { pattern: /<iframe/i, name: '<iframe> 태그' },
  { pattern: /<object/i, name: '<object> 태그' },
  { pattern: /<embed/i, name: '<embed> 태그' },
];

interface ValidationResult {
  file: string;
  errors: string[];
  warnings: string[];
}

function validateFile(filePath: string): ValidationResult {
  const file = path.basename(filePath);
  const errors: string[] = [];
  const warnings: string[] = [];

  const raw = fs.readFileSync(filePath, 'utf-8');

  // frontmatter 파싱
  if (!raw.startsWith('---')) {
    errors.push('frontmatter가 없습니다');
    return { file, errors, warnings };
  }

  let data: Record<string, unknown>;
  let body: string;
  try {
    const parsed = matter(raw);
    data = parsed.data;
    body = parsed.content;
  } catch {
    errors.push('frontmatter 파싱 실패');
    return { file, errors, warnings };
  }

  // 필수 필드 확인
  if (!data.title) errors.push('title 누락');
  if (!data.date) errors.push('date 누락');
  if (!data.category) errors.push('category 누락');
  if (!data.description) errors.push('description 누락');

  // description 길이
  if (typeof data.description === 'string' && data.description.length > 200) {
    warnings.push(`description이 너무 깁니다 (${data.description.length}자, 권장 160자 이내)`);
  }

  // 본문 길이
  const bodyLength = body.replace(/\s/g, '').length;
  if (bodyLength < 500) {
    errors.push(`본문이 너무 짧습니다 (${bodyLength}자, 최소 500자)`);
  } else if (bodyLength < 800) {
    warnings.push(`본문이 다소 짧습니다 (${bodyLength}자, 권장 1000자 이상)`);
  }

  // h2 소제목 수
  const h2Count = (body.match(/^## /gm) || []).length;
  if (h2Count < 3) {
    warnings.push(`h2 소제목이 ${h2Count}개입니다 (권장 4~6개)`);
  }

  // 위험 패턴
  for (const { pattern, name } of DANGEROUS_PATTERNS) {
    if (pattern.test(body)) {
      errors.push(`위험한 패턴 감지: ${name}`);
    }
  }

  // InlineCTA 확인
  if (!body.includes('<InlineCTA')) {
    warnings.push('<InlineCTA /> 컴포넌트가 없습니다');
  }

  return { file, errors, warnings };
}

// 실행
const targetFile = process.argv[2];
let files: string[];

if (targetFile) {
  files = [path.resolve(targetFile)];
} else {
  if (!fs.existsSync(POSTS_DIR)) {
    console.log('content/posts/ 디렉토리가 없습니다.');
    process.exit(0);
  }
  files = fs
    .readdirSync(POSTS_DIR)
    .filter((f) => f.endsWith('.mdx'))
    .map((f) => path.join(POSTS_DIR, f));
}

let hasErrors = false;

for (const file of files) {
  const result = validateFile(file);

  if (result.errors.length === 0 && result.warnings.length === 0) {
    console.log(`✅ ${result.file}`);
    continue;
  }

  if (result.errors.length > 0) {
    hasErrors = true;
    console.error(`❌ ${result.file}`);
    result.errors.forEach((e) => console.error(`   ERROR: ${e}`));
  } else {
    console.warn(`⚠️  ${result.file}`);
  }
  result.warnings.forEach((w) => console.warn(`   WARN: ${w}`));
}

if (hasErrors) {
  console.error('\n검증 실패. 위 에러를 수정하세요.');
  process.exit(1);
} else {
  console.log('\n모든 MDX 파일 검증 통과.');
}
