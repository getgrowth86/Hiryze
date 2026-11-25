import { addDays, berlinToday, eachDay, formatShortRange, previousWindow } from './berlin'
import { CHANNELS, emptyChannelMap, type ChannelId } from './channels'
import { NO_DATA, REGISTRATIONS_DISCONNECTED, VISITORS_MISSING } from './copy'
import type { DailyPoint, FunnelPayload, KpiModel, StageModel } from './funnel-types'
import type { SafeLead } from './lead-aggregate'
import {
  getWebinar,
  nextWorkshop,
  webinarDateLine,
  webinarSidebarDate,
  type WebinarId,
} from './webinars'

export type SourceOk<T> = { ok: true; data: T }
export type SourceFail = { ok: false; missing?: boolean; error: string }
export type Source<T> = SourceOk<T> | SourceFail

export type Ga4Data = {
  /** Unique users across the selected range. Not the sum of daily uniques. */
  users: number
  usersByDay: Record<string, number>
  sessionsByChannel: Record<ChannelId, number>
}

export type CountSeries = { byDay: Record<string, number> }

export type CalendlyData = CountSeries & {
  upcoming: number
  showUpRate: number | null
}

export type StripeData = {
  cashByDay: Record<string, number>
  seatsByDay: Record<string, number>
  charges: number
}

export type NotionData = {
  total: number
  won: number
  statuses: { name: string; count: number }[]
}

export type ComposeInput = {
  now: Date
  from: string
  to: string
  webinarId: WebinarId
  sheet: Source<SafeLead[]>
  ga4: Source<Ga4Data>
  calendly: Source<CalendlyData>
  stripe: Source<StripeData>
  notion: Source<NotionData>
}

const STAGE_LABELS = [
  'Landingpage-Besuche',
  'Anmeldungen',
  'Webinar-Teilnehmer',
  'Teilnehmer beim Angebot',
  'Terminbuchungen',
  'Gespräche geführt',
  'Angebot gemacht',
  'Käufer',
]

function inRange(date: string | null, from: string, to: string): boolean {
  return !!date && date >= from && date <= to
}

function sumRecord(record: Record<string, number>, from: string, to: string): number {
  let total = 0
  for (const day of eachDay(from, to)) total += record[day] ?? 0
  return total
}

function pointsFromRecord(
  record: Record<string, number>,
  from: string,
  to: string,
  today: string,
  coverageStart: string | null
): DailyPoint[] {
  return eachDay(from, to).map((date) => {
    if (date > today) return { date, value: null }
    if (coverageStart && date < coverageStart) return { date, value: null }
    return { date, value: record[date] ?? 0 }
  })
}

function kpi(partial: Omit<KpiModel, 'compareLabel' | 'previousLabel' | 'rangeLabel'> & {
  current: number | null
  previous: number | null
  from: string
  to: string
}): KpiModel {
  const rangeLabel = formatShortRange(partial.from, partial.to)
  let compareLabel = 'Kein Vergleich'
  let previousLabel = 'Vorzeitraum —'
  if (partial.previous != null && partial.current != null) {
    const delta = partial.current - partial.previous
    const sign = delta > 0 ? '+' : delta < 0 ? '−' : ''
    const abs = Math.abs(delta)
    const pct = partial.previous > 0 ? Math.round((delta / partial.previous) * 1000) / 10 : null
    const pctText = pct == null ? '' : ` · ${pct > 0 ? '+' : ''}${new Intl.NumberFormat('de-DE', { maximumFractionDigits: 1 }).format(pct)} %`
    compareLabel = `${sign}${abs}${pctText}`
    previousLabel = `Vorzeitraum ${partial.previous}`
  }
  return {
    state: partial.state,
    emptyText: partial.emptyText,
    value: partial.value,
    format: partial.format,
    series: partial.series,
    note: partial.note,
    compareLabel,
    previousLabel,
    rangeLabel,
  }
}

