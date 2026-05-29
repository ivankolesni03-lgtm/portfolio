'use client'
import { useRef, useEffect, useState } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'
import { useScroll } from '@/contexts/ScrollContext'

function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
}

export function StorytellingSection() {
  const { language } = useLanguage()
  const lang = language as 'de' | 'en'
  const { scrollY, vw, vh, mounted } = useScroll()

  const sectionRef = useRef<HTMLDivElement>(null)
  const videoRef   = useRef<HTMLVideoElement>(null)
  const headingRef = useRef<HTMLDivElement>(null)

  const [progress, setProgress] = useState(0)
  const [exitBlur, setExitBlur] = useState(0)
  const [textH, setTextH] = useState(0)
  
  const isMobile = vw < 768

  useEffect(() => {
    if (headingRef.current) setTextH(headingRef.current.offsetHeight)
  }, [vw])

  useEffect(() => {
    if (!mounted) return
    const sec = sectionRef.current; if (!sec) return
    const scrolled = -sec.getBoundingClientRect().top
    const total    = sec.offsetHeight - vh
    setProgress(Math.max(0, Math.min(1, scrolled / (total * 0.4))))
    const exitP = Math.max(0, Math.min(1, (scrolled - total * 0.82) / (total * 0.18)))
    setExitBlur(exitP * 28)
  }, [scrollY, vh, mounted])

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
  // On mobile: STORY and TELLING centered, closer to video
  // Video: wider but shorter (ultra-wide aspect ratio)
  const MOB_PAD    = vw * 0.06
  const MOB_FONT   = vw * 0.18   // larger font for storytelling (18vw)
  const MOB_VID_W  = vw * 0.82   // wider video (82% of viewport)
  const MOB_VID_H  = MOB_VID_W * (1 / 4)  // ultra-wide aspect ratio (4:1)
  const MOB_VID_L  = (vw - MOB_VID_W) / 2  // centered horizontally
  const MOB_VID_T  = vh === 0 ? 160 : (vh - MOB_VID_H) / 2

  // Text positioning for mobile - TELLING has more gap
  const MOB_STORY_GAP = vw * 0.04  // gap between STORY and video
  const MOB_TELLING_GAP = vw * 0.08  // larger gap between TELLING and video
  const MOB_STORY_TOP = MOB_VID_T - MOB_FONT - MOB_STORY_GAP
  const MOB_TELLING_TOP = MOB_VID_T + MOB_VID_H + MOB_TELLING_GAP

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
  const fontSize = isMobile ? `${MOB_FONT}px` : '14vw'
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
        opacity: mounted ? 1 : 0,
      }}>

        {/* STORY – top left on desktop, centered above video on mobile */}
        <div
          ref={headingRef}
          style={{
            position: 'absolute',
            top:  isMobile ? MOB_STORY_TOP : headingTop,
            left: isMobile ? 0 : headingLeft,
            right: isMobile ? 0 : 'auto',
            textAlign: isMobile ? 'center' : 'left',
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

        {/* TELLING – bottom right on desktop, centered below video on mobile */}
        <div style={{
          position: 'absolute',
          top: isMobile ? MOB_TELLING_TOP : 'auto',
          bottom: isMobile ? 'auto' : headingTop * 0.7,
          left: isMobile ? 0 : 'auto',
          right:  isMobile ? 0 : headingLeft,
          textAlign: isMobile ? 'center' : 'right',
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
            preload="auto"
            loop muted playsInline autoPlay
            suppressHydrationWarning
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
        </div>

      </div>
    </div>
  )
}