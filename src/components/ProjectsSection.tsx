'use client'
import { useState, useRef, useEffect, useCallback, useId } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'
import { useScroll } from '@/contexts/ScrollContext'
import { useMouse } from '@/contexts/MouseContext'
import { useScramble, runScramble } from '@/hooks/use-scramble'

const ALL_PROJECTS = [
  { id:1, title:{de:'Hochschule\nHannover',en:'Hannover\nUASA'}, field:{de:'Image\nKampagne',en:'Image\nCampaign'}, description:{de:'Mangelnde Brand-Sichtbarkeit und eine zu sachliche Web-Präsenz verhindern den emotionalen Zugang. „Home of Community" positioniert die Hochschule als ein Ort für Kreative.',en:'Lack of brand visibility and an overly factual web presence prevent emotional engagement. "Home of Community" positions the university as a place for creatives.'}, image:'/images/hochschule-projekt.jpg', images:['/images/hochschule-projekt.jpg'], tags:{de:['Social Media','OOH','Brand Strategie'],en:['Social Media','OOH','Brand Strategy']}, seamlessVideoSrc: '/videos/hsh-projekt.mp4', youtube: null, logo: '/icons/hsh-projekt.png' },
  { id:2, title:{de:'Continental',en:'Continental'}, field:{de:'Produkt\nKampagne',en:'Product\nCampaign'}, description:{de:'Einblicke in die globale Kommunikationslogik bei Continental. Begleitung des Product Drops Ice Contact 8 von der Agentur-Ideation bis zum Launch.',en:'Insights into global communication logic at Continental. Accompanying the Ice Contact 8 product drop from agency ideation to launch.'}, image:'/images/continental-projekt.jpg', images:['/images/continental-projekt.jpg','https://s7g10.scene7.com/is/image/conti/Continental_IceContact-8_-_Product_Video_en-AVS?fmt=jpg&wid=1600'], videoSrc:'https://s7g10.scene7.com/is/content/conti/Continental_IceContact-8_-_Product_Video_en-AVS.m3u8', tags:{de:['Strategie','Kampagne','Copywriting'],en:['Strategy','Campaign','Copywriting']}, youtube: null, logo: '/icons/continental-projekt.png' },
  { id:3, title:{de:'HateAid',en:'HateAid'}, field:{de:'Awareness\nKampagne',en:'Awareness\nCampaign'}, description:{de:'Awareness-Kampagne für die NGO HateAid gemeinsam mit Partneragentur Creative Team. Unser Claim „Einer für alle, alle gegen Hass." stellt Solidarität ins Zentrum und macht Hass im Netz sichtbar.',en:'Awareness campaign for the NGO HateAid together with partner agency Creative Team. Our claim "One for all, all against hate." puts solidarity at the centre and makes online hate visible.'}, image:'/images/hateaid-projekt.jpg', images:['/images/hateaid-projekt.jpg'], tags:{de:['NGO','Awareness','Storytelling','GWA'],en:['NGO','Awareness','Storytelling','GWA']}, seamlessVideoSrc: '/videos/hateaid-video.mp4', youtube: null, logo: '/icons/hateaid-projekt.png' },
  { id:9, title:{de:'BMW',en:'BMW'}, field:{de:'Generative\nIntelligence',en:'Generative\nIntelligence'}, description:{de:'Generative-Intelligence-Projekt für BMW mit Fokus auf Prompt-Strategien, Systemprompts für Content-Pipelines und Prototypen wie Outpainting. Ziel: AI-Use-Cases qualitativ bewerten, automatisierbar machen und markentauglich übersetzen.',en:'Generative intelligence project for BMW focused on prompt strategies, system prompts for content pipelines and prototypes like outpainting. The goal: evaluate AI use cases, automation potential and brand-ready output quality.'}, image:'/images/bmw-projekt.jpg', images:['/images/bmw-projekt.jpg','/images/bmw-projekt.jpg'], tags:{de:['Prompt Engineering','Content Pipeline','Generative Intelligence'],en:['Prompt Engineering','Content Pipeline','Generative Intelligence']}, seamlessVideoSrc: '/videos/bmw-projekt.mp4', youtube: null, logo: '/icons/bmw-projekt.png' },
  { id:10, title:{de:'Tennisheine',en:'Tennisheine'}, field:{de:'Bewegtbild',en:'Motion\nPicture'}, description:{de:'Bewegtbild-Produktion für den Tennisclub Tennisheine. Von der Konzeption über den Dreh bis zum fertigen Schnitt. Authentisches Storytelling im Sport.',en:'Moving image production for tennis club Tennisheine. From concept to shoot to final cut. Authentic storytelling in sport.'}, image:'/images/tennisheine-projekt.jpg', images:['/images/tennisheine-projekt.jpg','/images/tennisheine-projekt.jpg'], tags:{de:['Video','Schnitt','Sport','Storytelling'],en:['Video','Editing','Sport','Storytelling']}, seamlessVideoSrc: '/videos/tennisheine-video.mp4', youtube: null, logo: '/icons/tennisheine-projekt.png' },
]

// Archive – nicht in der Fullscreen-Vorschau, aber Daten bleiben erhalten
const ARCHIVED_PROJECTS = [
  { id:4, title:{de:'Lebara',en:'Lebara'}, field:{de:'Social Media\nMarketing',en:'Social Media\nMarketing'}, description:{de:'Social Media Content, Community Management und Memes für den Mobilfunkanbieter Lebara. Vom Briefing bis zum Performance Review. Umgesetzt im Rahmen meines Praktikums bei Graco in Berlin.',en:'Social media content, community management and memes for mobile provider Lebara. From briefing to performance review. Realised during my internship at Graco in Berlin.'}, image:'/images/lebara.png', images:['/images/lebara.png','/images/lebara.png'], tags:{de:['Praktikum','Content Creation','Memes','TikTok'],en:['Internship','Content Creation','Memes','TikTok']}, youtube: null, logo: '/icons/lebara-projekt.png' },
  { id:5, title:{de:'Ganbatte',en:'Ganbatte'}, field:{de:'Visuelle\nKommunikation',en:'Visual\nCommunication'}, description:{de:'Konzeption und Gestaltung einer Broschüre als Abgabe in Kommunikationsdesign. Von der Fotografie über das Texten bis zum Layout stammt alles aus meiner Hand. Als visuelle Inspiration diente meine Reise nach Thailand.',en:'Concept and design of a brochure as a submission in communication design. From photography to copywriting to layout, everything came from my own hand. My journey to Thailand served as visual inspiration.'}, image:'/images/ganbatte.jpg', images:['/images/ganbatte.jpg','/images/ganbatte.jpg'], tags:{de:['Broschüre','Fotografie','Layout','Thailand'],en:['Brochure','Photography','Layout','Thailand']}, youtube: null },
  { id:6, title:{de:'Cavallo',en:'Cavallo'}, field:{de:'UX & Web\nDesign',en:'UX & Web\nDesign'}, description:{de:'Entwicklung einer interaktiven Kommunikationskampagne für eine Eventlocation, inklusive Flowchart, Website-Layout und Mockups.',en:'Development of an interactive communication campaign for an event location, including flowchart, website layout and mockups.'}, image:'/images/cavallo.jpg', images:['/images/cavallo.jpg','/images/cavallo.jpg'], tags:{de:['UX','UI','Web Design','Mockup'],en:['UX','UI','Web Design','Mockup']}, youtube: null },
  { id:7, title:{de:'Bold.',en:'Bold.'}, field:{de:'Brand\nDesign',en:'Brand\nDesign'}, description:{de:'Corporate Branding für die Agentur Bold. Entwicklung einer konsistenten Markenidentität mit Logogestaltung, Typografie und Farbwelt. Motion Design und Postproduktion bringen die Benefits der Marke visuell auf den Punkt.',en:'Corporate branding for the agency Bold. Development of a consistent brand identity including logo design, typography and colour world. Motion design and post-production bring the brand benefits to the point visually.'}, image:'/images/bold.jpg', images:['/images/bold.jpg','/images/bold.jpg'], tags:{de:['Corporate Branding','Logo','Motion Design','Agentur'],en:['Corporate Branding','Logo','Motion Design','Agency']}, youtube: null },
  { id:8, title:{de:'pocoloco',en:'pocoloco'}, field:{de:'Corporate\nDesign',en:'Corporate\nDesign'}, description:{de:'Corporate Brand Communication für die kreative Agentur Pocoloco. Von der Markenstimme über das visuelle System bis zur digitalen Umsetzung mit Next.js und prozeduralen Scroll-Animationen.',en:'Corporate brand communication for the creative agency Pocoloco. From brand voice and visual system through to digital implementation with Next.js and procedural scroll animations.'}, image:'/images/pocoloco.jpg', images:['/images/pocoloco.jpg'], tags:{de:['Corporate Brand','Next.js','Animation','Agentur'],en:['Corporate Brand','Next.js','Animation','Agency']}, youtube: null },
  { id:12, title:{de:'Weros\nWebdynamics',en:'Weros\nWebdynamics'}, field:{de:'Fotografie',en:'Photography'}, description:{de:'Fotografie mit Technik sowie Pre- und Post-Production einer Arztpraxis im Auftrag für die Agentur Webdynamics. Professionelle Bildsprache, die Vertrauen und moderne Ästhetik verbindet.',en:'Photography with technique as well as pre- and post-production of a medical practice commissioned for the agency Webdynamics. Professional visual language combining trust and modern aesthetics.'}, image:'/images/weros.jpg', images:['/images/weros.jpg'], tags:{de:['Fotografie','Pre-Production','Post-Production','Arztpraxis'],en:['Photography','Pre-Production','Post-Production','Medical']}, youtube: null },
]

