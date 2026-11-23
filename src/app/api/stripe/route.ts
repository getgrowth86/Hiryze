import { NextResponse } from 'next/server'

export async function GET() {
  const secretKey = process.env.STRIPE_SECRET_KEY
  if (!secretKey) {
    return NextResponse.json({ error: 'STRIPE_SECRET_KEY not set' }, { status: 500 })
  }

  const headers = {
    Authorization: `Bearer ${secretKey}`,
    'Content-Type': 'application/x-www-form-urlencoded',
  }

  const now = Math.floor(Date.now() / 1000)
  const startOfMonth = Math.floor(
    new Date(new Date().getFullYear(), new Date().getMonth(), 1).getTime() / 1000
  )
  const thirtyDaysAgo = now - 30 * 24 * 60 * 60

  async function stripeFetch(path: string) {
    const res = await fetch(`https://api.stripe.com/v1${path}`, {
      headers,
      next: { revalidate: 120 },
    })
    if (!res.ok) throw new Error(`Stripe ${path} → ${res.status}`)
    return res.json()
  }

  try {
    const [chargesMonth, chargesAll, subscriptions, customers] = await Promise.all([
      stripeFetch(
        `/charges?created[gte]=${startOfMonth}&limit=100&expand[]=data.customer`
      ),
      stripeFetch(`/charges?created[gte]=${thirtyDaysAgo}&limit=100`),
      stripeFetch(`/subscriptions?status=active&limit=100`),
      stripeFetch(`/customers?limit=100&created[gte]=${thirtyDaysAgo}`),
    ])

    const successfulMonth = (chargesMonth.data ?? []).filter(
      (c: { status: string }) => c.status === 'succeeded'
    )
    const revenueMonth = successfulMonth.reduce(
      (sum: number, c: { amount: number }) => sum + c.amount,
      0
    )

    const successfulAll = (chargesAll.data ?? []).filter(
      (c: { status: string }) => c.status === 'succeeded'
    )
    const revenue30d = successfulAll.reduce(
      (sum: number, c: { amount: number }) => sum + c.amount,
      0
    )

    const activeSubscriptions: Array<{
      id: string
      status: string
      current_period_end: number
      items: { data: Array<{ price: { unit_amount: number; currency: string; recurring?: { interval: string } } }> }
      customer: string
    }> = subscriptions.data ?? []

    const mrr = activeSubscriptions.reduce((sum, sub) => {
      const price = sub.items?.data?.[0]?.price
      if (!price?.unit_amount) return sum
      const interval = price.recurring?.interval
      if (interval === 'month') return sum + price.unit_amount
      if (interval === 'year') return sum + Math.round(price.unit_amount / 12)
      return sum
    }, 0)

    const recentCharges = successfulAll.slice(0, 5).map(
      (c: { amount: number; currency: string; created: number; description?: string; customer?: string }) => ({
        amount: c.amount,
        currency: c.currency,
        date: new Date(c.created * 1000).toISOString(),
        description: c.description ?? null,
        customerId: typeof c.customer === 'string' ? c.customer : null,
      })
    )

    return NextResponse.json({
      revenueMonth: revenueMonth / 100,
      revenue30d: revenue30d / 100,
      currency: successfulMonth[0]?.currency ?? 'eur',
      activeSubscriptions: activeSubscriptions.length,
      mrr: mrr / 100,
      newCustomers30d: (customers.data ?? []).length,
      recentCharges,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
