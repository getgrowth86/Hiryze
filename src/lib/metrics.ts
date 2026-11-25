import { addDays, berlinDateKey, berlinToday, berlinWallToUtc } from './berlin'
import { channelFromUtm, emptyChannelMap, type ChannelId } from './channels'
import type { Source } from './compose-funnel'
import { getGoogleAccessToken } from './google-access'
import { parseLeadMatrix, type SafeLead } from './lead-aggregate'

const DEFAULT_SHEET_ID = '16tPhnZadYfBuEXdRHSoJyRIRVHEv9qU2u-K-J-eF0U4'
const DEFAULT_SHEET_TAB = 'Webinar Leads'
const FUNNEL_HOST = 'go.hiryze.de'
const SEAT_CENTS = new Set([299000, 598000])

type CacheEntry<T> = { at: number; value: T }
const cache = new Map<string, CacheEntry<unknown>>()

async function remember<T>(key: string, ttlMs: number, load: () => Promise<T>): Promise<T> {
  const hit = cache.get(key) as CacheEntry<T> | undefined
  if (hit && Date.now() - hit.at < ttlMs) return hit.value
  const value = await load()
  cache.set(key, { at: Date.now(), value })
  return value
}

export async function loadSheetLeads(): Promise<Source<SafeLead[]>> {
  return remember('sheet-leads', 12_000, async () => {
    const token = await getGoogleAccessToken()
    if (!token.ok) return { ok: false as const, error: token.error }
    const sheetId = (process.env.LEADS_SHEET_ID || DEFAULT_SHEET_ID).trim()
    const tab = (process.env.LEADS_SHEET_TAB || DEFAULT_SHEET_TAB).trim() || DEFAULT_SHEET_TAB
    const range = encodeURIComponent(`'${tab.replace(/'/g, "''")}'!A:L`)
    let response: Response
    try {
      response = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(sheetId)}/values/${range}`,
        { headers: { Authorization: `Bearer ${token.token}` }, cache: 'no-store' }
      )
    } catch {
      return { ok: false as const, error: 'Sheet nicht erreichbar' }
    }
    if (!response.ok) {
      return {
        ok: false as const,
        error: response.status === 403
          ? 'Sheet nicht lesbar (HTTP 403). Der Service Account braucht Lesezugriff.'
          : `Sheet nicht lesbar (HTTP ${response.status})`,
      }
    }
    const json = (await response.json()) as { values?: unknown[][] }
    const matrix = (json.values ?? []).map((row) => (Array.isArray(row) ? row.map((cell) => String(cell ?? '')) : []))
    const countFrom = process.env.COUNT_FROM?.trim() || null
    return { ok: true as const, data: parseLeadMatrix(matrix, countFrom) }
  })
}

type Ga4Report = {
  rows?: Array<{
    dimensionValues?: Array<{ value?: string }>
    metricValues?: Array<{ value?: string }>
  }>
}

export async function loadGa4(from: string, to: string): Promise<Source<{
  users: number
  usersByDay: Record<string, number>
  sessionsByChannel: Record<ChannelId, number>
}>> {
  const propertyId = (process.env.GA4_PROPERTY_ID || '').trim().replace(/^properties\//, '')
  if (!propertyId) return { ok: false, missing: true, error: 'GA4_PROPERTY_ID fehlt' }
  if (!/^\d+$/.test(propertyId)) {
    return { ok: false, error: 'GA4_PROPERTY_ID ist keine numerische Property-ID' }
  }
  return remember(`ga4:${propertyId}:${from}:${to}`, 12_000, async () => {
    const token = await getGoogleAccessToken()
    if (!token.ok) return { ok: false as const, error: token.error }
    const [daily, totals, channels] = await Promise.all([
      runReport(token.token, propertyId, {
        dateRanges: [{ startDate: from, endDate: to }],
        dimensions: [{ name: 'date' }],
        metrics: [{ name: 'totalUsers' }],
        dimensionFilter: hostFilter(),
        keepEmptyRows: false,
        limit: 400,
      }),
      runReport(token.token, propertyId, {
        dateRanges: [{ startDate: from, endDate: to }],
        metrics: [{ name: 'totalUsers' }],
        dimensionFilter: hostFilter(),
      }),
      runReport(token.token, propertyId, {
        dateRanges: [{ startDate: from, endDate: to }],
        dimensions: [{ name: 'sessionSource' }, { name: 'sessionMedium' }],
        metrics: [{ name: 'sessions' }],
        dimensionFilter: hostFilter(),
        limit: 200,
      }),
    ])
    if (!daily.ok) return daily
    if (!totals.ok) return totals
    if (!channels.ok) return channels
    const users = Number(totals.data.rows?.[0]?.metricValues?.[0]?.value ?? 0) || 0
    const usersByDay: Record<string, number> = {}
    for (const row of daily.data.rows ?? []) {
      const raw = row.dimensionValues?.[0]?.value ?? ''
      const key = raw.length === 8 ? `${raw.slice(0, 4)}-${raw.slice(4, 6)}-${raw.slice(6, 8)}` : ''
      if (!key) continue
      usersByDay[key] = Number(row.metricValues?.[0]?.value ?? 0) || 0
    }
    const sessionsByChannel = emptyChannelMap()
    for (const row of channels.data.rows ?? []) {
      const source = row.dimensionValues?.[0]?.value ?? ''
      const medium = row.dimensionValues?.[1]?.value ?? ''
      const channel = channelFromUtm(source === '(direct)' ? 'direct' : source, medium === '(none)' ? '' : medium)
      sessionsByChannel[channel] += Number(row.metricValues?.[0]?.value ?? 0) || 0
    }
    return { ok: true as const, data: { users, usersByDay, sessionsByChannel } }
  })
}

function hostFilter() {
  return {
    filter: {
      fieldName: 'hostName',
      stringFilter: { matchType: 'EXACT', value: FUNNEL_HOST, caseSensitive: false },
    },
  }
}

async function runReport(
  token: string,
  propertyId: string,
  body: unknown
): Promise<Source<Ga4Report>> {
  let response: Response
  try {
    response = await fetch(
      `https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
        cache: 'no-store',
      }
    )
  } catch {
    return { ok: false, error: 'GA4 Data API nicht erreichbar' }
  }
  if (response.status === 403) {
    return { ok: false, error: 'GA4 nicht lesbar (HTTP 403). Der Service Account braucht die Rolle Betrachter.' }
  }
  if (!response.ok) return { ok: false, error: `GA4 nicht lesbar (HTTP ${response.status})` }
  const json = (await response.json()) as Ga4Report
  return { ok: true, data: { rows: json.rows ?? [] } }
}

