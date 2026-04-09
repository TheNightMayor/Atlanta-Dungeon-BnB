import { NextResponse } from 'next/server';
import sanityClient from '@/libs/sanity';

type Body = {
  code?: string | null;
  price?: number;
  hotelRoomId?: string | null;
};

export async function POST(req: Request) {
  try {
    const { code, price, hotelRoomId }: Body = await req.json();

    if (!code || typeof code !== 'string' || code.trim().length === 0) {
      return new NextResponse('Code is required', { status: 400 });
    }

    const normalized = code.trim().toUpperCase();
    const discountQuery = `*[_type == 'discountCode' && code == $code][0]{_id, code, type, value, active, startDate, endDate, maxUses, onePerUser, appliesTo[]->{_id}}`;
    const discountDoc: any = await sanityClient.fetch(discountQuery, { code: normalized });

    if (!discountDoc) return new NextResponse('Invalid discount code', { status: 400 });
    if (!discountDoc.active) return new NextResponse('Discount code is not active', { status: 400 });

    const today = new Date();
    if (discountDoc.startDate && new Date(discountDoc.startDate) > today) return new NextResponse('Discount code not yet active', { status: 400 });
    if (discountDoc.endDate && new Date(discountDoc.endDate) < today) return new NextResponse('Discount code expired', { status: 400 });

    if (Array.isArray(discountDoc.appliesTo) && discountDoc.appliesTo.length > 0 && hotelRoomId) {
      const appliesToIds = discountDoc.appliesTo.map((d: any) => d._id);
      if (!appliesToIds.includes(hotelRoomId)) return new NextResponse('Discount code does not apply to this accommodation', { status: 400 });
    }

    // compute per-night discount using provided price when possible
    let appliedDiscountPerNight = 0;
    if (price != null) {
      if (discountDoc.type === 'percentage') {
        appliedDiscountPerNight = (price * (Number(discountDoc.value) || 0)) / 100;
      } else {
        appliedDiscountPerNight = Number(discountDoc.value) || 0;
      }
    }

    return NextResponse.json({
      valid: true,
      _id: discountDoc._id,
      code: discountDoc.code,
      type: discountDoc.type,
      value: discountDoc.value,
      perNight: appliedDiscountPerNight,
    });
  } catch (error) {
    console.error('Discount validate error', error);
    return new NextResponse('Server error', { status: 500 });
  }
}
