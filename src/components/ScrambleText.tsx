'use client'

import { useRef, useCallback, useEffect } from 'react'
import { startScramble } from '@/lib/scramble'

interface ScrambleTextProps {
  text: string
  className?: string
  style?: React.CSSProperties
}

export function ScrambleText({ text, className, style }: ScrambleTextProps) {
  const elementRef = useRef<HTMLSpanElement>(null)
  const cleanupRef = useRef<(() => void) | null>(null)

  useEffect(() => {
    return () => { cleanupRef.current?.() }
  }, [])

  const scramble = useCallback(() => {
    if (!elementRef.current) return
    cleanupRef.current?.()
    cleanupRef.current = startScramble(text, (s) => {
      if (elementRef.current) elementRef.current.textContent = s
    }, { maxIterations: 10 })
  }, [text])

  return (
    <span 
      ref={elementRef}
      className={className}
      style={style}
      onMouseEnter={scramble}
    >
      {text}
    </span>
  )
}