type CalendlyEvent = { start_time?: string; status?: string; end_time?: string }

export async function loadCalendly(from: string, to: string, now = new Date()): Promise<Source<{
  byDay: Record<string, number>
  upcoming: number
  showUpRate: number | null
}>> {
  const token = process.env.CALENDLY_TOKEN
  if (!token) return { ok: false, missing: true, error: 'CALENDLY_TOKEN fehlt' }
  return remember(`calendly:${from}:${to}`, 12_000, async () => {
    try {
      const me = await calendlyGet('/users/me', token)
      const userUri = String(me?.resource?.uri ?? '')
      if (!userUri) return { ok: false as const, error: 'Calendly-Nutzer nicht lesbar' }
      const min = berlinWallToUtc(from, '00:00:00').toISOString()
      const max = berlinWallToUtc(addDays(to, 1), '00:00:00').toISOString()
      const events = await calendlyEvents(token, userUri, min, max)
      const byDay: Record<string, number> = {}
      for (const event of events) {
        if (event.status === 'canceled' || !event.start_time) continue
        const key = berlinDateKey(new Date(event.start_time))
        if (key < from || key > to) continue
        byDay[key] = (byDay[key] ?? 0) + 1
      }
      const futureMax = new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000).toISOString()
      const upcomingEvents = await calendlyEvents(token, userUri, now.toISOString(), futureMax)
      const upcoming = upcomingEvents.filter((event) => event.status !== 'canceled').length
      const showStart = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString()
      const past = await calendlyEvents(token, userUri, showStart, now.toISOString())
      const considered = past.filter((event) => event.start_time)
      const showUpRate = considered.length
        ? Math.round((considered.filter((event) => event.status !== 'canceled').length / considered.length) * 1000) / 10
        : null
      return { ok: true as const, data: { byDay, upcoming, showUpRate } }
    } catch (error) {
      const status = error instanceof Error ? error.message : 'Fehler'
      return { ok: false as const, error: `Calendly nicht lesbar (${status})` }
    }
  })
}

async function calendlyGet(path: string, token: string) {
  const response = await fetch(`https://api.calendly.com${path}`, {
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    cache: 'no-store',
  })
  if (!response.ok) throw new Error(`HTTP ${response.status}`)
  return response.json()
}

async function calendlyEvents(token: string, userUri: string, min: string, max: string): Promise<CalendlyEvent[]> {
  const events: CalendlyEvent[] = []
  let pageToken = ''
  for (let page = 0; page < 8; page += 1) {
    const params = new URLSearchParams({
      user: userUri,
      min_start_time: min,
      max_start_time: max,
      count: '100',
    })
    if (pageToken) params.set('page_token', pageToken)
    const json = await calendlyGet(`/scheduled_events?${params.toString()}`, token)
    const batch = (json.collection ?? []) as CalendlyEvent[]
    events.push(...batch)
    pageToken = String(json.pagination?.next_page_token ?? '')
    if (!pageToken) break
  }
  return events
}

