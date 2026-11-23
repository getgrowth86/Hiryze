import { NextResponse } from 'next/server'

const NOTION_BASE = 'https://api.notion.com/v1'
const NOTION_VERSION = '2022-06-28'

export async function GET() {
  const token = process.env.NOTION_TOKEN
  const dbId = process.env.NOTION_DATABASE_ID

  if (!token || !dbId) {
    return NextResponse.json(
      { error: 'NOTION_TOKEN and NOTION_DATABASE_ID required' },
      { status: 500 }
    )
  }

  const headers = {
    Authorization: `Bearer ${token}`,
    'Notion-Version': NOTION_VERSION,
    'Content-Type': 'application/json',
  }

  try {
    const res = await fetch(`${NOTION_BASE}/databases/${dbId}/query`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ page_size: 100 }),
      next: { revalidate: 120 },
    })

    if (!res.ok) throw new Error(`Notion query → ${res.status}`)
    const data = await res.json()

    const pages = data.results ?? []

    // Extract simple property values from Notion pages
    function getProp(page: Record<string, unknown>, key: string): string | null {
      const props = page.properties as Record<string, Record<string, unknown>> | undefined
      if (!props) return null
      const prop = props[key]
      if (!prop) return null
      const type = prop.type as string
      if (type === 'title') {
        const title = prop.title as Array<{ plain_text: string }>
        return title?.[0]?.plain_text ?? null
      }
      if (type === 'select') {
        const select = prop.select as { name: string } | null
        return select?.name ?? null
      }
      if (type === 'email') return prop.email as string ?? null
      if (type === 'phone_number') return prop.phone_number as string ?? null
      if (type === 'rich_text') {
        const rt = prop.rich_text as Array<{ plain_text: string }>
        return rt?.[0]?.plain_text ?? null
      }
      if (type === 'date') {
        const date = prop.date as { start: string } | null
        return date?.start ?? null
      }
      return null
    }

    // Build status distribution
    const statusCounts: Record<string, number> = {}
    const leads = pages.map((page: Record<string, unknown>) => {
      // Try common CRM field names
      const name =
        getProp(page, 'Name') ??
        getProp(page, 'name') ??
        getProp(page, 'Kontakt') ??
        getProp(page, 'Full Name') ??
        'Unbekannt'
      const status =
        getProp(page, 'Status') ??
        getProp(page, 'status') ??
        getProp(page, 'Phase') ??
        'Unbekannt'
      const email =
        getProp(page, 'Email') ??
        getProp(page, 'E-Mail') ??
        getProp(page, 'email') ??
        null
      const created = (page.created_time as string) ?? null

      statusCounts[status] = (statusCounts[status] ?? 0) + 1

      return { name, status, email, created }
    })

    return NextResponse.json({
      total: leads.length,
      statusDistribution: statusCounts,
      recent: leads.slice(0, 10),
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
