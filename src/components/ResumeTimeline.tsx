'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { useLanguage } from '@/contexts/LanguageContext'
import { useMobile } from '@/hooks/use-mobile'
import { useScroll } from '@/contexts/ScrollContext'
import { runScramble } from '@/hooks/use-scramble'
import { ViewCursor } from '@/components/ProjectsSection'

export type Lang = 'de' | 'en'
export type PortfolioAccess = 'default' | 'gme'

interface TimelineEntry {
  id: number
  period: { de: string; en: string }
  periodDetail: { de: string; en: string }
  title: { de: string; en: string }
  org: { de: string; en: string }
  description: { de: string; en: string }
  tags: { de: string[]; en: string[] }
  img: string
  /** When true, this entry is only reachable through the station overlay's
   *  arrow navigation (or entries list); it is intentionally excluded from
   *  the always-visible timeline track / vertical station list. */
  hiddenInTrack?: boolean
}

// Only shown once a neighbouring station's overlay is opened and navigated to
// via the arrows — deliberately not part of the visible timeline track.
const asbEntry: TimelineEntry = {
  id: 0,
  period: { de: '2022 - 2023', en: '2022 - 2023' },
  periodDetail: { de: '2022 - 2023', en: '2022 - 2023' },
  title: { de: 'Dolmetscher &\nKoordination', en: 'Interpreter &\nCoordination' },
  org: { de: 'ASB Barsinghausen', en: 'ASB Barsinghausen' },
  description: {
    de: 'Als Dolmetscher in einer Flüchtlings-Notunterkunft des ASB Barsinghausen unterstützte ich gemeinsam mit der Landesaufnahmebehörde Niedersachsen geflüchtete Menschen im Ankunfts- und Registrierungsprozess. Ich übersetzte in Gesprächen mit Behörden, Ärzten und Sozialarbeitern und koordinierte die Kommunikation zwischen Verwaltung und Bewohnern, um einen reibungslosen Ablauf in einer oft belastenden Ausnahmesituation zu gewährleisten.',
    en: 'As an interpreter at a refugee emergency shelter run by ASB Barsinghausen, I worked alongside the Lower Saxony State Reception Authority to support people seeking refuge through the arrival and registration process. I translated during conversations with authorities, doctors and social workers, and coordinated communication between administration and residents to keep things running smoothly in an often difficult situation.',
  },
  tags: { de: ['Dolmetschen', 'Koordination', 'Ehrenamt'], en: ['Interpreting', 'Coordination', 'Volunteering'] },
  img: '/icons/asb.jpg',
  hiddenInTrack: true,
}

