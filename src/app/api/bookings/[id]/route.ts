import Stripe from 'stripe';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';

import { authOptions } from '@/libs/auth';
import { getBookingById, updateBookingStatus } from '@/libs/apis';
import { getUserData } from '@/libs/apis';
import { sendBookingApprovedEmail, sendBookingConfirmationEmail, sendBookingRejectionEmail } from '@/libs/email';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2025-02-24.acacia',
});

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return new NextResponse('Authentication required', { status: 401 });
  }

  const userId = (session.user as any).id ?? session.user.name;
  const userData = await getUserData(userId);
  if (!userData?.isAdmin) {
    return new NextResponse('Admin access required', { status: 403 });
  }

  const { id: bookingId } = await params;
  const body = await req.json().catch(() => ({} as Record<string, unknown>));
  const action = body.action as string | undefined;

  if (!action || (action !== 'approve' && action !== 'reject')) {
    return new NextResponse('Invalid action', { status: 400 });
  }

  try {
    const booking = await getBookingById(bookingId);
    if (!booking) {
      return new NextResponse('Booking not found', { status: 404 });
    }

    const paymentIntentId = booking.stripePaymentIntentId;
    const customerEmail = booking.customerEmail;
    const customerName = booking.customerName;
    const roomName = booking.hotelRoom?.name;
    const checkinDate = booking.checkinDate;
    const checkoutDate = booking.checkoutDate;
    const totalPrice = booking.totalPrice;

    if (action === 'approve') {
      if (!paymentIntentId) {
        return new NextResponse('Missing Stripe payment intent ID', { status: 400 });
      }

      await stripe.paymentIntents.capture(paymentIntentId);
      await updateBookingStatus(bookingId, 'approved');

      if (customerEmail && roomName) {
        await sendBookingConfirmationEmail(
          customerEmail,
          roomName,
          checkinDate,
          checkoutDate,
          totalPrice,
          customerName
        );

        await sendBookingApprovedEmail(
          customerEmail,
          roomName,
          checkinDate,
          checkoutDate,
          totalPrice,
          customerName
        );
      }

      return NextResponse.json({ status: 'approved' }, { status: 200 });
    }

    if (action === 'reject') {
      if (paymentIntentId) {
        await stripe.paymentIntents.cancel(paymentIntentId);
      }

      await updateBookingStatus(bookingId, 'rejected');

      if (customerEmail && roomName) {
        await sendBookingRejectionEmail(
          customerEmail,
          roomName,
          checkinDate,
          checkoutDate,
          totalPrice,
          customerName
        );
      }

      return NextResponse.json({ status: 'rejected' }, { status: 200 });
    }

    return new NextResponse('No action taken', { status: 400 });
  } catch (error) {
    console.error('Booking approval error:', error);
    return new NextResponse('Unable to update booking status', { status: 500 });
  }
}
