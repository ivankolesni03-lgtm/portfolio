'use client'

import { useRef, useCallback } from 'react'

// Scramble chars - Russisch + Zahlen + Sonderzeichen
const chars = "0123456789!@#$%&*АБВГДЕЖИКЛМНОПРСТУФХЦ"

interface ScrambleTextProps {
  text: string
  className?: string
  style?: React.CSSProperties
}

export function ScrambleText({ text, className, style }: ScrambleTextProps) {
  const elementRef = useRef<HTMLSpanElement>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  
  const totalIterations = 10
  const intervalMs = 40

  const scramble = useCallback(() => {
    if (!elementRef.current) return
    
    const revealed = new Set<number>()
    const indices = text.split('').map((_, i) => i)
    let iteration = 0
    
    elementRef.current.textContent = text
      .split("")
      .map(() => chars[Math.floor(Math.random() * chars.length)])
      .join("")
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }
    
    intervalRef.current = setInterval(() => {
      iteration++
      
      const unrevealed = indices.filter(i => !revealed.has(i))
      if (unrevealed.length > 0) {
        const randomIndex = unrevealed[Math.floor(Math.random() * unrevealed.length)]
        revealed.add(randomIndex)
      }
      
      if (elementRef.current) {
        elementRef.current.textContent = text
          .split("")
          .map((char, i) => 
            revealed.has(i) || char === ' ' ? text[i] : chars[Math.floor(Math.random() * chars.length)]
          )
          .join("")
      }
        
      if (iteration >= totalIterations) {
        if (intervalRef.current) {
          clearInterval(intervalRef.current)
        }
        if (elementRef.current) {
          elementRef.current.textContent = text
        }
      }
    }, intervalMs)
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
