'use client'

import { useState, useEffect, useRef } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'

export type Lang = 'de' | 'en'

interface TimelineEntry {
  id: number
  period: string
  title: { de: string; en: string }
  org: string
  img: string
}

const entries: TimelineEntry[] = [
  { id:1, period:'2023–2025', title:{de:'Ausbildung GTA',en:'Apprenticeship GTA'}, org:'Gestaltungstechnischer Assistent', img:'/icons/mmbbs.jpg' },
  { id:2, period:'2023-HEUTE', title:{de:'IMC Student',en:'IMC Student'}, org:'Hochschule Hannover', img:'/icons/hsh.jpg' },
  { id:3, period:'2024', title:{de:'Graphic, Ideation,\nSocial Media Intern',en:'Graphic, Ideation,\nSocial Media Intern'}, org:'Graco Berlin', img:'/icons/graco.jpg' },
  { id:4, period:'2024', title:{de:'Marketing,\nCommunications Intern',en:'Marketing,\nCommunications Intern'}, org:'Creative Culture', img:'/icons/cc.jpg' },
  { id:5, period:'2025', title:{de:'International Marketing,\nBranding Intern',en:'International Marketing,\nBranding Intern'}, org:'Continental', img:'/icons/conti.jpg' },
  { id:6, period:'2025', title:{de:'Communications\nDesign Intern',en:'Communications\nDesign Intern'}, org:'', img:'/icons/creatom.jpg' },
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
  const titleRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const prevProx = useRef(0)
  const isActive = proximity > 0.85

  useEffect(() => {
    if (isActive && prevProx.current <= 0.85) scramble(entry.title[lang], setTitleD, titleRef)
    else if (!isActive) setTitleD(entry.title[lang])
    prevProx.current = proximity
  }, [isActive, entry, lang, proximity])

  // Image grows from 80px to 220px based on proximity
  const imgSize = 80 + proximity * 140
  // Dot size
  const dotSize = 6 + proximity * 8
  // Grayscale: 1 when far, 0 when centered
  const gs = Math.round((1 - proximity) * 100)
  const brightness = 0.4 + proximity * 0.6

  return (
    <div style={{
      flexShrink: 0,
      width: 200,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      userSelect: 'none',
    }}>
      {/* Image – centered on the line, grows up and down */}
      <div style={{
        width: imgSize,
        height: imgSize,
        overflow: 'hidden',
        flexShrink: 0,
        filter: `grayscale(${gs}%) brightness(${brightness})`,
        transition: 'filter 0.15s ease',
        // No transition on size – follows scroll instantly
      }}>
        <img src={entry.img} alt="" style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }} />
      </div>

      {/* Dot – sits on the line (rendered after image, positioned by flexbox on the line) */}
      <div style={{
        width: dotSize, height: dotSize,
        borderRadius: '50%',
        background: proximity > 0.5 ? '#0a0a0a' : '#ccc',
        flexShrink: 0,
        marginTop: 0,
        transition: 'background 0.3s ease',
        zIndex: 2,
      }} />

      {/* Text always below */}
      <div style={{
        textAlign: 'center',
        marginTop: 20,
        width: 200,
        opacity: 0.3 + proximity * 0.7,
        transition: 'opacity 0.15s ease',
      }}>
        <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.08em', color: '#888', marginBottom: 5, fontFamily: 'monospace' }}>
          {entry.period}
        </div>
        <h3 style={{
          margin: '0 0 3px', fontSize: 'clamp(12px,1.2vw,15px)', fontWeight: 900,
          textTransform: 'uppercase', letterSpacing: '-0.3px',
          color: '#0a0a0a', lineHeight: 1.2, whiteSpace: 'pre-line',
        }}>
          {isActive ? titleD : entry.title[lang]}
        </h3>
        {entry.org && (
          <div style={{ fontSize: 10, fontWeight: 500, color: '#888', letterSpacing: '0.02em' }}>
            {entry.org}
          </div>
        )}
      </div>
    </div>
  )
}

export function ResumeTimeline() {
  const outerRef = useRef<HTMLDivElement>(null)
  const [progress, setProgress] = useState(0)
  const { language } = useLanguage()
  const lang = language as Lang
  const N = entries.length

  useEffect(() => {
    const fn = () => {
      const el = outerRef.current; if (!el) return
      const rect = el.getBoundingClientRect()
      const totalH = el.offsetHeight
      const vh = window.innerHeight
      const p = Math.max(0, Math.min(1, -rect.top / (totalH - vh)))
      setProgress(p)
    }
    window.addEventListener('scroll', fn, { passive: true })
    fn()
    return () => window.removeEventListener('scroll', fn)
  }, [])

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

  const cardW = 200
  const gap = 80
  const vwCenter = typeof window !== 'undefined' ? window.innerWidth / 2 : 720
  // Smooth offset: center the fractional position
  const offset = vwCenter - (pos * (cardW + gap) + cardW / 2)

  return (
    <div ref={outerRef} style={{ position: 'relative', zIndex: 2, height: `${N * 100}vh` }}>
      <section style={{
        position: 'sticky', top: 0, width: '100%', height: '100vh',
        backgroundColor: '#ffffff', overflow: 'hidden',
        display: 'flex', flexDirection: 'column',
        boxSizing: 'border-box',
      }}>
        {/* Heading */}
        <div style={{ padding: 'clamp(40px,6vw,72px) clamp(40px,9vw,120px) 0', flexShrink: 0 }}>
          <h2 style={{ fontSize: '8vw', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '-2px', margin: 0, lineHeight: 0.9, color: '#0a0a0a' }}>
            {lang === 'de' ? 'WERDEGANG' : 'CAREER'}
          </h2>
        </div>

        {/* Timeline area */}
        <div style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center' }}>

          {/* Thick horizontal line */}
          <div style={{
            position: 'absolute', left: 0, right: 0,
            top: '50%', transform: 'translateY(-50%)',
            height: 8, background: '#0a0a0a', zIndex: 1,
          }} />

          {/* Left fade */}
          <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '20vw', background: 'linear-gradient(to right, #ffffff 30%, transparent)', zIndex: 10, pointerEvents: 'none' }} />
          {/* Right fade */}
          <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: '20vw', background: 'linear-gradient(to left, #ffffff 30%, transparent)', zIndex: 10, pointerEvents: 'none' }} />

          {/* Track – no CSS transition so it follows scroll instantly */}
          <div style={{
            position: 'absolute',
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            gap: gap,
            transform: `translateX(${offset}px)`,
            // No transition: perfectly smooth with scroll
            zIndex: 2,
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
      </section>
    </div>
  )
}