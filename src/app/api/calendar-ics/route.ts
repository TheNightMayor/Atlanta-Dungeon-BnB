import { NextResponse } from 'next/server';
import { fetchCalendarEvents } from '@/libs/availability';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    return NextResponse.json(await fetchCalendarEvents(), {
      headers: { 'Cache-Control': 'no-store, max-age=0' },
    });
  } catch (err: any) {
    console.error('Failed to load external calendar:', err);
    return NextResponse.json({ error: err.message || String(err) }, { status: 503 });
  }
}
