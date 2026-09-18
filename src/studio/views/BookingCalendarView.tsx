import React, { lazy, Suspense } from 'react'
import { useClient } from 'sanity'
import { useRouter, useRouterState } from 'sanity/router'

const BookingCalendar = lazy(() =>
  import('../../components/BookingCalendar').then(({ BookingCalendar: Component }) => ({ default: Component }))
)

export default function BookingCalendarView() {
  const client = useClient({apiVersion: '2021-10-21'})
  const router = useRouter()
  const routerState = useRouterState()

  const handleOpenBooking = (bookingId: string) => {
    const currentState = routerState as {panes?: Array<Array<{id: string; params?: Record<string, string>}>>}
    const currentPanes = currentState?.panes || []

    router.navigate({
      ...(routerState as Record<string, unknown>),
      panes: [
        ...currentPanes,
        [{id: bookingId, params: {type: 'booking'}}],
      ],
    })
  }

  return (
    <div style={{ height: '100%', width: '100%', overflow: 'auto' }}>
      <Suspense fallback={<div style={{ padding: 20 }}>Loading calendar...</div>}>
        <BookingCalendar
          client={client}
          onOpenBooking={handleOpenBooking}
        />
      </Suspense>
    </div>
  )
}
