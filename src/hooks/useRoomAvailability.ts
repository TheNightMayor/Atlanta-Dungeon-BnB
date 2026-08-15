import { useEffect, useMemo, useState } from 'react';
import { sanityClient } from '@/lib/sanityClient';

type UseRoomAvailabilityResult = {
  loading: boolean;
  error: Error | null;
  blockedDates: string[]; // YYYY-MM-DD
  isBlocked: (date: Date) => boolean;
};

const toLocalDateKey = (d: Date) => d.toISOString().split('T')[0];

const parseIsoToLocalKey = (iso?: string | null) => {
  if (!iso) return null;
  try {
    const dstr = (iso || '').split('T')[0];
    const [y, m, d] = dstr.split('-').map(Number);
    if (!y || !m || !d) return null;
    return `${String(y).padStart(4, '0')}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
  } catch {
    const dt = new Date(iso as string);
    if (isNaN(dt.getTime())) return null;
    return toLocalDateKey(new Date(dt.getFullYear(), dt.getMonth(), dt.getDate()));
  }
};

const expandRangeToKeys = (start: string, end: string, inclusiveEnd = true) => {
  const a = new Date(start);
  const b = new Date(end);
  let cur = a < b ? a : b;
  const endDate = a < b ? b : a;
  const endLimit = new Date(endDate);
  if (!inclusiveEnd) endLimit.setDate(endLimit.getDate() - 1);
  const keys: string[] = [];
  for (let d = new Date(cur); d <= endLimit; d.setDate(d.getDate() + 1)) {
    keys.push(toLocalDateKey(new Date(d)));
  }
  return keys;
};

export default function useRoomAvailability(roomId?: string) : UseRoomAvailabilityResult {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [blockedKeys, setBlockedKeys] = useState<Set<string>>(new Set());

  useEffect(() => {
    let mounted = true;
    // Always fetch global availability (bookings/blocked-dates/ics) — not scoped to a room.
    setLoading(true);
    setError(null);

        async function fetchAll() {
      try {
        const [blockedJson, bookingsJson, icsRes] = await Promise.all([
          // blockedDates from Sanity
          sanityClient.fetch(`*[_type == "blockedDate"]{_id, date}`),
          // all bookings (global)
          sanityClient.fetch(`*[_type == 'booking' && status != "rejected" && status != "deleted" && status != "cancelled" && status != "refunded"]{_id, checkinDate, checkoutDate, status, hotelRoom->{_id}}`),
          // external iCal events via API
          fetch('/api/calendar-ics')
        ]);

        const icsJson = (icsRes && icsRes.ok) ? await icsRes.json() : [];

        // Debug: log fetched payloads to help trace missing booking dates
        // debug logs removed

        const keys = new Set<string>();


        // blocked-dates (Sanity)
        (blockedJson || []).forEach((b: any) => {
          const key = parseIsoToLocalKey(b?.date);
          if (key) keys.add(key);
        });

        // bookings (global from Sanity) - treat checkoutDate as exclusive (guest checks out that day)
        (bookingsJson || []).forEach((b: any) => {
          if (!b?.checkinDate || !b?.checkoutDate) return;
          const range = expandRangeToKeys(b.checkinDate, b.checkoutDate, false);
          range.forEach(k => keys.add(k));
        });

        // ics reserved events
        (icsJson || []).forEach((ev: any) => {
          if (!ev?.reserved) return;
          const start = parseIsoToLocalKey(ev.start || ev?.dtstart || ev?.start);
          const end = parseIsoToLocalKey(ev.end || ev?.dtend || ev?.end || ev?.start);
          if (!start || !end) return;
          const range = expandRangeToKeys(start, end);
          range.forEach(k => keys.add(k));
        });

        if (!mounted) return;
        setBlockedKeys(keys);
        setLoading(false);
      } catch (err: any) {
        if (!mounted) return;
        setError(err instanceof Error ? err : new Error(String(err)));
        setLoading(false);
      }
    }

    fetchAll();

    return () => { mounted = false; };
  }, [roomId]);

  const blockedDates = useMemo(() => Array.from(blockedKeys).sort(), [blockedKeys]);

  const isBlocked = (date: Date) => blockedKeys.has(toLocalDateKey(date));

  return { loading, error, blockedDates, isBlocked };
}
