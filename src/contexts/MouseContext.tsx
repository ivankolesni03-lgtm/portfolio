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

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!ticking.current) {
        ticking.current = true
        rafRef.current = requestAnimationFrame(() => {
          setState({ mouseX: e.clientX, mouseY: e.clientY })
          ticking.current = false
        })
      }
    }
    
    window.addEventListener('mousemove', onMove, { passive: true })
    return () => {
      window.removeEventListener('mousemove', onMove)
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
