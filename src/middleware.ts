import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { SESSION_COOKIE, verifySessionToken } from '@/lib/session-token'

export async function middleware(request: NextRequest) {
  if (request.nextUrl.pathname === '/api/auth') return NextResponse.next()
  const secret = process.env.DASHBOARD_PASSWORD?.trim()
  if (!secret) {
    return NextResponse.json({ error: 'DASHBOARD_PASSWORD is not configured' }, { status: 500 })
  }
  const ok = await verifySessionToken(secret, request.cookies.get(SESSION_COOKIE)?.value)
  if (!ok) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  return NextResponse.next()
}

export const config = {
  matcher: ['/api/:path*'],
}
