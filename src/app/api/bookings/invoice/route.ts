import Stripe from 'stripe';
import { NextResponse } from 'next/server';

import { createBooking } from '@/libs/apis';
import sanityClient from '@/libs/sanity';
import { calculateListingDiscountsSavings, calculatePromoCodeSavings, discountAppliesToRoom, getDiscountUsageQueries, isDiscountActive, loadDiscountCode } from '@/libs/discount';
import { hasSanityStudioSession } from '@/libs/studioAuth';
import { sendInvoiceBookingEmail } from '@/libs/email';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2025-02-24.acacia',
});

export async function POST(req: Request) {
  if (!await hasSanityStudioSession(req)) {
    return new NextResponse('Authentication required', { status: 401 });
  }

  let bookingId: string | undefined;
  try {
    const body = await req.json();
    const guestName = String(body.guestName || '').trim();
    const guestEmail = String(body.guestEmail || '').trim().toLowerCase();
    const listingId = String(body.listingId || '').trim();
    const checkinDate = String(body.checkinDate || '').trim();
    const checkoutDate = String(body.checkoutDate || '').trim();
    const adults = Number(body.adults);
    const discountCodeId = body.discountCodeId ? String(body.discountCodeId) : '';

    if (!guestName || !guestEmail || !listingId || !checkinDate || !checkoutDate || !Number.isInteger(adults) || adults < 1) {
      return NextResponse.json({ error: 'Complete guest, listing, date, and adult details are required.' }, { status: 400 });
    }

    const checkin = new Date(`${checkinDate}T00:00:00Z`);
    const checkout = new Date(`${checkoutDate}T00:00:00Z`);
    const numberOfDays = Math.round((checkout.getTime() - checkin.getTime()) / 86400000);
    if (!Number.isFinite(numberOfDays) || numberOfDays < 1) {
      return NextResponse.json({ error: 'Check-out must be after check-in.' }, { status: 400 });
    }

    const listing = await sanityClient.fetch<any>(
      `*[_type == "hotelRoom" && _id == $listingId][0]{ _id, name, price, flatFee, includedGuests, extraGuestFee, discount, discounts }`,
      { listingId }
    );
    if (!listing) return NextResponse.json({ error: 'Listing not found.' }, { status: 404 });

    const conflicts = await sanityClient.fetch<number>(
      `count(*[_type == "booking" && hotelRoom._ref == $listingId && status != "rejected" && status != "deleted" && status != "cancelled" && status != "refunded" && checkinDate < $checkoutDate && checkoutDate > $checkinDate])`,
      { listingId, checkinDate, checkoutDate }
    );
    if (conflicts > 0) return NextResponse.json({ error: 'The listing is not available for those dates.' }, { status: 409 });

    const user = await sanityClient.fetch<any>(
      `*[_type == "user" && lower(email) == $email][0]{ _id, email }`,
      { email: guestEmail }
    ) ?? await sanityClient.create({
      _type: 'user',
      name: guestName,
      email: guestEmail,
      isAdmin: false,
      idVerified: false,
    });

    let discountId: string | null = null;
    let discountSavings = 0;
    if (discountCodeId) {
      const discount = await sanityClient.fetch<any>(
        `*[_type == "discountCode" && _id == $discountCodeId][0]{ _id, code, type, value, active, startDate, endDate, maxUses, onePerUser, appliesTo[]->{_id} }`,
        { discountCodeId }
      );
      if (!discount || !isDiscountActive(discount) || !discountAppliesToRoom(discount, listing._id)) {
        return NextResponse.json({ error: 'The selected discount code is not valid for this listing.' }, { status: 400 });
      }
      const usage = getDiscountUsageQueries(discount._id, user._id);
      if (discount.maxUses != null && await sanityClient.fetch<number>(usage.totalUsesQuery, usage.params) >= discount.maxUses) {
        return NextResponse.json({ error: 'The selected discount code has reached its usage limit.' }, { status: 400 });
      }
      if (discount.onePerUser && await sanityClient.fetch<number>(usage.userUsesQuery, usage.params) > 0) {
        return NextResponse.json({ error: 'This guest has already used the selected discount code.' }, { status: 400 });
      }
      discountId = discount._id;
      discountSavings = calculatePromoCodeSavings(discount, Number(listing.price), numberOfDays).totalSavings;
    }

    const nightlyPrice = Number(listing.price) || 0;
    const flatFee = Number(listing.flatFee) || 0;
    const { totalSavings: listingSavings, breakdown: appliedListingDiscounts } = calculateListingDiscountsSavings(
      listing.discounts,
      listing.discount,
      nightlyPrice,
      numberOfDays
    );
    const baseRoomSubtotal = nightlyPrice * numberOfDays;
    const promoSavings = Math.min(baseRoomSubtotal - listingSavings, discountSavings);
    const subtotal = Math.max(0, baseRoomSubtotal - listingSavings - promoSavings);
    const includedGuests = Number(listing.includedGuests ?? 2);
    const extraGuestFee = Number(listing.extraGuestFee ?? 30);
    const extraGuestCharge = adults > includedGuests ? (adults - includedGuests) * extraGuestFee : 0;
    const calculatedTotal = subtotal + extraGuestCharge + flatFee;
    const priceBreakdown = {
      baseRoomSubtotal,
      listingDiscounts: listingSavings,
      appliedListingDiscounts,
      discountCodeSavings: promoSavings,
      extraGuestCharge,
      flatFee,
      total: calculatedTotal,
    };
    const unitAmount = Math.round(calculatedTotal * 100);
    if (unitAmount < 50) return NextResponse.json({ error: 'The total must be at least $0.50.' }, { status: 400 });

    const bookingResult = await createBooking({
      user: user._id,
      hotelRoom: listing._id,
      checkinDate,
      checkoutDate,
      numberOfDays,
      adults,
      totalPrice: calculatedTotal,
      discount: Number(listing.discount) || 0,
      discountCode: discountId,
      invoiceBooking: true,
      status: 'pending payment',
      customerEmail: guestEmail,
      customerName: guestName,
      priceBreakdown,
    });
    bookingId = bookingResult?.results?.[0]?.id;
    if (!bookingId) throw new Error('Unable to create invoice booking.');

    const origin = process.env.NEXT_PUBLIC_APP_URL || new URL(req.url).origin;
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [{
        quantity: 1,
        price_data: {
          currency: 'usd',
          product_data: { name: listing.name },
          unit_amount: unitAmount,
        },
      }],
      payment_method_types: ['card'],
      payment_intent_data: { capture_method: 'manual' },
      customer_email: guestEmail,
      success_url: `${origin}/auth?mode=signin&returnTo=${encodeURIComponent(`/users/${user._id}?paymentSuccess=true&bookingId=${bookingId}`)}`,
      cancel_url: `${origin}/`,
      metadata: {
        invoiceBooking: 'true',
        bookingId,
        user: user._id,
        userEmail: guestEmail,
        customerName: guestName,
        hotelRoom: listing._id,
        hotelRoomName: listing.name,
        checkinDate,
        checkoutDate,
        numberOfDays: String(numberOfDays),
        adults: String(adults),
        discount: String(Number(listing.discount) || 0),
        discountCode: discountId ?? '',
        totalPrice: String(calculatedTotal),
        authorizedAmount: String(calculatedTotal),
        priceBreakdown: JSON.stringify(priceBreakdown),
      },
    });

    await sanityClient.patch(bookingId).set({
      stripeSessionId: session.id,
      checkoutUrl: session.url,
      checkoutExpiresAt: session.expires_at ? new Date(session.expires_at * 1000).toISOString() : undefined,
    }).commit();

    let emailSent = true;
    try {
      await sendInvoiceBookingEmail(
        guestEmail,
        user._id,
        listing.name,
        checkinDate,
        checkoutDate,
        calculatedTotal,
        guestName
      );
    } catch (emailError) {
      emailSent = false;
      console.error('Invoice booking email failed:', emailError);
    }

    return NextResponse.json({
      bookingId,
      checkoutUrl: session.url,
      emailSent,
      warning: emailSent ? undefined : 'Invoice created, but the guest notification email could not be sent.',
    });
  } catch (error) {
    if (bookingId) {
      await sanityClient.patch(bookingId).set({ status: 'deleted' }).commit().catch((rollbackError) => {
        console.error('Unable to clean up failed invoice booking:', rollbackError);
      });
    }
    console.error('Invoice booking creation failed:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unable to create invoice booking.' }, { status: 500 });
  }
}
