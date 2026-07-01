'use client'
import { createContext, useContext, useState, useEffect, useRef } from 'react'
import { MOBILE_BREAKPOINT, TABLET_BREAKPOINT } from '@/hooks/use-mobile'

interface ScrollState {
  scrollY: number
  vh: number
  visualVh: number
  vw: number
  isMobile: boolean
  isTablet: boolean
  isDesktop: boolean
  isShort: boolean
  isLandscape: boolean
  isTouch: boolean
  mounted: boolean
}

const defaultState: ScrollState = {
  scrollY: 0,
  vh: 800,
  visualVh: 800,
  vw: 1200,
  isMobile: false,
  isTablet: false,
  isDesktop: true,
  isShort: false,
  isLandscape: true,
  isTouch: false,
  mounted: false,
}

const ScrollContext = createContext<ScrollState>(defaultState)

export function ScrollProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<ScrollState>(defaultState)
  const rafRef = useRef<number>(0)
  const ticking = useRef(false)
  const lastStateRef = useRef(defaultState)

  const readState = () => {
    const vw = window.innerWidth
    const vh = window.innerHeight
    const visualVh = Math.round(window.visualViewport?.height ?? vh)
    document.documentElement.style.setProperty('--app-height', `${vh}px`)
    document.documentElement.style.setProperty('--app-visual-height', `${visualVh}px`)
    document.documentElement.style.setProperty('--app-width', `${vw}px`)

    return {
      scrollY: window.scrollY,
      vh,
      visualVh,
      vw,
      isMobile: vw < MOBILE_BREAKPOINT,
      isTablet: vw >= MOBILE_BREAKPOINT && vw < TABLET_BREAKPOINT,
      isDesktop: vw >= TABLET_BREAKPOINT,
      isShort: visualVh < 620,
      isLandscape: vw > vh,
      isTouch: 'ontouchstart' in window || navigator.maxTouchPoints > 0 || window.matchMedia('(pointer: coarse)').matches,
      mounted: true,
    }
  }

  useEffect(() => {
    const updateState = () => {
      const next = readState()
      const prev = lastStateRef.current
      if (
        prev.scrollY !== next.scrollY ||
        prev.vh !== next.vh ||
        prev.visualVh !== next.visualVh ||
        prev.vw !== next.vw ||
        prev.isMobile !== next.isMobile ||
        prev.isTablet !== next.isTablet ||
        prev.isDesktop !== next.isDesktop ||
        prev.isShort !== next.isShort ||
        prev.isLandscape !== next.isLandscape ||
        prev.isTouch !== next.isTouch ||
        prev.mounted !== next.mounted
      ) {
        lastStateRef.current = next
        setState(next)
      }
      ticking.current = false
    }

    const onScroll = () => {
      if (!ticking.current) {
        ticking.current = true
        rafRef.current = requestAnimationFrame(updateState)
      }
    }

    const onResize = () => {
      updateState()
    }

    const onVisibilityChange = () => {
      if (document.hidden && rafRef.current) {
        cancelAnimationFrame(rafRef.current)
        ticking.current = false
      }
    }

    // Initial state
    updateState()

    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onResize, { passive: true })
    window.addEventListener('orientationchange', onResize, { passive: true })
    window.visualViewport?.addEventListener('resize', onResize, { passive: true })
    window.visualViewport?.addEventListener('scroll', onResize, { passive: true })
    document.addEventListener('visibilitychange', onVisibilityChange)

    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onResize)
      window.removeEventListener('orientationchange', onResize)
      window.visualViewport?.removeEventListener('resize', onResize)
      window.visualViewport?.removeEventListener('scroll', onResize)
      document.removeEventListener('visibilitychange', onVisibilityChange)
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [])

  return (
    <ScrollContext.Provider value={state}>
      {children}
    </ScrollContext.Provider>
  )
}

export function useScroll() {
  return useContext(ScrollContext)
}
