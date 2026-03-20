'use client'

import { useRef, useCallback, useState, useEffect } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'

const chars = "0123456789!@#$%&*АБВГДЕЖИКЛМНОПРСТУФХЦ"

export function Header({ isVisible }: { isVisible: boolean }) {
  const context = useLanguage()
  const language = context?.language ?? 'de'
  const toggleLanguage = context?.toggleLanguage

  const languageRef = useRef(language)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const isAnimating = useRef(false)

  const [displayText, setDisplayText] = useState(language === 'de' ? 'DE' : 'ENG')
  const [opacity, setOpacity] = useState(0)
  const [isMobile, setIsMobile] = useState<boolean | null>(null)

  useEffect(() => {
    setIsMobile(window.innerWidth < 768)
  }, [])

  useEffect(() => {
    languageRef.current = language
    setDisplayText(language === 'de' ? 'DE' : 'ENG')
  }, [language])

  useEffect(() => {
    const fn = () => {
      const vh = window.innerHeight
      const y = window.scrollY
      const progress = Math.max(0, Math.min(1, (y - vh * 0.6) / (vh * 0.4)))
      setOpacity(progress)
    }
    window.addEventListener('scroll', fn, { passive: true }); fn()
    return () => window.removeEventListener('scroll', fn)
  }, [])

  const scrambleTo = useCallback((target: string) => {
    if (isAnimating.current) return
    isAnimating.current = true
    let iteration = 0
    const revealed = new Set<number>()
    if (intervalRef.current) clearInterval(intervalRef.current)
    setDisplayText(target.split('').map(() => chars[Math.floor(Math.random() * chars.length)]).join(''))
    intervalRef.current = setInterval(() => {
      iteration++
      const unrevealed = target.split('').map((_, i) => i).filter(i => !revealed.has(i))
      if (unrevealed.length > 0) revealed.add(unrevealed[Math.floor(Math.random() * unrevealed.length)])
      setDisplayText(target.split('').map((_, i) =>
        revealed.has(i) ? target[i] : chars[Math.floor(Math.random() * chars.length)]
      ).join(''))
      if (iteration >= 12) {
        clearInterval(intervalRef.current!)
        setDisplayText(target)
        isAnimating.current = false
      }
    }, 40)
  }, [])

  const handleToggle = useCallback(() => {
    if (!toggleLanguage) return
    const next = languageRef.current === 'de' ? 'ENG' : 'DE'
    scrambleTo(next)
    setTimeout(() => toggleLanguage(), 12 * 40)
  }, [toggleLanguage, scrambleTo])

  const handleMouseEnter = useCallback(() => {
    const cur = languageRef.current === 'de' ? 'DE' : 'ENG'
    scrambleTo(cur)
  }, [scrambleTo])

  if (isMobile === null) return null

  if (!isMobile) {
    return (
      <header className="fixed-ui" style={{
        position: 'fixed',
        top: '1.5rem',
        right: '2rem',
        zIndex: 30,
        opacity: isVisible ? opacity : 0,
        transition: 'opacity 0.2s ease',
        pointerEvents: opacity > 0.5 ? 'auto' : 'none',
        mixBlendMode: 'difference',
      }}>
        <button onClick={handleToggle} onMouseEnter={handleMouseEnter} style={{
          background: 'none', border: 'none', cursor: 'pointer',
          fontSize: '14px', fontWeight: '700', fontFamily: 'inherit',
          color: '#ffffff', letterSpacing: '1px', lineHeight: '1.2',
          whiteSpace: 'nowrap', padding: 0,
        }}>
          {displayText}
        </button>
      </header>
    )
  }

  return (
    <header className="fixed-ui" style={{
      position: 'fixed', top: 0, left: 0, right: 0,
      zIndex: 30,
      opacity: isVisible ? opacity : 0,
      transition: 'opacity 0.3s ease',
      pointerEvents: opacity > 0.5 ? 'auto' : 'none',
      background: 'linear-gradient(to bottom, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.2) 55%, transparent 100%)',
      backdropFilter: 'blur(20px) saturate(1.6)',
      WebkitBackdropFilter: 'blur(20px) saturate(1.6)',
      maskImage: 'linear-gradient(to bottom, black 0%, black 35%, rgba(0,0,0,0.6) 65%, transparent 100%)',
      WebkitMaskImage: 'linear-gradient(to bottom, black 0%, black 35%, rgba(0,0,0,0.6) 65%, transparent 100%)',
      padding: '1.2rem 2rem 4rem',
      display: 'flex', justifyContent: 'flex-end', alignItems: 'flex-start',
    }}>
      <button onClick={handleToggle} onMouseEnter={handleMouseEnter} style={{
        background: 'none', border: 'none', cursor: 'pointer',
        fontSize: '14px', fontWeight: '700', fontFamily: 'inherit',
        color: '#ffffff', letterSpacing: '1px', lineHeight: '1.2',
        whiteSpace: 'nowrap', padding: 0,
      }}>
        {displayText}
      </button>
    </header>
  )
}