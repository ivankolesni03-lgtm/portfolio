'use client'
import { useState, useRef, useEffect } from 'react'
import { useScroll } from '@/contexts/ScrollContext'
import { ProjectsMarquee, ViewCursor } from '@/components/ProjectsSection'

export function MiniProjekteSection() {
  const { scrollY, vh, vw } = useScroll()
  const spacerRef = useRef<HTMLDivElement>(null)
  const [progress, setProgress] = useState(0)
  const [hoverMini, setHoverMini] = useState(false)
  const [aiVisible, setAiVisible] = useState(false)
  
  const isMobile = vw < 768

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

  // Detect AI section entering viewport → disable ViewCursor
  useEffect(() => {
    const aiEl = document.getElementById('ai-section')
    if (!aiEl) return
    const obs = new IntersectionObserver(
      ([entry]) => setAiVisible(entry.isIntersecting),
      { threshold: 0.01 }
    )
    obs.observe(aiEl)
    return () => obs.disconnect()
  }, [])

  const endBlurStart = 0.10
  const endBlurT = Math.max(0, Math.min(1, (progress - endBlurStart) / (1 - endBlurStart)))
  const endBlurPx = endBlurT * (isMobile ? 18 : 26)
  const endDim = endBlurT * (isMobile ? 0.34 : 0.48)

  const showCursor = hoverMini && !aiVisible

  return (
    <>
      <div id="mini-projekte-section" ref={spacerRef} data-textcolor="black" style={{ height: isMobile ? '460vh' : '560vh', backgroundColor:'#ffffff', position:'relative', zIndex:30, marginTop: isMobile ? '-130vh' : '-220vh' }}>
        <div style={{ position: 'sticky', top: 0, height: '100vh', width: '100%', backgroundColor: '#ffffff', overflowX: 'clip', overflowY: 'visible' }}>
          <div style={{
            opacity: 1,
            transition: 'opacity 0.15s linear',
            filter: endBlurPx > 0.05 ? `blur(${endBlurPx}px)` : 'none',
            transform: `scale(${1 - endDim * 0.05})`,
            transformOrigin: 'center top',
            willChange: 'filter, transform',
          }}>
            <ProjectsMarquee embedded statProgress={progress} onHoverCards={setHoverMini} />
          </div>
        </div>
      </div>
      <ViewCursor show={showCursor} />
    </>
  )
}
