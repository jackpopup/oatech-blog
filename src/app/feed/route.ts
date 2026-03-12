import { getAllPosts } from '@/lib/posts';
import { SITE_CONFIG } from '@/lib/constants';

export async function GET() {
  const posts = await getAllPosts();

  const items = posts
    .map(
      (post) => `
    <item>
      <title><![CDATA[${post.title}]]></title>
      <link>${SITE_CONFIG.url}/blog/${post.slug}</link>
      <guid isPermaLink="true">${SITE_CONFIG.url}/blog/${post.slug}</guid>
      <description><![CDATA[${post.description}]]></description>
      <pubDate>${new Date(post.date).toUTCString()}</pubDate>
      <category>${post.category}</category>
    </item>`
    )
    .join('');

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${SITE_CONFIG.name}</title>
    <link>${SITE_CONFIG.url}</link>
    <description>${SITE_CONFIG.description}</description>
    <language>ko</language>
    <atom:link href="${SITE_CONFIG.url}/feed" rel="self" type="application/rss+xml"/>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    ${items}
  </channel>
</rss>`;

  return new Response(rss, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}
