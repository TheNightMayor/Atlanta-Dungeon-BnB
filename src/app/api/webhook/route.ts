import { NextResponse } from "next/server";
import Stripe from "stripe";

import { createBooking, updateHotelRoom } from "@/libs/apis";

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
      const session = event.data.object;
      console.log('session =>', session);
      const {
        metadata: {
          // @ts-expect-error metadata
          adults,
          // @ts-expect-error metadata
          checkinDate,
          // @ts-expect-error metadata
          checkoutDate,
          // @ts-expect-error metadata
          children,
          // @ts-expect-error metadata
          hotelRoom,
          // @ts-expect-error metadata
          numberOfDays,
          // @ts-expect-error metadata
          user,
          // @ts-expect-error metadata
          discount,
          // @ts-expect-error metadata
          totalPrice,
        },
      } = session;

      await createBooking({
        adults: Number(adults),
        checkinDate,
        checkoutDate,
        children: Number(children),
        hotelRoom,
        numberOfDays: Number(numberOfDays),
        discount: Number(discount),
        totalPrice: Number(totalPrice),
        user,
      });
      
      //   Update hotel Room
      await updateHotelRoom(hotelRoom);

      return NextResponse.json("Booking Successful", {
        status: 200,
        statusText: "Booking successful",
      });

    default:
      console.log(`unhandled event type ${event.type}`);
  }
  return NextResponse.json("Event Received", {
    status: 200,
    statusText: "Event Received",
  });
}
