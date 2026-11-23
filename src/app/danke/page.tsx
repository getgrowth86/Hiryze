"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { SiteFooter } from "../page";

// ── Platzhalter-Konstanten (hier zentral anpassen) ──────────────────────────
const WHATSAPP_LINK = process.env.NEXT_PUBLIC_WHATSAPP_LINK ?? "WHATSAPP_LINK";
const CHECKOUT_PLAYBOOK = process.env.NEXT_PUBLIC_CHECKOUT_PLAYBOOK ?? "CHECKOUT_PLAYBOOK";
const CHECKOUT_SESSION = process.env.NEXT_PUBLIC_CHECKOUT_SESSION ?? "CHECKOUT_SESSION";
const SESSION_DATUM = "SESSION_DATUM"; // z. B. "Di, 02.12.2026, 18 Uhr"

const WEBINAR_DATE = "Mittwoch, 09.12.2026";
const WEBINAR_TIME = "19 Uhr";

// ── Kalender-Download (.ics) ─────────────────────────────────────────────────
function buildIcs(): string {
  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Hiryze//Funnel//DE",
    "BEGIN:VEVENT",
    "UID:meet-yourself-in-safety-20261209@hiryze.de",
    "DTSTART:20261209T180000Z",
    "DTEND:20261209T193000Z",
    "SUMMARY:Meet yourself in Safety – Webinar mit Lena (Hiryze)",
    "DESCRIPTION:Dein kostenloser Webinarplatz. Einwahllink kommt per E-Mail.",
    "LOCATION:Online",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
  return "data:text/calendar;charset=utf-8," + encodeURIComponent(ics);
}

