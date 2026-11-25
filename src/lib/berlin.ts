export const BERLIN = 'Europe/Berlin'

export function berlinOffsetMinutes(instant: Date): number {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: BERLIN,
    hourCycle: 'h23',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).formatToParts(instant)
  const pick = (type: string) => Number(parts.find((part) => part.type === type)?.value)
  const asUtc = Date.UTC(pick('year'), pick('month') - 1, pick('day'), pick('hour'), pick('minute'), pick('second'))
  return Math.round((asUtc - instant.getTime()) / 60000)
}

/** Interpret a Berlin civil date and time as an absolute instant. */
export function berlinWallToUtc(dateKey: string, time = '00:00:00'): Date {
  const [year, month, day] = dateKey.split('-').map(Number)
  const [hour, minute, second] = time.split(':').map(Number)
  const guess = Date.UTC(year, month - 1, day, hour || 0, minute || 0, second || 0)
  const offset = berlinOffsetMinutes(new Date(guess))
  let utc = guess - offset * 60000
  const offset2 = berlinOffsetMinutes(new Date(utc))
  if (offset2 !== offset) utc = guess - offset2 * 60000
  return new Date(utc)
}

export function berlinDateKey(instant: Date): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: BERLIN,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(instant)
}

export function berlinToday(now = new Date()): string {
  return berlinDateKey(now)
}

export function addDays(dateKey: string, days: number): string {
  const [year, month, day] = dateKey.split('-').map(Number)
  return berlinDateKey(new Date(Date.UTC(year, month - 1, day + days, 12, 0, 0)))
}

export function eachDay(from: string, to: string): string[] {
  if (!from || !to || from > to) return []
  const out: string[] = []
  let cursor = from
  while (cursor <= to && out.length < 800) {
    out.push(cursor)
    cursor = addDays(cursor, 1)
  }
  return out
}

export function isDateKey(value: string | null | undefined): value is string {
  return !!value && /^\d{4}-\d{2}-\d{2}$/.test(value)
}

export function formatLongBerlin(dateKey: string, time: string): string {
  const instant = berlinWallToUtc(dateKey, time.length === 5 ? `${time}:00` : time)
  const date = new Intl.DateTimeFormat('de-DE', {
    timeZone: BERLIN,
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(instant)
  return `${date} um ${time}`
}

export function formatSidebarDate(dateKey: string, time: string): string {
  const [year, month, day] = dateKey.split('-')
  const monthName = new Intl.DateTimeFormat('de-DE', {
    timeZone: BERLIN,
    month: 'long',
  }).format(berlinWallToUtc(dateKey, '12:00:00'))
  return `${day}. ${monthName} ${year} · ${time}`
}

export function formatStamp(instant: Date): string {
  return new Intl.DateTimeFormat('de-DE', {
    timeZone: BERLIN,
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(instant)
}

export function formatShortRange(from: string, to: string): string {
  const [, m1, d1] = from.split('-')
  const [y2, m2, d2] = to.split('-')
  const [y1] = from.split('-')
  if (y1 === y2) return `${d1}.${m1}.–${d2}.${m2}.`
  return `${d1}.${m1}.${y1}–${d2}.${m2}.${y2}`
}

export function previousWindow(from: string, to: string): { from: string; to: string } | null {
  const days = eachDay(from, to)
  if (!days.length) return null
  const toPrev = addDays(from, -1)
  const fromPrev = addDays(toPrev, -(days.length - 1))
  return { from: fromPrev, to: toPrev }
}

/** Parse a sheet cell into an absolute instant. Empty or unknown shapes return null. */
export function parseBerlinDateTime(raw: string): Date | null {
  const value = raw.trim()
  if (!value) return null
  if (/^\d{4}-\d{2}-\d{2}T/.test(value)) {
    const parsed = new Date(value)
    return Number.isNaN(parsed.getTime()) ? null : parsed
  }
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return berlinWallToUtc(value, '00:00:00')
  const match = value.match(
    /^(\d{1,2})\.(\d{1,2})\.(\d{4})(?:[,\s]+(\d{1,2}):(\d{2})(?::(\d{2}))?)?$/
  )
  if (!match) return null
  const dateKey = `${match[3]}-${match[2].padStart(2, '0')}-${match[1].padStart(2, '0')}`
  const time = `${(match[4] ?? '0').padStart(2, '0')}:${match[5] ?? '00'}:${match[6] ?? '00'}`
  return berlinWallToUtc(dateKey, time)
}
