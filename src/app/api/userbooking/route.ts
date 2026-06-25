import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions } from '@/libs/auth';
import { getUserBookings } from '@/libs/apis';

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id && !session?.user?.name) {
    return new NextResponse('Authentication Required', { status: 401 });
  }

  const userId = (session.user as any).id ?? session.user.name;

  try {
    const bookings = await getUserBookings(userId);
    return NextResponse.json(bookings, { status: 200 });
  } catch (error) {
    console.error('Unable to fetch user bookings', error);
    return new NextResponse('Unable to fetch user bookings', { status: 500 });
  }
}
