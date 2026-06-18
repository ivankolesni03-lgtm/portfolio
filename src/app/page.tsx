'use client'

import { useState, useEffect } from 'react'
import { Hero } from '@/components/Hero'
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
import { MiniProjekteSection } from '@/components/MiniProjekteSection'
import { InteractiveDots } from '@/components/InteractiveDots'
import { ResumeTimeline } from '@/components/ResumeTimeline'
import { Preloader } from '@/components/Preloader'

type HomePhase = 'locked' | 'preloading' | 'ready'

function HomeContentInner() {
  const { scrollY, vh } = useScroll()
  const headerVisible = scrollY > vh * 0.8
  const [overlayOpen, setOverlayOpen] = useState(false)

  return (
    <>
      <main>
        <CustomCursor hidden={overlayOpen} />
        <Header isVisible={headerVisible} />
        <Hero />
        <ProjectsSection onOverlayChange={setOverlayOpen} />
        <MiniProjekteSection />
        <AISection />
        <GWASection />
        <InteractiveDots />
        <ResumeTimeline />
        <ContactSection />
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
    if (sessionStorage.getItem('unlocked') === 'true') {
      requestAnimationFrame(() => setPhase('preloading'))
    }
  }, [])

  return (
    <MouseProvider>
      <LanguageProvider>
        {phase === 'locked' && <PasswordGate onUnlock={() => setPhase('preloading')} />}
        {phase === 'preloading' && <Preloader onComplete={() => setPhase('ready')} />}
        {phase !== 'locked' && (
          <div
            aria-hidden={phase !== 'ready'}
            style={{
              opacity: phase === 'ready' ? 1 : 0,
              visibility: phase === 'ready' ? 'visible' : 'hidden',
              pointerEvents: phase === 'ready' ? 'auto' : 'none',
              transition: 'opacity 220ms ease',
            }}
          >
            <HomeContent />
          </div>
        )}
      </LanguageProvider>
    </MouseProvider>
  )
}