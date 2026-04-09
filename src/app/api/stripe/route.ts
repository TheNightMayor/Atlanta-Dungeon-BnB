import Stripe from 'stripe';

import { authOptions } from '@/libs/auth';
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { getRoom } from '@/libs/apis';
import sanityClient from '@/libs/sanity';

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
  discountCode?: string | null;
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
    discountCode,
  }: RequestData = await req.json();

  if (
    !checkinDate ||
    (numberOfDays > 1 && !checkoutDate) ||
    adults == null ||
    !hotelRoomSlug ||
    numberOfDays == null ||
    price == null ||
    flatFee == null
  ) {
    return new NextResponse('Please all required fields are provided', { status: 400 });
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

    // handle optional discount code validation and calculation
    let appliedDiscountPerNight = 0; // dollars
    let discountId: string | null = null;
    if (discountCode && typeof discountCode === 'string' && discountCode.trim().length > 0) {
      const code = discountCode.trim().toUpperCase();
      const discountQuery = `*[_type == 'discountCode' && code == $code][0]{_id, code, type, value, active, startDate, endDate, maxUses, onePerUser, appliesTo[]->{_id}}`;
      const discountDoc: any = await sanityClient.fetch(discountQuery, { code });

      if (!discountDoc) return new NextResponse('Invalid discount code', { status: 400 });
      if (!discountDoc.active) return new NextResponse('Discount code is not active', { status: 400 });

      const today = new Date();
      if (discountDoc.startDate && new Date(discountDoc.startDate) > today) return new NextResponse('Discount code not yet active', { status: 400 });
      if (discountDoc.endDate && new Date(discountDoc.endDate) < today) return new NextResponse('Discount code expired', { status: 400 });

      if (Array.isArray(discountDoc.appliesTo) && discountDoc.appliesTo.length > 0) {
        const appliesToIds = discountDoc.appliesTo.map((d: any) => d._id);
        if (!appliesToIds.includes(room._id)) return new NextResponse('Discount code does not apply to this accommodation', { status: 400 });
      }

      if (discountDoc.maxUses != null) {
        const usageCountQuery = `count(*[_type == 'booking' && discountCode._ref == $discountId])`;
        const usageCount = await sanityClient.fetch(usageCountQuery, { discountId: discountDoc._id });
        if (usageCount >= discountDoc.maxUses) return new NextResponse('Discount code usage limit reached', { status: 400 });
      }

      if (discountDoc.onePerUser) {
        const userBookingsWithCodeQuery = `count(*[_type == 'booking' && discountCode._ref == $discountId && user._ref == $userId])`;
        const userCount = await sanityClient.fetch(userBookingsWithCodeQuery, { discountId: discountDoc._id, userId });
        if (userCount > 0) return new NextResponse('You have already used this discount code', { status: 400 });
      }

      // compute per-night discount
      if (discountDoc.type === 'percentage') {
        appliedDiscountPerNight = (price * (Number(discountDoc.value) || 0)) / 100;
      } else {
        appliedDiscountPerNight = Number(discountDoc.value) || 0;
      }

      discountId = discountDoc._id;
    }

    // fallback to numeric discount (percentage) if no code applied
    const discountPrice = discountId ? Math.max(0, price - appliedDiscountPerNight) : price - (price / 100) * discount;
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
        discountCode: discountId ?? null,
        discountPerNight: discountId ? String(appliedDiscountPerNight) : '0',
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