'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'
import { useMobile } from '@/hooks/use-mobile'
import { useScroll } from '@/contexts/ScrollContext'
import { runScramble } from '@/hooks/use-scramble'

export type Lang = 'de' | 'en'
export type PortfolioAccess = 'default' | 'gme'

interface TimelineEntry {
  id: number
  period: { de: string; en: string }
  title: { de: string; en: string }
  org: { de: string; en: string }
  img: string
}

const baseEntries: TimelineEntry[] = [
  { id:1, period:{de:'2023–2025',en:'2023–2025'}, title:{de:'Ausbildung\nGTA',en:'Apprenticeship'}, org:{de:'Gestaltungstechnischer\nAssistent',en:'Design Technical Assistant'}, img:'/icons/mmbbs.jpg' },
  { id:2, period:{de:'2023–HEUTE',en:'2023–NOW'}, title:{de:'Studium IMC',en:'IMC Student'}, org:{de:'Hochschule Hannover',en:'Hannover University'}, img:'/icons/hsh.jpg' },
  { id:3, period:{de:'2024',en:'2024'}, title:{de:'Graphic Design,\nOnline Marketing',en:'Graphic Design,\nOnline Marketing'}, org:{de:'Graco Berlin',en:'Graco Berlin'}, img:'/icons/graco.jpg' },
  { id:4, period:{de:'2024',en:'2024'}, title:{de:'Brand\nCommunications',en:'Brand\nCommunications'}, org:{de:'Creative Culture',en:'Creative Culture'}, img:'/icons/cc.jpg' },
  { id:5, period:{de:'2025',en:'2025'}, title:{de:'International\nMarketing and\nCommunications',en:'International\nMarketing and\nCommunications'}, org:{de:'Continental',en:'Continental'}, img:'/icons/conti.jpg' },
  { id:6, period:{de:'2025',en:'2025'}, title:{de:'Generative AI\nCommunications',en:'Generative AI\nCommunications'}, org:{de:'Creatom',en:'Creatom'}, img:'/icons/creatom.jpg' },
  { id:7, period:{de:'2026',en:'2026'}, title:{de:'Freelancer',en:'Freelancer'}, org:{de:'Selbstständig',en:'Self-employed'}, img:'/icons/freelancer.jpg' },
  { id:8, period:{de:'2026–HEUTE',en:'2026–NOW'}, title:{de:'Generative\nIntelligence',en:'Generative\nIntelligence'}, org:{de:'BMW Group',en:'BMW Group'}, img:'/icons/bmw.jpg' },
]

const gmeEntry: TimelineEntry = {
  id: 9,
  period: { de: '', en: '' },
  title: { de: 'COMMING\nSOON', en: 'COMMING\nSOON' },
  org: { de: '', en: '' },
  img: '/icons/gamestop.jpg',
}

function getEntries(access: PortfolioAccess) {
  return access === 'gme' ? [...baseEntries, gmeEntry] : baseEntries
}

// proximity: 0 = far, 1 = centered
function Station({ entry, proximity, lang }: { entry: TimelineEntry; proximity: number; lang: Lang }) {
  const [titleD, setTitleD] = useState(entry.title[lang])
  const [periodD, setPeriodD] = useState(entry.period[lang])
  const [orgD, setOrgD] = useState(entry.org[lang])
  const titleRef = useRef<(() => void) | null>(null)
  const periodRef = useRef<(() => void) | null>(null)
  const orgRef = useRef<(() => void) | null>(null)
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
  return (
    <div style={{
      flexShrink: 0,
      width: containerWidth,
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      userSelect: 'none',
    }}>
      {/* Image – centered on the line, grows up and down */}
      <div style={{
        width: imgSize,
        height: imgSize,
        overflow: 'hidden',
        flexShrink: 0,
        borderRadius: 12,
        boxShadow: `0 10px 34px rgba(0,0,0,0.10), 0 2px 10px rgba(0,0,0,0.06)${proximity > 0.7 ? `, 0 18px 58px rgba(0,0,0,${0.10 * ((proximity - 0.7) / 0.3)})` : ''}`,
        transition: 'box-shadow 0.3s ease',
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
        marginTop: 24,
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
    </div>
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
}: {
  entry: TimelineEntry
  lang: Lang
  proximity: number
  y: number
  onDrag?: (dy: number) => void
  onDragEnd?: () => void
}) {
  const isActive = proximity > 0.84
  const dragStartRef = useRef<{ y: number } | null>(null)

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
    dragStartRef.current = { y: e.touches[0].clientY }
  }, [])

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!dragStartRef.current || !onDrag) return
    e.preventDefault()
    const dy = e.touches[0].clientY - dragStartRef.current.y
    onDrag(dy)
  }, [onDrag])

  const handleTouchEnd = useCallback(() => {
    dragStartRef.current = null
    onDragEnd?.()
  }, [onDragEnd])

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
      <div style={{
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
  const count = entries.length

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
            {entries.map((entry, index) => {
              const distance = Math.abs(index - activePosition)
              const proximity = Math.max(0, 1 - distance)
              return <MobileVerticalStation key={entry.id} entry={entry} lang={lang} proximity={proximity} y={centerY + (index - activePosition) * step + (draggedIndex === index ? dragOffset : 0)} onDrag={(dy) => handleDrag(index, dy)} onDragEnd={handleDragEnd} />
            })}
          </div>

          {/* Blur top - shifted upward */}
          <div aria-hidden="true" style={{ position: 'absolute', top: '-10svh', left: 0, right: 0, height: '44svh', background: 'linear-gradient(to bottom, #ffffff 65%, rgba(255,255,255,0.5) 82%, rgba(255,255,255,0))', pointerEvents: 'none', zIndex: 3 }} />

          {/* Blur bottom - pushed much deeper downward */}
          <div aria-hidden="true" style={{ position: 'absolute', bottom: '-16svh', left: 0, right: 0, height: '42svh', background: 'linear-gradient(to top, #ffffff 68%, rgba(255,255,255,0.45) 84%, rgba(255,255,255,0))', pointerEvents: 'none', zIndex: 3 }} />
        </div>
      </section>
    </div>
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
  const N = entries.length

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

  const proximities = entries.map((_, i) => {
    const dist = Math.abs(pos - i)
    return Math.max(0, 1 - dist)
  })

  const activeIdx = Math.round(pos)
  const baseCardW = 220
  const gap = 60
  const highlightX = vw * 0.65
  const offset = highlightX - (pos * (baseCardW + gap) + baseCardW / 2)

  return (
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
              {entries.map((entry, i) => (
                <Station key={entry.id} entry={entry} proximity={proximities[i]} lang={lang} />
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}