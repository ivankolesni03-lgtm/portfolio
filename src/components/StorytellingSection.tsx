'use client'
import { useRef, useEffect, useState } from 'react'
import Video from 'next-video'
import { useScroll } from '@/contexts/ScrollContext'
import { useLanguage } from '@/contexts/LanguageContext'

function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
}

export function StorytellingSection() {
  const { scrollY, vw, vh, mounted } = useScroll()
  const { language } = useLanguage()

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
      ([e]) => {
        if (e.isIntersecting) tryPlay()
        else v.pause()
      },
      { threshold: 0.05 }
    )
    obs.observe(v)
    return () => obs.disconnect()
  }, [])

  const PADDING = vw * 0.09
  const eased   = easeInOutCubic(progress)

  const headingO = 1
  const descriptor = language === 'de'
    ? 'Der zwischen dem Gewesenen\nund dem Werdenden\nErlebnisse schafft,\nin denen Code fühlbar wird\nund klassische Kommunikation\nmit KI zu etwas Neuem verschmilzt.'
    : 'Who creates moments\nbetween what was\nand what is becoming,\nin which code becomes tangible\nand classical communication\nmerges with AI into something new.'

  // ── MOBILE layout ──────────────────────────────────────────────────────────
  const MOB_FONT   = vw * 0.11
  const MOB_STORY_TOP = vh * 0.12
  const MOB_VID_H  = Math.max(80, vh * 0.28)
  const MOB_VID_W  = Math.min(vw * 0.88, MOB_VID_H * 2.4)
  const MOB_VID_L  = Math.max(10, vw - MOB_VID_W - vw * 0.05)
  const MOB_VID_T  = Math.max(12, MOB_STORY_TOP + MOB_FONT * 0.14)

  const mobFrameW = MOB_VID_W + (vw - MOB_VID_W) * eased
  const mobFrameH = MOB_VID_H + (vh - MOB_VID_H) * eased
  const mobFrameL = MOB_VID_L * (1 - eased)
  const mobFrameT = MOB_VID_T * (1 - eased)

  // ── DESKTOP layout ─────────────────────────────────────────────────────────
  const headingLeft = vw === 0 ? PADDING : vw * 0.08
  const headingTop  = vh === 0 ? PADDING : vh * 0.15
  const fieldBottom = 86
  const desktopHeadingPx = Math.min(132, Math.max(52, vw * 0.08))
  const vidNatH     = Math.max(120, vh * 0.38)
  const vidNatW     = Math.min(vw * 0.72, vidNatH * 2.4)
  const vidNatLeft  = Math.min(vw - vidNatW - 24, headingLeft + Math.min(vw * 0.56, desktopHeadingPx * 8))
  const vidNatTop   = headingTop + desktopHeadingPx * 1.2
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
      style={{ position: 'relative', height: '380vh', backgroundColor: '#0a0a0a', zIndex: 1 }}
    >
      <div style={{
        position: 'sticky', top: 0, height: '100vh', width: '100%', overflow: 'hidden',
        opacity: mounted ? 1 : 0,
      }}>

        <div
          style={{
            position: 'absolute',
            top:  isMobile ? '12vh' : '15vh',
            left: isMobile ? '5vw' : '8vw',
            right: isMobile ? '5vw' : '24vw',
            textAlign: isMobile ? 'center' : 'left',
            pointerEvents: 'none', zIndex: 5,
            opacity: headingO,
            filter: exitBlur > 0.1 ? `blur(${exitBlur}px)` : 'none',
            transition: 'filter 0.05s linear',
          }}
        >
          <div style={{
            fontSize: headingSize, fontWeight: 900,
            lineHeight: 0.9, letterSpacing: headingLetterSp,
            textTransform: 'uppercase', color: '#ffffff', userSelect: 'none',
            whiteSpace: 'pre-line',
            textShadow: '0 12px 36px rgba(0,0,0,0.34)',
          }}>Experience Designer</div>
        </div>

        <div style={{
          position: 'absolute',
          left: isMobile ? '5vw' : '42vw',
          bottom: isMobile ? '8vh' : '10vh',
          textAlign: 'left',
          pointerEvents: 'none',
          zIndex: 5,
          filter: exitBlur > 0.1 ? `blur(${exitBlur}px)` : 'none',
          transition: 'filter 0.05s linear',
          maxWidth: isMobile ? '92vw' : '46vw',
        }}>
          <div style={{
            fontSize: isMobile ? '4.5vw' : 'clamp(20px,2vw,34px)',
            fontWeight: 400,
            lineHeight: 1.3,
            letterSpacing: '0px',
            textTransform: 'none',
            whiteSpace: 'pre-line',
            color: '#ffffff',
            textShadow: '0 10px 24px rgba(0,0,0,0.32)',
            userSelect: 'none',
          }}>{descriptor.split('\n').map((line, i) => {
            const offset = ((i * 17 + 7) % 11) * 0.3 + 0.2
            return (
              <span key={i} style={{ display: 'block', paddingLeft: `${offset}vw` }}>
                {line}
              </span>
            )
          })}</div>
        </div>

        {/* Video frame with logo mask */}
        {(() => {
          // Logo bleibt zentriert, nur der Zoom läuft mit einer Kurve.
          const maskScale = 0.52 + eased * 0.5
          const maskSize = `${maskScale * 100}%`
          const maskPos = '50% 50%'
          return (
            <div style={{
              position: 'absolute',
              inset: 0,
              overflow: 'hidden', zIndex: 2,
              filter: exitBlur > 0.1 ? `blur(${exitBlur}px)` : 'none',
              transition: 'filter 0.05s linear',
              maskImage: `url(/icons/logo.svg)`,
              WebkitMaskImage: `url(/icons/logo.svg)`,
              maskRepeat: 'no-repeat',
              WebkitMaskRepeat: 'no-repeat',
              maskPosition: maskPos,
              WebkitMaskPosition: maskPos,
              maskSize,
              WebkitMaskSize: maskSize,
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
          )
        })()}

      </div>
    </div>
  )
}