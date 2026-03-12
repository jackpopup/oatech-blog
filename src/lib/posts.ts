/**
 * 포스트 관리 모듈
 * - Primary: bkend.ai posts 테이블
 * - Fallback: 로컬 content/posts/*.mdx 파일시스템
 *
 * NEXT_PUBLIC_BKEND_PROJECT_ID 환경변수가 설정된 경우 bkend 사용,
 * 미설정 시 파일시스템 fallback으로 동작합니다.
 */

import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { postFrontmatterSchema } from './types';
import type { Post } from './types';
import { bkendServer } from './bkend';
import type { BkendRecord } from './bkend';

// bkend posts 테이블 레코드 타입
interface BkendPost extends BkendRecord {
  title: string;
  date: string;
  category: string;
  tags: string[];
  description: string;
  thumbnail?: string;
  draft?: boolean;
  slug: string;
  content: string;
  readingTime: number;
}

// bkend를 사용할지 여부
function useBkend(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_BKEND_PROJECT_ID);
}

// bkend 레코드를 Post 타입으로 변환
function bkendRecordToPost(record: BkendPost): Post {
  return {
    title: record.title,
    date: record.date,
    category: record.category as Post['category'],
    tags: record.tags ?? [],
    description: record.description,
    thumbnail: record.thumbnail,
    draft: record.draft ?? false,
    slug: record.slug,
    content: record.content,
    readingTime: record.readingTime,
  };
}

// ---- 파일시스템 fallback ----

const POSTS_DIR = path.join(process.cwd(), 'content', 'posts');

function calculateReadingTime(content: string): number {
  const charCount = content.replace(/\s/g, '').length;
  return Math.max(1, Math.ceil(charCount / 500));
}

function getAllPostsFromFs(): Post[] {
  if (!fs.existsSync(POSTS_DIR)) return [];

  const files = fs.readdirSync(POSTS_DIR).filter((f) => f.endsWith('.mdx'));

  const posts = files
    .map((filename) => {
      const filePath = path.join(POSTS_DIR, filename);
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      const { data, content } = matter(fileContent);

      const parsed = postFrontmatterSchema.safeParse(data);
      if (!parsed.success) {
        console.warn(`Invalid frontmatter in ${filename}:`, parsed.error.issues);
        return null;
      }

      const frontmatter = parsed.data;
      if (frontmatter.draft) return null;

      const slug = filename.replace(/\.mdx$/, '');
      return { ...frontmatter, slug, content, readingTime: calculateReadingTime(content) };
    })
    .filter((post): post is Post => post !== null);

  return posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

function getPostBySlugFromFs(slug: string): Post | null {
  if (/[^a-zA-Z0-9가-힣\-_]/.test(slug)) return null;

  const filePath = path.join(POSTS_DIR, `${slug}.mdx`);
  if (!fs.existsSync(filePath)) return null;

  const fileContent = fs.readFileSync(filePath, 'utf-8');
  const { data, content } = matter(fileContent);

  const parsed = postFrontmatterSchema.safeParse(data);
  if (!parsed.success) return null;

  const frontmatter = parsed.data;
  if (frontmatter.draft) return null;

  return { ...frontmatter, slug, content, readingTime: calculateReadingTime(content) };
}

// ---- bkend API 기반 함수 ----

async function getAllPostsFromBkend(): Promise<Post[]> {
  try {
    const res = await bkendServer.list<BkendPost>('posts', {
      'filter[draft]': false,
      sort: 'date:desc',
      limit: 100,
    });
    return res.data.map(bkendRecordToPost);
  } catch (err) {
    console.warn('[posts] bkend 조회 실패, fallback 사용:', err);
    return getAllPostsFromFs();
  }
}

async function getPostBySlugFromBkend(slug: string): Promise<Post | null> {
  if (/[^a-zA-Z0-9가-힣\-_]/.test(slug)) return null;

  try {
    const res = await bkendServer.list<BkendPost>('posts', {
      'filter[slug]': slug,
      'filter[draft]': false,
      limit: 1,
    });
    if (res.data.length === 0) return null;
    return bkendRecordToPost(res.data[0]);
  } catch (err) {
    console.warn('[posts] bkend 조회 실패, fallback 사용:', err);
    return getPostBySlugFromFs(slug);
  }
}

// ---- bkend 포스트 저장 (서버 전용) ----

/**
 * MDX 파일을 bkend에 동기화 (scripts/generate.ts 등에서 호출)
 */
export async function syncPostToBkend(post: Post): Promise<BkendPost> {
  // 기존 포스트 확인
  const existing = await bkendServer.list<BkendPost>('posts', {
    'filter[slug]': post.slug,
    limit: 1,
  });

  const payload = {
    title: post.title,
    date: post.date,
    category: post.category,
    tags: post.tags,
    description: post.description,
    thumbnail: post.thumbnail,
    draft: post.draft ?? false,
    slug: post.slug,
    content: post.content,
    readingTime: post.readingTime,
  };

  if (existing.data.length > 0) {
    return bkendServer.update<BkendPost>('posts', existing.data[0].id, payload);
  } else {
    return bkendServer.create<BkendPost>('posts', payload);
  }
}

/**
 * bkend에서 포스트 삭제
 */
export async function deletePostFromBkend(slug: string): Promise<void> {
  const existing = await bkendServer.list<BkendPost>('posts', {
    'filter[slug]': slug,
    limit: 1,
  });
  if (existing.data.length > 0) {
    await bkendServer.delete('posts', existing.data[0].id);
  }
}

// ---- 공개 API (기존 인터페이스 유지) ----

/**
 * 모든 발행된 포스트 목록
 * bkend 연동 시: bkend API 사용
 * 미연동 시: 파일시스템 fallback
 */
export async function getAllPosts(): Promise<Post[]> {
  if (useBkend()) {
    return getAllPostsFromBkend();
  }
  return getAllPostsFromFs();
}

/**
 * slug로 단건 조회
 */
export async function getPostBySlug(slug: string): Promise<Post | null> {
  if (useBkend()) {
    return getPostBySlugFromBkend(slug);
  }
  return getPostBySlugFromFs(slug);
}

/**
 * 카테고리별 포스트 목록
 */
export async function getPostsByCategory(category: string): Promise<Post[]> {
  if (useBkend()) {
    try {
      const res = await bkendServer.list<BkendPost>('posts', {
        'filter[category]': category,
        'filter[draft]': false,
        sort: 'date:desc',
        limit: 100,
      });
      return res.data.map(bkendRecordToPost);
    } catch {
      return getAllPostsFromFs().filter((p) => p.category === category);
    }
  }
  return getAllPostsFromFs().filter((p) => p.category === category);
}

/**
 * 모든 슬러그 목록 (generateStaticParams용)
 */
export async function getAllSlugs(): Promise<string[]> {
  if (useBkend()) {
    try {
      const res = await bkendServer.list<BkendPost>('posts', {
        'filter[draft]': false,
        limit: 500,
      });
      return res.data.map((p) => p.slug);
    } catch {
      return getAllSlugsFallback();
    }
  }
  return getAllSlugsFallback();
}

function getAllSlugsFallback(): string[] {
  if (!fs.existsSync(POSTS_DIR)) return [];
  return fs
    .readdirSync(POSTS_DIR)
    .filter((f) => f.endsWith('.mdx'))
    .map((f) => f.replace(/\.mdx$/, ''));
}

/**
 * 사용된 카테고리 목록
 */
export async function getAllCategories(): Promise<string[]> {
  const posts = await getAllPosts();
  return [...new Set(posts.map((p) => p.category))];
}
