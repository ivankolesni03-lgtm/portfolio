'use client'

import { useState, useRef, useCallback, useEffect, useMemo } from 'react'
import { useMobile } from '@/hooks/use-mobile'
import { useScroll } from '@/contexts/ScrollContext'
import { useLanguage } from '@/contexts/LanguageContext'
import { startScramble } from '@/lib/scramble'
import { getIntroLayout } from '@/lib/intro-layout'
import { NavMaskedText } from '@/components/NavMaskedText'

const chars = "!@#$%&*АБВГДЕЖЗИКЛМНОПРСТУФХЦЧШЩЭЮЯ01"

const images = [
  "/photos/hero-photo-1.JPG",
  "/photos/hero-photo-2.JPG",
  "/photos/hero-photo-3.JPG",
  "/photos/hero-photo-4.JPG",
  "/photos/hero-photo-5.JPG",
  "/photos/hero-photo-6.JPG",
  "/photos/hero-photo-7.JPG",
  "/photos/hero-photo-8.JPG",
  "/photos/hero-photo-9.JPG",
  "/photos/hero-photo-10.JPG",
  "/photos/hero-photo-11.JPG",
  "/photos/hero-photo-12.JPG",
  "/photos/hero-photo-13.JPG",
  "/photos/hero-photo-14.JPG",
  "/photos/hero-photo-15.JPG",
  "/photos/hero-photo-16.JPG",
  "/photos/hero-photo-17.JPG",
  "/photos/hero-photo-18.JPG",
  "/photos/hero-photo-19.JPG",
  "/photos/hero-photo-20.JPG",
  "/photos/hero-photo-21.JPG",
  "/photos/hero-photo-22.JPG",
  "/photos/hero-photo-23.JPG",
  "/photos/hero-photo-24.JPG",
  "/photos/hero-photo-25.JPG",
  "/photos/hero-photo-26.JPG",
  "/photos/hero-photo-27.JPG",
  "/photos/hero-photo-28.JPG",
  "/photos/hero-photo-29.JPG",
  "/photos/hero-photo-30.JPG",
  "/photos/hero-photo-31.JPG",
  "/photos/hero-photo-32.JPG",
  "/photos/hero-photo-33.JPG",
  "/photos/hero-photo-34.JPG",
  "/photos/hero-photo-35.JPG",
  "/photos/hero-photo-36.JPG",
  "/photos/hero-photo-37.JPG",
]

const sizes = [
  { width: 85, height: 60 },
  { width: 60, height: 85 },
  { width: 110, height: 75 },
  { width: 75, height: 110 },
  { width: 140, height: 95 },
  { width: 95, height: 140 },
  { width: 175, height: 120 },
  { width: 120, height: 175 },
  { width: 220, height: 150 },
  { width: 150, height: 220 },
  { width: 270, height: 180 },
  { width: 180, height: 270 },
  { width: 330, height: 220 },
  { width: 220, height: 330 },
  { width: 400, height: 270 },
  { width: 270, height: 400 },
  { width: 500, height: 340 },
  { width: 340, height: 500 },
]

const sizesMobile = [
  { width: 80, height: 56 },
  { width: 56, height: 80 },
  { width: 110, height: 75 },
  { width: 75, height: 110 },
  { width: 140, height: 95 },
  { width: 95, height: 140 },
  { width: 170, height: 115 },
  { width: 115, height: 170 },
]

interface TrailImage {
  id: number
  src: string
  x: number
  y: number
  width: number
  height: number
}

