'use client'
import { useState, useRef, useEffect, useCallback } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'

type Lang = 'de' | 'en'
const CHARS = '!@#$%&*АБВГДЕЖИКЛМНОПРСТУФХЦ'
const STATS = [
  { value: 20,  suffix: '+', labelDe: 'Projekte',  labelEn: 'Projects'  },
  { value: 100, suffix: '%', labelDe: 'Ambition',  labelEn: 'Ambition'  },
  { value: 6,   suffix: '',  labelDe: 'Semester',  labelEn: 'Semesters' },
]

function ScrambleLabel({ text }: { text: string }) {
  const [disp, setDisp] = useState(text)
  const iv = useRef<ReturnType<typeof setInterval>|null>(null)
  const hasScrambledRef = useRef(false)
  
  const scramble = useCallback(() => {
    let i = 0; const rev = new Set<number>()
    if (iv.current) clearInterval(iv.current)
    iv.current = setInterval(() => {
      i++
      const pool = text.split('').map((_,j)=>j).filter(j=>!rev.has(j)&&text[j]!==' ')
      if (pool.length) rev.add(pool[Math.floor(Math.random()*pool.length)])
      setDisp(text.split('').map((c,j)=>rev.has(j)||c===' '?text[j]:CHARS[Math.floor(Math.random()*CHARS.length)]).join(''))
      if (i >= 16) { clearInterval(iv.current!); setDisp(text) }
    }, 30)
  }, [text])

  // Auto-scramble on first scroll into view (for mobile)
  const handleScrollScramble = useCallback(() => {
    if (!hasScrambledRef.current) {
      hasScrambledRef.current = true
      scramble()
    }
  }, [scramble])

  useEffect(() => () => { if (iv.current) clearInterval(iv.current) }, [])
  
  return (
    <span 
      onMouseEnter={scramble} 
      onTouchStart={scramble}
      style={{ cursor:'default' }}
    >
      {disp}
    </span>
  )
}

export function StatsSection() {
  const { language } = useLanguage()
  const lang = language as Lang
  const spacerRef = useRef<HTMLDivElement>(null)
  const [progress,  setProgress]  = useState(0)
  const [showFixed, setShowFixed] = useState(false)
  const [blur,      setBlur]      = useState(0)
  const [opacity,   setOpacity]   = useState(1)
  const [isMobile,  setIsMobile]  = useState(false)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  useEffect(() => {
    const fn = () => {
      const el = spacerRef.current; if (!el) return
      const rect   = el.getBoundingClientRect()
      const vh     = window.innerHeight
      const totalH = el.offsetHeight
      
      // Wie viele Pixel wir in den Spacer hineingescrollt sind
      const scrolled = -rect.top

      // Phase 1 – COUNT UP
      const countStart = -vh
      const countEnd   = -vh * 0.5 
      const p = Math.max(0, Math.min(1, (scrolled - countStart) / (countEnd - countStart)))
      setProgress(p)

      // Phase 2 – FIXED
      const fixedActive = scrolled >= 0 && rect.bottom >= vh
      setShowFixed(fixedActive)

      // Phase 3 – EXIT BLUR (beginnt verzögert)
      // Der Blur fängt erst nach einem gewissen Scroll-Weg im Fixed-Zustand an
      const blurDelay = vh * 0.5 // <- HIER DEN WERT ÄNDERN (z.B. vh * 0.6 für noch später)
      const exitTotal = totalH - vh
      const effectiveScrolled = Math.max(0, scrolled - blurDelay)
      const blurDuration = exitTotal - blurDelay
      
      // Berechne den Fortschritt nur für die verbleibende Zeit nach der Verzögerung
      const ep = blurDuration > 0 ? Math.max(0, Math.min(1, effectiveScrolled / blurDuration)) : 0
      
      setBlur(ep * 24)
      setOpacity(1 - ep)
    }

    window.addEventListener('scroll', fn, { passive: true })
    requestAnimationFrame(fn)
    return () => window.removeEventListener('scroll', fn)
  }, [])

  const grid = (
    <div style={{ width:'100%', filter: blur > 0 ? `blur(${blur}px)` : 'none', opacity }}>
      <div style={{
        paddingLeft:  isMobile ? '5vw' : 'clamp(80px,18vw,260px)',
        paddingRight: isMobile ? '5vw' : 'clamp(24px,6vw,80px)',
        boxSizing: 'border-box',
      }}>
        <div style={{
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          gap: isMobile ? '8vw' : 'clamp(40px,8vw,120px)',
          alignItems: isMobile ? 'flex-start' : 'flex-end',
          justifyContent: 'flex-start',
        }}>
          {STATS.map((s, i) => {
            const label = lang === 'de' ? s.labelDe : s.labelEn
            const val   = Math.round(progress * s.value)
            return (
              <div key={i} style={{ textAlign: 'left' }}>
                <div style={{
                  fontSize: isMobile ? 'clamp(64px,18vw,100px)' : 'clamp(80px,13vw,192px)',
                  fontWeight: 900, lineHeight: 0.85,
                  letterSpacing: isMobile ? '-3px' : '-6px',
                  color: '#0a0a0a', margin: '0 0 clamp(8px,1vw,16px)',
                  fontVariantNumeric: 'tabular-nums',
                }}>{val}{s.suffix}</div>
                <div style={{ color:'#0a0a0a', fontSize: isMobile ? '16px' : 'clamp(14px,2.2vw,24px)', fontWeight:800, letterSpacing:'-0.5px', textTransform:'uppercase', lineHeight:1.1 }}>
                  <ScrambleLabel text={label} />
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )

  return (
    <>
      <div ref={spacerRef} style={{ height: isMobile ? '200vh' : '180vh', backgroundColor:'#ffffff', position:'relative', zIndex:1, marginTop: isMobile ? '30vh' : 0 }}>
        {/* Sticky: sichtbar nur bevor der fixed-Modus aktiviert wird */}
        <div style={{ position:'sticky', top:'50%', transform:'translateY(-50%)', width:'100%', pointerEvents:'none', opacity: showFixed ? 0 : 1 }}>
          {grid}
        </div>
      </div>

      {/* Fixed Overlay */}
      <div style={{ position:'fixed', inset:0, zIndex: isMobile ? 3 : 2, display:'flex', alignItems:'center', backgroundColor:'#ffffff', pointerEvents:'none', opacity: showFixed ? 1 : 0, transition:'opacity 0.06s' }}>
        {grid}
      </div>
    </>
  )
}