const baseEntries: TimelineEntry[] = [
  { id:1, period:{de:'2023 - 2025',en:'2023 - 2025'}, periodDetail:{de:'2023 - 2025',en:'2023 - 2025'}, title:{de:'Ausbildung\nGTA',en:'Apprenticeship'}, org:{de:'Gestaltungstechnischer\nAssistent',en:'Design Technical Assistant'}, description:{de:'Zweijährige Ausbildung zum Gestaltungstechnischen Assistenten mit Schwerpunkt auf Layout, Bildbearbeitung und digitalen Gestaltungsgrundlagen. Neben klassischen Grafikdesign-Prinzipien wie Typografie, Farblehre und Bildkomposition lernte ich den professionellen Umgang mit der Adobe Creative Suite und setzte das erworbene Wissen in zahlreichen Print- und Digitalprojekten praktisch um.',en:'Two-year vocational training as a design technical assistant, focused on layout, image editing and digital design fundamentals. Alongside classic graphic design principles such as typography, color theory and composition, I learned to work professionally with the Adobe Creative Suite and applied this knowledge in numerous print and digital projects.'}, tags:{de:['Layout','Bildbearbeitung','Print'],en:['Layout','Image Editing','Print']}, img:'/icons/mmbbs.jpg' },
  { id:2, period:{de:'2023 - JETZT',en:'2023 - NOW'}, periodDetail:{de:'2023 - JETZT',en:'2023 - NOW'}, title:{de:'Studium IMC',en:'IMC Student'}, org:{de:'Hochschule Hannover',en:'Hannover University'}, description:{de:'Duales Bachelorstudium Integrated Media and Communications an der Hochschule Hannover, das Theorie und Praxis eng miteinander verzahnt. Mit Design-Thinking-Methoden entwickle ich multimediale Kommunikationskonzepte und bringe parallel Praxiserfahrung aus Unternehmen wie Continental und Graco Berlin sowie aus realen Agenturprojekten ein, unter anderem beim GWA Junior Agency Award. So verbindet das Studium fundierte Grundlagen aus Marketing, Strategie und visueller Kommunikation mit echten Projektarbeiten.',en:'Dual bachelor\'s program in Integrated Media & Communications at Hannover University, closely interlocking theory and practice. Using design thinking methods, I develop multimedia communication concepts while gaining parallel hands-on experience at companies like Continental and Graco Berlin as well as in real agency projects, including the GWA Junior Agency Award. This way, the program combines solid foundations in marketing, strategy and visuell communication with genuine project works.'}, tags:{de:['Marketing','Strategie','Kommunikation'],en:['Marketing','Strategy','Communication']}, img:'/icons/hsh.jpg' },
  { id:3, period:{de:'2024',en:'2024'}, periodDetail:{de:'2024',en:'2024'}, title:{de:'Graphic Design,\nOnline Marketing',en:'Graphic Design,\nOnline Marketing'}, org:{de:'Graco Berlin',en:'Graco Berlin'}, description:{de:'Praktikum im Bereich Grafikdesign und Online Marketing bei Graco Berlin mit Fokus auf Social-Media-Content und visuelle Kampagnen. Ich konzipierte und gestaltete Grafiken für verschiedene Kanäle, unterstützte bei der Content-Planung und sammelte praktische Erfahrung in der Umsetzung datengetriebener Kampagnen im agilen Agenturumfeld.',en:'Internship in graphic design and online marketing at Graco Berlin, focused on social media content and visual campaigns. I conceived and designed graphics for various channels, supported content planning, and gained hands-on experience implementing data-driven campaigns in a fast-paced agency environment.'}, tags:{de:['Social Media','Grafikdesign','Kampagne'],en:['Social Media','Graphic Design','Campaign']}, img:'/icons/graco.jpg' },
  { id:4, period:{de:'2024',en:'2024'}, periodDetail:{de:'2024',en:'2024'}, title:{de:'Brand\nCommunications',en:'Brand\nCommunications'}, org:{de:'Creative Culture',en:'Creative Culture'}, description:{de:'Mitarbeit an Markenkommunikation und Content-Produktion für verschiedene Kundenprojekte bei Creative Culture. Ich unterstützte die Entwicklung konsistenter Markenauftritte, produzierte Bild- und Videocontent und arbeitete eng mit dem Kreativteam zusammen, um Kampagnenideen von der Konzeption bis zur Umsetzung zu begleiten.',en:'Contributed to brand communications and content production for various client projects at Creative Culture. I supported the development of consistent brand identities, produced image and video content, and worked closely with the creative team to bring campaign ideas from concept through to execution.'}, tags:{de:['Branding','Content','Design'],en:['Branding','Content','Design']}, img:'/icons/cc.jpg' },
  { id:5, period:{de:'2025',en:'2025'}, periodDetail:{de:'2025',en:'2025'}, title:{de:'International\nMarketing and\nCommunications',en:'International\nMarketing and\nCommunications'}, org:{de:'Continental',en:'Continental'}, description:{de:'Unterstützung des internationalen Marketing- und Kommunikationsteams bei Continental in der Konzeption und Umsetzung von Kampagnen und Präsentationen. Ich arbeitete an globalen Kommunikationsprojekten mit, bereitete Management-Präsentationen auf und sammelte Erfahrung in der Abstimmung mit internationalen Stakeholdern in einem Konzernumfeld.',en:'Supported the international marketing and communications team at Continental in developing and executing campaigns and presentations. I contributed to global communication projects, prepared management presentations, and gained experience coordinating with international stakeholders within a corporate environment.'}, tags:{de:['Kampagne','Präsentation','International'],en:['Campaign','Presentation','International']}, img:'/icons/conti.jpg' },
  { id:6, period:{de:'2025',en:'2025'}, periodDetail:{de:'2025',en:'2025'}, title:{de:'Generative AI\nCommunications',en:'Generative AI\nCommunications'}, org:{de:'Creatom',en:'Creatom'}, description:{de:'Entwicklung von KI-gestützten Kommunikationslösungen und kreativen Workflows bei Creatom mit generativen Modellen. Ich konzipierte Prompt- und Content-Workflows, testete neue generative Tools für Bild- und Textproduktion und half dabei, KI-gestützte Prozesse in bestehende Kreativabläufe zu integrieren.',en:'Developed AI-driven communication solutions and creative workflows at Creatom using generative models. I designed prompt and content workflows, tested new generative tools for image and text production, and helped integrate AI-driven processes into existing creative pipelines.'}, tags:{de:['KI','Workflow','Kommunikation'],en:['AI','Workflow','Communication']}, img:'/icons/creatom.jpg' },
  { id:7, period:{de:'2026',en:'2026'}, periodDetail:{de:'2026',en:'2026'}, title:{de:'Freelancer',en:'Freelancer'}, org:{de:'Selbstständig',en:'Self-employed'}, description:{de:'Selbstständige Projekte in Design, Videobearbeitung und KI-gestützter Content-Produktion für unterschiedliche Kunden. Von der ersten Konzeptidee über Gestaltung und Schnitt bis zur finalen Content-Auslieferung verantwortete ich den gesamten kreativen Prozess eigenständig und passte Workflows flexibel an die jeweiligen Projektanforderungen an.',en:'Freelance projects spanning design, video editing and AI-driven content production for a variety of clients. From initial concept through design and editing to final content delivery, I independently managed the entire creative process and adapted workflows flexibly to each project\'s requirements.'}, tags:{de:['Design','Video','KI'],en:['Design','Video','AI']}, img:'/icons/freelancer.jpg' },
  { id:8, period:{de:'2026',en:'2026'}, periodDetail:{de:'2026',en:'2026'}, title:{de:'Generative\nIntelligence',en:'Generative\nIntelligence'}, org:{de:'BMW Group',en:'BMW Group'}, description:{de:'Arbeit an generativen KI-Lösungen und kreativen Workflows im Konzernumfeld der BMW Group. Ich unterstütze die Entwicklung und Erprobung generativer KI-Tools für die Kommunikations- und Kreativarbeit, arbeite mit interdisziplinären Teams zusammen und trage dazu bei, neue Technologien sinnvoll in bestehende Konzernprozesse zu integrieren.',en:'Working on generative AI solutions and creative workflows within the BMW Group corporate environment. I support the development and testing of generative AI tools for communications and creative work, collaborate with interdisciplinary teams, and help integrate new technologies meaningfully into existing corporate processes.'}, tags:{de:['Generative KI','Workflow','Konzern'],en:['Generative AI','Workflow','Corporate']}, img:'/icons/bmw.jpg' },
]

const gmeEntry: TimelineEntry = {
  id: 9,
  period: { de: '', en: '' },
  periodDetail: { de: '', en: '' },
  title: { de: 'COMMING\nSOON', en: 'COMMING\nSOON' },
  org: { de: '', en: '' },
  description: { de: '', en: '' },
  tags: { de: [], en: [] },
  img: '/icons/gamestop.jpg',
}

function getEntries(access: PortfolioAccess) {
  const list = [asbEntry, ...baseEntries]
  return access === 'gme' ? [...list, gmeEntry] : list
}

// ── Shared open/close/navigate state for the station detail overlay ────────
function useStationOverlay(total: number) {
  const [openIdx, setOpenIdx] = useState<number | null>(null)
  const [phase, setPhase] = useState<'in' | 'open' | 'closing'>('in')
  const [openRect, setOpenRect] = useState<{ x: number; y: number; w: number; h: number } | null>(null)

  const openStation = useCallback((idx: number, rect?: DOMRect) => {
    if (rect) setOpenRect({ x: rect.left, y: rect.top, w: rect.width, h: rect.height })
    setOpenIdx(idx)
    document.body.style.overflow = 'hidden'
    requestAnimationFrame(() => window.dispatchEvent(new Event('nav-mask-refresh')))
    requestAnimationFrame(() => requestAnimationFrame(() => setPhase('open')))
  }, [])

  const closeStation = useCallback(() => {
    if (phase === 'closing') return
    setPhase('closing')
    setTimeout(() => {
      setOpenIdx(null)
      setPhase('in')
      document.body.style.overflow = ''
      requestAnimationFrame(() => window.dispatchEvent(new Event('nav-mask-refresh')))
    }, 420)
  }, [phase])

  const navigate = useCallback((dir: 'l' | 'r') => {
    if (phase !== 'open') return
    setOpenIdx(prev => (prev === null ? prev : (dir === 'r' ? (prev + 1) % total : (prev - 1 + total) % total)))
  }, [phase, total])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeStation()
      if (e.key === 'ArrowRight') navigate('r')
      if (e.key === 'ArrowLeft') navigate('l')
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [closeStation, navigate])

  useEffect(() => {
    return () => { document.body.style.overflow = '' }
  }, [])

  useEffect(() => {
    const handler = () => {
      if (openIdx !== null) {
        setOpenIdx(null)
        setPhase('in')
        document.body.style.overflow = ''
      }
    }
    window.addEventListener('app-reset-home', handler)
    return () => window.removeEventListener('app-reset-home', handler)
  }, [openIdx])

  return { openIdx, phase, openRect, openStation, closeStation, navigate }
}

