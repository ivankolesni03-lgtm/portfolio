'use client'

import { useEffect, useState } from 'react'
import { useMouse } from '@/contexts/MouseContext'
import { useScroll } from '@/contexts/ScrollContext'

export function CustomCursor() {
  const { mouseX, mouseY } = useMouse()
  const { vw } = useScroll()
  
  const isMobile = vw < 768

  if (isMobile) return null

  return (
    <div
      className="pointer-events-none z-[200000] mix-blend-difference"
      style={{
        position: 'fixed',
        left: mouseX,
        top: mouseY,
        transform: 'translate(-50%, -50%)',
        width: 12,
        height: 12,
        borderRadius: '50%',
        backgroundColor: '#fff',
      }}
    />
  )
}