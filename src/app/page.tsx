'use client'

import dynamic from 'next/dynamic'
import { useState, useEffect, useLayoutEffect, useCallback } from 'react'
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

interface HomeProps {
  initialAccess?: PortfolioAccess
  bypassPasswordGate?: boolean
}

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

export default function Home({ initialAccess = 'default', bypassPasswordGate = false }: HomeProps) {
  const [phase, setPhase] = useState<HomePhase>(bypassPasswordGate ? 'preloading' : 'locked')
  const [access, setAccess] = useState<PortfolioAccess>(initialAccess)

  const syncViewportState = useCallback(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
    window.dispatchEvent(new Event('scroll'))
    window.dispatchEvent(new Event('resize'))
  }, [])

  useEffect(() => {
    if (bypassPasswordGate) return

    if (sessionStorage.getItem('unlocked') === 'true') {
      const frame = requestAnimationFrame(() => {
        setAccess(sessionStorage.getItem('portfolioAccess') === 'gme' ? 'gme' : 'default')
        setPhase('preloading')
      })

      return () => cancelAnimationFrame(frame)
    }
  }, [bypassPasswordGate])

  useLayoutEffect(() => {
    if (!bypassPasswordGate) return

    const previous = window.history.scrollRestoration
    window.history.scrollRestoration = 'manual'

    const frame1 = requestAnimationFrame(() => {
      syncViewportState()
    })
    const frame2 = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        syncViewportState()
      })
    })

    return () => {
      cancelAnimationFrame(frame1)
      cancelAnimationFrame(frame2)
      window.history.scrollRestoration = previous
    }
  }, [bypassPasswordGate, syncViewportState])

  const handlePreloaderComplete = useCallback(() => {
    requestAnimationFrame(() => {
      syncViewportState()
      setPhase('ready')
    })
  }, [syncViewportState])

  return (
    <MouseProvider>
      <LanguageProvider>
        {phase === 'locked' && <PasswordGate onUnlock={(nextAccess) => { setAccess(nextAccess); setPhase('preloading') }} />}
        {phase === 'preloading' && <Preloader onComplete={handlePreloaderComplete} />}
        {phase === 'ready' && <HomeContent access={access} />}
      </LanguageProvider>
    </MouseProvider>
  )
}