import React, { lazy, Suspense } from 'react'
import { useClient } from 'sanity'
import { useRouter } from 'sanity/router'

const BookingCalendar = lazy(() =>
  import('../../components/BookingCalendar').then(({ BookingCalendar: Component }) => ({ default: Component }))
)

export default function BookingCalendarView() {
  const client = useClient({apiVersion: '2021-10-21'})
  const router = useRouter()

  return (
    <div style={{ height: '100%', width: '100%', overflow: 'auto' }}>
      <Suspense fallback={<div style={{ padding: 20 }}>Loading calendar...</div>}>
        <BookingCalendar
          client={client}
          onOpenBooking={(bookingId) => router.navigateIntent('edit', {id: bookingId, type: 'booking'})}
        />
      </Suspense>
    </div>
  )
}
