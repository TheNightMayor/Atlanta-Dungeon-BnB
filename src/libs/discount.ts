import sanityClient from './sanity';
import { ListingDiscount } from '@/models/room';

export type DiscountCodeResult = {
  _id: string;
  code: string;
  type: 'percentage' | 'fixed' | string;
  value: number | string;
  active: boolean;
  startDate?: string;
  endDate?: string;
  maxUses?: number;
  onePerUser?: boolean;
  appliesTo?: Array<{ _id: string }>;
};

/**
 * Calculates total savings from all active listing discounts attached to a room.
 * Supports percentage, fixed per night, and fixed total, plus legacy percentage fallback.
 */
export function calculateListingDiscountsSavings(
  discounts: ListingDiscount[] | undefined,
  legacyDiscount: number | undefined,
  nightlyPrice: number,
  numberOfDays: number
): { totalSavings: number; perNightSavings: number; breakdown: Array<{ title: string; amount: number }> } {
  const baseSubtotal = nightlyPrice * numberOfDays;
  let totalSavings = 0;
  const breakdown: Array<{ title: string; amount: number }> = [];

  if (Array.isArray(discounts) && discounts.length > 0) {
    for (const discount of discounts) {
      if (discount.active === false) continue;
      const value = Number(discount.value) || 0;
      let amount = 0;
      if (discount.type === 'percentage') {
        amount = (baseSubtotal * value) / 100;
      } else if (discount.type === 'fixed_nightly') {
        amount = value * numberOfDays;
      } else if (discount.type === 'fixed_total') {
        amount = value;
      } else {
        amount = (baseSubtotal * value) / 100;
      }
      if (amount > 0) {
        totalSavings += amount;
        breakdown.push({ title: discount.title || 'Discount', amount });
      }
    }
  } else if (legacyDiscount && Number(legacyDiscount) > 0) {
    const value = Number(legacyDiscount);
    const amount = (baseSubtotal * value) / 100;
    totalSavings += amount;
    breakdown.push({ title: `${value}% off`, amount });
  }

  totalSavings = Math.min(baseSubtotal, totalSavings);
  const perNightSavings = numberOfDays > 0 ? totalSavings / numberOfDays : 0;

  return { totalSavings, perNightSavings, breakdown };
}

export function normalizeDiscountCode(code: string) {
  return code.trim().toUpperCase();
}

export function calculatePromoCodeSavings(
  discountDoc: DiscountCodeResult,
  price: number,
  numberOfDays: number
): { totalSavings: number; perNightSavings: number } {
  const days = Math.max(1, numberOfDays || 1);
  const rawValue = Number(discountDoc.value) || 0;
  let totalSavings = 0;
  let perNightSavings = 0;

  if (discountDoc.type === 'percentage') {
    perNightSavings = (price * rawValue) / 100;
    totalSavings = perNightSavings * days;
  } else if (discountDoc.type === 'fixed_total') {
    totalSavings = rawValue;
    perNightSavings = rawValue / days;
  } else {
    perNightSavings = rawValue;
    totalSavings = rawValue * days;
  }

  const baseSubtotal = price * days;
  totalSavings = Math.min(baseSubtotal, totalSavings);
  perNightSavings = days > 0 ? totalSavings / days : 0;

  return { totalSavings, perNightSavings };
}

export function calculateDiscountPerNight(
  discountDoc: DiscountCodeResult,
  price: number,
  numberOfDays: number = 1
): number {
  return calculatePromoCodeSavings(discountDoc, price, numberOfDays).perNightSavings;
}

export async function loadDiscountCode(code: string) {
  const discountQuery = `*[_type == 'discountCode' && code == $code][0]{_id, code, type, value, active, startDate, endDate, maxUses, onePerUser, appliesTo[]->{_id}}`;
  return sanityClient.fetch<DiscountCodeResult>(discountQuery, { code });
}

export function isDiscountActive(discountDoc: DiscountCodeResult) {
  const today = new Date();
  if (!discountDoc.active) return false;
  if (discountDoc.startDate && new Date(discountDoc.startDate) > today) return false;
  if (discountDoc.endDate && new Date(discountDoc.endDate) < today) return false;
  return true;
}

export function discountAppliesToRoom(discountDoc: DiscountCodeResult, roomId: string) {
  if (!Array.isArray(discountDoc.appliesTo) || discountDoc.appliesTo.length === 0) {
    return true;
  }
  return discountDoc.appliesTo.some((item) => item?._id === roomId);
}

export function getDiscountUsageQueries(discountId: string, userId: string) {
  return {
    totalUsesQuery: `count(*[_type == 'booking' && discountCode._ref == $discountId])`,
    userUsesQuery: `count(*[_type == 'booking' && discountCode._ref == $discountId && user._ref == $userId])`,
    params: { discountId, userId },
  };
}
