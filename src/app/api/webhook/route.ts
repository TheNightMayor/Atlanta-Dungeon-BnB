import { NextResponse } from "next/server";
import Stripe from "stripe";

import { createBooking, getBookingById } from '@/libs/apis';
import { sendBookingPendingEmail, sendPaymentConfirmationEmail, sendBookingApprovalRequestEmail, sendBookingConfirmationEmail } from '@/libs/email';
import sanityClient from '@/libs/sanity';

const checkout_session_completed = "checkout.session.completed";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2025-02-24.acacia",
});

export async function POST(req: Request) {
  const reqBody = await req.text();
  const sig = req.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event: Stripe.Event;

  try {
    if (!sig || !webhookSecret) return;
    event = stripe.webhooks.constructEvent(reqBody, sig, webhookSecret);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    return new NextResponse(`Webhook Error: ${error.message}`, { status: 500 });
  }
    
  // load our event
  switch (event.type) {
    case checkout_session_completed:
      {
        const session = event.data.object as Stripe.Checkout.Session;
        const metadata = session.metadata as Record<string, string | undefined> | undefined;

        const adults = metadata?.adults ?? '0';
        const checkinDate = metadata?.checkinDate ?? '';
        const checkoutDate = metadata?.checkoutDate ?? checkinDate;
        const hotelRoom = metadata?.hotelRoom ?? '';
        const numberOfDays = metadata?.numberOfDays ?? '1';
        const user = metadata?.user ?? '';
        const discount = metadata?.discount ?? '0';
        const totalPrice = metadata?.totalPrice ?? '0';
        const discountCode = metadata?.discountCode ?? null;
        const customerName = (metadata?.customerName ?? session.customer_details?.name) ?? undefined;
        const authorizedAmount = metadata?.authorizedAmount ?? totalPrice;
        const authorizedAt = metadata?.authorizedAt ?? new Date().toISOString();

        const stripePaymentIntentId = typeof session.payment_intent === 'string' ? session.payment_intent : undefined;
        const stripeSessionId = session.id;
        const customerEmail = session.customer_email ?? metadata?.userEmail ?? undefined;
        const roomName = metadata?.hotelRoomName;

        if (metadata?.invoiceBooking === 'true' && metadata.bookingId) {
          const existingBooking = await getBookingById(metadata.bookingId);
          if (!existingBooking) {
            return new NextResponse('Invoice booking not found', { status: 404 });
          }

          if (existingBooking.status !== 'approved') {
            let amountPaid = Number(totalPrice);
            if (stripePaymentIntentId) {
              const paymentIntent = await stripe.paymentIntents.retrieve(stripePaymentIntentId);
              if (paymentIntent.status === 'requires_capture') {
                await stripe.paymentIntents.capture(stripePaymentIntentId);
              }
              const capturedPaymentIntent = await stripe.paymentIntents.retrieve(stripePaymentIntentId);
              amountPaid = (capturedPaymentIntent.amount_received || Number(totalPrice) * 100) / 100;
            }

            await sanityClient.patch(metadata.bookingId).set({
              status: 'approved',
              stripePaymentIntentId,
              stripeSessionId,
              authorizedAmount: Number(authorizedAmount),
              authorizedAt,
              amountPaid,
              paymentReceivedAt: new Date().toISOString(),
            }).commit();
          }

          if (customerEmail && roomName && existingBooking.status !== 'approved') {
            await sendPaymentConfirmationEmail(
              customerEmail,
              roomName,
              checkinDate,
              checkoutDate,
              Number(totalPrice),
              customerName
            );
            await sendBookingConfirmationEmail(
              customerEmail,
              roomName,
              checkinDate,
              checkoutDate,
              Number(totalPrice),
              customerName
            );
          }

          return NextResponse.json('Invoice booking approved', { status: 200 });
        }

        await createBooking({
          adults: Number(adults),
          checkinDate,
          checkoutDate,
          hotelRoom,
          numberOfDays: Number(numberOfDays),
          discount: Number(discount),
          totalPrice: Number(totalPrice),
          discountCode,
          user,
          status: 'pending approval',
          stripePaymentIntentId,
          stripeSessionId,
          customerEmail,
          customerName,
        });

        const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL || process.env.RESEND_FROM || 'admin@example.com';

        if (adminEmail && roomName) {
          await sendBookingApprovalRequestEmail(
            adminEmail,
            roomName,
            customerName,
            checkinDate,
            checkoutDate,
            Number(totalPrice),
            customerEmail ?? ''
          );
        }

        if (customerEmail && roomName) {
          await sendPaymentConfirmationEmail(
            customerEmail,
            roomName,
            checkinDate,
            checkoutDate,
            Number(totalPrice),
            customerName
          );
        }
      }

      return NextResponse.json('Booking pending admin approval', {
        status: 200,
        statusText: 'Booking pending admin approval',
      });

    default:
      console.warn(`unhandled event type ${event.type}`);
  }
  return NextResponse.json("Event Received", {
    status: 200,
    statusText: "Event Received",
  });
}
