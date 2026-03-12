import type { MetadataRoute } from 'next';
import { getAllPosts, getAllCategories } from '@/lib/posts';
import { SITE_CONFIG } from '@/lib/constants';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [posts, categories] = await Promise.all([getAllPosts(), getAllCategories()]);

  const blogUrls = posts.map((post) => ({
    url: `${SITE_CONFIG.url}/blog/${post.slug}`,
    lastModified: new Date(post.date),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  const categoryUrls = categories.map((category) => ({
    url: `${SITE_CONFIG.url}/category/${encodeURIComponent(category)}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }));

  return [
    {
      url: SITE_CONFIG.url,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    ...categoryUrls,
    ...blogUrls,
  ];
}