function PixelTrailImage({ img, blur = 0 }: { img: TrailImage; blur?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const imgRef = useRef<HTMLImageElement | null>(null)
  const rafRef = useRef<number | null>(null)
  const startTimeRef = useRef<number>(Date.now())
  const DURATION = 2500

  useEffect(() => {
    const image = new window.Image()
    image.src = img.src
    image.onload = () => {
      imgRef.current = image
      animate()
    }

    const animate = () => {
      const canvas = canvasRef.current
      if (!canvas) return
      const ctx = canvas.getContext('2d')
      if (!ctx || !imgRef.current) return

      const elapsed = Date.now() - startTimeRef.current
      const t = Math.min(1, elapsed / DURATION)

      canvas.width = img.width
      canvas.height = img.height
      ctx.clearRect(0, 0, img.width, img.height)

      let opacity = 1
      let pixelSize = 1

      if (t < 0.08) {
        opacity = t / 0.08
      } else if (t < 0.75) {
        opacity = 1
        pixelSize = 1
      } else {
        const exitT = (t - 0.75) / 0.25
        opacity = 1 - exitT
        pixelSize = 1 + exitT * 23
      }

      ctx.globalAlpha = Math.max(0, opacity)

      const srcW = imgRef.current.naturalWidth
      const srcH = imgRef.current.naturalHeight
      const srcAspect = srcW / srcH
      const dstAspect = img.width / img.height
      let sx = 0, sy = 0, sw2 = srcW, sh2 = srcH
      if (srcAspect > dstAspect) {
        sw2 = srcH * dstAspect
        sx = (srcW - sw2) / 2
      } else {
        sh2 = srcW / dstAspect
        sy = (srcH - sh2) / 2
      }

      if (pixelSize <= 1.5) {
        ctx.imageSmoothingEnabled = true
        ctx.drawImage(imgRef.current, sx, sy, sw2, sh2, 0, 0, img.width, img.height)
      } else {
        const pw = Math.max(1, Math.floor(img.width / pixelSize))
        const ph = Math.max(1, Math.floor(img.height / pixelSize))
        const tmp = document.createElement('canvas')
        tmp.width = pw
        tmp.height = ph
        const tCtx = tmp.getContext('2d')
        if (tCtx) {
          tCtx.imageSmoothingEnabled = true
          tCtx.drawImage(imgRef.current, sx, sy, sw2, sh2, 0, 0, pw, ph)
          ctx.imageSmoothingEnabled = false
          ctx.drawImage(tmp, 0, 0, pw, ph, 0, 0, img.width, img.height)
        }
      }

      if (t < 1) {
        rafRef.current = requestAnimationFrame(animate)
      }
    }

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [img.src, img.width, img.height])

  return (
    <canvas
      ref={canvasRef}
      width={img.width}
      height={img.height}
      style={{
        position: 'absolute',
        left: img.x - img.width / 2,
        top: img.y - img.height / 2,
        width: img.width,
        height: img.height,
        pointerEvents: 'none',
        zIndex: 5,
        filter: blur > 0.05 ? `blur(${blur}px)` : 'none',
      }}
    />
  )
}

if (typeof window !== 'undefined') {
  images.forEach((src) => {
    const img = new window.Image()
    img.src = src
  })
}

function ScrambleText({ text, className }: { text: string; className?: string }) {
  const elementRef = useRef<HTMLSpanElement>(null)
  const cleanupRef = useRef<(() => void) | null>(null)

  useEffect(() => {
    return () => { cleanupRef.current?.() }
  }, [])

  const scramble = useCallback(() => {
    if (!elementRef.current) return
    cleanupRef.current?.()
    cleanupRef.current = startScramble(text, (s) => {
      if (elementRef.current) elementRef.current.textContent = s
    }, { maxIterations: 10 })
  }, [text])

  return (
    <span
      ref={elementRef}
      className={`font-mono ${className || ''}`}
      onMouseEnter={scramble}
      onTouchStart={scramble}
    >
      {text}
    </span>
  )
}

function useScramble(initial: string) {
  const [display, setDisplay] = useState(initial)
  const cleanupRef = useRef<(() => void) | null>(null)

  const scrambleTo = useCallback((target: string) => {
    cleanupRef.current?.()
    cleanupRef.current = startScramble(target, setDisplay, { maxIterations: 14 })
  }, [])

  useEffect(() => {
    return () => { cleanupRef.current?.() }
  }, [])

  return { display, scrambleTo }
}

export function AnimatedLogo({ isScrolled, onMouseMove }: { isScrolled: boolean; onMouseMove?: (e: React.MouseEvent) => void }) {
  const [isRussian, setIsRussian] = useState(false)
  const [mounted, setMounted] = useState(false)
  const { isMobile, width, height } = useMobile()
  const { scrollY, vh: scrollVh } = useScroll()
  const { language } = useLanguage()
  const ivanScramble = useScramble('IVAN')
  const kolesnikovScramble = useScramble('KOLESNIKOV')
  const nameRef = useRef<HTMLDivElement>(null)
  const isHoveredRef = useRef(false)

  const [showBackdrop, setShowBackdrop] = useState(false)

  useEffect(() => {
    window.scrollTo(0, 0)
    const frame = requestAnimationFrame(() => setMounted(true))
    return () => cancelAnimationFrame(frame)
  }, [])

  // Safety check: reset to English if mouse leaves but state got stuck
  useEffect(() => {
    if (!isRussian || isMobile) return
    
    const checkHover = () => {
      if (!isHoveredRef.current && isRussian) {
        setIsRussian(false)
        ivanScramble.scrambleTo('IVAN')
        kolesnikovScramble.scrambleTo('KOLESNIKOV')
      }
    }
    
    const timer = setInterval(checkHover, 100)
    return () => clearInterval(timer)
  }, [isRussian, isMobile, ivanScramble, kolesnikovScramble])

  // Calculate progress from scroll context
  const progress = scrollVh > 0 ? Math.min(1, scrollY / scrollVh) : 0

  // Mobile backdrop blur starting from projects section
  useEffect(() => {
    const projekte = document.getElementById('projekte')
    if (projekte) {
      const rect = projekte.getBoundingClientRect()
      const frame = requestAnimationFrame(() => setShowBackdrop(rect.top < scrollVh * 0.5))
      return () => cancelAnimationFrame(frame)
    }
  }, [scrollY, scrollVh])

  const introLayout = getIntroLayout({ isMobile, width, height })

  // Desktop (unverändert)
  const desktopStartLeft = introLayout.nameLeft
  const desktopEndLeft = 32
  const desktopLeft = desktopStartLeft + (desktopEndLeft - desktopStartLeft) * progress

  const desktopStartTop = introLayout.nameTop
  const desktopEndTop = 24
  const desktopTop = desktopStartTop + (desktopEndTop - desktopStartTop) * progress

  const desktopStartSize = introLayout.nameFontSize
  const desktopEndSize = 14
  const desktopFontSize = desktopStartSize + (desktopEndSize - desktopStartSize) * progress

  // Mobile
  const mobileStartLeft = introLayout.nameLeft
  const mobileEndLeft = 16
  const mobileLeft = mobileStartLeft + (mobileEndLeft - mobileStartLeft) * progress

  const mobileStartTop = introLayout.nameTop
  const mobileEndTop = 20
  const mobileTop = mobileStartTop + (mobileEndTop - mobileStartTop) * progress

  const mobileStartSize = introLayout.nameFontSize
  const mobileEndSize = 11
  const mobileFontSize = mobileStartSize + (mobileEndSize - mobileStartSize) * progress

  const left = isMobile ? mobileLeft : desktopLeft
  const top = isMobile ? mobileTop : desktopTop
  const fontSize = isMobile ? mobileFontSize : desktopFontSize

  const startLineHeight = 0.9
  const endLineHeight = 1.2
  const lineHeight = startLineHeight + (endLineHeight - startLineHeight) * progress

  const descriptor = language === 'de'
    ? 'Der zwischen dem Gewesenen und dem Werdenden Erlebnisse schafft, in denen Code fühlbar wird und klassische Kommunikation mit KI zu etwas Neuem verschmilzt.'
    : 'Who creates moments between what was and what is becoming, in which code becomes tangible and classical communication merges with AI into something new.'

  const heroDuration = 1.5
  const rawHeroProgress = scrollVh > 0 ? scrollY / (scrollVh * heroDuration) : 0
  const heroProgress = Math.max(0, Math.min(1, rawHeroProgress))
  const bodyTextOpacity = Math.max(0, Math.min(1, (heroProgress - 0.18) / 0.18))
  const descriptorVisibility = rawHeroProgress <= 1.02 ? 1 : 0
  const descriptorBlurProgress = Math.max(0, Math.min(1, (heroProgress - 0.9) / 0.1))
  const descriptorBlur = descriptorBlurProgress * 18

  const handleEnter = useCallback(() => {
    document.body.classList.add('hide-x-cursor')
    isHoveredRef.current = true
    setIsRussian(true)
    ivanScramble.scrambleTo('ИВАН')
    kolesnikovScramble.scrambleTo('КОЛЕСНИКОВ')
  }, [ivanScramble, kolesnikovScramble])

  const handleLeave = useCallback(() => {
    document.body.classList.remove('hide-x-cursor')
    isHoveredRef.current = false
    setIsRussian(false)
    ivanScramble.scrambleTo('IVAN')
    kolesnikovScramble.scrambleTo('KOLESNIKOV')
  }, [ivanScramble, kolesnikovScramble])

  const handleNavClick = useCallback(() => {
    if (progress >= 0.95) {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }, [progress])

  const handleTouchStart = useCallback(() => {
    if (progress > 0.1) return
    if (isRussian) {
      setIsRussian(false)
      ivanScramble.scrambleTo('IVAN')
      kolesnikovScramble.scrambleTo('KOLESNIKOV')
    } else {
      setIsRussian(true)
      ivanScramble.scrambleTo('ИВАН')
      kolesnikovScramble.scrambleTo('КОЛЕСНИКОВ')
    }
  }, [isRussian, progress, ivanScramble, kolesnikovScramble])

  useEffect(() => {
    return () => document.body.classList.remove('hide-x-cursor')
  }, [])

  const isInNav = progress >= 0.95

  if (!mounted) return null

  return (
    <>
      {/* Mobile backdrop blur stripe */}
      {isMobile && showBackdrop && (
        <div
          className="mobile-nav-blur"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            height: '120px',
            zIndex: 25,
            pointerEvents: 'none',
            backdropFilter: 'blur(50px) saturate(1.2)',
            WebkitBackdropFilter: 'blur(50px) saturate(1.2)',
            maskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 40%, rgba(0,0,0,0) 100%)',
            WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 40%, rgba(0,0,0,0) 100%)',
            transition: 'opacity 0.3s ease',
          }}
        />
      )}
      <div
        className="fixed fixed-ui"
        style={{
          left,
          top,
          zIndex: isInNav ? 1000002 : 15,
          pointerEvents: 'none',
          mixBlendMode: isInNav ? undefined : 'difference',
        }}
      >
      <div
        style={{
          pointerEvents: 'auto',
          cursor: isInNav ? 'pointer' : 'default',
          userSelect: 'none',
          display: 'flex',
          flexDirection: 'column',
          gap: isInNav ? '-0.05em' : '0',
        }}
        onMouseEnter={handleEnter}
        onMouseLeave={handleLeave}
        onMouseMove={onMouseMove}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleLeave}
        onTouchCancel={handleLeave}
        onClick={handleNavClick}
      >
        <NavMaskedText
          className="nav__brand scramble-text"
          watchKey={`${ivanScramble.display}-${isRussian}`}
          forceDifference={!isInNav}
          style={{
            fontSize,
            lineHeight,
            letterSpacing: isRussian ? '-0.04em' : '-0.02em',
            marginTop: isRussian ? `${fontSize * -0.07}px` : '0',
            display: 'block',
            transformOrigin: 'bottom left',
            fontWeight: isRussian ? 700 : 700,
            fontFamily: isRussian ? 'var(--font-montserrat), sans-serif' : undefined,
          }}
        >
          <span style={{ fontSize: isRussian ? '0.92em' : '1em' }}>
            {ivanScramble.display}
          </span>
        </NavMaskedText>
        <NavMaskedText
          className="nav__brand scramble-text"
          watchKey={`${kolesnikovScramble.display}-${isRussian}`}
          forceDifference={!isInNav}
          style={{
            fontSize,
            lineHeight,
            letterSpacing: isRussian ? '-0.04em' : '-0.02em',
            marginTop: isRussian ? `${fontSize * -0.05}px` : (isInNav ? '-0.12em' : '0'),
            display: 'block',
            transformOrigin: 'bottom left',
            fontWeight: isRussian ? 700 : 700,
            fontFamily: isRussian ? 'var(--font-montserrat), sans-serif' : undefined,
          }}
        >
          <span style={{ fontSize: isRussian ? '0.92em' : '1em' }}>
            {kolesnikovScramble.display}
          </span>
        </NavMaskedText>
      </div>

    </div>
    </>
  )
}

