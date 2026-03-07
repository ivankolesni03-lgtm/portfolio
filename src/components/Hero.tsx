'use client'

import { useState, useRef, useCallback, useEffect } from 'react'

const chars = "0123456789!@#$%&*АБВГДЕЖИКЛМНОПРСТУФХЦ"

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
  "/photos/IMG_7630.JPG",
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

function PixelTrailImage({ img }: { img: TrailImage }) {
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
        zIndex: 15,
      }}
    />
  )
}

if (typeof window !== 'undefined') {
  images.forEach((src) => {
    const img = new Image()
    img.src = src
  })
}

function ScrambleText({ text, className }: { text: string; className?: string }) {
  const elementRef = useRef<HTMLSpanElement>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const totalIterations = 10
  const intervalMs = 40

  const scramble = useCallback(() => {
    if (!elementRef.current) return
    const revealed = new Set<number>()
    const indices = text.split('').map((_, i) => i)
    let iteration = 0
    elementRef.current.textContent = text
      .split("")
      .map(() => chars[Math.floor(Math.random() * chars.length)])
      .join("")
    if (intervalRef.current) clearInterval(intervalRef.current)
    intervalRef.current = setInterval(() => {
      iteration++
      const unrevealed = indices.filter(i => !revealed.has(i))
      if (unrevealed.length > 0) {
        const randomIndex = unrevealed[Math.floor(Math.random() * unrevealed.length)]
        revealed.add(randomIndex)
      }
      if (elementRef.current) {
        elementRef.current.textContent = text
          .split("")
          .map((char, i) =>
            revealed.has(i) || char === ' ' ? text[i] : chars[Math.floor(Math.random() * chars.length)]
          )
          .join("")
      }
      if (iteration >= totalIterations) {
        if (intervalRef.current) clearInterval(intervalRef.current)
        if (elementRef.current) elementRef.current.textContent = text
      }
    }, intervalMs)
  }, [text])

  return (
    <span
      ref={elementRef}
      className={`font-mono ${className || ''}`}
      onMouseEnter={scramble}
    >
      {text}
    </span>
  )
}

function useScramble(initial: string) {
  const [display, setDisplay] = useState(initial)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const scrambleTo = useCallback((target: string) => {
    let iteration = 0
    const revealed = new Set<number>()
    if (intervalRef.current) clearInterval(intervalRef.current)
    intervalRef.current = setInterval(() => {
      iteration++
      const unrevealed = target.split('').map((_, i) => i).filter(i => !revealed.has(i) && target[i] !== ' ')
      if (unrevealed.length > 0) revealed.add(unrevealed[Math.floor(Math.random() * unrevealed.length)])
      setDisplay(target.split('').map((char, i) =>
        revealed.has(i) || char === ' ' ? target[i] : chars[Math.floor(Math.random() * chars.length)]
      ).join(''))
      if (iteration >= 14) {
        clearInterval(intervalRef.current!)
        setDisplay(target)
      }
    }, 35)
  }, [])

  return { display, scrambleTo }
}

export function AnimatedLogo({ isScrolled, onMouseMove }: { isScrolled: boolean; onMouseMove?: (e: React.MouseEvent) => void }) {
  const [progress, setProgress] = useState(0)
  const [isRussian, setIsRussian] = useState(false)
  const [mounted, setMounted] = useState(false)
  const ivanScramble = useScramble('IVAN')
  const kolesnikovScramble = useScramble('KOLESNIKOV')

  useEffect(() => {
    window.scrollTo(0, 0)
    setMounted(true)
    setProgress(0)

    const handleScroll = () => {
      const p = Math.min(1, window.scrollY / window.innerHeight)
      setProgress(p)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const vw = mounted ? window.innerWidth / 100 : 0
  const vh = mounted ? window.innerHeight / 100 : 0
  const isMobile = mounted ? window.innerWidth < 768 : false

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

  const handleEnter = useCallback(() => {
    if (isRussian) return
    setIsRussian(true)
    ivanScramble.scrambleTo('ИВАН')
    kolesnikovScramble.scrambleTo('КОЛЕСНИКОВ')
  }, [isRussian, ivanScramble, kolesnikovScramble])

  const handleLeave = useCallback(() => {
    if (!isRussian) return
    setIsRussian(false)
    ivanScramble.scrambleTo('IVAN')
    kolesnikovScramble.scrambleTo('KOLESNIKOV')
  }, [isRussian, ivanScramble, kolesnikovScramble])

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

  const isInNav = progress >= 0.95

  if (!mounted) return null

  return (
    <div
      className="fixed z-30"
      style={{
        left,
        top,
        mixBlendMode: 'difference',
        pointerEvents: 'none',
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
        onClick={handleNavClick}
      >
        <span
          className="font-bold text-white"
          style={{
            fontSize,
            lineHeight,
            letterSpacing: isRussian ? '-0.04em' : '-0.02em',
            paddingTop: isRussian ? `${fontSize * 0.03}px` : '0',
            display: 'block',
            transformOrigin: 'bottom left',
          }}
        >
          <span style={{ fontSize: isRussian ? '0.92em' : '1em' }}>
            {ivanScramble.display}
          </span>
        </span>
        <span
          className="font-bold text-white"
          style={{
            fontSize,
            lineHeight,
            letterSpacing: isRussian ? '-0.04em' : '-0.02em',
            paddingTop: isRussian ? `${fontSize * 0.03}px` : '0',
            marginTop: isInNav ? '-0.12em' : '0',
            display: 'block',
            transformOrigin: 'bottom left',
          }}
        >
          <span style={{ fontSize: isRussian ? '0.92em' : '1em' }}>
            {kolesnikovScramble.display}
          </span>
        </span>
      </div>
    </div>
  )
}

function BgImage() {
  const [progress, setProgress] = useState(0)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const handleScroll = () => {
      const p = Math.min(1, window.scrollY / window.innerHeight)
      setProgress(p)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const blur = progress * 20
  const opacity = 1 - progress
  const isMobile = mounted ? window.innerWidth < 768 : false

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
        transition: 'none',
        willChange: 'opacity, filter',
      }}
    >
      <img
        src="/photos/background.png"
        alt=""
        style={{
          width: isMobile ? '100vw' : '660px',
          height: 'auto',
        }}
        className="object-contain"
      />
    </div>
  )
}

export function Hero() {
  const [trailImages, setTrailImages] = useState<TrailImage[]>([])
  const [isScrolled, setIsScrolled] = useState(false)
  const containerRef = useRef<HTMLElement>(null)
  const lastTimeRef = useRef(0)
  const lastPosRef = useRef({ x: 0, y: 0 })
  const imageIdRef = useRef(0)

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
        onMouseMove={handleMouseMove}
        onTouchMove={handleTouchMove}
        className="relative h-screen bg-white flex items-center overflow-hidden"
      >
        {trailImages.map((img) => (
          <PixelTrailImage key={img.id} img={img} />
        ))}
        <BgImage />
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