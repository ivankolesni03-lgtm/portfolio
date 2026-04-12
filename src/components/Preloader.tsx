'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import { useMobile } from '@/hooks/use-mobile'

const criticalImages = [
  "/photos/background.jpg",
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

interface PreloaderProps {
  onComplete: () => void
}

function PixelatedImage({ src, progress, style, imgStyle }: { 
  src: string
  progress: number
  style?: React.CSSProperties
  imgStyle?: React.CSSProperties
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const imgRef = useRef<HTMLImageElement | null>(null)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    const image = new window.Image()
    image.src = src
    image.onload = () => {
      imgRef.current = image
      setLoaded(true)
    }
  }, [src])

  useEffect(() => {
    if (!loaded || !imgRef.current) return
    const canvas = canvasRef.current
    if (!canvas) return
    
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const img = imgRef.current
    const width = imgStyle?.width ? parseInt(String(imgStyle.width)) : img.naturalWidth
    const height = imgStyle?.height ? parseInt(String(imgStyle.height)) : (img.naturalHeight / img.naturalWidth) * width

    canvas.width = width
    canvas.height = height

    const maxPixelSize = 40
    const minPixelSize = 1
    const pixelSize = Math.max(minPixelSize, maxPixelSize - (progress / 100) * (maxPixelSize - minPixelSize))

    ctx.clearRect(0, 0, width, height)

    if (pixelSize <= 1.5) {
      ctx.imageSmoothingEnabled = true
      ctx.drawImage(img, 0, 0, width, height)
    } else {
      const pw = Math.max(1, Math.floor(width / pixelSize))
      const ph = Math.max(1, Math.floor(height / pixelSize))
      const tmp = document.createElement('canvas')
      tmp.width = pw
      tmp.height = ph
      const tCtx = tmp.getContext('2d')
      if (tCtx) {
        tCtx.imageSmoothingEnabled = true
        tCtx.drawImage(img, 0, 0, pw, ph)
        ctx.imageSmoothingEnabled = false
        ctx.drawImage(tmp, 0, 0, pw, ph, 0, 0, width, height)
      }
    }
  }, [progress, loaded, imgStyle])

  if (!loaded) return null

  return (
    <canvas
      ref={canvasRef}
      style={{
        ...style,
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
    setMounted(true)
  }, [])

  const vw = mounted ? width / 100 : 0
  const vh = mounted ? height / 100 : 0

  const left = isMobile ? 5 * vw : 8 * vw
  const top = isMobile ? 12 * vh : 15 * vh
  const fontSize = isMobile ? 13 * vw : 8 * vw

  const bgRight = isMobile ? -12 * vw : 1.5 * vw
  const bgTop = isMobile ? 30 * vh : undefined
  const bgBottom = isMobile ? undefined : 10 * vh
  const bgWidth = isMobile ? 100 * vw : 660

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    
    const total = criticalImages.length
    
    criticalImages.forEach(src => {
      const img = new window.Image()
      img.onload = img.onerror = () => {
        loadedRef.current++
        const newProgress = Math.min(100, Math.round((loadedRef.current / total) * 100))
        setProgress(newProgress)
        
        if (loadedRef.current >= total && !hasCompletedRef.current) {
          hasCompletedRef.current = true
          
          // Only fade out the percentage
          setPercentOpacity(0)
          
          // After percentage fades, instantly switch to real Hero
          setTimeout(() => {
            setIsVisible(false)
            document.body.style.overflow = ''
            onComplete()
          }, 300)
        }
      }
      img.src = src
    })

    return () => {
      document.body.style.overflow = ''
    }
  }, [onComplete])

  if (!isVisible || !mounted) return null

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
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
          pointerEvents: 'none',
        }}
      >
        <PixelatedImage
          src="/photos/background.jpg"
          progress={progress}
          imgStyle={{ width: bgWidth }}
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
              flexDirection: isMobile ? 'column' : 'row',
              alignItems: isMobile ? 'flex-start' : 'center',
              gap: isMobile ? fontSize * 0.08 : fontSize * 0.15,
              marginTop: fontSize * 0.1,
              opacity: percentOpacity,
              transition: 'opacity 300ms ease-out',
            }}
          >
            <span
              className="font-bold text-white"
              style={{
                fontSize: isMobile ? fontSize * 0.25 : fontSize * 0.35,
                lineHeight: 0.9,
                letterSpacing: '-0.02em',
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {progress}%
            </span>
            <div
              style={{
                width: isMobile ? fontSize * 2 : fontSize * 3,
                height: isMobile ? fontSize * 0.25 * 0.5 : fontSize * 0.35 * 0.6,
                backgroundColor: 'rgba(255, 255, 255, 0.3)',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  width: `${progress}%`,
                  height: '100%',
                  backgroundColor: '#ffffff',
                  transition: 'width 100ms ease-out',
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