function BgImage() {
  const { isMobile } = useMobile()
  const { scrollY, vh } = useScroll()

  const progress = vh > 0 ? scrollY / (vh * 2.0) : 0
  const blurStartProgress = 0.76
  const blurSpan = 0.4
  const delayedBlurProgress = Math.max(0, Math.min(1, (progress - blurStartProgress) / blurSpan))
  const blur = delayedBlurProgress * 20
  const opacity = 1 - delayedBlurProgress

  return (
    <div
      className="fixed pointer-events-none"
      style={{
        right: isMobile ? '-12vw' : '1.5vw',
        top: isMobile ? '30svh' : 'auto',
        bottom: isMobile ? 'auto' : '10svh',
        zIndex: 0,
        opacity,
        filter: `blur(${blur}px)`,
        maskImage: 'radial-gradient(ellipse at center, rgba(0,0,0,1) 76%, rgba(0,0,0,0) 100%)',
        WebkitMaskImage: 'radial-gradient(ellipse at center, rgba(0,0,0,1) 76%, rgba(0,0,0,0) 100%)',
        transition: 'none',
        willChange: 'opacity, filter',
      }}
    >
      <img
        src="/photos/background.jpg"
        alt=""
        style={{
          width: isMobile ? '100vw' : '660px',
          height: 'auto',
          display: 'block',
          objectFit: 'contain',
        }}
      />
    </div>
  )
}

