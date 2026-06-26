import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Datenschutz | Ivan Kolesnikov',
  description: 'Datenschutzhinweise von Ivan Kolesnikov.',
}

export default function DatenschutzPage() {
  return (
    <main className="legal-page" style={{ minHeight: '100vh', background: '#ffffff', color: '#0a0a0a', padding: 'clamp(32px,8vw,96px)', fontFamily: 'var(--font-borna), sans-serif' }}>
      <a href="/" style={{ color: '#0a0a0a', fontSize: 12, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', textDecoration: 'none' }}>Zurueck</a>
      <div style={{ maxWidth: 860, marginTop: 'clamp(48px,8vw,96px)' }}>
        <h1 style={{ fontSize: 'clamp(40px,8vw,104px)', lineHeight: 0.88, letterSpacing: '-0.05em', textTransform: 'uppercase', margin: '0 0 clamp(32px,5vw,56px)' }}>Datenschutz</h1>

        <section style={{ display: 'grid', gap: 24, fontSize: 'clamp(15px,1.5vw,18px)', lineHeight: 1.7 }}>
          <p style={{ margin: 0 }}>
            Diese Datenschutzhinweise informieren darueber, welche personenbezogenen Daten beim Besuch dieser Portfolio-Website verarbeitet werden.
          </p>

          <div>
            <h2 style={{ fontSize: 'clamp(18px,2vw,24px)', margin: '0 0 8px', textTransform: 'uppercase' }}>Verantwortlicher</h2>
            <p style={{ margin: 0 }}>
              Ivan Kolesnikov<br />
              E-Mail: <a href="mailto:ivan.kolesni03@gmail.com" style={{ color: '#0a0a0a' }}>ivan.kolesni03@gmail.com</a><br />
              Anschrift bitte vor Veroeffentlichung ergaenzen
            </p>
          </div>

          <div>
            <h2 style={{ fontSize: 'clamp(18px,2vw,24px)', margin: '0 0 8px', textTransform: 'uppercase' }}>Hosting und Zugriffsdaten</h2>
            <p style={{ margin: 0 }}>
              Beim Aufruf der Website werden technisch notwendige Zugriffsdaten verarbeitet, zum Beispiel IP-Adresse, Zeitpunkt, aufgerufene Seite, Browserinformationen und Server-Logdaten. Die Verarbeitung erfolgt zur sicheren und stabilen Bereitstellung der Website.
            </p>
          </div>

          <div>
            <h2 style={{ fontSize: 'clamp(18px,2vw,24px)', margin: '0 0 8px', textTransform: 'uppercase' }}>Kontaktformular</h2>
            <p style={{ margin: 0 }}>
              Wenn du das Kontaktformular nutzt, werden die von dir eingegebenen Daten zur Bearbeitung deiner Anfrage verarbeitet. Dazu gehoeren Name, E-Mail-Adresse und Nachricht.
            </p>
          </div>

          <div>
            <h2 style={{ fontSize: 'clamp(18px,2vw,24px)', margin: '0 0 8px', textTransform: 'uppercase' }}>Analyse</h2>
            <p style={{ margin: 0 }}>
              Diese Website verwendet Vercel Analytics, um aggregierte Nutzungsdaten zur technischen und gestalterischen Verbesserung der Website zu erhalten.
            </p>
          </div>

          <div>
            <h2 style={{ fontSize: 'clamp(18px,2vw,24px)', margin: '0 0 8px', textTransform: 'uppercase' }}>Deine Rechte</h2>
            <p style={{ margin: 0 }}>
              Du hast im Rahmen der gesetzlichen Vorgaben Rechte auf Auskunft, Berichtigung, Loeschung, Einschraenkung der Verarbeitung und Widerspruch gegen die Verarbeitung deiner personenbezogenen Daten.
            </p>
          </div>

          <p style={{ margin: 0, color: 'rgba(10,10,10,0.58)' }}>
            Hinweis: Diese Seite ist technisch vorbereitet. Bitte ergaenze vor dem Livegang die vollstaendige Anbieteranschrift und lasse den Text rechtlich pruefen.
          </p>
        </section>
      </div>
    </main>
  )
}