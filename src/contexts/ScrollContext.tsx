'use client'
import { createContext, useContext, useState, useEffect, useRef } from 'react'

interface ScrollState {
  scrollY: number
  vh: number
  vw: number
  mounted: boolean
}

const defaultState: ScrollState = {
  scrollY: 0,
  vh: 800,
  vw: 1200,
  mounted: false,
}

const ScrollContext = createContext<ScrollState>(defaultState)

export function ScrollProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<ScrollState>(defaultState)
  const rafRef = useRef<number>(0)
  const ticking = useRef(false)
  const lastStateRef = useRef(defaultState)

  useEffect(() => {
    const updateState = () => {
      const next = {
        scrollY: window.scrollY,
        vh: window.innerHeight,
        vw: window.innerWidth,
        mounted: true,
      }
      const prev = lastStateRef.current
      if (prev.scrollY !== next.scrollY || prev.vh !== next.vh || prev.vw !== next.vw || prev.mounted !== next.mounted) {
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
      setState(prev => {
        const next = {
          ...prev,
        vh: window.innerHeight,
        vw: window.innerWidth,
        }
        lastStateRef.current = next
        return next
      })
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
    document.addEventListener('visibilitychange', onVisibilityChange)

    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onResize)
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
