import type { Metadata } from 'next';
import { SITE_CONFIG } from '@/lib/constants';
import type { Post } from '@/lib/types';

export function generatePostMetadata(post: Post): Metadata {
  const url = `${SITE_CONFIG.url}/blog/${post.slug}`;

  return {
    title: post.title,
    description: post.description,
    keywords: post.tags,
    authors: [{ name: SITE_CONFIG.author }],
    openGraph: {
      title: post.title,
      description: post.description,
      type: 'article',
      url,
      siteName: SITE_CONFIG.name,
      locale: 'ko_KR',
      publishedTime: post.date,
      authors: [SITE_CONFIG.author],
      images: [{ url: post.thumbnail || SITE_CONFIG.ogImage, width: 1200, height: 630 }],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.description,
      images: [post.thumbnail || SITE_CONFIG.ogImage],
    },
    alternates: { canonical: url },
  };
}

export function generateCategoryMetadata(category: string): Metadata {
  const url = `${SITE_CONFIG.url}/category/${encodeURIComponent(category)}`;
  const description = `${category} 카테고리의 숙박업 전문 블로그 글 모음 — 펜션, 모텔, 게스트하우스 운영 노하우`;

  return {
    title: category,
    description,
    openGraph: {
      title: `${category} | ${SITE_CONFIG.name}`,
      description,
      url,
      siteName: SITE_CONFIG.name,
      locale: 'ko_KR',
    },
    twitter: {
      card: 'summary',
      title: `${category} | ${SITE_CONFIG.name}`,
      description,
    },
    alternates: { canonical: url },
  };
}

export function generateArticleJsonLd(post: Post) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    author: {
      '@type': 'Organization',
      name: SITE_CONFIG.author,
      url: SITE_CONFIG.company.url,
    },
    publisher: {
      '@type': 'Organization',
      name: SITE_CONFIG.company.name,
      url: SITE_CONFIG.company.url,
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${SITE_CONFIG.url}/blog/${post.slug}`,
    },
    keywords: post.tags.join(', '),
  };
}
