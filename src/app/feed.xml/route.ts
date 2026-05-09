import { getPublishedPosts } from '@/lib/queries';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  const posts = await getPublishedPosts({ limit: 50 });
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://example.com';
  const items = posts.map((p) => {
    const slug = p.category.toLowerCase();
    return `
    <item>
      <title><![CDATA[${p.title}]]></title>
      <link>${base}/${slug}/${p.slug}</link>
      <guid>${base}/${slug}/${p.slug}</guid>
      <pubDate>${p.publishedAt ? new Date(p.publishedAt).toUTCString() : new Date(p.createdAt).toUTCString()}</pubDate>
      <category>${p.category}</category>
      <description><![CDATA[${p.excerpt ?? ''}]]></description>
    </item>`;
  }).join('');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"><channel>
  <title>kh.log</title>
  <link>${base}</link>
  <description>TRY · TEST · TIDY</description>
  <language>ko</language>
  ${items}
</channel></rss>`;

  return new Response(xml, { headers: { 'content-type': 'application/rss+xml; charset=utf-8' } });
}
