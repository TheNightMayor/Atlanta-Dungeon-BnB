import React, { lazy, Suspense } from 'react'
import { useClient } from 'sanity'
import { usePaneRouter } from 'sanity/structure'

const BookingCalendar = lazy(() =>
  import('../../components/BookingCalendar').then(({ BookingCalendar: Component }) => ({ default: Component }))
)

export default function BookingCalendarView() {
  const client = useClient({apiVersion: '2021-10-21'})
  const paneRouter = usePaneRouter()

  return (
    <div style={{ height: '100%', width: '100%', overflow: 'auto' }}>
      <Suspense fallback={<div style={{ padding: 20 }}>Loading calendar...</div>}>
        <BookingCalendar
          client={client}
          onOpenBooking={(bookingId) => paneRouter.navigateIntent('edit', {id: bookingId, type: 'booking'})}
        />
      </Suspense>
    </div>
  )
}
