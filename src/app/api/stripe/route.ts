import Stripe from 'stripe';

import { authOptions } from '@/libs/auth';
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { getRoom } from '@/libs/apis';
import sanityClient from '@/libs/sanity';
import getImageUrl from '@/libs/imageUrl';
import { getSessionUserId } from '@/libs/session';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  // @ts-ignore
  apiVersion: '2026-07-29.dahlia',
});

// Diagnostic: log masked prefix so we can confirm which key the running process sees (never log full key)
if (!process.env.STRIPE_SECRET_KEY) {
  console.error('STRIPE_SECRET_KEY is not set in the runtime environment');
} else {
  try {
    const k = process.env.STRIPE_SECRET_KEY as string;
    console.debug('STRIPE key prefix:', k.substring(0, Math.min(8, k.length)));
  } catch (e) {
    // ignore
  }
}

type RequestData = {
  checkinDate: string;
  checkoutDate: string;
  adults: number;
  numberOfDays: number;
  hotelRoomSlug: string;
  price: number;
  flatFee: number;
  discount: number;
  discountCode?: string | null;
};

export async function POST(req: Request) {
  const rawBody = await req.json();
  let {
    checkinDate,
    adults,
    checkoutDate,
    hotelRoomSlug,
    numberOfDays,
    price,
    flatFee,
    discount,
    discountCode,
  } = rawBody as any;

  // Coerce numeric fields and default numberOfDays to 1 for single-day stays
  adults = adults == null ? NaN : Number(adults);
  numberOfDays = numberOfDays == null ? 1 : Number(numberOfDays);
  price = price == null ? NaN : Number(price);
  flatFee = flatFee == null ? NaN : Number(flatFee);
  discount = discount == null ? 0 : Number(discount);

  // Validate required fields more strictly
  const missing: string[] = [];
  if (!checkinDate) missing.push('checkinDate');
  if (numberOfDays > 1 && !checkoutDate) missing.push('checkoutDate');
  if (!Number.isFinite(adults)) missing.push('adults');
  if (!hotelRoomSlug) missing.push('hotelRoomSlug');
  if (!Number.isFinite(numberOfDays)) missing.push('numberOfDays');
  if (!Number.isFinite(price)) missing.push('price');
  if (!Number.isFinite(flatFee)) missing.push('flatFee');

  if (missing.length > 0) {
    return NextResponse.json({ error: 'Missing or invalid fields', missing }, { status: 400 });
  }

  const originHeader = req.headers.get('origin');
  const origin =
    typeof originHeader === 'string' && originHeader.startsWith('http')
      ? originHeader
      : process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  const session = await getServerSession(authOptions);
  const userId = getSessionUserId(session);

  if (!userId || !session?.user) {
    return new NextResponse('Authentication Required', { status: 400 });
  }
  const formattedCheckinDate = checkinDate.split('T')[0];
  const formattedCheckoutDate = checkoutDate ? checkoutDate.split('T')[0] : formattedCheckinDate;

  try {
    const room = await getRoom(hotelRoomSlug);
    if (!room) {
      return new NextResponse('Room not found', { status: 400 });
    }

    // Build safe image list: convert Sanity refs to CDN URLs and remove falsy/empty values
    const isNonEmptyUrl = (u: any): u is string => typeof u === 'string' && u.trim() !== '' && /^https?:\/\//.test(u);

    const imageUrls: string[] = Array.isArray(room?.images)
      ? room.images.map((img: any) => getImageUrl(img)).filter(isNonEmptyUrl)
      : [];

    if (imageUrls.length === 0 && room?.coverImage) {
      const cover = getImageUrl(room.coverImage);
      if (isNonEmptyUrl(cover)) imageUrls.push(cover);
    }

    // calculate totals

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
    const included = typeof room.includedGuests === 'number' ? Number(room.includedGuests) : 2;
    const perExtra = typeof room.extraGuestFee === 'number' ? Number(room.extraGuestFee) : 30;
    const extraGuestCharge = adults > included ? (adults - included) * perExtra : 0;
    const calculatedTotal = subtotal + extraGuestCharge + flatFee;

    // Stripe expects integer cents and a non-negative amount
    const unit_amount = Math.max(0, Math.round(Number(calculatedTotal ?? 0) * 100));

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
              ...(imageUrls.length ? { images: imageUrls } : {}),
            },
            unit_amount,
          },
        },
      ],
      payment_method_types: ['card'],
      payment_intent_data: {
        capture_method: 'manual',
      },
      customer_email: session.user?.email ?? undefined,
      success_url: `${origin}/users/${encodeURIComponent(
        session.user?.name ?? userId
      )}?paymentSuccess=true`,
      cancel_url: `${origin}/rooms/${encodeURIComponent(hotelRoomSlug)}`,
      metadata: {
        adults,
        checkinDate: formattedCheckinDate,
        checkoutDate: formattedCheckoutDate,
        hotelRoom: room._id,
        hotelRoomName: room.name,
        numberOfDays,
        user: userId,
        userEmail: session.user?.email ?? '',
        customerName: session.user?.name ?? '',
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
    console.error('Payment failed', error?.message ?? error);
    return NextResponse.json({ error: error?.message ?? 'Payment failed' }, { status: 500 });
  }
}