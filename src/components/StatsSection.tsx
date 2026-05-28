'use client'
import { useState, useRef, useEffect, useCallback } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'
import { useScroll } from '@/contexts/ScrollContext'
import { useScramble } from '@/hooks/use-scramble'

type Lang = 'de' | 'en'
const STATS = [
  { value: 20,  suffix: '+', labelDe: 'Projekte',  labelEn: 'Projects'  },
  { value: 100, suffix: '%', labelDe: 'Ambition',  labelEn: 'Ambition'  },
  { value: 6,   suffix: '',  labelDe: 'Semester',  labelEn: 'Semesters' },
]

function ScrambleLabel({ text }: { text: string }) {
  const { disp, scramble } = useScramble(text)
  
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
  const { scrollY, vh, vw } = useScroll()
  const spacerRef = useRef<HTMLDivElement>(null)
  const [progress,  setProgress]  = useState(0)
  const [showFixed, setShowFixed] = useState(false)
  const [blur,      setBlur]      = useState(0)
  const [opacity,   setOpacity]   = useState(1)
  
  const isMobile = vw < 768

  useEffect(() => {
    const el = spacerRef.current; if (!el) return
    const rect   = el.getBoundingClientRect()
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

    // Phase 3 – EXIT BLUR
    const maxScroll = totalH - vh
    const ep = maxScroll > 0 ? Math.max(0, Math.min(1, scrolled / maxScroll)) : 0
    
    setBlur(ep * 24)
    setOpacity(1 - ep * 0.9)
  }, [scrollY, vh])

  const grid = (
    <div style={{ width:'100%' }}>
      <div style={{
        paddingLeft:  isMobile ? '5vw' : '5vw',
        paddingRight: isMobile ? '5vw' : '5vw',
        boxSizing: 'border-box',
      }}>
        <div style={{
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          gap: isMobile ? '8vw' : 'clamp(40px,8vw,120px)',
          alignItems: isMobile ? 'flex-start' : 'flex-end',
          justifyContent: isMobile ? 'flex-start' : 'center',
        }}>
          {STATS.map((s, i) => {
            const label = lang === 'de' ? s.labelDe : s.labelEn
            const val   = Math.round(progress * s.value)
            return (
              <div key={i} style={{ textAlign: isMobile ? 'left' : 'center' }}>
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
      <div style={{ position:'fixed', inset:0, zIndex: isMobile ? 3 : 2, display:'flex', alignItems:'center', backgroundColor:'#ffffff', pointerEvents:'none', opacity: showFixed ? 1 : 0, filter: blur > 0.1 ? `blur(${blur}px)` : 'none' }}>
        <div style={{ width:'100%', opacity }}>
          {grid}
        </div>
      </div>
    </>
  )
}