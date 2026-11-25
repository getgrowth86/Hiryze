import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { SESSION_COOKIE, verifySessionToken } from './session-token'

export function dashboardPassword(): string | null {
  const value = process.env.DASHBOARD_PASSWORD
  return value && value.trim() ? value : null
}

export function passwordMissingResponse() {
  return NextResponse.json({ error: 'DASHBOARD_PASSWORD is not configured' }, { status: 500 })
}

export async function requireSession(): Promise<NextResponse | null> {
  const secret = dashboardPassword()
  if (!secret) return passwordMissingResponse()
  const jar = await cookies()
  const ok = await verifySessionToken(secret, jar.get(SESSION_COOKIE)?.value)
  if (!ok) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  return null
}

export function privateJson(body: unknown, status = 200) {
  return NextResponse.json(body, {
    status,
    headers: { 'Cache-Control': 'private, no-store' },
  })
}

const EMAIL_PATTERN = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi
const FORBIDDEN_KEYS = new Set(['email', 'phone', 'telefon', 'customerid', 'customer', 'sessionid', 'session_id'])

/** Last line of defence: the browser payload never carries an email-shaped string. */
export function scrubPayload<T>(value: T): T {
  return scrub(value) as T
}

function scrub(value: unknown): unknown {
  if (typeof value === 'string') return value.replace(EMAIL_PATTERN, '—')
  if (Array.isArray(value)) return value.map((item) => scrub(item))
  if (value && typeof value === 'object') {
    const output: Record<string, unknown> = {}
    for (const [key, item] of Object.entries(value)) {
      if (FORBIDDEN_KEYS.has(key.toLowerCase())) continue
      output[key] = scrub(item)
    }
    return output
  }
  return value
}
