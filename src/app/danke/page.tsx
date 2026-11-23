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
      {/* Header */}
      <header className="bg-forest text-cream px-5 py-3 text-center">
        <span className="font-display text-[13px] font-light tracking-widest uppercase">Hiryze</span>
      </header>

      {/* 1. Bestätigung ───────────────────────────────────────────────────── */}
      <section className="bg-forest text-cream px-4 pt-14 pb-16 text-center relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(97,132,171,0.18),transparent_60%)]"
        />
        <div className="relative mx-auto max-w-xl">
          {/* Check icon */}
          <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full border border-steel/50">
            <svg viewBox="0 0 24 24" className="h-7 w-7 stroke-steel" fill="none" strokeWidth={1.6}>
              <path d="M5 12.5l4.5 4.5L19 7.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>

          <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-steel mb-3">
            Du bist dabei
          </p>
          <h1 className="font-display text-[clamp(26px,6vw,46px)] font-light leading-[1.1] tracking-tight">
            {name ? `${name}, dein Platz` : "Dein Platz"} für{" "}
            <span className="text-steel">{WEBINAR_DATE}</span>,{" "}
            {WEBINAR_TIME} ist reserviert.
          </h1>
          <p className="mt-5 text-[15px] leading-relaxed text-cream/70 max-w-md mx-auto">
            Check dein Postfach – die Bestätigung ist unterwegs. Du bekommst
            außerdem eine WhatsApp-Erinnerung kurz vor dem Webinar.
          </p>

          {/* Action buttons */}
          <div className="mt-8 flex flex-col sm:flex-row justify-center gap-3">
            <a
              href={WHATSAPP_LINK}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#25D366] px-5 py-3.5 text-[13px] font-semibold uppercase tracking-[0.08em] text-white transition hover:brightness-110"
            >
              <WhatsappIcon />
              WhatsApp-Erinnerung aktivieren
            </a>
            <a
              href={icsHref}
              download="meet-yourself-in-safety.ics"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-cream/20 bg-cream/10 px-5 py-3.5 text-[13px] font-semibold uppercase tracking-[0.08em] text-cream transition hover:bg-cream/20"
            >
              <CalendarIcon />
              Im Kalender speichern
            </a>
          </div>
        </div>
      </section>

      {/* 2. Überleitung ──────────────────────────────────────────────────── */}
      <section className="bg-white px-4 py-12 text-center">
        <div className="mx-auto max-w-xl">
          <div className="mx-auto mb-8 h-px w-24 bg-gradient-to-r from-transparent via-sand to-transparent" />
          <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-steel mb-3">
            Schon jetzt anfangen
          </p>
          <h2 className="font-display text-[clamp(22px,4vw,34px)] font-light text-forest leading-snug">
            Bevor wir uns sehen:<br />
            <em className="italic">Zwei Wege, schon jetzt anzufangen.</em>
          </h2>
          <p className="mt-4 text-[15px] leading-relaxed text-forest/65 max-w-md mx-auto">
            Beides ist freiwillig. Dein Webinarplatz ist sicher, egal wie du
            dich entscheidest.
          </p>
        </div>
      </section>

      {/* 3+4. Produkte ───────────────────────────────────────────────────── */}
      <section className="bg-cream px-4 pb-16 pt-2">
        <div className="mx-auto max-w-4xl grid gap-6 sm:grid-cols-2 items-start">

          {/* Produkt 1 – Playbook */}
          <div className="rounded-2xl border border-sand bg-white p-7 flex flex-col h-full">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-forest/40 mb-1">
              Digitales Playbook
            </p>
            <h3 className="font-display text-[22px] font-light text-forest leading-snug">
              Breathwork-Playbook<br />
              <em className="italic text-steel">„Tägliche Atemroutinen"</em>
            </h3>
            <p className="mt-3 text-[14px] leading-relaxed text-forest/65 flex-1">
              Kurze Atemroutinen für deinen Alltag, damit Ruhe nicht nur im
              Kurs passiert, sondern jeden Tag.
            </p>

            <div className="mt-5 flex items-baseline gap-2">
              <span className="font-display text-[36px] font-light text-forest">17 €</span>
              <span className="text-[13px] text-forest/40">einmalig</span>
            </div>

            <ul className="mt-4 space-y-1.5 text-[13px] text-forest/60">
              {["Sofort nach Kauf als Download", "PDF, mobil optimiert", "Keine Vorkenntnisse nötig"].map((t) => (
                <li key={t} className="flex items-center gap-2">
                  <CheckMini /> {t}
                </li>
              ))}
            </ul>

            <a
              href={CHECKOUT_PLAYBOOK}
              target="_blank"
              rel="noreferrer"
              className="mt-7 block rounded-xl border border-forest text-center px-5 py-3.5 text-[13px] font-semibold uppercase tracking-[0.08em] text-forest transition hover:bg-forest hover:text-cream"
            >
              Playbook für 17 € holen
            </a>
          </div>

          {/* Produkt 2 – Live Session (empfohlen) */}
          <div className="relative rounded-2xl border-2 border-forest bg-forest text-cream p-7 flex flex-col h-full">
            {/* Badge */}
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
              <span className="rounded-full bg-steel px-4 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-white whitespace-nowrap">
                Empfehlung
              </span>
            </div>

            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-cream/40 mt-2 mb-1">
              Live online · 2 Stunden
            </p>
            <h3 className="font-display text-[22px] font-light text-cream leading-snug">
              Integrations-Session{" "}
              <em className="italic text-steel">live</em>
            </h3>
            <p className="mt-3 text-[14px] leading-relaxed text-cream/70 flex-1">
              2 Stunden live mit Lena, in denen du erlebst, wie sich Breathwork
              in deinem Körper anfühlt – bevor das Webinar startet.
            </p>

            <div className="mt-5 flex items-baseline gap-2">
              <span className="font-display text-[36px] font-light text-cream">64 €</span>
              <span className="text-[13px] text-cream/40">einmalig</span>
            </div>

            <ul className="mt-4 space-y-1.5 text-[13px] text-cream/60">
              {[
                `Termin: ${SESSION_DATUM}`,
                "Live mit Lena, online",
                "Kleine Gruppe, persönliche Atmosphäre",
                "Perfekte Vorbereitung fürs Webinar",
              ].map((t) => (
                <li key={t} className="flex items-center gap-2">
                  <CheckMiniLight /> {t}
                </li>
              ))}
            </ul>

            <a
              href={CHECKOUT_SESSION}
              target="_blank"
              rel="noreferrer"
              className="relative mt-7 overflow-hidden block rounded-xl bg-steel text-center px-5 py-3.5 text-[13px] font-semibold uppercase tracking-[0.08em] text-white transition hover:brightness-110"
            >
              <span className="pointer-events-none absolute inset-y-0 -left-1/3 w-1/2 bg-gradient-to-r from-transparent via-white/15 to-transparent animate-shimmer" />
              <span className="relative">Platz in der Live-Session sichern</span>
            </a>
          </div>

        </div>

        {/* Disclaimer */}
        <p className="mt-10 text-center text-[13px] text-forest/40 max-w-lg mx-auto leading-relaxed">
          Beides ist freiwillig. Dein Webinarplatz ist sicher, egal wie du
          dich entscheidest.
        </p>
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

function CheckMini() {
  return (
    <svg viewBox="0 0 16 16" className="h-4 w-4 shrink-0 text-steel" fill="none" stroke="currentColor" strokeWidth={2}>
      <path d="M3 8l3 3 7-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CheckMiniLight() {
  return (
    <svg viewBox="0 0 16 16" className="h-4 w-4 shrink-0 text-steel" fill="none" stroke="currentColor" strokeWidth={2}>
      <path d="M3 8l3 3 7-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
