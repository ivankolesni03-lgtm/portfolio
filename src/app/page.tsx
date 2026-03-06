'use client'

import { useState, useEffect } from 'react'
import { Hero } from '@/components/Hero'
import { QuoteSection } from '@/components/QuoteSection'
import { ProjectsSection } from '@/components/ProjectsSection'
import { CustomCursor } from '@/components/CustomCursor'
import { Header } from '@/components/Header'
import { BrushCursor } from '@/components/BrushCursor'
import { LanguageProvider } from '@/contexts/LanguageContext'
import { ContactSection } from '@/components/ContactSection'
import { AISection } from '@/components/AISection'
import { GWASection } from '@/components/GWASection'

export default function Home() {
  const [headerVisible, setHeaderVisible] = useState(false)
  const [brushActive, setBrushActive] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      const vh = window.innerHeight
      const y = window.scrollY

      // Header sichtbar wenn Hero verlassen
      setHeaderVisible(y > vh * 0.8)

      // BrushCursor aktiv nur in der QuoteSection (zwischen 1×vh und 3×vh)
      setBrushActive(y > vh * 0.9 && y < vh * 3)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <LanguageProvider>
      <main>
        <CustomCursor />
        <Header isVisible={headerVisible} />
        <BrushCursor active={brushActive} />
        <Hero />
        <QuoteSection />
        <ProjectsSection />
        <AISection />
        <GWASection />
        <ContactSection />
      </main>
    </LanguageProvider>
  )
}