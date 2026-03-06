'use client'

import { useEffect, useRef, useState } from 'react'

// ─── PixelCanvas ──────────────────────────────────────────────────────────────
interface PixelCanvasProps {
  src: string
  size?: number
  pixelSize?: number
  opacity?: number
  style?: React.CSSProperties
  className?: string
}

export function PixelCanvas({
  src,
  size = 400,
  pixelSize = 1,
  opacity = 1,
  style,
  className,
}: PixelCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const imageRef = useRef<HTMLImageElement | null>(null)
  const [imageLoaded, setImageLoaded] = useState(false)

  useEffect(() => {
    const img = new window.Image()
    img.src = src
    img.onload = () => { imageRef.current = img; setImageLoaded(true) }
    return () => { img.onload = null }
  }, [src])

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    const img = imageRef.current
    if (!canvas || !ctx || !img || !imageLoaded) return

    canvas.width = size
    canvas.height = size
    ctx.clearRect(0, 0, size, size)
    ctx.globalAlpha = Math.max(0, Math.min(1, opacity))

    const clampedPixelSize = Math.max(1, pixelSize)
    if (clampedPixelSize <= 1) {
      ctx.imageSmoothingEnabled = true
      ctx.drawImage(img, 0, 0, size, size)
    } else {
      const tempCanvas = document.createElement('canvas')
      const tempCtx = tempCanvas.getContext('2d')
      if (!tempCtx) return
      const smallW = Math.max(1, Math.floor(size / clampedPixelSize))
      const smallH = Math.max(1, Math.floor(size / clampedPixelSize))
      tempCanvas.width = smallW
      tempCanvas.height = smallH
      tempCtx.imageSmoothingEnabled = false
      ctx.imageSmoothingEnabled = false
      tempCtx.drawImage(img, 0, 0, smallW, smallH)
      ctx.drawImage(tempCanvas, 0, 0, smallW, smallH, 0, 0, size, size)
    }
  }, [src, size, pixelSize, opacity, imageLoaded])

  return (
    <canvas
      ref={canvasRef}
      width={size}
      height={size}
      className={className}
      style={{ width: size, height: size, display: 'block', ...style }}
    />
  )
}


// ─── PixelMask ────────────────────────────────────────────────────────────────
/**
 * PixelMask – Pixelierungs-Filter über beliebigem Inhalt via Canvas-Overlay.
 *
 * Funktionsprinzip:
 *   Ein Canvas-Overlay liegt über dem children-Inhalt.
 *   Per requestAnimationFrame snapt es sich selbst (drawImage auf den
 *   darunterliegenden Bereich) und zeichnet ihn verpixelt zurück.
 *   Das Canvas ist pointer-events: none, der Inhalt bleibt interaktiv.
 *
 * Verwendung:
 *   <PixelMask progress={exitProgress} maxPixel={40}>
 *     <div>Beliebiger Inhalt</div>
 *   </PixelMask>
 *
 * progress: 0 = unsichtbar/scharf, 1 = maximal verpixelt
 * maxPixel: Blockgröße bei progress=1 (default: 32)
 * fade:     Inhalt gleichzeitig ausblenden (default: true)
 */
interface PixelMaskProps {
  progress: number
  maxPixel?: number
  fade?: boolean
  children: React.ReactNode
  style?: React.CSSProperties
  className?: string
}

