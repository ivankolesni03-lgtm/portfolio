'use client'

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

function HomeContentInner() {
  const { scrollY, vh } = useScroll()
  const headerVisible = scrollY > vh * 0.8

  return (
    <LanguageProvider>
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
          <InteractiveDots />
          <ResumeTimeline />
          <AISection />
          <GWASection />
          <ContactSection />
        </div>
      </main>
    </LanguageProvider>
  )
}

function HomeContent() {
  return (
    <ScrollProvider>
      <MouseProvider>
        <HomeContentInner />
      </MouseProvider>
    </ScrollProvider>
  )
}

export default function Home() {
  return (
    //<PasswordGate>
      <HomeContent />
    //</PasswordGate>
  )
}