'use client'

import { useState, useEffect, useRef } from 'react'
import { useMobile } from '@/hooks/use-mobile'
import { getIntroLayout } from '@/lib/intro-layout'

const backgroundSrc = '/photos/background.jpg'

const criticalMedia: string[] = []

interface PreloaderProps {
  onComplete: () => void
}

function preloadImage(src: string) {
  return new Promise<void>((resolve) => {
    const image = new window.Image()
    image.onload = async () => {
      try {
        if (typeof image.decode === 'function') {
          await image.decode()
        }
      } catch {
        // Ignore decode errors, onload is sufficient fallback.
      }
      resolve()
    }
    image.onerror = () => resolve()
    image.src = src
  })
}

function PixelatedImage({ src, progress, width }: { src: string; progress: number; width: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const imageRef = useRef<HTMLImageElement | null>(null)
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    let cancelled = false
    const image = new window.Image()
    image.onload = () => {
      if (cancelled) return
      imageRef.current = image
      setIsReady(true)
    }
    image.onerror = () => {
      if (cancelled) return
      setIsReady(false)
    }
    image.src = src

    return () => {
      cancelled = true
    }
  }, [src])

  useEffect(() => {
    if (!isReady || !imageRef.current) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const image = imageRef.current
    const drawWidth = Math.max(1, Math.round(width))
    const drawHeight = Math.max(1, Math.round((image.naturalHeight / image.naturalWidth) * drawWidth))

    canvas.width = drawWidth
    canvas.height = drawHeight
    ctx.clearRect(0, 0, drawWidth, drawHeight)

    const maxPixelSize = 44
    const minPixelSize = 1
    const pixelSize = Math.max(minPixelSize, maxPixelSize - (progress / 100) * (maxPixelSize - minPixelSize))

    if (pixelSize <= 1.5) {
      ctx.imageSmoothingEnabled = true
      ctx.drawImage(image, 0, 0, drawWidth, drawHeight)
      return
    }

    const pixelWidth = Math.max(1, Math.floor(drawWidth / pixelSize))
    const pixelHeight = Math.max(1, Math.floor(drawHeight / pixelSize))
    const tmpCanvas = document.createElement('canvas')
    tmpCanvas.width = pixelWidth
    tmpCanvas.height = pixelHeight
    const tmpCtx = tmpCanvas.getContext('2d')
    if (!tmpCtx) return

    tmpCtx.imageSmoothingEnabled = true
    tmpCtx.drawImage(image, 0, 0, pixelWidth, pixelHeight)
    ctx.imageSmoothingEnabled = false
    ctx.drawImage(tmpCanvas, 0, 0, pixelWidth, pixelHeight, 0, 0, drawWidth, drawHeight)
  }, [isReady, progress, width])

  if (!isReady) return null

  return (
    <canvas
      ref={canvasRef}
      style={{
        width,
        height: 'auto',
        display: 'block',
      }}
    />
  )
}