const PROJECTS = ALL_PROJECTS
type Project = (typeof PROJECTS)[number]
type InfoProject = (typeof ALL_PROJECTS)[number] | (typeof ARCHIVED_PROJECTS)[number]
const INFO_PROJECTS: InfoProject[] = [...ALL_PROJECTS, ...ARCHIVED_PROJECTS]
type Lang = 'de'|'en'

const activeViewCursorIds = new Set<string>()

function updateViewCursorBodyClass() {
  if (typeof document === 'undefined') return
  document.body.classList.toggle('view-cursor-open', activeViewCursorIds.size > 0)
}

const PROJECT_IMAGE_PRELOADS = Array.from(new Set(
  INFO_PROJECTS.flatMap((project) => [project.image, ...project.images]).filter(Boolean)
))

const PROJECT_VIDEO_PRELOADS = Array.from(new Set(
  ALL_PROJECTS.flatMap((project) => 'seamlessVideoSrc' in project && typeof project.seamlessVideoSrc === 'string'
    ? [project.seamlessVideoSrc]
    : [])
))

function preloadProjectMedia() {
  PROJECT_IMAGE_PRELOADS.forEach((src) => {
    const image = new window.Image()
    image.decoding = 'async'
    image.src = src
  })

  PROJECT_VIDEO_PRELOADS.forEach((src) => {
    const link = document.createElement('link')
    link.rel = 'preload'
    link.as = 'video'
    link.href = src
    document.head.appendChild(link)
  })
}

