'use client'

import { useState, useEffect, useRef } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'

export type Lang = 'de' | 'en'

interface TimelineEntry {
  id: number
  period: { de: string; en: string }
  title: { de: string; en: string }
  org: { de: string; en: string }
  img: string
}

const entries: TimelineEntry[] = [
  { id:1, period:{de:'2023–2025',en:'2023–2025'}, title:{de:'Ausbildung GTA',en:'Apprenticeship'}, org:{de:'Gestaltungstechnischer Assistent',en:'Design Technical Assistant'}, img:'/icons/mmbbs.jpg' },
  { id:2, period:{de:'2023–HEUTE',en:'2023–NOW'}, title:{de:'Studium IMC',en:'IMC Student'}, org:{de:'Hochschule Hannover',en:'Hannover University'}, img:'/icons/hsh.jpg' },
  { id:3, period:{de:'2024',en:'2024'}, title:{de:'Graphic,\nSocial Media Intern',en:'Graphic, Ideation,\nSocial Media Intern'}, org:{de:'Graco Berlin',en:'Graco Berlin'}, img:'/icons/graco.jpg' },
  { id:4, period:{de:'2024',en:'2024'}, title:{de:'Brand\nCommunications Intern',en:'Brand\nCommunications Intern'}, org:{de:'Creative Culture',en:'Creative Culture'}, img:'/icons/cc.jpg' },
  { id:5, period:{de:'2025',en:'2025'}, title:{de:'International Marketing and\n Communications Intern',en:'International Marketing and\n Communications Intern'}, org:{de:'Continental',en:'Continental'}, img:'/icons/conti.jpg' },
  { id:6, period:{de:'2025',en:'2025'}, title:{de:'Ai Communications\nIntern',en:'Ai Communications\nIntern'}, org:{de:'Creatom',en:'Creatom'}, img:'/icons/creatom.jpg' },
  { id:7, period:{de:'2026',en:'2026'}, title:{de:'Freelancer',en:'Freelancer'}, org:{de:'Selbstständig',en:'Self-employed'}, img:'/icons/freelancer.jpg' },
]

const SCHARS = '!@#$%&*АБВГДЕЖИКЛМНОПРСТУФХЦ01'

function scramble(target: string, set: (s: string) => void, ref: React.MutableRefObject<ReturnType<typeof setInterval> | null>) {
  if (ref.current) clearInterval(ref.current)
  let i = 0; const rev = new Set<number>()
  ref.current = setInterval(() => {
    i++
    const pool = target.split('').map((_, j) => j).filter(j => !rev.has(j) && target[j] !== ' ' && target[j] !== '\n')
    if (pool.length) rev.add(pool[Math.floor(Math.random() * pool.length)])
    set(target.split('').map((c, j) => rev.has(j) || c === ' ' || c === '\n' ? target[j] : SCHARS[Math.floor(Math.random() * SCHARS.length)]).join(''))
    if (i >= 14) { clearInterval(ref.current!); set(target) }
  }, 28)
}

