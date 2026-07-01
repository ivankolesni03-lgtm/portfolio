'use client'
import { useState, useRef, useEffect } from 'react'
import { useScroll } from '@/contexts/ScrollContext'
import { ProjectsMarquee, ViewCursor } from '@/components/ProjectsSection'

export function StatsSection() {
  const { scrollY, vh, isMobile } = useScroll()
  const spacerRef = useRef<HTMLDivElement>(null)
  const [progress, setProgress] = useState(0)
  const [hoverMini, setHoverMini] = useState(false)
  
  useEffect(() => {
    const el = spacerRef.current; if (!el) return
    const rect = el.getBoundingClientRect()
    const scrolled = -rect.top

    const total = el.offsetHeight - vh
    const earlyOffset = vh * 0.15
    const statsT = total > 0 ? Math.max(0, Math.min(1, (scrolled + earlyOffset) / (total + earlyOffset))) : 0

    const frame = requestAnimationFrame(() => setProgress(statsT))
    return () => cancelAnimationFrame(frame)
  }, [scrollY, vh])

  const endBlurStart = 0.70
  const endBlurT = Math.max(0, Math.min(1, (progress - endBlurStart) / (1 - endBlurStart)))
  const endBlurPx = endBlurT * 18
  const endDim = endBlurT * 0.35

  return (
    <>
      <div ref={spacerRef} onMouseEnter={() => setHoverMini(true)} onMouseLeave={() => setHoverMini(false)} style={{ height: isMobile ? '520vh' : '560vh', backgroundColor:'#ffffff', position:'relative', zIndex:30, marginTop: isMobile ? '-240vh' : '-295vh' }}>
        <div style={{ position: 'sticky', top: 0, height: 'var(--app-visual-height, 100svh)', width: '100%', backgroundColor: '#ffffff', overflowX: 'clip', overflowY: 'visible' }}>
          <div style={{
            opacity: 1,
            transition: 'opacity 0.15s linear',
            filter: endBlurPx > 0.05 ? `blur(${endBlurPx}px)` : 'none',
            transform: `scale(${1 - endDim * 0.05})`,
            transformOrigin: 'center top',
            willChange: 'filter, transform',
          }}>
            <ProjectsMarquee embedded statProgress={progress} />
          </div>
        </div>
      </div>
      <ViewCursor show={hoverMini} />
    </>
  )
}