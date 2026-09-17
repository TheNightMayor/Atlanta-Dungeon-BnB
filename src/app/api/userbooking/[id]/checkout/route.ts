import Stripe from 'stripe';
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';

import { authOptions } from '@/libs/auth';
import sanityClient from '@/libs/sanity';
import { getSessionUserId } from '@/libs/session';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2025-02-24.acacia',
});

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  const userId = getSessionUserId(session);
  if (!userId) return new NextResponse('Authentication Required', { status: 401 });

  const { id } = await params;
  const booking = await sanityClient.fetch<any>(
    `*[_type == "booking" && _id == $id && user._ref == $userId][0]{_id, status, invoiceBooking, checkoutUrl, checkoutExpiresAt, stripeSessionId}`,
    { id, userId }
  );

  if (!booking || !booking.invoiceBooking) return new NextResponse('Invoice booking not found', { status: 404 });
  if (booking.status !== 'pending payment') return new NextResponse('This invoice is no longer payable', { status: 409 });

  if (booking.checkoutExpiresAt && new Date(booking.checkoutExpiresAt).getTime() <= Date.now()) {
    return new NextResponse('This invoice has expired', { status: 410 });
  }

  if (booking.checkoutUrl) return NextResponse.json({ checkoutUrl: booking.checkoutUrl });
  if (!booking.stripeSessionId) return new NextResponse('Checkout is not available', { status: 409 });

  const stripeSession = await stripe.checkout.sessions.retrieve(booking.stripeSessionId);
  if (!stripeSession.url) return new NextResponse('Checkout is not available', { status: 409 });
  return NextResponse.json({ checkoutUrl: stripeSession.url });
}