function DankeContent() {
  const params = useSearchParams();
  const name = params.get("name") ?? "";
  const icsHref = buildIcs();

  return (
    <main className="min-h-screen bg-cream flex flex-col">

      {/* ── Sticky Bestätigungs-Banner ─────────────────────────────────────── */}
      <div className="sticky top-0 z-50 bg-forest text-cream">
        <div className="mx-auto max-w-5xl flex items-center justify-between gap-3 px-5 py-3">
          <div className="flex items-center gap-2 text-[13px] font-semibold tracking-wide">
            <svg viewBox="0 0 20 20" className="h-5 w-5 shrink-0 fill-steel" aria-hidden>
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>DU BIST DABEI · <span className="text-steel">{WEBINAR_DATE}</span> · {WEBINAR_TIME}</span>
          </div>
          <span className="hidden sm:block text-[11px] text-cream/50 tracking-widest uppercase">Hiryze</span>
        </div>
      </div>

      {/* ── 1. Hero – Bestätigung & Aktionen ──────────────────────────────── */}
      <section className="bg-forest text-cream px-4 pt-16 pb-20 text-center relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(97,132,171,0.18),transparent_60%)]"
        />
        <div className="relative mx-auto max-w-2xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-steel mb-5">
            {name ? `Schön, ${name}. Dein Platz ist reserviert.` : "Dein Platz ist reserviert."}
          </p>
          <h1 className="font-display text-[clamp(28px,6.5vw,52px)] font-light leading-[1.08] tracking-tight">
            Bevor das Webinar startet –<br />
            <em className="italic text-steel">lass uns schon jetzt anfangen.</em>
          </h1>
          <p className="mt-6 text-[15px] leading-relaxed text-cream/70 max-w-lg mx-auto">
            Die Bestätigung ist unterwegs in dein Postfach. Hier sind zwei Dinge,
            die du schon heute tun kannst – bevor wir uns im Webinar sehen.
          </p>

          {/* Action buttons */}
          <div className="mt-10 flex flex-col sm:flex-row justify-center gap-3">
            <a
              href={WHATSAPP_LINK}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#25D366] px-6 py-4 text-[13px] font-semibold uppercase tracking-[0.1em] text-white transition hover:brightness-110"
            >
              <WhatsappIcon />
              WhatsApp-Erinnerung aktivieren
            </a>
            <a
              href={icsHref}
              download="meet-yourself-in-safety.ics"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-cream/20 bg-cream/10 px-6 py-4 text-[13px] font-semibold uppercase tracking-[0.1em] text-cream transition hover:bg-cream/20"
            >
              <CalendarIcon />
              Im Kalender speichern
            </a>
          </div>
        </div>
      </section>

      {/* ── 2. Überleitung ────────────────────────────────────────────────── */}
      <section className="bg-white px-4 py-14 text-center border-b border-sand/40">
        <div className="mx-auto max-w-2xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-steel mb-4">
            Optional · Nur für dich
          </p>
          <h2 className="font-display text-[clamp(22px,4vw,36px)] font-light text-forest leading-snug">
            Zwei Wege, schon jetzt anzufangen –<br />
            <em className="italic">bevor das Webinar beginnt.</em>
          </h2>
          <p className="mt-5 text-[15px] leading-relaxed text-forest/60 max-w-lg mx-auto">
            Dein Webinarplatz ist sicher, egal wie du dich entscheidest. Diese
            Angebote sind freiwillig und ergänzen das Webinar.
          </p>
        </div>
      </section>

      {/* ── 3. Produkt-Karten ─────────────────────────────────────────────── */}
      <section className="bg-cream px-4 py-16">
        <div className="mx-auto max-w-4xl grid gap-8 sm:grid-cols-2 items-stretch">

          {/* Produkt 1 – Playbook */}
          <div className="rounded-2xl border border-sand bg-white overflow-hidden flex flex-col">
            {/* Type badge */}
            <div className="bg-cream border-b border-sand px-6 py-3 flex items-center justify-between">
              <span className="inline-block rounded-full bg-forest/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-forest">
                Digitales Playbook
              </span>
              <span className="text-[13px] font-light text-forest/40">PDF</span>
            </div>

            {/* Visual placeholder */}
            <div className="bg-gradient-to-br from-cream-dark to-sand/40 h-40 flex items-center justify-center">
              <div className="rounded-xl bg-white shadow-sm border border-sand/60 w-24 h-32 flex flex-col items-center justify-center gap-2 opacity-80">
                <BookIcon />
                <span className="text-[9px] font-semibold uppercase tracking-widest text-forest/40">Playbook</span>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 flex flex-col flex-1">
              <h3 className="font-display text-[20px] font-light text-forest leading-snug">
                Breathwork-Playbook<br />
                <em className="italic text-steel text-[18px]">„Tägliche Atemroutinen"</em>
              </h3>
              <p className="mt-3 text-[14px] leading-relaxed text-forest/65 flex-1">
                Kurze Atemroutinen für deinen Alltag – damit Ruhe nicht nur im
                Webinar passiert, sondern jeden Tag. Konkret, direkt anwendbar.
              </p>

              <ul className="mt-5 space-y-2 text-[13px] text-forest/60">
                {[
                  "Sofort nach Kauf als PDF-Download",
                  "Mobil optimiert · keine Vorkenntnisse nötig",
                  "Passt zu jeder Tagesroutine",
                ].map((t) => (
                  <li key={t} className="flex items-start gap-2.5">
                    <CheckMini className="text-steel mt-0.5" />
                    {t}
                  </li>
                ))}
              </ul>

              <div className="mt-6 flex items-baseline gap-2">
                <span className="font-display text-[38px] font-light text-forest">17 €</span>
                <span className="text-[13px] text-forest/40">einmalig · inkl. MwSt.</span>
              </div>

              <a
                href={CHECKOUT_PLAYBOOK}
                target="_blank"
                rel="noreferrer"
                className="mt-5 block rounded-xl border border-forest text-center px-5 py-3.5 text-[13px] font-semibold uppercase tracking-[0.1em] text-forest transition hover:bg-forest hover:text-cream"
              >
                Playbook für 17 € holen
              </a>
            </div>
          </div>

          {/* Produkt 2 – Live Session (Empfehlung) */}
          <div className="rounded-2xl border-2 border-forest bg-forest text-cream overflow-hidden flex flex-col relative">
            {/* Empfehlung badge */}
            <div className="absolute -top-px left-1/2 -translate-x-1/2">
              <span className="inline-block rounded-b-full bg-steel px-5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.22em] text-white whitespace-nowrap">
                Empfehlung
              </span>
            </div>

            {/* Type badge */}
            <div className="bg-forest-light/40 border-b border-cream/10 px-6 py-3 mt-7 flex items-center justify-between">
              <span className="inline-block rounded-full bg-cream/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-cream/80">
                Live online · 2 Stunden
              </span>
              <span className="text-[13px] font-light text-cream/30">Zoom</span>
            </div>

            {/* Visual placeholder */}
            <div className="bg-forest-dark/40 h-40 flex items-center justify-center">
              <div className="rounded-full bg-steel/20 border border-steel/40 w-20 h-20 flex items-center justify-center">
                <LiveIcon />
              </div>
            </div>

            {/* Content */}
            <div className="p-6 flex flex-col flex-1">
              <h3 className="font-display text-[20px] font-light text-cream leading-snug">
                Integrations-Session<br />
                <em className="italic text-steel text-[18px]">live mit Lena</em>
              </h3>
              <p className="mt-3 text-[14px] leading-relaxed text-cream/70 flex-1">
                2 Stunden live mit Lena, in denen du erlebst, wie sich
                Breathwork in deinem Körper anfühlt – bevor das Webinar
                startet. Kleine Gruppe, persönliche Atmosphäre.
              </p>

              <ul className="mt-5 space-y-2 text-[13px] text-cream/60">
                {[
                  `Termin: ${SESSION_DATUM}`,
                  "Live mit Lena, online via Zoom",
                  "Kleine Gruppe · persönliche Begleitung",
                  "Perfekte Vorbereitung fürs Webinar",
                ].map((t) => (
                  <li key={t} className="flex items-start gap-2.5">
                    <CheckMini className="text-steel mt-0.5" />
                    {t}
                  </li>
                ))}
              </ul>

              <div className="mt-6 flex items-baseline gap-2">
                <span className="font-display text-[38px] font-light text-cream">64 €</span>
                <span className="text-[13px] text-cream/40">einmalig · inkl. MwSt.</span>
              </div>

              <a
                href={CHECKOUT_SESSION}
                target="_blank"
                rel="noreferrer"
                className="relative mt-5 overflow-hidden block rounded-xl bg-steel text-center px-5 py-3.5 text-[13px] font-semibold uppercase tracking-[0.1em] text-white transition hover:brightness-110"
              >
                <span className="pointer-events-none absolute inset-y-0 -left-1/3 w-1/2 bg-gradient-to-r from-transparent via-white/15 to-transparent animate-shimmer" />
                <span className="relative">Platz in der Live-Session sichern</span>
              </a>
            </div>
          </div>

        </div>

        {/* Disclaimer */}
        <p className="mt-10 text-center text-[12px] text-forest/35 max-w-md mx-auto leading-relaxed">
          Beides ist freiwillig. Dein kostenloser Webinarplatz ist sicher –
          egal wie du dich entscheidest.
        </p>
      </section>

      {/* ── 4. Wiederholungs-CTA ──────────────────────────────────────────── */}
      <section className="bg-white px-4 py-14 border-t border-sand/40 text-center">
        <div className="mx-auto max-w-xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-steel mb-3">
            Noch eine Sache
          </p>
          <h2 className="font-display text-[clamp(20px,3.5vw,30px)] font-light text-forest leading-snug mb-6">
            Vergiss nicht, dir den Termin zu sichern.
          </h2>
          <div className="flex flex-col sm:flex-row justify-center gap-3">
            <a
              href={WHATSAPP_LINK}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#25D366] px-5 py-3.5 text-[13px] font-semibold uppercase tracking-[0.1em] text-white transition hover:brightness-110"
            >
              <WhatsappIcon />
              WhatsApp-Erinnerung
            </a>
            <a
              href={icsHref}
              download="meet-yourself-in-safety.ics"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-sand bg-cream px-5 py-3.5 text-[13px] font-semibold uppercase tracking-[0.1em] text-forest transition hover:border-steel"
            >
              <CalendarIcon />
              Kalender-Eintrag
            </a>
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}

export default function DankePage() {
  return (
    <Suspense>
      <DankeContent />
    </Suspense>
  );
}

// ── Icons ─────────────────────────────────────────────────────────────────────
function WhatsappIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" aria-hidden>
      <path d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2 22l4.978-1.42A9.956 9.956 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm4.93 13.42c-.21.59-1.21 1.13-1.66 1.2-.43.07-.97.1-1.56-.1a14.3 14.3 0 01-1.42-.52c-2.5-1.08-4.13-3.6-4.25-3.77-.12-.16-1-1.33-1-2.54 0-1.2.63-1.8.86-2.04.22-.24.49-.3.65-.3l.47.01c.15 0 .36-.06.56.43l.73 1.9c.06.15.03.33-.07.47l-.38.5c-.1.13-.22.27-.1.52.13.24.57.95 1.22 1.54.84.75 1.55.98 1.76 1.09.22.1.35.08.47-.05l.56-.65c.14-.16.27-.12.45-.07l1.76.83c.21.1.35.14.4.22.05.07.05.44-.16 1.03z" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.6} aria-hidden>
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" strokeLinecap="round" />
    </svg>
  );
}

function CheckMini({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" className={`h-4 w-4 shrink-0 ${className}`} fill="none" stroke="currentColor" strokeWidth={2}>
      <path d="M3 8l3 3 7-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function BookIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-8 w-8 text-steel/60" fill="none" stroke="currentColor" strokeWidth={1.4} aria-hidden>
      <path d="M4 19.5A2.5 2.5 0 016.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
      <path d="M8 7h8M8 11h5" strokeLinecap="round" />
    </svg>
  );
}

function LiveIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-9 w-9 text-steel" fill="none" stroke="currentColor" strokeWidth={1.4} aria-hidden>
      <circle cx="12" cy="12" r="3" />
      <path d="M6.34 6.34a8 8 0 000 11.32M17.66 17.66a8 8 0 000-11.32M3.51 3.51a12 12 0 000 16.98M20.49 20.49a12 12 0 000-16.98" strokeLinecap="round" />
    </svg>
  );
}
