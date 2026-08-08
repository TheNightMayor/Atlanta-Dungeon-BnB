import { NextResponse } from 'next/server';
import { siteUrl } from '@/libs/seo';

export function GET() {
  const body = `User-agent: *\nAllow: /\nSitemap: ${siteUrl.origin}/sitemap.xml\n`;
  return new NextResponse(body, {
    headers: {
      'Content-Type': 'text/plain',
    },
  });
}
