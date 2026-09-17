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
    authorizedAmount?: number;
    authorizedAt?: string;
    priceBreakdown?: Record<string, unknown>;
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
    amountPaid?: number;
    paymentReceivedAt?: string;
    refundedAmount?: number;
    refundedAt?: string;
    deletedAt?: string;
    deletedBy?: string;
  };