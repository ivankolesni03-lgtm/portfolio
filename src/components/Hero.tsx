'use client'

import { useState, useRef, useCallback, useEffect } from 'react'

// Zahlen + Sonderzeichen + Russische Zeichen
const chars = "0123456789!@#$%&*АБВГДЕЖИКЛМНОПРСТУФХЦ"

// Deine Fotos - 39 Bilder
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

// Extreme Größenvariation - von 50px bis 500px
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

interface TrailImage {
  id: number
  src: string
  x: number
  y: number
  width: number
  height: number
}

// Trail-Bild mit Canvas Pixel-Dissolve beim Verschwinden
function PixelTrailImage({ img }: { img: TrailImage }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const imgRef = useRef<HTMLImageElement | null>(null)
  const rafRef = useRef<number | null>(null)
  const startTimeRef = useRef<number>(Date.now())
  const DURATION = 2500  // ms – gleich wie setTimeout in Hero

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
      const t = Math.min(1, elapsed / DURATION)  // 0→1

      canvas.width = img.width
      canvas.height = img.height
      ctx.clearRect(0, 0, img.width, img.height)

      // Phasen:
      // 0.0–0.08: einblenden
      // 0.08–0.75: scharf sichtbar
      // 0.75–1.0: pixeliert + ausblenden
      let opacity = 1
      let pixelSize = 1

      if (t < 0.08) {
        opacity = t / 0.08
      } else if (t < 0.75) {
        opacity = 1
        pixelSize = 1
      } else {
        const exitT = (t - 0.75) / 0.25  // 0→1 in Exit-Phase
        opacity = 1 - exitT
        // Pixel wächst von 1 auf 24
        pixelSize = 1 + exitT * 23
      }

      ctx.globalAlpha = Math.max(0, opacity)

      // object-fit: cover – Bild zentriert zuschneiden, nicht verziehen
      const srcW = imgRef.current.naturalWidth
      const srcH = imgRef.current.naturalHeight
      const srcAspect = srcW / srcH
      const dstAspect = img.width / img.height
      let sx = 0, sy = 0, sw2 = srcW, sh2 = srcH
      if (srcAspect > dstAspect) {
        // Bild breiter als Canvas → links/rechts zuschneiden
        sw2 = srcH * dstAspect
        sx = (srcW - sw2) / 2
      } else {
        // Bild höher als Canvas → oben/unten zuschneiden
        sh2 = srcW / dstAspect
        sy = (srcH - sh2) / 2
      }

      if (pixelSize <= 1.5) {
        ctx.imageSmoothingEnabled = true
        ctx.drawImage(imgRef.current, sx, sy, sw2, sh2, 0, 0, img.width, img.height)
      } else {
        // Downscale → Upscale für Pixel-Effekt
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

// Preload all images immediately
if (typeof window !== 'undefined') {
  images.forEach((src) => {
    const img = new Image()
    img.src = src
  })
}

// Scramble Text Component
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
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }
    
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
        if (intervalRef.current) {
          clearInterval(intervalRef.current)
        }
        if (elementRef.current) {
          elementRef.current.textContent = text
        }
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

// Scramble für einzelnen String
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

// Animated Logo Component – scroll-linked mit Scramble Hover
export function AnimatedLogo({ isScrolled, onMouseMove }: { isScrolled: boolean; onMouseMove?: (e: React.MouseEvent) => void }) {
  const [progress, setProgress] = useState(0)
  const [isRussian, setIsRussian] = useState(false)
  // mounted: verhindert Hydration-Mismatch – SSR rendert nichts, Client übernimmt
  const [mounted, setMounted] = useState(false)
  const ivanScramble = useScramble('IVAN')
  const kolesnikovScramble = useScramble('KOLESNIKOV')

  useEffect(() => {
    // Scroll immer auf 0 beim ersten Load
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

  // Alle Berechnungen nur client-side nach Mount
  const vw = mounted ? window.innerWidth / 100 : 0
  const vh = mounted ? window.innerHeight / 100 : 0

  const startLeft = 8 * vw
  const endLeft = 32
  const left = startLeft + (endLeft - startLeft) * progress

  const startTop = 15 * vh
  const endTop = 24
  const top = startTop + (endTop - startTop) * progress

  const startSize = 8 * vw
  const endSize = 14
  const fontSize = startSize + (endSize - startSize) * progress

  const startLineHeight = 0.9
  const endLineHeight = 1.2
  const lineHeight = startLineHeight + (endLineHeight - startLineHeight) * progress

  // Hover: Vor+Nachname zusammen behandeln
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

  // Nav-Klick: scrollt zurück zu Hero
  const handleNavClick = useCallback(() => {
    if (progress >= 0.95) {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }, [progress])

  const isInNav = progress >= 0.95

  // Vor Mount nichts rendern → kein Hydration-Mismatch
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
      {/* Wrapper: hover-Fläche über beide Zeilen gemeinsam */}
      <div
        style={{
          pointerEvents: 'auto',
          cursor: isInNav ? 'pointer' : 'default',
          userSelect: 'none',
          display: 'flex',
          flexDirection: 'column',
          // In Nav: Nachname enger ran (negativer gap), im Hero normal
          gap: isInNav ? '-0.05em' : '0',
        }}
        onMouseEnter={handleEnter}
        onMouseLeave={handleLeave}
        onMouseMove={onMouseMove}
        onClick={handleNavClick}
      >
        <span
          className="font-bold text-white"
          style={{
            fontSize,
            lineHeight,
            letterSpacing: isRussian ? '-0.04em' : '-0.02em',
            // Grundlinie konstant: vertikale Ausrichtung via paddingBottom kompensiert
            // Russisch kleiner: font-size reduzieren, aber paddingTop ausgleichen damit
            // Grundlinie (Unterkante) gleich bleibt
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
            // In Nav: Nachname hochziehen
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

// Hintergrundbild – scroll-linked: pixeliert und wird durchsichtig beim Scrollen
function BgImage() {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      const p = Math.min(1, window.scrollY / window.innerHeight)
      setProgress(p)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Blur simuliert Pixelierung: 0px → 20px
  const blur = progress * 20
  // Opacity: 1 → 0
  const opacity = 1 - progress

  return (
    <div
      className="fixed pointer-events-none"
      style={{
        right: '1.5vw',
        bottom: '10vh',
        zIndex: 0, // ganz hinten
        opacity,
        filter: `blur(${blur}px)`,
        transition: 'none',
        willChange: 'opacity, filter',
      }}
    >
      <img
        src="/photos/background.png"
        alt=""
        width={660}
        height={495}
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

  // Scroll-Listener
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100)
    }
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // MouseMove auf dem Logo-Overlay – Koordinaten in section-relative umrechnen
  const handleLogoMouseMove = useCallback((e: React.MouseEvent) => {
    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect) return
    // Logo ist fixed → clientX/Y ist bereits viewport, section beginnt bei rect.top
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
      const randomImage = images[Math.floor(Math.random() * images.length)]
      const randomSize = sizes[Math.floor(Math.random() * sizes.length)]
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
    }
  }, [])

  // Mausbewegung → Bilder erscheinen (nur in Hero-Section)
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

      const randomImage = images[Math.floor(Math.random() * images.length)]
      const randomSize = sizes[Math.floor(Math.random() * sizes.length)]

      const newImg: TrailImage = {
        id: imageIdRef.current++,
        src: randomImage,
        x: x,
        y: y,
        width: randomSize.width,
        height: randomSize.height,
      }

      setTrailImages(prev => [...prev, newImg])

      setTimeout(() => {
        setTrailImages(prev => prev.filter(img => img.id !== newImg.id))
      }, 2500)
    }
  }, [])

  return (
    <>
      {/* Animated Logo */}
      <AnimatedLogo isScrolled={isScrolled} onMouseMove={handleLogoMouseMove} />

      {/* Hero Section */}
      <section
        ref={containerRef}
        onMouseMove={handleMouseMove}
        className="relative h-screen bg-white flex items-center overflow-hidden"
      >
        {/* Trail Images - ABSOLUTE in Section, mit Pixel-Dissolve */}
        {trailImages.map((img) => (
          <PixelTrailImage key={img.id} img={img} />
        ))}

        {/* Background Image - ganz hinten, scroll-linked fade + pixelate */}
        <BgImage />
      </section>
    </>
  )
}

// Quote Section
export function QuoteSection() {
  return (
    <section className="relative min-h-screen bg-[#1a1a1a] flex items-center justify-center px-8 md:px-16 lg:px-24">
      <div className="max-w-4xl text-center">
        <div
          className="relative"
          style={{
            animation: 'fadeInUp 0.8s ease-out',
          }}
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