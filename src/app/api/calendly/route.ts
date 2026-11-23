import { NextResponse } from 'next/server'

const CALENDLY_BASE = 'https://api.calendly.com'

async function calendlyFetch(path: string, token: string) {
  const res = await fetch(`${CALENDLY_BASE}${path}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    next: { revalidate: 60 },
  })
  if (!res.ok) throw new Error(`Calendly ${path} → ${res.status}`)
  return res.json()
}

export async function GET() {
  const token = process.env.CALENDLY_TOKEN
  if (!token) {
    return NextResponse.json({ error: 'CALENDLY_TOKEN not set' }, { status: 500 })
  }

  try {
    const { resource: user } = await calendlyFetch('/users/me', token)
    const userUri = user.uri

    const now = new Date()
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    const thirtyDaysAhead = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()
    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).toISOString()
    const startOfWeek = new Date(now.getTime() - now.getDay() * 24 * 60 * 60 * 1000)
    startOfWeek.setHours(0, 0, 0, 0)

    const [eventTypesData, upcomingData, pastData] = await Promise.all([
      calendlyFetch(
        `/event_types?user=${encodeURIComponent(userUri)}&active=true&count=20`,
        token
      ),
      calendlyFetch(
        `/scheduled_events?user=${encodeURIComponent(userUri)}&status=active&min_start_time=${now.toISOString()}&max_start_time=${thirtyDaysAhead.toISOString()}&count=100`,
        token
      ),
      calendlyFetch(
        `/scheduled_events?user=${encodeURIComponent(userUri)}&min_start_time=${thirtyDaysAgo.toISOString()}&max_start_time=${now.toISOString()}&count=100`,
        token
      ),
    ])

    const upcoming: Array<{ name: string; start_time: string; end_time: string; status: string; location?: { type?: string } }> = upcomingData.collection ?? []
    const past: Array<{ start_time: string; status: string }> = pastData.collection ?? []

    const todayCount = upcoming.filter(
      (e) => e.start_time >= startOfToday && e.start_time < endOfToday
    ).length

    const thisWeekCount = upcoming.filter(
      (e) => new Date(e.start_time) >= startOfWeek
    ).length

    const totalPast = past.length
    // Calendly marks cancelled events with status "canceled"
    const cancelledPast = past.filter((e) => e.status === 'canceled').length
    const heldPast = totalPast - cancelledPast
    const showUpRate = totalPast > 0 ? Math.round((heldPast / totalPast) * 100) : null

    return NextResponse.json({
      user: {
        name: user.name,
        email: user.email,
        timezone: user.timezone,
        schedulingUrl: user.scheduling_url,
      },
      eventTypes: (eventTypesData.collection ?? []).map(
        (et: { name: string; duration: number; scheduling_url: string }) => ({
          name: et.name,
          duration: et.duration,
          url: et.scheduling_url,
        })
      ),
      upcoming: upcoming.slice(0, 10).map(
        (e) => ({
          name: e.name,
          startTime: e.start_time,
          endTime: e.end_time,
          location: e.location?.type ?? null,
        })
      ),
      stats: {
        todayCount,
        thisWeekCount,
        upcomingTotal: upcoming.length,
        pastTotal: totalPast,
        showUpRate,
      },
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
