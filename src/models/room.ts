import { Any } from "next-sanity";

type CoverImage = {
  image?: any;
  url?: string;
  assetRef?: string;
};

export type Image = {
  _key: string;
  url: string;
};

type Amenity = {
  _key: string;
  amenity: string;
  icon: string;
};

type Slug = {
  _type: string;
  current: string;
};

export type PortableTextBlock = {
  _key: string;
  _type: 'block';
  children: Array<{ _key: string; _type: string; text: string }>;
  markDefs: any[];
  style: string;
};

export type ListingDiscount = {
  _key?: string;
  title: string;
  type: 'percentage' | 'fixed_nightly' | 'fixed_total' | string;
  value: number;
  active?: boolean;
};

export type Room = {
  bookedDates: Any[];
  _id: string;
  coverImage: CoverImage;
  description: PortableTextBlock[];
  discount: number;
  discounts?: ListingDiscount[];
  images: Image[];
  flatFee?: number;
  overnight?: boolean;
  instantBook: boolean;
  name: string;
  
  offeredAmenities: Amenity[];
  price: number;
  includedGuests?: number;
  extraGuestFee?: number;
  slug: Slug;
  specialNote: string;
};

export type CreateBookingDto = {
  user: string;
  hotelRoom: string;
  checkinDate: string;
  checkoutDate: string;
  numberOfDays: number;
  adults: number;
  totalPrice: number;
  authorizedAmount?: number;
  authorizedAt?: string;
  priceBreakdown?: {
    baseRoomSubtotal: number;
    listingDiscounts: number;
    discountCodeSavings: number;
    extraGuestCharge: number;
    flatFee: number;
    total: number;
  };
  discount: number;
  discountCode?: string | null;
  invoiceBooking?: boolean;
  checkoutUrl?: string;
  checkoutExpiresAt?: string;
  status?:
    | 'pending payment'
    | 'pending approval'
    | 'approved'
    | 'rejected'
    | 'cancelled'
    | 'refunded'
    | 'partially_refunded'
    | 'deleted';
  stripePaymentIntentId?: string;
  stripeSessionId?: string;
  customerEmail?: string;
  customerName?: string;
};
