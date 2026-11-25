export const CHANNELS = [
  { id: 'direct', label: 'Nicht zugeordnet' },
  { id: 'ads', label: 'Ads' },
  { id: 'email', label: 'E-Mail' },
  { id: 'instagram', label: 'Instagram' },
  { id: 'whatsapp', label: 'WhatsApp' },
  { id: 'webinar', label: 'Webinar' },
  { id: 'sales', label: 'Sales' },
] as const

export type ChannelId = (typeof CHANNELS)[number]['id']

const PAID_MEDIUMS = new Set(['cpc', 'ppc', 'paid', 'paid_social', 'paidsocial', 'paid-social'])
const PAID_SOURCES = new Set(['meta', 'facebook', 'fb', 'an', 'google', 'adwords', 'tiktok', 'youtube_ads'])

export function parseUtm(cell: string): { source: string; medium: string; campaign: string } {
  const result = { source: '', medium: '', campaign: '' }
  const text = cell.trim()
  if (!text) return result
  const query = text.includes('?') ? text.slice(text.indexOf('?') + 1) : text
  for (const pair of query.split(/[,&\n]/)) {
    const [rawKey, ...rest] = pair.split('=')
    if (!rawKey || rest.length === 0) continue
    const key = decodePiece(rawKey).toLowerCase().replace(/^\?/, '')
    const value = decodePiece(rest.join('='))
    if (key === 'utm_source' || key === 'source') result.source = value
    if (key === 'utm_medium' || key === 'medium') result.medium = value
    if (key === 'utm_campaign' || key === 'campaign') result.campaign = value
  }
  return result
}

function decodePiece(value: string): string {
  const trimmed = value.trim().replace(/^["']|["']$/g, '')
  try {
    return decodeURIComponent(trimmed.replace(/\+/g, ' '))
  } catch {
    return trimmed
  }
}

export function channelFromUtm(sourceRaw: string, mediumRaw: string): ChannelId {
  const source = sourceRaw.trim().toLowerCase()
  const medium = mediumRaw.trim().toLowerCase()
  if (!source && !medium) return 'direct'
  if (source === 'direct' || source === '(direct)' || source === 'none' || source === '(none)' || source === 'unknown') {
    return 'direct'
  }
  if (source === 'lena' || medium === 'network') return 'sales'
  if (source === 'whatsapp' || medium === 'whatsapp') return 'whatsapp'
  if (source === 'brevo' || source === 'email' || source === 'e-mail' || source === 'newsletter' || medium === 'email' || medium === 'e-mail') {
    return 'email'
  }
  if (source === 'webinar' || source === 'replay' || medium === 'webinar' || medium === 'replay') return 'webinar'
  const paid = PAID_SOURCES.has(source) || PAID_MEDIUMS.has(medium)
  if (paid) return 'ads'
  if (source === 'instagram' || source === 'ig') {
    if (medium === 'organic_social' || medium === 'organic' || medium === 'social' || medium === '') return 'instagram'
  }
  if (source === 'organic_social') return 'instagram'
  return 'direct'
}

export function emptyChannelMap(): Record<ChannelId, number> {
  return { direct: 0, ads: 0, email: 0, instagram: 0, whatsapp: 0, webinar: 0, sales: 0 }
}
