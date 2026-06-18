'use client'

import { useEffect, useRef, type CSSProperties, type ReactNode } from 'react'

type TextColor = 'black' | 'white'

const COLOR_MAP: Record<TextColor, string> = {
  black: '#0a0a0a',
  white: '#ffffff',
}

function readTextColor(value: string | null): TextColor {
  return value === 'white' ? 'white' : 'black'
}

function findTextColorAt(x: number, y: number): TextColor {
  if (document.body.classList.contains('overlay-open') || document.body.classList.contains('x-cursor-open')) return 'white'

  const elements = document.elementsFromPoint(x, y)

  for (const element of elements) {
    const section = element.closest<HTMLElement>('[data-textcolor]')
    if (section) return readTextColor(section.dataset.textcolor ?? null)
  }

  return 'black'
}

function findBoundaryY(x: number, top: number, bottom: number, topColor: TextColor) {
  let low = top
  let high = bottom

  for (let i = 0; i < 8; i++) {
    const mid = (low + high) / 2
    if (findTextColorAt(x, mid) === topColor) {
      low = mid
    } else {
      high = mid
    }
  }

  return low
}

export function NavMaskedText({
  children,
  className,
  style,
  watchKey,
}: {
  children: ReactNode
  className?: string
  style?: CSSProperties
  watchKey?: string | number
}) {
  const rootRef = useRef<HTMLSpanElement>(null)
  const maskRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const root = rootRef.current
    const mask = maskRef.current
    if (!root || !mask) return

    let frame = 0

    const update = () => {
      frame = 0
      const rect = root.getBoundingClientRect()
      if (rect.width <= 0 || rect.height <= 0) return

      const x = rect.left + rect.width / 2
      const topY = Math.max(0, Math.min(window.innerHeight - 1, rect.top + 1))
      const bottomY = Math.max(0, Math.min(window.innerHeight - 1, rect.bottom - 1))
      const topColor = findTextColorAt(x, topY)
      const bottomColor = findTextColorAt(x, bottomY)

      root.style.color = COLOR_MAP[bottomColor]

      if (topColor === bottomColor) {
        mask.style.color = COLOR_MAP[topColor]
        mask.style.clipPath = 'inset(0 0 100% 0)'
        mask.style.setProperty('-webkit-clip-path', 'inset(0 0 100% 0)')
        return
      }

      const boundaryY = findBoundaryY(x, rect.top, rect.bottom, topColor)
      const visibleTopRatio = Math.max(0, Math.min(1, (boundaryY - rect.top) / rect.height))
      const clip = `inset(0 0 ${100 - visibleTopRatio * 100}% 0)`

      mask.style.color = COLOR_MAP[topColor]
      mask.style.clipPath = clip
      mask.style.setProperty('-webkit-clip-path', clip)
    }

    const schedule = () => {
      if (frame) return
      frame = requestAnimationFrame(update)
    }

    schedule()
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)
    window.addEventListener('nav-mask-refresh', schedule)
    document.fonts?.ready.then(schedule).catch(() => {})

    return () => {
      if (frame) cancelAnimationFrame(frame)
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
      window.removeEventListener('nav-mask-refresh', schedule)
    }
  }, [watchKey])

  return (
    <span ref={rootRef} className={className} style={style}>
      <span className="nav__text-content">{children}</span>
      <span ref={maskRef} className="nav__mask" aria-hidden="true">{children}</span>
    </span>
  )
}