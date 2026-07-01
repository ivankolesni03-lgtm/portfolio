import * as React from "react"

export const MOBILE_BREAKPOINT = 768
export const TABLET_BREAKPOINT = 1024
export const DESKTOP_BREAKPOINT = 1280

export const BREAKPOINTS = {
  mobile: MOBILE_BREAKPOINT,
  tablet: TABLET_BREAKPOINT,
  desktop: DESKTOP_BREAKPOINT,
} as const

interface MobileState {
  isMobile: boolean
  isTablet: boolean
  isDesktop: boolean
  isShort: boolean
  isLandscape: boolean
  isPortrait: boolean
  isTouch: boolean
  hasFinePointer: boolean
  width: number
  height: number
  visualHeight: number
}

function getViewportState(): MobileState {
  if (typeof window === 'undefined') {
    return {
      isMobile: false,
      isTablet: false,
      isDesktop: true,
      isShort: false,
      isLandscape: true,
      isPortrait: false,
      isTouch: false,
      hasFinePointer: true,
      width: 1024,
      height: 768,
      visualHeight: 768,
    }
  }

  const width = window.innerWidth
  const height = window.innerHeight
  const visualHeight = Math.round(window.visualViewport?.height ?? height)
  const hasFinePointer = window.matchMedia('(pointer: fine)').matches
  const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0 || window.matchMedia('(pointer: coarse)').matches

  return {
    isMobile: width < MOBILE_BREAKPOINT,
    isTablet: width >= MOBILE_BREAKPOINT && width < TABLET_BREAKPOINT,
    isDesktop: width >= TABLET_BREAKPOINT,
    isShort: visualHeight < 620,
    isLandscape: width > height,
    isPortrait: height >= width,
    isTouch,
    hasFinePointer,
    width,
    height,
    visualHeight,
  }
}

function setViewportCssVars({ height, visualHeight, width }: MobileState) {
  if (typeof document === 'undefined') return
  const root = document.documentElement
  root.style.setProperty('--app-height', `${height}px`)
  root.style.setProperty('--app-visual-height', `${visualHeight}px`)
  root.style.setProperty('--app-width', `${width}px`)
}

/**
 * Comprehensive mobile detection hook with resize handling
 * @returns Object with isMobile, isTouch, width, height
 */
export function useMobile(): MobileState {
  const [state, setState] = React.useState<MobileState>(() => getViewportState())

  React.useEffect(() => {
    const update = () => {
      const next = getViewportState()
      setViewportCssVars(next)
      setState(next)
    }

    update()

    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const tabletMql = window.matchMedia(`(max-width: ${TABLET_BREAKPOINT - 1}px)`)
    const pointerMql = window.matchMedia('(pointer: coarse)')
    mql.addEventListener("change", update)
    tabletMql.addEventListener("change", update)
    pointerMql.addEventListener("change", update)
    window.addEventListener("resize", update)
    window.addEventListener("orientationchange", update)
    window.visualViewport?.addEventListener("resize", update)
    window.visualViewport?.addEventListener("scroll", update)

    return () => {
      mql.removeEventListener("change", update)
      tabletMql.removeEventListener("change", update)
      pointerMql.removeEventListener("change", update)
      window.removeEventListener("resize", update)
      window.removeEventListener("orientationchange", update)
      window.visualViewport?.removeEventListener("resize", update)
      window.visualViewport?.removeEventListener("scroll", update)
    }
  }, [])

  return state
}

export const useViewport = useMobile

/**
 * Simple boolean hook for backward compatibility
 * @returns true if screen width < 768px
 */
export function useIsMobile(): boolean {
  const { isMobile } = useMobile()
  return isMobile
}
