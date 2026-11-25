'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { addDays, berlinToday, formatStamp } from '@/lib/berlin'
import {
  CHANNEL_FOOTNOTE,
  CHANNEL_FOOTNOTE_2,
  FUNNEL_FOOTNOTE,
  FUNNEL_FOOTNOTE_2,
  NO_DATA,
  VISITORS_MISSING,
} from '@/lib/copy'
import { fmtEur, fmtInt, fmtPct, fmtShare } from '@/lib/format'
import type { DailyPoint, FunnelPayload, KpiModel } from '@/lib/funnel-types'
import { WEBINARS } from '@/lib/webinars'
import { LOGO_SRC } from './logo'

type TabId = 'overview' | 'marketing' | 'links' | 'leads' | 'sales' | 'payments' | 'check' | 'connections'
type Theme = 'light' | 'dark' | 'system'

const NAV: Array<{ id: TabId; label: string }> = [
  { id: 'overview', label: 'Übersicht' },
  { id: 'marketing', label: 'Marketing' },
  { id: 'links', label: 'Linkzentrale' },
  { id: 'leads', label: 'Leads & Funnel' },
  { id: 'sales', label: 'Sales' },
  { id: 'payments', label: 'Zahlungen' },
  { id: 'check', label: 'Funnelprüfung' },
  { id: 'connections', label: 'Verbindungen' },
]

const KPI_HELP: Record<keyof FunnelPayload['kpis'], string> = {
  spend: 'Werbeausgaben im Filterzeitraum. Meta ist nicht angebunden.',
  registrations: 'Eindeutige E-Mails im Webinar-Sheet für das gewählte Webinar.',
  attendees: 'Eindeutige Live-Show-ups. Das Webinar-Tool ist noch nicht angebunden.',
  bookings: 'Nicht stornierte Calendly-Termine, deren Beginn im Zeitraum liegt.',
  sales: 'Gewonnene Plätze: Stripe-Zahlungen über 2.990 € oder 5.980 €.',
  cash: 'Tatsächlich eingegangenes Stripe-Cash, nicht der Auftragseingang.',
}

