"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CtaButton, SiteFooter } from "@/components/siteShared";

const MAKE_WEBHOOK_URL = process.env.NEXT_PUBLIC_MAKE_WEBHOOK_URL ?? "";

export default function OptinPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name || !email) return;
    setLoading(true);

    // Fire-and-forget → Make Webhook → CRM
    if (MAKE_WEBHOOK_URL) {
      fetch(MAKE_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email }),
      }).catch(() => {});
    }

    router.push(`/quiz?name=${encodeURIComponent(name)}&email=${encodeURIComponent(email)}`);
  }

  return (
    <main className="min-h-screen bg-cream flex flex-col">
      <StickyBar />

      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center px-4 pt-24 pb-16 text-center">
        <div className="animate-fade-up max-w-2xl mx-auto">
          <p className="text-sm font-medium tracking-[0.25em] uppercase text-steel mb-4">
            Kostenloses Webinar · Mi 09.12.2026 · 19 Uhr
          </p>

          <h1 className="font-display text-[clamp(32px,7vw,64px)] font-light leading-[1.08] tracking-tight text-forest">
            Meet yourself<br />
            <em className="italic text-steel">in Safety.</em>
          </h1>

          <p className="mt-6 text-[clamp(15px,2vw,18px)] leading-relaxed text-forest/75 max-w-lg mx-auto">
            Lerne, wie du dich selbst nicht mehr verlässt – wenn Stress kommt,
            wenn Druck entsteht, wenn du am meisten gebraucht wirst.
          </p>

          {/* Trust row */}
          <div className="mt-8 flex flex-wrap justify-center gap-6 text-[13px] text-forest/60">
            {["100 % kostenlos", "Online von zuhause", "Ca. 90 Minuten"].map((t) => (
              <span key={t} className="flex items-center gap-1.5">
                <svg viewBox="0 0 16 16" className="w-4 h-4 text-steel" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path d="M3 8l3.5 3.5L13 4.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                {t}
              </span>
            ))}
          </div>
        </div>

        {/* Form */}
        <form
          id="anmelden"
          onSubmit={handleSubmit}
          className="mt-10 w-full max-w-sm mx-auto flex flex-col gap-3 animate-fade-up"
          style={{ animationDelay: "0.15s" }}
        >
          <input
            type="text"
            required
            placeholder="Dein Vorname"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-xl border border-sand bg-white px-4 py-3.5 text-[15px] text-forest placeholder:text-forest/35 focus:outline-none focus:ring-2 focus:ring-steel/40"
          />
          <input
            type="email"
            required
            placeholder="Deine E-Mail-Adresse"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl border border-sand bg-white px-4 py-3.5 text-[15px] text-forest placeholder:text-forest/35 focus:outline-none focus:ring-2 focus:ring-steel/40"
          />
          <CtaButton loading={loading} label="Jetzt Platz sichern" />
          <p className="text-center text-[11px] text-forest/40 leading-snug">
            Kein Spam. Deine Daten bleiben bei uns.
          </p>
        </form>
      </section>

      {/* What to expect */}
      <WhatToExpect />

      <SiteFooter />
    </main>
  );
}

function StickyBar() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 bg-forest text-cream">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-2.5">
        <span className="font-display text-[13px] font-light tracking-widest uppercase">Hiryze</span>
        <a
          href="#anmelden"
          onClick={(e) => {
            e.preventDefault();
            document.getElementById("anmelden")?.scrollIntoView({ behavior: "smooth" });
          }}
          className="text-[11px] font-medium tracking-[0.18em] uppercase text-steel"
        >
          Jetzt anmelden →
        </a>
      </div>
    </header>
  );
}

function WhatToExpect() {
  const items = [
    {
      num: "01",
      title: "Breathwork & Körperarbeit",
      desc: "Du erlebst direkt, wie Atem dein Nervensystem reguliert – nicht als Theorie, sondern als gelebte Erfahrung.",
    },
    {
      num: "02",
      title: "Sicherheit im eigenen Körper",
      desc: "Du lernst, was passiert, wenn Stress kommt – und wie du dich selbst dabei hältst, statt wegzulaufen.",
    },
    {
      num: "03",
      title: "Ein Anfang, kein Versprechen",
      desc: "90 Minuten, in denen du spürst, was möglich ist. Ohne Druck, ohne Ergebnis-Garantien.",
    },
  ];

  return (
    <section className="bg-white py-16 px-4">
      <div className="mx-auto max-w-4xl">
        <p className="text-center text-[11px] font-semibold uppercase tracking-[0.25em] text-steel mb-3">
          Was dich erwartet
        </p>
        <h2 className="font-display text-center text-[clamp(24px,4vw,36px)] font-light text-forest mb-10">
          90 Minuten, die etwas verschieben können.
        </h2>
        <div className="grid gap-6 sm:grid-cols-3">
          {items.map((item) => (
            <div
              key={item.num}
              className="rounded-2xl border border-sand/60 bg-cream p-6"
            >
              <span className="font-display text-4xl font-light text-steel/40">{item.num}</span>
              <h3 className="font-display mt-3 text-lg font-light text-forest">{item.title}</h3>
              <p className="mt-2 text-[14px] leading-relaxed text-forest/70">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

