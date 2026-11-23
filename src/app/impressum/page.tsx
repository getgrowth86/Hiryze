import { SiteFooter } from "../page";

export default function ImpressumPage() {
  return (
    <main className="min-h-screen bg-cream flex flex-col">
      <header className="bg-forest text-cream px-5 py-3 text-center">
        <span className="font-display text-[13px] font-light tracking-widest uppercase">Hiryze</span>
      </header>

      <section className="flex-1 px-4 py-16">
        <div className="mx-auto max-w-2xl prose prose-sm text-forest">
          <h1 className="font-display text-3xl font-light text-forest mb-8">Impressum</h1>

          <p className="text-[13px] text-forest/50 mb-8">Angaben gemäß § 5 Digitale-Dienste-Gesetz (DDG)</p>

          <h2 className="font-display text-lg font-light text-forest mt-6 mb-2">Anbieter</h2>
          <p className="text-[15px] leading-relaxed text-forest/80">
            hiryze UG (haftungsbeschränkt)<br />
            Obere Seewiesen 40<br />
            71711 Steinheim an der Murr<br />
            Deutschland
          </p>

          <h2 className="font-display text-lg font-light text-forest mt-6 mb-2">Vertretungsberechtigte Person</h2>
          <p className="text-[15px] leading-relaxed text-forest/80">
            Lena Soukup (Geschäftsführerin)
          </p>

          <h2 className="font-display text-lg font-light text-forest mt-6 mb-2">Kontakt</h2>
          <p className="text-[15px] leading-relaxed text-forest/80">
            Telefon: 01786033284<br />
            E-Mail: info@hiryze.de
          </p>

          <h2 className="font-display text-lg font-light text-forest mt-6 mb-2">Handelsregister</h2>
          <p className="text-[15px] leading-relaxed text-forest/80">
            Amtsgericht Stuttgart<br />
            HRB 791576
          </p>

          <h2 className="font-display text-lg font-light text-forest mt-6 mb-2">Inhaltlich verantwortlich</h2>
          <p className="text-[15px] leading-relaxed text-forest/80">
            Lena Soukup<br />
            Obere Seewiesen 40<br />
            71711 Steinheim an der Murr
          </p>

          <h2 className="font-display text-lg font-light text-forest mt-6 mb-2">EU-Streitschlichtung</h2>
          <p className="text-[15px] leading-relaxed text-forest/80">
            Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit:{" "}
            <a href="https://ec.europa.eu/consumers/odr/" className="text-steel underline" target="_blank" rel="noopener noreferrer">
              https://ec.europa.eu/consumers/odr/
            </a>.
            Wir sind weder bereit noch verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.
          </p>

          <h2 className="font-display text-lg font-light text-forest mt-6 mb-2">Haftung für Inhalte</h2>
          <p className="text-[15px] leading-relaxed text-forest/80">
            Als Diensteanbieter sind wir gemäß § 7 Abs. 1 TMG für eigene Inhalte auf diesen Seiten nach den allgemeinen Gesetzen verantwortlich. Nach §§ 8 bis 10 TMG sind wir als Diensteanbieter jedoch nicht verpflichtet, übermittelte oder gespeicherte fremde Informationen zu überwachen oder nach Umständen zu forschen, die auf eine rechtswidrige Tätigkeit hinweisen.
          </p>

          <h2 className="font-display text-lg font-light text-forest mt-6 mb-2">Haftung für Links</h2>
          <p className="text-[15px] leading-relaxed text-forest/80">
            Unser Angebot enthält Links zu externen Websites Dritter, auf deren Inhalte wir keinen Einfluss haben. Für die Inhalte der verlinkten Seiten ist stets der jeweilige Anbieter oder Betreiber der Seiten verantwortlich.
          </p>

          <h2 className="font-display text-lg font-light text-forest mt-6 mb-2">Urheberrecht</h2>
          <p className="text-[15px] leading-relaxed text-forest/80">
            Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen dem deutschen Urheberrecht. Die Vervielfältigung, Bearbeitung, Verbreitung und jede Art der Verwertung außerhalb der Grenzen des Urheberrechtes bedürfen der schriftlichen Zustimmung des jeweiligen Autors bzw. Erstellers.
          </p>

          <p className="text-[13px] text-forest/40 mt-10">Stand: 08/2026</p>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
