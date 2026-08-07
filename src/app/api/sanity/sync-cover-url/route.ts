import { NextResponse } from 'next/server';
import sanityClient from '@/libs/sanity';

export async function GET() {
  try {
    const docs = await sanityClient.fetch(
      `*[_type == "hotelRoom"]{_id, slug, coverImage{image{asset-> { _id, url }}}}`
    );

    return NextResponse.json({ docs });
  } catch (error) {
    console.error('Sync cover URL error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch hotel rooms' },
      { status: 500 }
    );
  }
}
