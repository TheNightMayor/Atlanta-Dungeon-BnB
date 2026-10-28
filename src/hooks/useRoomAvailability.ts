import { useEffect, useMemo, useState } from 'react';

type UseRoomAvailabilityResult = {
  loading: boolean;
  error: Error | null;
  blockedDates: string[]; // YYYY-MM-DD
  isBlocked: (date: Date) => boolean;
};

const toLocalDateKey = (d: Date) => d.toISOString().split('T')[0];

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
        const response = await fetch('/api/availability', { cache: 'no-store' });
        if (!response.ok) throw new Error('Availability is temporarily unavailable');
        const payload = await response.json() as { blockedDates?: string[] };
        const keys = new Set((payload.blockedDates || []).filter(Boolean));

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
