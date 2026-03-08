'use client'

import { useEffect, useState } from 'react'

export function CustomCursor() {
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    setIsMobile(window.innerWidth < 768)

    const moveCursor = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY })
    }

    window.addEventListener('mousemove', moveCursor)
    return () => window.removeEventListener('mousemove', moveCursor)
  }, [])

  if (isMobile) return null

  return (
    <div
      className="fixed top-0 left-0 pointer-events-none z-[200000] mix-blend-difference"
      style={{
        left: position.x,
        top: position.y,
      }}
    >
      <div
        className="w-3 h-3 bg-white rounded-full"
        style={{ transform: 'translate(-50%, -50%)' }}
      />
    </div>
  )
}