// ── Arrow nav for the (light) station overlay ───────────────────────────────
function StationArrow({ side, mob, onClick, label, visible }: {
  side: 'left' | 'right'; mob: boolean; onClick: () => void; label: string; visible: boolean
}) {
  const btnRef = useRef<HTMLButtonElement>(null)
  const svgRef = useRef<HTMLSpanElement>(null)
  const animRef = useRef<number>(0)
  const stateRef = useRef({ hovering: false, cx: 0, cy: 0, tx: 0, ty: 0, ax: 0, ay: 0, scale: 1, targetScale: 1 })

  useEffect(() => {
    const btn = btnRef.current
    const svg = svgRef.current
    if (!btn || !svg) return

    const MAGNET_RADIUS = 12
    const PULL = 0.85
    const LERP_HOVER = 0.35
    const LERP_LEAVE = 0.22
    const SCALE_HOVER = 1.5
    const SCALE_LERP = 0.25

    let mouseX = 0, mouseY = 0

    const onMove = (e: MouseEvent) => { mouseX = e.clientX; mouseY = e.clientY }
    window.addEventListener('mousemove', onMove)

    const onEnter = () => {
      const s = stateRef.current
      s.hovering = true
      s.targetScale = SCALE_HOVER
      const r = btn.getBoundingClientRect()
      s.cx = r.left + r.width / 2
      s.cy = r.top + r.height / 2
      document.body.classList.add('hide-x-cursor')
    }

    const onBtnMove = () => {
      const s = stateRef.current
      const r = btn.getBoundingClientRect()
      s.cx = r.left + r.width / 2
      s.cy = r.top + r.height / 2
      let dx = (mouseX - s.cx) * PULL
      let dy = (mouseY - s.cy) * PULL
      const dist = Math.hypot(dx, dy)
      if (dist > MAGNET_RADIUS) {
        dx = (dx / dist) * MAGNET_RADIUS
        dy = (dy / dist) * MAGNET_RADIUS
      }
      s.tx = dx; s.ty = dy
    }

    const onLeave = () => {
      const s = stateRef.current
      s.hovering = false
      s.targetScale = 1
      s.tx = 0; s.ty = 0
      document.body.classList.remove('hide-x-cursor')
    }

    btn.addEventListener('mouseenter', onEnter)
    btn.addEventListener('mousemove', onBtnMove)
    btn.addEventListener('mouseleave', onLeave)

    const animate = () => {
      const s = stateRef.current
      const lerp = s.hovering ? LERP_HOVER : LERP_LEAVE
      s.ax += (s.tx - s.ax) * lerp
      s.ay += (s.ty - s.ay) * lerp
      s.scale += (s.targetScale - s.scale) * SCALE_LERP
      svg.style.transform = `translate(${s.ax.toFixed(2)}px, ${s.ay.toFixed(2)}px) scale(${s.scale.toFixed(3)})`
      animRef.current = requestAnimationFrame(animate)
    }
    animRef.current = requestAnimationFrame(animate)

    return () => {
      window.removeEventListener('mousemove', onMove)
      btn.removeEventListener('mouseenter', onEnter)
      btn.removeEventListener('mousemove', onBtnMove)
      btn.removeEventListener('mouseleave', onLeave)
      cancelAnimationFrame(animRef.current)
    }
  }, [])

  return (
    <button
      ref={btnRef}
      aria-label={label}
      onPointerDown={(e) => e.stopPropagation()}
      onClick={(e) => { e.stopPropagation(); onClick() }}
      style={{
        position: 'fixed',
        top: '50%',
        [side]: mob ? 10 : 24,
        width: mob ? 58 : 86,
        height: mob ? 96 : 132,
        transform: 'translateY(-50%)',
        border: 'none',
        background: 'transparent',
        color: '#0a0a0a',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        pointerEvents: visible ? 'auto' : 'none',
        zIndex: 1000005,
        opacity: visible ? 1 : 0,
        transition: 'opacity 240ms ease',
      }}
    >
      <span ref={svgRef} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', willChange: 'transform' }}>
        <svg width={mob ? 34 : 52} height={mob ? 54 : 82} viewBox="0 0 42 42" fill="none">
          {side === 'left'
            ? <polyline points="29,7 13,21 29,35" stroke="currentColor" strokeWidth="7" strokeLinecap="square" strokeLinejoin="miter"/>
            : <polyline points="13,7 29,21 13,35" stroke="currentColor" strokeWidth="7" strokeLinecap="square" strokeLinejoin="miter"/>
          }
        </svg>
      </span>
    </button>
  )
}

