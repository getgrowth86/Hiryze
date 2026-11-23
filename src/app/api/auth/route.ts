import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const { password } = await req.json().catch(() => ({ password: '' }))
  const expected = process.env.DASHBOARD_PASSWORD

  // If no password is set, allow access (dev mode)
  if (!expected || password === expected) {
    return NextResponse.json({ ok: true })
  }

  return NextResponse.json({ ok: false }, { status: 401 })
}
