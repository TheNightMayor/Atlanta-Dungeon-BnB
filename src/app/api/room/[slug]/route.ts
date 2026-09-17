import { NextResponse } from 'next/server';
import { getRoom } from '@/libs/apis';

export async function GET(_req: Request, { params }: { params: Promise<{ slug?: string }> }) {
  const { slug } = await params;
  if (!slug) {
    return new NextResponse('Missing room slug', { status: 400 });
  }
  try {
    const room = await getRoom(slug);
    return NextResponse.json(room);
  } catch (err) {
    console.error('Failed to load room in API route', err);
    return new NextResponse('Failed to load room', { status: 500 });
  }
}
