'use client'

import { useState, useEffect, useRef } from 'react'
import { useMobile } from '@/hooks/use-mobile'

const criticalImages = [
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

const backgroundSrc = '/photos/background.jpg'

const criticalStaticImages = [
  '/images/hochschule.jpg',
  '/images/hochschule0.jpg',
  '/images/hochschule1.jpg',
  '/images/hochschule3.jpg',
  '/images/hochschule4.jpg',
  '/images/continental.jpg',
  '/images/continental1.jpg',
  '/images/continental2.jpg',
  '/images/hateaid.jpg',
  '/images/hateaid1.jpg',
  '/images/hateaid2.jpg',
  '/images/hateaid3.jpg',
  '/images/hateaid4.jpg',
  '/images/lebara.jpg',
  '/images/ganbatte.jpg',
  '/images/cavallo.jpg',
  '/images/bold.jpg',
  '/images/pocoloco.jpg',
  '/images/pocoloco1.jpg',
  '/images/glownation.jpg',
  '/images/tennisheine.jpg',
  '/images/gwa.jpg',
  '/images/weros.jpg',
  '/images/weros1.jpg',
  '/images/jing-jang.png',
  '/images/hsh-logo.png',
  '/images/hateaid-logo.png',
  '/images/cc-logo.png',
]

const criticalIcons = [
  '/icons/mmbbs.jpg',
  '/icons/hsh.jpg',
  '/icons/graco.jpg',
  '/icons/cc.jpg',
  '/icons/conti.jpg',
  '/icons/creatom.jpg',
  '/icons/freelancer.jpg',
  '/icons/bmw.jpg',
  '/icons/premiere-pro.png',
  '/icons/illustrator.png',
  '/icons/photoshop.png',
  '/icons/after-effects.png',
  '/icons/photoshop-lightroom.png',
  '/icons/xd.png',
  '/icons/indesign.png',
  '/icons/acrobat.png',
  '/icons/vs-code.png',
  '/icons/comfy-ui.png',
  '/icons/adobe-audition.png',
  '/icons/claude.png',
  '/icons/blender.png',
  '/icons/capcut.png',
  '/icons/fl-studio.png',
  '/icons/higgsfield.png',
  '/icons/powerpoint.png',
]

const criticalVideos = [
  '/videos/storytelling.mp4',
  '/videos/gwavideo.mp4',
]

const criticalModels = [
  '/models/figur01.glb',
]

const criticalMedia = Array.from(new Set([
  ...criticalImages,
  ...criticalStaticImages,
  ...criticalIcons,
  ...criticalVideos,
  ...criticalModels,
]))

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

function preloadVideo(src: string) {
  return new Promise<void>((resolve) => {
    const video = document.createElement('video')
    let done = false
    let timeout = 0

    const finishWithTimeoutClear = () => {
      window.clearTimeout(timeout)
      finish()
    }

    const cleanup = () => {
      video.removeEventListener('loadeddata', finishWithTimeoutClear)
      video.removeEventListener('canplaythrough', finishWithTimeoutClear)
      video.removeEventListener('error', finishWithTimeoutClear)
      video.removeAttribute('src')
      video.load()
    }

    const finish = () => {
      if (done) return
      done = true
      cleanup()
      resolve()
    }

    // Safety timeout so one problematic video cannot block 100% forever.
    timeout = window.setTimeout(finish, 15000)

    video.addEventListener('loadeddata', finishWithTimeoutClear, { once: true })
    video.addEventListener('canplaythrough', finishWithTimeoutClear, { once: true })
    video.addEventListener('error', finishWithTimeoutClear, { once: true })
    video.preload = 'auto'
    video.muted = true
    video.playsInline = true
    video.src = src
    video.load()
  })
}

function preloadBinary(src: string) {
  return fetch(src, { cache: 'force-cache' })
    .then((res) => {
      if (!res.ok) return null
      return res.arrayBuffer()
    })
    .then(() => undefined)
    .catch(() => undefined)
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

      const preloadTasks = criticalMedia.map((src) => {
        if (criticalVideos.includes(src)) {
          return preloadVideo(src)
        }
        if (criticalModels.includes(src)) {
          return preloadBinary(src)
        }
        return preloadImage(src)
      })

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
          src={backgroundSrc}
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
              flexDirection: 'row',
              alignItems: 'center',
              gap: isMobile ? fontSize * 0.12 : fontSize * 0.15,
              marginTop: fontSize * 0.045,
              opacity: percentOpacity,
              transition: 'opacity 300ms ease-out',
            }}
          >
            <div
              style={{
                width: isMobile ? fontSize * 2 : fontSize * 3,
                height: isMobile ? fontSize * 0.25 * 0.5 : fontSize * 0.35 * 0.6,
                backgroundColor: 'rgba(255, 255, 255, 0.3)',
                marginLeft: isMobile ? fontSize * 0.082 : fontSize * 0.072,
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
            <span
              className="font-bold text-white"
              style={{
                fontSize: isMobile ? fontSize * 0.215 : fontSize * 0.31,
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
    </div>
  )
}
