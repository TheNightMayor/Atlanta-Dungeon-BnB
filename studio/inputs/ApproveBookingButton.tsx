import React, { useState } from 'react';
import { useFormValue } from 'sanity';

type Props = any;

const ApproveBookingButton: React.FC<Props> = (props) => {
  const { document } = props;
  const [loading, setLoading] = useState(false);

  const idValue = useFormValue(['_id']);
  const statusValue = useFormValue(['status']);

  const status = statusValue ?? document?.status;
  const id = idValue ?? document?._id;
  const stripePaymentIntent = useFormValue(['stripePaymentIntentId']);
  const amountPaidValue = useFormValue(['amountPaid']);
  const amountPaid = typeof amountPaidValue === 'number' ? amountPaidValue : Number(amountPaidValue) || 0;
  const [refundAmount, setRefundAmount] = useState<number | ''>(amountPaid || '');

  React.useEffect(() => {
    // sync default refund amount when amountPaid changes
    setRefundAmount(amountPaid || '');
  }, [amountPaid]);
  const paymentReceivedAtValue = useFormValue(['paymentReceivedAt']);
  const refundedAmountValue = useFormValue(['refundedAmount']);
  const refundedAtValue = useFormValue(['refundedAt']);

  const formatDateTime = (val: unknown) => {
    if (!val) return '—';
    try {
      const d = new Date(String(val));
      if (isNaN(d.getTime())) return String(val);
      return d.toLocaleString();
    } catch (e) {
      return String(val);
    }
  };

  const safeId = id || 'no-id';
  async function handleApprove() {
    if (!confirm('Approve this booking and capture payment?')) return;
    setLoading(true);
    try {
      const targetId = id?.toString().replace(/^drafts\./, '') || '';
      const res = await fetch(`/api/bookings/${targetId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'approve' }),
      });
      if (!res.ok) {
        const text = await res.text().catch(() => '');
        throw new Error(`${res.status} ${text}`);
      }
      window.location.reload();
    } catch (err: any) {
      // eslint-disable-next-line no-alert
      alert('Approval failed: ' + (err?.message ?? err));
      setLoading(false);
    }
  }

  async function handleReject() {
    const confirmMessage = status === 'approved'
      ? 'Cancel this approved booking and release/cancel payment?'
      : 'Reject this booking and release payment?';
    if (!confirm(confirmMessage)) return;
    setLoading(true);
    try {
      const targetId = id?.toString().replace(/^drafts\./, '') || '';
      const actionToSend = status === 'approved' ? 'cancel' : 'reject';
      const res = await fetch(`/api/bookings/${targetId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: actionToSend }),
      });
      if (!res.ok) {
        const text = await res.text().catch(() => '');
        throw new Error(`${res.status} ${text}`);
      }
      window.location.reload();
    } catch (err: any) {
      // eslint-disable-next-line no-alert
      alert('Rejection failed: ' + (err?.message ?? err));
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!confirm('Delete this booking request permanently? This cannot be undone.')) return;
    setLoading(true);
    try {
      const targetId = id?.toString().replace(/^drafts\./, '') || '';
      const res = await fetch(`/api/bookings/${targetId}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        const text = await res.text().catch(() => '');
        throw new Error(`${res.status} ${text}`);
      }
      window.location.reload();
    } catch (err: any) {
      // eslint-disable-next-line no-alert
      alert('Delete failed: ' + (err?.message ?? err));
      setLoading(false);
    }
  }

  return (
    <div style={{ paddingTop: 8 }}>
      
      <div style={{ display: 'flex', gap: 8 }}>
        <button
          type="button"
          onClick={handleApprove}
          disabled={loading || status !== 'pending approval' || !id}
          style={{
            background: status === 'pending approval' ? '#059669' : '#9ca3af',
            color: 'white',
            border: 'none',
            padding: '8px 12px',
            borderRadius: 6,
            cursor: status === 'pending approval' ? 'pointer' : 'not-allowed',
          }}
        >
          {loading ? 'Approving…' : status === 'pending approval' ? 'Approve booking' : status === 'approved' ? 'Approved' : 'Not approvable'}
        </button>

        <button
          type="button"
          onClick={handleReject}
          disabled={loading || !id || status === 'rejected'}
          style={{
            background: status === 'rejected' ? '#9ca3af' : '#dc2626',
            color: 'white',
            border: 'none',
            padding: '8px 12px',
            borderRadius: 6,
            cursor: status === 'rejected' ? 'not-allowed' : id ? 'pointer' : 'not-allowed',
          }}
        >
          {loading
            ? 'Working…'
            : status === 'rejected'
            ? 'Rejected'
            : status === 'approved'
            ? 'Cancel booking'
            : 'Reject booking'}
        </button>

        {status === 'rejected' && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={loading || !id}
            style={{
              background: '#dc2626',
              color: 'white',
              border: 'none',
              padding: '8px 12px',
              borderRadius: 6,
              cursor: id ? 'pointer' : 'not-allowed',
            }}
          >
            {loading ? 'Working…' : 'Delete request'}
          </button>
        )}
        
      </div>

      <div style={{ marginTop: 10, padding: 10, borderRadius: 8, background: '#f3f4f6', color: '#111827' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 12, height: 12, borderRadius: 9999, background: ((): string => {
                const colorMap: Record<string, string> = {
                  approved: '#16a34a',
                  'pending approval': '#f59e0b',
                  rejected: '#dc2626',
                  cancelled: '#ef4444',
                  refunded: '#0ea5e9',
                  'partially_refunded': '#60a5fa',
                  deleted: '#6b7280',
                };
                return status ? colorMap[status] ?? '#9ca3af' : '#9ca3af';
              })() }} />
            <div style={{ fontSize: 13, fontWeight: 600 }}>{status ? (status.charAt(0).toUpperCase() + status.slice(1).replace(/_/g, ' ')) : 'Unknown'}</div>
          </div>
          <div style={{ fontSize: 12, color: '#6b7280' }}>Payment info</div>
        </div>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <div style={{ minWidth: 180 }}>
            <div style={{ fontSize: 12, color: '#6b7280' }}>Amount paid</div>
            <div style={{ fontWeight: 600 }}>${amountPaid ? amountPaid.toFixed(2) : '0.00'}</div>
          </div>

          <div style={{ minWidth: 220 }}>
            <div style={{ fontSize: 12, color: '#6b7280' }}>Payment received at</div>
            <div style={{ fontWeight: 600 }}>{formatDateTime(paymentReceivedAtValue)}</div>
          </div>

          <div style={{ minWidth: 180 }}>
            <div style={{ fontSize: 12, color: '#6b7280' }}>Refunded amount</div>
            <div style={{ fontWeight: 600 }}>${refundedAmountValue ? Number(refundedAmountValue).toFixed(2) : '0.00'}</div>
          </div>

          <div style={{ minWidth: 220 }}>
            <div style={{ fontSize: 12, color: '#6b7280' }}>Refunded at</div>
            <div style={{ fontWeight: 600 }}>{formatDateTime(refundedAtValue)}</div>
          </div>
        </div>
      </div>
      {(status === 'cancelled' || status === 'approved') && Boolean(stripePaymentIntent) && (
        <div style={{ marginTop: 10, display: 'flex', gap: 8, alignItems: 'flex-end' }}>
          <div style={{ display: 'flex', flexDirection: 'column', minWidth: 140 }}>
            <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 6 }}>Refund amount</div>
            <input
              type="number"
              step="0.01"
              min={0}
              max={amountPaid}
              value={refundAmount === '' ? '' : refundAmount}
              onChange={(e) => setRefundAmount(e.target.value === '' ? '' : Number(e.target.value))}
              placeholder={amountPaid ? `${amountPaid.toFixed(2)}` : '0.00'}
              style={{ padding: '6px 8px', width: 120, borderRadius: 6, border: '1px solid #d1d5db' }}
            />
          </div>
          <button
            type="button"
            onClick={async () => {
              const amt = typeof refundAmount === 'number' ? refundAmount : Number(refundAmount);
              if (!amt || amt <= 0) {
                // eslint-disable-next-line no-alert
                alert('Please enter a refund amount greater than 0');
                return;
              }
              if (amt > amountPaid) {
                // eslint-disable-next-line no-alert
                alert('Refund amount cannot exceed amount paid');
                return;
              }
              if (!confirm(`Process refund of $${amt.toFixed(2)} for this booking?`)) return;
              setLoading(true);
              try {
                const targetId = id?.toString().replace(/^drafts\./, '') || '';
                const res = await fetch(`/api/bookings/${targetId}`, {
                  method: 'PATCH',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ action: 'refund', amount: amt }),
                });
                if (!res.ok) {
                  const text = await res.text().catch(() => '');
                  throw new Error(`${res.status} ${text}`);
                }
                window.location.reload();
              } catch (err: any) {
                // eslint-disable-next-line no-alert
                alert('Refund failed: ' + (err?.message ?? err));
                setLoading(false);
              }
            }}
            disabled={loading || !id}
            style={{
              background: '#b91c1c',
              color: 'white',
              border: 'none',
              padding: '8px 12px',
              borderRadius: 6,
              cursor: id ? 'pointer' : 'not-allowed',
            }}
          >
            {loading ? 'Working…' : 'Refund payment'}
          </button>
        </div>
      )}
    </div>
  );
};

export default ApproveBookingButton;
