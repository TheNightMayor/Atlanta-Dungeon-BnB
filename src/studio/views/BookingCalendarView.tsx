'use client'

import React from 'react'
import { BookingCalendar } from '@/components/BookingCalendar'

export default function BookingCalendarView() {
  return (
    <div className="h-full w-full overflow-auto">
      <BookingCalendar />
    </div>
  )
}
