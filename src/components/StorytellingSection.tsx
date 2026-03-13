'use client'
import { useRef, useEffect, useState } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'

function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
}

export function StorytellingSection() {
  const { language } = useLanguage()
  const lang = language as 'de' | 'en'

  const sectionRef  = useRef<HTMLDivElement>(null)
  const videoRef    = useRef<HTMLVideoElement>(null)
  const headingRef  = useRef<HTMLDivElement>(null)

  const [progress, setProgress] = useState(0)
  const [exitBlur, setExitBlur] = useState(0)
  const [vw, setVw] = useState(0)
  const [vh, setVh] = useState(0)
  const [textH, setTextH] = useState(0)

  useEffect(() => {
    const update = () => {
      setVw(window.innerWidth)
      setVh(window.innerHeight)
      if (headingRef.current) setTextH(headingRef.current.offsetHeight)
    }
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  // measure heading height after fonts load
  useEffect(() => {
    if (headingRef.current) setTextH(headingRef.current.offsetHeight)
  }, [vw])

  useEffect(() => {
    const fn = () => {
      const sec = sectionRef.current; if (!sec) return
      const scrolled = -sec.getBoundingClientRect().top
      const total    = sec.offsetHeight - window.innerHeight
      setProgress(Math.max(0, Math.min(1, scrolled / (total * 0.4))))
      // exit blur: starts at 85% of scroll, fully blurred at 100%
      const exitP = Math.max(0, Math.min(1, (scrolled - total * 0.82) / (total * 0.18)))
      setExitBlur(exitP * 28)
    }
    window.addEventListener('scroll', fn, { passive: true }); fn()
    return () => window.removeEventListener('scroll', fn)
  }, [])

  useEffect(() => {
    const v = videoRef.current; if (!v) return
    v.muted = true
    v.setAttribute('muted', '')
    v.setAttribute('playsinline', '')
    const tryPlay = () => v.play().catch(() => {})
    if (v.readyState >= 2) {
      tryPlay()
    } else {
      v.addEventListener('canplay', tryPlay, { once: true })
    }
    const obs = new IntersectionObserver(
      ([e]) => { e.isIntersecting ? tryPlay() : v.pause() },
      { threshold: 0.05 }
    )
    obs.observe(v)
    return () => obs.disconnect()
  }, [])

  const PADDING = vw * 0.09
  const eased   = easeInOutCubic(progress)

  // Heading: top-left at 9vw / 9vw
  const headingLeft = PADDING
  const headingTop  = PADDING

  // Video initial: starts right of heading text block
  // left edge = heading left + heading width (32vw) + gap (2vw)
  // Video: wide flat bar, vertically centered between STORY top and TELLING bottom
  const vidNatLeft  = vw === 0 ? 400 : PADDING + vw * 0.18
  const vidNatW     = vw === 0 ? 440 : vw - (PADDING + vw * 0.32 + vw * 0.03) - PADDING * 1.2
  const vidNatH     = textH > 20 ? textH : (vw === 0 ? 240 : vw * 0.22 * 2)
  // center between headingTop (STORY top) and bottom edge of TELLING (vh - headingTop*0.7 - textH*0.88)
  const tellingBottom = vh === 0 ? 0 : vh - PADDING * 0.7 - vidNatH * 0.5
  const vidNatTop   = vh === 0 ? 200 : (headingTop + tellingBottom) / 2 - vidNatH / 2 + vh * 0.04

  // Expanded: fills full viewport from top-left
  const frameW   = vw === 0 ? vidNatW : vidNatW + (vw - vidNatW) * eased
  const frameH   = vh === 0 ? vidNatH : vidNatH + (vh - vidNatH) * eased
  const frameL   = vidNatLeft * (1 - eased)
  const frameT   = vidNatTop  * (1 - eased)
  const radius   = 8 * (1 - eased)

  const headingO   = Math.max(0, 1 - Math.max(0, progress - 0.3) / 0.35)
  const headingBlur = Math.max(0, (progress - 0.3) / 0.35) * 14
  // no overlay – video keeps original colors

  return (
    <div
      ref={sectionRef}
      id="storytelling"
      style={{ position: 'relative', height: '450vh', backgroundColor: '#0a0a0a', zIndex: 1 }}
    >
      <div style={{
        position: 'sticky', top: 0, height: '100vh', width: '100%', overflow: 'hidden',
        filter: exitBlur > 0.1 ? `blur(${exitBlur}px)` : 'none',
        transition: 'filter 0.05s linear',
      }}>

        {/* STORY – top left */}
        <div
          ref={headingRef}
          style={{
            position: 'absolute',
            top:  headingTop,
            left: headingLeft,
            pointerEvents: 'none',
            zIndex: 5,
            opacity: headingO,
            filter: headingBlur > 0.1 ? `blur(${headingBlur}px)` : 'none',
          }}
        >
          <div style={{
            fontSize: '14vw', fontWeight: 900,
            lineHeight: 0.88, letterSpacing: '-3px',
            textTransform: 'uppercase', color: '#ffffff', userSelect: 'none',
          }}>Story</div>
        </div>

        {/* TELLING – bottom right */}
        <div style={{
          position: 'absolute',
          bottom: headingTop * 0.7,
          right:  headingLeft,
          pointerEvents: 'none',
          zIndex: 5,
          opacity: headingO,
          filter: headingBlur > 0.1 ? `blur(${headingBlur}px)` : 'none',
        }}>
          <div style={{
            fontSize: '14vw', fontWeight: 900,
            lineHeight: 0.88, letterSpacing: '-3px',
            textTransform: 'uppercase', color: '#ffffff', userSelect: 'none',
          }}>telling</div>
        </div>

        {/* Video frame */}
        <div style={{
          position: 'absolute',
          top:    frameT,
          left:   frameL,
          width:  frameW,
          height: frameH,
          borderRadius: radius,
          overflow: 'hidden',
          zIndex: 10,
          boxShadow: progress < 0.95
            ? `0 ${20*(1-eased)}px ${60*(1-eased)}px rgba(0,0,0,0.7)`
            : 'none',
        }}>
          <video
            ref={videoRef}
            src="/videos/storytelling.mp4"
            loop playsInline
            suppressHydrationWarning
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />

        </div>

      </div>
    </div>
  )
}