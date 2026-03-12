/**
 * 관리자 인증 및 관리 모듈
 * - 이메일/비밀번호 로그인 (bkend Auth)
 * - 키워드 관리 (keywords 테이블)
 * - 생성 이력 관리 (generation_logs 테이블)
 * - 대시보드 통계
 */

import { bkendAuth, bkendServer, bkendData } from './bkend';
import type { BkendRecord, BkendUser } from './bkend';
import { getAnalyticsStats } from './analytics';

// ---- 타입 ----

export interface Keyword extends BkendRecord {
  keyword: string;
  subKeywords: string[];
  category: string;
  used: boolean;
  lastUsedAt?: string;
  priority: number;
}

export interface GenerationLog extends BkendRecord {
  keyword: string;
  postSlug?: string;
  status: 'success' | 'failed' | 'draft';
  model: string;
  tokensUsed?: number;
  errorMessage?: string;
  generatedAt: string;
}

export interface DashboardStats {
  totalPosts: number;
  totalViews: number;
  todayViews: number;
  recentLogs: GenerationLog[];
  popularPosts: { slug: string; viewCount: number }[];
}

export interface AdminSession {
  user: BkendUser;
  accessToken: string;
  refreshToken: string;
}

// ---- 관리자 인증 ----

/**
 * 관리자 로그인
 * 클라이언트에서 호출 -> API Route /api/admin/auth/signin 을 통해 처리
 */
export async function adminSignin(
  email: string,
  password: string,
): Promise<AdminSession> {
  const res = await bkendAuth.signin(email, password);
  // 토큰 저장 (클라이언트)
  bkendAuth.saveTokens(res.accessToken, res.refreshToken);
  return {
    user: res.user,
    accessToken: res.accessToken,
    refreshToken: res.refreshToken,
  };
}

/**
 * 관리자 로그아웃
 */
export async function adminSignout(): Promise<void> {
  await bkendAuth.signout();
  bkendAuth.clearTokens();
}

/**
 * 현재 관리자 세션 확인 (서버사이드)
 */
export async function getAdminSession(
  accessToken: string,
): Promise<BkendUser | null> {
  try {
    const res = await bkendAuth.me(accessToken);
    return res.user;
  } catch {
    return null;
  }
}

// ---- 키워드 관리 ----

export async function listKeywords(params?: {
  category?: string;
  used?: boolean;
  page?: number;
  limit?: number;
}) {
  const query: Record<string, string | number | boolean | undefined> = {
    page: params?.page ?? 1,
    limit: params?.limit ?? 50,
    sort: 'priority:desc',
  };
  if (params?.category) query['filter[category]'] = params.category;
  if (params?.used !== undefined) query['filter[used]'] = params.used;

  return bkendServer.list<Keyword>('keywords', query);
}

export async function createKeyword(data: {
  keyword: string;
  subKeywords?: string[];
  category: string;
  priority?: number;
}): Promise<Keyword> {
  return bkendServer.create<Keyword>('keywords', {
    keyword: data.keyword,
    subKeywords: data.subKeywords ?? [],
    category: data.category,
    used: false,
    priority: data.priority ?? 0,
  });
}

export async function updateKeyword(
  id: string,
  data: Partial<{
    keyword: string;
    subKeywords: string[];
    category: string;
    used: boolean;
    lastUsedAt: string;
    priority: number;
  }>,
): Promise<Keyword> {
  return bkendServer.update<Keyword>('keywords', id, data as Record<string, unknown>);
}

export async function deleteKeyword(id: string): Promise<void> {
  return bkendServer.delete('keywords', id);
}

/**
 * 다음 사용할 키워드 선택 (미사용 + 우선순위 높은 것)
 */
export async function pickNextKeyword(
  category?: string,
): Promise<Keyword | null> {
  const query: Record<string, string | number | boolean | undefined> = {
    'filter[used]': false,
    sort: 'priority:desc',
    limit: 1,
  };
  if (category) query['filter[category]'] = category;

  const res = await bkendServer.list<Keyword>('keywords', query);
  return res.data[0] ?? null;
}

// ---- 생성 이력 관리 ----

export async function listGenerationLogs(params?: {
  status?: GenerationLog['status'];
  page?: number;
  limit?: number;
}) {
  const query: Record<string, string | number | boolean | undefined> = {
    page: params?.page ?? 1,
    limit: params?.limit ?? 20,
    sort: 'generatedAt:desc',
  };
  if (params?.status) query['filter[status]'] = params.status;

  return bkendServer.list<GenerationLog>('generation_logs', query);
}

export async function createGenerationLog(data: {
  keyword: string;
  postSlug?: string;
  status: GenerationLog['status'];
  model: string;
  tokensUsed?: number;
  errorMessage?: string;
}): Promise<GenerationLog> {
  return bkendServer.create<GenerationLog>('generation_logs', {
    keyword: data.keyword,
    postSlug: data.postSlug,
    status: data.status,
    model: data.model,
    tokensUsed: data.tokensUsed,
    errorMessage: data.errorMessage,
    generatedAt: new Date().toISOString(),
  });
}

// ---- 대시보드 통계 ----

export async function getDashboardStats(): Promise<DashboardStats> {
  const [postsRes, analyticsStats, logsRes] = await Promise.all([
    bkendServer.list('posts', { limit: 1 }),
    getAnalyticsStats(),
    listGenerationLogs({ limit: 5 }),
  ]);

  return {
    totalPosts: postsRes.total,
    totalViews: analyticsStats.totalViews,
    todayViews: analyticsStats.todayViews,
    popularPosts: analyticsStats.popularPosts,
    recentLogs: logsRes.data,
  };
}

// ---- 클라이언트용 관리자 API 헬퍼 ----
// 클라이언트 컴포넌트에서 사용 (API Route 경유)

export const adminApi = {
  signin: async (email: string, password: string) => {
    const res = await fetch('/api/admin/auth/signin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json() as Promise<AdminSession>;
  },

  signout: async () => {
    await fetch('/api/admin/auth/signout', { method: 'POST' });
    bkendAuth.clearTokens();
  },

  getDashboard: async () => {
    const res = await fetch('/api/admin/dashboard');
    if (!res.ok) throw new Error(await res.text());
    return res.json() as Promise<DashboardStats>;
  },

  keywords: {
    list: async (params?: { category?: string; used?: boolean }) => {
      const q = new URLSearchParams();
      if (params?.category) q.set('category', params.category);
      if (params?.used !== undefined) q.set('used', String(params.used));
      const res = await fetch(`/api/admin/keywords?${q}`);
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    create: async (data: { keyword: string; subKeywords?: string[]; category: string; priority?: number }) => {
      const res = await fetch('/api/admin/keywords', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    update: async (id: string, data: Partial<Keyword>) => {
      const res = await fetch(`/api/admin/keywords/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    delete: async (id: string) => {
      const res = await fetch(`/api/admin/keywords/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error(await res.text());
    },
  },

  logs: {
    list: async (params?: { status?: GenerationLog['status'] }) => {
      const q = new URLSearchParams();
      if (params?.status) q.set('status', params.status);
      const res = await fetch(`/api/admin/logs?${q}`);
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
  },
};
