'use client'
import { useState, useEffect, useRef } from 'react'

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

  useEffect(() => {
    if (!active) {
      setTrailPoints([])
      return
    }

    const handleMouseMove = (e: MouseEvent) => {
      const now = Date.now()
      // Jeden Pixel – kein Zeitlimit, nur Positions-Throttle
      if (now - lastTimeRef.current > 4) {
        lastTimeRef.current = now
        const newPoint: TrailPoint = {
          id: pointIdRef.current++,
          x: e.clientX,
          y: e.clientY,
        }
        setTrailPoints(prev => [...prev, newPoint])
        // 2 Sekunden sichtbar
        setTimeout(() => {
          setTrailPoints(prev => prev.filter(p => p.id !== newPoint.id))
        }, 2000)
      }
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [active])

  if (!active) return null

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