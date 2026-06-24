export type Booking = {
    _id: string;
    hotelRoom: {
      _id: string;
      name: string;
      slug: { current: string };
      price: number;
    };
    checkinDate: string;
    checkoutDate: string;
    numberOfDays: number;
    adults: number;
    children: number;
    totalPrice: number;
    discount: number;
    discountCode?: string | null;
    status?: 'pending approval' | 'approved' | 'rejected';
    stripePaymentIntentId?: string;
    stripeSessionId?: string;
    customerEmail?: string;
    customerName?: string;
  };