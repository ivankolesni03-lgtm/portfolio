'use client'
import { useRef, useEffect, useState } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'

function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
}

export function StorytellingSection() {
  const { language } = useLanguage()
  const lang = language as 'de' | 'en'

  const sectionRef = useRef<HTMLDivElement>(null)
  const videoRef   = useRef<HTMLVideoElement>(null)
  const headingRef = useRef<HTMLDivElement>(null)

  const [progress, setProgress] = useState(0)
  const [exitBlur, setExitBlur] = useState(0)
  const [vw, setVw]     = useState(0)
  const [vh, setVh]     = useState(0)
  const [textH, setTextH] = useState(0)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const update = () => {
      setVw(window.innerWidth)
      setVh(window.innerHeight)
      setIsMobile(window.innerWidth < 768)
      if (headingRef.current) setTextH(headingRef.current.offsetHeight)
    }
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  useEffect(() => {
    if (headingRef.current) setTextH(headingRef.current.offsetHeight)
  }, [vw])

  useEffect(() => {
    const fn = () => {
      const sec = sectionRef.current; if (!sec) return
      const scrolled = -sec.getBoundingClientRect().top
      const total    = sec.offsetHeight - window.innerHeight
      setProgress(Math.max(0, Math.min(1, scrolled / (total * 0.4))))
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
    v.setAttribute('autoplay', '')
    const tryPlay = () => { v.muted = true; return v.play().catch(() => {}) }
    tryPlay()
    v.addEventListener('loadeddata', tryPlay, { once: true })
    v.addEventListener('canplay',    tryPlay, { once: true })
    const obs = new IntersectionObserver(
      ([e]) => { e.isIntersecting ? tryPlay() : v.pause() },
      { threshold: 0.05 }
    )
    obs.observe(v)
    return () => obs.disconnect()
  }, [])

  const PADDING = vw * 0.09
  const eased   = easeInOutCubic(progress)

  const headingO    = Math.max(0, 1 - Math.max(0, progress - 0.3) / 0.35)
  const headingBlur = Math.max(0, (progress - 0.3) / 0.35) * 14

  // ── MOBILE layout ──────────────────────────────────────────────────────────
  // On mobile: STORY top-left, TELLING bottom-right (smaller font)
  // Video: full width, centered vertically between the two words
  const MOB_PAD    = vw * 0.06
  const MOB_FONT   = vw * 0.18   // ~18vw
  const MOB_VID_W  = vw - MOB_PAD * 2
  const MOB_VID_H  = MOB_VID_W * (9 / 16)
  const MOB_VID_L  = MOB_PAD
  const MOB_VID_T  = vh === 0 ? 160 : (vh - MOB_VID_H) / 2

  const mobFrameW = MOB_VID_W + (vw - MOB_VID_W) * eased
  const mobFrameH = MOB_VID_H + (vh - MOB_VID_H) * eased
  const mobFrameL = MOB_VID_L * (1 - eased)
  const mobFrameT = MOB_VID_T * (1 - eased)

  // ── DESKTOP layout ─────────────────────────────────────────────────────────
  const headingLeft = PADDING
  const headingTop  = PADDING
  const vidNatLeft  = vw === 0 ? 400 : PADDING + vw * 0.18
  const vidNatW     = vw === 0 ? 440 : vw - (PADDING + vw * 0.32 + vw * 0.03) - PADDING * 1.2
  const vidNatH     = textH > 20 ? textH : (vw === 0 ? 240 : vw * 0.22 * 2)
  const tellingBottom = vh === 0 ? 0 : vh - PADDING * 0.7 - vidNatH * 0.5
  const vidNatTop   = vh === 0 ? 200 : (headingTop + tellingBottom) / 2 - vidNatH / 2 + vh * 0.04
  const frameW      = vw === 0 ? vidNatW : vidNatW + (vw - vidNatW) * eased
  const frameH      = vh === 0 ? vidNatH : vidNatH + (vh - vidNatH) * eased
  const frameL      = vidNatLeft * (1 - eased)
  const frameT      = vidNatTop  * (1 - eased)

  const radius = 8 * (1 - eased)

  // pick values based on device
  const fW = isMobile ? mobFrameW : frameW
  const fH = isMobile ? mobFrameH : frameH
  const fL = isMobile ? mobFrameL : frameL
  const fT = isMobile ? mobFrameT : frameT
  const fontSize = isMobile ? `${vw * 0.18}px` : '14vw'
  const letterSp = isMobile ? '-1px' : '-3px'

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
            top:  isMobile ? MOB_PAD : headingTop,
            left: isMobile ? MOB_PAD : headingLeft,
            pointerEvents: 'none', zIndex: 5,
            opacity: headingO,
            filter: headingBlur > 0.1 ? `blur(${headingBlur}px)` : 'none',
          }}
        >
          <div style={{
            fontSize, fontWeight: 900,
            lineHeight: 0.88, letterSpacing: letterSp,
            textTransform: 'uppercase', color: '#ffffff', userSelect: 'none',
          }}>Story</div>
        </div>

        {/* TELLING – bottom right */}
        <div style={{
          position: 'absolute',
          bottom: isMobile ? MOB_PAD : headingTop * 0.7,
          right:  isMobile ? MOB_PAD : headingLeft,
          pointerEvents: 'none', zIndex: 5,
          opacity: headingO,
          filter: headingBlur > 0.1 ? `blur(${headingBlur}px)` : 'none',
        }}>
          <div style={{
            fontSize, fontWeight: 900,
            lineHeight: 0.88, letterSpacing: letterSp,
            textTransform: 'uppercase', color: '#ffffff', userSelect: 'none',
          }}>telling</div>
        </div>

        {/* Video frame */}
        <div style={{
          position: 'absolute',
          top: fT, left: fL, width: fW, height: fH,
          borderRadius: radius,
          overflow: 'hidden', zIndex: 10,
          boxShadow: progress < 0.95
            ? `0 ${20*(1-eased)}px ${60*(1-eased)}px rgba(0,0,0,0.7)`
            : 'none',
        }}>
          <video
            ref={videoRef}
            src="/videos/storytelling.mp4"
            loop muted playsInline autoPlay
            suppressHydrationWarning
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
        </div>

      </div>
    </div>
  )
}