type HeroAccess = 'default' | 'gme'

const GME_LETTER = [
  'That is who I am, creating moments where classical communication merges with generative AI into something tangible. I am Ivan Kolesnikov, a 6th semester Integrated Media and Communication student from Germany\nand a proud GME holder.',
  'I am applying for my mandatory internship because I see so much good in this company. Ryan Cohen as CEO is deeply inspiring to me. Having worked at established but rigid corporations like BMW and Continental,\nI believe GameStop offers a fresh environment where bold thinking is truly valued.',
  'I was trained to think like a Creative Director, covering strategy, communication, branding, and design thinking. During my studies, I completed numerous real world projects and participated in the GWA Junior Agency Award. My corporate experience includes international marketing at the Continental headquarters in Hannover, and developing generative AI pipelines at the BMW headquarters in Munich, alongside work at GRACO in Berlin. Backed by my vocational training as a Design Technical Assistant, I deliver under pressure.\nI give 100%, and quitting is not in my vocabulary.',
  'Fascinated by the potential of Generative AI, I blend cutting edge tech with my lifelong passion for film and professional video production to create campaigns that truly resonate.',
  'To fulfill my 3 month mandatory internship, I am fully prepared to relocate from Germany to the US. I know my chances might seem slim, but giving up is not an option for me. I require J1 visa sponsorship support (I can handle the administrative workload) and a standard compensation to cover basic housing and food.',
  'I have the conviction, the AI skillset, and the drive.',
  'Enjoy my portfolio!',
]

function waveToTitleCase(word: string, waveProgress: number) {
  const letters = word.split('')
  const lowerCount = Math.floor(waveProgress * Math.max(0, letters.length - 1))
  return letters.map((letter, index) => {
    if (!/[A-Za-z]/.test(letter)) return letter
    if (index === 0) return letter.toUpperCase()
    return index <= lowerCount ? letter.toLowerCase() : letter.toUpperCase()
  }).join('')
}

type GmeTextToken =
  | { type: 'word'; value: string }
  | { type: 'break' }

function tokenizeGmeParagraph(paragraph: string): GmeTextToken[] {
  return paragraph
    .replace(/\\n/g, '\n')
    .split(/(\n)/)
    .flatMap((part): GmeTextToken[] => {
      if (part === '\n') return [{ type: 'break' }]
      return part.split(/\s+/).filter(Boolean).map((value) => ({ type: 'word', value }))
    })
}

