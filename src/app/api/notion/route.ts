import { loadNotion } from '@/lib/metrics'
import { privateJson, requireSession, scrubPayload } from '@/lib/require-session'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET() {
  const denied = await requireSession()
  if (denied) return denied
  return privateJson(scrubPayload(await loadNotion()))
}