// ── Fullscreen station detail overlay (desktop: same mechanics as Toolkit overlay, light theme) ──
function StationOverlay({ entry, phase, onClose, onNavigate, lang, originRect, isMobile }: {
  entry: TimelineEntry
  phase: 'in' | 'open' | 'closing'; onClose: () => void
  onNavigate: (dir: 'l' | 'r') => void; lang: Lang
  originRect: { x: number; y: number; w: number; h: number } | null
  isMobile: boolean
}) {
  const [titleDisp, setTitleDisp] = useState(entry.title[lang])
  const [descDisp, setDescDisp] = useState(entry.description[lang])
  const titleRef = useRef<(() => void) | null>(null)
  const descRef = useRef<(() => void) | null>(null)
  const isOpen = phase === 'open'
  const isOpening = phase === 'in'
  const isClosing = phase === 'closing'
  const { vw, vh } = useScroll()
  const variant = LIGHT_GRADIENT_VARIANTS[entry.id % LIGHT_GRADIENT_VARIANTS.length]
  // Shrink the title on mobile when it contains a very long single word, so it
  // always wraps to fit within the available width instead of overflowing
  // toward the edge (or the nav arrow).
  const longestTitleWord = Math.max(...entry.title[lang].split(/[\s\n]+/).map(w => w.length), 1)
  const mobileTitleFontSize = longestTitleWord >= 13
    ? 'clamp(30px, 6.4vw, 52px)'
    : longestTitleWord >= 10
      ? 'clamp(32px, 7.2vw, 60px)'
      : 'var(--mobile-overlay-title-size)'

  useEffect(() => {
    runScramble(entry.title[lang], setTitleDisp, titleRef)
    const t = setTimeout(() => runScramble(entry.description[lang], setDescDisp, descRef), 60)
    return () => {
      clearTimeout(t)
      titleRef.current?.()
      descRef.current?.()
    }
  }, [lang, entry])

  const originTransform = originRect
    ? `translate(${originRect.x + originRect.w / 2 - vw / 2}px, ${originRect.y + originRect.h / 2 - vh / 2}px) scale(${originRect.w / vw}, ${originRect.h / vh})`
    : 'scale(0.1)'

  return (
    <>
      <style>{`
        @keyframes stationContentIn { from { opacity: 0; transform: translateY(18px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes stationColorIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes stationBgDrift1 { 0% { transform: translate(0,0) scale(1) rotate(0deg); } 33% { transform: translate(10vw, 13vh) scale(1.32) rotate(14deg); } 66% { transform: translate(-8vw, 9vh) scale(0.8) rotate(-11deg); } 100% { transform: translate(0,0) scale(1) rotate(0deg); } }
        @keyframes stationBgDrift2 { 0% { transform: translate(0,0) scale(1) rotate(0deg); } 33% { transform: translate(-11vw, -9vh) scale(1.25) rotate(-16deg); } 66% { transform: translate(9vw, -13vh) scale(0.78) rotate(12deg); } 100% { transform: translate(0,0) scale(1) rotate(0deg); } }
        @keyframes stationBgDrift3 { 0% { transform: translate(0,0) scale(1) rotate(0deg); } 40% { transform: translate(-13vw, 11vh) scale(1.35) rotate(-15deg); } 70% { transform: translate(9vw, -8vh) scale(0.76) rotate(9deg); } 100% { transform: translate(0,0) scale(1) rotate(0deg); } }
        @keyframes stationBgDrift4 { 0% { transform: translate(0,0) scale(1) rotate(0deg); } 40% { transform: translate(13vw, 12vh) scale(0.75) rotate(16deg); } 70% { transform: translate(-9vw, -10vh) scale(1.3) rotate(-12deg); } 100% { transform: translate(0,0) scale(1) rotate(0deg); } }
      `}</style>
      {/* Bare, always-full-viewport click catcher. Kept free of children so clicks in any
          decorative (pointer-events:none) area of the visual layer above pass straight through
          to this element's onClick via CSS hit-testing, instead of relying on JS bubbling. */}
      <div
        onClick={onClose}
        data-textcolor="black"
        style={{
          position: 'fixed', inset: 0, zIndex: 1000000,
          cursor: isMobile ? 'pointer' : 'none',
        }}
      />
      <div style={{
        position: 'fixed', inset: 0, zIndex: 1000001,
        pointerEvents: 'none',
        backgroundColor: '#ffffff',
        transform: isMobile
          ? (isOpening ? originTransform : isClosing ? 'scale(0.94)' : 'scale(1)')
          : (isOpen ? 'scale(1)' : 'scale(0.94)'),
        opacity: isMobile ? (isClosing ? 0 : 1) : (isOpen ? 1 : 0),
        transition: isOpening
          ? (isMobile
            ? 'transform 640ms cubic-bezier(0.16,1,0.3,1), opacity 300ms ease'
            : 'transform 480ms cubic-bezier(0.16,1,0.3,1), opacity 420ms ease')
          : (isMobile
            ? 'transform 420ms cubic-bezier(0.16,1,0.3,1), opacity 0.32s ease'
            : 'transform 380ms cubic-bezier(0.16,1,0.3,1), opacity 0.32s ease'),
        transformOrigin: 'center center',
        overflow: 'hidden',
      }}>
        <>
          <div key={`bg-${entry.id}`} style={{
            position: 'absolute', inset: 0,
            background: variant.bg,
            animation: 'stationColorIn 0.45s ease both',
          }} />
          <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
            <div style={{
              position: 'absolute', width: variant.blob1.width, height: variant.blob1.height,
              left: variant.blob1.left, top: variant.blob1.top, right: variant.blob1.right, bottom: variant.blob1.bottom,
              background: `radial-gradient(circle, ${variant.blob1.color} 0%, transparent 70%)`,
              filter: 'blur(55px)',
              animation: `${variant.blob1.anim} ${variant.blob1.dur} ease-in-out infinite`,
            }} />
            <div style={{
              position: 'absolute', width: variant.blob2.width, height: variant.blob2.height,
              left: variant.blob2.left, top: variant.blob2.top, right: variant.blob2.right, bottom: variant.blob2.bottom,
              background: `radial-gradient(circle, ${variant.blob2.color} 0%, transparent 70%)`,
              filter: 'blur(65px)',
              animation: `${variant.blob2.anim} ${variant.blob2.dur} ease-in-out infinite`,
            }} />
          </div>
        </>

        {!isMobile && (
          <div key={`icon-${entry.id}`} style={{
            position: 'absolute',
            bottom: '22vh',
            right: '19vw',
            zIndex: 2,
            width: 'clamp(300px,24vw,440px)',
            height: 'clamp(300px,24vw,440px)',
            borderRadius: 12,
            overflow: 'hidden',
            opacity: isOpen ? 1 : 0,
            transform: isOpen ? 'scale(1)' : 'scale(0.85)',
            transition: 'opacity 0.5s ease, transform 0.5s cubic-bezier(0.16,1,0.3,1)',
            boxShadow: '0 24px 70px rgba(0,0,0,0.18)',
          }}>
            <img src={entry.img} alt="" style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }} />
          </div>
        )}

        <div onClick={isMobile ? onClose : undefined} style={{
          position: 'absolute',
          left: isMobile ? 'var(--mobile-overlay-side)' : '8vw',
          right: isMobile ? 'var(--mobile-overlay-side)' : '30vw',
          top: isMobile ? 'calc(56px + env(safe-area-inset-top))' : 'clamp(64px,11vw,130px)',
          bottom: isMobile ? 'var(--mobile-overlay-bottom)' : undefined,
          zIndex: 2,
          opacity: isOpen ? 1 : 0,
          transition: 'opacity 0.4s ease',
          animation: !isMobile && isOpen ? 'stationContentIn 0.55s cubic-bezier(0.16,1,0.3,1) both' : 'none',
          // Desktop: no pointer capture here, so any click over the text block
          // (including empty padding within its bounding box) always falls
          // through to the full-viewport close catcher below — closing must
          // never require a second click. Mobile: pointer capture stays (needed
          // for scroll), but a tap (no drag) now closes directly — mobile
          // browsers suppress the click event when the tap was actually a
          // scroll drag, so scrolling still works normally.
          pointerEvents: isMobile ? 'auto' : 'none',
          overflowY: isMobile ? 'auto' : undefined,
          WebkitOverflowScrolling: isMobile ? 'touch' : undefined,
        }}>
          {isMobile && (
            <div style={{ width:72, height:72, borderRadius:12, overflow:'hidden', marginBottom:'0.9em', boxShadow:'0 6px 18px rgba(0,0,0,0.12)' }}>
              <img src={entry.img} alt="" style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }} />
            </div>
          )}
          <h2 style={{ fontSize: isMobile?mobileTitleFontSize:'clamp(36px,5.2vw,84px)', fontWeight:900, lineHeight:0.95, letterSpacing:'-1.5px', textTransform:'uppercase', color:'#0a0a0a', margin:0, whiteSpace:'pre-line', overflowWrap:'break-word', wordBreak:'break-word' }}>
            {titleDisp}
          </h2>
          {entry.org[lang] && (
            <div style={{ display:'block', marginTop: isMobile?'0.4em':'0.35em', marginBottom:0, fontSize: isMobile?'var(--mobile-overlay-subtitle-size)':'clamp(16px,1.8vw,28px)', fontWeight:700, fontStyle:'italic', letterSpacing:'-0.3px', lineHeight:1, color:'#333', whiteSpace:'pre-line', overflowWrap:'break-word', wordBreak:'break-word' }}>
              {entry.org[lang]}
            </div>
          )}
          {entry.periodDetail[lang] && (
            <div style={{ display:'block', marginTop: 0, fontSize: isMobile?'var(--mobile-overlay-subtitle-size)':'clamp(16px,1.8vw,28px)', fontWeight:700, fontStyle:'italic', letterSpacing:'-0.3px', lineHeight:1, color:'#333', whiteSpace:'pre-line', overflowWrap:'break-word', wordBreak:'break-word' }}>
              {entry.periodDetail[lang]}
            </div>
          )}
          {entry.description[lang] && (
            <p style={{ marginTop: isMobile?'1em':'0.9em', fontSize: isMobile?'var(--mobile-overlay-copy-size)':'clamp(14px,1.05vw,17px)', fontWeight:400, lineHeight:1.6, color:'#555', maxWidth: isMobile?'100%':'44vw' }}>
              {descDisp}
            </p>
          )}
          {entry.tags[lang].length > 0 && (
            <div style={{ marginTop: isMobile?'1.1em':'1em', marginBottom: isMobile?'1.4em':0, display:'flex', flexWrap:'wrap', gap:8 }}>
              {entry.tags[lang].map((t, i) => (
                <span key={i} style={{ backgroundColor:'transparent', color:'#0a0a0a', border:'1.5px solid #0a0a0a', fontSize: isMobile?'var(--mobile-overlay-tag-size)':11, fontWeight:700, letterSpacing:'0.08em', textTransform:'uppercase', padding:'6px 12px', borderRadius:999 }}>{t}</span>
              ))}
            </div>
          )}
        </div>
      </div>
      <StationArrow side="left" mob={isMobile} onClick={() => onNavigate('l')} label={lang==='de' ? 'Vorherige Station' : 'Previous station'} visible={isOpen} />
      <StationArrow side="right" mob={isMobile} onClick={() => onNavigate('r')} label={lang==='de' ? 'Nächste Station' : 'Next station'} visible={isOpen} />
      {!isMobile && <ViewCursor show={isOpen} mode="close" color="#0a0a0a" />}
    </>
  )
}