export function Hero({ access = 'default' }: { access?: HeroAccess }) {
  const { isMobile, width, height } = useMobile()
  const { language } = useLanguage()
  const { scrollY, vh } = useScroll()
  const [trailImages, setTrailImages] = useState<TrailImage[]>([])
  const [isScrolled, setIsScrolled] = useState(false)
  const containerRef = useRef<HTMLElement>(null)
  const lastTimeRef = useRef(0)
  const lastPosRef = useRef({ x: 0, y: 0 })
  const imageIdRef = useRef(0)
  const [descFade, setDescFade] = useState(1)
  const [gmeCaseProgress, setGmeCaseProgress] = useState(0)
  const gmeCaseProgressRef = useRef(0)
  const gmeCaseTargetRef = useRef(0)
  const gmeCaseAnimRef = useRef<number | null>(null)
  const expScramble = useScramble('Process')
  const desScramble = useScramble('Designer')
  const expScrambleRef = useRef(expScramble.scrambleTo)
  const desScrambleRef = useRef(desScramble.scrambleTo)
  useEffect(() => {
    expScrambleRef.current = expScramble.scrambleTo
    desScrambleRef.current = desScramble.scrambleTo
  }, [desScramble.scrambleTo, expScramble.scrambleTo])
  const handleHeaderHover = useCallback(() => {
    expScrambleRef.current('Process')
    desScrambleRef.current('Designer')
  }, [])
  const isGmeMode = access === 'gme'
  const heroProgress = vh > 0 ? Math.min(1, scrollY / (vh * 2.0)) : 0
  const rawHeroProgress = vh > 0 ? scrollY / (vh * 2.0) : 0
  const descriptor = language === 'de'
    ? 'Der zwischen dem Gewesenen und dem Werdenden Erlebnisse schafft, in denen Code fuehlbar wird und klassische Kommunikation mit KI zu etwas Besonderem verschmilzt'
    : 'Who creates moments between what was and what is becoming, in which code becomes tangible and classical communication merges with AI into something special'
  const gmeLetter = GME_LETTER
  const descriptorWords = useMemo(() => [...descriptor.split(/\s+/).filter(Boolean), '.', '.', '.'], [descriptor])
  const gmeLetterTokens = useMemo(() => gmeLetter.map(tokenizeGmeParagraph), [gmeLetter])
  const gmeWordCount = useMemo(() => gmeLetterTokens.reduce((sum, tokens) => sum + tokens.filter(token => token.type === 'word').length, 0), [gmeLetterTokens])
  const [descriptorDisplayWords, setDescriptorDisplayWords] = useState<string[]>(descriptorWords)
  const prevLangRef = useRef(language)
  const scrambleCleanupRefs = useRef<((() => void) | null)[]>([])

  useEffect(() => {
    if (prevLangRef.current === language) {
      return
    }
    prevLangRef.current = language
    // Scramble each word individually on language change
    scrambleCleanupRefs.current.forEach(fn => fn?.())
    scrambleCleanupRefs.current = descriptorWords.map((word, i) => {
      return startScramble(word, (val) => {
        setDescriptorDisplayWords(prev => {
          const copy = descriptorWords.map((targetWord, wordIndex) => prev[wordIndex] || targetWord)
          copy[i] = val
          return copy
        })
      }, { maxIterations: 12 })
    })
    return () => { scrambleCleanupRefs.current.forEach(fn => fn?.()) }
  }, [language, descriptor, descriptorWords])

  useEffect(() => {
    gmeCaseProgressRef.current = gmeCaseProgress
  }, [gmeCaseProgress])

  const revealEnd = 0.72
  const revealProgress = Math.max(0, Math.min(1, heroProgress / revealEnd))
  const blurStart = 0.76
  const blurSpan = 0.4
  const blurProgress = Math.max(0, Math.min(1, (rawHeroProgress - blurStart) / blurSpan))
  const descriptorBlur = blurProgress * 14
  const descriptorMoveProgress = revealProgress
  const descriptorMoveEase = 1 - Math.pow(1 - descriptorMoveProgress, 3)
  const introLayout = getIntroLayout({ isMobile, width, height })
  const descriptorStartTop = introLayout.experienceTop
  const descriptorTargetTop = height * (isMobile ? 0.18 : 0.2)
  const descriptorTop = descriptorStartTop + (descriptorTargetTop - descriptorStartTop) * descriptorMoveEase
  const visibleWords = Math.min(descriptorWords.length, Math.floor(revealProgress * (descriptorWords.length + 1)))
  const visibleGmeWords = Math.min(gmeWordCount, Math.floor(revealProgress * (gmeWordCount + 1)))
  const gmeTextComplete = isGmeMode && visibleGmeWords >= gmeWordCount
  const gmeBodyFontPx = isMobile
    ? Math.max(11.4, Math.min(12.8, width * 0.036))
    : Math.max(13.2, Math.min(15.5, width * 0.0105))
  const titleStartFontPx = isMobile
    ? Math.max(20, Math.min(34, width * 0.064))
    : Math.max(28, Math.min(46, width * 0.027))
  const gmeTitleFontPx = titleStartFontPx + (gmeBodyFontPx - titleStartFontPx) * revealProgress
  const gmeTitleWeight = Math.round(900 + (600 - 900) * revealProgress)
  const gmeTitleLetterSpacing = -1 + revealProgress
  const gmeTitleLineHeight = 1.12 + ((isMobile ? 1.2 : 1.34) - 1.12) * revealProgress
  const gmeLetterEndGap = 0
  const gmeLetterMarginTop = gmeLetterEndGap + ((isMobile ? 12 : 24) - gmeLetterEndGap) * (1 - revealProgress)
  const gmeProcessDisplay = isGmeMode ? waveToTitleCase('Process', gmeCaseProgress) : expScramble.display
  const gmeDesignerDisplay = isGmeMode ? waveToTitleCase('Designer', gmeCaseProgress) : desScramble.display
  const gmeLogoBlend = Math.max(0, Math.min(1, (revealProgress - 0.32) / 0.42))
  const descriptorOpacity = descFade
  const trailBlur = blurProgress * 20

  useEffect(() => {
    const proj = document.getElementById('projekte')
    if (!proj || vh <= 0) {
      const frame = requestAnimationFrame(() => setDescFade(1))
      return () => cancelAnimationFrame(frame)
    }
    const r = proj.getBoundingClientRect()
    // Fade out as the project section reaches / fills the viewport
    const next = Math.max(0, Math.min(1, r.top / (vh * 0.6)))
    const frame = requestAnimationFrame(() => setDescFade(next))
    return () => cancelAnimationFrame(frame)
  }, [scrollY, vh])

  useEffect(() => {
    const handleScroll = () => {
      const nextIsScrolled = window.scrollY > 100
      setIsScrolled(prev => (prev === nextIsScrolled ? prev : nextIsScrolled))
    }
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    const nextTarget = isGmeMode && revealProgress >= 0.64 ? 1 : 0
    if (gmeCaseTargetRef.current === nextTarget) return

    gmeCaseTargetRef.current = nextTarget
    if (gmeCaseAnimRef.current !== null) cancelAnimationFrame(gmeCaseAnimRef.current)

    const from = gmeCaseProgressRef.current
    const to = nextTarget
    const duration = 210
    let startTime: number | null = null

    const animate = (time: number) => {
      if (startTime === null) startTime = time
      const t = Math.min(1, (time - startTime) / duration)
      const eased = 1 - Math.pow(1 - t, 3)
      const nextProgress = from + (to - from) * eased
      gmeCaseProgressRef.current = nextProgress
      setGmeCaseProgress(nextProgress)
      if (t < 1) {
        gmeCaseAnimRef.current = requestAnimationFrame(animate)
      } else {
        gmeCaseProgressRef.current = to
        setGmeCaseProgress(to)
        gmeCaseAnimRef.current = null
      }
    }

    gmeCaseAnimRef.current = requestAnimationFrame(animate)
  }, [isGmeMode, revealProgress])

  useEffect(() => {
    return () => {
      if (gmeCaseAnimRef.current !== null) cancelAnimationFrame(gmeCaseAnimRef.current)
    }
  }, [])

  const spawnImage = useCallback((x: number, y: number, mobile = false) => {
    const sizePool = mobile ? sizesMobile : sizes
    const randomImage = images[Math.floor(Math.random() * images.length)]
    const randomSize = sizePool[Math.floor(Math.random() * sizePool.length)]
    const newImg: TrailImage = {
      id: imageIdRef.current++,
      src: randomImage,
      x, y,
      width: randomSize.width,
      height: randomSize.height,
    }
    setTrailImages(prev => [...prev, newImg])
    setTimeout(() => {
      setTrailImages(prev => prev.filter(img => img.id !== newImg.id))
    }, 2500)
  }, [])

  const handleLogoMouseMove = useCallback((e: React.MouseEvent) => {
    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect) return
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    if (x < 0 || y < 0 || x > rect.width || y > rect.height) return
    const dx = e.clientX - lastPosRef.current.x
    const dy = e.clientY - lastPosRef.current.y
    const velocity = Math.sqrt(dx * dx + dy * dy)
    lastPosRef.current = { x: e.clientX, y: e.clientY }
    const now = Date.now()
    if (velocity > 15 && now - lastTimeRef.current > 50) {
      lastTimeRef.current = now
      spawnImage(x, y)
    }
  }, [spawnImage])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect) return
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const dx = e.clientX - lastPosRef.current.x
    const dy = e.clientY - lastPosRef.current.y
    const velocity = Math.sqrt(dx * dx + dy * dy)
    lastPosRef.current = { x: e.clientX, y: e.clientY }
    const now = Date.now()
    if (velocity > 15 && now - lastTimeRef.current > 50) {
      lastTimeRef.current = now
      spawnImage(x, y)
    }
  }, [spawnImage])

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect) return
    const touch = e.touches[0]
    const x = touch.clientX - rect.left
    const y = touch.clientY - rect.top
    if (x < 0 || y < 0 || x > rect.width || y > rect.height) return
    const dx = touch.clientX - lastPosRef.current.x
    const dy = touch.clientY - lastPosRef.current.y
    const velocity = Math.sqrt(dx * dx + dy * dy)
    lastPosRef.current = { x: touch.clientX, y: touch.clientY }
    const now = Date.now()
    if (velocity > 8 && now - lastTimeRef.current > 80) {
      lastTimeRef.current = now
      spawnImage(x, y, true)
    }
  }, [spawnImage])

  return (
    <>
      <AnimatedLogo isScrolled={isScrolled} onMouseMove={handleLogoMouseMove} />

      <section
        ref={containerRef}
        data-textcolor="black"
        onMouseMove={handleMouseMove}
        onTouchMove={handleTouchMove}
        className="relative bg-white flex items-center overflow-hidden"
        style={{ height: isMobile ? 'calc(var(--app-visual-height, 100svh) * 2.2)' : '240vh' }}
      >
        {trailImages.map((img) => (
          <PixelTrailImage key={img.id} img={img} blur={trailBlur} />
        ))}
        <BgImage />

        <div
          style={{
            position: 'fixed',
            left: introLayout.experienceLeft,
            top: descriptorTop,
            maxWidth: isMobile ? '86vw' : 'min(40vw, 600px)',
            color: '#ffffff',
            textAlign: 'left',
            pointerEvents: 'none',
            zIndex: 15,
            mixBlendMode: 'difference',
            opacity: descriptorOpacity,
            filter: `blur(${descriptorBlur}px)`,
          }}
        >
          <div
            style={{
              fontSize: isGmeMode ? `${gmeTitleFontPx}px` : (isMobile ? 'clamp(20px, 6.4vw, 34px)' : 'clamp(28px, 2.7vw, 46px)'),
              lineHeight: 0.98,
              letterSpacing: '-0.6px',
              textShadow: 'none',
              whiteSpace: 'normal',
              fontWeight: isGmeMode ? gmeTitleWeight : 700,
              textTransform: isGmeMode ? 'none' : 'uppercase',
            }}
          >
            <div
              onMouseEnter={handleHeaderHover}
              onTouchStart={handleHeaderHover}
              style={{
              fontWeight: isGmeMode ? gmeTitleWeight : 900,
              color: '#ffffff',
              letterSpacing: isGmeMode ? `${gmeTitleLetterSpacing}px` : '-1px',
              lineHeight: isGmeMode ? gmeTitleLineHeight : 1.12,
              pointerEvents: 'auto',
              cursor: 'default',
              display: 'inline-block',
            }}>
              {gmeProcessDisplay}<br/>{gmeDesignerDisplay}
            </div>
            {isGmeMode ? (
              <div
                style={{
                  marginTop: gmeLetterMarginTop,
                  maxWidth: isMobile ? '88vw' : 'min(52vw, 760px)',
                  display: 'grid',
                  gap: isMobile ? 5 : 9,
                  fontSize: `${gmeBodyFontPx}px`,
                  lineHeight: isMobile ? 1.2 : 1.34,
                  letterSpacing: 0,
                  textTransform: 'none',
                  fontWeight: 600,
                }}
              >
                {(() => {
                  let wordCursor = 0
                  let gameStopLogoRendered = false
                  return gmeLetterTokens.map((paragraphTokens, paragraphIndex) => (
                    <p key={paragraphIndex} style={{ margin: 0 }}>
                      {paragraphTokens.map((token, tokenIndex) => {
                        if (token.type === 'break') {
                          return <br key={`${paragraphIndex}-${tokenIndex}`} />
                        }
                        const word = token.value
                        const currentWord = wordCursor++
                        const cleanWord = word.replace(/[^A-Za-z]/g, '')
                        const trailingPunctuation = word.slice(cleanWord.length)
                        const shouldRenderGameStopLogo = cleanWord === 'GameStop' && !gameStopLogoRendered
                        if (shouldRenderGameStopLogo) gameStopLogoRendered = true
                        return (
                          <span
                            key={`${paragraphIndex}-${tokenIndex}`}
                            style={{
                              opacity: currentWord < visibleGmeWords ? 1 : 0,
                              transition: 'opacity 0.2s linear',
                            }}
                          >
                            {shouldRenderGameStopLogo ? (
                              <>
                                <span
                                  aria-label="GameStop"
                                  role="img"
                                  style={{
                                    position: 'relative',
                                    display: 'inline-block',
                                    height: '1em',
                                    width: '4.98em',
                                    verticalAlign: '-0.12em',
                                  }}
                                >
                                  <img
                                    src="/icons/gamestop-logo.png"
                                    alt=""
                                    aria-hidden="true"
                                    style={{
                                      position: 'absolute',
                                      inset: 0,
                                      height: '1em',
                                      width: 'auto',
                                      filter: 'invert(1)',
                                      opacity: 1,
                                    }}
                                  />
                                  <img
                                    src="/icons/gamestop-logo2.png"
                                    alt=""
                                    aria-hidden="true"
                                    style={{
                                      position: 'absolute',
                                      inset: 0,
                                      height: '1em',
                                      width: 'auto',
                                      filter: 'invert(1)',
                                      opacity: gmeLogoBlend,
                                    }}
                                  />
                                </span>
                                {trailingPunctuation}
                              </>
                            ) : word}{tokenIndex < paragraphTokens.length - 1 && paragraphTokens[tokenIndex + 1]?.type === 'word' ? ' ' : ''}
                          </span>
                        )
                      })}
                    </p>
                  ))
                })()}
              </div>
            ) : (<>
            {(() => {
              const lineSplits = language === 'en'
                ? [3, 2, 4, 3, 2, 2, 2, 2, 3, 4]
                : (isMobile ? [3, 3, 3, 3, 2, 2, 2, 3, 3, 4] : [3, 3, 3, 3, 2, 2, 2, 3, 3, 4])
              const lines: number[][] = []
              let cursor = 0
              const lastWordBeforeDots = Math.max(0, descriptorWords.length - 4)
              const dotIndices = [descriptorWords.length - 3, descriptorWords.length - 2, descriptorWords.length - 1]
              for (const count of lineSplits) {
                if (cursor >= lastWordBeforeDots) break
                const indices = Array.from({length: Math.min(count, lastWordBeforeDots - cursor)}, (_, i) => cursor + i)
                lines.push(indices)
                cursor += count
              }
              if (cursor < lastWordBeforeDots) {
                lines.push(Array.from({length: lastWordBeforeDots - cursor}, (_, i) => cursor + i))
              }
              lines.push([lastWordBeforeDots, ...dotIndices])
              return lines.map((lineIndices, li) => (
                <div key={li} style={{ marginLeft: 0, lineHeight: 1.12 }}>
                  {lineIndices.map((gIdx, wi) => {
                    const isDot = descriptorWords[gIdx] === '.'
                    const hasDotClusterInLine = lineIndices.includes(lastWordBeforeDots) && dotIndices.every((idx) => lineIndices.includes(idx))
                    const shouldRenderDotCluster = hasDotClusterInLine && gIdx === lastWordBeforeDots

                    if (hasDotClusterInLine && dotIndices.includes(gIdx)) {
                      return null
                    }

                    if (shouldRenderDotCluster) {
                      return (
                        <span key={`cluster-${gIdx}`} style={{ whiteSpace: 'nowrap' }}>
                          <span
                            style={{
                              fontWeight: 700,
                              fontStyle: 'normal',
                              color: '#ffffff',
                              opacity: gIdx < visibleWords ? 1 : 0,
                              transition: 'opacity 0.25s linear',
                            }}
                          >
                            {descriptorDisplayWords[gIdx] || descriptorWords[gIdx]}
                          </span>{' '}
                          {dotIndices.map((dotIdx) => (
                            <span
                              key={`dot-${dotIdx}`}
                              style={{
                                fontWeight: 700,
                                fontStyle: 'normal',
                                color: '#ffffff',
                                opacity: dotIndices[dotIndices.length - 1] < visibleWords ? 1 : 0,
                                transition: 'opacity 0.25s linear',
                              }}
                            >
                              {descriptorDisplayWords[dotIdx] || descriptorWords[dotIdx]}
                            </span>
                          ))}
                        </span>
                      )
                    }

                    return (
                      <span
                        key={`${gIdx}`}
                        style={{
                          fontWeight: 700,
                          fontStyle: 'normal',
                          color: '#ffffff',
                          opacity: gIdx < visibleWords ? 1 : 0,
                          transition: 'opacity 0.25s linear',
                        }}
                      >
                        {descriptorDisplayWords[gIdx] || descriptorWords[gIdx]}
                        {wi < lineIndices.length - 1 && descriptorWords[lineIndices[wi + 1]] !== '.' ? ' ' : wi < lineIndices.length - 1 && !isDot ? ' ' : ''}
                      </span>
                    )
                  })}
                </div>
              ))
            })()}
            </>)}
          </div>
        </div>
        {isGmeMode && (
          <div
            aria-hidden="true"
            style={{
              position: 'fixed',
              left: '50%',
              bottom: isMobile ? 2 : 4,
              transform: gmeTextComplete ? 'translateX(-50%) scale(1)' : 'translate(-50%, -8px) scale(0.82)',
              color: '#000000',
              zIndex: 16,
              pointerEvents: 'none',
              opacity: gmeTextComplete ? descriptorOpacity : 0,
              transition: 'opacity 0.24s ease, transform 0.32s ease',
              lineHeight: 0,
            }}
          >
            <svg width={isMobile ? 42 : 58} height={isMobile ? 54 : 74} viewBox="0 0 42 42" fill="none">
              <polyline points="7,13 21,29 35,13" stroke="currentColor" strokeWidth="7" strokeLinecap="square" strokeLinejoin="miter"/>
            </svg>
          </div>
        )}
      </section>
    </>
  )
}

export function QuoteSection() {
  return (
    <section className="relative min-h-screen bg-[#1a1a1a] flex items-center justify-center px-8 md:px-16 lg:px-24">
      <div className="max-w-4xl text-center">
        <div
          className="relative"
          style={{ animation: 'fadeInUp 0.8s ease-out' }}
        >
          <span className="absolute -top-8 -left-4 text-[#E31E24] text-6xl md:text-8xl font-serif opacity-50">"</span>
          <p className="text-2xl md:text-4xl lg:text-5xl font-light text-white leading-relaxed tracking-wide">
            As above, so below; as within, so without.
          </p>
          <footer className="mt-8 text-gray-500 text-sm md:text-base tracking-widest uppercase">
            — Hermes Trismegistos
          </footer>
        </div>
      </div>
    </section>
  )
}