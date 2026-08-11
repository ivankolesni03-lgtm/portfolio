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
  { id:1, period:{de:'2023–2025',en:'2023–2025'}, title:{de:'Ausbildung GTA',en:'Apprenticeship'}, org:{de:'Gestaltungstechnischer Assistent',en:'Design Technical Assistant'}, img:'/icons/mmbbs.jpg' },
  { id:2, period:{de:'2023–HEUTE',en:'2023–NOW'}, title:{de:'Studium IMC',en:'IMC Student'}, org:{de:'Hochschule Hannover',en:'Hannover University'}, img:'/icons/hsh.jpg' },
  { id:3, period:{de:'2024',en:'2024'}, title:{de:'Graphic Design,\nOnline Marketing',en:'Graphic Design,\nOnline Marketing'}, org:{de:'Graco Berlin',en:'Graco Berlin'}, img:'/icons/graco.jpg' },
  { id:4, period:{de:'2024',en:'2024'}, title:{de:'Brand\nCommunications',en:'Brand\nCommunications'}, org:{de:'Creative Culture',en:'Creative Culture'}, img:'/icons/cc.jpg' },
  { id:5, period:{de:'2025',en:'2025'}, title:{de:'International Marketing and\n Communications',en:'International Marketing and\n Communications'}, org:{de:'Continental',en:'Continental'}, img:'/icons/conti.jpg' },
  { id:6, period:{de:'2025',en:'2025'}, title:{de:'AI Communications',en:'AI Communications'}, org:{de:'Creatom',en:'Creatom'}, img:'/icons/creatom.jpg' },
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

