import { berlinWallToUtc, formatLongBerlin, formatSidebarDate } from './berlin'

export type WebinarId = 'w1' | 'w2' | 'w3' | 'w4'

export type Webinar = {
  id: WebinarId
  title: string
  dateKey: string
  time: string
}

export const WEBINARS: readonly Webinar[] = [
  { id: 'w1', title: 'Meet yourself in Safety', dateKey: '2026-12-09', time: '19:00' },
  { id: 'w2', title: 'Meet yourself in Safety', dateKey: '2026-12-27', time: '10:00' },
  { id: 'w3', title: 'Meet yourself in Safety', dateKey: '2027-01-10', time: '10:00' },
  { id: 'w4', title: 'Meet yourself in Safety', dateKey: '2027-01-24', time: '10:00' },
]

export function isWebinarId(value: string | null | undefined): value is WebinarId {
  return value === 'w1' || value === 'w2' || value === 'w3' || value === 'w4'
}

export function getWebinar(id: string | null | undefined): Webinar {
  return WEBINARS.find((item) => item.id === id) ?? WEBINARS[0]
}

export function webinarDateLine(webinar: Webinar): string {
  return `${formatLongBerlin(webinar.dateKey, webinar.time)} · Europe/Berlin`
}

export function webinarSidebarDate(webinar: Webinar): string {
  return formatSidebarDate(webinar.dateKey, webinar.time)
}

/** Next workshop that has not started yet. Falls back to the latest one. */
export function nextWorkshop(now = new Date()): Webinar {
  const upcoming = WEBINARS.find((item) => berlinWallToUtc(item.dateKey, `${item.time}:00`).getTime() > now.getTime())
  return upcoming ?? WEBINARS[WEBINARS.length - 1]
}

export function detectWebinar(fields: string[]): WebinarId {
  const blob = fields.join(' ').toLowerCase()
  if (/(^|[^a-z0-9])w4([^a-z0-9]|$)/.test(blob)) return 'w4'
  if (/(^|[^a-z0-9])w3([^a-z0-9]|$)/.test(blob)) return 'w3'
  if (/(^|[^a-z0-9])w2([^a-z0-9]|$)/.test(blob)) return 'w2'
  return 'w1'
}