export function Preloader({ onComplete }: PreloaderProps) {
  const [progress, setProgress] = useState(0)
  const [isVisible, setIsVisible] = useState(true)
  const [percentOpacity, setPercentOpacity] = useState(1)
  const loadedRef = useRef(0)
  const hasCompletedRef = useRef(false)
  const { isMobile, width, height } = useMobile()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const frame = requestAnimationFrame(() => setMounted(true))
    return () => cancelAnimationFrame(frame)
  }, [])

  const vw = mounted ? width / 100 : 0
  const vh = mounted ? height / 100 : 0
  const introLayout = getIntroLayout({ isMobile, width, height })

  const left = introLayout.nameLeft
  const top = introLayout.nameTop
  const fontSize = introLayout.nameFontSize

  const bgRight = isMobile ? -12 * vw : 1.5 * vw
  const bgTop = isMobile ? 30 * vh : undefined
  const bgBottom = isMobile ? undefined : 10 * vh
  const bgWidth = isMobile ? 100 * vw : 660

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    let cancelled = false

    const total = criticalMedia.length + 1

    const markLoaded = () => {
      loadedRef.current += 1
      const newProgress = Math.min(100, Math.round((loadedRef.current / total) * 100))
      setProgress(newProgress)

      if (loadedRef.current >= total && !hasCompletedRef.current) {
        hasCompletedRef.current = true
        setPercentOpacity(0)

        setTimeout(() => {
          setIsVisible(false)
          document.body.style.overflow = ''
          onComplete()
        }, 300)
      }
    }

    const startPreload = async () => {
      const bgTask = preloadImage(backgroundSrc)
      bgTask.finally(() => {
        if (!cancelled) markLoaded()
      })

      // Start all other assets after background has finished first.
      await bgTask
      if (cancelled) return

      const preloadTasks = criticalMedia.map((src) => preloadImage(src))

      preloadTasks.forEach((task) => {
        task.finally(() => {
          if (!cancelled) markLoaded()
        })
      })
    }

    startPreload()

    return () => {
      cancelled = true
      document.body.style.overflow = ''
    }
  }, [onComplete])

  if (!isVisible) return null

  if (!mounted) {
    return (
      <div style={{
        position: 'fixed', inset: 0, zIndex: 100010,
        backgroundColor: '#ffffff', pointerEvents: 'all',
      }} />
    )
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100010,
        backgroundColor: '#ffffff',
        pointerEvents: 'all',
      }}
    >
      {/* Background image - same position as Hero */}
      <div
        style={{
          position: 'fixed',
          right: bgRight,
          top: bgTop,
          bottom: bgBottom,
          maskImage: 'radial-gradient(ellipse at center, rgba(0,0,0,1) 76%, rgba(0,0,0,0) 100%)',
          WebkitMaskImage: 'radial-gradient(ellipse at center, rgba(0,0,0,1) 76%, rgba(0,0,0,0) 100%)',
          pointerEvents: 'none',
        }}
      >
        <PixelatedImage
          src={backgroundSrc}
          progress={progress}
          width={bgWidth}
        />
      </div>

      {/* Name - same position and style as Hero */}
      <div
        style={{
          position: 'fixed',
          left,
          top,
          zIndex: 30,
          mixBlendMode: 'difference',
          pointerEvents: 'none',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span
            className="font-bold text-white"
            style={{
              fontSize,
              lineHeight: 0.9,
              letterSpacing: '-0.02em',
              display: 'block',
            }}
          >
            IVAN
          </span>
          <span
            className="font-bold text-white"
            style={{
              fontSize,
              lineHeight: 0.9,
              letterSpacing: '-0.02em',
              display: 'block',
            }}
          >
            KOLESNIKOV
          </span>
          
          {/* Progress indicator - under KOLESNIKOV with same spacing */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              gap: isMobile ? 'clamp(7px, 2.2vw, 12px)' : fontSize * 0.15,
              marginTop: isMobile ? 'clamp(5px, 1.6vw, 9px)' : fontSize * 0.045,
              opacity: percentOpacity,
              transition: 'opacity 300ms ease-out',
            }}
          >
            <div
              style={{
                width: isMobile ? 'clamp(96px, 29vw, 148px)' : fontSize * 3,
                height: isMobile ? 'clamp(8px, 2.4vw, 12px)' : fontSize * 0.35 * 0.6,
                backgroundColor: 'rgba(255, 255, 255, 0.3)',
                marginLeft: isMobile ? 'clamp(4px, 1.3vw, 7px)' : fontSize * 0.072,
                overflow: 'hidden',
                borderRadius: 0,
              }}
            >
              <div
                style={{
                  width: `${progress}%`,
                  height: '100%',
                  backgroundColor: '#ffffff',
                  transition: 'width 100ms ease-out',
                  borderRadius: 0,
                }}
              />
            </div>
            <span
              className="font-bold text-white"
              style={{
                fontSize: isMobile ? 'clamp(15px, 4.4vw, 22px)' : fontSize * 0.31,
                lineHeight: 0.9,
                letterSpacing: '-0.02em',
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {progress}%
            </span>
          </div>
        </div>
      </div>

      {/* Experience Designer - matches Hero animation start position, static */}
      <div
        style={{
          position: 'fixed',
          left: introLayout.experienceLeft,
          top: introLayout.experienceTop,
          zIndex: 30,
          mixBlendMode: 'difference',
          pointerEvents: 'none',
          color: '#ffffff',
          fontWeight: 900,
          textTransform: 'uppercase',
          letterSpacing: '-1px',
          lineHeight: 1.12,
          fontSize: isMobile ? Math.min(34, Math.max(20, 6.4 * vw)) : Math.min(46, Math.max(28, 2.7 * vw)),
        }}
      >
        Experience<br />Designer
      </div>
    </div>
  )
}
