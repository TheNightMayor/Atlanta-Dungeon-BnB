import Stripe from 'stripe';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';

import { authOptions } from '@/libs/auth';
import { getBookingById, updateBookingStatus } from '@/libs/apis';
import { getUserData } from '@/libs/apis';
import { getSessionUserId } from '@/libs/session';
import { sendBookingApprovedEmail, sendBookingConfirmationEmail, sendBookingRejectionEmail, sendBookingCancellationEmail, sendBookingRefundEmail } from '@/libs/email';

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

  if (!action || (action !== 'approve' && action !== 'reject' && action !== 'cancel')) {
    return new NextResponse('Invalid action', { status: 400 });
  }

  try {
    const booking = await getBookingById(bookingId);
    if (!booking) {
      return new NextResponse('Booking not found', { status: 404 });
    }

    const paymentIntentId = booking.stripePaymentIntentId;
    const customerEmail = booking.customerEmail ?? booking.user?.email;
    const customerName = booking.customerName ?? booking.user?.name;
    const roomName = booking.hotelRoom?.name;
    const checkinDate = booking.checkinDate;
    const checkoutDate = booking.checkoutDate;
    const totalPrice = booking.totalPrice;

    if (action === 'approve') {
      if (!paymentIntentId) {
        return new NextResponse('Missing Stripe payment intent ID', { status: 400 });
      }

      const captured = await stripe.paymentIntents.capture(paymentIntentId);
      // record amount received and timestamp
      try {
        const pi = await stripe.paymentIntents.retrieve(paymentIntentId as string);
        const amountReceived = (pi as any).amount_received ?? (captured as any).amount_received ?? 0;
        const amountPaid = amountReceived / 100;
        const paidAt = new Date().toISOString();
        const { setBookingPaymentInfo } = await import('@/libs/apis');
        await setBookingPaymentInfo(bookingId, amountPaid, paidAt);
      } catch (e) {
        console.error('Failed to set booking payment info:', e);
      }

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

    if (action === 'cancel') {
      // Admin cancelling an already-approved booking. If the payment intent has not yet
      // been captured we can cancel it here to release authorization. Do NOT refund
      // already-captured payments; refunds are a separate explicit step.
      try {
        if (paymentIntentId) {
          const pi = await stripe.paymentIntents.retrieve(paymentIntentId as string);
          if ((pi as any).status === 'requires_capture') {
            await stripe.paymentIntents.cancel(paymentIntentId as string);
          }
        }
      } catch (e) {
        console.error('Stripe cancel error:', e);
      }

      await updateBookingStatus(bookingId, 'cancelled');

      if (customerEmail && roomName) {
        await sendBookingCancellationEmail(
          customerEmail,
          roomName,
          checkinDate,
          checkoutDate,
          totalPrice,
          customerName
        );
      }

      return NextResponse.json({ status: 'cancelled' }, { status: 200 });
    }

    if (action === 'refund') {
      if (!paymentIntentId) {
        return new NextResponse('Missing payment intent for refund', { status: 400 });
      }

      const requestedAmount = body.amount as number | undefined; // dollars

      try {
        const pi = await stripe.paymentIntents.retrieve(paymentIntentId as string);
        const amountReceived = (pi as any).amount_received ?? 0; // cents
        let refundAmountCents = amountReceived;
        if (requestedAmount != null) {
          const requestedCents = Math.round(Number(requestedAmount) * 100);
          if (requestedCents <= 0 || requestedCents > amountReceived) {
            return new NextResponse('Invalid refund amount', { status: 400 });
          }
          refundAmountCents = requestedCents;
        }

        const refund = await stripe.refunds.create({ payment_intent: paymentIntentId as string, amount: refundAmountCents });

        const refundedAmount = refund.amount ? refund.amount / 100 : refundAmountCents / 100;
        const refundedAt = new Date().toISOString();
        const { setBookingRefundInfo } = await import('@/libs/apis');
        await setBookingRefundInfo(bookingId, refundedAmount, refundedAt);

        // set booking status depending on whether it was full or partial
        if (refundAmountCents >= amountReceived) {
          await updateBookingStatus(bookingId, 'refunded');
        } else {
          await updateBookingStatus(bookingId, 'partially_refunded');
        }

        if (customerEmail && roomName) {
          await sendBookingRefundEmail(
            customerEmail,
            roomName,
            checkinDate,
            checkoutDate,
            refundedAmount,
            customerName
          );
        }

        return NextResponse.json({ status: 'refunded', amount: refundedAmount }, { status: 200 });
      } catch (e) {
        console.error('Stripe refund error:', e);
        return new NextResponse('Refund failed', { status: 500 });
      }
    }

    return new NextResponse('No action taken', { status: 400 });
  } catch (error) {
    console.error('Booking approval error:', error);
    return new NextResponse('Unable to update booking status', { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  const userId = getSessionUserId(session);
  if (!userId) {
    return new NextResponse('Authentication required', { status: 401 });
  }

  const userData = await getUserData(userId);
  if (!userData?.isAdmin) {
    return new NextResponse('Admin access required', { status: 403 });
  }

  const { id: bookingId } = await params;

  try {
    // call Sanity soft-delete
    const { deleteBooking } = await import('@/libs/apis');
    await deleteBooking(bookingId, userId);
    return NextResponse.json({ deleted: true }, { status: 200 });
  } catch (error) {
    console.error('Failed to delete booking', error);
    return new NextResponse('Unable to delete booking', { status: 500 });
  }
}