// ─── Mobile Timeline (Instagram Stories Style) ─────────────────────────────
function MobileTimeline({ lang, entries }: { lang: Lang; entries: TimelineEntry[] }) {
  const outerRef = useRef<HTMLDivElement>(null)
  const [activeIdx, setActiveIdx] = useState(0)
  const [exitP, setExitP] = useState(0)
  const [swipeOffset, setSwipeOffset] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)
  const [isTouching, setIsTouching] = useState(false)
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null)
  const N = entries.length

  // Heading scramble
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

  const { scrollY, vh: scrollVh, vw, mounted } = useScroll()

  // Exit blur effect when scrolling past
  useEffect(() => {
    if (!mounted) return
    const el = outerRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const totalH = el.offsetHeight
    const maxScroll = totalH - scrollVh
    const scrolled = Math.max(0, -rect.top)
    const scrollProgress = Math.min(1, scrolled / maxScroll)
    
    const blurStart = 0.85
    const blurProgress = Math.max(0, (scrollProgress - blurStart) / (1 - blurStart))
    const frame = requestAnimationFrame(() => setExitP(blurProgress))
    return () => cancelAnimationFrame(frame)
  }, [scrollY, scrollVh, mounted])

  const goTo = useCallback((idx: number) => {
    if (isAnimating || idx < 0 || idx >= N) return
    setIsAnimating(true)
    setActiveIdx(idx)
    setSwipeOffset(0)
    setTimeout(() => setIsAnimating(false), 350)
  }, [isAnimating, N])

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (isAnimating) return
    const touch = e.touches[0]
    touchStartRef.current = { x: touch.clientX, y: touch.clientY, time: Date.now() }
    setIsTouching(true)
  }, [isAnimating])

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!touchStartRef.current || isAnimating) return
    const touch = e.touches[0]
    const dx = touch.clientX - touchStartRef.current.x
    const dy = touch.clientY - touchStartRef.current.y
    
    // Only track horizontal swipes (prevent vertical scroll interference)
    if (Math.abs(dx) > Math.abs(dy) * 1.5) {
      // Limit swipe offset and add resistance at edges
      let offset = dx
      if ((activeIdx === 0 && dx > 0) || (activeIdx === N - 1 && dx < 0)) {
        offset = dx * 0.3 // Resistance at edges
      }
      setSwipeOffset(offset)
    }
  }, [isAnimating, activeIdx, N])

  const handleTouchEnd = useCallback(() => {
    if (!touchStartRef.current || isAnimating) {
      touchStartRef.current = null
      setIsTouching(false)
      return
    }
    
    const dx = swipeOffset
    const dt = Date.now() - touchStartRef.current.time
    const velocity = Math.abs(dx) / dt
    const threshold = vw * 0.25
    
    // Navigate if swipe is fast enough or far enough
    if (dx < -threshold || (dx < -50 && velocity > 0.3)) {
      goTo(activeIdx + 1)
    } else if (dx > threshold || (dx > 50 && velocity > 0.3)) {
      goTo(activeIdx - 1)
    } else {
      setSwipeOffset(0)
    }
    
    touchStartRef.current = null
    setIsTouching(false)
  }, [swipeOffset, isAnimating, activeIdx, goTo, vw])

  const entry = entries[activeIdx]

  return (
    <div ref={outerRef} data-textcolor="black" style={{ position: 'relative', zIndex: 70, height: '250vh', marginTop: 'calc(-1 * var(--mobile-flow-overlap-timeline))' }}>
      <section
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
        style={{
          position: 'sticky',
          top: 0,
          width: '100%',
          height: 'var(--app-visual-height, 100svh)',
          backgroundColor: '#ffffff',
          overflow: 'hidden',
          touchAction: 'pan-y',
          opacity: mounted ? 1 : 0,
          transition: 'opacity 0.15s ease',
        }}
      >
        {/* Content wrapper with exit blur */}
        <div style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          filter: exitP > 0.02 ? `blur(calc(${exitP} * var(--mobile-exit-blur)))` : 'none',
          opacity: 1 - exitP * 0.9,
          transform: `scale(${1 - exitP * 0.04})`,
          transformOrigin: 'center center',
          willChange: 'filter, opacity, transform',
        }}>
          {/* Heading */}
          <div style={{ padding: 'var(--mobile-section-top) var(--mobile-section-x) 0', flexShrink: 0 }}>
            <h2 style={{
              fontSize: 'var(--mobile-heading-size)',
              fontWeight: 900,
              textTransform: 'uppercase',
              letterSpacing: '-2px',
              margin: 0,
              lineHeight: 0.9,
              color: '#0a0a0a',
            }}>
              {headingDisp}
            </h2>
          </div>

          {/* Card container */}
          <div style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px 6vw',
            overflow: 'hidden',
          }}>
            {/* Swipeable card */}
            <div style={{
              width: '100%',
              maxWidth: 400,
              transform: `translateX(${swipeOffset}px)`,
              transition: swipeOffset === 0 && !isTouching ? 'transform var(--mobile-motion-base) var(--mobile-motion-ease)' : 'none',
              willChange: 'transform',
            }}>
              <MobileStationCard entry={entry} lang={lang} key={entry.id} />
            </div>
          </div>

          {/* Bottom navigation hint */}
          <div style={{
            padding: '12px 20px 24px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
            <button
              onClick={() => goTo(activeIdx - 1)}
              disabled={activeIdx === 0}
              style={{
                background: 'none',
                border: 'none',
                width: 44,
                height: 44,
                padding: 8,
                cursor: activeIdx === 0 ? 'default' : 'pointer',
                opacity: activeIdx === 0 ? 0.2 : 0.6,
                transition: 'opacity 0.2s',
              }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <polyline points="15,4 7,12 15,20" stroke="#0a0a0a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            
            <span style={{
              fontFamily: 'monospace',
              fontSize: 12,
              color: '#888',
              letterSpacing: '0.1em',
            }}>
              {String(activeIdx + 1).padStart(2, '0')} / {String(N).padStart(2, '0')}
            </span>
            
            <button
              onClick={() => goTo(activeIdx + 1)}
              disabled={activeIdx === N - 1}
              style={{
                background: 'none',
                border: 'none',
                width: 44,
                height: 44,
                padding: 8,
                cursor: activeIdx === N - 1 ? 'default' : 'pointer',
                opacity: activeIdx === N - 1 ? 0.2 : 0.6,
                transition: 'opacity 0.2s',
              }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <polyline points="9,4 17,12 9,20" stroke="#0a0a0a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}

// Mobile card component
function MobileStationCard({ entry, lang }: { entry: TimelineEntry; lang: Lang }) {
  const [titleD, setTitleD] = useState(entry.title[lang])
  const [periodD, setPeriodD] = useState(entry.period[lang])
  const [orgD, setOrgD] = useState(entry.org[lang])
  const titleRef = useRef<(() => void) | null>(null)
  const periodRef = useRef<(() => void) | null>(null)
  const orgRef = useRef<(() => void) | null>(null)
  const prevLang = useRef(lang)
  const prevId = useRef(entry.id)

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      titleRef.current?.()
      periodRef.current?.()
      orgRef.current?.()
    }
  }, [])

  // Scramble on card change
  useEffect(() => {
    if (prevId.current !== entry.id) {
      runScramble(entry.title[lang], setTitleD, titleRef)
      runScramble(entry.period[lang], setPeriodD, periodRef)
      if (entry.org[lang]) runScramble(entry.org[lang], setOrgD, orgRef)
    }
    prevId.current = entry.id
  }, [entry, lang])

  // Scramble on language change
  useEffect(() => {
    if (prevLang.current !== lang) {
      runScramble(entry.period[lang], setPeriodD, periodRef)
      runScramble(entry.title[lang], setTitleD, titleRef)
      if (entry.org[lang]) runScramble(entry.org[lang], setOrgD, orgRef)
    }
    prevLang.current = lang
  }, [lang, entry])

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      textAlign: 'center',
      gap: 20,
    }}>
      {/* Image */}
      <div style={{
        width: 'min(70vw, 280px)',
        height: 'min(70vw, 280px)',
        borderRadius: 16,
        overflow: 'hidden',
        boxShadow: '0 12px 38px rgba(0,0,0,0.11), 0 2px 12px rgba(0,0,0,0.07)',
        position: 'relative',
      }}>
        <img
          src={entry.img}
          alt=""
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: 'block',
          }}
        />
      </div>

      {/* Text info */}
      <div style={{ width: '100%', padding: '0 8px' }}>
        {entry.period[lang] && (
          <div style={{
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: '0.1em',
            color: '#888',
            marginBottom: 8,
            fontFamily: 'monospace',
          }}>
            {periodD}
          </div>
        )}
        
        <h3 style={{
          margin: '0 0 8px',
          fontSize: 'clamp(18px, 6vw, 28px)',
          fontWeight: 900,
          textTransform: 'uppercase',
          letterSpacing: '-0.5px',
          color: '#0a0a0a',
          lineHeight: 1.15,
          whiteSpace: 'pre-line',
        }}>
          {titleD}
        </h3>
        
        {entry.org[lang] && (
          <div style={{
            fontSize: 13,
            fontWeight: 500,
            color: '#888',
            letterSpacing: '0.02em',
          }}>
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
}: {
  entry: TimelineEntry
  lang: Lang
  proximity: number
  y: number
}) {
  const [title, setTitle] = useState(entry.title[lang])
  const [period, setPeriod] = useState(entry.period[lang])
  const [org, setOrg] = useState(entry.org[lang])
  const titleRef = useRef<(() => void) | null>(null)
  const periodRef = useRef<(() => void) | null>(null)
  const orgRef = useRef<(() => void) | null>(null)
  const wasActiveRef = useRef(false)
  const languageRef = useRef(lang)
  const isActive = proximity > 0.84

  useEffect(() => {
    if (isActive && !wasActiveRef.current) {
      runScramble(entry.title[lang], setTitle, titleRef)
      if (entry.period[lang]) runScramble(entry.period[lang], setPeriod, periodRef)
      if (entry.org[lang]) runScramble(entry.org[lang], setOrg, orgRef)
    }
    if (!isActive) {
      const frame = requestAnimationFrame(() => {
        setTitle(entry.title[lang])
        setPeriod(entry.period[lang])
        setOrg(entry.org[lang])
      })
      wasActiveRef.current = false
      return () => cancelAnimationFrame(frame)
    }
    wasActiveRef.current = true
  }, [entry, isActive, lang])

  useEffect(() => {
    if (languageRef.current !== lang) {
      runScramble(entry.title[lang], setTitle, titleRef)
      if (entry.period[lang]) runScramble(entry.period[lang], setPeriod, periodRef)
      if (entry.org[lang]) runScramble(entry.org[lang], setOrg, orgRef)
    }
    languageRef.current = lang
  }, [entry, lang])

  useEffect(() => () => {
    titleRef.current?.()
    periodRef.current?.()
    orgRef.current?.()
  }, [])

  const imageSize = 58 + proximity * 74
  const textOpacity = 0.12 + proximity * 0.88
  const textScale = 0.78 + proximity * 0.22

  return (
    <article style={{
      position: 'absolute',
      top: y,
      left: 'calc(var(--mobile-section-x) + 32px)',
      right: 'var(--mobile-section-x)',
      minHeight: 132,
      transform: `translateY(-50%) scale(${0.88 + proximity * 0.12})`,
      transformOrigin: 'left center',
      opacity: textOpacity,
      pointerEvents: 'none',
      willChange: 'transform, opacity',
      zIndex: isActive ? 4 : 2,
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
        boxShadow: `0 8px 24px rgba(0,0,0,${0.07 + proximity * 0.14}), 0 1px 4px rgba(0,0,0,0.08)`,
        outline: isActive ? '2px solid #0a0a0a' : '1px solid rgba(10,10,10,0.16)',
        transition: 'width var(--mobile-motion-fast) var(--mobile-motion-ease), height var(--mobile-motion-fast) var(--mobile-motion-ease), box-shadow var(--mobile-motion-fast) ease',
      }}>
        <img src={entry.img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
      </div>

      <div style={{
        marginLeft: 84,
        padding: '7px 0',
        transform: `scale(${textScale})`,
        transformOrigin: 'left center',
        transition: 'transform var(--mobile-motion-fast) var(--mobile-motion-ease)',
      }}>
        {entry.period[lang] && (
          <p style={{ margin: '0 0 6px', color: '#777', fontFamily: 'monospace', fontSize: 10, fontWeight: 700, letterSpacing: '0.1em' }}>
            {period}
          </p>
        )}
        <h3 style={{ margin: '0 0 5px', color: '#0a0a0a', fontSize: 'clamp(17px,5.5vw,25px)', fontWeight: 900, lineHeight: 0.98, letterSpacing: '-0.7px', textTransform: 'uppercase', whiteSpace: 'pre-line' }}>
          {title}
        </h3>
        {entry.org[lang] && <p style={{ margin: 0, color: '#6f6f6f', fontSize: 12, lineHeight: 1.25, fontWeight: 500 }}>{org}</p>}
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
    const frame = requestAnimationFrame(() => {
      setProgress(journeyProgress)
      setExitP(nextExit)
    })
    return () => cancelAnimationFrame(frame)
  }, [mounted, scrollY, vh])

  const activePosition = progress * (count - 1)
  const activeIndex = Math.round(activePosition)
  const sceneHeight = visualVh || vh
  const centerY = sceneHeight * 0.63
  const step = Math.max(164, sceneHeight * 0.31)

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
            <p style={{ margin: '0 0 10px', fontFamily: 'monospace', fontSize: 10, letterSpacing: '0.13em', color: '#777' }}>SELECTED PATH / 2023—NOW</p>
            <h2 className="mobile-section-heading" style={{ color: '#0a0a0a' }}>{heading}</h2>
          </div>

          <div aria-hidden="true" style={{ position: 'absolute', top: '31svh', bottom: '10svh', left: 'calc(var(--mobile-section-x) + 32px)', width: 3, background: '#dddddd', transform: 'translateX(-50%)', overflow: 'hidden' }}>
            <div style={{ width: '100%', height: `${progress * 100}%`, background: '#0a0a0a', transition: 'height 80ms linear' }} />
          </div>

          <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
            {entries.map((entry, index) => {
              const distance = Math.abs(index - activePosition)
              const proximity = Math.max(0, 1 - distance)
              return <MobileVerticalStation key={entry.id} entry={entry} lang={lang} proximity={proximity} y={centerY + (index - activePosition) * step} />
            })}
          </div>

          <div style={{ position: 'absolute', right: 'var(--mobile-section-x)', bottom: 'calc(var(--mobile-section-bottom) + 4px)', color: '#777', fontFamily: 'monospace', fontSize: 11, letterSpacing: '0.1em' }}>
            {String(activeIndex + 1).padStart(2, '0')} / {String(count).padStart(2, '0')}
          </div>
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
              height: 12, background: '#0a0a0a', zIndex: 1,
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

          <div style={{ position: 'absolute', bottom: 'clamp(20px,3vh,36px)', right: 'clamp(40px,9vw,120px)', fontFamily: 'monospace', fontSize: 11, color: '#aaa', letterSpacing: '0.1em' }}>
            {String(activeIdx + 1).padStart(2, '0')} / {String(N).padStart(2, '0')}
          </div>
        </div>
      </section>
    </div>
  )
}