import sanityClient from './sanity';

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

export function normalizeDiscountCode(code: string) {
  return code.trim().toUpperCase();
}

export function calculateDiscountPerNight(
  discountDoc: DiscountCodeResult,
  price: number
): number {
  if (discountDoc.type === 'percentage') {
    return (price * (Number(discountDoc.value) || 0)) / 100;
  }
  return Number(discountDoc.value) || 0;
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