export function composeFunnel(input: ComposeInput): FunnelPayload {
  const today = berlinToday(input.now)
  const webinar = getWebinar(input.webinarId)
  const upcoming = nextWorkshop(input.now)
  const previous = previousWindow(input.from, input.to)
  const leads = input.sheet.ok ? input.sheet.data.filter((lead) => lead.webinar === webinar.id) : []
  const dated = leads.filter((lead) => lead.date)
  const coverageStart = dated.reduce<string | null>((min, lead) => {
    if (!lead.date) return min
    return min == null || lead.date < min ? lead.date : min
  }, null)

  const registrationCounts: Record<string, number> = {}
  const channelRegistrations = emptyChannelMap()
  let rangeRegistrations = 0
  let unattributed = 0
  let rangeKnown = 0
  for (const lead of leads) {
    if (!inRange(lead.date, input.from, input.to)) continue
    rangeRegistrations += 1
    if (lead.date) registrationCounts[lead.date] = (registrationCounts[lead.date] ?? 0) + 1
    channelRegistrations[lead.channel] += 1
    rangeKnown += 1
    if (!lead.attributed) unattributed += 1
  }

  const countWhere = (predicate: (lead: SafeLead) => boolean) => leads.filter(predicate).length
  const todayCount = input.sheet.ok ? countWhere((lead) => lead.date === today) : null
  const last7Start = addDays(today, -6)
  const last7Count = input.sheet.ok ? countWhere((lead) => inRange(lead.date, last7Start, today)) : null
  const totalCount = input.sheet.ok ? leads.length : null
  const purchases = input.sheet.ok ? countWhere((lead) => lead.bought) : null
  const purchaseAmount = input.sheet.ok
    ? leads.reduce((sum, lead) => sum + (lead.bought ? lead.amount : 0), 0)
    : null

  const registrationSeries = input.sheet.ok
    ? pointsFromRecord(registrationCounts, input.from, input.to, today, coverageStart)
    : eachDay(input.from, input.to).map((date) => ({ date, value: null }))

  const registrationPrevious = previous && input.sheet.ok && coverageStart && coverageStart <= previous.from
    ? leads.filter((lead) => inRange(lead.date, previous.from, previous.to)).length
    : null

  const visitSeries = input.ga4.ok
    ? pointsFromRecord(input.ga4.data.usersByDay, input.from, input.to, today, null)
    : null
  const visitTotal = input.ga4.ok ? input.ga4.data.users : null

  const bookingSeries = input.calendly.ok
    ? pointsFromRecord(input.calendly.data.byDay, input.from, input.to, today, null)
    : eachDay(input.from, input.to).map((date) => ({ date, value: null }))
  const bookingTotal = input.calendly.ok ? sumRecord(input.calendly.data.byDay, input.from, input.to) : null
  const bookingPrevious = previous && input.calendly.ok
    ? sumRecord(input.calendly.data.byDay, previous.from, previous.to)
    : null

  const seatSeries = input.stripe.ok
    ? pointsFromRecord(input.stripe.data.seatsByDay, input.from, input.to, today, null)
    : eachDay(input.from, input.to).map((date) => ({ date, value: null }))
  const seatTotal = input.stripe.ok ? sumRecord(input.stripe.data.seatsByDay, input.from, input.to) : null
  const seatPrevious = previous && input.stripe.ok
    ? sumRecord(input.stripe.data.seatsByDay, previous.from, previous.to)
    : null
  const cashTotal = input.stripe.ok ? sumRecord(input.stripe.data.cashByDay, input.from, input.to) : null
  const cashPrevious = previous && input.stripe.ok
    ? sumRecord(input.stripe.data.cashByDay, previous.from, previous.to)
    : null
  const cashSeries = input.stripe.ok
    ? pointsFromRecord(input.stripe.data.cashByDay, input.from, input.to, today, null)
    : eachDay(input.from, input.to).map((date) => ({ date, value: null }))

  const buyers = seatTotal
  const registrationsForRate = input.sheet.ok ? rangeRegistrations : null
  const rate = buyers != null && registrationsForRate != null && registrationsForRate > 0
    ? buyers / registrationsForRate
    : null

  const stages: StageModel[] = STAGE_LABELS.map((label, index) => ({
    index: String(index + 1).padStart(2, '0'),
    label,
    value: null,
    gap: 'open' as const,
  }))
  stages[0] = {
    ...stages[0],
    value: visitTotal,
    gap: input.ga4.ok ? 'none' : input.ga4.missing ? 'visitors' : 'open',
  }
  stages[1] = { ...stages[1], value: input.sheet.ok ? rangeRegistrations : null, gap: input.sheet.ok ? 'none' : 'open' }
  stages[4] = { ...stages[4], value: bookingTotal, gap: input.calendly.ok ? 'none' : 'open' }
  stages[7] = { ...stages[7], value: buyers, gap: input.stripe.ok ? 'none' : 'open' }

  const channels = CHANNELS.map((channel) => ({
    id: channel.id,
    label: channel.label,
    clicks: input.ga4.ok ? input.ga4.data.sessionsByChannel[channel.id] ?? 0 : null,
    registrations: input.sheet.ok ? channelRegistrations[channel.id] : null,
    bookings: null,
    sales: null,
    payments: null,
  }))

  const sourceCounts = new Map<string, number>()
  if (input.sheet.ok) {
    for (const lead of leads) {
      if (!inRange(lead.date, input.from, input.to) && lead.date) continue
      sourceCounts.set(lead.sourceLabel, (sourceCounts.get(lead.sourceLabel) ?? 0) + 1)
    }
  }
  const bySource = [...sourceCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([label, count]) => ({ label, count }))

  const checks = buildChecks({
    input,
    unattributed,
    rangeKnown,
    cashTotal,
  })

  const connections = [
    connection('sheet', 'Webinar-Sheet', input.sheet, 'Anmeldungen werden gelesen'),
    connection('ga4', 'GA4 Besucher', input.ga4, 'Besucher auf go.hiryze.de'),
    connection('calendly', 'Calendly', input.calendly, 'Termine werden gelesen'),
    connection('stripe', 'Stripe', input.stripe, 'Zahlungen werden gelesen'),
    connection('notion', 'Notion', input.notion, 'Status werden gelesen'),
    {
      id: 'meta',
      label: 'Meta Werbeausgaben',
      ok: false,
      detail: 'Kein Werbekonto angebunden',
    },
  ]

  const connectedLabels = connections.filter((item) => item.ok).map((item) => item.label.replace(' Besucher', '').replace('Webinar-', ''))

  const registrationNote = input.sheet.ok
    ? `heute ${todayCount ?? 0} · 7 Tage ${last7Count ?? 0} · gesamt ${totalCount ?? 0}`
    : null

  return {
    generatedAt: input.now.toISOString(),
    webinar: {
      id: webinar.id,
      title: webinar.title,
      dateLine: webinarDateLine(webinar),
      sidebarDate: webinarSidebarDate(webinar),
    },
    nextWorkshop: {
      title: upcoming.title,
      sidebarDate: webinarSidebarDate(upcoming),
    },
    range: { from: input.from, to: input.to },
    suggestedFrom: coverageStart,
    connectedLabels,
    connections,
    kpis: {
      spend: emptyKpi('eur', input.from, input.to),
      registrations: input.sheet.ok
        ? kpi({
            state: 'value',
            value: rangeRegistrations,
            format: 'int',
            series: registrationSeries,
            note: registrationNote,
            current: rangeRegistrations,
            previous: registrationPrevious,
            from: input.from,
            to: input.to,
          })
        : emptyKpi('int', input.from, input.to, REGISTRATIONS_DISCONNECTED),
      attendees: emptyKpi('int', input.from, input.to),
      bookings: input.calendly.ok
        ? kpi({
            state: 'value',
            value: bookingTotal ?? 0,
            format: 'int',
            series: bookingSeries,
            current: bookingTotal,
            previous: bookingPrevious,
            from: input.from,
            to: input.to,
          })
        : emptyKpi('int', input.from, input.to),
      sales: input.stripe.ok
        ? kpi({
            state: 'value',
            value: seatTotal ?? 0,
            format: 'int',
            series: seatSeries,
            current: seatTotal,
            previous: seatPrevious,
            from: input.from,
            to: input.to,
          })
        : emptyKpi('int', input.from, input.to),
      cash: input.stripe.ok && cashTotal != null && cashTotal > 0
        ? kpi({
            state: 'value',
            value: cashTotal,
            format: 'eur',
            series: cashSeries,
            current: cashTotal,
            previous: cashPrevious,
            from: input.from,
            to: input.to,
          })
        : emptyKpi('eur', input.from, input.to),
    },
    chart: {
      visits: visitSeries,
      registrations: input.sheet.ok ? registrationSeries : null,
      visitsGap: input.ga4.ok ? null : input.ga4.missing ? VISITORS_MISSING : input.ga4.error,
      registrationsGap: input.sheet.ok ? null : REGISTRATIONS_DISCONNECTED,
    },
    stages,
    conversion: {
      rate,
      buyers,
      registrations: registrationsForRate,
    },
    channels,
    checks,
    leads: {
      today: todayCount,
      last7d: last7Count,
      total: totalCount,
      purchases,
      purchaseAmount,
      tripwireCvr: purchases != null && totalCount != null && totalCount > 0 ? purchases / totalCount : null,
      bySource,
    },
    notion: input.notion.ok
      ? { total: input.notion.data.total, statuses: input.notion.data.statuses }
      : { total: null, statuses: [] },
    calendly: input.calendly.ok
      ? {
          bookings: bookingTotal,
          upcoming: input.calendly.data.upcoming,
          showUpRate: input.calendly.data.showUpRate,
        }
      : { bookings: null, upcoming: null, showUpRate: null },
    stripe: input.stripe.ok
      ? { cash: cashTotal, seats: seatTotal, charges: input.stripe.data.charges }
      : { cash: null, seats: null, charges: null },
  }
}

