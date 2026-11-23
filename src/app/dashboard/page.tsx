'use client'

import { useState, useEffect, useCallback } from 'react'

const LOGO_SRC =
  'data:image/webp;base64,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'

type TabId = 'overview' | 'marketing' | 'links' | 'leads' | 'sales' | 'payments' | 'check' | 'connections'

interface CalendlyData {
  user?: { name: string; email: string; timezone: string }
  stats?: { todayCount: number; thisWeekCount: number; upcomingTotal: number; pastTotal: number; showUpRate: number | null }
  upcoming?: Array<{ name: string; startTime: string; endTime: string }>
  error?: string
}
interface StripeData {
  revenueMonth?: number
  revenue30d?: number
  currency?: string
  activeSubscriptions?: number
  mrr?: number
  newCustomers30d?: number
  recentCharges?: Array<{ amount: number; currency: string; date: string; description: string | null }>
  error?: string
}
interface NotionData {
  total?: number
  statusDistribution?: Record<string, number>
  recent?: Array<{ name: string; status: string; email: string | null; created: string | null }>
  error?: string
}

function fmt(n: number, currency = 'EUR') {
  return new Intl.NumberFormat('de-DE', { style: 'currency', currency: currency.toUpperCase(), minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n)
}
function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
}

export default function Dashboard() {
  const [password, setPassword] = useState('')
  const [authed, setAuthed] = useState(false)
  const [authError, setAuthError] = useState(false)
  const [tab, setTab] = useState<TabId>('overview')
  const [calendly, setCalendly] = useState<CalendlyData | null>(null)
  const [stripe, setStripe] = useState<StripeData | null>(null)
  const [notion, setNotion] = useState<NotionData | null>(null)
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('system')
  const [zusagen, setZusagen] = useState(0)

  const todayKey = () => {
    const d = new Date()
    return `hmc_zusagen_${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  }

  const fetchAll = useCallback(async () => {
    const [c, s, n] = await Promise.all([
      fetch('/api/calendly').then(r => r.json()).catch(() => ({ error: 'Fehler' })),
      fetch('/api/stripe').then(r => r.json()).catch(() => ({ error: 'Fehler' })),
      fetch('/api/notion').then(r => r.json()).catch(() => ({ error: 'Fehler' })),
    ])
    setCalendly(c)
    setStripe(s)
    setNotion(n)
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return
    const hash = window.location.hash.replace('#', '') as TabId
    if (hash) setTab(hash)
    if (sessionStorage.getItem('hmc_auth') === '1') {
      setAuthed(true)
    }
    try {
      const saved = localStorage.getItem(todayKey())
      if (saved !== null) setZusagen(parseInt(saved, 10) || 0)
    } catch {}
  }, [])

  useEffect(() => {
    if (!authed) return
    fetchAll()
  }, [authed, fetchAll])

  useEffect(() => {
    if (typeof document === 'undefined') return
    if (theme === 'dark') document.documentElement.setAttribute('data-theme', 'dark')
    else if (theme === 'light') document.documentElement.setAttribute('data-theme', 'light')
    else document.documentElement.removeAttribute('data-theme')
  }, [theme])

  function navigate(id: TabId) {
    setTab(id)
    window.location.hash = id
  }

  async function handleAuth(e: React.FormEvent) {
    e.preventDefault()
    const res = await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    })
    if (res.ok) {
      setAuthed(true)
      sessionStorage.setItem('hmc_auth', '1')
    } else {
      setAuthError(true)
    }
  }

  if (!authed) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#f3f7f8', fontFamily: 'Inter,-apple-system,sans-serif' }}>
        <div style={{ background: '#fff', border: '1px solid #e1e9ee', borderRadius: 12, padding: '36px 40px', width: 340, boxShadow: '0 2px 12px rgba(13,47,49,.08)' }}>
          <img src={LOGO_SRC} alt="hiryze" style={{ height: 24, marginBottom: 8, filter: 'brightness(0)' }} />
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: '#8fa8b2', marginBottom: 24 }}>Mission Control</div>
          <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <input
              type="password"
              placeholder="Passwort"
              value={password}
              onChange={e => { setPassword(e.target.value); setAuthError(false) }}
              style={{ padding: '10px 12px', border: `1px solid ${authError ? '#c0392b' : '#e1e9ee'}`, borderRadius: 7, fontSize: 13, outline: 'none', color: '#152d33' }}
              autoFocus
            />
            {authError && <div style={{ fontSize: 11, color: '#c0392b' }}>Falsches Passwort</div>}
            <button type="submit" style={{ padding: '10px', background: '#0d2f31', color: '#fff', borderRadius: 7, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
              Einloggen
            </button>
          </form>
        </div>
      </div>
    )
  }

  const navItems: Array<{ id: TabId; label: string; icon: React.ReactNode }> = [
    { id: 'overview', label: 'Übersicht', icon: <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><rect x="1" y="1" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.4"/><rect x="9" y="1" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.4"/><rect x="1" y="9" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.4"/><rect x="9" y="9" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.4"/></svg> },
    { id: 'marketing', label: 'Marketing', icon: <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><path d="M2 10l3-6 3 4 2-2 4 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg> },
    { id: 'links', label: 'Links', icon: <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><path d="M6 10a4 4 0 0 0 5.657 0l1.414-1.414a4 4 0 0 0-5.657-5.657L6 4.343" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/><path d="M10 6a4 4 0 0 0-5.657 0L2.929 7.414a4 4 0 0 0 5.657 5.657L10 11.657" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg> },
    { id: 'leads', label: 'CRM (Notion)', icon: <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="5" r="3" stroke="currentColor" strokeWidth="1.4"/><path d="M2 14c0-3.314 2.686-5 6-5s6 1.686 6 5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg> },
    { id: 'sales', label: 'Termine (Calendly)', icon: <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><rect x="2" y="3" width="12" height="11" rx="2" stroke="currentColor" strokeWidth="1.4"/><path d="M5 2v2M11 2v2M2 7h12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg> },
    { id: 'payments', label: 'Zahlungen (Stripe)', icon: <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><rect x="1" y="3" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.4"/><path d="M1 7h14" stroke="currentColor" strokeWidth="1.4"/><path d="M4 10.5h3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg> },
    { id: 'check', label: 'Checkliste', icon: <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><path d="M3 8l3 3 7-7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg> },
    { id: 'connections', label: 'Verbindungen', icon: <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><circle cx="4" cy="8" r="2" stroke="currentColor" strokeWidth="1.4"/><circle cx="12" cy="4" r="2" stroke="currentColor" strokeWidth="1.4"/><circle cx="12" cy="12" r="2" stroke="currentColor" strokeWidth="1.4"/><path d="M6 8h2m2-2.5L8 7m2 2.5L8 9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg> },
  ]

  const nextEvent = calendly?.upcoming?.[0]

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: 'Inter,-apple-system,sans-serif', fontSize: 13, color: 'var(--fg)', background: 'var(--bg)' }}>
      <style>{`
        :root{--brand:#0d2f31;--accent:#6184ab;--accent-hover:#4f6f9a;--accent-light:#eef2f7;--sidebar-w:230px;--sidebar-bg:#ffffff;--sidebar-border:#e4eaee;--sidebar-text:#5c7580;--sidebar-hover:#f4f8fa;--sidebar-active-bg:#eaf1f5;--sidebar-active-color:#0d2f31;--sidebar-active-border:#0d2f31;--topbar-h:60px;--topbar-bg:rgba(255,255,255,.88);--topbar-border:#e4eaee;--bg:#f3f7f8;--surface:#ffffff;--surface-raised:#f9fbfc;--border:#e1e9ee;--border-strong:#ccd8df;--fg:#152d33;--fg-muted:#5c7580;--fg-subtle:#8fa8b2;--success:#2d8a5e;--success-light:#edf7f2;--warning:#c97d20;--warning-light:#fdf5e8;--danger:#c0392b;--danger-light:#fdf0ee;color-scheme:light;}
        @media(prefers-color-scheme:dark){:root:not([data-theme="light"]){--sidebar-bg:#111b1d;--sidebar-border:#1e2e31;--sidebar-text:#6b8e97;--sidebar-hover:#17282b;--sidebar-active-bg:#1a3237;--sidebar-active-color:#8dc8d5;--sidebar-active-border:#3a8fa0;--topbar-bg:rgba(15,25,27,.9);--topbar-border:#1e2e31;--bg:#0d1a1c;--surface:#111f21;--surface-raised:#162426;--border:#1e2e31;--border-strong:#2a3e42;--fg:#d0e8ed;--fg-muted:#6b8e97;--fg-subtle:#3f6068;--success-light:rgba(45,138,94,.18);--warning-light:rgba(201,125,32,.18);--danger-light:rgba(192,57,43,.18);color-scheme:dark;}}
        :root[data-theme="dark"]{--sidebar-bg:#111b1d;--sidebar-border:#1e2e31;--sidebar-text:#6b8e97;--sidebar-hover:#17282b;--sidebar-active-bg:#1a3237;--sidebar-active-color:#8dc8d5;--sidebar-active-border:#3a8fa0;--topbar-bg:rgba(15,25,27,.9);--topbar-border:#1e2e31;--bg:#0d1a1c;--surface:#111f21;--surface-raised:#162426;--border:#1e2e31;--border-strong:#2a3e42;--fg:#d0e8ed;--fg-muted:#6b8e97;--fg-subtle:#3f6068;--success-light:rgba(45,138,94,.18);--warning-light:rgba(201,125,32,.18);--danger-light:rgba(192,57,43,.18);color-scheme:dark;}
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        html,body{height:100%;overflow:hidden}
        body{background:var(--bg);color:var(--fg)}
      `}</style>

      {/* SIDEBAR */}
      <aside style={{ width: 230, minWidth: 230, height: '100vh', background: 'var(--sidebar-bg)', borderRight: '1px solid var(--sidebar-border)', display: 'flex', flexDirection: 'column', overflowY: 'auto', flexShrink: 0 }}>
        {/* Brand */}
        <div style={{ padding: '18px 16px 14px', borderBottom: '1px solid var(--sidebar-border)', display: 'flex', flexDirection: 'column', gap: 4 }}>
          <img src={LOGO_SRC} alt="hiryze" style={{ height: 26, width: 'auto', maxWidth: 120, filter: 'brightness(0) saturate(0)', display: 'block' }} />
          <div style={{ fontSize: 9.5, fontWeight: 600, letterSpacing: '.12em', textTransform: 'uppercase' as const, color: 'var(--fg-subtle)', marginTop: 1 }}>Mission Control</div>
        </div>

        {/* Client pill */}
        <div style={{ margin: '12px 10px', padding: '9px 10px', borderRadius: 8, background: 'var(--surface-raised)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 9 }}>
          <div style={{ width: 30, height: 30, borderRadius: 7, background: 'var(--brand)', color: '#fff', display: 'grid', placeItems: 'center', fontSize: 14, fontWeight: 700, flexShrink: 0 }}>L</div>
          <div>
            <div style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--fg)', lineHeight: 1.3 }}>Lena</div>
            <small style={{ display: 'block', fontSize: 10, fontWeight: 400, color: 'var(--fg-muted)' }}>Hiryze Kundin</small>
          </div>
        </div>

        {/* Nav */}
        <div style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase' as const, color: 'var(--fg-subtle)', padding: '14px 10px 4px' }}>Navigation</div>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: 2, padding: '0 8px' }}>
          {navItems.map(item => (
            <div
              key={item.id}
              onClick={() => navigate(item.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', borderRadius: 7,
                borderLeft: `3px solid ${tab === item.id ? 'var(--sidebar-active-border)' : 'transparent'}`,
                color: tab === item.id ? 'var(--sidebar-active-color)' : 'var(--sidebar-text)',
                fontSize: 12.5, fontWeight: tab === item.id ? 600 : 500,
                background: tab === item.id ? 'var(--sidebar-active-bg)' : 'transparent',
                cursor: 'pointer', transition: 'background .12s,color .12s',
              }}
            >
              <span style={{ opacity: tab === item.id ? 1 : 0.75, flexShrink: 0 }}>{item.icon}</span>
              {item.label}
            </div>
          ))}
        </nav>

        <div style={{ flex: 1 }} />

        {/* Next event */}
        {nextEvent && (
          <div style={{ padding: '12px 14px', margin: 8, borderRadius: 8, border: '1px solid var(--border)', background: 'var(--surface-raised)' }}>
            <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase' as const, color: 'var(--fg-subtle)', marginBottom: 5 }}>Nächster Termin</div>
            <div style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--fg)' }}>{nextEvent.name}</div>
            <div style={{ fontSize: 10.5, color: 'var(--fg-muted)', marginTop: 2 }}>{fmtDate(nextEvent.startTime)}</div>
          </div>
        )}

        {/* GetGrowth footer */}
        <div style={{ padding: '12px 14px', borderTop: '1px solid var(--sidebar-border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, opacity: .55 }}>
            <div style={{ width: 20, height: 20, borderRadius: 4, background: 'var(--brand)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg width="12" height="12" viewBox="0 0 14 14" fill="none"><path d="M12 7a5 5 0 1 1-10 0 5 5 0 0 1 10 0Z" stroke="#fff" strokeWidth="1.4"/><path d="M9 7H7V5" stroke="#fff" strokeWidth="1.4" strokeLinecap="round"/><path d="M7 7l2 2" stroke="#fff" strokeWidth="1.4" strokeLinecap="round"/></svg>
            </div>
            <div>
              <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '.08em', color: 'var(--fg-subtle)', textTransform: 'uppercase' as const }}>GetGrowth</div>
              <div style={{ fontSize: 7.5, letterSpacing: '.05em', color: 'var(--fg-subtle)', textTransform: 'uppercase' as const, opacity: .7 }}>Smart · Sustainable · Business</div>
            </div>
          </div>
        </div>
      </aside>

      {/* MAIN */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, height: '100vh', overflow: 'hidden' }}>
        {/* Topbar */}
        <div style={{ height: 60, minHeight: 60, background: 'var(--topbar-bg)', backdropFilter: 'blur(12px)', borderBottom: '1px solid var(--topbar-border)', display: 'flex', alignItems: 'center', padding: '0 20px', gap: 12 }}>
          <span style={{ fontSize: 13, color: 'var(--fg-muted)' }}>HIGH-RISE <span style={{ color: 'var(--fg-subtle)', margin: '0 2px' }}>/</span> <strong style={{ color: 'var(--fg)', fontWeight: 600 }}>{navItems.find(n => n.id === tab)?.label}</strong></span>
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 10px', borderRadius: 20, fontSize: 11, fontWeight: 500, background: 'var(--success-light)', color: 'var(--success)', border: '1px solid rgba(45,138,94,.2)' }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'currentColor', display: 'inline-block', flexShrink: 0 }} />
              Notion + Calendly + Stripe verbunden
            </span>
            {/* Theme toggle */}
            <div style={{ display: 'flex', border: '1px solid var(--border)', borderRadius: 7, overflow: 'hidden' }}>
              {(['light', 'system', 'dark'] as const).map(t => (
                <button key={t} onClick={() => setTheme(t)} style={{ padding: '5px 8px', fontSize: 11, color: theme === t ? '#fff' : 'var(--fg-muted)', background: theme === t ? 'var(--brand)' : 'transparent', cursor: 'pointer', border: 'none' }}>
                  {t === 'light' ? '☀' : t === 'dark' ? '🌙' : '⚙'}
                </button>
              ))}
            </div>
            <button onClick={fetchAll} style={{ width: 30, height: 30, borderRadius: 7, background: 'var(--brand)', color: '#fff', display: 'grid', placeItems: 'center', fontSize: 12, fontWeight: 700, cursor: 'pointer', border: 'none' }}>↻</button>
          </div>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 24px 40px' }}>

            {/* OVERVIEW */}
            {tab === 'overview' && (
              <div>
                <div style={{ marginBottom: 20 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase' as const, color: 'var(--accent)', marginBottom: 4 }}>Dashboard</div>
                  <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-.3px' }}>Guten Morgen, Lena 👋</div>
                  <div style={{ fontSize: 12.5, color: 'var(--fg-muted)', marginTop: 3 }}>Hier ist der aktuelle Stand deines Businesses.</div>
                </div>

                {/* KPI Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(190px,1fr))', gap: 12, marginBottom: 20 }}>
                  <KpiCard label="Termine heute" value={calendly?.stats?.todayCount ?? 0} sub={calendly?.error ? 'API Fehler' : 'Calendly'} />
                  <KpiCard label="Termine diese Woche" value={calendly?.stats?.thisWeekCount ?? 0} sub="Calendly" />
                  <KpiCard label="Show-up-Rate (30 Tage)" value={calendly?.stats?.showUpRate != null ? `${calendly.stats.showUpRate}%` : '0%'} sub="letzte 30 Tage" />
                  <KpiCard label="Umsatz (Monat)" value={stripe?.revenueMonth != null ? fmt(stripe.revenueMonth, stripe.currency) : '€ 0'} sub={stripe?.error ? 'API Fehler' : 'Stripe'} />
                  <KpiCard label="MRR" value={stripe?.mrr != null ? fmt(stripe.mrr, stripe.currency) : '€ 0'} sub="monatlich wiederkehrend" />
                  <KpiCard label="Aktive Abos" value={stripe?.activeSubscriptions ?? 0} sub="Stripe Subscriptions" />
                  <KpiCard label="Leads gesamt" value={notion?.total ?? 0} sub={notion?.error ? 'API Fehler' : 'Notion CRM'} />
                  <KpiCard label="Neue Kunden (30 Tage)" value={stripe?.newCustomers30d ?? 0} sub="Stripe" />
                </div>

                {/* Calls & Mündliche Zusagen */}
                <div style={{ marginBottom: 20, background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: 12, padding: '16px 20px' }}>
                  <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase' as const, color: 'var(--accent)', marginBottom: 12 }}>Calls & Mündliche Zusagen</div>
                  <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' as const, alignItems: 'stretch' }}>
                    {/* Calls heute */}
                    <div style={{ flex: '1 1 140px', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 10, padding: '12px 16px', textAlign: 'center' as const }}>
                      <div style={{ fontSize: 32, fontWeight: 700, letterSpacing: '-.5px', color: 'var(--fg)' }}>{calendly?.stats?.todayCount ?? 0}</div>
                      <div style={{ fontSize: 11, color: 'var(--fg-muted)', marginTop: 2 }}>Calls heute</div>
                      <div style={{ fontSize: 10, color: 'var(--fg-subtle)', marginTop: 1 }}>Calendly · automatisch</div>
                    </div>
                    {/* Calls diese Woche */}
                    <div style={{ flex: '1 1 140px', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 10, padding: '12px 16px', textAlign: 'center' as const }}>
                      <div style={{ fontSize: 32, fontWeight: 700, letterSpacing: '-.5px', color: 'var(--fg)' }}>{calendly?.stats?.thisWeekCount ?? 0}</div>
                      <div style={{ fontSize: 11, color: 'var(--fg-muted)', marginTop: 2 }}>Calls diese Woche</div>
                      <div style={{ fontSize: 10, color: 'var(--fg-subtle)', marginTop: 1 }}>Calendly · automatisch</div>
                    </div>
                    {/* Mündliche Zusagen */}
                    <div style={{ flex: '1 1 180px', background: 'var(--bg)', border: '2px solid var(--brand)', borderRadius: 10, padding: '12px 16px', textAlign: 'center' as const }}>
                      <div style={{ fontSize: 32, fontWeight: 700, letterSpacing: '-.5px', color: 'var(--brand)' }}>{zusagen}</div>
                      <div style={{ fontSize: 11, color: 'var(--fg-muted)', marginTop: 2 }}>Mündliche Zusagen heute</div>
                      <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 10 }}>
                        <button onClick={() => { const v = Math.max(0, zusagen - 1); setZusagen(v); try { localStorage.setItem(todayKey(), String(v)) } catch {} }} style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--fg)', fontSize: 18, fontWeight: 700, cursor: 'pointer', display: 'grid', placeItems: 'center' }}>−</button>
                        <button onClick={() => { const v = zusagen + 1; setZusagen(v); try { localStorage.setItem(todayKey(), String(v)) } catch {} }} style={{ width: 32, height: 32, borderRadius: 8, border: 'none', background: 'var(--brand)', color: '#fff', fontSize: 18, fontWeight: 700, cursor: 'pointer', display: 'grid', placeItems: 'center' }}>+</button>
                      </div>
                      <div style={{ fontSize: 10, color: 'var(--fg-subtle)', marginTop: 6 }}>manuell · zurückgesetzt um Mitternacht</div>
                    </div>
                  </div>
                </div>

                {/* Two-col layout */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <Card title="Nächste Termine" action="Alle anzeigen" onAction={() => navigate('sales')}>
                    {!calendly && <Spinner />}
                    {calendly?.error && <Err msg={calendly.error} />}
                    {calendly?.upcoming && (
                      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead><tr><Th>Termin</Th><Th>Datum & Uhrzeit</Th></tr></thead>
                        <tbody>
                          {calendly.upcoming.slice(0, 5).map((e, i) => (
                            <tr key={i}><Td>{e.name}</Td><Td>{fmtDate(e.startTime)}</Td></tr>
                          ))}
                          {calendly.upcoming.length === 0 && <tr><td colSpan={2} style={{ padding: '12px', color: 'var(--fg-muted)', fontSize: 12 }}>Keine bevorstehenden Termine</td></tr>}
                        </tbody>
                      </table>
                    )}
                  </Card>

                  <Card title="Letzte Zahlungen" action="Alle anzeigen" onAction={() => navigate('payments')}>
                    {!stripe && <Spinner />}
                    {stripe?.error && <Err msg={stripe.error} />}
                    {stripe?.recentCharges && (
                      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead><tr><Th>Betrag</Th><Th>Datum</Th></tr></thead>
                        <tbody>
                          {stripe.recentCharges.map((c, i) => (
                            <tr key={i}><Td>{fmt(c.amount / 100, c.currency)}</Td><Td>{fmtDate(c.date)}</Td></tr>
                          ))}
                          {stripe.recentCharges.length === 0 && <tr><td colSpan={2} style={{ padding: '12px', color: 'var(--fg-muted)', fontSize: 12 }}>Keine Zahlungen</td></tr>}
                        </tbody>
                      </table>
                    )}
                  </Card>
                </div>
              </div>
            )}

            {/* SALES / CALENDLY */}
            {tab === 'sales' && (
              <div>
                <SectHead eyebrow="Calendly" title="Termine & Show-up-Rate" sub={calendly?.user ? `Verbunden als ${calendly.user.name} · ${calendly.user.timezone}` : 'Lade Daten…'} />
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(190px,1fr))', gap: 12, marginBottom: 20 }}>
                  <KpiCard label="Heute" value={calendly?.stats?.todayCount ?? 0} sub="Termine" />
                  <KpiCard label="Diese Woche" value={calendly?.stats?.thisWeekCount ?? 0} sub="Termine" />
                  <KpiCard label="Nächste 30 Tage" value={calendly?.stats?.upcomingTotal ?? 0} sub="geplant" />
                  <KpiCard label="Show-up-Rate" value={calendly?.stats?.showUpRate != null ? `${calendly.stats.showUpRate}%` : '0%'} sub="letzte 30 Tage" />
                </div>
                <Card title="Bevorstehende Termine">
                  {!calendly && <Spinner />}
                  {calendly?.error && <Err msg={calendly.error} />}
                  {calendly?.upcoming && (
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead><tr><Th>Termin</Th><Th>Datum</Th><Th>Uhrzeit</Th></tr></thead>
                      <tbody>
                        {calendly.upcoming.map((e, i) => {
                          const d = new Date(e.startTime)
                          return (
                            <tr key={i}>
                              <Td>{e.name}</Td>
                              <Td>{d.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })}</Td>
                              <Td>{d.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}</Td>
                            </tr>
                          )
                        })}
                        {calendly.upcoming.length === 0 && <tr><td colSpan={3} style={{ padding: '16px 12px', color: 'var(--fg-muted)', fontSize: 12 }}>Keine bevorstehenden Termine in den nächsten 30 Tagen</td></tr>}
                      </tbody>
                    </table>
                  )}
                </Card>
              </div>
            )}

            {/* PAYMENTS / STRIPE */}
            {tab === 'payments' && (
              <div>
                <SectHead eyebrow="Stripe" title="Zahlungen & Revenue" sub="Live-Daten aus deinem Stripe-Konto" />
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(190px,1fr))', gap: 12, marginBottom: 20 }}>
                  <KpiCard label="Umsatz (Monat)" value={stripe?.revenueMonth != null ? fmt(stripe.revenueMonth, stripe.currency) : '€ 0'} sub="aktueller Monat" />
                  <KpiCard label="Umsatz (30 Tage)" value={stripe?.revenue30d != null ? fmt(stripe.revenue30d, stripe.currency) : '€ 0'} sub="letzte 30 Tage" />
                  <KpiCard label="MRR" value={stripe?.mrr != null ? fmt(stripe.mrr, stripe.currency) : '€ 0'} sub="Monatlich wiederkehrend" />
                  <KpiCard label="Aktive Abos" value={stripe?.activeSubscriptions ?? 0} sub="Subscriptions" />
                  <KpiCard label="Neue Kunden" value={stripe?.newCustomers30d ?? 0} sub="letzte 30 Tage" />
                </div>
                <Card title="Letzte Zahlungen">
                  {!stripe && <Spinner />}
                  {stripe?.error && <Err msg={stripe.error} />}
                  {stripe?.recentCharges && (
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead><tr><Th>Betrag</Th><Th>Beschreibung</Th><Th>Datum</Th></tr></thead>
                      <tbody>
                        {stripe.recentCharges.map((c, i) => (
                          <tr key={i}>
                            <Td><strong>{fmt(c.amount / 100, c.currency)}</strong></Td>
                            <Td>{c.description ?? '—'}</Td>
                            <Td>{fmtDate(c.date)}</Td>
                          </tr>
                        ))}
                        {stripe.recentCharges.length === 0 && <tr><td colSpan={3} style={{ padding: '16px 12px', color: 'var(--fg-muted)', fontSize: 12 }}>Keine Zahlungen</td></tr>}
                      </tbody>
                    </table>
                  )}
                </Card>
              </div>
            )}

            {/* LEADS / NOTION */}
            {tab === 'leads' && (
              <div>
                <SectHead eyebrow="Notion CRM" title="Leads & Kontakte" sub="Datenbank aus deinem Notion-Workspace" />
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(190px,1fr))', gap: 12, marginBottom: 20 }}>
                  <KpiCard label="Leads gesamt" value={notion?.total ?? 0} sub="Notion CRM" />
                  {notion?.statusDistribution && Object.entries(notion.statusDistribution).slice(0, 4).map(([s, n]) => (
                    <KpiCard key={s} label={s} value={n} sub="Leads" />
                  ))}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <Card title="Status-Verteilung">
                    {!notion && <Spinner />}
                    {notion?.error && <Err msg={notion.error} />}
                    {notion?.statusDistribution && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: '8px 0' }}>
                        {Object.entries(notion.statusDistribution).map(([s, n]) => {
                          const pct = notion.total ? Math.round((n / notion.total) * 100) : 0
                          return (
                            <div key={s}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 3 }}>
                                <span style={{ fontWeight: 500 }}>{s}</span>
                                <span style={{ color: 'var(--fg-muted)' }}>{n} ({pct}%)</span>
                              </div>
                              <div style={{ height: 6, background: 'var(--surface-raised)', borderRadius: 3, overflow: 'hidden' }}>
                                <div style={{ height: '100%', width: `${pct}%`, background: 'linear-gradient(90deg,var(--brand),var(--accent))', borderRadius: 3 }} />
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </Card>

                  <Card title="Neueste Leads">
                    {!notion && <Spinner />}
                    {notion?.error && <Err msg={notion.error} />}
                    {notion?.recent && (
                      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead><tr><Th>Name</Th><Th>Status</Th></tr></thead>
                        <tbody>
                          {notion.recent.map((r, i) => (
                            <tr key={i}><Td>{r.name}</Td><Td><StatusBadge status={r.status} /></Td></tr>
                          ))}
                          {notion.recent.length === 0 && <tr><td colSpan={2} style={{ padding: '12px', color: 'var(--fg-muted)', fontSize: 12 }}>Keine Leads gefunden</td></tr>}
                        </tbody>
                      </table>
                    )}
                  </Card>
                </div>
              </div>
            )}

            {/* CHECK */}
            {tab === 'check' && (
              <div>
                <SectHead eyebrow="System" title="Integrations-Check" sub="Status aller verbundenen Dienste" />
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(240px,1fr))', gap: 12 }}>
                  <ConnCard
                    name="Notion CRM"
                    desc={notion?.error ? notion.error : notion ? `${notion.total} Leads geladen` : 'Laden…'}
                    ok={!notion?.error && notion != null}
                    loading={notion == null}
                  />
                  <ConnCard
                    name="Calendly"
                    desc={calendly?.error ? calendly.error : calendly ? `${calendly.stats?.upcomingTotal} Termine geladen` : 'Laden…'}
                    ok={!calendly?.error && calendly != null}
                    loading={calendly == null}
                  />
                  <ConnCard
                    name="Stripe"
                    desc={stripe?.error ? stripe.error : stripe ? `MRR: ${stripe.mrr != null ? fmt(stripe.mrr, stripe.currency) : '—'}` : 'Laden…'}
                    ok={!stripe?.error && stripe != null}
                    loading={stripe == null}
                  />
                </div>
              </div>
            )}

            {/* CONNECTIONS */}
            {tab === 'connections' && (
              <div>
                <SectHead eyebrow="Verbindungen" title="Integrierte Dienste" sub="Aktive API-Verbindungen für dieses Dashboard" />
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(240px,1fr))', gap: 12 }}>
                  <ConnCard name="Notion" desc="CRM — Leads & Kontakte" ok={!notion?.error && notion != null} loading={notion == null} />
                  <ConnCard name="Calendly" desc="Termine & Show-up-Rate" ok={!calendly?.error && calendly != null} loading={calendly == null} />
                  <ConnCard name="Stripe" desc="Zahlungen & Subscriptions" ok={!stripe?.error && stripe != null} loading={stripe == null} />
                </div>
                <div style={{ marginTop: 24, padding: '16px 18px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12, color: 'var(--fg-muted)' }}>
                  <strong style={{ color: 'var(--fg)' }}>API-Keys</strong> werden als Vercel Environment Variables gespeichert:<br />
                  <code style={{ display: 'block', marginTop: 8, color: 'var(--accent)', fontSize: 11 }}>CALENDLY_TOKEN · STRIPE_SECRET_KEY · NOTION_TOKEN · NOTION_DATABASE_ID</code>
                </div>
              </div>
            )}

            {/* MARKETING, LINKS — Platzhalter */}
            {(tab === 'marketing' || tab === 'links') && (
              <div>
                <SectHead eyebrow={tab === 'marketing' ? 'Marketing' : 'Links'} title={tab === 'marketing' ? 'Marketing-Übersicht' : 'Link-Tracking'} sub="Dieser Bereich wird bald befüllt." />
                <div style={{ padding: '40px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, textAlign: 'center', color: 'var(--fg-muted)', fontSize: 13 }}>
                  Demnächst verfügbar
                </div>
              </div>
            )}

          </div>
        </div>
      </main>
    </div>
  )
}

/* ─── Small components ─── */

function KpiCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div style={{ padding: '16px 18px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, boxShadow: '0 1px 2px rgba(13,47,49,.06)', display: 'flex', flexDirection: 'column', gap: 6 }}>
      <div style={{ fontSize: 11, fontWeight: 500, color: 'var(--fg-muted)' }}>{label}</div>
      <div style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-.5px', lineHeight: 1 }}>{value}</div>
      {sub && <div style={{ fontSize: 10, color: 'var(--fg-subtle)' }}>{sub}</div>}
    </div>
  )
}

function Card({ title, action, onAction, children }: { title: string; action?: string; onAction?: () => void; children: React.ReactNode }) {
  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, boxShadow: '0 1px 2px rgba(13,47,49,.06)' }}>
      <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontSize: 13, fontWeight: 600 }}>{title}</div>
        {action && <button onClick={onAction} style={{ fontSize: 11, color: 'var(--accent)', cursor: 'pointer', background: 'none', border: 'none' }}>{action}</button>}
      </div>
      <div style={{ padding: '16px 18px' }}>{children}</div>
    </div>
  )
}

function SectHead({ eyebrow, title, sub }: { eyebrow: string; title: string; sub?: string }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase' as const, color: 'var(--accent)', marginBottom: 4 }}>{eyebrow}</div>
      <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-.3px' }}>{title}</div>
      {sub && <div style={{ fontSize: 12.5, color: 'var(--fg-muted)', marginTop: 3 }}>{sub}</div>}
    </div>
  )
}

function Th({ children }: { children: React.ReactNode }) {
  return <th style={{ padding: '9px 12px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: 'var(--fg-muted)', background: 'var(--surface-raised)', borderBottom: '1px solid var(--border)' }}>{children}</th>
}
function Td({ children }: { children: React.ReactNode }) {
  return <td style={{ padding: '9px 12px', textAlign: 'left', fontSize: 12, borderBottom: '1px solid var(--border)' }}>{children}</td>
}
function Spinner() {
  return <div style={{ padding: '20px', textAlign: 'center', color: 'var(--fg-subtle)', fontSize: 12 }}>Lade Daten…</div>
}
function Err({ msg }: { msg: string }) {
  return <div style={{ padding: '12px', background: 'var(--danger-light)', color: 'var(--danger)', borderRadius: 6, fontSize: 12 }}>{msg}</div>
}
function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, { bg: string; color: string }> = {
    Won: { bg: 'var(--success-light)', color: 'var(--success)' },
    Lost: { bg: 'var(--danger-light)', color: 'var(--danger)' },
    'In Progress': { bg: 'var(--warning-light)', color: 'var(--warning)' },
  }
  const c = colors[status] ?? { bg: 'var(--accent-light)', color: 'var(--accent)' }
  return (
    <span style={{ padding: '2px 8px', borderRadius: 20, fontSize: 11, fontWeight: 500, background: c.bg, color: c.color, whiteSpace: 'nowrap' }}>
      {status}
    </span>
  )
}
function ConnCard({ name, desc, ok, loading }: { name: string; desc: string; ok: boolean; loading: boolean }) {
  return (
    <div style={{ padding: 16, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, display: 'flex', alignItems: 'flex-start', gap: 12 }}>
      <span style={{ width: 8, height: 8, borderRadius: '50%', background: loading ? 'var(--fg-subtle)' : ok ? 'var(--success)' : 'var(--danger)', marginTop: 4, flexShrink: 0 }} />
      <div>
        <div style={{ fontSize: 13, fontWeight: 600 }}>{name}</div>
        <div style={{ fontSize: 12, color: 'var(--fg-muted)', marginTop: 2 }}>{desc}</div>
      </div>
    </div>
  )
}
