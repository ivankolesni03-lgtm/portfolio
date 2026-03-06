'use client'
import { useEffect, useState, useRef } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'

/**
 * AnimatedProjectsTitle
 *
 * Rendert "PROJEKTE" / "PROJECTS" als fixed Element das scroll-linked
 * von seiner natürlichen Position (groß, bei der Projektsection) nach
 * oben links in die Navigation wandert (klein, neben dem Logo).
 *
 * Integration in page.tsx:
 *   <AnimatedProjectsTitle />
 *   <ProjectsSection />
 *
 * Der Titel in ProjectsSection selbst wird opacity:0 gesetzt wenn
 * die Animation läuft, damit es kein Duplikat gibt.
 */
export function AnimatedProjectsTitle() {
  const { language } = useLanguage()
  const text = language === 'de' ? 'PROJEKTE' : 'PROJECTS'
  const [progress, setProgress] = useState(0) // 0 = groß unten, 1 = klein oben
  const [sectionTop, setSectionTop] = useState(0)
  const rafRef = useRef<number>()

  useEffect(() => {
    const measure = () => {
      const section = document.getElementById('projekte')
      if (section) setSectionTop(section.getBoundingClientRect().top + window.scrollY)
    }
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      rafRef.current = requestAnimationFrame(() => {
        const section = document.getElementById('projekte')
        if (!section) return

        const rect = section.getBoundingClientRect()
        const vh = window.innerHeight

        // Animation beginnt wenn "PROJEKTE" oben im Viewport angekommen ist
        // und endet wenn der Titel komplett in der Nav ist (~0.3×vh scroll danach)
        const animStart = rect.top  // wenn Titel oben im Viewport
        const animEnd = -vh * 0.1   // etwas weiter gescrollt

        const p = Math.max(0, Math.min(1, (animStart - vh * 0.15) / (vh * 0.15 - animEnd) * -1))
        setProgress(p)
      })
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [sectionTop])

  // Interpolation: groß unten → klein oben links in Nav
  // Start: genau dort wo die h2 in der Section sitzt
  // End: oben links, neben Logo (~left: 32px, top: 24px)

  // Schriftgröße: 7vw → 14px
  const vw = typeof window !== 'undefined' ? window.innerWidth : 1440
  const startFontSize = vw * 0.07  // 7vw in px
  const endFontSize = 14
  const fontSize = startFontSize + (endFontSize - startFontSize) * progress

  // Position: Die h2 sitzt bei padding 9vw von links
  // In der Nav: links neben dem Logo (Logo ist bei ~32px)
  // Logo hat 2 Zeilen à 14px = ca 28px Höhe → PROJEKTE kommt darunter
  const startLeft = vw * 0.09
  const endLeft = 32
  const left = startLeft + (endLeft - startLeft) * progress

  // Top: Sektions-Position → Nav-Position
  // Start: wenn section.top = vh*0.15, also ungefähr da wo der h2 steht
  const startTop = typeof window !== 'undefined' ? window.innerHeight * 0.15 : 200
  const endTop = 52  // unter dem Logo (ca 28px Höhe + 24px offset)
  const top = startTop + (endTop - startTop) * progress

  // Farbe: weiß (auf schwarz) → schwarz (auf weiß in Nav)
  // mixBlendMode: difference macht das automatisch
  const opacity = progress > 0 ? 1 : 0

  // Wenn vollständig in Nav → klickbar
  const isInNav = progress >= 0.95

  const handleClick = () => {
    if (!isInNav) return
    document.getElementById('projekte')?.scrollIntoView({ behavior: 'smooth' })
  }

  if (opacity === 0) return null

  return (
    <div
      onClick={handleClick}
      style={{
        position: 'fixed',
        left,
        top,
        fontSize,
        fontWeight: 900,
        lineHeight: 0.9,
        letterSpacing: '-2px',
        textTransform: 'uppercase',
        color: '#ffffff',
        mixBlendMode: 'difference',
        zIndex: 50,
        cursor: isInNav ? 'pointer' : 'default',
        pointerEvents: isInNav ? 'auto' : 'none',
        userSelect: 'none',
        transition: 'none',
        willChange: 'transform, font-size',
        whiteSpace: 'nowrap',
        opacity,
      }}
    >
      {text}
    </div>
  )
}