type StripeCharge = {
  id?: string
  status?: string
  amount?: number
  amount_refunded?: number
  currency?: string
  created?: number
}

export async function loadStripe(from: string, to: string): Promise<Source<{
  cashByDay: Record<string, number>
  seatsByDay: Record<string, number>
  charges: number
}>> {
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) return { ok: false, missing: true, error: 'STRIPE_SECRET_KEY fehlt' }
  return remember(`stripe:${from}:${to}`, 12_000, async () => {
    try {
      const gte = Math.floor(berlinWallToUtc(from, '00:00:00').getTime() / 1000)
      const lte = Math.floor(berlinWallToUtc(addDays(to, 1), '00:00:00').getTime() / 1000) - 1
      const charges = await stripeCharges(key, gte, lte)
      const cashByDay: Record<string, number> = {}
      const seatsByDay: Record<string, number> = {}
      let count = 0
      for (const charge of charges) {
        if (charge.status !== 'succeeded' || !charge.created) continue
        const net = (charge.amount ?? 0) - (charge.amount_refunded ?? 0)
        if (net <= 0) continue
        count += 1
        const keyDay = berlinDateKey(new Date(charge.created * 1000))
        const euros = net / 100
        cashByDay[keyDay] = (cashByDay[keyDay] ?? 0) + euros
        const currency = (charge.currency ?? '').toLowerCase()
        if ((currency === 'eur' || currency === '') && SEAT_CENTS.has(charge.amount ?? 0) && (charge.amount_refunded ?? 0) === 0) {
          seatsByDay[keyDay] = (seatsByDay[keyDay] ?? 0) + 1
        }
      }
      return { ok: true as const, data: { cashByDay, seatsByDay, charges: count } }
    } catch (error) {
      const status = error instanceof Error ? error.message : 'Fehler'
      return { ok: false as const, error: `Stripe nicht lesbar (${status})` }
    }
  })
}

async function stripeCharges(key: string, gte: number, lte: number): Promise<StripeCharge[]> {
  const charges: StripeCharge[] = []
  let startingAfter = ''
  for (let page = 0; page < 6; page += 1) {
    const params = new URLSearchParams({ limit: '100' })
    params.set('created[gte]', String(gte))
    params.set('created[lte]', String(lte))
    if (startingAfter) params.set('starting_after', startingAfter)
    const response = await fetch(`https://api.stripe.com/v1/charges?${params.toString()}`, {
      headers: { Authorization: `Bearer ${key}` },
      cache: 'no-store',
    })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const json = (await response.json()) as { data?: StripeCharge[]; has_more?: boolean }
    const batch = json.data ?? []
    charges.push(...batch)
    if (!json.has_more || batch.length === 0) break
    startingAfter = batch[batch.length - 1]?.id ?? ''
    if (!startingAfter) break
  }
  return charges
}

export async function loadNotion(): Promise<Source<{
  total: number
  won: number
  statuses: { name: string; count: number }[]
}>> {
  const token = process.env.NOTION_TOKEN
  const databaseId = process.env.NOTION_DATABASE_ID
  if (!token || !databaseId) {
    return {
      ok: false,
      missing: true,
      error: !token ? 'NOTION_TOKEN fehlt' : 'NOTION_DATABASE_ID fehlt',
    }
  }
  return remember('notion-status', 12_000, async () => {
    let response: Response
    try {
      response = await fetch(`https://api.notion.com/v1/databases/${databaseId}/query`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Notion-Version': '2022-06-28',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ page_size: 100 }),
        cache: 'no-store',
      })
    } catch {
      return { ok: false as const, error: 'Notion nicht erreichbar' }
    }
    if (!response.ok) return { ok: false as const, error: `Notion nicht lesbar (HTTP ${response.status})` }
    const json = (await response.json()) as { results?: Array<{ properties?: Record<string, { type?: string; select?: { name?: string } | null; status?: { name?: string } | null }> }> }
    const counts = new Map<string, number>()
    let won = 0
    for (const page of json.results ?? []) {
      const status = readStatus(page.properties ?? {})
      counts.set(status, (counts.get(status) ?? 0) + 1)
      if (/^(won|gewonnen|kunde)$/i.test(status)) won += 1
    }
    const statuses = [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([name, count]) => ({ name, count }))
    return { ok: true as const, data: { total: (json.results ?? []).length, won, statuses } }
  })
}

function readStatus(properties: Record<string, { type?: string; select?: { name?: string } | null; status?: { name?: string } | null }>): string {
  for (const key of ['Status', 'status', 'Phase']) {
    const property = properties[key]
    if (!property) continue
    const name = property.select?.name || property.status?.name
    if (name && !name.includes('@')) return name.slice(0, 40)
  }
  return 'Ohne Status'
}

export function defaultRange(now = new Date()): { from: string; to: string } {
  const to = berlinToday(now)
  return { from: addDays(to, -34), to }
}
