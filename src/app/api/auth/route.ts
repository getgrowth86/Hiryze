import { timingSafeEqual } from 'crypto'
import { NextResponse } from 'next/server'
import { dashboardPassword, passwordMissingResponse, requireSession } from '@/lib/require-session'
import { createSessionToken, SESSION_COOKIE, SESSION_MAX_AGE } from '@/lib/session-token'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

function secureCookie(request: Request): boolean {
  const forwarded = request.headers.get('x-forwarded-proto')
  if (forwarded) return forwarded.split(',')[0].trim() === 'https'
  return !request.url.startsWith('http://localhost') && !request.url.startsWith('http://127.0.0.1')
}

function samePassword(input: string, expected: string): boolean {
  const left = Buffer.from(input)
  const right = Buffer.from(expected)
  if (left.length !== right.length) return false
  return timingSafeEqual(left, right)
}

export async function GET() {
  const secret = dashboardPassword()
  if (!secret) return passwordMissingResponse()
  const denied = await requireSession()
  if (denied) return denied
  return NextResponse.json({ ok: true }, { headers: { 'Cache-Control': 'private, no-store' } })
}

export async function POST(request: Request) {
  const secret = dashboardPassword()
  if (!secret) return passwordMissingResponse()
  const body = (await request.json().catch(() => ({}))) as { password?: unknown }
  const password = typeof body.password === 'string' ? body.password : ''
  if (!samePassword(password, secret)) {
    return NextResponse.json({ ok: false }, { status: 401, headers: { 'Cache-Control': 'private, no-store' } })
  }
  const token = await createSessionToken(secret)
  const response = NextResponse.json({ ok: true }, { headers: { 'Cache-Control': 'private, no-store' } })
  response.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: secureCookie(request),
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_MAX_AGE,
  })
  return response
}

export async function DELETE(request: Request) {
  const response = NextResponse.json({ ok: true })
  response.cookies.set(SESSION_COOKIE, '', {
    httpOnly: true,
    secure: secureCookie(request),
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  })
  return response
}
