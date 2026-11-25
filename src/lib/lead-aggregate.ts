import { berlinDateKey, isDateKey, parseBerlinDateTime } from './berlin'
import { channelFromUtm, parseUtm, type ChannelId } from './channels'
import { detectWebinar, type WebinarId } from './webinars'

export type SafeLead = {
  date: string | null
  webinar: WebinarId
  channel: ChannelId
  sourceLabel: string
  attributed: boolean
  bought: boolean
  amount: number
}

const HEADER_HINTS = new Set(['datum', 'date', 'e-mail', 'email', 'name'])

export function parseAmount(raw: string): number {
  const compact = raw.trim().replace(/[€\s]/g, '')
  if (!compact || !/[0-9]/.test(compact)) return 0
  const hasComma = compact.includes(',')
  const hasDot = compact.includes('.')
  if (hasComma && hasDot) {
    if (compact.lastIndexOf(',') > compact.lastIndexOf('.')) {
      return toNumber(compact.replace(/\./g, '').replace(',', '.'))
    }
    return toNumber(compact.replace(/,/g, ''))
  }
  if (hasComma) {
    const fraction = compact.split(',').pop() ?? ''
    if (fraction.length === 3) return toNumber(compact.replace(/,/g, ''))
    return toNumber(compact.replace(',', '.'))
  }
  if (hasDot) {
    const pieces = compact.split('.')
    const fraction = pieces[pieces.length - 1] ?? ''
    if (pieces.length > 2 || fraction.length === 3) return toNumber(compact.replace(/\./g, ''))
    return toNumber(compact)
  }
  return toNumber(compact)
}

function toNumber(value: string): number {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

function isBought(raw: string): boolean {
  return /^(ja|yes|true|1|gekauft)$/i.test(raw.trim())
}

function safeLabel(raw: string, fallback: string): string {
  const value = raw.trim()
  if (!value || value.includes('@')) return fallback
  return value.slice(0, 60)
}

function looksLikeHeader(row: string[]): boolean {
  const joined = row.map((cell) => cell.trim().toLowerCase())
  return HEADER_HINTS.has(joined[0] ?? '') || HEADER_HINTS.has(joined[2] ?? '')
}

/**
 * Collapse sheet rows to aggregate-safe leads.
 * The email is used only as a dedupe key and is never returned.
 */
export function parseLeadMatrix(values: string[][], countFrom?: string | null): SafeLead[] {
  const merged = new Map<string, SafeLead>()
  values.forEach((row, index) => {
    const cells = Array.from({ length: 12 }, (_, cell) => String(row[cell] ?? '').trim())
    if (cells.every((cell) => cell === '')) return
    if (index === 0 && looksLikeHeader(cells)) return
    const instant = parseBerlinDateTime(cells[0] ?? '')
    const date = instant ? berlinDateKey(instant) : null
    if (date && countFrom && isDateKey(countFrom) && date < countFrom) return
    const email = (cells[2] ?? '').trim().toLowerCase()
    const key = email.includes('@') ? `e:${email}` : `r:${index}`
    const utm = parseUtm(cells[6] ?? '')
    const attributed = Boolean(utm.source || utm.medium)
    const lead: SafeLead = {
      date,
      webinar: detectWebinar([cells[4] ?? '', cells[5] ?? '', cells[6] ?? '']),
      channel: channelFromUtm(utm.source, utm.medium),
      sourceLabel: safeLabel(cells[4] ?? '', 'Ohne Quelle'),
      attributed,
      bought: isBought(cells[7] ?? ''),
      amount: parseAmount(cells[9] ?? ''),
    }
    const existing = merged.get(key)
    if (!existing) {
      merged.set(key, lead)
      return
    }
    existing.bought = existing.bought || lead.bought
    existing.amount = Math.max(existing.amount, lead.amount)
    if (lead.date && (!existing.date || lead.date < existing.date)) {
      existing.date = lead.date
      existing.webinar = lead.webinar
      existing.channel = lead.channel
      existing.sourceLabel = lead.sourceLabel
      existing.attributed = lead.attributed
    }
  })
  return [...merged.values()]
}
