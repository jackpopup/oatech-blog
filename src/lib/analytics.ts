/**
 * 조회수 및 분석 트래킹 모듈
 * - 클라이언트: POST /api/analytics/view
 * - 서버: bkend post_views 테이블 직접 접근
 */

import { bkendServer } from './bkend';
import type { BkendRecord } from './bkend';

// ---- 타입 ----

export interface PostView extends BkendRecord {
  postSlug: string;
  viewedAt: string;
  referrer: string;
  userAgent: string;
}

export interface PopularPost {
  slug: string;
  viewCount: number;
}

export interface AnalyticsStats {
  totalViews: number;
  todayViews: number;
  popularPosts: PopularPost[];
}

// ---- 클라이언트 측 조회 기록 ----

/**
 * 클라이언트에서 호출: API Route를 통해 조회수 기록
 */
export async function trackView(postSlug: string): Promise<void> {
  try {
    await fetch('/api/analytics/view', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        postSlug,
        referrer: typeof document !== 'undefined' ? document.referrer : '',
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
      }),
    });
  } catch {
    // 조회수 실패는 무시 (사용자 경험에 영향 없음)
  }
}

// ---- 서버 측 함수 ----

/**
 * 조회수 기록 (서버사이드 / API Route에서 호출)
 */
export async function recordView(params: {
  postSlug: string;
  referrer?: string;
  userAgent?: string;
}): Promise<void> {
  await bkendServer.create<PostView>('post_views', {
    postSlug: params.postSlug,
    viewedAt: new Date().toISOString(),
    referrer: params.referrer || '',
    userAgent: params.userAgent || '',
  });
}

/**
 * 특정 포스트 조회수 가져오기
 */
export async function getViewCount(postSlug: string): Promise<number> {
  const res = await bkendServer.list<PostView>('post_views', {
    'filter[postSlug]': postSlug,
    limit: 1,
  });
  return res.total;
}

/**
 * 인기글 순위 조회 (상위 N개)
 */
export async function getPopularPosts(limit = 10): Promise<PopularPost[]> {
  // 전체 조회 데이터 집계 (최근 30일)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const res = await bkendServer.list<PostView>('post_views', {
    limit: 1000,
    sort: 'viewedAt:desc',
  });

  // 슬러그별 카운트 집계
  const countMap = new Map<string, number>();
  for (const view of res.data) {
    const count = countMap.get(view.postSlug) || 0;
    countMap.set(view.postSlug, count + 1);
  }

  // 정렬 후 상위 N개 반환
  return Array.from(countMap.entries())
    .map(([slug, viewCount]) => ({ slug, viewCount }))
    .sort((a, b) => b.viewCount - a.viewCount)
    .slice(0, limit);
}

/**
 * 전체 분석 통계
 */
export async function getAnalyticsStats(): Promise<AnalyticsStats> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [totalRes, popularPosts] = await Promise.all([
    bkendServer.list<PostView>('post_views', { limit: 1 }),
    getPopularPosts(5),
  ]);

  // 오늘 조회수 (API 필터 미지원 시 클라이언트 필터)
  const todayRes = await bkendServer.list<PostView>('post_views', {
    limit: 1000,
    sort: 'viewedAt:desc',
  });
  const todayViews = todayRes.data.filter(
    (v) => new Date(v.viewedAt) >= today,
  ).length;

  return {
    totalViews: totalRes.total,
    todayViews,
    popularPosts,
  };
}
