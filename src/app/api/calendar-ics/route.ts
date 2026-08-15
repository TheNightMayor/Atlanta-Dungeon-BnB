import { NextResponse } from 'next/server';

function unfoldLines(ics: string) {
  return ics.replace(/\r?\n[ \t]/g, '');
}

function parseIcsDate(value: string): string | null {
  if (!value) return null;
  // DATE (YYYYMMDD)
  if (/^\d{8}$/.test(value)) {
    const iso = `${value.slice(0,4)}-${value.slice(4,6)}-${value.slice(6,8)}`;
    return new Date(iso).toISOString();
  }
  // DATETIME with Z: YYYYMMDDTHHMMSSZ
  const dtz = value.match(/^(\d{8}T\d{6}Z)$/);
  if (dtz) {
    const s = value.replace(/^([0-9]{4})([0-9]{2})([0-9]{2})T([0-9]{2})([0-9]{2})([0-9]{2})Z$/, '$1-$2-$3T$4:$5:$6Z');
    return new Date(s).toISOString();
  }
  // DATETIME without Z: YYYYMMDDTHHMMSS or with timezone param - best-effort parse
  const dtNoZ = value.match(/^(\d{8}T\d{6})$/);
  if (dtNoZ) {
    const s = value.replace(/^([0-9]{4})([0-9]{2})([0-9]{2})T([0-9]{2})([0-9]{2})([0-9]{2})$/, '$1-$2-$3T$4:$5:$6');
    return new Date(s).toISOString();
  }
  // If already ISO-like, try Date
  const tryDate = new Date(value);
  if (!isNaN(tryDate.getTime())) return tryDate.toISOString();
  return null;
}

export async function GET() {
  try {
    const url = process.env.GOOGLE_ICAL_URL || process.env.VRBO_ICAL_URL || process.env.VRBO_ICAL;
    if (!url) {
      return NextResponse.json({ error: 'Missing iCal URL (set GOOGLE_ICAL_URL or VRBO_ICAL_URL)' }, { status: 500 });
    }

    const resp = await fetch(url);
    if (!resp.ok) {
      const text = await resp.text();
      return NextResponse.json({ error: 'Failed to fetch ics', detail: text }, { status: resp.status });
    }

    let text = await resp.text();
    text = unfoldLines(text);

    const veventRegex = /BEGIN:VEVENT([\s\S]*?)END:VEVENT/gim;
    const events: any[] = [];
    let match;
    while ((match = veventRegex.exec(text)) !== null) {
      const block = match[1];
      const lines = block.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
      const item: any = {};
      for (const line of lines) {
        const idx = line.indexOf(':');
        if (idx === -1) continue;
        const rawKey = line.slice(0, idx);
        const value = line.slice(idx + 1);
        const key = rawKey.split(';')[0].toUpperCase();
        if (key === 'UID') item.uid = value;
        else if (key === 'SUMMARY') item.summary = value;
        else if (key === 'DESCRIPTION') item.description = value;
        else if (key === 'DTSTART') item.dtstart = value;
        else if (key === 'DTEND') item.dtend = value;
        else if (key === 'URL') item.url = value;
        else if (key === 'LOCATION') item.location = value;
      }

      const start = parseIcsDate(item.dtstart || '');
      const end = parseIcsDate(item.dtend || '');
      // attempt to find a URL: prefer explicit URL field, otherwise extract first http(s) link from description
      let foundUrl = item.url;
      if (!foundUrl && item.description) {
        const m = item.description.match(/https?:\/\/[^\s)]+/i);
        if (m) foundUrl = m[0];
      }

      // Heuristic: treat events as reservations/unavailable if summary/description contains booking keywords
      const sourceHint = (item.url || item.description || item.summary || '').toLowerCase();
      const reservedKeywords = /reserved|booked|booking|occupied|confirmed|unavailable|blocked|reservation/i;
      const isReserved = reservedKeywords.test(item.summary || '') || reservedKeywords.test(item.description || '') || /vrbo|airbnb|booking\.com/.test(sourceHint);

      events.push({
        id: item.uid || `${start}-${Math.random()}`,
        summary: item.summary || '',
        description: item.description || '',
        start,
        end,
        url: foundUrl || null,
        location: item.location || null,
        allDay: !!(item.dtstart && /^\d{8}$/.test(item.dtstart)),
        reserved: !!isReserved,
        source: (/vrbo/.test(sourceHint) ? 'vrbo' : (/airbnb/.test(sourceHint) ? 'airbnb' : null))
      });
    }

    return NextResponse.json(events);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || String(err) }, { status: 500 });
  }
}
