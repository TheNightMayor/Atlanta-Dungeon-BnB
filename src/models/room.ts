import { Any } from "next-sanity";

type CoverImage = {
  url: string;
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

export type Room = {
  bookedDates: Any[];
  _id: string;
  coverImage: CoverImage;
  description: PortableTextBlock[];
  dimension: string;
  discount: number;
  images: Image[];
  flatFee?: number;
  overnight?: boolean;
  isBooked: boolean;
  isFeatured: boolean;
  name: string;
  numberOfBeds: number;
  offeredAmenities: Amenity[];
  price: number;
  slug: Slug;
  specialNote: string;
  type: string;
};

export type CreateBookingDto = {
  user: string;
  hotelRoom: string;
  checkinDate: string;
  checkoutDate: string;
  numberOfDays: number;
  adults: number;
  children: number;
  totalPrice: number;
  discount: number;
};
