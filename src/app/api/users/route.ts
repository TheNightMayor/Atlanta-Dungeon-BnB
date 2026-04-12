import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';

import { authOptions } from '@/libs/auth';
import {
  checkReviewExists,
  createReview,
  getUserData,
  updateReview,
} from '@/libs/apis';

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.name) {
    return new NextResponse('Authentication Required', { status: 500 });
  }

  const userId = (session.user as any).id ?? session.user.name;

  try {
    const data = await getUserData(userId);
    return NextResponse.json(data, { status: 200, statusText: 'Successful' });
  } catch (error) {
    return new NextResponse('Unable to fetch', { status: 400 });
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.name) {
    return new NextResponse('Authentication Required', { status: 500 });
  }

  const { roomId, reviewText, ratingValue } = await req.json();

  if (!roomId || !reviewText || !ratingValue) {
    return new NextResponse('All fields are required', { status: 400 });
  }

  const userId = (session.user as any).id ?? session.user.name;

  try {
    const alreadyExists = await checkReviewExists(userId, roomId);

    let data;

    if (alreadyExists) {
      data = await updateReview({
        reviewId: alreadyExists._id,
        reviewText,
        userRating: ratingValue,
      });
    } else {
      data = await createReview({
        hotelRoomId: roomId,
        reviewText,
        userId,
        userRating: ratingValue,
      });
    }

    return NextResponse.json(data, { status: 200, statusText: 'Successful' });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error('Error Updating', error);
    return new NextResponse('Unable to create review', { status: 400 });
  }
}