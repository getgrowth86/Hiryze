export function fmtInt(value: number): string {
  const negative = value < 0
  const digits = Math.abs(Math.round(value)).toString()
  const grouped = digits.replace(/\B(?=(\d{3})+(?!\d))/g, "'")
  return negative ? `−${grouped}` : grouped
}

export function fmtPct(ratio: number): string {
  const percent = Math.round(ratio * 1000) / 10
  const text = new Intl.NumberFormat('de-DE', {
    minimumFractionDigits: Number.isInteger(percent) ? 0 : 1,
    maximumFractionDigits: 1,
  }).format(percent)
  return `${text} %`
}

export function fmtEur(value: number): string {
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(value)
}

export function fmtShare(part: number, whole: number): string | null {
  if (whole <= 0 || part <= 0) return null
  return fmtPct(part / whole)
}