function emptyKpi(format: 'int' | 'eur', from: string, to: string, emptyText = NO_DATA): KpiModel {
  return {
    state: 'empty',
    emptyText,
    format,
    series: [],
    compareLabel: 'Kein Vergleich',
    previousLabel: 'Vorzeitraum —',
    rangeLabel: formatShortRange(from, to),
  }
}

function connection(id: string, label: string, source: Source<unknown>, okDetail: string) {
  if (source.ok) return { id, label, ok: true, detail: okDetail }
  return { id, label, ok: false, detail: source.error }
}

function buildChecks(args: {
  input: ComposeInput
  unattributed: number
  rangeKnown: number
  cashTotal: number | null
}): FunnelPayload['checks'] {
  const checks: FunnelPayload['checks'] = []
  if (!args.input.sheet.ok) {
    checks.push({
      id: 'sheet',
      area: 'Tracking',
      title: 'Anmeldungen aus dem Webinar-Sheet sind nicht lesbar',
      tab: 'connections',
    })
  } else if (args.rangeKnown >= 5 && args.unattributed / args.rangeKnown >= 0.4) {
    checks.push({
      id: 'utm',
      area: 'Tracking',
      title: 'Viele Anmeldungen haben keine UTM-Quelle',
      tab: 'marketing',
    })
  }
  if (!args.input.ga4.ok) {
    checks.push({
      id: 'ga4',
      area: 'Tracking',
      title: args.input.ga4.missing ? VISITORS_MISSING : 'GA4-Besucher sind nicht lesbar',
      tab: 'connections',
    })
  }
  checks.push({
    id: 'meta',
    area: 'Marketing',
    title: 'Werbeausgaben sind nicht angebunden',
    tab: 'connections',
  })
  if (!args.input.calendly.ok) {
    checks.push({
      id: 'calendly',
      area: 'Sales',
      title: 'Calendly-Termine sind nicht verbunden',
      tab: 'connections',
    })
  }
  checks.push({
    id: 'attendance',
    area: 'Webinar',
    title: 'Live-Teilnahme wird noch nicht erfasst',
    tab: 'check',
  })
  checks.push({
    id: 'pitch',
    area: 'Webinar',
    title: 'Teilnehmer beim Angebot werden noch nicht erfasst',
    tab: 'check',
  })
  if (!args.input.stripe.ok) {
    checks.push({
      id: 'stripe',
      area: 'Zahlungen',
      title: 'Stripe-Zahlungen sind nicht sichtbar',
      tab: 'connections',
    })
  } else if ((args.cashTotal ?? 0) <= 0) {
    checks.push({
      id: 'cash',
      area: 'Zahlungen',
      title: 'Noch kein Zahlungseingang im Zeitraum',
      tab: 'payments',
    })
  }
  if (!args.input.notion.ok) {
    checks.push({
      id: 'notion',
      area: 'CRM',
      title: 'Notion ist nicht verbunden',
      tab: 'connections',
    })
  }
  return checks
}
