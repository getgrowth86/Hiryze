"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { SiteFooter } from "@/components/siteShared";

const QUESTIONS: { q: string; options: string[] }[] = [
  {
    q: "Wie oft nimmst du dir im Alltag bewusst Zeit für deinen Atem?",
    options: [
      "Fast nie – ich merke kaum, wie ich atme",
      "Manchmal, wenn ich daran denke",
      "Ich habe schon eine kleine Routine",
      "Regelmäßig – Breathwork ist Teil meines Alltags",
    ],
  },
  {
    q: "Was passiert bei dir, wenn Druck entsteht?",
    options: [
      "Ich werde hektisch und verliere mich schnell",
      "Ich ziehe mich eher zurück und blockiere",
      "Ich funktioniere, aber innerlich ist viel los",
      "Ich bleibe meistens geerdet – aber es kostet Kraft",
    ],
  },
  {
    q: "Was erhoffst du dir vom Webinar?",
    options: [
      "Verstehen, was Breathwork eigentlich ist",
      "Konkrete Übungen, die ich selbst anwenden kann",
      "Spüren, ob das etwas für mich ist",
      "Tiefere Verbindung zu mir selbst",
    ],
  },
];

function QuizContent() {
  const router = useRouter();
  const params = useSearchParams();
  const name = params.get("name") ?? "";
  const email = params.get("email") ?? "";

  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [selected, setSelected] = useState<number | null>(null);

  const isLast = step === QUESTIONS.length - 1;
  const current = QUESTIONS[step];

  function next() {
    if (selected === null) return;
    const next = [...answers, selected];
    setAnswers(next);
    setSelected(null);

    if (isLast) {
      router.push(`/danke?name=${encodeURIComponent(name)}&email=${encodeURIComponent(email)}`);
    } else {
      setStep((s) => s + 1);
    }
  }

  return (
    <main className="min-h-screen bg-cream flex flex-col">
      {/* Header */}
      <header className="bg-forest text-cream px-5 py-3 text-center">
        <span className="font-display text-[13px] font-light tracking-widest uppercase">Hiryze</span>
      </header>

      <section className="flex-1 flex flex-col items-center justify-center px-4 py-16">
        {/* Progress */}
        <div className="w-full max-w-lg mb-8">
          <div className="flex justify-between text-[11px] text-forest/40 mb-2">
            <span>Frage {step + 1} von {QUESTIONS.length}</span>
            <span>{Math.round(((step + 1) / QUESTIONS.length) * 100)} %</span>
          </div>
          <div className="h-1 w-full bg-sand rounded-full overflow-hidden">
            <div
              className="h-full bg-steel rounded-full transition-all duration-500"
              style={{ width: `${((step + 1) / QUESTIONS.length) * 100}%` }}
            />
          </div>
        </div>

        <div className="w-full max-w-lg">
          <h2 className="font-display text-[clamp(20px,4vw,30px)] font-light text-forest leading-snug mb-6">
            {current.q}
          </h2>

          <div className="flex flex-col gap-3">
            {current.options.map((opt, i) => (
              <button
                key={i}
                onClick={() => setSelected(i)}
                className={`text-left rounded-xl border px-5 py-4 text-[14.5px] leading-snug transition ${
                  selected === i
                    ? "border-forest bg-forest text-cream"
                    : "border-sand bg-white text-forest hover:border-steel"
                }`}
              >
                {opt}
              </button>
            ))}
          </div>

          <button
            onClick={next}
            disabled={selected === null}
            className="mt-6 w-full rounded-xl bg-forest px-5 py-4 text-[13.5px] font-semibold uppercase tracking-[0.08em] text-cream transition hover:bg-forest-light disabled:opacity-30"
          >
            {isLast ? "Weiter zur Bestätigung →" : "Nächste Frage →"}
          </button>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}

export default function QuizPage() {
  return (
    <Suspense>
      <QuizContent />
    </Suspense>
  );
}
