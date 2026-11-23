import { SiteFooter } from "../page";

export default function DatenschutzPage() {
  return (
    <main className="min-h-screen bg-cream flex flex-col">
      <header className="bg-forest text-cream px-5 py-3 text-center">
        <span className="font-display text-[13px] font-light tracking-widest uppercase">Hiryze</span>
      </header>

      <section className="flex-1 px-4 py-16">
        <div className="mx-auto max-w-2xl text-forest">
          <h1 className="font-display text-3xl font-light text-forest mb-2">Datenschutzerklärung</h1>
          <p className="text-[13px] text-forest/50 mb-10">Stand: 08/2026</p>

          <Section title="1. Verantwortliche Stelle">
            <p>
              hiryze UG (haftungsbeschränkt)<br />
              Obere Seewiesen 40, 71711 Steinheim an der Murr<br />
              E-Mail: info@hiryze.de
            </p>
          </Section>

          <Section title="2. Hosting">
            <p>
              Diese Seite wird auf Vercel (Vercel Inc., USA) gehostet. Bei jedem Aufruf werden Server-Logs erfasst (IP-Adresse, Browsertyp, aufgerufene Seite, Zeitpunkt). Rechtsgrundlage: Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse an der sicheren Bereitstellung des Angebots).
            </p>
          </Section>

          <Section title="3. Lead-Erfassung (Webinar-Anmeldung)">
            <p>
              Wenn du dich zum Webinar anmeldest, werden Name und E-Mail-Adresse erfasst und über Make (Celonis SE) an eine Notion-Datenbank weitergeleitet. Rechtsgrundlage: Art. 6 Abs. 1 lit. b DSGVO (Vertragsanbahnung). Die Daten werden ausschließlich zur Kommunikation rund um das Webinar genutzt.
            </p>
          </Section>

          <Section title="4. Zahlungsabwicklung">
            <p>
              Käufe werden über Stripe (Stripe Payments Europe Ltd.) abgewickelt. Wir erhalten ausschließlich eine Bestätigung des Zahlungseingangs. Zahlungsdaten werden direkt von Stripe verarbeitet.
            </p>
          </Section>

          <Section title="5. Cookies">
            <p>
              Diese Seite setzt ausschließlich technisch notwendige Cookies. Marketing-Cookies (z. B. Meta Pixel) werden nur gesetzt, wenn du aktiv zugestimmt hast.
            </p>
          </Section>

          <Section title="6. Kontakt per E-Mail">
            <p>
              Nimmst du per E-Mail Kontakt auf, werden die übermittelten Daten zur Bearbeitung deiner Anfrage gespeichert. Rechtsgrundlage: Art. 6 Abs. 1 lit. b oder f DSGVO.
            </p>
          </Section>

          <Section title="7. Gesundheitsdaten">
            <p>
              Im Rahmen von 1:1-Sessions, Breathwork-Angeboten und dem hybriden Training können besondere Kategorien personenbezogener Daten (Gesundheitsdaten, Art. 9 DSGVO) erhoben werden. Dies geschieht ausschließlich auf Grundlage deiner ausdrücklichen Einwilligung, die du vor der Buchung erteilst.
            </p>
          </Section>

          <Section title="8. Deine Rechte">
            <p>
              Du hast das Recht auf Auskunft, Berichtigung, Löschung, Einschränkung der Verarbeitung, Datenübertragbarkeit und Widerspruch (Art. 15–21 DSGVO). Erteilte Einwilligungen kannst du jederzeit mit Wirkung für die Zukunft widerrufen. Beschwerden richten sich an die Landesbeauftragte für den Datenschutz und die Informationsfreiheit Baden-Württemberg.
            </p>
          </Section>

          <Section title="9. Drittanbieter (Auftragsverarbeiter)">
            <p>
              Vercel (Hosting), Make / Celonis (Automatisierung), Notion Labs (Datenbank), Stripe (Zahlung) — jeweils auf Basis von Auftragsverarbeitungsverträgen gemäß Art. 28 DSGVO.
            </p>
          </Section>

          <Section title="10. KI-Tools">
            <p>
              Für interne Zwecke (Marketing-Entwürfe, Administration) werden KI-Tools eingesetzt. Es werden dabei keine Gesundheitsdaten oder andere besonders schützenswerte Informationen eingegeben. Rechtsgrundlage: Art. 6 Abs. 1 lit. f DSGVO.
            </p>
          </Section>

          <Section title="11. Automatisierte Entscheidungsfindung">
            <p>
              Es findet keine automatisierte Entscheidungsfindung oder Profiling gemäß Art. 22 DSGVO statt.
            </p>
          </Section>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-8">
      <h2 className="font-display text-lg font-light text-forest mb-2">{title}</h2>
      <div className="text-[15px] leading-relaxed text-forest/80 space-y-2">{children}</div>
    </div>
  );
}
