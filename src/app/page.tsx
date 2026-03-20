'use client'

import { useState, useEffect } from 'react'
import { Hero } from '@/components/Hero'
import { StorytellingSection } from '@/components/StorytellingSection'
import { ProjectsSection } from '@/components/ProjectsSection'
import { CustomCursor } from '@/components/CustomCursor'
import { Header } from '@/components/Header'
import { BrushCursor } from '@/components/BrushCursor'
import { LanguageProvider } from '@/contexts/LanguageContext'
import { ContactSection } from '@/components/ContactSection'
import { AISection } from '@/components/AISection'
import { GWASection } from '@/components/GWASection'
import { PasswordGate } from '@/components/PasswordGate'
import { StatsSection } from '@/components/StatsSection'

export default function Home() {
  const [headerVisible, setHeaderVisible] = useState(false)
  const [brushActive, setBrushActive] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      const vh = window.innerHeight
      const y = window.scrollY
      setHeaderVisible(y > vh * 0.8)
      setBrushActive(y > vh * 0.9 && y < vh * 3)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <LanguageProvider>
      <PasswordGate>
        <main>
          {/* Global overlay blur styles – targets all .fixed-ui elements */}
          <style>{`
            body.overlay-open .fixed-ui {
              filter: blur(8px) !important;
              transition: filter 0.35s ease !important;
              pointer-events: none !important;
            }
          `}</style>
          <CustomCursor />
          <Header isVisible={headerVisible} />
          <BrushCursor active={brushActive} />
          <Hero />
          <StorytellingSection />
          <div style={{ position: 'relative', zIndex: 2, marginTop: '-100vh' }}>
            <ProjectsSection />
            <StatsSection />
            <AISection />
            <GWASection />
            <ContactSection />
          </div>
        </main>
      </PasswordGate>
    </LanguageProvider>
  )
}