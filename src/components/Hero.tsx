'use client'

import { useState, useRef, useCallback, useEffect, useMemo } from 'react'
import { useMobile } from '@/hooks/use-mobile'
import { useScroll } from '@/contexts/ScrollContext'
import { useLanguage } from '@/contexts/LanguageContext'
import { startScramble } from '@/lib/scramble'
import { NavMaskedText } from '@/components/NavMaskedText'

const chars = "!@#$%&*АБВГДЕЖЗИКЛМНОПРСТУФХЦЧШЩЭЮЯ01"

const images = [
  "/photos/IMG_0142.JPG",
  "/photos/IMG_0205.JPG",
  "/photos/IMG_0323_3.JPG",
  "/photos/IMG_0397_2.JPG",
  "/photos/IMG_0446.JPG",
  "/photos/IMG_0689.JPG",
  "/photos/IMG_1743.JPG",
  "/photos/IMG_2127.JPG",
  "/photos/IMG_3028.JPG",
  "/photos/IMG_4818_2.JPG",
  "/photos/IMG_5141.JPG",
  "/photos/IMG_5434.JPG",
  "/photos/IMG_6074.JPG",
  "/photos/IMG_6228.JPG",
  "/photos/IMG_6342.JPG",
  "/photos/IMG_6518.JPG",
  "/photos/IMG_6548.JPG",
  "/photos/IMG_6575.JPG",
  "/photos/IMG_6627.JPG",
  "/photos/IMG_6857.JPG",
  "/photos/IMG_6866.JPG",
  "/photos/IMG_7386.JPG",
  "/photos/IMG_7486.JPG",
  "/photos/IMG_7616_2.JPG",
  "/photos/IMG_7994.JPG",
  "/photos/IMG_8185.JPG",
  "/photos/IMG_8218.JPG",
  "/photos/IMG_8286.JPG",
  "/photos/IMG_8665_2.JPG",
  "/photos/IMG_8705.JPG",
  "/photos/IMG_8721.JPG",
  "/photos/IMG_8922.JPG",
  "/photos/IMG_8969.JPG",
  "/photos/IMG_8994.JPG",
  "/photos/IMG_9077_2.JPG",
  "/photos/IMG_9189_2.JPG",
  "/photos/IMG_9313.JPG",
  "/photos/IMG_9680_2.JPG",
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

  const vw = mounted ? width / 100 : 0
  const vh = mounted ? height / 100 : 0

  // Desktop (unverändert)
  const desktopStartLeft = 8 * vw
  const desktopEndLeft = 32
  const desktopLeft = desktopStartLeft + (desktopEndLeft - desktopStartLeft) * progress

  const desktopStartTop = 15 * vh
  const desktopEndTop = 24
  const desktopTop = desktopStartTop + (desktopEndTop - desktopStartTop) * progress

  const desktopStartSize = 8 * vw
  const desktopEndSize = 14
  const desktopFontSize = desktopStartSize + (desktopEndSize - desktopStartSize) * progress

  // Mobile
  const mobileStartLeft = 5 * vw
  const mobileEndLeft = 16
  const mobileLeft = mobileStartLeft + (mobileEndLeft - mobileStartLeft) * progress

  const mobileStartTop = 12 * vh
  const mobileEndTop = 20
  const mobileTop = mobileStartTop + (mobileEndTop - mobileStartTop) * progress

  const mobileStartSize = 13 * vw
  const mobileEndSize = 11
  const mobileFontSize = mobileStartSize + (mobileEndSize - mobileStartSize) * progress

  const left = isMobile ? mobileLeft : desktopLeft
  const top = isMobile ? mobileTop : desktopTop
  const fontSize = isMobile ? mobileFontSize : desktopFontSize

  const startLineHeight = 0.9
  const endLineHeight = 1.2
  const lineHeight = startLineHeight + (endLineHeight - startLineHeight) * progress

  const descriptor = language === 'de'
    ? 'Der zwischen dem Gewesenen und dem Werdenden Erlebnisse schafft, in denen Code fuehlbar wird und klassische Kommunikation mit KI zu etwas Neuem verschmilzt.'
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
  const { isMobile, width } = useMobile()
  const { scrollY, vh } = useScroll()

  const progress = vh > 0 ? scrollY / (vh * 2.0) : 0
  const blurStartProgress = 0.66
  const blurSpan = 0.4
  const delayedBlurProgress = Math.max(0, Math.min(1, (progress - blurStartProgress) / blurSpan))
  const blur = delayedBlurProgress * 20
  const opacity = 1 - delayedBlurProgress

  return (
    <div
      className="fixed pointer-events-none"
      style={{
        right: isMobile ? '-12vw' : '1.5vw',
        top: isMobile ? '30vh' : 'auto',
        bottom: isMobile ? 'auto' : '10vh',
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

export function Hero() {
  const { isMobile } = useMobile()
  const { language } = useLanguage()
  const { scrollY, vh } = useScroll()
  const [trailImages, setTrailImages] = useState<TrailImage[]>([])
  const [isScrolled, setIsScrolled] = useState(false)
  const containerRef = useRef<HTMLElement>(null)
  const lastTimeRef = useRef(0)
  const lastPosRef = useRef({ x: 0, y: 0 })
  const imageIdRef = useRef(0)
  const [descFade, setDescFade] = useState(1)
  const expScramble = useScramble('Experience')
  const desScramble = useScramble('Designer')
  const expScrambleRef = useRef(expScramble.scrambleTo)
  const desScrambleRef = useRef(desScramble.scrambleTo)
  expScrambleRef.current = expScramble.scrambleTo
  desScrambleRef.current = desScramble.scrambleTo
  const handleHeaderHover = useCallback(() => {
    expScrambleRef.current('Experience')
    desScrambleRef.current('Designer')
  }, [])
  const heroProgress = vh > 0 ? Math.min(1, scrollY / (vh * 2.0)) : 0
  const rawHeroProgress = vh > 0 ? scrollY / (vh * 2.0) : 0
  const descriptor = language === 'de'
    ? 'Der zwischen dem Gewesenen und dem Werdenden Erlebnisse schafft, in denen Code fuehlbar wird und klassische Kommunikation mit KI zu etwas Neuem verschmilzt.'
    : 'Who creates moments between what was and what is becoming, in which code becomes tangible and classical communication merges with AI into something new.'
  const descriptorWords = useMemo(() => descriptor.split(/\s+/).filter(Boolean), [descriptor])
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
          const copy = [...prev]
          copy[i] = val
          return copy
        })
      }, { maxIterations: 12 })
    })
    return () => { scrambleCleanupRefs.current.forEach(fn => fn?.()) }
  }, [language, descriptor, descriptorWords])

  const revealProgress = Math.max(0, Math.min(1, heroProgress / 0.62))
  const blurStart = 0.66
  const blurSpan = 0.4
  const blurProgress = Math.max(0, Math.min(1, (rawHeroProgress - blurStart) / blurSpan))
  const descriptorBlur = blurProgress * 14
  const descriptorMoveProgress = revealProgress
  const descriptorMoveEase = 1 - Math.pow(1 - descriptorMoveProgress, 3)
  const descriptorTargetTopVh = isMobile ? 18 : 20
  const descriptorStartTopVh = descriptorTargetTopVh + (isMobile ? 20 : 28)
  const descriptorTopVh = descriptorStartTopVh + (descriptorTargetTopVh - descriptorStartTopVh) * descriptorMoveEase
  const visibleWords = Math.floor(revealProgress * descriptorWords.length)
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
    const handleScroll = () => setIsScrolled(window.scrollY > 100)
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
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
        className="relative h-[220vh] md:h-[240vh] bg-white flex items-center overflow-hidden"
      >
        {trailImages.map((img) => (
          <PixelTrailImage key={img.id} img={img} blur={trailBlur} />
        ))}
        <BgImage />

        <div
          style={{
            position: 'fixed',
            left: isMobile ? 'calc(5vw + 2px)' : 'calc(8vw + 4px)',
            top: `${descriptorTopVh}vh`,
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
              fontSize: isMobile ? 'clamp(20px, 6.4vw, 34px)' : 'clamp(28px, 2.7vw, 46px)',
              lineHeight: 0.98,
              letterSpacing: '-0.6px',
              textShadow: 'none',
              whiteSpace: 'normal',
              fontWeight: 700,
              textTransform: 'uppercase',
            }}
          >
            <div
              onMouseEnter={handleHeaderHover}
              onTouchStart={handleHeaderHover}
              style={{
              fontWeight: 900,
              color: '#ffffff',
              letterSpacing: '-1px',
              lineHeight: 1.12,
              pointerEvents: 'auto',
              cursor: 'default',
              display: 'inline-block',
            }}>
              {expScramble.display}<br/>{desScramble.display}
            </div>
            {(() => {
              const lineSplits = isMobile ? [5, 3, 3, 3, 3, 3, 3] : [5, 4, 4, 4, 4, 4]
              const lines: number[][] = []
              let cursor = 0
              for (const count of lineSplits) {
                if (cursor >= descriptorWords.length) break
                const indices = Array.from({length: Math.min(count, descriptorWords.length - cursor)}, (_, i) => cursor + i)
                lines.push(indices)
                cursor += count
              }
              if (cursor < descriptorWords.length) {
                lines.push(Array.from({length: descriptorWords.length - cursor}, (_, i) => cursor + i))
              }
              const offsets = isMobile
                ? [0, 1.6, 0.5, 2.2, 0.2, 1.9, 0.8, 2.4, 0.4, 1.3]
                : [0, 2.4, 0.8, 3.2, 0.4, 2.0, 1.4, 3.6, 0.7, 2.6]
              return lines.map((lineIndices, li) => (
                <div key={li} style={{ marginLeft: `${offsets[li % offsets.length]}em`, lineHeight: 1.12 }}>
                  {lineIndices.map((gIdx, wi) => (
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
                      {descriptorDisplayWords[gIdx] || descriptorWords[gIdx]}{wi < lineIndices.length - 1 ? ' ' : ''}
                    </span>
                  ))}
                </div>
              ))
            })()}
          </div>
        </div>
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