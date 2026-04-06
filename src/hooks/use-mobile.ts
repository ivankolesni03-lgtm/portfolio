import * as React from "react"

export const MOBILE_BREAKPOINT = 768

interface MobileState {
  isMobile: boolean
  isTouch: boolean
  width: number
  height: number
}

/**
 * Comprehensive mobile detection hook with resize handling
 * @returns Object with isMobile, isTouch, width, height
 */
export function useMobile(): MobileState {
  const [state, setState] = React.useState<MobileState>({
    isMobile: false,
    isTouch: false,
    width: typeof window !== 'undefined' ? window.innerWidth : 1024,
    height: typeof window !== 'undefined' ? window.innerHeight : 768,
  })

  React.useEffect(() => {
    const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0

    const update = () => {
      const w = window.innerWidth
      const h = window.innerHeight
      setState({
        isMobile: w < MOBILE_BREAKPOINT,
        isTouch: hasTouch,
        width: w,
        height: h,
      })
    }

    update()

    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    mql.addEventListener("change", update)
    window.addEventListener("resize", update)
    window.addEventListener("orientationchange", update)

    return () => {
      mql.removeEventListener("change", update)
      window.removeEventListener("resize", update)
      window.removeEventListener("orientationchange", update)
    }
  }, [])

  return state
}

/**
 * Simple boolean hook for backward compatibility
 * @returns true if screen width < 768px
 */
export function useIsMobile(): boolean {
  const { isMobile } = useMobile()
  return isMobile
}
