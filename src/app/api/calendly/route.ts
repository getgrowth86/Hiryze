import { defaultRange, loadCalendly } from '@/lib/metrics'
import { isDateKey } from '@/lib/berlin'
import { privateJson, requireSession, scrubPayload } from '@/lib/require-session'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(request: Request) {
  const denied = await requireSession()
  if (denied) return denied
  const params = new URL(request.url).searchParams
  const fallback = defaultRange()
  const from = isDateKey(params.get('from')) ? params.get('from')! : fallback.from
  const to = isDateKey(params.get('to')) ? params.get('to')! : fallback.to
  return privateJson(scrubPayload(await loadCalendly(from, to)))
}
