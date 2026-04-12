import React, { useState, useEffect } from 'react';
import { type Booking } from '../../models/booking';

type IcsEvent = {
  id: string;
  summary?: string;
  description?: string;
  start?: string | null;
  end?: string | null;
  allDay?: boolean;
  url?: string;
};

interface BookingCalendarProps {
  client?: any;
}

export function BookingCalendar({ client }: BookingCalendarProps) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [icsEvents, setIcsEvents] = useState<IcsEvent[]>([]);
  const [blockedMap, setBlockedMap] = useState<Record<string, { id: string; reason?: string }>>({});
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [multiSelectMode, setMultiSelectMode] = useState(false);
  const [selectedDates, setSelectedDates] = useState<string[]>([]);
  const [bulkReason, setBulkReason] = useState<string>('');
  const [anchorDate, setAnchorDate] = useState<string | null>(null);
  const [bulkLoading, setBulkLoading] = useState(false);
  const [editingReason, setEditingReason] = useState(false);
  const [reasonInputValue, setReasonInputValue] = useState('');
  const [reasonSaving, setReasonSaving] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [isDarkMode, setIsDarkMode] = useState(true);

  useEffect(() => {
    const savedDarkMode = localStorage.getItem('bookingCalendarDarkMode') === 'true';
    setIsDarkMode(savedDarkMode);
  }, []);

  useEffect(() => {
    localStorage.setItem('bookingCalendarDarkMode', isDarkMode.toString());
  }, [isDarkMode]);

  useEffect(() => {
    if (!client) return;

    async function fetchBookings() {
      try {
        const query = `*[_type == "booking"] | order(checkinDate asc) {
          _id,
          checkinDate,
          checkoutDate,
          numberOfDays,
          adults,
          children,
          totalPrice,
          discount,
          hotelRoom->{
            _id,
            name,
            type,
            price
          },
          user->{
            _id,
            name,
            email
          }
        }`;

        const result = await client.fetch(query);
        setBookings(result);
      } catch (error) {
        console.error('Failed to fetch bookings:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchBookings();
    // fetch ICS events from server proxy
    async function fetchIcs() {
      try {
        const res = await fetch('/api/calendar-ics');
        if (!res.ok) {
          console.warn('Failed to fetch ICS events', await res.text());
          return;
        }
        const items: IcsEvent[] = await res.json();
        setIcsEvents(items || []);
      } catch (err) {
        console.error('Error fetching ICS events', err);
      }
    }

    fetchIcs();
    // fetch blocked dates
    async function fetchBlocked() {
      try {
        const res = await client.fetch(`*[_type == "blockedDate"]{_id, date, reason}`);
        const map: Record<string, { id: string; reason?: string }> = {};
        (res || []).forEach((b: any) => { if (b?.date) map[b.date] = { id: b._id, reason: b.reason }; });
        setBlockedMap(map);
      } catch (err) {
        console.error('Failed to fetch blocked dates', err);
      }
    }

    fetchBlocked();
  }, [client]);

  useEffect(() => {
    // reset reason edit state when changing selected date
    setEditingReason(false);
    setReasonInputValue('');
    setReasonSaving(false);
  }, [selectedDate]);

  const getBookingsForDate = (date: Date): Booking[] => {
    const dateStr = date.toISOString().split('T')[0];
    return bookings.filter(booking => {
      const checkIn = booking.checkinDate;
      const checkOut = booking.checkoutDate;
      return dateStr >= checkIn && dateStr <= checkOut;
    });
  };

  const getIcsEventsForDate = (date: Date): IcsEvent[] => {
    const dateStr = date.toISOString().split('T')[0];
    return icsEvents.filter(ev => {
      if (!ev.start) return false;
      const s = new Date(ev.start).toISOString().split('T')[0];
      const e = ev.end ? new Date(ev.end).toISOString().split('T')[0] : s;
      return dateStr >= s && dateStr <= e;
    });
  };

  const isBlocked = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return !!blockedMap[dateStr];
  };

  const getBlockedInfo = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return blockedMap[dateStr] || null;
  };

  const toggleBlocked = async (date: Date, reason?: string) => {
    const dateStr = date.toISOString().split('T')[0];
    try {
      if (blockedMap[dateStr]) {
        // delete
        await client.delete(blockedMap[dateStr].id);
        const copy = { ...blockedMap };
        delete copy[dateStr];
        setBlockedMap(copy);
      } else {
        const doc = await client.create({ _type: 'blockedDate', date: dateStr, reason: reason || '' });
        setBlockedMap({ ...blockedMap, [dateStr]: { id: doc._id, reason: reason || '' } });
      }
    } catch (err) {
      console.error('Failed to toggle blocked date', err);
    }
  };

  const daysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getDateRange = (aStr: string, bStr: string) => {
    const a = new Date(aStr);
    const b = new Date(bStr);
    let start = a < b ? a : b;
    let end = a < b ? b : a;
    const dates: string[] = [];
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      dates.push(new Date(d).toISOString().split('T')[0]);
    }
    return dates;
  };

  const firstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const generateCalendarDays = () => {
    const days = [];
    const totalDays = daysInMonth(currentMonth);
    const firstDay = firstDayOfMonth(currentMonth);

    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }

    for (let i = 1; i <= totalDays; i++) {
      days.push(i);
    }

    return days;
  };

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const handleToday = () => {
    setCurrentMonth(new Date());
  };

  const getFutureBookings = (): Booking[] => {
    const today = new Date().toISOString().split('T')[0];
    return bookings.filter(booking => booking.checkinDate > today);
  };

  const handleBookingClick = (booking: Booking) => {
    const bookingDate = new Date(booking.checkinDate);
    setSelectedDate(booking.checkinDate);
    setCurrentMonth(new Date(bookingDate.getFullYear(), bookingDate.getMonth()));
  };

  // Theme colors
  const colors = isDarkMode ? {
    bg: '#1a1a1a',
    surface: '#2d2d2d',
    text: '#e0e0e0',
    textSecondary: '#a0a0a0',
    border: '#404040',
    headerBg: '#f8f9fa',
    headerText: '#333',
    buttonBg: '#3d3d3d',
    buttonHover: '#4d4d4d',
    dayBg: '#f8f9fa',
    dayText: '#333',
    todayBorder: '#17a2b8',
    todayBg: '#1e3a3a',
    selectedBg: '#1a3a52',
    hoverBg: '#3d3d3d',
    bookingBg: '#4a3d2a',
    bookingText: '#ffd700',
  } : {
    bg: '#f8f9fa',
    surface: 'white',
    text: '#333',
    textSecondary: '#6c757d',
    border: '#dee2e6',
    headerBg: '#f8f9fa',
    headerText: '#333',
    buttonBg: '#e9ecef',
    buttonHover: '#dee2e6',
    dayBg: '#f8f9fa',
    dayText: '#333',
    todayBorder: '#17a2b8',
    todayBg: '#d1ecf1',
    selectedBg: '#cfe2ff',
    hoverBg: '#f0f0f0',
    bookingBg: '#fff3cd',
    bookingText: '#856404',
  };

  const calendarDays = generateCalendarDays();
  const monthName = currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' });

  if (loading || !client) {
    return <div style={{ padding: '20px', color: colors.text }}>Loading bookings...</div>;
  }

  return (
    <div
      style={{ width: '100%', minHeight: '100vh', background: colors.bg, padding: '20px', boxSizing: 'border-box', display: 'flex', flexDirection: 'column' }}
      onClick={() => setSelectedDate(null)}
    >
      <div style={{ maxWidth: '1200px', margin: '0 auto', flex: 1, width: '100%' }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: colors.text }}>Booking Calendar</h1>
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            style={{
              padding: '8px 14px',
              background: colors.buttonBg,
              color: colors.text,
              border: `1px solid ${colors.border}`,
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: '500',
              transition: 'all 0.2s ease',
            }}
            onMouseOver={(e) => (e.currentTarget.style.background = colors.buttonHover)}
            onMouseOut={(e) => (e.currentTarget.style.background = colors.buttonBg)}
          >
            {isDarkMode ? '☀️ Light' : '🌙 Dark'}
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '20px', alignItems: 'stretch', height: '100%' }} >
          {/* Calendar */}
          <div style={{ background: colors.surface, borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', padding: '20px' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', gap: '12px' }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={handlePrevMonth}
                  style={{
                    padding: '8px 16px',
                    background: colors.buttonBg,
                    color: colors.text,
                    border: `1px solid ${colors.border}`,
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseOver={(e) => (e.currentTarget.style.background = colors.buttonHover)}
                  onMouseOut={(e) => (e.currentTarget.style.background = colors.buttonBg)}
                >
                  ← Previous
                </button>
                <button
                  onClick={handleToday}
                  style={{
                    padding: '8px 16px',
                    background: colors.buttonBg,
                    color: colors.text,
                    border: `1px solid ${colors.border}`,
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseOver={(e) => (e.currentTarget.style.background = colors.buttonHover)}
                  onMouseOut={(e) => (e.currentTarget.style.background = colors.buttonBg)}
                >
                  Today
                </button>
              </div>
              <h2 style={{ fontSize: '20px', fontWeight: '600', color: colors.text }}>{monthName}</h2>
              <button
                onClick={handleNextMonth}
                style={{
                  padding: '8px 16px',
                  background: colors.buttonBg,
                  color: colors.text,
                  border: `1px solid ${colors.border}`,
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                  transition: 'all 0.2s ease',
                }}
                onMouseOver={(e) => (e.currentTarget.style.background = colors.buttonHover)}
                onMouseOut={(e) => (e.currentTarget.style.background = colors.buttonBg)}
              >
                Next →
              </button>
            </div>

            {/* Day headers */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '1px', background: colors.border, marginBottom: '1px' }}>
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div
                  key={day}
                  style={{
                    textAlign: 'center',
                    fontWeight: '600',
                    color: colors.textSecondary,
                    padding: '12px',
                    background: colors.surface,
                    fontSize: '13px',
                  }}
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '1px', background: colors.border }}>
                {calendarDays.map((day, idx) => {
                if (day === null) {
                  return <div key={`empty-${idx}`} style={{ background: colors.border, height: '100px', width: '100%' }} />;
                }

                const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
                const dayBookings = getBookingsForDate(date);
                const isToday = new Date().toDateString() === date.toDateString();
                const dateStr = date.toISOString().split('T')[0];
                const isSelected = selectedDate === dateStr;
                const isMultiSelected = selectedDates.includes(dateStr);

                return (
                  <div
                    key={day}
                    onClick={(e) => {
                        e.stopPropagation();
                        if (multiSelectMode) {
                          if (e.shiftKey && anchorDate) {
                            const range = getDateRange(anchorDate, dateStr);
                            setSelectedDate(null);
                            setSelectedDates(prev => {
                              const s = new Set(prev);
                              range.forEach(d => s.add(d));
                              return Array.from(s).sort();
                            });
                          } else {
                            setSelectedDate(null);
                            setSelectedDates(prev => prev.includes(dateStr) ? prev.filter(d => d !== dateStr) : [...prev, dateStr].sort());
                            setAnchorDate(dateStr);
                          }
                        } else if (e.shiftKey && (selectedDate || anchorDate)) {
                          // Activate multi-select when shift-clicking while a single date is selected
                          const start = selectedDate || anchorDate!;
                          const range = getDateRange(start, dateStr);
                          setMultiSelectMode(true);
                          setSelectedDate(null);
                          setSelectedDates(range);
                          setAnchorDate(start);
                        } else {
                          setSelectedDate(dateStr);
                          setAnchorDate(dateStr);
                        }
                      }}
                    style={{
                      position: 'relative',
                      height: '100px',
                      width: '100%',
                      padding: '8px',
                      background: isMultiSelected ? '#274c4c' : (isSelected ? colors.selectedBg : isToday ? colors.todayBg : (isBlocked(date) ? '#4a0b0b' : colors.surface)),
                      border: `1px solid ${colors.border}`,
                      boxShadow: isToday ? `inset 0 0 0 1px ${colors.todayBorder}` : 'none',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      transition: 'all 0.2s ease',
                      minWidth: 0,
                      overflow: 'hidden',
                      boxSizing: 'border-box',
                    }}
                    onMouseOver={(e) => {
                      if (!isSelected && !isMultiSelected) {
                        e.currentTarget.style.background = isBlocked(date) ? '#4a0b0b' : colors.hoverBg;
                      }
                    }}
                    onMouseOut={(e) => {
                      if (!isSelected && !isMultiSelected) {
                        e.currentTarget.style.background = isBlocked(date) ? '#4a0b0b' : (isToday ? colors.todayBg : colors.surface);
                      } else if (isMultiSelected) {
                        e.currentTarget.style.background = '#274c4c';
                      } else if (isSelected) {
                        e.currentTarget.style.background = colors.selectedBg;
                      }
                    }}
                  >
                    <div style={{ fontWeight: '600', color: isBlocked(date) ? 'rgba(255,255,255,0.6)' : colors.text, marginBottom: '4px', fontSize: '14px' }}>
                      {day}
                    </div>
                    {(dayBookings.length > 0 || getIcsEventsForDate(date).length > 0 || isBlocked(date)) && (
                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '3px', overflow: 'hidden', width: '100%' }}>
                        {dayBookings.slice(0, 2).map(booking => (
                          <div
                            key={booking._id}
                            style={{
                              fontSize: '11px',
                              background: colors.bookingBg,
                              color: isBlocked(date) ? 'rgba(255,255,255,0.6)' : colors.bookingText,
                              padding: '3px 5px',
                              borderRadius: '3px',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              width: '100%',
                              maxWidth: '100%',
                              boxSizing: 'border-box',
                            }}
                            title={booking.hotelRoom?.name}
                          >
                            {booking.hotelRoom?.name || 'Room'}
                          </div>
                        ))}
                        {dayBookings.length > 2 && (
                          <div style={{ fontSize: '10px', color: colors.textSecondary, fontStyle: 'italic' }}>
                            +{dayBookings.length - 2} more
                          </div>
                        )}

                        {getIcsEventsForDate(date).slice(0, 2).map(ev => (
                          ev.url ? (
                            <a
                              key={ev.id}
                              href={ev.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              style={{ textDecoration: 'none' }}
                            >
                              <div
                                  style={{
                                    fontSize: '11px',
                                    background: isDarkMode ? '#1f6feb' : '#cfe2ff',
                                    color: isBlocked(date) ? 'rgba(255,255,255,0.6)' : (isDarkMode ? '#dbeafe' : '#042c5c'),
                                    padding: '3px 5px',
                                    borderRadius: '3px',
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    width: '100%',
                                    boxSizing: 'border-box',
                                  }}
                                  title={ev.summary}
                                >
                                  {ev.summary}
                                </div>
                            </a>
                          ) : (
                            <div
                              key={ev.id}
                              style={{
                                fontSize: '11px',
                                background: isDarkMode ? '#1f6feb' : '#cfe2ff',
                                color: isDarkMode ? '#dbeafe' : '#042c5c',
                                padding: '3px 5px',
                                borderRadius: '3px',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                width: '100%',
                                boxSizing: 'border-box',
                              }}
                              title={ev.summary}
                            >
                              {ev.summary}
                            </div>
                          )
                        ))}

                        {getIcsEventsForDate(date).length > 2 && (
                          <div style={{ fontSize: '10px', color: colors.textSecondary, fontStyle: 'italic' }}>
                            +{getIcsEventsForDate(date).length - 2} more
                          </div>
                        )}

                        {/* blocked badge removed - cell will show tinted background with an X overlay */}
                      </div>
                    )}
                    {isBlocked(date) && (
                      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <div style={{ position: 'absolute', left: '10%', right: '10%', height: 4, background: 'rgba(255,255,255,0.28)', transform: 'rotate(45deg)', borderRadius: 2 }} />
                        <div style={{ position: 'absolute', left: '10%', right: '10%', height: 4, background: 'rgba(255,255,255,0.28)', transform: 'rotate(-45deg)', borderRadius: 2 }} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Sidebar */}
          <div onClick={() => setSelectedDate(null)}>
            <div onClick={(e) => e.stopPropagation()} style={{ background: colors.surface, borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', padding: '16px', height: 'fit-content' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '600', color: colors.text, margin: 0 }}>{selectedDate ? `${selectedDate}` : '📋 Upcoming'}</h3>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <button
                    onClick={() => { setMultiSelectMode(prev => { if (prev) { setSelectedDates([]); setSelectedDate(null); setAnchorDate(null); } return !prev; }); }}
                    style={{
                      padding: '6px 12px',
                      borderRadius: 9999,
                      border: `1px solid ${multiSelectMode ? '#0f5132' : colors.border}`,
                      background: multiSelectMode ? '#0f5132' : 'transparent',
                      color: multiSelectMode ? 'white' : colors.textSecondary,
                      cursor: 'pointer',
                      fontSize: 13,
                      fontWeight: 600,
                      boxShadow: multiSelectMode ? '0 1px 3px rgba(0,0,0,0.2)' : 'none',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {multiSelectMode ? 'Multi-select: ON' : 'Multi-select'}
                  </button>
                </div>
              </div>

              {selectedDate && (() => {
                const bd = getBlockedInfo(new Date(selectedDate));
                return (
                  <div style={{ marginBottom: 12 }}>
                    {bd ? (
                      <div style={{ padding: '8px', borderRadius: 6, background: isDarkMode ? '#3b0b0b' : '#fff0f0', color: isDarkMode ? '#ffdede' : '#7a1f1f' }}>
                        <div style={{ fontWeight: 700 }}>Blocked</div>
                        {!editingReason ? (
                          bd.reason ? <div style={{ fontSize: 13, marginTop: 6 }}>{bd.reason}</div> : <div style={{ fontSize: 13, marginTop: 6, color: isDarkMode ? '#ffdfdf' : '#8a1f1f' }}>No reason provided</div>
                        ) : (
                          <textarea value={reasonInputValue} onChange={(e) => setReasonInputValue(e.target.value)} placeholder="Reason (optional)" style={{ width: '100%', minHeight: 64, padding: 8, borderRadius: 6, border: `1px solid ${colors.border}`, boxSizing: 'border-box', marginTop: 6 }} />
                        )}
                        <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
                          {!editingReason ? (
                            <>
                              <button onClick={() => { setEditingReason(true); setReasonInputValue(bd.reason || ''); }} style={{ padding: '6px 8px', borderRadius: 4, background: '#254a57', color: 'white', border: 'none', cursor: 'pointer' }}>Edit reason</button>
                              <button onClick={() => toggleBlocked(new Date(selectedDate))} style={{ padding: '6px 8px', borderRadius: 4, background: '#7a1f1f', color: 'white', border: 'none', cursor: 'pointer' }}>Make available</button>
                            </>
                          ) : (
                            <>
                              <button disabled={reasonSaving} onClick={async () => {
                                if (!bd) return;
                                setReasonSaving(true);
                                try {
                                  await client.patch(bd.id).set({ reason: reasonInputValue || '' }).commit();
                                  setBlockedMap(prev => ({ ...prev, [selectedDate!]: { id: bd.id, reason: reasonInputValue || '' } }));
                                  setEditingReason(false);
                                } catch (err) {
                                  console.error('Failed to save reason', err);
                                } finally {
                                  setReasonSaving(false);
                                }
                              }} style={{ padding: '6px 8px', borderRadius: 4, background: '#0f5132', color: 'white', border: 'none', cursor: reasonSaving ? 'wait' : 'pointer' }}>
                                {reasonSaving ? (
                                  <svg width="14" height="14" viewBox="0 0 24 24" style={{ verticalAlign: 'middle', marginRight: 6 }}>
                                    <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="2" strokeDasharray="60" strokeDashoffset="40" fill="none">
                                      <animateTransform attributeName="transform" attributeType="XML" type="rotate" from="0 12 12" to="360 12 12" dur="0.8s" repeatCount="indefinite" />
                                    </circle>
                                  </svg>
                                ) : null}
                                Save
                              </button>
                              <button disabled={reasonSaving} onClick={() => { setEditingReason(false); setReasonInputValue(bd.reason || ''); }} style={{ padding: '6px 8px', borderRadius: 4, background: '#6c757d', color: 'white', border: 'none', cursor: reasonSaving ? 'wait' : 'pointer' }}>Cancel</button>
                            </>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div style={{ padding: '8px', borderRadius: 6, background: isDarkMode ? '#14332b' : '#f0fff4', color: isDarkMode ? '#bfffdc' : '#0f5132' }}>
                        <div style={{ fontWeight: 700 }}>Available</div>
                        <div style={{ marginTop: 8 }}>
                          <button onClick={() => toggleBlocked(new Date(selectedDate))} style={{ padding: '6px 8px', borderRadius: 4, background: '#0f5132', color: 'white', border: 'none', cursor: 'pointer' }}>Block date</button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}

              {multiSelectMode && (
                <div style={{ marginBottom: 12 }}>
                  <div style={{ fontSize: 13, color: colors.textSecondary, marginBottom: 8 }}>{selectedDates.length} selected</div>
                  <input placeholder="Reason (optional)" value={bulkReason} onChange={(e) => setBulkReason(e.target.value)} style={{ width: '100%', padding: '8px', marginBottom: 8, borderRadius: 6, border: `1px solid ${colors.border}`, boxSizing: 'border-box' }} />
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button disabled={bulkLoading} onClick={async () => {
                      const toBlock = selectedDates.filter(d => !blockedMap[d]);
                      if (toBlock.length === 0) return;
                      setBulkLoading(true);
                      try {
                        const copy = { ...blockedMap };
                        for (const d of toBlock) {
                          const doc = await client.create({ _type: 'blockedDate', date: d, reason: bulkReason || '' });
                          copy[d] = { id: doc._id, reason: bulkReason || '' };
                        }
                        setBlockedMap(copy);
                        setSelectedDates([]);
                        setBulkReason('');
                      } catch (err) {
                        console.error('Failed to block selected dates', err);
                      } finally {
                        setBulkLoading(false);
                      }
                    }} style={{ padding: '6px 8px', borderRadius: 4, background: '#0f5132', color: 'white', border: 'none', cursor: bulkLoading ? 'wait' : 'pointer', opacity: bulkLoading ? 0.8 : 1 }}>
                      {bulkLoading ? (
                        <svg width="14" height="14" viewBox="0 0 24 24" style={{ verticalAlign: 'middle', marginRight: 6 }}>
                          <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="2" strokeDasharray="60" strokeDashoffset="40" fill="none">
                            <animateTransform attributeName="transform" attributeType="XML" type="rotate" from="0 12 12" to="360 12 12" dur="0.8s" repeatCount="indefinite" />
                          </circle>
                        </svg>
                      ) : null}
                      Block selected
                    </button>

                    <button disabled={bulkLoading} onClick={async () => {
                      const toUnblock = selectedDates.filter(d => blockedMap[d]);
                      if (toUnblock.length === 0) return;
                      setBulkLoading(true);
                      try {
                        const copy = { ...blockedMap };
                        for (const d of toUnblock) {
                          await client.delete(copy[d].id);
                          delete copy[d];
                        }
                        setBlockedMap(copy);
                        setSelectedDates([]);
                      } catch (err) {
                        console.error('Failed to unblock selected dates', err);
                      } finally {
                        setBulkLoading(false);
                      }
                    }} style={{ padding: '6px 8px', borderRadius: 4, background: '#7a1f1f', color: 'white', border: 'none', cursor: bulkLoading ? 'wait' : 'pointer', opacity: bulkLoading ? 0.8 : 1 }}>
                      {bulkLoading ? (
                        <svg width="14" height="14" viewBox="0 0 24 24" style={{ verticalAlign: 'middle', marginRight: 6 }}>
                          <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="2" strokeDasharray="60" strokeDashoffset="40" fill="none">
                            <animateTransform attributeName="transform" attributeType="XML" type="rotate" from="0 12 12" to="360 12 12" dur="0.8s" repeatCount="indefinite" />
                          </circle>
                        </svg>
                      ) : null}
                      Unblock selected
                    </button>
                  </div>
                </div>
              )}

              <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                {selectedDate ? (
                  (() => {
                    const dateObj = new Date(selectedDate);
                    const ics = getIcsEventsForDate(dateObj);
                    const bks = getBookingsForDate(dateObj);
                    if (ics.length === 0 && bks.length === 0) return <p style={{ fontSize: '14px', color: colors.textSecondary }}>No events or bookings</p>;

                    return (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {ics.map(ev => (
                          <div key={ev.id} style={{ padding: '8px', borderRadius: 6, background: isDarkMode ? '#0b2540' : '#eef6ff', border: `1px solid ${colors.border}` }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                              <div style={{ fontWeight: 700, color: isDarkMode ? '#cfe8ff' : '#0b3a66' }}>{ev.summary || 'Event'}</div>
                              {ev.url && (
                                <a href={ev.url} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} style={{ color: isDarkMode ? '#bfe0ff' : '#0b3a66', textDecoration: 'underline', fontSize: 13 }}>Open</a>
                              )}
                            </div>

                            {ev.start && (
                              <div style={{ marginTop: 6, color: colors.textSecondary, fontSize: 13 }}>
                                {(() => {
                                  try {
                                    const s = new Date(ev.start as string);
                                    const e = ev.end ? new Date(ev.end as string) : null;
                                    const opts: Intl.DateTimeFormatOptions = { hour: 'numeric', minute: '2-digit' };
                                    return (`${s.toLocaleDateString()}${e ? ` • ${s.toLocaleTimeString([], opts)} - ${e.toLocaleTimeString([], opts)}` : ''}`);
                                  } catch (_) { return ev.start; }
                                })()}
                              </div>
                            )}

                            {ev.location && (
                              <div style={{ marginTop: 6, color: colors.textSecondary, fontSize: 13 }}>📍 {ev.location}</div>
                            )}

                            {ev.description && <div style={{ marginTop: 8, color: colors.textSecondary, fontSize: 13 }}>{ev.description}</div>}
                          </div>
                        ))}

                        {bks.map(booking => (
                          <div
                            key={booking._id}
                            onClick={() => handleBookingClick(booking)}
                            style={{
                              padding: '10px',
                              background: isDarkMode ? '#3d3d3d' : '#f8f9fa',
                              borderRadius: '4px',
                              marginBottom: '0',
                              border: `1px solid ${colors.border}`,
                              fontSize: '12px',
                              cursor: 'pointer',
                              transition: 'all 0.2s ease'
                            }}
                            onMouseOver={(e) => {
                              e.currentTarget.style.background = isDarkMode ? '#4d4d4d' : '#e9ecef';
                              e.currentTarget.style.transform = 'translateY(-2px)';
                            }}
                            onMouseOut={(e) => {
                              e.currentTarget.style.background = isDarkMode ? '#3d3d3d' : '#f8f9fa';
                              e.currentTarget.style.transform = 'translateY(0)';
                            }}
                          >
                            <div style={{ fontWeight: '600', color: colors.text, marginBottom: '4px' }}>
                              {booking.hotelRoom?.name}
                            </div>
                            <div style={{ color: colors.textSecondary, fontSize: '11px', marginBottom: '3px' }}>
                              {booking.checkinDate} → {booking.checkoutDate}
                            </div>
                            <div style={{ color: colors.textSecondary, fontSize: '11px', marginBottom: '4px' }}>
                              {booking.adults} adults {booking.children > 0 ? `+ ${booking.children} children` : ''}
                            </div>
                            <div style={{ fontWeight: '600', color: isDarkMode ? '#4ade80' : '#28a745', fontSize: '13px' }}>
                              ${booking.totalPrice}
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  })()
                ) : (
                  (() => {
                    const future = getFutureBookings().slice(0, 10);
                    if (future.length === 0) return <p style={{ fontSize: '14px', color: colors.textSecondary }}>No bookings</p>;
                    return future.map(booking => (
                      <div
                        key={booking._id}
                        onClick={() => handleBookingClick(booking)}
                        style={{
                          padding: '10px',
                          background: isDarkMode ? '#3d3d3d' : '#f8f9fa',
                          borderRadius: '4px',
                          marginBottom: '8px',
                          border: `1px solid ${colors.border}`,
                          fontSize: '12px',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease'
                        }}
                        onMouseOver={(e) => {
                          e.currentTarget.style.background = isDarkMode ? '#4d4d4d' : '#e9ecef';
                          e.currentTarget.style.transform = 'translateY(-2px)';
                        }}
                        onMouseOut={(e) => {
                          e.currentTarget.style.background = isDarkMode ? '#3d3d3d' : '#f8f9fa';
                          e.currentTarget.style.transform = 'translateY(0)';
                        }}
                      >
                        <div style={{ fontWeight: '600', color: colors.text, marginBottom: '4px' }}>
                          {booking.hotelRoom?.name}
                        </div>
                        <div style={{ color: colors.textSecondary, fontSize: '11px', marginBottom: '3px' }}>
                          {booking.checkinDate} → {booking.checkoutDate}
                        </div>
                        <div style={{ color: colors.textSecondary, fontSize: '11px', marginBottom: '4px' }}>
                          {booking.adults} adults {booking.children > 0 ? `+ ${booking.children} children` : ''}
                        </div>
                        <div style={{ fontWeight: '600', color: isDarkMode ? '#4ade80' : '#28a745', fontSize: '13px' }}>
                          ${booking.totalPrice}
                        </div>
                      </div>
                    ));
                  })()
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

