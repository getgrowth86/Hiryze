import { addDays, berlinToday, isDateKey, previousWindow } from '@/lib/berlin'
import { composeFunnel } from '@/lib/compose-funnel'
import { loadCalendly, loadGa4, loadNotion, loadSheetLeads, loadStripe } from '@/lib/metrics'
import { privateJson, requireSession, scrubPayload } from '@/lib/require-session'
import { isWebinarId, type WebinarId } from '@/lib/webinars'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(request: Request) {
  const denied = await requireSession()
  if (denied) return denied

  const params = new URL(request.url).searchParams
  const today = berlinToday()
  let from = isDateKey(params.get('from')) ? params.get('from')! : addDays(today, -34)
  let to = isDateKey(params.get('to')) ? params.get('to')! : today
  if (from > to) {
    const swap = from
    from = to
    to = swap
  }
  const requested = params.get('webinar')
  const webinarId: WebinarId = isWebinarId(requested) ? requested : 'w1'
  const previous = previousWindow(from, to)
  const fetchFrom = previous?.from ?? from
  const now = new Date()

  const [sheet, ga4, calendly, stripe, notion] = await Promise.all([
    loadSheetLeads(),
    loadGa4(from, to),
    loadCalendly(fetchFrom, to, now),
    loadStripe(fetchFrom, to),
    loadNotion(),
  ])

  const payload = scrubPayload(composeFunnel({
    now,
    from,
    to,
    webinarId,
    sheet,
    ga4,
    calendly,
    stripe,
    notion,
  }))

  return privateJson(payload)
}
