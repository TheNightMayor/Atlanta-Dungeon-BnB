import { NextResponse } from 'next/server';
import { getAvailability } from '@/libs/availability';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const availability = await getAvailability();
    return NextResponse.json(
      { blockedDates: availability.blockedDates },
      { headers: { 'Cache-Control': 'no-store, max-age=0' } }
    );
  } catch (error: any) {
    console.error('Availability check failed:', error);
    return NextResponse.json({ error: error?.message || 'Availability is temporarily unavailable' }, { status: 503 });
  }
}