export function DashboardApp() {
  const [phase, setPhase] = useState<'checking' | 'login' | 'app'>('checking')
  const [password, setPassword] = useState('')
  const [authError, setAuthError] = useState<string | null>(null)
  const [theme, setTheme] = useState<Theme>('light')
  const [tab, setTab] = useState<TabId>('overview')
  const [menu, setMenu] = useState<'theme' | 'account' | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [from, setFrom] = useState(() => addDays(berlinToday(), -34))
  const [to, setTo] = useState(() => berlinToday())
  const [webinar, setWebinar] = useState('w1')
  const [touched, setTouched] = useState(false)
  const [seriesMode, setSeriesMode] = useState<'both' | 'regs' | 'visits'>('both')
  const [data, setData] = useState<FunnelPayload | null>(null)
  const [sync, setSync] = useState<'checking' | 'on' | 'off'>('checking')
  const [jump, setJump] = useState('')

  useEffect(() => {
    const saved = window.localStorage.getItem('hmc_theme')
    if (saved === 'light' || saved === 'dark' || saved === 'system') setTheme(saved)
    const hash = window.location.hash.replace('#', '') as TabId
    if (NAV.some((item) => item.id === hash)) setTab(hash)
    fetch('/api/auth', { cache: 'no-store' })
      .then((response) => {
        if (response.status === 500) setAuthError('Das Dashboard-Passwort ist serverseitig nicht konfiguriert.')
        setPhase(response.ok ? 'app' : 'login')
      })
      .catch(() => setPhase('login'))
  }, [])

  const load = useCallback(async () => {
    const params = new URLSearchParams({ from, to, webinar })
    const response = await fetch(`/api/funnel?${params}`, { cache: 'no-store' })
    if (response.status === 401) {
      setPhase('login')
      setSync('off')
      return
    }
    if (!response.ok) {
      setSync('off')
      return
    }
    const payload = (await response.json()) as FunnelPayload
    setData(payload)
    setSync('on')
  }, [from, to, webinar])

  useEffect(() => {
    if (phase !== 'app') return
    let stop = false
    const tick = () => {
      if (!stop && document.visibilityState === 'visible') load().catch(() => setSync('off'))
    }
    tick()
    const timer = window.setInterval(tick, 15000)
    document.addEventListener('visibilitychange', tick)
    return () => {
      stop = true
      window.clearInterval(timer)
      document.removeEventListener('visibilitychange', tick)
    }
  }, [phase, load])

  useEffect(() => {
    if (touched || !data?.suggestedFrom || data.suggestedFrom >= from) return
    setFrom(data.suggestedFrom)
  }, [data?.suggestedFrom, touched, from])

  function go(next: TabId) {
    setTab(next)
    setSidebarOpen(false)
    setMenu(null)
    window.history.replaceState(null, '', `#${next}`)
  }

  async function handleAuth(event: React.FormEvent) {
    event.preventDefault()
    setAuthError(null)
    const response = await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    })
    if (response.ok) {
      setPassword('')
      setPhase('app')
      return
    }
    if (response.status === 500) {
      setAuthError('Das Dashboard-Passwort ist serverseitig nicht konfiguriert.')
      return
    }
    setAuthError('Falsches Passwort.')
  }

  async function logout() {
    await fetch('/api/auth', { method: 'DELETE' })
    setData(null)
    setPhase('login')
  }

  function changeTheme(next: Theme) {
    setTheme(next)
    window.localStorage.setItem('hmc_theme', next)
    setMenu(null)
  }

  if (phase === 'checking') {
    return <div className="hmc-login"><p>Laden…</p></div>
  }

  if (phase === 'login') {
    return (
      <div className="hmc-login">
        <div className="login-card">
          <img src={LOGO_SRC} alt="Hiryze" />
          <div className="login-kicker">Mission Control</div>
          <h1>Willkommen zurück.</h1>
          <p>Melde dich an, um auf das Hiryze Mission Control zuzugreifen.</p>
          <form onSubmit={handleAuth}>
            <input
              type="password"
              autoComplete="current-password"
              autoFocus
              placeholder="Passwort"
              value={password}
              className={authError ? 'error' : undefined}
              onChange={(event) => { setPassword(event.target.value); setAuthError(null) }}
            />
            {authError && <p className="login-error">{authError}</p>}
            <button type="submit">Einloggen</button>
          </form>
        </div>
      </div>
    )
  }

  const current = NAV.find((item) => item.id === tab) ?? NAV[0]
  const openChecks = data?.checks.length ?? 0
  const sheetOk = data ? data.connections.find((item) => item.id === 'sheet')?.ok ?? false : null
  const syncText = sheetOk && sync === 'on'
    ? 'Automatischer Abgleich aktiv'
    : sheetOk === false
      ? 'Sheet nicht verbunden'
      : 'Abgleich wird geprüft'

  return (
    <div className="hmc" data-theme={theme}>
      {sidebarOpen && <button className="backdrop" aria-label="Menü schließen" onClick={() => setSidebarOpen(false)} />}
      <aside className={sidebarOpen ? 'sidebar open' : 'sidebar'}>
        <div className="brand">
          <img src={LOGO_SRC} alt="Hiryze" />
          <div className="brand-kicker">Mission Control</div>
        </div>
        <button className="client" type="button" aria-haspopup="listbox">
          <span className="client-mark">H</span>
          <span>
            <span className="client-name">Hiryze</span>
            <span className="client-sub">Lena</span>
          </span>
          <Chevron />
        </button>
        <div className="nav-label">Arbeitsbereich</div>
        <nav className="nav">
          {NAV.map((item) => (
            <button
              key={item.id}
              type="button"
              className={tab === item.id ? 'nav-item active' : 'nav-item'}
              onClick={() => go(item.id)}
            >
              <NavIcon id={item.id} />
              {item.label}
              {item.id === 'check' && openChecks > 0 && <span className="nav-badge">{openChecks}</span>}
            </button>
          ))}
        </nav>
        <div className="sidebar-foot">
          <div className="workshop-kicker">Nächster Live-Workshop</div>
          <div className="workshop-title">{data?.nextWorkshop.title ?? 'Meet yourself in Safety'}</div>
          <div className="workshop-date">{data?.nextWorkshop.sidebarDate ?? '09. Dezember 2026 · 19:00'}</div>
          <div className="local-card">
            <LinkIcon />
            <div>
              <div className="local-title">Lokales Dashboard</div>
              <div className="local-status">
                <i className={sheetOk && sync === 'on' ? 'status-dot on' : sheetOk === false ? 'status-dot off' : 'status-dot'} />
                {syncText}
              </div>
            </div>
          </div>
        </div>
      </aside>
      <div className="main">
        <header className="topbar">
          <button className="menu-toggle menu-button" type="button" onClick={() => setSidebarOpen(true)} aria-label="Menü öffnen">Menü</button>
          <div className="crumb">Hiryze <span>/</span> <strong>{current.label}</strong></div>
          <div className="top-actions">
            <div className="menu">
              <button className="menu-button" type="button" onClick={() => setMenu(menu === 'theme' ? null : 'theme')}>
                <SunIcon /> {theme === 'light' ? 'Hell' : theme === 'dark' ? 'Dunkel' : 'System'} <Chevron />
              </button>
              {menu === 'theme' && (
                <div className="menu-pop" role="menu">
                  {(['light', 'system', 'dark'] as const).map((item) => (
                    <button key={item} type="button" role="menuitemradio" aria-checked={theme === item} onClick={() => changeTheme(item)}>
                      {item === 'light' ? 'Hell' : item === 'dark' ? 'Dunkel' : 'System'}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <ConnectionPill labels={data?.connectedLabels ?? []} />
            <div className="menu">
              <button className="account" type="button" onClick={() => setMenu(menu === 'account' ? null : 'account')}>
                <span className="account-mark">LE</span> Konto <Chevron />
              </button>
              {menu === 'account' && (
                <div className="menu-pop">
                  <button type="button" onClick={logout}>Abmelden</button>
                </div>
              )}
            </div>
          </div>
        </header>
        <div className="content" onClick={() => menu && setMenu(null)}>
          {tab === 'overview' && (
            <Overview
              data={data}
              from={from}
              to={to}
              webinar={webinar}
              seriesMode={seriesMode}
              onFrom={(value) => { setTouched(true); setFrom(value) }}
              onTo={(value) => { setTouched(true); setTo(value) }}
              onWebinar={setWebinar}
              onSeries={setSeriesMode}
              onNavigate={go}
              onJump={setJump}
              jump={jump}
            />
          )}
          {tab !== 'overview' && <Subpage tab={tab} data={data} onNavigate={go} />}
        </div>
      </div>
    </div>
  )
}

function ConnectionPill({ labels }: { labels: string[] }) {
  if (!labels.length) {
    return <span className="pill warn"><i />Keine Quelle verbunden</span>
  }
  return <span className="pill"><i />{labels.join(' + ')} verbunden</span>
}

function Overview({
  data, from, to, webinar, seriesMode, onFrom, onTo, onWebinar, onSeries, onNavigate, jump, onJump,
}: {
  data: FunnelPayload | null
  from: string
  to: string
  webinar: string
  seriesMode: 'both' | 'regs' | 'visits'
  onFrom: (value: string) => void
  onTo: (value: string) => void
  onWebinar: (value: string) => void
  onSeries: (value: 'both' | 'regs' | 'visits') => void
  onNavigate: (tab: TabId) => void
  jump: string
  onJump: (value: string) => void
}) {
  const selected = WEBINARS.find((item) => item.id === webinar) ?? WEBINARS[0]
  return (
    <>
      <div className="page-kicker">Aktuelles Webinar · {selected.title}</div>
      <div className="page-head">
        <div>
          <h1 className="page-title serif">Dein Webinar im Überblick</h1>
          <p className="page-meta">{data?.webinar.dateLine ?? `${selected.dateKey} · Europe/Berlin`}</p>
        </div>
        <button className="text-link" type="button" onClick={() => onNavigate('links')}>Links öffnen →</button>
      </div>
      <div className="filters">
        <label className="combo">Von
          <input type="date" value={from} max={to} onChange={(event) => onFrom(event.target.value)} />
        </label>
        <label className="combo">Bis
          <input type="date" value={to} min={from} onChange={(event) => onTo(event.target.value)} />
        </label>
        <label className="combo">Webinar
          <select value={webinar} onChange={(event) => onWebinar(event.target.value)}>
            {WEBINARS.map((item) => <option key={item.id} value={item.id}>{item.id.toUpperCase()}</option>)}
          </select>
        </label>
        <label className="combo">Währung
          <select defaultValue="EUR" aria-label="Währung"><option value="EUR">EUR</option></select>
        </label>
        <span className="filter-note">Nur Ereignisse zum gewählten Webinar</span>
      </div>

      {!data && <p className="sub-lead">Daten werden gelesen…</p>}
      {data && (
        <>
          <div className="kpi-grid">
            <KpiCard label="Werbeausgaben" kpi={data.kpis.spend} help={KPI_HELP.spend} />
            <KpiCard label="Webinar-Anmeldungen" kpi={data.kpis.registrations} help={KPI_HELP.registrations} />
            <KpiCard label="Webinar-Teilnehmer" kpi={data.kpis.attendees} help={KPI_HELP.attendees} />
            <KpiCard label="Terminbuchungen" kpi={data.kpis.bookings} help={KPI_HELP.bookings} />
            <KpiCard label="Verkäufe" kpi={data.kpis.sales} help={KPI_HELP.sales} />
            <KpiCard label="Zahlungseingänge" kpi={data.kpis.cash} help={KPI_HELP.cash} />
          </div>

          <section className="block">
            <div className="block-head">
              <h2 className="serif">Entwicklung & Funnel</h2>
              <div className="block-tools">
                <label className="combo">
                  <select defaultValue="verlauf" aria-label="Darstellung"><option value="verlauf">Verlauf</option></select>
                </label>
                <label className="combo">
                  <select value={seriesMode} aria-label="Serien" onChange={(event) => onSeries(event.target.value as 'both' | 'regs' | 'visits')}>
                    <option value="both">Besuche & Anmeldungen</option>
                    <option value="regs">Nur Anmeldungen</option>
                    <option value="visits">Nur Besuche</option>
                  </select>
                </label>
                <button className="text-link" type="button" onClick={() => onNavigate('marketing')}>Marketing-Auswertung öffnen →</button>
              </div>
            </div>
            <article className="card chart-card">
              <h3 className="chart-title serif">Kampagnenentwicklung</h3>
              <p className="chart-sub">Erfasste Ergebnisse pro Tag. Fehlende Tage bleiben unbekannt.</p>
              <div className="legend">
                {seriesMode !== 'regs' && (
                  <span><i /> <b>Landingpage-Besuche</b> {data.chart.visitsGap && <em className="gap"> · {data.chart.visitsGap}</em>}</span>
                )}
                {seriesMode !== 'visits' && (
                  <span><i className="alt" /> <b>Anmeldungen</b> {data.chart.registrationsGap && <em className="gap"> · {data.chart.registrationsGap}</em>}</span>
                )}
              </div>
              <CampaignChart
                visits={seriesMode === 'regs' ? null : data.chart.visits}
                registrations={seriesMode === 'visits' ? null : data.chart.registrations}
                visitsGap={data.chart.visitsGap}
                registrationsGap={data.chart.registrationsGap}
              />
            </article>
          </section>

          <FunnelBlock data={data} />

          <div className="split">
            <article className="card">
              <div className="card-head">
                <div>
                  <div className="card-kicker">Herkunft der Ergebnisse</div>
                  <h2 className="serif">Kanäle im Vergleich</h2>
                </div>
                <button className="text-link" type="button" onClick={() => onNavigate('marketing')}>Auswertung ⌄</button>
              </div>
              <ChannelTable rows={data.channels} />
              <div className="table-notes">
                <p>{CHANNEL_FOOTNOTE}</p>
                <p>{CHANNEL_FOOTNOTE_2}</p>
              </div>
            </article>
            <article className="card">
              <div className="card-head">
                <div>
                  <div className="card-kicker">Kundensetup · aktueller Prüfstand</div>
                  <h2 className="serif">Die nächsten Schritte</h2>
                </div>
                <span className="open-pill">{data.checks.length} offen</span>
              </div>
              <div className="steps">
                {data.checks.slice(0, 4).map((item) => (
                  <button key={item.id} className="step" type="button" onClick={() => onNavigate(item.tab as TabId)}>
                    <span className="warn-ico">!</span>
                    <span><small>{item.area}</small><b>{item.title}</b></span>
                    <Chevron />
                  </button>
                ))}
              </div>
              <div className="step-links">
                <button className="text-link" type="button" onClick={() => onNavigate('check')}>Alle Prüfpunkte ansehen</button>
                <button className="text-link" type="button" onClick={() => onNavigate('connections')}>Verbindungen</button>
              </div>
            </article>
          </div>

          <div className="link-grid">
            <button className="link-card" type="button" onClick={() => onNavigate('leads')}><b>Kontaktverläufe</b><span>Leads & Funnel →</span></button>
            <button className="link-card" type="button" onClick={() => onNavigate('sales')}><b>Termine und Abschlüsse</b><span>Sales →</span></button>
            <button className="link-card" type="button" onClick={() => onNavigate('payments')}><b>Bestätigte Webinar-Zahlungen</b><span>Zahlungen →</span></button>
          </div>
          <footer className="footer">
            <span>Hiryze · Marketing, Leads & Sales</span>
            <span>Geschütztes Dashboard · Prüfdaten vom {formatStamp(new Date(data.generatedAt))}</span>
            <input
              className="jump"
              placeholder="Bereich springen"
              value={jump}
              aria-label="Bereich springen"
              onChange={(event) => onJump(event.target.value)}
              onKeyDown={(event) => {
                if (event.key !== 'Enter') return
                const match = NAV.find((item) => item.label.toLowerCase().includes(jump.toLowerCase()))
                if (match) onNavigate(match.id)
              }}
            />
          </footer>
        </>
      )}
    </>
  )
}

function KpiCard({ label, kpi, help }: { label: string; kpi: KpiModel; help: string }) {
  const text = kpi.format === 'eur' && kpi.value != null ? fmtEur(kpi.value) : kpi.value != null ? fmtInt(kpi.value) : ''
  return (
    <article className="kpi">
      <div className="kpi-top">
        <div className="kpi-label">{label}</div>
        <button className="info" type="button" title={help} aria-label={help}>i</button>
      </div>
      {kpi.state === 'value' && <div className="kpi-value">{text}</div>}
      <div className="kpi-chart">
        <span className="kpi-compare">{kpi.compareLabel}</span>
        <Sparkline points={kpi.series} />
        {kpi.state === 'empty' && <div className="kpi-empty">{kpi.emptyText || NO_DATA}</div>}
      </div>
      {kpi.note && <div className="kpi-note">{kpi.note}</div>}
      <div className="kpi-foot"><span>{kpi.previousLabel}</span><span>{kpi.rangeLabel}</span></div>
    </article>
  )
}

function Sparkline({ points }: { points: DailyPoint[] }) {
  const known = points.filter((point) => point.value != null)
  if (!known.length) {
    return (
      <svg className="spark" viewBox="0 0 320 48" preserveAspectRatio="none" aria-hidden>
        <line className="flat" x1="0" y1="30" x2="320" y2="30" />
      </svg>
    )
  }
  const values = known.map((point) => point.value ?? 0)
  const min = Math.min(...values, 0)
  const max = Math.max(...values, 1)
  const span = max - min || 1
  let path = ''
  points.forEach((point, index) => {
    if (point.value == null) return
    const x = points.length === 1 ? 160 : (index / (points.length - 1)) * 320
    const y = 42 - ((point.value - min) / span) * 32
    const previous = index > 0 ? points[index - 1].value : null
    path += `${previous == null ? 'M' : 'L'}${x.toFixed(1)} ${y.toFixed(1)} `
  })
  return (
    <svg className="spark" viewBox="0 0 320 48" preserveAspectRatio="none" aria-hidden>
      <path d={path} />
    </svg>
  )
}

function CampaignChart({
  visits, registrations, visitsGap, registrationsGap,
}: {
  visits: DailyPoint[] | null
  registrations: DailyPoint[] | null
  visitsGap: string | null
  registrationsGap: string | null
}) {
  const [hover, setHover] = useState<number | null>(null)
  const dates = (registrations ?? visits ?? []).map((point) => point.date)
  const usable = dates.length > 0 && (
    (visits ?? []).some((point) => point.value != null) || (registrations ?? []).some((point) => point.value != null)
  )
  if (!usable) {
    return <div className="chart-empty">{visitsGap || registrationsGap || NO_DATA}</div>
  }
  const width = 920
  const height = 240
  const pad = { l: 36, r: 12, t: 16, b: 28 }
  const values = [...(visits ?? []), ...(registrations ?? [])].map((point) => point.value).filter((value): value is number => value != null)
  const max = niceMax(Math.max(...values, 1))
  const innerW = width - pad.l - pad.r
  const innerH = height - pad.t - pad.b
  const x = (index: number) => pad.l + (dates.length === 1 ? innerW / 2 : (index / (dates.length - 1)) * innerW)
  const y = (value: number) => pad.t + innerH - (value / max) * innerH
  const ticks = [0, 0.25, 0.5, 0.75, 1]
  const labelEvery = Math.max(1, Math.ceil(dates.length / 6))

  return (
    <svg
      className="plot"
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label="Kampagnenentwicklung"
      onMouseLeave={() => setHover(null)}
      onMouseMove={(event) => {
        const bounds = event.currentTarget.getBoundingClientRect()
        const ratio = (event.clientX - bounds.left) / bounds.width
        const index = Math.round(ratio * (dates.length - 1))
        setHover(Math.max(0, Math.min(dates.length - 1, index)))
      }}
    >
      <text x={width - 8} y="12" textAnchor="end">Anzahl</text>
      {ticks.map((tick) => {
        const yy = y(max * tick)
        return (
          <g key={tick}>
            <line className="grid" x1={pad.l} x2={width - pad.r} y1={yy} y2={yy} />
            <text x={pad.l - 6} y={yy + 3} textAnchor="end">{fmtInt(Math.round(max * tick))}</text>
          </g>
        )
      })}
      <path className="visits" d={linePath(visits, x, y)} />
      <path className="regs" d={linePath(registrations, x, y)} />
      {dates.map((date, index) => index % labelEvery === 0 || index === dates.length - 1 ? (
        <text key={date} x={x(index)} y={height - 8} textAnchor="middle">{date.slice(8, 10)}.{date.slice(5, 7)}.</text>
      ) : null)}
      {hover != null && (
        <line className="grid" x1={x(hover)} x2={x(hover)} y1={pad.t} y2={pad.t + innerH} />
      )}
      {hover != null && (
        <foreignObject x={Math.min(x(hover) + 8, width - 160)} y={pad.t} width="150" height="64">
          <div className="tip">
            <div>{dates[hover].split('-').reverse().join('.')}</div>
            {visits && <div>Besuche {pointText(visits[hover])}</div>}
            {registrations && <div>Anmeldungen {pointText(registrations[hover])}</div>}
          </div>
        </foreignObject>
      )}
    </svg>
  )
}

function pointText(point: DailyPoint | undefined): string {
  if (!point || point.value == null) return '—'
  return fmtInt(point.value)
}

function linePath(series: DailyPoint[] | null, x: (index: number) => number, y: (value: number) => number): string {
  if (!series) return ''
  let path = ''
  series.forEach((point, index) => {
    if (point.value == null) return
    const previous = index > 0 ? series[index - 1].value : null
    path += `${previous == null ? 'M' : 'L'}${x(index).toFixed(1)} ${y(point.value).toFixed(1)} `
  })
  return path
}

function niceMax(value: number): number {
  if (value <= 1) return 1
  const power = 10 ** Math.floor(Math.log10(value))
  const scaled = value / power
  const step = scaled <= 1 ? 1 : scaled <= 2 ? 2 : scaled <= 5 ? 5 : 10
  return step * power
}

function FunnelBlock({ data }: { data: FunnelPayload }) {
  const [open, setOpen] = useState(false)
  const rate = data.conversion.rate
  const buyers = data.conversion.buyers == null ? '—' : fmtInt(data.conversion.buyers)
  const registrations = data.conversion.registrations == null ? '—' : fmtInt(data.conversion.registrations)
  return (
    <section className="funnel-card">
      <div className="funnel-head">
        <div>
          <div className="funnel-kicker">Der gesamte Funnel</div>
          <h2 className="serif">Vom ersten Besuch bis zum Verkauf</h2>
        </div>
        <button className="text-link" type="button" onClick={() => setOpen((value) => !value)}>Vorhandene Nachweise</button>
        {open && (
          <ul className="evidence">
            {data.stages.map((stage) => (
              <li key={stage.index}><b>{stage.index}</b> {stage.label}: {stage.value == null ? 'offen' : fmtInt(stage.value)}</li>
            ))}
          </ul>
        )}
      </div>
      <div className="funnel-body">
        <div>
          <div className="ring-wrap">
            <Ring rate={rate} />
            <div className="ring-copy">
              <strong>{rate == null ? '—' : fmtPct(rate)}</strong>
              <span>Gesamtconversion</span>
            </div>
          </div>
          <div className="ring-sub">Anmeldung → Kauf<b>{buyers} von {registrations}</b></div>
        </div>
        <div className="stages">
          {data.stages.map((stage, index) => {
            const previous = index === 0 ? null : data.stages[index - 1]
            const quote = stage.value != null && previous?.value != null && previous.value > 0
              ? stage.value / previous.value
              : null
            return (
              <div className="stage" key={stage.index}>
                <div className="stage-head">
                  <span className="stage-badge">{stage.index}</span>
                  {index < data.stages.length - 1 && <span className="stage-arrow" />}
                </div>
                <div className="stage-label">{stage.label}</div>
                {stage.gap === 'visitors' && <div className="stage-gap">{VISITORS_MISSING}</div>}
                {stage.gap !== 'visitors' && stage.value == null && <div className="stage-value stage-dash">—</div>}
                {stage.value != null && <div className="stage-value">{fmtInt(stage.value)}</div>}
                {index === 0 && stage.value != null && (
                  <div className="stage-base">Ausgangspunkt<span>Erfasste Besuche</span></div>
                )}
                {index > 0 && (
                  <>
                    <div className="stage-quote">
                      {quote == null ? '—' : fmtPct(quote)}
                      <small>der vorherigen Stufe</small>
                    </div>
                    {quote != null && previous && (
                      <div className="stage-frac">{fmtInt(stage.value ?? 0)} / {fmtInt(previous.value ?? 0)}</div>
                    )}
                  </>
                )}
              </div>
            )
          })}
        </div>
      </div>
      <div className="funnel-notes">
        <p>{FUNNEL_FOOTNOTE}</p>
        <p>{FUNNEL_FOOTNOTE_2}</p>
      </div>
    </section>
  )
}

function Ring({ rate }: { rate: number | null }) {
  const radius = 68
  const length = 2 * Math.PI * radius
  const dash = rate == null ? 0 : Math.max(0, Math.min(1, rate)) * length
  return (
    <svg viewBox="0 0 168 168" aria-hidden>
      <circle cx="84" cy="84" r={radius} fill="none" stroke="#e3ebef" strokeWidth="8" />
      {rate != null && dash > 0 && (
        <circle
          cx="84"
          cy="84"
          r={radius}
          fill="none"
          stroke="#4a7a8c"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${length - dash}`}
          transform="rotate(-90 84 84)"
        />
      )}
    </svg>
  )
}

function ChannelTable({ rows }: { rows: FunnelPayload['channels'] }) {
  const totals = useMemo(() => ({
    clicks: sumKnown(rows.map((row) => row.clicks)),
    registrations: sumKnown(rows.map((row) => row.registrations)),
    bookings: sumKnown(rows.map((row) => row.bookings)),
    sales: sumKnown(rows.map((row) => row.sales)),
    payments: sumKnown(rows.map((row) => row.payments)),
  }), [rows])
  return (
    <table className="channel-table">
      <thead>
        <tr>
          <th>Kanal</th><th>Klicks</th><th>Anmeldungen</th><th>Terminbuchungen</th><th>Verkäufe</th><th>Zahlungen</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.id}>
            <td>{row.label}</td>
            <Cell value={row.clicks} total={totals.clicks} />
            <Cell value={row.registrations} total={totals.registrations} />
            <Cell value={row.bookings} total={totals.bookings} />
            <Cell value={row.sales} total={totals.sales} />
            <Cell value={row.payments} total={totals.payments} />
          </tr>
        ))}
      </tbody>
    </table>
  )
}

function Cell({ value, total }: { value: number | null; total: number | null }) {
  if (value == null) return <td>—</td>
  const share = total ? fmtShare(value, total) : null
  const width = total && value > 0 ? Math.max(4, Math.round((value / total) * 100)) : 0
  return (
    <td>
      <div className="metric">
        <b>{fmtInt(value)}</b>
        {share && <small>{share}</small>}
        {width > 0 && <span className="bar"><i style={{ width: `${width}%` }} /></span>}
      </div>
    </td>
  )
}

function sumKnown(values: Array<number | null>): number | null {
  if (values.every((value) => value == null)) return null
  return values.reduce<number>((sum, value) => sum + (value ?? 0), 0)
}

function Subpage({ tab, data, onNavigate }: { tab: TabId; data: FunnelPayload | null; onNavigate: (tab: TabId) => void }) {
  if (tab === 'marketing') return <Marketing data={data} />
  if (tab === 'links') return <Links />
  if (tab === 'leads') return <Leads data={data} />
  if (tab === 'sales') return <Sales data={data} />
  if (tab === 'payments') return <Payments data={data} />
  if (tab === 'check') return <Checks data={data} onNavigate={onNavigate} />
  return <Connections data={data} />
}

function PageIntro({ kicker, title, text }: { kicker: string; title: string; text: string }) {
  return (
    <>
      <div className="page-kicker">{kicker}</div>
      <h1 className="sub-title serif">{title}</h1>
      <p className="sub-lead">{text}</p>
    </>
  )
}

function Marketing({ data }: { data: FunnelPayload | null }) {
  return (
    <>
      <PageIntro kicker="Marketing" title="Kanäle und UTM" text="First-Touch aus der UTM-Zelle im Webinar-Sheet. Paid bleibt in Ads, auch wenn die Quelle Instagram ist. Ohne Parameter zählt die Zeile als nicht zugeordnet." />
      {data ? <ChannelTable rows={data.channels} /> : <p>Daten werden gelesen…</p>}
      <ul className="rules">
        <li>Ads: meta, google und andere Paid-Sources, Medium cpc oder paid_social.</li>
        <li>E-Mail: brevo oder Medium email.</li>
        <li>Instagram: instagram mit organic_social. Bezahltes Instagram bleibt Ads.</li>
        <li>WhatsApp, Webinar und Sales (lena / network) haben eigene Zeilen.</li>
      </ul>
    </>
  )
}

function Links() {
  const items = [
    ['Live-Funnel', 'https://go.hiryze.de'],
    ['Opt-in in diesem Repo', '/'],
    ['Quiz', '/quiz'],
    ['Danke', '/danke'],
  ]
  return (
    <>
      <PageIntro kicker="Linkzentrale" title="Öffentliche Wege" text="Der produktive Opt-in läuft im Lovable-Funnel. Die Seiten in diesem Repo sind der ältere Funnel und werden hier nur verlinkt." />
      <div className="link-grid">
        {items.map(([label, href]) => (
          <a key={href} className="link-card" href={href}><b>{label}</b><span>{href} →</span></a>
        ))}
      </div>
    </>
  )
}

function Leads({ data }: { data: FunnelPayload | null }) {
  const leads = data?.leads
  return (
    <>
      <PageIntro kicker="Leads & Funnel" title="Anmeldungen" text="Nur Zählwerte. Namen, E-Mails und Telefonnummern bleiben im Sheet und kommen nicht ins Dashboard." />
      <div className="stat-grid">
        <Stat label="Heute" value={leads?.today} />
        <Stat label="Letzte 7 Tage" value={leads?.last7d} />
        <Stat label="Gesamt" value={leads?.total} />
        <Stat label="Tripwire-Käufe" value={leads?.purchases} />
        <Stat label="Tripwire-CVR" value={leads?.tripwireCvr == null ? null : fmtPct(leads.tripwireCvr)} />
        <Stat label="Summe Betrag" value={leads?.purchaseAmount == null ? null : fmtEur(leads.purchaseAmount)} />
      </div>
      <article className="card">
        <h2 className="serif">Nach Quelle</h2>
        {(leads?.bySource.length ?? 0) === 0 && <p className="sub-lead">Noch keine Daten</p>}
        <ul className="rules">
          {leads?.bySource.map((item) => <li key={item.label}>{item.label}: {fmtInt(item.count)}</li>)}
        </ul>
      </article>
      <article className="card" style={{ marginTop: 14 }}>
        <h2 className="serif">Notion-Status</h2>
        {data?.notion.total == null && <p className="sub-lead">Notion ist nicht verbunden.</p>}
        <ul className="rules">
          {data?.notion.statuses.map((item) => <li key={item.name}>{item.name}: {fmtInt(item.count)}</li>)}
        </ul>
      </article>
    </>
  )
}

function Sales({ data }: { data: FunnelPayload | null }) {
  const [zusagen, setZusagen] = useState(0)
  useEffect(() => {
    const key = `hmc_zusagen_${berlinToday()}`
    const saved = window.localStorage.getItem(key)
    if (saved) setZusagen(Number(saved) || 0)
  }, [])
  function update(next: number) {
    const value = Math.max(0, next)
    setZusagen(value)
    window.localStorage.setItem(`hmc_zusagen_${berlinToday()}`, String(value))
  }
  return (
    <>
      <PageIntro kicker="Sales" title="Termine und Abschlüsse" text="Terminbuchungen sind nicht stornierte Calendly-Termine. Die Show-up-Zahl ist nur der Anteil nicht stornierter Termine, keine gemessene Anwesenheit." />
      <div className="stat-grid">
        <Stat label="Termine im Zeitraum" value={data?.calendly.bookings} />
        <Stat label="Bevorstehend, 60 Tage" value={data?.calendly.upcoming} />
        <Stat label="Nicht storniert, 30 Tage" value={data?.calendly.showUpRate == null ? null : `${new Intl.NumberFormat('de-DE', { maximumFractionDigits: 1 }).format(data.calendly.showUpRate)} %`} />
      </div>
      <article className="card">
        <h2 className="serif">Mündliche Zusagen heute</h2>
        <div className="kpi-value">{zusagen}</div>
        <div className="stepper">
          <button type="button" onClick={() => update(zusagen - 1)} aria-label="Zusage entfernen">−</button>
          <button type="button" onClick={() => update(zusagen + 1)} aria-label="Zusage hinzufügen">+</button>
        </div>
        <p className="sub-lead">Liegt nur in diesem Browser und setzt sich mit dem Berliner Datum zurück.</p>
      </article>
    </>
  )
}

function Payments({ data }: { data: FunnelPayload | null }) {
  return (
    <>
      <PageIntro kicker="Zahlungen" title="Bestätigte Webinar-Zahlungen" text="Zahlungseingänge sind eingegangenes Stripe-Cash. Verkäufe zählen nur Zahlungen über 2.990 € oder 5.980 €. Tripwire-Beträge aus dem Sheet stehen unter Leads und werden hier nicht dazugezählt." />
      <div className="stat-grid">
        <Stat label="Cash im Zeitraum" value={data?.stripe.cash == null ? null : data.stripe.cash > 0 ? fmtEur(data.stripe.cash) : NO_DATA} />
        <Stat label="Plätze" value={data?.stripe.seats} />
        <Stat label="Zahlungsvorgänge" value={data?.stripe.charges} />
      </div>
    </>
  )
}

function Checks({ data, onNavigate }: { data: FunnelPayload | null; onNavigate: (tab: TabId) => void }) {
  return (
    <>
      <PageIntro kicker="Funnelprüfung" title="Offene Prüfpunkte" text="Dieselbe Liste speist den Zähler in der Sidebar. Ein Punkt verschwindet, sobald die Quelle wirklich antwortet." />
      <div className="steps">
        {(data?.checks ?? []).map((item) => (
          <button key={item.id} className="step" type="button" onClick={() => onNavigate(item.tab as TabId)}>
            <span className="warn-ico">!</span>
            <span><small>{item.area}</small><b>{item.title}</b></span>
            <Chevron />
          </button>
        ))}
        {data && data.checks.length === 0 && <p>Keine offenen Prüfpunkte.</p>}
      </div>
    </>
  )
}

function Connections({ data }: { data: FunnelPayload | null }) {
  return (
    <>
      <PageIntro kicker="Verbindungen" title="Quellen" text="Der Status kommt aus dem letzten Abruf. Eine Quelle gilt nur als verbunden, wenn der Endpunkt geantwortet hat." />
      <div className="conn-grid">
        {(data?.connections ?? []).map((item) => (
          <article key={item.id} className="conn">
            <b><i className={item.ok ? 'status-dot on' : 'status-dot off'} />{item.label}</b>
            <p>{item.detail}</p>
          </article>
        ))}
      </div>
      <div className="env-note">
        Schlüssel stehen nur in den Vercel-Variablen, für Production und Preview:
        <code> DASHBOARD_PASSWORD · GOOGLE_SERVICE_ACCOUNT_JSON · LEADS_SHEET_ID · LEADS_SHEET_TAB · GA4_PROPERTY_ID · CALENDLY_TOKEN · STRIPE_SECRET_KEY · NOTION_TOKEN · NOTION_DATABASE_ID</code>
        <p>GA4_PROPERTY_ID ist die numerische Property-ID der Data API, nicht die Mess-ID. Der Service Account braucht dort die Rolle Betrachter und Lesezugriff auf das Sheet „Webinar Leads“. Die Mess-ID des Datenstreams Webinar-Funnel auf go.hiryze.de gehört im Lovable-Funnel in GA4_MEASUREMENT_ID.</p>
      </div>
    </>
  )
}

function Stat({ label, value }: { label: string; value: number | string | null | undefined }) {
  const text = value == null ? '—' : typeof value === 'number' ? fmtInt(value) : value
  return <article className="stat"><span>{label}</span><b>{text}</b></article>
}

function Chevron() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
      <path d="M3 4.5 6 7.5 9 4.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function SunIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden>
      <circle cx="8" cy="8" r="3" stroke="currentColor" strokeWidth="1.4" />
      <path d="M8 1.5v1.8M8 12.7v1.8M1.5 8h1.8M12.7 8h1.8M3.2 3.2l1.3 1.3M11.5 11.5l1.3 1.3M12.8 3.2l-1.3 1.3M4.5 11.5l-1.3 1.3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  )
}

function LinkIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
      <path d="M6.5 9.5 9.5 6.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M7 4.5 8.2 3.3a2.6 2.6 0 0 1 3.7 3.7L10.7 8.2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M9 11.5 7.8 12.7a2.6 2.6 0 0 1-3.7-3.7L5.3 7.8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  )
}

function NavIcon({ id }: { id: TabId }) {
  const common = { width: 16, height: 16, viewBox: '0 0 16 16', fill: 'none', 'aria-hidden': true } as const
  if (id === 'overview') {
    return <svg {...common}><rect x="2" y="2" width="5" height="5" rx="1.2" stroke="currentColor" strokeWidth="1.4" /><rect x="9" y="2" width="5" height="5" rx="1.2" stroke="currentColor" strokeWidth="1.4" /><rect x="2" y="9" width="5" height="5" rx="1.2" stroke="currentColor" strokeWidth="1.4" /><rect x="9" y="9" width="5" height="5" rx="1.2" stroke="currentColor" strokeWidth="1.4" /></svg>
  }
  if (id === 'marketing') {
    return <svg {...common}><path d="M2 12 6 7l3 2 5-6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
  }
  if (id === 'links') return <LinkIcon />
  if (id === 'leads') {
    return <svg {...common}><circle cx="8" cy="5.5" r="2.2" stroke="currentColor" strokeWidth="1.4" /><path d="M3.5 13c.6-2.2 2.2-3.3 4.5-3.3S12 10.8 12.5 13" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" /></svg>
  }
  if (id === 'sales') {
    return <svg {...common}><rect x="2.5" y="3.5" width="11" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.4" /><path d="M2.5 7h11M5.5 2.5v2M10.5 2.5v2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" /></svg>
  }
  if (id === 'payments') {
    return <svg {...common}><rect x="2" y="3.5" width="12" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.4" /><path d="M2 7h12" stroke="currentColor" strokeWidth="1.4" /></svg>
  }
  if (id === 'check') {
    return <svg {...common}><path d="M3.5 8.5 6.5 11.5 12.5 4.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
  }
  return <svg {...common}><circle cx="4" cy="8" r="1.6" stroke="currentColor" strokeWidth="1.3" /><circle cx="12" cy="4.5" r="1.6" stroke="currentColor" strokeWidth="1.3" /><circle cx="12" cy="11.5" r="1.6" stroke="currentColor" strokeWidth="1.3" /><path d="M5.5 7.4 10.4 5.2M5.6 8.7l4.8 2.2" stroke="currentColor" strokeWidth="1.3" /></svg>
}
