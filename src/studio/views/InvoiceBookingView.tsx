import React, { FormEvent, useEffect, useMemo, useState } from 'react';
import { useClient } from 'sanity';

type Listing = {
  _id: string;
  name: string;
  price?: number;
  flatFee?: number;
  includedGuests?: number;
  extraGuestFee?: number;
};

type DiscountCode = {
  _id: string;
  code: string;
  type: 'percentage' | 'fixed_total' | 'fixed';
  value: number;
  description?: string;
  startDate?: string;
  endDate?: string;
  appliesTo?: string[];
};

const listingsQuery = `*[_type == "hotelRoom" && !(_id in path("drafts.*"))] | order(name asc) {
  _id, name, price, flatFee, includedGuests, extraGuestFee
}`;

const discountCodesQuery = `*[_type == "discountCode" && active == true] | order(code asc) {
  _id, code, type, value, description, startDate, endDate, "appliesTo": appliesTo[]._ref
}`;

const formatDiscount = (discount: DiscountCode) => {
  if (discount.type === 'percentage') return `${discount.value}% off`;
  if (discount.type === 'fixed_total') return `$${discount.value} off total`;
  return `$${discount.value} off/night`;
};

const isCurrent = (discount: DiscountCode) => {
  const today = new Date().toISOString().slice(0, 10);
  return (!discount.startDate || discount.startDate <= today) &&
    (!discount.endDate || discount.endDate >= today);
};

export default function InvoiceBookingView() {
  const client = useClient({ apiVersion: '2021-10-21' });
  const [listings, setListings] = useState<Listing[]>([]);
  const [discountCodes, setDiscountCodes] = useState<DiscountCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [listingId, setListingId] = useState('');
  const [discountCodeId, setDiscountCodeId] = useState('');
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [checkinDate, setCheckinDate] = useState('');
  const [checkoutDate, setCheckoutDate] = useState('');
  const [adults, setAdults] = useState('1');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    let mounted = true;
    Promise.all([
      client.fetch<Listing[]>(listingsQuery),
      client.fetch<DiscountCode[]>(discountCodesQuery),
    ])
      .then(([listingResult, discountResult]) => {
        if (!mounted) return;
        setListings(listingResult || []);
        setDiscountCodes((discountResult || []).filter(isCurrent));
      })
      .catch(() => {
        if (mounted) setError('Unable to load listings and discount codes.');
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => { mounted = false; };
  }, [client]);

  const availableDiscounts = useMemo(() => {
    return discountCodes.filter((discount) =>
      !discount.appliesTo?.length || discount.appliesTo.includes(listingId)
    );
  }, [discountCodes, listingId]);

  useEffect(() => {
    if (discountCodeId && !availableDiscounts.some((discount) => discount._id === discountCodeId)) {
      setDiscountCodeId('');
    }
  }, [availableDiscounts, discountCodeId]);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setMessage('');
    fetch('/api/bookings/invoice', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        guestName,
        guestEmail,
        listingId,
        checkinDate,
        checkoutDate,
        adults: Number(adults),
        discountCodeId: discountCodeId || null,
      }),
    })
      .then(async (response) => {
        const result = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(result.error || `${response.status} Unable to create invoice.`);
        setMessage([
          'Invoice created.',
          result.warning,
          `Checkout link: ${result.checkoutUrl}`,
        ].filter(Boolean).join('\n'));
      })
      .catch((submissionError) => setMessage(submissionError instanceof Error ? submissionError.message : 'Unable to create invoice.'))
      .finally(() => setSubmitting(false));
  };

  if (loading) return <div style={{ padding: 24 }}>Loading invoice booking form...</div>;
  if (error) return <div style={{ padding: 24, color: '#b91c1c' }}>{error}</div>;

  return (
    <div style={{ maxWidth: 720, padding: 32 }}>
      <h1 style={{ margin: '0 0 8px', fontSize: 28 }}>Create listing invoice</h1>
      <p style={{ margin: '0 0 24px', color: '#6b7280' }}>
        Create a booking for a guest and send them a Stripe checkout link.
      </p>

      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 16 }}>
        <label>
          Guest name
          <input value={guestName} onChange={(event) => setGuestName(event.target.value)} required style={inputStyle} />
        </label>
        <label>
          Guest email
          <input type="email" value={guestEmail} onChange={(event) => setGuestEmail(event.target.value)} required style={inputStyle} />
        </label>
        <label>
          Listing
          <select value={listingId} onChange={(event) => setListingId(event.target.value)} required style={inputStyle}>
            <option value="">Select a listing</option>
            {listings.map((listing) => (
              <option key={listing._id} value={listing._id}>{listing.name}</option>
            ))}
          </select>
        </label>
        <label>
          Discount code
          <select value={discountCodeId} onChange={(event) => setDiscountCodeId(event.target.value)} style={inputStyle}>
            <option value="">No discount</option>
            {availableDiscounts.map((discount) => (
              <option key={discount._id} value={discount._id}>
                {discount.code} ({formatDiscount(discount)})
              </option>
            ))}
          </select>
        </label>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <label>
            Check-in
            <input type="date" value={checkinDate} onChange={(event) => setCheckinDate(event.target.value)} required style={inputStyle} />
          </label>
          <label>
            Check-out
            <input type="date" value={checkoutDate} onChange={(event) => setCheckoutDate(event.target.value)} required style={inputStyle} />
          </label>
        </div>
        <label>
          Adults
          <input type="number" min="1" value={adults} onChange={(event) => setAdults(event.target.value)} required style={inputStyle} />
        </label>
        <button type="submit" disabled={submitting} style={{ ...buttonStyle, background: submitting ? '#9ca3af' : '#2563eb', cursor: submitting ? 'wait' : 'pointer' }}>
          {submitting ? 'Creating invoice...' : 'Create invoice'}
        </button>
        {message && <div style={{ padding: 12, background: '#f3f4f6', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{message}</div>}
      </form>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  display: 'block',
  width: '100%',
  boxSizing: 'border-box',
  marginTop: 6,
  padding: '9px 10px',
  border: '1px solid #d1d5db',
  borderRadius: 4,
  fontSize: 14,
};

const buttonStyle: React.CSSProperties = {
  padding: '10px 14px',
  border: 0,
  borderRadius: 4,
  background: '#2563eb',
  color: '#fff',
  fontWeight: 600,
  cursor: 'pointer',
};