// proximity: 0 = far, 1 = centered
function Station({ entry, proximity, lang }: { entry: TimelineEntry; proximity: number; lang: Lang }) {
  const [titleD, setTitleD] = useState(entry.title[lang])
  const [periodD, setPeriodD] = useState(entry.period[lang])
  const [orgD, setOrgD] = useState(entry.org[lang])
  const titleRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const periodRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const orgRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const prevProx = useRef(0)
  const prevLang = useRef(lang)
  const isActive = proximity > 0.85

  // Scramble on becoming active
  useEffect(() => {
    if (isActive && prevProx.current <= 0.85) scramble(entry.title[lang], setTitleD, titleRef)
    else if (!isActive) setTitleD(entry.title[lang])
    prevProx.current = proximity
  }, [isActive, entry, lang, proximity])

  // Scramble all text on language change
  useEffect(() => {
    if (prevLang.current !== lang) {
      scramble(entry.period[lang], setPeriodD, periodRef)
      scramble(entry.title[lang], setTitleD, titleRef)
      if (entry.org[lang]) scramble(entry.org[lang], setOrgD, orgRef)
    }
    prevLang.current = lang
  }, [lang, entry])

  // Image grows from 120px to 320px based on proximity
  const imgSize = 120 + proximity * 200
  // Container width grows with proximity
  const containerWidth = 220 + proximity * 80
  // Text scale factor - smaller when inactive, full size when active
  const textScale = 0.7 + proximity * 0.3
  // Grayscale: 1 when far, 0 when centered
  const gs = Math.round((1 - proximity) * 100)
  const brightness = 0.4 + proximity * 0.6

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
        filter: `grayscale(${gs}%) brightness(${brightness})`,
        boxShadow: proximity > 0.7 ? `0 12px 48px rgba(0,0,0,${0.25 * ((proximity - 0.7) / 0.3)})` : 'none',
        transition: 'filter 0.15s ease, box-shadow 0.3s ease',
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
        <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', color: '#888', marginBottom: 6, fontFamily: 'monospace' }}>
          {periodD}
        </div>
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

export function ResumeTimeline() {
  const outerRef = useRef<HTMLDivElement>(null)
  const [progress, setProgress] = useState(0)
  const [exitP, setExitP] = useState(0)
  const [mounted, setMounted] = useState(false)
  const [vw, setVw] = useState(1440)
  const { language } = useLanguage()
  const lang = language as Lang
  const N = entries.length

  // Track viewport width and mounted state
  useEffect(() => {
    setVw(window.innerWidth)
    setMounted(true)
    const onResize = () => setVw(window.innerWidth)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  // Heading scramble effect on language change
  const headingText = lang === 'de' ? 'MEIN WEG' : 'MY PATH'
  const [headingDisp, setHeadingDisp] = useState(headingText)
  const headingRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const prevLang = useRef(lang)

  useEffect(() => {
    if (prevLang.current !== lang) {
      scramble(headingText, setHeadingDisp, headingRef)
    }
    prevLang.current = lang
  }, [lang, headingText])

  useEffect(() => {
    const fn = () => {
      const el = outerRef.current; if (!el) return
      const rect = el.getBoundingClientRect()
      const vh = window.innerHeight
      const totalH = el.offsetHeight
      const maxScroll = totalH - vh
      // How far we've scrolled through this element (0 to 1)
      const scrolled = Math.max(0, -rect.top)
      const scrollProgress = Math.min(1, scrolled / maxScroll)
      
      // Timeline entries: use first 70% of scroll for entries
      const timelineEnd = 0.7
      const p = Math.min(1, scrollProgress / timelineEnd)
      setProgress(p)
      
      // Exit blur: starts at 85% scroll, ends at 100%
      const blurStart = 0.85
      const blurProgress = Math.max(0, (scrollProgress - blurStart) / (1 - blurStart))
      setExitP(blurProgress)
    }
    window.addEventListener('scroll', fn, { passive: true })
    fn()
    return () => window.removeEventListener('scroll', fn)
  }, [N])

  // Continuous position: 0 = first card centered, N-1 = last card centered
  const pos = progress * (N - 1)

  // Each card has a proximity score: 1 when centered, falls off with distance
  const proximities = entries.map((_, i) => {
    const dist = Math.abs(pos - i)
    // Gaussian-ish falloff: within 0.5 = mostly active, > 1.5 = near 0
    return Math.max(0, 1 - dist)
  })

  // Active index for counter
  const activeIdx = Math.round(pos)

  // Fixed base width for consistent positioning (use minimum container width)
  const baseCardW = 220
  const gap = 60
  // Position highlight at 65% from left (fixed position)
  const highlightX = vw * 0.65
  // Smooth offset: position the active card center at highlightX
  const offset = highlightX - (pos * (baseCardW + gap) + baseCardW / 2)

  // Total height: N*100vh for timeline entries + 2*100vh for exit transition buffer
  return (
    <div ref={outerRef} style={{ position: 'relative', zIndex: 3, height: `${(N + 2) * 100}vh`, marginTop: '-100vh' }}>
      <section style={{
        position: 'sticky', top: 0, width: '100%', height: '100vh',
        backgroundColor: '#ffffff', overflow: 'hidden',
        display: 'flex', flexDirection: 'column',
        boxSizing: 'border-box',
      }}>
        {/* Content wrapper with exit blur effect */}
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
          {/* Heading – matching ProjectsSection */}
          <div style={{ padding: 'clamp(60px,10vw,120px) 9vw 0', flexShrink: 0 }}>
            <h2 style={{ fontSize: '8vw', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '-2px', margin: 0, lineHeight: 0.9, color: '#0a0a0a' }}>
              {headingDisp}
            </h2>
          </div>

          {/* Timeline area */}
          <div style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center' }}>

            {/* Thick horizontal line – positioned to run through image centers */}
            <div style={{
              position: 'absolute', left: 0, right: 0,
              top: 'calc(50% - 80px)',
              height: 12, background: '#0a0a0a', zIndex: 1,
            }} />

            {/* Left fade */}
            <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '20vw', background: 'linear-gradient(to right, #ffffff 30%, transparent)', zIndex: 10, pointerEvents: 'none' }} />
            {/* Right fade */}
            <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: '20vw', background: 'linear-gradient(to left, #ffffff 30%, transparent)', zIndex: 10, pointerEvents: 'none' }} />

            {/* Track – no CSS transition so it follows scroll instantly */}
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

          {/* Counter */}
          <div style={{ position: 'absolute', bottom: 'clamp(20px,3vh,36px)', right: 'clamp(40px,9vw,120px)', fontFamily: 'monospace', fontSize: 11, color: '#aaa', letterSpacing: '0.1em' }}>
            {String(activeIdx + 1).padStart(2, '0')} / {String(N).padStart(2, '0')}
          </div>
        </div>
      </section>
    </div>
  )
}