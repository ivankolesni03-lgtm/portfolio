'use client'

import { useRef, useCallback, useState, useEffect } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'
import { useScroll } from '@/contexts/ScrollContext'
import { startScramble } from '@/lib/scramble'
import { NavMaskedText } from '@/components/NavMaskedText'

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
    const frame = requestAnimationFrame(() => setDisplayText(language === 'de' ? 'DE' : 'ENG'))
    return () => cancelAnimationFrame(frame)
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
    document.body.classList.add('hide-x-cursor')
    const cur = languageRef.current === 'de' ? 'DE' : 'ENG'
    scrambleTo(cur)
  }, [scrambleTo])

  const handleMouseLeave = useCallback(() => {
    document.body.classList.remove('hide-x-cursor')
  }, [])

  useEffect(() => {
    return () => document.body.classList.remove('hide-x-cursor')
  }, [])

  if (isMobile === null) return null

  if (!isMobile) {
    return (
      <header className="fixed-ui" style={{
        position: 'fixed',
        top: '1.5rem',
        right: '2rem',
        zIndex: 1000002,
        opacity: isVisible ? opacity : 0,
        transition: 'opacity 0.2s ease',
        pointerEvents: opacity > 0.5 ? 'auto' : 'none',
      }}>
        <button onClick={handleToggle} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave} className="nav__link" style={{
          background: 'none', border: 'none', cursor: 'pointer',
          fontSize: '14px', fontWeight: '700', fontFamily: 'inherit',
          letterSpacing: '1px', lineHeight: '1.2',
          whiteSpace: 'nowrap', padding: 0,
        }}>
          <NavMaskedText className="nav__link" watchKey={displayText}>{displayText}</NavMaskedText>
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
      zIndex: 1000002,
      opacity: isVisible ? opacity : 0,
      transition: 'opacity 0.2s ease',
      pointerEvents: opacity > 0.5 ? 'auto' : 'none',
    }}>
      <button onClick={handleToggle} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave} onTouchStart={handleMouseEnter} onTouchEnd={handleMouseLeave} onTouchCancel={handleMouseLeave} className="nav__link" style={{
        background: 'none', border: 'none', cursor: 'pointer',
        fontSize: '11px', fontWeight: '700', fontFamily: 'inherit',
        letterSpacing: '-0.02em', lineHeight: '1.2',
        whiteSpace: 'nowrap', padding: 0,
      }}>
        <NavMaskedText className="nav__link" watchKey={displayText}>{displayText}</NavMaskedText>
      </button>
    </header>
  )
}