function PixelCanvas({ src, w, pixelSize = 1 }: { src: string; w: number; pixelSize?: number }) {
  const cvs    = useRef<HTMLCanvasElement>(null)
  const imgRef = useRef<HTMLImageElement | null>(null)
  const natHRef = useRef(0)
  const [natH, setNatH] = useState(0)

  const draw = useCallback(() => {
    const img = imgRef.current
    if (!img || !img.naturalWidth || !img.naturalHeight) return
    const h = natHRef.current
    if (!h || !w) return
    const c = cvs.current; const ctx = c?.getContext('2d')
    if (!c || !ctx) return
    if (c.width !== w || c.height !== h) { c.width = w; c.height = h }
    ctx.clearRect(0, 0, w, h)
    const px = Math.max(1, Math.round(pixelSize))
    if (px <= 1.5) {
      ctx.imageSmoothingEnabled = true
      ctx.drawImage(img, 0, 0, w, h)
    } else {
      const pw = Math.max(1, Math.floor(w / px))
      const ph = Math.max(1, Math.floor(h / px))
      const tmp = document.createElement('canvas'); tmp.width = pw; tmp.height = ph
      const tc = tmp.getContext('2d')!; tc.imageSmoothingEnabled = true
      tc.drawImage(img, 0, 0, pw, ph)
      ctx.imageSmoothingEnabled = false
      ctx.drawImage(tmp, 0, 0, pw, ph, 0, 0, w, h)
    }
  }, [w, pixelSize])

  useEffect(() => {
    let cancelled = false
    const img = new window.Image()
    img.onload = () => {
      if (cancelled) return
      imgRef.current = img
      const h = Math.round(w * img.naturalHeight / img.naturalWidth)
      natHRef.current = h
      setNatH(h)
      draw()
    }
    img.onerror = () => {
      if (cancelled) return
      imgRef.current = null
      natHRef.current = Math.round(w * 0.75)
      setNatH(Math.round(w * 0.75))
    }
    img.src = src
    return () => { cancelled = true }
  }, [src, w, draw])

  useEffect(() => {
    if (natH) draw()
  }, [pixelSize, draw, natH])

  return (
    <div style={{ position: 'relative', lineHeight: 0, minHeight: natH || Math.round(w * 0.75), backgroundImage: `url(${src})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
      <img src={src} alt="" loading="eager" decoding="async" fetchPriority="high" style={{ display: 'block', width: '100%', height: 'auto', opacity: natH > 0 ? 0 : 1 }} />
      {natH > 0 && <canvas ref={cvs} width={w} height={natH} style={{ position: 'absolute', inset: 0, display: 'block', width: '100%', height: '100%' }} />}
    </div>
  )
}

function PixelCarouselOneShot({ images, w, animateIn = true }: {
  images: string[]; w: number; animateIn?: boolean
}) {
  const [curSrc, setCurSrc] = useState(images[0])
  const [px, setPx] = useState(animateIn ? 28 : 1)
  const raf  = useRef(0)
  const iv   = useRef<ReturnType<typeof setInterval>|null>(null)
  const busy = useRef(false)
  const idxR = useRef(0)

  const doTransition = useCallback(() => {
    if (busy.current) return
    busy.current = true
    const ni = (idxR.current + 1) % images.length
    const nSrc = images[ni]
    cancelAnimationFrame(raf.current)
    let t0: number|null = null
    const step = (ts: number) => {
      if (!t0) t0 = ts
      const t = Math.min(1, (ts - t0) / 700)
      if (t < 0.5) {
        setPx(1 + (t / 0.5) * 27)
      } else {
        if (idxR.current !== ni) { idxR.current = ni; setCurSrc(nSrc) }
        setPx(1 + ((1 - t) / 0.5) * 27)
      }
      if (t < 1) raf.current = requestAnimationFrame(step)
      else { setPx(1); busy.current = false }
    }
    raf.current = requestAnimationFrame(step)
  }, [images])

  const startCarousel = useCallback(() => {
    if (images.length > 1 && !iv.current) {
      iv.current = setInterval(() => doTransition(), 3000)
    }
  }, [doTransition, images.length])

  useEffect(() => {
    if (animateIn) {
      cancelAnimationFrame(raf.current)
      let t0: number|null = null
      const step = (ts: number) => {
        if (!t0) t0 = ts
        const t = Math.min(1, (ts - t0) / 500)
        setPx(1 + (1 - t) * 27)
        if (t < 1) raf.current = requestAnimationFrame(step)
        else { setPx(1); startCarousel() }
      }
      raf.current = requestAnimationFrame(step)
    } else {
      startCarousel()
    }
    return () => { clearInterval(iv.current!); cancelAnimationFrame(raf.current) }
  }, [animateIn, startCarousel])

  return <PixelCanvas src={curSrc} w={w} pixelSize={px} />
}



function ProjectCard({ project, overlayOpen, onClick, enterProgress, coverProgress, onViewHover, isMobile, layerIndex }: {
  project: Project
  overlayOpen: boolean
  onClick: () => void
  enterProgress: number
  coverProgress: number
  onViewHover: (hover: boolean) => void
  isMobile: boolean
  layerIndex: number
}) {
  const { language } = useLanguage()
  const lang = language as Lang
  const titleText = project.title[lang]
  const fieldText = project.field[lang]
  const descText = project.description[lang]
  const { disp: titleDisp, scramble: scrambleTitle } = useScramble(titleText)
  const { disp: fieldDisp, scramble: scrambleField } = useScramble(fieldText)
  const { disp: descDisp } = useScramble(descText)
  const cardRef = useRef<HTMLDivElement>(null)
  const imageRef = useRef<HTMLImageElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const seamlessVideoRef = useRef<HTMLVideoElement>(null)
  const hlsRef = useRef<any>(null)
  const hlsDurationRef = useRef<number>(0)
  const [inViewport, setInViewport] = useState(false)
  const [videoReady, setVideoReady] = useState(false)
  const [seamlessVideoReady, setSeamlessVideoReady] = useState(false)
  const [revealed, setRevealed] = useState(false)
  const hasVideo = project.id === 2 && typeof project.videoSrc === 'string'
  const hasSeamlessVideo = 'seamlessVideoSrc' in project && typeof project.seamlessVideoSrc === 'string'
  const shouldMountSeamlessVideo = hasSeamlessVideo && inViewport

  const p = Math.max(0, Math.min(1, enterProgress))
  const snapStart = 0.92
  const snapT = Math.max(0, Math.min(1, (p - snapStart) / (1 - snapStart)))
  const snapEase = p <= snapStart ? p : snapStart + (1 - Math.pow(1 - snapT, 4)) * (1 - snapStart)
  const y = 100 - snapEase * 100
  const cardOpacity = p < -0.001 ? 0 : 1
  const isActiveFullscreen = p > 0.9 && coverProgress < 0.08
  const canClick = isActiveFullscreen && !overlayOpen
  const canInteract = (canClick || revealed) && !overlayOpen
  const cardZ = p > 0.001 ? 62 + layerIndex : layerIndex
  // Logo shifts up slightly as user scrolls through the project
  const logoShift = coverProgress > 0 ? coverProgress * -60 : 0
  const logoFloat = `translateY(${(1 - p) * 140 + logoShift}px)`
  const exitT = Math.max(0, Math.min(1, (enterProgress - 1.08) / 0.22))
  const exitBlur = exitT * 9
  const exitDim = exitT * 0.28
  const cardFilter = `${overlayOpen ? 'blur(8px) ' : ''}${exitBlur > 0.01 ? `blur(${exitBlur}px) ` : ''}${exitDim > 0.001 ? `brightness(${1 - exitDim})` : ''}`.trim()

  useEffect(() => {
    if (coverProgress > 0.12 || p < 0.9) {
      setRevealed(false)
    }
  }, [coverProgress, p])

  useEffect(() => {
    const el = cardRef.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => setInViewport(entry.isIntersecting),
      { threshold: 0.02 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  useEffect(() => {
    if (!hasVideo) return
    const v = videoRef.current
    if (!v) return
    let cancelled = false
    setVideoReady(false)

    const onReady = () => {
      if (!cancelled) setVideoReady(true)
    }
    v.addEventListener('loadeddata', onReady)
    v.addEventListener('canplay', onReady)
    v.addEventListener('playing', onReady)
    v.addEventListener('timeupdate', onReady)

    const setupVideo = async () => {
      const src = project.videoSrc as string
      v.crossOrigin = 'anonymous'
      if (v.canPlayType('application/vnd.apple.mpegurl')) {
        v.src = src
      } else {
        const mod = await import('hls.js')
        const Hls = mod.default
        if (Hls.isSupported()) {
          hlsRef.current = new Hls({
            enableWorker: true,
            lowLatencyMode: true,
          })
          hlsRef.current.on(Hls.Events.ERROR, (_event: unknown, data: any) => {
            if (!data?.fatal) return
            const type = data?.type
            if (type === Hls.ErrorTypes.NETWORK_ERROR) {
              hlsRef.current?.startLoad()
              return
            }
            if (type === Hls.ErrorTypes.MEDIA_ERROR) {
              hlsRef.current?.recoverMediaError()
              return
            }
            hlsRef.current?.destroy()
            hlsRef.current = null
            v.src = src
          })
          hlsRef.current.on(Hls.Events.LEVEL_LOADED, (_event: unknown, data: any) => {
            const d = data?.details?.totalduration
            if (typeof d === 'number' && Number.isFinite(d) && d > 0) {
              hlsDurationRef.current = d
            }
          })
          hlsRef.current.on(Hls.Events.MANIFEST_PARSED, () => {
            const manifestDur = v.duration
            if (typeof manifestDur === 'number' && Number.isFinite(manifestDur) && manifestDur > 0) {
              hlsDurationRef.current = manifestDur
            }
          })
          hlsRef.current.loadSource(src)
          hlsRef.current.attachMedia(v)
        }
      }
    }

    setupVideo()

    return () => {
      cancelled = true
      v.removeEventListener('loadeddata', onReady)
      v.removeEventListener('canplay', onReady)
      v.removeEventListener('playing', onReady)
      v.removeEventListener('timeupdate', onReady)
      if (hlsRef.current) {
        hlsRef.current.destroy()
        hlsRef.current = null
      }
    }
  }, [hasVideo, project.videoSrc])

  useEffect(() => {
    if (!hasVideo) return
    const v = videoRef.current
    if (!v) return
    if (!overlayOpen && inViewport) {
      v.muted = true
      v.setAttribute('muted', '')
      v.setAttribute('playsinline', '')
      v.play().catch(() => {})
    } else {
      v.pause()
    }
  }, [hasVideo, overlayOpen, inViewport])

  useEffect(() => {
    if (!hasVideo) return
    const v = videoRef.current
    if (!v) return
    let rafId = 0
    let knownDuration = 0

    const trimTail = () => {
      // Try all sources for the duration
      if (knownDuration === 0) {
        const nd = v.duration
        if (Number.isFinite(nd) && nd > 1 && nd < 86400) {
          knownDuration = nd
        } else if (hlsDurationRef.current > 0) {
          knownDuration = hlsDurationRef.current
        } else if (v.seekable.length > 0) {
          const s = v.seekable.end(v.seekable.length - 1)
          if (s > 1) knownDuration = s
        }
      }
      if (knownDuration > 0 && v.currentTime >= knownDuration - 3.0) {
        v.currentTime = 0
        v.play().catch(() => {})
      }
      rafId = requestAnimationFrame(trimTail)
    }
    rafId = requestAnimationFrame(trimTail)

    const onEnd = () => { v.currentTime = 0; v.play().catch(() => {}) }
    const onDur = () => {
      const nd = v.duration
      if (Number.isFinite(nd) && nd > 1 && nd < 86400) knownDuration = nd
    }
    v.addEventListener('ended', onEnd)
    v.addEventListener('durationchange', onDur)
    v.addEventListener('loadedmetadata', onDur)
    return () => {
      cancelAnimationFrame(rafId)
      v.removeEventListener('ended', onEnd)
      v.removeEventListener('durationchange', onDur)
      v.removeEventListener('loadedmetadata', onDur)
    }
  }, [hasVideo])

  return (
    <div
      ref={cardRef}
      onClick={() => {
        if (!canClick) return
        onViewHover(false)
        setRevealed(r => !r)
      }}
      onMouseEnter={() => {
        if (!canInteract) return
        scrambleTitle()
        scrambleField()
        if (canClick && !revealed) onViewHover(true)
      }}
      onMouseMove={() => {
        if (canClick && !revealed) onViewHover(true)
      }}
      onMouseLeave={() => onViewHover(false)}
      onTouchStart={() => { if (canInteract) { scrambleTitle(); scrambleField() } }}
      style={{
        position: 'absolute',
        inset: 0,
        cursor: canClick ? 'pointer' : 'default',
        opacity: cardOpacity,
        transform: `translateY(${y}%)`,
        transition: 'none',
        pointerEvents: canInteract ? 'auto' : 'none',
        overflow: 'hidden',
        borderRadius: 0,
        backgroundColor: '#0a0a0a',
        backgroundImage: `url(${project.image})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        filter: cardFilter || 'none',
        willChange: 'transform',
        zIndex: cardZ,
      }}
    >
      {hasVideo && (
        <video
          ref={videoRef}
          muted
          playsInline
          autoPlay
          loop
          preload="auto"
          poster={project.image}
          onLoadedMetadata={() => setVideoReady(true)}
          onPlaying={() => setVideoReady(true)}
          onTimeUpdate={() => setVideoReady(true)}
          style={{
            position: 'absolute',
            inset: 0,
            display: 'block',
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            pointerEvents: 'none',
          }}
        />
      )}
      {shouldMountSeamlessVideo && (
        <video
          ref={seamlessVideoRef}
          src={project.seamlessVideoSrc as string}
          muted
          loop
          playsInline
          autoPlay
          preload="auto"
          onLoadedData={() => setSeamlessVideoReady(true)}
          onCanPlay={() => setSeamlessVideoReady(true)}
          onPlaying={() => setSeamlessVideoReady(true)}
          onTimeUpdate={() => setSeamlessVideoReady(true)}
          onError={() => setSeamlessVideoReady(false)}
          style={{
            position: 'absolute',
            inset: 0,
            display: 'block',
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'center center',
            pointerEvents: 'none',
          }}
        />
      )}
      <img ref={imageRef} src={project.image} alt="" loading="eager" decoding="async" fetchPriority="high" style={{
        position: 'absolute',
        inset: 0,
        display: 'block', width: '100%', height: '100%', objectFit: 'cover',
        transition: 'opacity 0.4s ease', userSelect: 'none', pointerEvents: 'none',
        zIndex: 1,
        opacity: (hasVideo && videoReady) || (hasSeamlessVideo && seamlessVideoReady) ? 0 : 1,
      }} />
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(to top,rgba(0,0,0,0.56) 0%,rgba(0,0,0,0.18) 45%,rgba(0,0,0,0.06) 70%,transparent 100%)',
        zIndex: 2,
      }} />
      {/* Reveal scrim for readability */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 3,
        background: 'linear-gradient(to top, rgba(0,0,0,0.74) 0%, rgba(0,0,0,0.42) 38%, rgba(0,0,0,0.14) 70%, transparent 100%)',
        opacity: revealed ? 1 : 0,
        transition: 'opacity 0.5s ease',
        pointerEvents: 'none',
      }} />

      {/* Logo: centered at original resting position */}
      {'logo' in project && project.logo && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          paddingRight: isMobile ? '0.5vw' : '1vw',
          paddingBottom: isMobile ? '0.5vh' : '1vh',
          transform: logoFloat,
          pointerEvents: 'none', zIndex: 5,
          opacity: revealed ? 0 : 1,
          transition: 'opacity 0.5s ease',
        }}>
          <img src={project.logo} alt="" style={{
            maxWidth: project.id === 9 ? (isMobile ? '38vw' : '20vw') : (isMobile ? '50vw' : '28vw'),
            maxHeight: project.id === 9 ? '32vh' : '42vh', objectFit: 'contain',
            filter: 'drop-shadow(0 8px 32px rgba(0,0,0,0.4))',
          }} />
        </div>
      )}

      {/* Reveal text over the project */}
      <div style={{
        position: 'absolute',
        left: isMobile ? '6vw' : '8vw',
        right: isMobile ? '6vw' : '34vw',
        bottom: isMobile ? '9vh' : '12vh',
        zIndex: 6, pointerEvents: 'none',
        opacity: revealed ? 1 : 0,
        transform: revealed ? 'translateY(0)' : 'translateY(28px)',
        transition: 'opacity 0.55s ease, transform 0.6s cubic-bezier(0.16,1,0.3,1)',
      }}>
        <div style={{
          fontSize: isMobile ? '10vw' : 'clamp(40px,6vw,96px)',
          fontWeight: 900, lineHeight: 0.9, letterSpacing: '-2px',
          textTransform: 'uppercase', color: '#ffffff', whiteSpace: 'pre-line',
          textShadow: '0 12px 36px rgba(0,0,0,0.45)',
        }}>{titleDisp}</div>
        <div style={{
          display: 'inline-block', marginTop: isMobile ? '0.5em' : '0.4em',
          fontSize: isMobile ? '4.6vw' : 'clamp(20px,2.4vw,40px)',
          fontWeight: 700, fontStyle: 'italic', lineHeight: 0.95, letterSpacing: '-0.6px',
          textTransform: 'uppercase', color: '#ffffff', whiteSpace: 'pre-line',
          textShadow: '0 10px 24px rgba(0,0,0,0.4)',
        }}>{fieldDisp}</div>
        <p style={{
          marginTop: isMobile ? '1.1em' : '1em',
          fontSize: isMobile ? '3.6vw' : 'clamp(14px,1.05vw,18px)',
          fontWeight: 400, lineHeight: 1.45, color: 'rgba(255,255,255,0.96)',
          maxWidth: isMobile ? '88vw' : '40vw',
          textShadow: '0 6px 18px rgba(0,0,0,0.4)',
        }}>{descDisp}</p>
        <div style={{
          marginTop: isMobile ? '1.2em' : '1.1em',
          display: 'flex', flexWrap: 'wrap', gap: '8px',
        }}>
          {project.tags[lang].map((t, ti) => (
            <span key={`${t}-${ti}`} style={{
              border: '1px solid rgba(255,255,255,0.4)',
              color: '#ffffff', fontSize: isMobile ? '3vw' : '11px',
              fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase',
              padding: '5px 10px', borderRadius: '999px',
            }}>{t}</span>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Cursor label (View on mini-cards, X on overlays) ─────────────────────────
export function ViewCursor({ show, mode = 'view' }: { show: boolean; mode?: 'view' | 'close' }) {
  const { mouseX, mouseY } = useMouse()
  const { vw } = useScroll()
  const cursorId = useId()

  useEffect(() => {
    const active = vw >= 768 && show
    if (active) activeViewCursorIds.add(cursorId)
    else activeViewCursorIds.delete(cursorId)
    updateViewCursorBodyClass()

    return () => {
      activeViewCursorIds.delete(cursorId)
      updateViewCursorBodyClass()
    }
  }, [cursorId, show, vw])

  if (vw < 768) return null
  const isClose = mode === 'close'
  const visible = show
  return (
    <div className="x-cursor-label" style={{
      position: 'fixed', left: mouseX, top: mouseY,
      transform: 'translate(-50%, -50%)',
      zIndex: isClose ? 1000003 : 200001, pointerEvents: 'none',
      opacity: visible ? 1 : 0,
      visibility: visible ? 'visible' : 'hidden',
      transition: visible ? 'opacity 0.12s ease' : 'none',
    }}>
      {isClose ? (
        <svg width="26" height="26" viewBox="0 0 26 26" fill="none" style={{
          transform: visible ? 'scale(1)' : 'scale(0.6)',
          transition: 'transform 0.15s ease',
          filter: 'drop-shadow(0 3px 10px rgba(0,0,0,0.5))',
        }}>
          <line x1="5" y1="5" x2="21" y2="21" stroke="#ffffff" strokeWidth="4" strokeLinecap="square"/>
          <line x1="21" y1="5" x2="5" y2="21" stroke="#ffffff" strokeWidth="4" strokeLinecap="square"/>
        </svg>
      ) : (
        <div style={{
          background: '#ffffff', color: '#0a0a0a',
          padding: '5px 9px', borderRadius: '0px',
          fontSize: 11, fontWeight: 900, letterSpacing: '0.1em',
          textTransform: 'uppercase', whiteSpace: 'nowrap',
          transform: show ? 'scale(1)' : 'scale(0.6)',
          transition: 'transform 0.2s ease',
          boxShadow: '0 6px 18px rgba(0,0,0,0.22)',
        }}>View</div>
      )}
    </div>
  )
}

export function ProjectsSection({ onOverlayChange }: { onOverlayChange?: (open: boolean) => void }) {
  const { language } = useLanguage()
  const lang = language as Lang
  const { vw, vh, scrollY, mounted } = useScroll()
  const sectionRef = useRef<HTMLElement>(null)
  const [sectionProgress, setSectionProgress] = useState(0)
  const [openIdx, setOpenIdx] = useState<number|null>(null)
  const [overlayCursorVisible, setOverlayCursorVisible] = useState(false)
  
  const isMobile = vw < 768

  const open  = (i: number) => {
    if (aiSectionVisible) return
    const infoIdx = INFO_PROJECTS.findIndex(p => p.id === PROJECTS[i].id)
    setOpenIdx(infoIdx >= 0 ? infoIdx : i)
    setOverlayCursorVisible(true)
    onOverlayChange?.(true)
  }
  const close = () => { setOpenIdx(null); setOverlayCursorVisible(false); onOverlayChange?.(false) }
  const nav   = (i: number) => {
    setOpenIdx(i)
  }

  const overlayOpen = openIdx !== null
  const steps = PROJECTS.length
  const segment = 1 / steps
  const enterBias = 1.05
  const trailingHoldVh = 800
  const [viewHover, setViewHover] = useState(false)
  const [miniSectionVisible, setMiniSectionVisible] = useState(false)
  const [aiSectionVisible, setAiSectionVisible] = useState(false)

  useEffect(() => {
    preloadProjectMedia()
  }, [])

  useEffect(() => {
    if (!mounted) return
    const sec = sectionRef.current
    if (!sec) return
    const scrolled = -sec.getBoundingClientRect().top
    const total = sec.offsetHeight - vh
    const next = total <= 0 ? 0 : Math.max(0, Math.min(1, scrolled / total))
    const frame = requestAnimationFrame(() => setSectionProgress(next))
    return () => cancelAnimationFrame(frame)
  }, [scrollY, vh, mounted])

  useEffect(() => {
    const miniEl = document.getElementById('mini-projekte-section')
    if (!miniEl) return
    const obs = new IntersectionObserver(
      ([entry]) => setMiniSectionVisible(entry.isIntersecting),
      { threshold: 0.01 }
    )
    obs.observe(miniEl)
    return () => obs.disconnect()
  }, [])

  useEffect(() => {
    const aiEl = document.getElementById('ai-section')
    if (!aiEl) return
    const obs = new IntersectionObserver(
      ([entry]) => setAiSectionVisible(entry.isIntersecting),
      { threshold: 0.01 }
    )
    obs.observe(aiEl)
    return () => obs.disconnect()
  }, [])

  return (
    <>
      <section ref={sectionRef} id="projekte" data-textcolor="white" style={{
        backgroundColor: 'transparent',
        height: `${Math.max(420, steps * 90 + trailingHoldVh)}vh`,
        position: 'relative', zIndex: isMobile ? 20 : 20,
        marginTop: '15vh',
      }}>
        <div style={{
          position: 'sticky', top: 0, height: '100vh', width: '100%', overflow: 'hidden',
          backgroundColor: 'transparent',
          filter: overlayOpen ? 'blur(8px)' : 'none',
          transition: 'filter 0.35s ease',
        }}>
          {(() => {
            // Standard stack: each card enters in sequence, HSH starts fully visible.
            const leadFrac = 0.03
            const sp = sectionProgress
            const stackProgress = sp <= leadFrac ? 0 : (sp - leadFrac) / (1 - leadFrac)
            const enters = PROJECTS.map((_, i) => (stackProgress - i * segment) / segment + enterBias)
            if (sp < leadFrac) {
              enters[0] = 1
              enters[1] = 0
            }

            return PROJECTS.map((p, i) => {
              const enter = enters[i]
              const coverProgress = i < PROJECTS.length - 1
                ? Math.max(0, Math.min(1, enters[i + 1]))
                : 0
              return (
                <ProjectCard
                  key={p.id}
                  project={p}
                  overlayOpen={overlayOpen}
                  onClick={() => open(i)}
                  enterProgress={enter}
                  coverProgress={coverProgress}
                  onViewHover={setViewHover}
                  isMobile={isMobile}
                  layerIndex={i}
                />
              )
            })
          })()}
        </div>
      </section>
      <ViewCursor show={viewHover && !overlayOpen && !miniSectionVisible} mode="view" />
      <ViewCursor show={overlayCursorVisible} mode="close" />
      {openIdx !== null && <Overlay idx={openIdx} projects={INFO_PROJECTS} onClose={close} onCloseStart={() => { setOverlayCursorVisible(false); onOverlayChange?.(false) }} onNav={nav} />}
    </>
  )
}

// ─── Magnetic Arrow Button ────────────────────────────────────────────────────
function MagnetArrow({ side, mob, onClick, label, visible }: {
  side: 'left' | 'right'; mob: boolean; onClick: () => void; label: string; visible: boolean
}) {
  const btnRef = useRef<HTMLButtonElement>(null)
  const svgRef = useRef<HTMLSpanElement>(null)
  const animRef = useRef<number>(0)
  const stateRef = useRef({ hovering: false, cx: 0, cy: 0, tx: 0, ty: 0, ax: 0, ay: 0, scale: 1, targetScale: 1 })

  useEffect(() => {
    const btn = btnRef.current
    const svg = svgRef.current
    if (!btn || !svg) return

    const MAGNET_RADIUS = 12
    const PULL = 0.85
    const LERP_HOVER = 0.35
    const LERP_LEAVE = 0.22
    const SCALE_HOVER = 1.5
    const SCALE_LERP = 0.25

    let mouseX = 0, mouseY = 0

    const onMove = (e: MouseEvent) => { mouseX = e.clientX; mouseY = e.clientY }
    window.addEventListener('mousemove', onMove)

    const onEnter = () => {
      const s = stateRef.current
      s.hovering = true
      s.targetScale = SCALE_HOVER
      const r = btn.getBoundingClientRect()
      s.cx = r.left + r.width / 2
      s.cy = r.top + r.height / 2
      document.body.classList.add('hide-x-cursor')
    }

    const onBtnMove = () => {
      const s = stateRef.current
      const r = btn.getBoundingClientRect()
      s.cx = r.left + r.width / 2
      s.cy = r.top + r.height / 2
      let dx = (mouseX - s.cx) * PULL
      let dy = (mouseY - s.cy) * PULL
      const dist = Math.hypot(dx, dy)
      if (dist > MAGNET_RADIUS) {
        dx = (dx / dist) * MAGNET_RADIUS
        dy = (dy / dist) * MAGNET_RADIUS
      }
      s.tx = dx; s.ty = dy
    }

    const onLeave = () => {
      const s = stateRef.current
      s.hovering = false
      s.targetScale = 1
      s.tx = 0; s.ty = 0
      document.body.classList.remove('hide-x-cursor')
    }

    btn.addEventListener('mouseenter', onEnter)
    btn.addEventListener('mousemove', onBtnMove)
    btn.addEventListener('mouseleave', onLeave)

    const animate = () => {
      const s = stateRef.current
      const lerp = s.hovering ? LERP_HOVER : LERP_LEAVE
      s.ax += (s.tx - s.ax) * lerp
      s.ay += (s.ty - s.ay) * lerp
      s.scale += (s.targetScale - s.scale) * SCALE_LERP
      svg.style.transform = `translate(${s.ax.toFixed(2)}px, ${s.ay.toFixed(2)}px) scale(${s.scale.toFixed(3)})`
      animRef.current = requestAnimationFrame(animate)
    }
    animRef.current = requestAnimationFrame(animate)

    return () => {
      window.removeEventListener('mousemove', onMove)
      btn.removeEventListener('mouseenter', onEnter)
      btn.removeEventListener('mousemove', onBtnMove)
      btn.removeEventListener('mouseleave', onLeave)
      document.body.classList.remove('hide-x-cursor')
      cancelAnimationFrame(animRef.current)
    }
  }, [])

  return (
    <button
      ref={btnRef}
      aria-label={label}
      onPointerDown={(e) => e.stopPropagation()}
      onClick={(e) => { e.stopPropagation(); onClick() }}
      style={{
        position: 'fixed',
        top: '50%',
        [side]: mob ? 10 : 24,
        width: mob ? 58 : 86,
        height: mob ? 96 : 132,
        transform: 'translateY(-50%)',
        border: 'none',
        background: 'transparent',
        color: '#ffffff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'none',
        pointerEvents: 'auto',
        zIndex: 1000002,
        opacity: visible ? 1 : 0,
        transition: 'opacity 240ms ease',
      }}
    >
      <span ref={svgRef} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', willChange: 'transform' }}>
        <svg width={mob ? 34 : 52} height={mob ? 54 : 82} viewBox="0 0 42 42" fill="none">
          {side === 'left'
            ? <polyline points="29,7 13,21 29,35" stroke="currentColor" strokeWidth="7" strokeLinecap="square" strokeLinejoin="miter"/>
            : <polyline points="13,7 29,21 13,35" stroke="currentColor" strokeWidth="7" strokeLinecap="square" strokeLinejoin="miter"/>
          }
        </svg>
      </span>
    </button>
  )
}

type Phase = 'in'|'open'|'closing'

function Overlay({ idx, projects, onClose, onCloseStart, onNav }: {
  idx: number; projects: InfoProject[]; onClose: () => void; onCloseStart: () => void; onNav: (i: number) => void
}) {
  const { language } = useLanguage()
  const lang = language as Lang
  const [phase, setPhase]   = useState<Phase>('in')
  const [curIdx, setCurIdx] = useState(idx)
  const [prevIdx, setPrevIdx] = useState<number | null>(null)
  const [slideDir, setSlideDir] = useState<'none' | 'left' | 'right'>('none')
  const [navKey, setNavKey] = useState(0)
  const lockRef = useRef(false)
  const cur = projects[curIdx]
  const prev = prevIdx !== null ? projects[prevIdx] : null

  const vw  = typeof window !== 'undefined' ? window.innerWidth : 1440
  const mob = vw < 768
  const imgW = mob ? Math.round(vw * 0.88) : Math.min(Math.round(vw * 0.42), 520)
  const panW = mob ? Math.round(vw * 0.88) : Math.min(Math.round(vw * 0.46), 580)

  useEffect(() => {
    document.documentElement.style.setProperty('scrollbar-gutter', 'stable')
    document.body.style.overflow = 'hidden'
    document.body.classList.add('overlay-open')
    requestAnimationFrame(() => window.dispatchEvent(new Event('nav-mask-refresh')))
    const raf = requestAnimationFrame(() => requestAnimationFrame(() => setPhase('open')))
    return () => {
      cancelAnimationFrame(raf)
      document.body.style.overflow = ''
      document.documentElement.style.removeProperty('scrollbar-gutter')
      document.body.classList.remove('overlay-open')
      document.body.classList.remove('hide-x-cursor')
      requestAnimationFrame(() => window.dispatchEvent(new Event('nav-mask-refresh')))
    }
  }, [])

  const resetNavColor = useCallback(() => {
    document.body.classList.remove('overlay-open')
    document.body.classList.remove('hide-x-cursor')
    window.dispatchEvent(new Event('nav-mask-refresh'))
  }, [])

  const close = useCallback(() => {
    if (phase === 'closing') return
    onCloseStart()
    resetNavColor()
    setPhase('closing')
    setTimeout(() => onClose(), 280)
  }, [phase, onClose, onCloseStart, resetNavColor])

  const navigate = useCallback((dir: 'l'|'r') => {
    if (lockRef.current) return
    lockRef.current = true
    const n = projects.length
    const ni = dir === 'r' ? (curIdx + 1) % n : (curIdx - 1 + n) % n
    setPrevIdx(curIdx)
    setSlideDir(dir === 'r' ? 'right' : 'left')
    setCurIdx(ni); setNavKey(k => k + 1); onNav(ni)
    setTimeout(() => {
      setSlideDir('none')
      setPrevIdx(null)
      lockRef.current = false
    }, 950)
  }, [curIdx, onNav, projects.length])

  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      if (e.key === 'Escape')     close()
      if (e.key === 'ArrowRight') navigate('r')
      if (e.key === 'ArrowLeft')  navigate('l')
    }
    window.addEventListener('keydown', k)
    return () => window.removeEventListener('keydown', k)
  }, [close, navigate])

  const EASE = 'cubic-bezier(0.76,0,0.24,1)'
  const imgOut     = phase === 'in'
  const imgClosing = phase === 'closing'
  const imgScale   = imgOut ? 'scale(0.72)' : imgClosing ? 'scale(0.72)' : 'scale(1)'
  const imgOpacity = imgOut ? 0 : imgClosing ? 0 : 1
  const imgTransition = imgClosing
    ? `transform 180ms ${EASE}, opacity 160ms ease`
    : `transform 320ms ${EASE}, opacity 300ms ease`
  const panX       = (phase === 'in' || phase === 'closing') ? '-100%' : '0%'
  const panOpacity = (phase === 'in' || phase === 'closing') ? 0 : 1
  const panTransition = phase === 'closing'
    ? `transform 160ms ${EASE}, opacity 140ms ease`
    : `transform 300ms ${EASE} 100ms, opacity 280ms ease 100ms`

  const iconBtn: React.CSSProperties = {
    background: 'none', border: 'none', cursor: 'pointer', padding: 6, lineHeight: 0,
    opacity: 0.3, transition: 'opacity 0.15s',
    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  }
  const hi  = (e: React.MouseEvent<HTMLButtonElement>) => ((e.currentTarget as HTMLElement).style.opacity = '1')
  const hlo = (e: React.MouseEvent<HTMLButtonElement>) => ((e.currentTarget as HTMLElement).style.opacity = '0.3')

  return (
    <>
      <div className="project-detail-overlay" data-textcolor="white" onPointerDown={resetNavColor} onClick={close} style={{
        position: 'fixed', inset: 0, zIndex: 999999,
        backgroundColor: phase === 'open' ? 'rgba(0,0,0,0.22)' : 'rgba(0,0,0,0)',
        backdropFilter:       phase === 'open' ? 'blur(12px)' : 'blur(0px)',
        WebkitBackdropFilter: phase === 'open' ? 'blur(12px)' : 'blur(0px)',
        transition: 'background-color 0.35s ease, backdrop-filter 0.35s ease',
        cursor: 'none',
      }} />
      <div className="project-detail-overlay" data-textcolor="white" style={{
        position: 'fixed', inset: 0, zIndex: 1000000,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        pointerEvents: 'none',
      }}>
        <MagnetArrow
          side="left"
          mob={mob}
          onClick={() => navigate('l')}
          label={lang === 'de' ? 'Vorheriges Projekt' : 'Previous project'}
          visible={phase === 'open'}
        />
        <MagnetArrow
          side="right"
          mob={mob}
          onClick={() => navigate('r')}
          label={lang === 'de' ? 'Nächstes Projekt' : 'Next project'}
          visible={phase === 'open'}
        />
        <div style={{
          position: 'relative',
          width: imgW + panW,
          height: 'auto',
          pointerEvents: 'auto',
          cursor: 'default',
          overflow: 'hidden',
        }}>
          {/* Previous project stays fixed underneath */}
          {prev && slideDir !== 'none' && (
            <div style={{
              position: 'absolute', inset: 0, zIndex: 0,
              display: 'flex',
              flexDirection: mob ? 'column' : 'row',
              alignItems: mob ? 'center' : 'stretch',
            }}>
              <div style={{ width: imgW, flexShrink: 0, overflow: 'hidden', backgroundImage: `url(${prev.images[0]})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
                <PixelCarouselOneShot images={prev.images} w={imgW} animateIn={false} />
              </div>
              <div style={{ width: panW, flexShrink: 0, backgroundColor: '#ffffff', overflow: 'hidden' }}>
                <PanelContent project={prev} idx={prevIdx!} total={projects.length} lang={lang} doScramble={false} isMobile={mob} />
              </div>
            </div>
          )}
          {/* Current project slides over the old */}
          <div key={navKey} ref={(el) => {
            if (!el || slideDir === 'none') return
            // Park off-screen without transition, then animate in
            el.style.transition = 'none'
            el.style.transform = slideDir === 'right' ? 'translate3d(100%,0,0)' : 'translate3d(-100%,0,0)'
            void el.offsetWidth // reflow
            el.style.transition = 'transform 0.9s cubic-bezier(0.76,0,0.24,1)'
            el.style.transform = 'translate3d(0,0,0)'
          }} style={{
            display: 'flex',
            flexDirection: mob ? 'column' : 'row',
            alignItems: mob ? 'center' : 'stretch',
            width: '100%',
            position: 'relative',
            zIndex: 2,
            willChange: 'transform',
          }}>
            <div style={{
              width: imgW, flexShrink: 0, position: 'relative', zIndex: 2,
              transform: phase === 'in' ? 'scale(0.72)' : phase === 'closing' ? 'scale(0.72)' : 'scale(1)',
              opacity: phase === 'in' ? 0 : phase === 'closing' ? 0 : 1,
              transition: slideDir !== 'none' ? 'none' : imgTransition,
              overflow: 'hidden',
              backgroundImage: `url(${cur.images[0]})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}>
              <PixelCarouselOneShot key={navKey} images={cur.images} w={imgW} animateIn={false} />
            </div>
            <div
              onClick={e => e.stopPropagation()}
              style={{
                width: panW, flexShrink: 0, position: 'relative', zIndex: 0,
                transform: phase === 'in' || phase === 'closing' ? `translateX(-100%)` : 'translateX(0%)',
                opacity: phase === 'in' || phase === 'closing' ? 0 : 1,
                transition: slideDir !== 'none' ? 'none' : panTransition,
                backgroundColor: '#ffffff', overflow: 'hidden', cursor: 'default',
              }}
            >
              <button onPointerDown={resetNavColor} onClick={close}
                style={{ ...iconBtn, position: 'absolute', top: 18, right: 18, zIndex: 2 }}
                onMouseEnter={hi} onMouseLeave={hlo}>
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <line x1="1" y1="1" x2="17" y2="17" stroke="#0a0a0a" strokeWidth="3" strokeLinecap="square"/>
                  <line x1="17" y1="1" x2="1" y2="17" stroke="#0a0a0a" strokeWidth="3" strokeLinecap="square"/>
                </svg>
              </button>
              <PanelContent key={curIdx} project={cur} idx={curIdx} total={projects.length} lang={lang} doScramble={navKey > 0} isMobile={mob} />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

function PanelContent({ project, idx, total, lang, doScramble, isMobile }: {
  project: InfoProject; idx: number; total: number; lang: Lang
  doScramble: boolean; isMobile: boolean
}) {
  const titleRaw = project.title[lang]
  const descRaw  = project.description[lang]
  const [titleDisp, setTitleDisp] = useState(titleRaw)
  const [descDisp,  setDescDisp]  = useState(descRaw)
  const titleRef = useRef<(() => void) | null>(null)
  const descRef  = useRef<(() => void) | null>(null)
  const [hovYT, setHovYT] = useState(false)

  useEffect(() => {
    return () => {
      titleRef.current?.()
      descRef.current?.()
    }
  }, [])

  useEffect(() => {
    if (doScramble) {
      runScramble(titleRaw, setTitleDisp, titleRef)
      const t = setTimeout(() => runScramble(descRaw, setDescDisp, descRef), 60)
      return () => clearTimeout(t)
    }
  }, [descRaw, doScramble, titleRaw])

  // Scramble on language change
  useEffect(() => {
    runScramble(titleRaw, setTitleDisp, titleRef)
    const t = setTimeout(() => runScramble(descRaw, setDescDisp, descRef), 60)
    return () => clearTimeout(t)
  }, [lang])

  return (
    <div style={{
      height: '100%', display: 'flex', flexDirection: 'column',
      padding: isMobile
        ? '20px 16px 16px'
        : 'clamp(56px,6vw,72px) clamp(28px,3.5vw,42px) clamp(28px,3.5vw,42px)',
      boxSizing: 'border-box',
    }}>
      <h2
        onMouseEnter={() => runScramble(titleRaw, setTitleDisp, titleRef)}
        onTouchStart={() => runScramble(titleRaw, setTitleDisp, titleRef)}
        style={{
          color: '#0a0a0a',
          fontSize: isMobile ? '9vw' : 'clamp(24px,3vw,54px)',
          fontWeight: 900,
          textTransform: 'uppercase',
          margin: isMobile ? '0 0 12px' : '0 0 clamp(12px,1.8vw,22px)',
          lineHeight: 1.0, letterSpacing: '-1.5px', flexShrink: 0,
          whiteSpace: 'pre-line', cursor: 'default',
        }}
      >{titleDisp}</h2>
      <p style={{
        color: '#7a7a7a',
        fontSize: isMobile ? '13px' : 'clamp(13px,1.4vw,16px)',
        lineHeight: isMobile ? 1.5 : 1.85,
        margin: isMobile ? '0 0 12px' : '0 0 clamp(14px,1.8vw,24px)',
        flex: isMobile ? 'none' : 1,
        userSelect: 'text',
      }}>{descDisp}</p>
      {project.youtube && (
        <a href={project.youtube} target="_blank" rel="noopener noreferrer"
          onMouseEnter={() => setHovYT(true)} onMouseLeave={() => setHovYT(false)}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: isMobile ? 8 : 10,
            backgroundColor: hovYT ? '#333' : '#0a0a0a',
            color: '#ffffff',
            fontSize: isMobile ? 10 : 11,
            fontWeight: 700,
            letterSpacing: '0.12em', textTransform: 'uppercase',
            padding: isMobile ? '9px 16px' : '11px 20px',
            textDecoration: 'none',
            marginBottom: isMobile ? '12px' : 'clamp(16px,2vw,24px)',
            transition: 'background-color 0.15s ease',
            cursor: 'pointer', alignSelf: 'flex-start', flexShrink: 0,
          }}
        >
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
            <polygon points="2,1 12,6.5 2,12" fill="#ffffff"/>
          </svg>
          {lang === 'de' ? 'Ansehen' : 'Watch'}
        </a>
      )}
      <div style={{
        display: 'flex', flexWrap: 'wrap',
        gap: isMobile ? 4 : 6,
        marginBottom: isMobile ? '12px' : 'clamp(16px,2vw,24px)',
        flexShrink: 0
      }}>
        {project.tags[lang].map((tag, i) => <TagPill key={i} label={tag} isMobile={isMobile} />)}
      </div>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexShrink: 0 }}>
        <span style={{
          color: '#0a0a0a',
          fontSize: isMobile ? '14px' : 'clamp(14px,1.6vw,22px)',
          fontWeight: 900, letterSpacing: '-0.5px', lineHeight: 1,
        }}>
          {String(idx + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
        </span>
      </div>
    </div>
  )
}

function TagPill({ label, isMobile }: { label: string; isMobile?: boolean }) {
  const [pressed, setPressed] = useState(false)
  return (
    <span
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      onMouseLeave={() => setPressed(false)}
      style={{
        backgroundColor: '#0a0a0a', color: '#ffffff',
        fontSize: isMobile ? 8 : 9,
        letterSpacing: '0.12em',
        textTransform: 'uppercase',
        padding: isMobile ? '4px 8px' : '5px 10px',
        transform: pressed ? 'scale(0.92)' : 'scale(1)',
        transition: 'transform 0.12s ease',
        cursor: 'default', display: 'inline-block',
      }}
    >{label}</span>
  )
}

// ─── Mini projects band: continuous left/right marquee, fixed in place ────────
type MiniProject = (typeof ARCHIVED_PROJECTS)[number] | (typeof ALL_PROJECTS)[number]
type MiniPointer = { x: number; y: number; active: boolean }

export function ProjectsMarquee({ embedded = false, statProgress = 0, onHoverCards }: { embedded?: boolean; statProgress?: number; onHoverCards?: (hover: boolean) => void }) {
  const { language } = useLanguage()
  const { vw } = useScroll()
  const lang = language as Lang
  const isMobile = vw < 768
  const items: MiniProject[] = [...ARCHIVED_PROJECTS, ...ALL_PROJECTS]
  const [openIdx, setOpenIdx] = useState<number | null>(null)
  const [openRect, setOpenRect] = useState<{ x: number; y: number; w: number; h: number } | null>(null)
  const [pointer, setPointer] = useState<MiniPointer>({ x: 0, y: 0, active: false })

  // Deterministic shuffle per row
  const shuffle = (arr: MiniProject[], seed: number) => {
    const a = [...arr]
    for (let i = a.length - 1; i > 0; i--) {
      seed = (seed * 16807 + 0) % 2147483647
      const j = seed % (i + 1)
      ;[a[i], a[j]] = [a[j], a[i]]
    }
    return a
  }
  const row1 = shuffle(items, 1)
  const row2 = shuffle(items, 7)
  const row3 = shuffle(items, 13)

  const openProject = useCallback((project: MiniProject, rect: { x: number; y: number; w: number; h: number }) => {
    const idx = INFO_PROJECTS.findIndex(p => p.id === project.id)
    onHoverCards?.(false)
    setOpenRect(rect)
    setOpenIdx(idx >= 0 ? idx : 0)
  }, [onHoverCards, setOpenIdx, setOpenRect])

  const renderRow = (projects: MiniProject[], direction: 'left' | 'right', startOffset: number, autoSpeed: number) => {
    const cardW = isMobile ? Math.min(280, Math.max(200, Math.round(vw * 0.65))) : 384
    const cardH = Math.round(cardW * 9 / 16) // 16:9
    const gap = isMobile ? 12 : 32
    const loop = [...projects, ...projects]
    const autoDir = direction === 'left' ? 'mpScrollL' : 'mpScrollR'
    const duration = isMobile ? Math.round(autoSpeed * 1.2) : autoSpeed
    return (
      <div style={{ overflow: 'visible', width: '100%', padding: isMobile ? '6px 0' : '18px 0' }}>
        <div style={{
          transform: `translateX(${startOffset}%)`,
          willChange: 'transform',
        }}>
          <div style={{
            display: 'flex', gap: `${gap}px`, whiteSpace: 'nowrap', width: 'max-content',
            animationName: autoDir,
            animationDuration: `${duration}s`,
            animationTimingFunction: 'linear',
            animationIterationCount: 'infinite',
            animationPlayState: 'running',
            willChange: 'transform',
          }}>
            {loop.map((p, i) => (
              <MiniProjectCard
                key={`${p.id}-${i}`}
                project={p}
                lang={lang}
                width={cardW}
                height={cardH}
                pointer={pointer}
                isMobile={isMobile}
                onOpen={(rect) => openProject(p, rect)}
              />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <section
      onMouseMove={(e) => { setPointer({ x: e.clientX, y: e.clientY, active: true }); if (openIdx === null) onHoverCards?.(true) }}
      onMouseLeave={() => { setPointer(p => ({ ...p, active: false })); onHoverCards?.(false) }}
      style={{
      background: embedded ? 'transparent' : '#0a0a0a',
      padding: embedded ? (isMobile ? '4vh 0' : '8vh 0') : (isMobile ? '36px 0' : '60px 0'),
      overflow: 'visible',
      height: embedded ? '100vh' : 'auto',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      gap: embedded ? (isMobile ? '4px' : '10px') : '6px',
      boxSizing: 'border-box',
      perspective: '800px',
      cursor: embedded ? 'none' : 'default',
    }}>
      <style>{`
        .mini-card:hover .mini-card-img { transform: scale(1.07); }
        .mini-card:hover .mini-card-scrim { opacity: 1; }
        .mini-card:hover .mini-card-name { opacity: 1; transform: translateY(0); }
        .mini-fs-overlay, .mini-fs-overlay * { cursor: none !important; }
        @keyframes mpScrollL { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        @keyframes mpScrollR { from { transform: translateX(-50%); } to { transform: translateX(0); } }
      `}</style>
      {renderRow(row1, 'left', -6, 90)}
      {renderRow(row2, 'right', -40, 110)}
      {renderRow(row3, 'left', -10, 76)}
      {openIdx !== null && <MiniProjectFullscreen project={INFO_PROJECTS[openIdx]} onClose={() => { setOpenIdx(null); setOpenRect(null) }} onNav={setOpenIdx} idx={openIdx} total={INFO_PROJECTS.length} originRect={openRect} />}
      {openIdx !== null && <ViewCursor show={true} mode="close" />}
    </section>
  )
}

// ─── MiniProjectFullscreen: fullscreen reveal overlay for mini-projects ────────
function MiniProjectFullscreen({ project, onClose, onNav, idx, total, originRect }: {
  project: InfoProject; onClose: () => void; onNav: (i: number) => void; idx: number; total: number
  originRect?: { x: number; y: number; w: number; h: number } | null
}) {
  const { language } = useLanguage()
  const lang = language as Lang
  const [phase, setPhase] = useState<'in' | 'open' | 'closing'>('in')
  const [slideDir, setSlideDir] = useState<'none' | 'left' | 'right'>('none')
  const [displayProject, setDisplayProject] = useState(project)
  const [prevProject, setPrevProject] = useState<InfoProject | null>(null)
  const [navKey, setNavKey] = useState(0)
  const [oldBlurActive, setOldBlurActive] = useState(false)
  const lockRef = useRef(false)
  const vw = typeof window !== 'undefined' ? window.innerWidth : 1440
  const vh = typeof window !== 'undefined' ? window.innerHeight : 900
  const isMobile = vw < 768

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    document.body.classList.add('x-cursor-open')
    requestAnimationFrame(() => window.dispatchEvent(new Event('nav-mask-refresh')))
    const raf = requestAnimationFrame(() => requestAnimationFrame(() => setPhase('open')))
    return () => {
      cancelAnimationFrame(raf)
      document.body.style.overflow = ''
      document.body.classList.remove('x-cursor-open')
      document.body.classList.remove('hide-x-cursor')
      requestAnimationFrame(() => window.dispatchEvent(new Event('nav-mask-refresh')))
    }
  }, [])

  const activeProject = slideDir === 'none' ? project : displayProject

  const resetNavColor = useCallback(() => {
    document.body.classList.remove('x-cursor-open')
    window.dispatchEvent(new Event('nav-mask-refresh'))
  }, [])

  const close = useCallback(() => {
    if (phase === 'closing') return
    resetNavColor()
    setPhase('closing')
    setTimeout(() => onClose(), 420)
  }, [phase, onClose, resetNavColor])

  const navigate = useCallback((dir: 'l' | 'r') => {
    if (lockRef.current) return
    lockRef.current = true
    const ni = dir === 'r' ? (idx + 1) % total : (idx - 1 + total) % total
    setOldBlurActive(false)
    setPrevProject(displayProject)
    onNav(ni)
    setDisplayProject(INFO_PROJECTS[ni])
    setSlideDir(dir === 'r' ? 'right' : 'left')
    setNavKey(k => k + 1)
    requestAnimationFrame(() => requestAnimationFrame(() => setOldBlurActive(true)))
    setTimeout(() => {
      setSlideDir('none')
      setPrevProject(null)
      setOldBlurActive(false)
      lockRef.current = false
    }, 1320)
  }, [displayProject, idx, total, onNav])

  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
      if (e.key === 'ArrowRight') navigate('r')
      if (e.key === 'ArrowLeft') navigate('l')
    }
    window.addEventListener('keydown', k)
    return () => window.removeEventListener('keydown', k)
  }, [close, navigate])

  const titleText = activeProject.title[lang]
  const fieldText = activeProject.field[lang]
  const descText = activeProject.description[lang]
  const tags = activeProject.tags[lang]
  const { disp: titleDisp } = useScramble(titleText)
  const { disp: fieldDisp } = useScramble(fieldText)
  const { disp: descDisp } = useScramble(descText)
  const isOpen = phase === 'open'
  const previousTitle = prevProject?.title[lang]
  const previousField = prevProject?.field[lang]
  const previousDesc = prevProject?.description[lang]
  const previousTags = prevProject?.tags[lang]

  // Compute zoom-from-origin transform
  const originTransform = originRect
    ? `translate(${originRect.x + originRect.w / 2 - vw / 2}px, ${originRect.y + originRect.h / 2 - vh / 2}px) scale(${originRect.w / vw}, ${originRect.h / vh})`
    : 'scale(0.7)'

  return (
    <>
      <div className="mini-fs-overlay" data-textcolor="white" onPointerDown={resetNavColor} onClick={close} style={{
        position: 'fixed', inset: 0, zIndex: 999999,
        backgroundColor: '#0a0a0a',
        backgroundImage: `url(${displayProject.images[0]})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        transform: phase === 'in' ? originTransform : phase === 'closing' ? 'scale(0.92)' : 'scale(1)',
        opacity: phase === 'closing' ? 0 : 1,
        transition: phase === 'in'
          ? 'transform 680ms cubic-bezier(0.16,1,0.3,1), opacity 320ms ease'
          : 'transform 420ms cubic-bezier(0.16,1,0.3,1), opacity 0.35s ease',
        transformOrigin: 'center center',
        cursor: 'none',
        overflow: 'hidden',
      }}>
        {prevProject && slideDir !== 'none' && previousTitle && previousField && previousDesc && previousTags && (
          <div style={{
            position: 'absolute', inset: 0,
            zIndex: 1,
            transform: 'translate3d(0,0,0)',
            filter: oldBlurActive ? 'blur(9px)' : 'blur(0.25px)',
            transition: 'filter 1.05s cubic-bezier(0.76,0,0.24,1)',
            willChange: 'filter',
          }}>
            <img src={prevProject.images[0]} alt="" loading="eager" decoding="async" fetchPriority="high" style={{
              position: 'absolute', inset: 0,
              width: '100%', height: '100%', objectFit: 'cover',
            }} />
            <div style={{
              position: 'absolute', inset: 0, zIndex: 3,
              background: 'linear-gradient(to top, rgba(0,0,0,0.78) 0%, rgba(0,0,0,0.42) 38%, rgba(0,0,0,0.14) 70%, transparent 100%)',
              opacity: 1,
            }} />
            <div style={{
              position: 'absolute',
              left: isMobile ? '6vw' : '8vw',
              right: isMobile ? '6vw' : '34vw',
              bottom: isMobile ? '9vh' : '12vh',
              zIndex: 5, pointerEvents: 'none',
              opacity: 1,
            }}>
              <div style={{
                fontSize: isMobile ? '10vw' : 'clamp(40px,6vw,96px)',
                fontWeight: 900, lineHeight: 0.9, letterSpacing: '-2px',
                textTransform: 'uppercase', color: '#ffffff', whiteSpace: 'pre-line',
                textShadow: '0 12px 36px rgba(0,0,0,0.45)',
              }}>{previousTitle}</div>
              <div style={{
                display: 'inline-block', marginTop: isMobile ? '0.5em' : '0.4em',
                fontSize: isMobile ? '4.6vw' : 'clamp(20px,2.4vw,40px)',
                fontWeight: 700, fontStyle: 'italic', lineHeight: 0.95, letterSpacing: '-0.6px',
                textTransform: 'uppercase', color: '#ffffff', whiteSpace: 'pre-line',
                textShadow: '0 10px 24px rgba(0,0,0,0.4)',
              }}>{previousField}</div>
              <p style={{
                marginTop: isMobile ? '1.1em' : '1em',
                fontSize: isMobile ? '3.6vw' : 'clamp(14px,1.05vw,18px)',
                fontWeight: 400, lineHeight: 1.45, color: 'rgba(255,255,255,0.96)',
                maxWidth: isMobile ? '88vw' : '40vw',
                textShadow: '0 6px 18px rgba(0,0,0,0.4)',
              }}>{previousDesc}</p>
              <div style={{
                marginTop: isMobile ? '1.2em' : '1.1em',
                display: 'flex', flexWrap: 'wrap', gap: '8px',
              }}>
                {previousTags.map((t, ti) => (
                  <span key={`${t}-${ti}`} style={{
                    border: '1px solid rgba(255,255,255,0.4)',
                    color: '#ffffff', fontSize: isMobile ? '3vw' : '11px',
                    fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase',
                    padding: '5px 10px', borderRadius: '999px',
                  }}>{t}</span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Incoming slide: image, scrim and text move as one project */}
        <div key={navKey} ref={(el) => {
          if (!el || slideDir === 'none') return
          el.style.transition = 'none'
          el.style.transform = slideDir === 'right' ? 'translate3d(115%,0,0)' : 'translate3d(-115%,0,0)'
          void el.offsetWidth
          el.style.transition = 'transform 0.9s cubic-bezier(0.76,0,0.24,1)'
          el.style.transform = 'translate3d(0,0,0)'
        }} style={{
          position: 'absolute', inset: 0,
          willChange: 'transform',
          zIndex: 2,
        }}>
          <img src={displayProject.images[0]} alt="" loading="eager" decoding="async" fetchPriority="high" style={{
            position: 'absolute', inset: 0,
            width: '100%', height: '100%', objectFit: 'cover',
            transform: isOpen ? 'scale(1)' : 'scale(1.02)',
            transition: 'transform 680ms cubic-bezier(0.16,1,0.3,1)',
          }} />
          <div style={{
            position: 'absolute', inset: 0, zIndex: 3,
            background: 'linear-gradient(to top, rgba(0,0,0,0.78) 0%, rgba(0,0,0,0.42) 38%, rgba(0,0,0,0.14) 70%, transparent 100%)',
            opacity: isOpen ? 1 : 0,
            transition: 'opacity 0.5s ease',
          }} />

          <div onClick={(e) => e.stopPropagation()} style={{
            position: 'absolute',
            left: isMobile ? '6vw' : '8vw',
            right: isMobile ? '6vw' : '34vw',
            bottom: isMobile ? '9vh' : '12vh',
            zIndex: 5, pointerEvents: 'none',
            opacity: isOpen ? 1 : 0,
            transition: 'opacity 0.55s ease 0.1s',
          }}>
            <div style={{
              fontSize: isMobile ? '10vw' : 'clamp(40px,6vw,96px)',
              fontWeight: 900, lineHeight: 0.9, letterSpacing: '-2px',
              textTransform: 'uppercase', color: '#ffffff', whiteSpace: 'pre-line',
              textShadow: '0 12px 36px rgba(0,0,0,0.45)',
            }}>{titleDisp}</div>
            <div style={{
              display: 'inline-block', marginTop: isMobile ? '0.5em' : '0.4em',
              fontSize: isMobile ? '4.6vw' : 'clamp(20px,2.4vw,40px)',
              fontWeight: 700, fontStyle: 'italic', lineHeight: 0.95, letterSpacing: '-0.6px',
              textTransform: 'uppercase', color: '#ffffff', whiteSpace: 'pre-line',
              textShadow: '0 10px 24px rgba(0,0,0,0.4)',
            }}>{fieldDisp}</div>
            <p style={{
              marginTop: isMobile ? '1.1em' : '1em',
              fontSize: isMobile ? '3.6vw' : 'clamp(14px,1.05vw,18px)',
              fontWeight: 400, lineHeight: 1.45, color: 'rgba(255,255,255,0.96)',
              maxWidth: isMobile ? '88vw' : '40vw',
              textShadow: '0 6px 18px rgba(0,0,0,0.4)',
            }}>{descDisp}</p>
            <div style={{
              marginTop: isMobile ? '1.2em' : '1.1em',
              display: 'flex', flexWrap: 'wrap', gap: '8px',
            }}>
              {tags.map((t, ti) => (
                <span key={`${t}-${ti}`} style={{
                  border: '1px solid rgba(255,255,255,0.4)',
                  color: '#ffffff', fontSize: isMobile ? '3vw' : '11px',
                  fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase',
                  padding: '5px 10px', borderRadius: '999px',
                }}>{t}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Magnetic navigation arrows */}
        <MagnetArrow
          side="left"
          mob={isMobile}
          onClick={() => navigate('l')}
          label="Previous"
          visible={isOpen}
        />
        <MagnetArrow
          side="right"
          mob={isMobile}
          onClick={() => navigate('r')}
          label="Next"
          visible={isOpen}
        />
      </div>
    </>
  )
}

function MiniProjectCard({ project, lang, width, height, pointer, isMobile, onOpen }: {
  project: MiniProject
  lang: Lang
  width: number
  height: number
  pointer: MiniPointer
  isMobile: boolean
  onOpen: (rect: { x: number; y: number; w: number; h: number }) => void
}) {
  const cardRef = useRef<HTMLButtonElement>(null)
  const targetRef = useRef({ x: 0, y: 0, z: 0, rx: 0, ry: 0, s: 1, strength: 0 })
  const currentRef = useRef({ x: 0, y: 0, z: 0, rx: 0, ry: 0, s: 1, strength: 0 })
  const [visual, setVisual] = useState({
    transform: 'perspective(600px) translate3d(0px,0px,0px) rotateX(0deg) rotateY(0deg) scale(1)',
    shadow: '0 10px 26px rgba(0,0,0,0.22)',
    zIndex: 1,
  })

  useEffect(() => {
    if (isMobile) return
    const el = cardRef.current
    if (!el) return
    if (!pointer.active) {
      targetRef.current = { x: 0, y: 0, z: 0, rx: 0, ry: 0, s: 1, strength: 0 }
      return
    }

    const rect = el.getBoundingClientRect()
    const cx = rect.left + rect.width / 2
    const cy = rect.top + rect.height / 2
    const dx = pointer.x - cx
    const dy = pointer.y - cy
    const distance = Math.sqrt(dx * dx + dy * dy)
    const radius = 520
    const strength = Math.max(0, 1 - distance / radius)
    const localX = Math.max(-1, Math.min(1, dx / (rect.width / 2)))
    const localY = Math.max(-1, Math.min(1, dy / (rect.height / 2)))

    targetRef.current = {
      x: dx * 0.024 * strength,
      y: dy * 0.024 * strength,
      z: 34 * strength,
      rx: -localY * 9 * strength,
      ry: localX * 13 * strength,
      s: 1 + 0.055 * strength,
      strength,
    }
  }, [isMobile, pointer])

  useEffect(() => {
    if (isMobile) return
    let raf = 0
    const tick = () => {
      const t = targetRef.current
      const c = currentRef.current
      const smooth = 0.14

      c.x += (t.x - c.x) * smooth
      c.y += (t.y - c.y) * smooth
      c.z += (t.z - c.z) * smooth
      c.rx += (t.rx - c.rx) * smooth
      c.ry += (t.ry - c.ry) * smooth
      c.s += (t.s - c.s) * smooth
      c.strength += (t.strength - c.strength) * smooth

      setVisual({
        transform: `perspective(600px) translate3d(${c.x.toFixed(2)}px,${c.y.toFixed(2)}px,${c.z.toFixed(2)}px) rotateX(${c.rx.toFixed(2)}deg) rotateY(${c.ry.toFixed(2)}deg) scale(${c.s.toFixed(4)})`,
        shadow: `0 ${Math.round(12 + c.strength * 22)}px ${Math.round(30 + c.strength * 42)}px rgba(0,0,0,${0.22 + c.strength * 0.24})`,
        zIndex: Math.round(1 + c.strength * 10),
      })

      raf = requestAnimationFrame(tick)
    }

    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [isMobile])

  const handleClick = () => {
    const el = cardRef.current
    const rect = el ? el.getBoundingClientRect() : { left: 0, top: 0, width: 0, height: 0 }
    onOpen({ x: rect.left, y: rect.top, w: rect.width, h: rect.height })
  }

  return (
    <button
      ref={cardRef}
      onClick={handleClick}
      className="mini-card"
      style={{
        flexShrink: 0,
        position: 'relative',
        width: `${width}px`,
        height: `${height}px`,
        borderRadius: 0,
        overflow: 'visible',
        padding: 0,
        border: 'none',
        background: '#0a0a0a',
        backgroundImage: `url(${project.image})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        cursor: 'pointer',
        display: 'block',
        transform: isMobile ? 'none' : visual.transform,
        transformStyle: 'preserve-3d',
        transformOrigin: 'center center',
        transition: 'box-shadow 200ms ease',
        boxShadow: isMobile ? '0 8px 22px rgba(0,0,0,0.2)' : visual.shadow,
        zIndex: isMobile ? 1 : visual.zIndex,
        opacity: 1,
        willChange: 'transform',
      }}
    >
      <img src={project.image} alt="" className="mini-card-img" loading="eager" decoding="async" fetchPriority="high" style={{
        width: '100%', height: '100%', objectFit: 'cover', display: 'block',
        transition: 'transform 0.5s cubic-bezier(0.16,1,0.3,1)',
      }} />
      <div className="mini-card-scrim" style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(to top, rgba(0,0,0,0.78) 0%, rgba(0,0,0,0.2) 45%, transparent 70%)',
        opacity: 0, transition: 'opacity 0.35s ease',
      }} />
      <div className="mini-card-name" style={{
        position: 'absolute', bottom: isMobile ? '10px' : '12px', left: isMobile ? '10px' : '12px', right: isMobile ? '10px' : '12px',
        color: '#fff', fontSize: isMobile ? '12px' : '14px', fontWeight: 800,
        textTransform: 'uppercase', letterSpacing: '-0.3px', lineHeight: 1.1,
        textAlign: 'left',
        opacity: isMobile ? 1 : 0, transform: isMobile ? 'translateY(0)' : 'translateY(8px) translateZ(36px)',
        transition: 'opacity 0.35s ease, transform 0.4s cubic-bezier(0.16,1,0.3,1)',
        pointerEvents: 'none',
      }}>{project.title[lang].replace('\n', ' ')}</div>
    </button>
  )
}
