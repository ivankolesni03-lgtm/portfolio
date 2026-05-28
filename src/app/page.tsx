'use client'

import { useEffect, useState } from 'react'
import { Hero } from '@/components/Hero'
import { StorytellingSection } from '@/components/StorytellingSection'
import { ProjectsSection } from '@/components/ProjectsSection'
import { CustomCursor } from '@/components/CustomCursor'
import { Header } from '@/components/Header'
import { LanguageProvider } from '@/contexts/LanguageContext'
import { ScrollProvider, useScroll } from '@/contexts/ScrollContext'
import { MouseProvider } from '@/contexts/MouseContext'
import { ContactSection } from '@/components/ContactSection'
import { AISection } from '@/components/AISection'
import { GWASection } from '@/components/GWASection'
import { PasswordGate } from '@/components/PasswordGate'
import { StatsSection } from '@/components/StatsSection'
import { InteractiveDots } from '@/components/InteractiveDots'
import { ResumeTimeline } from '@/components/ResumeTimeline'
import { Preloader } from '@/components/Preloader'

type HomePhase = 'locked' | 'preloading' | 'ready'

function HomeContentInner() {
  const { scrollY, vh } = useScroll()
  const headerVisible = scrollY > vh * 0.8

  return (
    <>
      <main>
        <style>{`
          body.overlay-open .fixed-ui {
            filter: blur(8px) !important;
            transition: filter 0.35s ease !important;
            pointer-events: none !important;
          }
        `}</style>
        <CustomCursor />
        <Header isVisible={headerVisible} />
        <Hero />
        <StorytellingSection />
        <div style={{ position: 'relative', zIndex: 2, marginTop: '-100vh' }}>
          <ProjectsSection />
          <StatsSection />
          <AISection />
          <GWASection />
          <InteractiveDots />
          <ResumeTimeline />
          <ContactSection />
        </div>
      </main>
    </>
  )
}

function HomeContent() {
  return (
    <ScrollProvider>
      <HomeContentInner />
    </ScrollProvider>
  )
}

export default function Home() {
  const [phase, setPhase] = useState<HomePhase>('locked')

  useEffect(() => {
    const isUnlocked = sessionStorage.getItem('unlocked') === 'true'
    setPhase(isUnlocked ? 'preloading' : 'locked')
  }, [])

  return (
    <MouseProvider>
      <LanguageProvider>
        {phase === 'locked' && <PasswordGate onUnlock={() => setPhase('preloading')} />}
        {phase === 'preloading' && <Preloader onComplete={() => setPhase('ready')} />}
        {phase !== 'locked' && <HomeContent />}
      </LanguageProvider>
    </MouseProvider>
  )
}