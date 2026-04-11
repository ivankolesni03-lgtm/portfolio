'use client'

import { useRef, useCallback, useState, useEffect } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'
import { useScroll } from '@/contexts/ScrollContext'
import { startScramble } from '@/lib/scramble'

export function Header({ isVisible }: { isVisible: boolean }) {
  const context = useLanguage()
  const language = context?.language ?? 'de'
  const toggleLanguage = context?.toggleLanguage
  const { scrollY, vh, vw } = useScroll()

  const languageRef = useRef(language)
  const cleanupRef = useRef<(() => void) | null>(null)
  const isAnimating = useRef(false)

  const [displayText, setDisplayText] = useState(language === 'de' ? 'DE' : 'ENG')
  
  const isMobile = vw < 768
  const opacity = Math.max(0, Math.min(1, (scrollY - vh * 0.6) / (vh * 0.4)))

  useEffect(() => {
    languageRef.current = language
    setDisplayText(language === 'de' ? 'DE' : 'ENG')
  }, [language])

  const scrambleTo = useCallback((target: string) => {
    if (isAnimating.current) return
    isAnimating.current = true
    cleanupRef.current?.()
    cleanupRef.current = startScramble(target, setDisplayText, {
      maxIterations: 12,
      onComplete: () => { isAnimating.current = false }
    })
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

  // Mobile: Match IVAN nav position and size (right side, same height as logo)
  return (
    <header className="fixed-ui" style={{
      position: 'fixed',
      top: '12px',
      right: '16px',
      zIndex: 30,
      opacity: isVisible ? opacity : 0,
      transition: 'opacity 0.2s ease',
      pointerEvents: opacity > 0.5 ? 'auto' : 'none',
      mixBlendMode: 'difference',
    }}>
      <button onClick={handleToggle} onMouseEnter={handleMouseEnter} onTouchStart={handleMouseEnter} style={{
        background: 'none', border: 'none', cursor: 'pointer',
        fontSize: '11px', fontWeight: '700', fontFamily: 'inherit',
        color: '#ffffff', letterSpacing: '-0.02em', lineHeight: '1.2',
        whiteSpace: 'nowrap', padding: 0,
      }}>
        {displayText}
      </button>
    </header>
  )
}