// ── Overlay background gradient variants for the desktop path overlay (colorful blobs, white base) ──
const LIGHT_GRADIENT_VARIANTS = [
  {
    bg: 'radial-gradient(circle at 12% 8%, #4f8dfd30 0%, transparent 42%), radial-gradient(circle at 88% 92%, #4f8dfd20 0%, transparent 50%), linear-gradient(150deg, #ffffff 0%, #fafbff 32%, #ffffff 100%)',
    blob1: { width: '62vw', height: '62vw', left: '-14%', top: '-18%', anim: 'stationBgDrift1', dur: '17s', color: '#4f8dfd55' },
    blob2: { width: '50vw', height: '50vw', right: '-10%', bottom: '-16%', anim: 'stationBgDrift2', dur: '23s', color: '#4f8dfd38' },
  },
  {
    bg: 'radial-gradient(circle at 90% 10%, #ef5da830 0%, transparent 45%), radial-gradient(circle at 8% 85%, #ef5da820 0%, transparent 52%), linear-gradient(60deg, #ffffff 0%, #fff8fb 30%, #ffffff 100%)',
    blob1: { width: '55vw', height: '55vw', right: '-16%', top: '-14%', anim: 'stationBgDrift3', dur: '20s', color: '#ef5da850' },
    blob2: { width: '46vw', height: '46vw', left: '-10%', bottom: '-18%', anim: 'stationBgDrift4', dur: '25s', color: '#ef5da835' },
  },
  {
    bg: 'radial-gradient(circle at 50% 12%, #2ec4b630 0%, transparent 48%), radial-gradient(circle at 20% 92%, #2ec4b620 0%, transparent 55%), linear-gradient(205deg, #ffffff 0%, #f5fffd 35%, #ffffff 100%)',
    blob1: { width: '58vw', height: '58vw', left: '20%', top: '-22%', anim: 'stationBgDrift1', dur: '22s', color: '#2ec4b64a' },
    blob2: { width: '50vw', height: '50vw', right: '4%', bottom: '-22%', anim: 'stationBgDrift4', dur: '16s', color: '#2ec4b632' },
  },
  {
    bg: 'radial-gradient(circle at 15% 92%, #f4a72e30 0%, transparent 46%), radial-gradient(circle at 85% 12%, #f4a72e20 0%, transparent 50%), linear-gradient(115deg, #ffffff 0%, #fffaf2 30%, #ffffff 100%)',
    blob1: { width: '64vw', height: '64vw', left: '-18%', bottom: '-16%', anim: 'stationBgDrift3', dur: '19s', color: '#f4a72e50' },
    blob2: { width: '44vw', height: '44vw', right: '-8%', top: '-10%', anim: 'stationBgDrift2', dur: '26s', color: '#f4a72e35' },
  },
]

