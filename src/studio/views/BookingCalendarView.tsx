import React from 'react'
import { useClient } from 'sanity'
import { BookingCalendar } from '../../components/BookingCalendar'

export default function BookingCalendarView() {
  const client = useClient({apiVersion: '2021-10-21'})

  return (
    <div style={{ height: '100%', width: '100%', overflow: 'auto' }}>
      <BookingCalendar client={client} />
    </div>
  )
}
