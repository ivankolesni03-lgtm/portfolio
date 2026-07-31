'use client'

import dynamic from 'next/dynamic'
import { useState, useEffect } from 'react'
import { Hero } from '@/components/Hero'
import { ProjectsSection } from '@/components/ProjectsSection'
import { CustomCursor } from '@/components/CustomCursor'
import { Header } from '@/components/Header'
import { LanguageProvider } from '@/contexts/LanguageContext'
import { ScrollProvider, useScroll } from '@/contexts/ScrollContext'
import { MouseProvider } from '@/contexts/MouseContext'
import { PasswordGate } from '@/components/PasswordGate'
import { Preloader } from '@/components/Preloader'

const MiniProjekteSection = dynamic(() => import('@/components/MiniProjekteSection').then((mod) => mod.MiniProjekteSection), { ssr: false })
const AISection = dynamic(() => import('@/components/AISection').then((mod) => mod.AISection), { ssr: false })
const GWASection = dynamic(() => import('@/components/GWASection').then((mod) => mod.GWASection), { ssr: false })
const InteractiveDots = dynamic(() => import('@/components/InteractiveDots').then((mod) => mod.InteractiveDots), { ssr: false })
const ResumeTimeline = dynamic(() => import('@/components/ResumeTimeline').then((mod) => mod.ResumeTimeline), { ssr: false })
const ContactSection = dynamic(() => import('@/components/ContactSection').then((mod) => mod.ContactSection), { ssr: false })

type HomePhase = 'locked' | 'preloading' | 'ready'
type PortfolioAccess = 'default' | 'gme'

function HomeContentInner({ access }: { access: PortfolioAccess }) {
  const { scrollY, vh } = useScroll()
  const headerVisible = scrollY > vh * 0.8
  const [overlayOpen, setOverlayOpen] = useState(false)

  return (
    <>
      <main>
        <CustomCursor hidden={overlayOpen} />
        <Header isVisible={headerVisible} />
        <Hero access={access} />
        <ProjectsSection onOverlayChange={setOverlayOpen} />
        <MiniProjekteSection />
        <AISection />
        <GWASection />
        <InteractiveDots />
        <ResumeTimeline access={access} />
        <ContactSection />
      </main>
    </>
  )
}

function HomeContent({ access }: { access: PortfolioAccess }) {
  return (
    <ScrollProvider>
      <HomeContentInner access={access} />
    </ScrollProvider>
  )
}

export default function Home() {
  const [phase, setPhase] = useState<HomePhase>('locked')
  const [access, setAccess] = useState<PortfolioAccess>('default')

  useEffect(() => {
    if (sessionStorage.getItem('unlocked') === 'true') {
      setAccess(sessionStorage.getItem('portfolioAccess') === 'gme' ? 'gme' : 'default')
      requestAnimationFrame(() => setPhase('preloading'))
    }
  }, [])

  return (
    <MouseProvider>
      <LanguageProvider>
        {phase === 'locked' && <PasswordGate onUnlock={(nextAccess) => { setAccess(nextAccess); setPhase('preloading') }} />}
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
            <HomeContent access={access} />
          </div>
        )}
      </LanguageProvider>
    </MouseProvider>
  )
}