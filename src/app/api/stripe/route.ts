import Stripe from 'stripe';

import { authOptions } from '@/libs/auth';
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { getRoom } from '@/libs/apis';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2025-02-24.acacia',
});

type RequestData = {
  checkinDate: string;
  checkoutDate: string;
  adults: number;
  children: number;
  numberOfDays: number;
  hotelRoomSlug: string;
  price: number;
  flatFee: number;
  discount: number;
};

export async function POST(req: Request) {
  const {
    checkinDate,
    adults,
    checkoutDate,
    children,
    hotelRoomSlug,
    numberOfDays,
    price,
    flatFee,
    discount,
  }: RequestData = await req.json();

  if (
    !checkinDate ||
    (numberOfDays > 1 && !checkoutDate) ||
    adults == null ||
    !hotelRoomSlug ||
    numberOfDays == null ||
    price == null ||
    flatFee == null ||
    discount == null
  ) {
    return new NextResponse('Please all fields are required', { status: 400 });
  }

  const originHeader = req.headers.get('origin');
  const origin =
    typeof originHeader === 'string' && originHeader.startsWith('http')
      ? originHeader
      : process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  const session = await getServerSession(authOptions);

  if (!session?.user?.name) {
    return new NextResponse('Authentication Required', { status: 400 });
  }
  const userId = (session.user as any).id ?? session.user.name;
  const formattedCheckinDate = checkinDate.split('T')[0];
  const formattedCheckoutDate = checkoutDate ? checkoutDate.split('T')[0] : formattedCheckinDate;

  try {
    const room = await getRoom(hotelRoomSlug);
    const discountPrice = price - (price / 100) * discount;
    const subtotal = discountPrice * numberOfDays;
    const extraGuestCharge = adults > 2 ? (adults - 2) * 30 : 0;
    const calculatedTotal = subtotal + extraGuestCharge + flatFee;

    // Create a stripe payment
    const stripeSession = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: 'usd',
            product_data: {
              name: room.name,
              images: room.images.map(image => image.url),
            },
            unit_amount: Math.round(calculatedTotal * 100),
          },
        },
      ],
      payment_method_types: ['card'],
      success_url: `${origin}/users/${encodeURIComponent(
        session.user?.name ?? userId
      )}`,
      cancel_url: `${origin}/rooms/${encodeURIComponent(hotelRoomSlug)}`,
      metadata: {
        adults,
        checkinDate: formattedCheckinDate,
        checkoutDate: formattedCheckoutDate,
        children,
        hotelRoom: room._id,
        numberOfDays,
        user: userId,
        discount,
        totalPrice: calculatedTotal,
      },
    });

    return NextResponse.json(stripeSession, {
      status: 200,
      statusText: 'Payment session created',
    });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.log('Payment falied', error);
    return new NextResponse(error, { status: 500 });
  }
}