// proximity: 0 = far, 1 = centered
function Station({ entry, proximity, lang, onOpen }: { entry: TimelineEntry; proximity: number; lang: Lang; onOpen: () => void }) {
  const [titleD, setTitleD] = useState(entry.title[lang])
  const [periodD, setPeriodD] = useState(entry.period[lang])
  const [orgD, setOrgD] = useState(entry.org[lang])
  const titleRef = useRef<(() => void) | null>(null)
  const periodRef = useRef<(() => void) | null>(null)
  const orgRef = useRef<(() => void) | null>(null)
  const imgWrapRef = useRef<HTMLDivElement>(null)
  const prevProx = useRef(0)
  const prevLang = useRef(lang)
  const isActive = proximity > 0.85

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      titleRef.current?.()
      periodRef.current?.()
      orgRef.current?.()
    }
  }, [])

  // Scramble on becoming active
  useEffect(() => {
    if (isActive && prevProx.current <= 0.85) runScramble(entry.title[lang], setTitleD, titleRef)
    else if (!isActive) {
      const frame = requestAnimationFrame(() => setTitleD(entry.title[lang]))
      prevProx.current = proximity
      return () => cancelAnimationFrame(frame)
    }
    prevProx.current = proximity
  }, [isActive, entry, lang, proximity])

  // Scramble all text on language change
  useEffect(() => {
    if (prevLang.current !== lang) {
      runScramble(entry.period[lang], setPeriodD, periodRef)
      runScramble(entry.title[lang], setTitleD, titleRef)
      if (entry.org[lang]) runScramble(entry.org[lang], setOrgD, orgRef)
    }
    prevLang.current = lang
  }, [lang, entry])

  // Image grows from 120px to 320px based on proximity
  const imgSize = 120 + proximity * 200
  // Container width grows with proximity
  const containerWidth = 220 + proximity * 80
  // Text scale factor - smaller when inactive, full size when active
  const textScale = 0.7 + proximity * 0.3
  const [hovering, setHovering] = useState(false)
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])
  return (
    <>
    <button
      type="button"
      onClick={onOpen}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      style={{
        flexShrink: 0,
        width: containerWidth,
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        userSelect: 'none',
        border: 'none',
        background: 'none',
        padding: 0,
        margin: 0,
        font: 'inherit',
        color: 'inherit',
        cursor: hovering ? 'none' : 'pointer',
      }}>
      {/* Image – centered on the line, grows up and down */}
      <div ref={imgWrapRef} style={{
        width: imgSize,
        height: imgSize,
        overflow: 'hidden',
        flexShrink: 0,
        borderRadius: 12,
        boxShadow: `0 10px 34px rgba(0,0,0,0.10), 0 2px 10px rgba(0,0,0,0.06)${proximity > 0.7 ? `, 0 18px 58px rgba(0,0,0,${0.10 * ((proximity - 0.7) / 0.3)})` : ''}`,
        transform: hovering ? 'scale(1.06)' : 'scale(1)',
        transition: 'box-shadow 0.3s ease, transform 0.3s cubic-bezier(0.16,1,0.3,1)',
      }}>
        <img src={entry.img} alt="" style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }} />
      </div>

      {/* Text positioned below the image */}
      <div style={{
        position: 'absolute',
        top: '100%',
        left: '50%',
        transform: `translateX(-50%) scale(${textScale})`,
        transformOrigin: 'top center',
        textAlign: 'center',
        paddingTop: 24,
        width: 260,
        opacity: 0.3 + proximity * 0.7,
        transition: 'opacity 0.15s ease',
      }}>
        {entry.period[lang] && (
          <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', color: '#888', marginBottom: 6, fontFamily: 'monospace' }}>
            {periodD}
          </div>
        )}
        <h3 style={{
          margin: '0 0 5px', fontSize: 'clamp(13px,2.4vw,26px)', fontWeight: 900,
          textTransform: 'uppercase', letterSpacing: '-0.5px',
          color: '#0a0a0a', lineHeight: 1.1, whiteSpace: 'pre-line',
        }}>
          {isActive ? titleD : entry.title[lang]}
        </h3>
        {entry.org[lang] && (
          <div style={{ fontSize: 11, fontWeight: 500, color: '#888', letterSpacing: '0.02em' }}>
            {orgD}
          </div>
        )}
      </div>
    </button>
    {mounted && createPortal(<ViewCursor show={hovering} />, document.body)}
    </>
  )
}

// ─── Mobile Timeline (Vertical Desktop Language) ────────────────────────────
function MobileVerticalStation({
  entry,
  lang,
  proximity,
  y,
  onDrag,
  onDragEnd,
  onOpen,
}: {
  entry: TimelineEntry
  lang: Lang
  proximity: number
  y: number
  onDrag?: (dy: number) => void
  onDragEnd?: () => void
  onOpen?: (rect: DOMRect) => void
}) {
  const isActive = proximity > 0.84
  const dragStartRef = useRef<{ x: number; y: number } | null>(null)
  const maxMoveRef = useRef(0)
  const imgWrapRef = useRef<HTMLDivElement>(null)

  const easedProximity = proximity * proximity * (3 - 2 * proximity)
  const imageSize = 58 + easedProximity * 82
  const textScale = 0.78 + easedProximity * 0.22
  const title = entry.title[lang]
  const period = entry.period[lang]
  const org = entry.org[lang]
  const maxImageSize = 140
  const textInset = maxImageSize / 2 + 16
  const periodFontSize = 'clamp(10px, min(2.7vw, 1.55svh), 12px)'
  const longestTitleWord = Math.max(...title.split(/\s+/).map((word) => word.length), 1)
  const titleFontSize = longestTitleWord >= 14
    ? 'clamp(12px, min(3.45vw, 1.95svh), 14px)'
    : 'clamp(14px, min(3.9vw, 2.25svh), 16px)'
  const orgFontSize = 'clamp(11px, min(3.15vw, 1.85svh), 13px)'

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    dragStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }
    maxMoveRef.current = 0
  }, [])

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!dragStartRef.current) return
    const dx = e.touches[0].clientX - dragStartRef.current.x
    const dy = e.touches[0].clientY - dragStartRef.current.y
    maxMoveRef.current = Math.max(maxMoveRef.current, Math.hypot(dx, dy))
    if (!onDrag) return
    e.preventDefault()
    onDrag(dy)
  }, [onDrag])

  const handleTouchEnd = useCallback(() => {
    const wasTap = maxMoveRef.current < 8
    dragStartRef.current = null
    if (wasTap && onOpen) {
      const r = imgWrapRef.current?.getBoundingClientRect()
      if (r) onOpen(r)
    } else {
      onDragEnd?.()
    }
  }, [onDragEnd, onOpen])

  return (
    <article 
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
      style={{
        position: 'absolute',
        top: y,
        left: 'calc(var(--mobile-section-x) + 80px)',
        right: 'var(--mobile-section-x)',
        minHeight: imageSize,
        display: 'flex',
        alignItems: 'center',
        transform: `translateY(-50%)`,
        opacity: 1,
        pointerEvents: 'auto',
        willChange: 'transform',
        zIndex: isActive ? 4 : 2,
        touchAction: 'none',
      }}>
      <div ref={imgWrapRef} style={{
        position: 'absolute',
        left: 0,
        top: '50%',
        width: imageSize,
        height: imageSize,
        transform: 'translate(-50%, -50%)',
        overflow: 'hidden',
        background: '#fff',
        borderRadius: 12,
        boxShadow: `0 8px 24px rgba(0,0,0,${0.07 + easedProximity * 0.14}), 0 1px 4px rgba(0,0,0,0.08)`,
        cursor: 'grab',
      }}>
        <img src={entry.img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', userSelect: 'none' }} />
      </div>

      <div style={{
        marginLeft: textInset,
        width: `calc(100% - ${textInset}px)`,
        minWidth: 0,
        overflow: 'hidden',
        transform: `scale(${textScale})`,
        transformOrigin: 'left center',
        boxSizing: 'border-box',
      }}>
        {entry.period[lang] && (
          <p style={{ margin: '0 0 6px', color: '#777', fontFamily: 'monospace', fontSize: periodFontSize, fontWeight: 700, letterSpacing: '0.1em', whiteSpace: 'normal', wordBreak: 'normal', overflowWrap: 'normal' }}>
            {period}
          </p>
        )}
        <h3 style={{ margin: '0 0 5px', color: '#0a0a0a', fontSize: titleFontSize, fontWeight: 900, lineHeight: 1.15, letterSpacing: '-0.4px', textTransform: 'uppercase', whiteSpace: 'pre-line', wordBreak: 'normal', overflowWrap: 'normal' }}>
          {title}
        </h3>
        {entry.org[lang] && <p style={{ margin: 0, color: '#6f6f6f', fontSize: orgFontSize, lineHeight: 1.3, fontWeight: 500, whiteSpace: 'normal', wordBreak: 'normal', overflowWrap: 'normal' }}>{org}</p>}
      </div>
    </article>
  )
}

