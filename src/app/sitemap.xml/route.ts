import { NextResponse } from 'next/server';
import { getRooms } from '@/libs/apis';
import { siteUrl } from '@/libs/seo';

const staticUrls = [
  { path: '/', priority: '1.00', changefreq: 'daily' },
  { path: '/rooms', priority: '0.80', changefreq: 'weekly' },
  { path: '/about', priority: '0.70', changefreq: 'monthly' },
  { path: '/contact', priority: '0.50', changefreq: 'monthly' },
];

export async function GET() {
  const rooms = await getRooms();
  const roomUrls = rooms
    .filter(room => room.slug?.current)
    .map(room => ({
      path: `/rooms/${room.slug.current}`,
      priority: '0.80',
      changefreq: 'weekly',
    }));

  const urls = [...staticUrls, ...roomUrls];
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls
    .map(
      ({ path, priority, changefreq }) =>
        `  <url>\n    <loc>${siteUrl.origin}${path}</loc>\n    <changefreq>${changefreq}</changefreq>\n    <priority>${priority}</priority>\n  </url>`
    )
    .join('\n')}\n</urlset>`;

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml',
    },
  });
}
