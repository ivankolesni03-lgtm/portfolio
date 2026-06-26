import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Impressum | Ivan Kolesnikov',
  description: 'Impressum von Ivan Kolesnikov.',
}

export default function ImpressumPage() {
  return (
    <main className="legal-page" style={{ minHeight: '100vh', background: '#ffffff', color: '#0a0a0a', padding: 'clamp(32px,8vw,96px)', fontFamily: 'var(--font-borna), sans-serif' }}>
      <a href="/" style={{ color: '#0a0a0a', fontSize: 12, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', textDecoration: 'none' }}>Zurueck</a>
      <div style={{ maxWidth: 780, marginTop: 'clamp(48px,8vw,96px)' }}>
        <h1 style={{ fontSize: 'clamp(44px,9vw,112px)', lineHeight: 0.88, letterSpacing: '-0.05em', textTransform: 'uppercase', margin: '0 0 clamp(32px,5vw,56px)' }}>Impressum</h1>

        <section style={{ display: 'grid', gap: 18, fontSize: 'clamp(15px,1.5vw,18px)', lineHeight: 1.65 }}>
          <p style={{ margin: 0 }}><strong>Angaben gemaess § 5 TMG</strong></p>
          <p style={{ margin: 0 }}>
            Ivan Kolesnikov<br />
            Anschrift bitte vor Veroeffentlichung ergaenzen
          </p>
          <p style={{ margin: 0 }}>
            E-Mail: <a href="mailto:ivan.kolesni03@gmail.com" style={{ color: '#0a0a0a' }}>ivan.kolesni03@gmail.com</a>
          </p>
          <p style={{ margin: 0 }}><strong>Verantwortlich fuer den Inhalt nach § 18 Abs. 2 MStV</strong><br />Ivan Kolesnikov</p>
          <p style={{ margin: 0, color: 'rgba(10,10,10,0.58)' }}>
            Hinweis: Diese Seite ist technisch vorbereitet. Bitte ergaenze vor dem Livegang die vollstaendige ladungsfaehige Anschrift und pruefe den Text rechtlich.
          </p>
        </section>
      </div>
    </main>
  )
}