function MobileVerticalTimeline({ lang, entries }: { lang: Lang; entries: TimelineEntry[] }) {
  const outerRef = useRef<HTMLDivElement>(null)
  const { scrollY, vh, visualVh, mounted } = useScroll()
  const [progress, setProgress] = useState(0)
  const [exitP, setExitP] = useState(0)
  const headingText = lang === 'de' ? 'MEIN WEG' : 'MY PATH'
  const [heading, setHeading] = useState(headingText)
  const headingRef = useRef<(() => void) | null>(null)
  const languageRef = useRef(lang)
  const visibleEntries = entries.filter(e => !e.hiddenInTrack)
  const count = visibleEntries.length
  const { openIdx, phase, openRect, openStation, closeStation, navigate } = useStationOverlay(entries.length)

  useEffect(() => {
    if (languageRef.current !== lang) runScramble(headingText, setHeading, headingRef)
    languageRef.current = lang
    return () => headingRef.current?.()
  }, [headingText, lang])

  useEffect(() => {
    if (!mounted) return
    const track = outerRef.current
    if (!track) return
    const maxScroll = Math.max(1, track.offsetHeight - vh)
    const scrolled = Math.max(0, -track.getBoundingClientRect().top)
    const trackProgress = Math.min(1, scrolled / maxScroll)
    const journeyProgress = Math.min(1, trackProgress / 0.8)
    const nextExit = Math.max(0, (trackProgress - 0.87) / 0.13)

    setProgress((prev) => (Math.abs(prev - journeyProgress) > 0.0008 ? journeyProgress : prev))
    setExitP((prev) => (Math.abs(prev - nextExit) > 0.0008 ? nextExit : prev))
  }, [mounted, scrollY, vh])

  const activePosition = progress * (count - 1)
  const sceneHeight = visualVh || vh
  const centerY = sceneHeight * 0.5
  const step = Math.max(164, sceneHeight * 0.31)

  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const [dragOffset, setDragOffset] = useState(0)
  const dragRafRef = useRef<number | null>(null)
  const dragPendingRef = useRef<{ index: number; dy: number } | null>(null)

  useEffect(() => () => {
    if (dragRafRef.current !== null) cancelAnimationFrame(dragRafRef.current)
  }, [])

  const handleDrag = useCallback((index: number, dy: number) => {
    dragPendingRef.current = { index, dy }
    if (dragRafRef.current !== null) return
    dragRafRef.current = requestAnimationFrame(() => {
      dragRafRef.current = null
      const pending = dragPendingRef.current
      if (!pending) return
      setDraggedIndex(pending.index)
      setDragOffset(pending.dy)
    })
  }, [])

  const handleDragEnd = useCallback(() => {
    if (dragRafRef.current !== null) {
      cancelAnimationFrame(dragRafRef.current)
      dragRafRef.current = null
    }
    dragPendingRef.current = null
    setDraggedIndex(null)
    setDragOffset(0)
  }, [])

  return (
    <>
    <div ref={outerRef} data-textcolor="black" style={{ position: 'relative', zIndex: 70, height: `${Math.max(680, count * 102)}svh`, marginTop: 'calc(-1 * var(--mobile-flow-overlap-timeline))' }}>
      <section style={{ position: 'sticky', top: 0, width: '100%', height: 'var(--app-visual-height, 100svh)', overflow: 'hidden', background: '#fff' }}>
        <div style={{
          position: 'absolute', inset: 0,
          filter: exitP > 0.02 ? `blur(calc(${exitP} * var(--mobile-exit-blur)))` : 'none',
          opacity: 1 - exitP * 0.9,
          transform: `scale(${1 - exitP * 0.04})`,
          transformOrigin: 'center center',
          willChange: 'filter, opacity, transform',
        }}>
          <div style={{ padding: 'var(--mobile-section-top) var(--mobile-section-x) 0', position: 'relative', zIndex: 5 }}>
            <h2 className="mobile-section-heading" style={{ color: '#0a0a0a' }}>{heading}</h2>
          </div>

          {/* Black line - full height, blurs will cover ends */}
          <div aria-hidden="true" style={{ position: 'absolute', top: 0, bottom: 0, left: 'calc(var(--mobile-section-x) + 80px)', width: 8, background: '#2f2f2f', transform: 'translateX(-50%)' }} />

          {/* Station container - z:1 so blurs (z:3) render on top */}
          <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', zIndex: 1 }}>
            {visibleEntries.map((entry, index) => {
              const distance = Math.abs(index - activePosition)
              const proximity = Math.max(0, 1 - distance)
              const realIndex = entries.findIndex(e => e.id === entry.id)
              return <MobileVerticalStation key={entry.id} entry={entry} lang={lang} proximity={proximity} y={centerY + (index - activePosition) * step + (draggedIndex === index ? dragOffset : 0)} onDrag={(dy) => handleDrag(index, dy)} onDragEnd={handleDragEnd} onOpen={(rect) => openStation(realIndex, rect)} />
            })}
          </div>

          {/* Blur top - shifted upward */}
          <div aria-hidden="true" style={{ position: 'absolute', top: '-10svh', left: 0, right: 0, height: '44svh', background: 'linear-gradient(to bottom, #ffffff 65%, rgba(255,255,255,0.5) 82%, rgba(255,255,255,0))', pointerEvents: 'none', zIndex: 3 }} />

          {/* Blur bottom - pushed much deeper downward */}
          <div aria-hidden="true" style={{ position: 'absolute', bottom: '-16svh', left: 0, right: 0, height: '42svh', background: 'linear-gradient(to top, #ffffff 68%, rgba(255,255,255,0.45) 84%, rgba(255,255,255,0))', pointerEvents: 'none', zIndex: 3 }} />
        </div>
      </section>
    </div>
    {openIdx !== null && (
      <StationOverlay entry={entries[openIdx]} phase={phase} onClose={closeStation} onNavigate={navigate} lang={lang} originRect={openRect} isMobile={true} />
    )}
    </>
  )
}

