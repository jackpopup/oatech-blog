import type { Category } from './types';

export const SITE_CONFIG = {
  name: '오아테크 블로그',
  description: '중소숙박업 운영자와 창업 준비자를 위한 전문 블로그',
  url: 'https://blog.oatech.co',
  ogImage: '/images/og-default.png',
  author: '오아테크',
  company: {
    name: '오아테크',
    url: 'https://oatech.co',
    cta: '무료 상담 신청하기',
  },
} as const;

export const CATEGORIES: Record<Category, { label: string; description: string; gradient: string }> = {
  '운영팁': { label: '운영팁', description: '숙박업 운영에 필요한 실전 노하우', gradient: 'from-indigo-500 to-violet-500' },
  '창업가이드': { label: '창업가이드', description: '숙박업 창업을 위한 단계별 가이드', gradient: 'from-emerald-500 to-teal-500' },
  '트렌드': { label: '트렌드', description: '숙박업계 최신 트렌드와 전망', gradient: 'from-orange-500 to-rose-500' },
  '사례': { label: '사례', description: '성공적인 숙박업 운영 사례', gradient: 'from-blue-500 to-cyan-500' },
};

export const POSTS_PER_PAGE = 9;

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}