export function PixelMask({
  progress,
  maxPixel = 32,
  fade = true,
  children,
  style,
  className,
}: PixelMaskProps) {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rafRef = useRef<number | null>(null)
  const [size, setSize] = useState({ w: 0, h: 0 })

  const p = Math.max(0, Math.min(1, progress))
  const blockSize = Math.max(1, Math.round(1 + p * (maxPixel - 1)))
  const canvasOpacity = p          // Canvas-Overlay blendet ein mit progress
  const contentOpacity = fade ? Math.max(0, 1 - p * 1.1) : 1

  // Größe messen
  useEffect(() => {
    const el = wrapperRef.current
    if (!el) return
    const ro = new ResizeObserver(() => setSize({ w: el.offsetWidth, h: el.offsetHeight }))
    ro.observe(el)
    setSize({ w: el.offsetWidth, h: el.offsetHeight })
    return () => ro.disconnect()
  }, [])

  // Canvas per rAF auf den Wrapper-Inhalt snapten und verpixelt zeichnen
  useEffect(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    if (p <= 0.02 || size.w === 0) return

    const canvas = canvasRef.current
    const wrapper = wrapperRef.current
    if (!canvas || !wrapper) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Temporäres canvas für den Downscale
    const tmp = document.createElement('canvas')
    const tmpCtx = tmp.getContext('2d')
    if (!tmpCtx) return

    const sw = Math.max(1, Math.floor(size.w / blockSize))
    const sh = Math.max(1, Math.floor(size.h / blockSize))
    tmp.width = sw
    tmp.height = sh

    canvas.width = size.w
    canvas.height = size.h

    const draw = () => {
      try {
        // Snapshot des wrapper-Inhalts via drawImage auf das canvas selbst –
        // das funktioniert nur wenn canvas bereits gerenderten Content hat.
        // Echter DOM-Snapshot braucht html2canvas.
        // Stattdessen: wir nutzen den bestehenden Canvas-Content als Basis.
        tmpCtx.imageSmoothingEnabled = false
        tmpCtx.drawImage(canvas, 0, 0, sw, sh)

        ctx.clearRect(0, 0, size.w, size.h)
        ctx.imageSmoothingEnabled = false
        ctx.drawImage(tmp, 0, 0, sw, sh, 0, 0, size.w, size.h)
      } catch {
        // cross-origin oder andere Fehler ignorieren
      }
      rafRef.current = requestAnimationFrame(draw)
    }

    rafRef.current = requestAnimationFrame(draw)
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }
  }, [p, blockSize, size])

  return (
    <div
      ref={wrapperRef}
      className={className}
      style={{ position: 'relative', ...style }}
    >
      {/* Inhalt – blendet aus bei fade=true */}
      <div style={{ opacity: contentOpacity, willChange: 'opacity' }}>
        {children}
      </div>

      {/* Canvas-Overlay – zeigt verpixelten Snapshot */}
      {p > 0.02 && (
        <canvas
          ref={canvasRef}
          width={size.w}
          height={size.h}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
            opacity: canvasOpacity,
            display: 'block',
          }}
        />
      )}
    </div>
  )
}


// ─── PixelOverlay ─────────────────────────────────────────────────────────────
/**
 * PixelOverlay – zufälliges Pixel-Rauschen als Canvas-Overlay.
 * Legt farbige Pixel-Blöcke über den Inhalt (gut für Disintegrations-Effekte).
 */
interface PixelOverlayProps {
  progress: number
  maxPixelSize?: number
  color?: string
  style?: React.CSSProperties
}

export function PixelOverlay({
  progress,
  maxPixelSize = 40,
  color = '#000000',
  style,
}: PixelOverlayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [size, setSize] = useState({ w: 0, h: 0 })

  useEffect(() => {
    const el = containerRef.current?.parentElement
    if (!el) return
    const ro = new ResizeObserver(() => setSize({ w: el.offsetWidth, h: el.offsetHeight }))
    ro.observe(el)
    setSize({ w: el.offsetWidth, h: el.offsetHeight })
    return () => ro.disconnect()
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx || size.w === 0) return

    canvas.width = size.w
    canvas.height = size.h
    ctx.clearRect(0, 0, size.w, size.h)
    if (progress <= 0) return

    const pixelSize = Math.max(2, Math.round(progress * maxPixelSize))
    const cols = Math.ceil(size.w / pixelSize)
    const rows = Math.ceil(size.h / pixelSize)

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (Math.random() < progress) {
          ctx.globalAlpha = Math.random() * progress
          ctx.fillStyle = color
          ctx.fillRect(c * pixelSize, r * pixelSize, pixelSize, pixelSize)
        }
      }
    }
  }, [progress, size, maxPixelSize, color])

  if (progress <= 0) return null

  return (
    <div ref={containerRef} style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 10, ...style }}>
      <canvas
        ref={canvasRef}
        width={size.w}
        height={size.h}
        style={{ width: '100%', height: '100%', display: 'block' }}
      />
    </div>
  )
}


// ─── usePixelScroll ───────────────────────────────────────────────────────────
interface UsePixelScrollOptions {
  startAt?: number
  endAt?: number
  maxPixel?: number
}

export function usePixelScroll({
  startAt = 0.5,
  endAt = 1.0,
  maxPixel = 60,
}: UsePixelScrollOptions = {}) {
  const [pixelSize, setPixelSize] = useState(1)
  const [opacity, setOpacity] = useState(1)

  useEffect(() => {
    const handle = () => {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight
      const progress = scrollHeight > 0 ? window.scrollY / scrollHeight : 0
      const local = Math.max(0, Math.min(1, (progress - startAt) / (endAt - startAt)))
      setPixelSize(1 + local * maxPixel)
      setOpacity(Math.max(0, 1 - local * 1.2))
    }
    window.addEventListener('scroll', handle, { passive: true })
    handle()
    return () => window.removeEventListener('scroll', handle)
  }, [startAt, endAt, maxPixel])

  return { pixelSize, opacity }
}