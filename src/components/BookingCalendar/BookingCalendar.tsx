import React, { useState, useEffect } from 'react';
import { type Booking } from '../../models/booking';

interface BookingCalendarProps {
  client?: any;
}

export function BookingCalendar({ client }: BookingCalendarProps) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
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
  }, [client]);

  const getBookingsForDate = (date: Date): Booking[] => {
    const dateStr = date.toISOString().split('T')[0];
    return bookings.filter(booking => {
      const checkIn = booking.checkinDate;
      const checkOut = booking.checkoutDate;
      return dateStr >= checkIn && dateStr <= checkOut;
    });
  };

  const daysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
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
                const isSelected = selectedDate === date.toISOString().split('T')[0];

                return (
                  <div
                    key={day}
                    onClick={() => setSelectedDate(date.toISOString().split('T')[0])}
                    style={{
                      height: '100px',
                      width: '100%',
                      padding: '8px',
                      background: isSelected ? colors.selectedBg : isToday ? colors.todayBg : colors.surface,
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
                      if (!isSelected) {
                        e.currentTarget.style.background = colors.hoverBg;
                      }
                    }}
                    onMouseOut={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.background = isToday ? colors.todayBg : colors.surface;
                      }
                    }}
                  >
                    <div style={{ fontWeight: '600', color: colors.text, marginBottom: '4px', fontSize: '14px' }}>
                      {day}
                    </div>
                    {dayBookings.length > 0 && (
                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '3px', overflow: 'hidden', width: '100%' }}>
                        {dayBookings.slice(0, 2).map(booking => (
                          <div
                            key={booking._id}
                            style={{
                              fontSize: '11px',
                              background: colors.bookingBg,
                              color: colors.bookingText,
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
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Sidebar */}
          <div
            onClick={() => setSelectedDate(null)}
          >
            <div style={{ background: colors.surface, borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', padding: '16px', height: 'fit-content' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px', color: colors.text }}>
                {selectedDate ? `${selectedDate}` : '📋 Upcoming'}
              </h3>

              <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                {(selectedDate
                  ? getBookingsForDate(new Date(selectedDate))
                  : getFutureBookings().slice(0, 10)
                ).length === 0 ? (
                  <p style={{ fontSize: '14px', color: colors.textSecondary }}>No bookings</p>
                ) : (
                  (selectedDate
                    ? getBookingsForDate(new Date(selectedDate))
                    : getFutureBookings().slice(0, 10)
                  ).map(booking => (
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
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

