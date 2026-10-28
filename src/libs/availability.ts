import sanityClient from './sanity';

export type CalendarEvent = {
  id: string;
  summary: string;
  guestName: string | null;
  description: string;
  location: string | null;
  start: string | null;
  end: string | null;
  url: string | null;
  allDay: boolean;
  blocked: boolean;
  reserved: boolean;
  source: string | null;
};

export type Availability = {
  blockedDates: string[];
  calendarEvents: CalendarEvent[];
};

const activeBookingsQuery = `*[_type == "booking" && status != "rejected" && status != "deleted" && status != "cancelled" && status != "refunded"]{checkinDate, checkoutDate}`;

function parseIcsDate(value: string): string | null {
  if (!value) return null;

  if (/^\d{8}$/.test(value)) {
    return `${value.slice(0, 4)}-${value.slice(4, 6)}-${value.slice(6, 8)}T00:00:00.000Z`;
  }

  const utcDateTime = value.match(/^(\d{8})T(\d{6})Z$/);
  if (utcDateTime) {
    const date = utcDateTime[1];
    const time = utcDateTime[2];
    return `${date.slice(0, 4)}-${date.slice(4, 6)}-${date.slice(6, 8)}T${time.slice(0, 2)}:${time.slice(2, 4)}:${time.slice(4, 6)}.000Z`;
  }

  const localDateTime = value.match(/^(\d{8})T(\d{6})$/);
  if (localDateTime) {
    const date = localDateTime[1];
    const time = localDateTime[2];
    return `${date.slice(0, 4)}-${date.slice(4, 6)}-${date.slice(6, 8)}T${time.slice(0, 2)}:${time.slice(2, 4)}:${time.slice(4, 6)}.000Z`;
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
}

function parseCalendarEvents(text: string, sourceUrl: string): CalendarEvent[] {
  const events: CalendarEvent[] = [];
  const veventRegex = /BEGIN:VEVENT([\s\S]*?)END:VEVENT/gim;
  let match: RegExpExecArray | null;

  while ((match = veventRegex.exec(text)) !== null) {
    const item: Record<string, string> = {};
    for (const line of match[1].split(/\r?\n/).map(value => value.trim()).filter(Boolean)) {
      const separator = line.indexOf(':');
      if (separator === -1) continue;
      const key = line.slice(0, separator).split(';')[0].toUpperCase();
      const value = line.slice(separator + 1);
      if (['UID', 'SUMMARY', 'DESCRIPTION', 'DTSTART', 'DTEND', 'URL', 'LOCATION'].includes(key)) item[key] = value;
    }

    const start = parseIcsDate(item.DTSTART || '');
    const end = parseIcsDate(item.DTEND || '');
    const sourceHint = [sourceUrl, item.URL, item.DESCRIPTION, item.SUMMARY].filter(Boolean).join(' ').toLowerCase();
    const reserved = /reserved|booked|booking|occupied|confirmed|unavailable|blocked|reservation/i;

    events.push({
      id: item.UID || `${start}-${events.length}`,
      summary: item.SUMMARY || '',
      guestName: (item.SUMMARY || '').match(/^\s*reserved\s*[-:]\s*(.+?)\s*$/i)?.[1] || null,
      description: item.DESCRIPTION || '',
      location: item.LOCATION || null,
      start,
      end,
      url: item.URL || null,
      allDay: /^\d{8}$/.test(item.DTSTART || ''),
      blocked: /blocked/i.test(item.SUMMARY || '') || /blocked/i.test(item.DESCRIPTION || ''),
      reserved: reserved.test(item.SUMMARY || '') || reserved.test(item.DESCRIPTION || '') || /vrbo|airbnb|booking\.com/.test(sourceHint),
      source: /vrbo/.test(sourceHint) ? 'vrbo' : /airbnb/.test(sourceHint) ? 'airbnb' : null,
    });
  }

  return events;
}

export async function fetchCalendarEvents(): Promise<CalendarEvent[]> {
  const url = process.env.VRBO_ICAL_URL || process.env.VRBO_ICAL || process.env.GOOGLE_ICAL_URL;
  if (!url) throw new Error('Missing iCal URL');

  const response = await fetch(url, { cache: 'no-store', signal: AbortSignal.timeout(10000) });
  if (!response.ok) throw new Error(`iCal request failed with status ${response.status}`);

  const text = (await response.text()).replace(/\r?\n[ \t]/g, '');
  return parseCalendarEvents(text, url);
}

function dateKey(value: string): string {
  return value.split('T')[0];
}

function addDate(dateKeyValue: string, days: number): string {
  const date = new Date(`${dateKeyValue}T00:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().split('T')[0];
}

function expandRange(start: string, end: string): string[] {
  const startKey = dateKey(start);
  const endKey = dateKey(end);
  const dates: string[] = [];
  for (let current = startKey; current < endKey; current = addDate(current, 1)) dates.push(current);
  return dates;
}

export async function getAvailability(): Promise<Availability> {
  const [blocked, bookings, calendarEvents] = await Promise.all([
    sanityClient.fetch<Array<{ date?: string }>>(`*[_type == "blockedDate"]{date}`, {}, { cache: 'no-store' }),
    sanityClient.fetch<Array<{ checkinDate?: string; checkoutDate?: string }>>(activeBookingsQuery, {}, { cache: 'no-store' }),
    fetchCalendarEvents(),
  ]);

  const dates = new Set<string>();
  blocked.forEach(item => { if (item.date) dates.add(dateKey(item.date)); });
  bookings.forEach(item => {
    if (item.checkinDate && item.checkoutDate) expandRange(item.checkinDate, item.checkoutDate).forEach(date => dates.add(date));
  });
  calendarEvents.forEach(event => {
    if (event.reserved && event.start && event.end) expandRange(event.start, event.end).forEach(date => dates.add(date));
  });

  return { blockedDates: Array.from(dates).sort(), calendarEvents };
}

export function rangeIsAvailable(availability: Availability, checkinDate: string, checkoutDate: string): boolean {
  const start = dateKey(checkinDate);
  const end = dateKey(checkoutDate);
  const dates = start === end ? [start] : expandRange(start, end);
  return dates.every(date => !availability.blockedDates.includes(date));
}