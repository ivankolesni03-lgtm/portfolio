/**
 * Touch utilities for mobile interactions
 */

export type SwipeDirection = 'left' | 'right' | 'up' | 'down' | null

export interface TouchPoint {
  x: number
  y: number
  time: number
}

export interface SwipeState {
  startPoint: TouchPoint | null
  currentPoint: TouchPoint | null
  direction: SwipeDirection
  deltaX: number
  deltaY: number
  velocity: number
  isActive: boolean
}

export interface SwipeConfig {
  threshold?: number      // Minimum distance to trigger swipe (default: 50)
  velocityThreshold?: number  // Minimum velocity for quick swipes (default: 0.3)
  onSwipe?: (direction: SwipeDirection, velocity: number) => void
  onSwipeStart?: (point: TouchPoint) => void
  onSwipeMove?: (state: SwipeState) => void
  onSwipeEnd?: (state: SwipeState) => void
}

const defaultConfig: Required<Omit<SwipeConfig, 'onSwipe' | 'onSwipeStart' | 'onSwipeMove' | 'onSwipeEnd'>> = {
  threshold: 50,
  velocityThreshold: 0.3,
}

/**
 * Get touch point from event
 */
export function getTouchPoint(e: TouchEvent): TouchPoint {
  const touch = e.touches[0] || e.changedTouches[0]
  return {
    x: touch.clientX,
    y: touch.clientY,
    time: Date.now(),
  }
}

/**
 * Calculate swipe direction from delta
 */
export function getSwipeDirection(deltaX: number, deltaY: number, threshold: number): SwipeDirection {
  const absX = Math.abs(deltaX)
  const absY = Math.abs(deltaY)

  if (absX < threshold && absY < threshold) return null

  if (absX > absY) {
    return deltaX > 0 ? 'right' : 'left'
  } else {
    return deltaY > 0 ? 'down' : 'up'
  }
}

/**
 * Calculate velocity (pixels per millisecond)
 */
export function calculateVelocity(start: TouchPoint, end: TouchPoint): number {
  const dx = end.x - start.x
  const dy = end.y - start.y
  const distance = Math.sqrt(dx * dx + dy * dy)
  const time = end.time - start.time
  return time > 0 ? distance / time : 0
}

/**
 * Create swipe handlers for a component
 * Returns event handlers to attach to the element
 */
export function createSwipeHandlers(config: SwipeConfig = {}) {
  const { threshold, velocityThreshold } = { ...defaultConfig, ...config }
  
  let state: SwipeState = {
    startPoint: null,
    currentPoint: null,
    direction: null,
    deltaX: 0,
    deltaY: 0,
    velocity: 0,
    isActive: false,
  }

  const handleTouchStart = (e: TouchEvent) => {
    const point = getTouchPoint(e)
    state = {
      startPoint: point,
      currentPoint: point,
      direction: null,
      deltaX: 0,
      deltaY: 0,
      velocity: 0,
      isActive: true,
    }
    config.onSwipeStart?.(point)
  }

  const handleTouchMove = (e: TouchEvent) => {
    if (!state.isActive || !state.startPoint) return

    const point = getTouchPoint(e)
    const deltaX = point.x - state.startPoint.x
    const deltaY = point.y - state.startPoint.y
    const direction = getSwipeDirection(deltaX, deltaY, threshold)
    const velocity = calculateVelocity(state.startPoint, point)

    state = {
      ...state,
      currentPoint: point,
      direction,
      deltaX,
      deltaY,
      velocity,
    }

    config.onSwipeMove?.(state)
  }

  const handleTouchEnd = (e: TouchEvent) => {
    if (!state.isActive || !state.startPoint) return

    const point = getTouchPoint(e)
    const deltaX = point.x - state.startPoint.x
    const deltaY = point.y - state.startPoint.y
    const direction = getSwipeDirection(deltaX, deltaY, threshold)
    const velocity = calculateVelocity(state.startPoint, point)

    const finalState: SwipeState = {
      ...state,
      currentPoint: point,
      direction,
      deltaX,
      deltaY,
      velocity,
      isActive: false,
    }

    if (direction && (Math.abs(deltaX) > threshold || Math.abs(deltaY) > threshold || velocity > velocityThreshold)) {
      config.onSwipe?.(direction, velocity)
    }

    config.onSwipeEnd?.(finalState)
    
    state = {
      startPoint: null,
      currentPoint: null,
      direction: null,
      deltaX: 0,
      deltaY: 0,
      velocity: 0,
      isActive: false,
    }
  }

  return {
    onTouchStart: handleTouchStart,
    onTouchMove: handleTouchMove,
    onTouchEnd: handleTouchEnd,
    onTouchCancel: handleTouchEnd,
  }
}

/**
 * React hook for swipe detection
 */
export function useSwipe(config: SwipeConfig = {}) {
  const handlers = React.useMemo(() => createSwipeHandlers(config), [
    config.threshold,
    config.velocityThreshold,
  ])

  return handlers
}

import * as React from 'react'

/**
 * Hook for tracking touch position (useful for hover-like effects)
 */
export function useTouchPosition() {
  const [position, setPosition] = React.useState<{ x: number; y: number } | null>(null)
  const [isActive, setIsActive] = React.useState(false)

  const handlers = React.useMemo(() => ({
    onTouchStart: (e: React.TouchEvent) => {
      const touch = e.touches[0]
      setPosition({ x: touch.clientX, y: touch.clientY })
      setIsActive(true)
    },
    onTouchMove: (e: React.TouchEvent) => {
      const touch = e.touches[0]
      setPosition({ x: touch.clientX, y: touch.clientY })
    },
    onTouchEnd: () => {
      setIsActive(false)
    },
    onTouchCancel: () => {
      setIsActive(false)
    },
  }), [])

  return { position, isActive, handlers }
}

/**
 * Hook for detecting tap vs long press
 */
export function useTapOrHold(
  onTap?: () => void,
  onHold?: () => void,
  holdDuration: number = 500
) {
  const timerRef = React.useRef<NodeJS.Timeout | null>(null)
  const didHoldRef = React.useRef(false)

  const handlers = React.useMemo(() => ({
    onTouchStart: () => {
      didHoldRef.current = false
      timerRef.current = setTimeout(() => {
        didHoldRef.current = true
        onHold?.()
      }, holdDuration)
    },
    onTouchEnd: () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
        timerRef.current = null
      }
      if (!didHoldRef.current) {
        onTap?.()
      }
    },
    onTouchCancel: () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
        timerRef.current = null
      }
    },
  }), [onTap, onHold, holdDuration])

  React.useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
    }
  }, [])

  return handlers
}
