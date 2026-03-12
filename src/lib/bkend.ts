/**
 * bkend.ai Service API 클라이언트
 * API Key: pk_f5c21ec2c0b1114385e45bf8e325eff791908a311da56b799e7dccea9aa4958f
 */

const API_BASE =
  process.env.NEXT_PUBLIC_BKEND_API_URL || 'https://api-client.bkend.ai/v1';
const PROJECT_ID = process.env.NEXT_PUBLIC_BKEND_PROJECT_ID || '';
const ENVIRONMENT =
  (process.env.NEXT_PUBLIC_BKEND_ENV as 'dev' | 'staging' | 'prod') || 'dev';
const API_KEY = process.env.BKEND_API_KEY || '';

// ---- 타입 정의 ----

export interface BkendRecord {
  id: string;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
  [key: string]: unknown;
}

export interface BkendListResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export interface BkendListParams {
  page?: number;
  limit?: number;
  sort?: string;
  search?: string;
  [key: string]: string | number | boolean | undefined;
}

export interface BkendError {
  status: number;
  message: string;
}

// ---- 내부 fetch 헬퍼 ----

type FetchHeaders = Record<string, string>;

async function bkendFetch<T>(
  path: string,
  options: RequestInit = {},
  accessToken?: string,
): Promise<T> {
  const headers: FetchHeaders = {
    'Content-Type': 'application/json',
    'x-project-id': PROJECT_ID,
    'x-environment': ENVIRONMENT,
  };

  // 서버사이드: API Key 사용
  // 클라이언트사이드: localStorage 토큰 우선, 없으면 API Key
  const token =
    accessToken ||
    (typeof window !== 'undefined'
      ? localStorage.getItem('bkend_access_token') || API_KEY
      : API_KEY);

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      ...headers,
      ...(options.headers as FetchHeaders),
    },
  });

  if (res.status === 401) {
    // 토큰 만료 시 refresh 시도
    const refreshed = await tryRefreshToken();
    if (refreshed) {
      // 재시도
      headers['Authorization'] = `Bearer ${refreshed}`;
      const retryRes = await fetch(`${API_BASE}${path}`, {
        ...options,
        headers: { ...headers, ...(options.headers as FetchHeaders) },
      });
      if (!retryRes.ok) {
        const errText = await retryRes.text();
        throw { status: retryRes.status, message: errText } as BkendError;
      }
      if (retryRes.status === 204) return undefined as T;
      return retryRes.json() as Promise<T>;
    }
  }

  if (!res.ok) {
    const errText = await res.text();
    throw { status: res.status, message: errText } as BkendError;
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

async function tryRefreshToken(): Promise<string | null> {
  if (typeof window === 'undefined') return null;
  const refreshToken = localStorage.getItem('bkend_refresh_token');
  if (!refreshToken) return null;

  try {
    const res = await fetch(`${API_BASE}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-project-id': PROJECT_ID,
        'x-environment': ENVIRONMENT,
      },
      body: JSON.stringify({ refreshToken }),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { accessToken: string; refreshToken?: string };
    localStorage.setItem('bkend_access_token', data.accessToken);
    if (data.refreshToken) {
      localStorage.setItem('bkend_refresh_token', data.refreshToken);
    }
    return data.accessToken;
  } catch {
    return null;
  }
}

// ---- Auth API ----

export interface BkendUser {
  id: string;
  email: string;
  role: string;
  createdAt: string;
}

export interface SigninResponse {
  user: BkendUser;
  accessToken: string;
  refreshToken: string;
}

export const bkendAuth = {
  signup: (email: string, password: string) =>
    bkendFetch<SigninResponse>('/auth/email/signup', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  signin: (email: string, password: string) =>
    bkendFetch<SigninResponse>('/auth/email/signin', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  me: (accessToken?: string) =>
    bkendFetch<{ user: BkendUser }>('/auth/me', {}, accessToken),

  refresh: (refreshToken: string) =>
    bkendFetch<{ accessToken: string; refreshToken: string }>('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    }),

  signout: () =>
    bkendFetch<void>('/auth/signout', { method: 'POST' }),

  // 클라이언트 토큰 저장 헬퍼
  saveTokens: (accessToken: string, refreshToken: string) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem('bkend_access_token', accessToken);
    localStorage.setItem('bkend_refresh_token', refreshToken);
  },

  clearTokens: () => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('bkend_access_token');
    localStorage.removeItem('bkend_refresh_token');
  },

  getAccessToken: (): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('bkend_access_token');
  },
};

// ---- Data CRUD API ----

function buildQuery(params?: BkendListParams): string {
  if (!params) return '';
  const q = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null) q.set(k, String(v));
  });
  const str = q.toString();
  return str ? `?${str}` : '';
}

export const bkendData = {
  list: <T extends BkendRecord>(table: string, params?: BkendListParams, token?: string) =>
    bkendFetch<BkendListResponse<T>>(
      `/data/${table}${buildQuery(params)}`,
      {},
      token,
    ),

  get: <T extends BkendRecord>(table: string, id: string, token?: string) =>
    bkendFetch<T>(`/data/${table}/${id}`, {}, token),

  create: <T extends BkendRecord>(table: string, body: Record<string, unknown>, token?: string) =>
    bkendFetch<T>(`/data/${table}`, {
      method: 'POST',
      body: JSON.stringify(body),
    }, token),

  update: <T extends BkendRecord>(
    table: string,
    id: string,
    body: Record<string, unknown>,
    token?: string,
  ) =>
    bkendFetch<T>(`/data/${table}/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    }, token),

  delete: (table: string, id: string, token?: string) =>
    bkendFetch<void>(`/data/${table}/${id}`, { method: 'DELETE' }, token),
};

// ---- 서버사이드 전용 클라이언트 (API Key 사용) ----
// 서버 컴포넌트, API Route에서 사용
export const bkendServer = {
  list: <T extends BkendRecord>(table: string, params?: BkendListParams) =>
    bkendData.list<T>(table, params, API_KEY),

  get: <T extends BkendRecord>(table: string, id: string) =>
    bkendData.get<T>(table, id, API_KEY),

  create: <T extends BkendRecord>(table: string, body: Record<string, unknown>) =>
    bkendData.create<T>(table, body, API_KEY),

  update: <T extends BkendRecord>(table: string, id: string, body: Record<string, unknown>) =>
    bkendData.update<T>(table, id, body, API_KEY),

  delete: (table: string, id: string) =>
    bkendData.delete(table, id, API_KEY),
};
