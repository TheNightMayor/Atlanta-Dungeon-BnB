import { NextResponse } from "next/server";
import Stripe from "stripe";

import { createBooking } from '@/libs/apis';
import { sendBookingPendingEmail, sendPaymentConfirmationEmail, sendBookingApprovalRequestEmail } from '@/libs/email';

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

        const stripePaymentIntentId = typeof session.payment_intent === 'string' ? session.payment_intent : undefined;
        const stripeSessionId = session.id;
        const customerEmail = session.customer_email ?? metadata?.userEmail ?? undefined;
        const roomName = metadata?.hotelRoomName;

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