// ─── Desktop Timeline (Original) ────────────────────────────────────────────
export function ResumeTimeline({ access = 'default' }: { access?: PortfolioAccess }) {
  const { isMobile } = useMobile()
  const { language } = useLanguage()
  const lang = language as Lang
  const entries = getEntries(access)

  // Render mobile or desktop version
  if (isMobile) {
    return <MobileVerticalTimeline lang={lang} entries={entries} />
  }

  return <DesktopTimeline lang={lang} entries={entries} />
}

function DesktopTimeline({ lang, entries }: { lang: Lang; entries: TimelineEntry[] }) {
  const outerRef = useRef<HTMLDivElement>(null)
  const [progress, setProgress] = useState(0)
  const [exitP, setExitP] = useState(0)
  const { scrollY, vh: scrollVh, vw, mounted } = useScroll()
  const visibleEntries = entries.filter(e => !e.hiddenInTrack)
  const N = visibleEntries.length

  const headingText = lang === 'de' ? 'MEIN WEG' : 'MY PATH'
  const [headingDisp, setHeadingDisp] = useState(headingText)
  const headingRef = useRef<(() => void) | null>(null)
  const prevLang = useRef(lang)

  useEffect(() => {
    if (prevLang.current !== lang) {
      runScramble(headingText, setHeadingDisp, headingRef)
    }
    prevLang.current = lang
    return () => { headingRef.current?.() }
  }, [lang, headingText])

  useEffect(() => {
    if (!mounted) return
    const el = outerRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const totalH = el.offsetHeight
    const maxScroll = totalH - scrollVh
    const scrolled = Math.max(0, -rect.top)
    const scrollProgress = Math.min(1, scrolled / maxScroll)
    
    const timelineEnd = 0.7
    const p = Math.min(1, scrollProgress / timelineEnd)
    setProgress(p)
    
    const blurStart = 0.85
    const blurProgress = Math.max(0, (scrollProgress - blurStart) / (1 - blurStart))
    setExitP(blurProgress)
  }, [scrollY, scrollVh, N, mounted])

  const pos = progress * (N - 1)

  const proximities = visibleEntries.map((_, i) => {
    const dist = Math.abs(pos - i)
    return Math.max(0, 1 - dist)
  })

  const activeIdx = Math.round(pos)
  const baseCardW = 220
  const gap = 60
  const highlightX = vw * 0.65
  const offset = highlightX - (pos * (baseCardW + gap) + baseCardW / 2)
  const { openIdx, phase, openRect, openStation, closeStation, navigate } = useStationOverlay(entries.length)

  return (
    <>
    <div ref={outerRef} data-textcolor="black" style={{ position: 'relative', zIndex: 70, height: `${(N - 2) * 100}vh`, marginTop: '-160vh' }}>
      <section style={{
        position: 'sticky', top: 0, width: '100%', height: 'var(--app-visual-height, 100svh)',
        backgroundColor: '#ffffff', overflow: 'hidden',
        display: 'flex', flexDirection: 'column',
        boxSizing: 'border-box',
      }}>
        <div style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          filter: exitP > 0.02 ? `blur(${exitP * 24}px)` : 'none',
          opacity: 1 - exitP * 0.95,
          transform: `scale(${1 - exitP * 0.05})`,
          transformOrigin: 'center center',
          willChange: 'filter, opacity, transform',
          transition: 'filter 0.1s ease-out',
        }}>
          <div style={{ padding: 'clamp(60px,10vw,120px) 9vw 0', flexShrink: 0 }}>
            <h2 style={{ fontSize: '8vw', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '-2px', margin: 0, lineHeight: 0.9, color: '#0a0a0a' }}>
              {headingDisp}
            </h2>
          </div>

          <div style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center' }}>
            <div style={{
              position: 'absolute', left: 0, right: 0,
              top: 'calc(50% - 80px)',
              height: 12, background: '#1f1f1f', zIndex: 1,
            }} />

            <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '20vw', background: 'linear-gradient(to right, #ffffff 30%, transparent)', zIndex: 10, pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: '20vw', background: 'linear-gradient(to left, #ffffff 30%, transparent)', zIndex: 10, pointerEvents: 'none' }} />

            <div style={{
              position: 'absolute',
              top: 'calc(50% - 80px)',
              transform: `translateX(${offset}px) translateY(-50%)`,
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              gap: gap,
              zIndex: 2,
              opacity: mounted ? 1 : 0,
              transition: 'opacity 0.3s ease',
            }}>
              {visibleEntries.map((entry, i) => (
                <Station key={entry.id} entry={entry} proximity={proximities[i]} lang={lang} onOpen={() => openStation(entries.findIndex(e => e.id === entry.id))} />
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
    {openIdx !== null && (
      <StationOverlay entry={entries[openIdx]} phase={phase} onClose={closeStation} onNavigate={navigate} lang={lang} originRect={null} isMobile={false} />
    )}
    </>
  )
}