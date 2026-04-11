'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { startScramble } from '@/lib/scramble'

/**
 * Hook for scramble text animation using centralized manager
 * Replaces individual setInterval-based scrambles with shared rAF loop
 */
export function useScramble(text: string) {
  const [disp, setDisp] = useState(text)
  const cleanupRef = useRef<(() => void) | null>(null)
  const prevTextRef = useRef(text)

  // Handle text changes
  useEffect(() => {
    if (prevTextRef.current !== text) {
      prevTextRef.current = text
      // Cancel any running scramble
      cleanupRef.current?.()
      // Start new scramble for text change
      cleanupRef.current = startScramble(text, setDisp)
    }
    return () => {
      cleanupRef.current?.()
    }
  }, [text])

  // Manual scramble trigger
  const scramble = useCallback(() => {
    cleanupRef.current?.()
    cleanupRef.current = startScramble(text, setDisp)
  }, [text])

  return { disp, scramble }
}

/**
 * Run a scramble animation imperatively
 */
export function runScramble(
  target: string,
  set: (s: string) => void,
  ref: React.MutableRefObject<(() => void) | null>,
  onDone?: () => void
) {
  ref.current?.()
  ref.current = startScramble(target, set, { onComplete: onDone })
}
