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

  useEffect(() => {
    const updateState = () => {
      setState({
        scrollY: window.scrollY,
        vh: window.innerHeight,
        vw: window.innerWidth,
        mounted: true,
      })
      ticking.current = false
    }

    const onScroll = () => {
      if (!ticking.current) {
        ticking.current = true
        rafRef.current = requestAnimationFrame(updateState)
      }
    }

    const onResize = () => {
      setState(prev => ({
        ...prev,
        vh: window.innerHeight,
        vw: window.innerWidth,
      }))
    }

    // Initial state
    updateState()

    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onResize, { passive: true })

    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onResize)
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
