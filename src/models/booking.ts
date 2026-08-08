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
    totalPrice: number;
    discount: number;
    discountCode?: string | null;
    status?:
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
    amountPaid?: number;
    paymentReceivedAt?: string;
    refundedAmount?: number;
    refundedAt?: string;
    deletedAt?: string;
    deletedBy?: string;
  };