'use client';

import React, { useState, useEffect } from 'react';
import { sanityClient } from '@/lib/sanityClient';
import { type Booking } from '@/models/booking';

interface BookingEvent {
  date: string;
  bookings: Booking[];
}

export function BookingCalendar() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
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

        const result = await sanityClient.fetch(query);
        setBookings(result);
      } catch (error) {
        console.error('Failed to fetch bookings:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchBookings();
  }, []);

  const getBookingsForDate = (date: Date): Booking[] => {
    const dateStr = date.toISOString().split('T')[0];
    return bookings.filter(booking => {
      const checkIn = booking.checkinDate;
      const checkOut = booking.checkoutDate;
      return dateStr >= checkIn && dateStr < checkOut;
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

    // Empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }

    // Days of the month
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

  const calendarDays = generateCalendarDays();
  const monthName = currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' });

  if (loading) {
    return <div className="p-4">Loading bookings...</div>;
  }

  return (
    <div className="w-full max-w-6xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Booking Calendar</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <button
              onClick={handlePrevMonth}
              className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
            >
              ← Previous
            </button>
            <h2 className="text-xl font-semibold">{monthName}</h2>
            <button
              onClick={handleNextMonth}
              className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
            >
              Next →
            </button>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 gap-2 mb-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-center font-semibold text-gray-600 py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-2">
            {calendarDays.map((day, idx) => {
              if (day === null) {
                return <div key={`empty-${idx}`} className="h-24 bg-gray-50 rounded" />;
              }

              const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
              const dayBookings = getBookingsForDate(date);
              const isToday = new Date().toDateString() === date.toDateString();

              return (
                <div
                  key={day}
                  onClick={() => setSelectedDate(date.toISOString().split('T')[0])}
                  className={`h-24 p-2 rounded border-2 cursor-pointer transition ${
                    isToday ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                  } ${
                    selectedDate === date.toISOString().split('T')[0]
                      ? 'bg-blue-100'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="font-semibold text-gray-800 mb-1">{day}</div>
                  {dayBookings.length > 0 && (
                    <div className="space-y-1">
                      {dayBookings.slice(0, 2).map(booking => (
                        <div
                          key={booking._id}
                          className="text-xs bg-orange-100 text-orange-800 px-1 py-0.5 rounded truncate"
                        >
                          {booking.hotelRoom?.name || 'Unknown Room'}
                        </div>
                      ))}
                      {dayBookings.length > 2 && (
                        <div className="text-xs text-gray-500">+{dayBookings.length - 2} more</div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Sidebar - Bookings for selected date or upcoming */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4">
            {selectedDate ? `Bookings for ${selectedDate}` : 'Upcoming Bookings'}
          </h3>

          <div className="space-y-3 max-h-96 overflow-y-auto">
            {(selectedDate
              ? getBookingsForDate(new Date(selectedDate))
              : bookings.slice(0, 10)
            ).length === 0 ? (
              <p className="text-gray-500">No bookings for this date</p>
            ) : (
              (selectedDate
                ? getBookingsForDate(new Date(selectedDate))
                : bookings.slice(0, 10)
              ).map(booking => (
                <div key={booking._id} className="p-3 bg-gray-50 rounded border border-gray-200">
                  <div className="font-semibold text-sm text-gray-800">
                    {booking.hotelRoom?.name}
                  </div>
                  <div className="text-xs text-gray-600 mt-1">
                    {booking.hotelRoom?.name}
                  </div>
                  <div className="text-xs text-gray-600">
                    {booking.checkinDate} → {booking.checkoutDate}
                  </div>
                  <div className="text-xs text-gray-600">
                    {booking.adults} adults {booking.children > 0 ? `+ ${booking.children} children` : ''}
                  </div>
                  <div className="text-xs font-semibold text-gray-800 mt-2">
                    ${booking.totalPrice}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
