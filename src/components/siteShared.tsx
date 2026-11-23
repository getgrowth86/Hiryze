"use client";

export function CtaButton({ loading, label }: { loading?: boolean; label: string }) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="relative overflow-hidden rounded-xl bg-forest px-5 py-4 text-[13.5px] font-semibold uppercase tracking-[0.08em] text-cream transition hover:bg-forest-light active:scale-[0.98] disabled:opacity-60"
    >
      <span className="pointer-events-none absolute inset-y-0 -left-1/3 w-1/2 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
      <span className="relative">{loading ? "Einen Moment …" : label}</span>
    </button>
  );
}

export function SiteFooter() {
  return (
    <footer className="bg-forest text-cream/50 text-[12px] text-center py-6 px-4">
      <div className="max-w-4xl mx-auto flex flex-wrap justify-center gap-x-6 gap-y-1">
        <span>© {new Date().getFullYear()} Hiryze</span>
        <a href="/impressum" className="hover:text-cream transition">Impressum</a>
        <a href="/datenschutz" className="hover:text-cream transition">Datenschutz</a>
      </div>
    </footer>
  );
}
