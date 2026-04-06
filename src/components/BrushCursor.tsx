'use client'
import { useState, useEffect, useRef } from 'react'
import { useMobile } from '@/hooks/use-mobile'

interface TrailPoint {
  id: number
  x: number
  y: number
}

interface BrushCursorProps {
  active: boolean
}

export function BrushCursor({ active }: BrushCursorProps) {
  const [trailPoints, setTrailPoints] = useState<TrailPoint[]>([])
  const lastTimeRef = useRef(0)
  const pointIdRef = useRef(0)
  const { isMobile, isTouch } = useMobile()

  useEffect(() => {
    // Disable on mobile/touch devices - no mouse to track
    if (!active || isMobile || isTouch) {
      setTrailPoints([])
      return
    }

    const handleMouseMove = (e: MouseEvent) => {
      const now = Date.now()
      if (now - lastTimeRef.current > 4) {
        lastTimeRef.current = now
        const newPoint: TrailPoint = {
          id: pointIdRef.current++,
          x: e.clientX,
          y: e.clientY,
        }
        setTrailPoints(prev => [...prev, newPoint])
        setTimeout(() => {
          setTrailPoints(prev => prev.filter(p => p.id !== newPoint.id))
        }, 2000)
      }
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [active, isMobile, isTouch])

  // Don't render anything on mobile/touch devices
  if (!active || isMobile || isTouch) return null

  return (
    <>
      {trailPoints.map((point) => (
        <div
          key={point.id}
          className="brush-trail"
          style={{ left: point.x, top: point.y }}
        />
      ))}
    </>
  )
}