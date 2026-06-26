'use client'
import { createContext, useContext, useState, useEffect, useRef } from 'react'

interface MouseState {
  mouseX: number
  mouseY: number
}

const defaultState: MouseState = { mouseX: 0, mouseY: 0 }

const MouseContext = createContext<MouseState>(defaultState)

export function MouseProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<MouseState>(defaultState)
  const rafRef = useRef<number>(0)
  const ticking = useRef(false)
  const latestPoint = useRef(defaultState)
  const lastStateRef = useRef(defaultState)

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      latestPoint.current = { mouseX: e.clientX, mouseY: e.clientY }
      if (!ticking.current) {
        ticking.current = true
        rafRef.current = requestAnimationFrame(() => {
          const next = latestPoint.current
          const prev = lastStateRef.current
          if (Math.abs(next.mouseX - prev.mouseX) > 1 || Math.abs(next.mouseY - prev.mouseY) > 1) {
            lastStateRef.current = next
            setState(next)
          }
          ticking.current = false
        })
      }
    }

    const onVisibilityChange = () => {
      if (document.hidden && rafRef.current) {
        cancelAnimationFrame(rafRef.current)
        ticking.current = false
      }
    }
    
    window.addEventListener('mousemove', onMove, { passive: true })
    document.addEventListener('visibilitychange', onVisibilityChange)
    return () => {
      window.removeEventListener('mousemove', onMove)
      document.removeEventListener('visibilitychange', onVisibilityChange)
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [])

  return (
    <MouseContext.Provider value={state}>
      {children}
    </MouseContext.Provider>
  )
}

export function useMouse() {
  return useContext(MouseContext)
}
