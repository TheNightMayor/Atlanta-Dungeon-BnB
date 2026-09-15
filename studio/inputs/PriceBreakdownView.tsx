import React from 'react';

type Props = {
  value?: {
    baseRoomSubtotal?: number;
    listingDiscounts?: number;
    discountCodeSavings?: number;
    extraGuestCharge?: number;
    flatFee?: number;
    total?: number;
  };
};

const formatCurrency = (n?: number) =>
  typeof n === 'number' ? n.toLocaleString('en-US', { style: 'currency', currency: 'USD' }) : '—';

const ROWS: { key: keyof NonNullable<Props['value']>; label: string; negative?: boolean }[] = [
  { key: 'baseRoomSubtotal', label: 'Base room subtotal' },
  { key: 'listingDiscounts', label: 'Listing discounts', negative: true },
  { key: 'discountCodeSavings', label: 'Discount code savings', negative: true },
  { key: 'extraGuestCharge', label: 'Extra guest charge' },
  { key: 'flatFee', label: 'Flat fee' },
];

// Read-only snapshot of the price calculation — not editable input fields.
const PriceBreakdownView: React.FC<Props> = ({ value }) => {
  if (!value || Object.keys(value).length === 0) {
    return <div style={{ color: '#6b7280', fontSize: 13 }}>No price breakdown recorded for this booking.</div>;
  }

  return (
    <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, overflow: 'hidden', fontSize: 13 }}>
      {ROWS.map(({ key, label, negative }) => {
        const amount = value[key];
        if (amount === undefined || amount === null) return null;
        return (
          <div
            key={key}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '6px 12px',
              borderBottom: '1px solid #f3f4f6',
            }}
          >
            <span style={{ color: '#4b5563' }}>{label}</span>
            <span>{negative && amount ? `-${formatCurrency(amount)}` : formatCurrency(amount)}</span>
          </div>
        );
      })}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          padding: '8px 12px',
          fontWeight: 600,
          background: '#f9fafb',
        }}
      >
        <span>Total</span>
        <span>{formatCurrency(value.total)}</span>
      </div>
    </div>
  );
};

export default PriceBreakdownView;
