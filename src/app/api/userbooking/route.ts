import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions } from '@/libs/auth';
import { getUserBookings } from '@/libs/apis';
import { getSessionUserId } from '@/libs/session';

export async function GET() {
  const session = await getServerSession(authOptions);

  const userId = getSessionUserId(session);
  if (!userId) {
    return new NextResponse('Authentication Required', { status: 401 });
  }

  try {
    const bookings = await getUserBookings(userId);
    return NextResponse.json(bookings, { status: 200 });
  } catch (error) {
    console.error('Unable to fetch user bookings', error);
    return new NextResponse('Unable to fetch user bookings', { status: 500 });
  }
}
