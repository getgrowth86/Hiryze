import type { WebinarId } from './webinars'

export type DailyPoint = { date: string; value: number | null }

export type KpiModel = {
  state: 'value' | 'empty'
  emptyText?: string
  value?: number
  format: 'int' | 'eur'
  series: DailyPoint[]
  compareLabel: string
  previousLabel: string
  rangeLabel: string
  note?: string | null
}

export type StageModel = {
  index: string
  label: string
  value: number | null
  /** visitors: GA4 property id is not configured. open: counter is absent. */
  gap: 'none' | 'visitors' | 'open'
}

export type ChannelRowModel = {
  id: string
  label: string
  clicks: number | null
  registrations: number | null
  bookings: number | null
  sales: number | null
  payments: number | null
}

export type CheckItem = {
  id: string
  area: string
  title: string
  tab: string
}

export type ConnectionState = {
  id: string
  label: string
  ok: boolean
  detail: string
}

export type FunnelPayload = {
  generatedAt: string
  webinar: { id: WebinarId; title: string; dateLine: string; sidebarDate: string }
  nextWorkshop: { title: string; sidebarDate: string }
  range: { from: string; to: string }
  suggestedFrom: string | null
  connectedLabels: string[]
  connections: ConnectionState[]
  kpis: {
    spend: KpiModel
    registrations: KpiModel
    attendees: KpiModel
    bookings: KpiModel
    sales: KpiModel
    cash: KpiModel
  }
  chart: {
    visits: DailyPoint[] | null
    registrations: DailyPoint[] | null
    visitsGap: string | null
    registrationsGap: string | null
  }
  stages: StageModel[]
  conversion: { rate: number | null; buyers: number | null; registrations: number | null }
  channels: ChannelRowModel[]
  checks: CheckItem[]
  leads: {
    today: number | null
    last7d: number | null
    total: number | null
    purchases: number | null
    purchaseAmount: number | null
    tripwireCvr: number | null
    bySource: { label: string; count: number }[]
  }
  notion: { total: number | null; statuses: { name: string; count: number }[] }
  calendly: { bookings: number | null; upcoming: number | null; showUpRate: number | null }
  stripe: { cash: number | null; seats: number | null; charges: number | null }
}
