'use client'
import { useRef, useEffect, useState } from 'react'
import Video from 'next-video'
import { useScroll } from '@/contexts/ScrollContext'

function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
}

export function StorytellingSection() {
  const { scrollY, vw, vh, mounted } = useScroll()

  const sectionRef = useRef<HTMLDivElement>(null)
  const videoRef   = useRef<HTMLVideoElement>(null)

  const [progress, setProgress] = useState(0)
  const [exitBlur, setExitBlur] = useState(0)
  
  const isMobile = vw < 768

  useEffect(() => {
    if (!mounted) return
    const sec = sectionRef.current; if (!sec) return
    const scrolled = -sec.getBoundingClientRect().top
    const total    = sec.offsetHeight - vh
    setProgress(Math.max(0, Math.min(1, scrolled / (total * 0.4))))
    const exitP = Math.max(0, Math.min(1, (scrolled - total * 0.62) / (total * 0.38)))
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

  const headingO = 1

  // ── MOBILE layout ──────────────────────────────────────────────────────────
  const MOB_FONT   = vw * 0.11
  const MOB_STORY_TOP = vh * 0.12
  const MOB_VID_H  = Math.max(30, MOB_FONT * 0.8)
  const MOB_VID_W  = Math.min(vw * 0.88, MOB_VID_H * 7.8)
  const MOB_VID_L  = Math.max(10, vw - MOB_VID_W - vw * 0.05)
  const MOB_VID_T  = Math.max(12, MOB_STORY_TOP + MOB_FONT * 0.14)

  const mobFrameW = MOB_VID_W + (vw - MOB_VID_W) * eased
  const mobFrameH = MOB_VID_H + (vh - MOB_VID_H) * eased
  const mobFrameL = MOB_VID_L * (1 - eased)
  const mobFrameT = MOB_VID_T * (1 - eased)

  // ── DESKTOP layout ─────────────────────────────────────────────────────────
  const headingLeft = vw === 0 ? PADDING : vw * 0.08
  const headingTop  = vh === 0 ? PADDING : vh * 0.15
  const fieldBottom = vw === 0 ? 34 : Math.max(34, vw * 0.042)
  const desktopHeadingPx = Math.min(132, Math.max(52, vw * 0.08))
  const vidNatH     = Math.max(44, desktopHeadingPx * 0.78)
  const vidNatW     = Math.min(vw * 0.55, vidNatH * 9.5)
  const vidNatLeft  = Math.min(vw - vidNatW - 24, headingLeft + Math.min(vw * 0.57, desktopHeadingPx * 8.2))
  const vidNatTop   = headingTop + desktopHeadingPx * 0.08
  const frameW      = vw === 0 ? vidNatW : vidNatW + (vw - vidNatW) * eased
  const frameH      = vh === 0 ? vidNatH : vidNatH + (vh - vidNatH) * eased
  const frameL      = vidNatLeft * (1 - eased)
  const frameT      = vidNatTop  * (1 - eased)

  // pick values based on device
  const fW = isMobile ? mobFrameW : frameW
  const fH = isMobile ? mobFrameH : frameH
  const fL = isMobile ? mobFrameL : frameL
  const fT = isMobile ? mobFrameT : frameT
  const headingSize = isMobile ? '11vw' : 'clamp(52px,8vw,132px)'
  const headingLetterSp = isMobile ? '-2px' : '-2px'

  return (
    <div
      ref={sectionRef}
      id="storytelling"
      style={{ position: 'relative', height: '250vh', backgroundColor: '#0a0a0a', zIndex: 1 }}
    >
      <div style={{
        position: 'sticky', top: 0, height: '100vh', width: '100%', overflow: 'hidden',
        opacity: mounted ? 1 : 0,
      }}>

        <div
          style={{
            position: 'absolute',
            top:  isMobile ? MOB_STORY_TOP : headingTop,
            left: isMobile ? '5vw' : headingLeft,
            right: isMobile ? '5vw' : '24vw',
            textAlign: isMobile ? 'center' : 'left',
            pointerEvents: 'none', zIndex: 5,
            opacity: headingO,
          }}
        >
          <div style={{
            fontSize: headingSize, fontWeight: 900,
            lineHeight: 0.9, letterSpacing: headingLetterSp,
            textTransform: 'uppercase', color: '#ffffff', userSelect: 'none',
            whiteSpace: 'pre-line',
            textShadow: '0 12px 36px rgba(0,0,0,0.34)',
          }}>Experience Design</div>
        </div>

        <div style={{
          position: 'absolute',
          top: isMobile ? 'auto' : 'auto',
          bottom: isMobile ? 'clamp(18px,4vw,36px)' : fieldBottom,
          left: isMobile ? '5vw' : headingLeft,
          right:  isMobile ? '5vw' : '24vw',
          textAlign: 'left',
          pointerEvents: 'none', zIndex: 5,
          opacity: headingO,
        }}>
          <div style={{
            display: 'inline-block',
            fontSize: isMobile ? '5.2vw' : 'clamp(24px,3vw,52px)',
            fontWeight: 800,
            lineHeight: 0.95,
            letterSpacing: '-0.6px',
            textTransform: 'uppercase',
            color: '#ffffff',
            textShadow: '0 10px 24px rgba(0,0,0,0.32)',
            userSelect: 'none',
          }}>THE FUTURE FEELS DIFFERENT</div>
        </div>

        {/* Video frame */}
        <div style={{
          position: 'absolute',
          top: fT, left: fL, width: fW, height: fH,
          borderRadius: 0,
          overflow: 'hidden', zIndex: 2,
          filter: exitBlur > 0.1 ? `blur(${exitBlur}px)` : 'none',
          transition: 'filter 0.05s linear',
          boxShadow: progress < 0.95
            ? `0 ${20*(1-eased)}px ${60*(1-eased)}px rgba(0,0,0,0.7)`
            : 'none',
        }}>
          <Video
            ref={videoRef}
            src="public/videos/storytelling.mp4"
            preload="auto"
            loop muted playsInline autoPlay
            suppressHydrationWarning
            controls={false}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
        </div>

      </div>
    </div>
  )
}