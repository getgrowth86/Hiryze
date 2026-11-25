import assert from 'node:assert/strict'
import test from 'node:test'
import { berlinDateKey, parseBerlinDateTime } from './berlin'
import { channelFromUtm } from './channels'
import { composeFunnel } from './compose-funnel'
import { parseAmount, parseLeadMatrix } from './lead-aggregate'
import { createSessionToken, verifySessionToken } from './session-token'
import { VISITORS_MISSING } from './copy'

test('parses Berlin sheet timestamps and keeps the civil date', () => {
  const local = parseBerlinDateTime('25.11.2026, 00:30')
  assert.ok(local)
  assert.equal(berlinDateKey(local), '2026-11-25')
  const utc = parseBerlinDateTime('2026-11-24T23:30:00.000Z')
  assert.ok(utc)
  assert.equal(berlinDateKey(utc), '2026-11-25')
})

test('parses German amounts', () => {
  assert.equal(parseAmount('2.990'), 2990)
  assert.equal(parseAmount('29,00'), 29)
  assert.equal(parseAmount('1.234,50'), 1234.5)
})

test('dedupes emails, maps channels, and never returns the address', () => {
  const leads = parseLeadMatrix([
    ['Datum', 'Name', 'E-Mail', 'Telefon', 'Quelle', 'Seite', 'UTM', 'Gekauft', 'Produkt(e)', 'Betrag', 'Kaufdatum', 'Stripe session_id'],
    ['25.11.2026, 10:15', 'Ada Example', 'ada@example.com', '+491511234567', 'hiryze-webinar-optin', '/', 'utm_source=meta, utm_medium=paid_social', 'nein', '', '', '', ''],
    ['25.11.2026, 11:00', 'Ada Example', 'Ada@example.com', '', 'hiryze-webinar-optin', '/', 'utm_source=instagram, utm_medium=organic_social', 'ja', 'Playbook', '29,00', '25.11.2026, 12:00', 'cs_test_123'],
    ['24.11.2026, 09:00', 'Bea Example', 'bea@example.com', '', '', '/', 'utm_source=lena, utm_medium=network', 'nein', '', '', '', ''],
    ['24.11.2026, 09:30', 'Cara Example', 'cara@example.com', '', '', '/', '', 'nein', '', '', '', ''],
  ])
  assert.equal(leads.length, 3)
  const ada = leads.find((lead) => lead.bought)
  assert.ok(ada)
  assert.equal(ada.channel, 'ads')
  assert.equal(ada.amount, 29)
  assert.equal(ada.date, '2026-11-25')
  const sales = leads.find((lead) => lead.channel === 'sales')
  assert.ok(sales)
  assert.equal(channelFromUtm('instagram', 'organic_social'), 'instagram')
  const json = JSON.stringify(leads)
  assert.equal(json.includes('@'), false)
  assert.equal(json.includes('Ada'), false)
  assert.equal(json.includes('491511234567'), false)
  assert.equal(json.includes('cs_test_123'), false)
})

test('funnel quotes stay open when a counter is missing and hide visitor zeros', () => {
  const payload = composeFunnel({
    now: new Date('2026-11-25T12:00:00.000Z'),
    from: '2026-11-01',
    to: '2026-11-25',
    webinarId: 'w1',
    sheet: {
      ok: true,
      data: parseLeadMatrix([
        ['25.11.2026, 10:00', 'Hidden', 'hidden@example.com', '', 'optin', '/', 'utm_source=brevo, utm_medium=email', 'nein', '', '', '', ''],
      ]),
    },
    ga4: { ok: false, missing: true, error: 'GA4_PROPERTY_ID fehlt' },
    calendly: { ok: false, missing: true, error: 'CALENDLY_TOKEN fehlt' },
    stripe: { ok: false, missing: true, error: 'STRIPE_SECRET_KEY fehlt' },
    notion: { ok: false, missing: true, error: 'NOTION_TOKEN fehlt' },
  })
  assert.equal(payload.stages[0].gap, 'visitors')
  assert.equal(payload.stages[0].value, null)
  assert.equal(payload.stages[1].value, 1)
  assert.equal(payload.stages[7].value, null)
  assert.equal(payload.conversion.rate, null)
  assert.equal(payload.kpis.registrations.value, 1)
  assert.equal(payload.kpis.spend.state, 'empty')
  assert.equal(payload.kpis.cash.state, 'empty')
  assert.equal(payload.chart.visitsGap, VISITORS_MISSING)
  const json = JSON.stringify(payload)
  assert.equal(json.includes('hidden@example.com'), false)
  assert.equal(json.includes('536'), false)
  assert.equal(json.includes('9474'), false)
})

test('a second webinar does not inherit w1 registrations', () => {
  const leads = parseLeadMatrix([
    ['25.11.2026, 10:00', 'Hidden', 'hidden@example.com', '', 'optin', '/', '', 'nein', '', '', '', ''],
  ])
  const payload = composeFunnel({
    now: new Date('2026-11-25T12:00:00.000Z'),
    from: '2026-11-01',
    to: '2026-11-25',
    webinarId: 'w2',
    sheet: { ok: true, data: leads },
    ga4: { ok: false, missing: true, error: 'fehlt' },
    calendly: { ok: false, error: 'fehlt' },
    stripe: { ok: false, error: 'fehlt' },
    notion: { ok: false, error: 'fehlt' },
  })
  assert.equal(payload.kpis.registrations.value, 0)
})

test('session token roundtrip rejects a tampered cookie', async () => {
  const token = await createSessionToken('test-secret', 1_700_000_000_000)
  assert.equal(await verifySessionToken('test-secret', token, 1_700_000_000_000), true)
  assert.equal(await verifySessionToken('other-secret', token, 1_700_000_000_000), false)
  assert.equal(await verifySessionToken('test-secret', `${token}x`, 1_700_000_000_000), false)
  assert.equal(await verifySessionToken('test-secret', token, 1_900_000_000_000), false)
})
