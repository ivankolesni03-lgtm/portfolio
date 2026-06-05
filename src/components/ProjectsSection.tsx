'use client'
import { useState, useRef, useEffect, useCallback } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'
import { useScroll } from '@/contexts/ScrollContext'
import { useScramble, runScramble } from '@/hooks/use-scramble'
import { startScramble } from '@/lib/scramble'

const PROJECTS = [
  { id:1, title:{de:'Hochschule\nHannover',en:'Hannover\nUASA'}, field:{de:'Image\nKampagne',en:'Image\nCampaign'}, description:{de:'Mangelnde Brand-Sichtbarkeit und eine zu sachliche Web-Präsenz verhindern den emotionalen Zugang. „Home of Community" positioniert die Hochschule als ein Ort für Kreative.',en:'Lack of brand visibility and an overly factual web presence prevent emotional engagement. "Home of Community" positions the university as a place for creatives.'}, image:'/images/hochschule.png', images:['/images/hochschule0.jpg','/images/hochschule1.jpg','/images/hochschule3.jpg','/images/hochschule4.jpg'], tags:{de:['Social Media','OOH','Brand Strategie'],en:['Social Media','OOH','Brand Strategy']}, youtube: null },
  { id:2, title:{de:'Continental',en:'Continental'}, field:{de:'Produkt\nKampagne',en:'Product\nCampaign'}, description:{de:'Einblicke in die globale Kommunikationslogik bei Continental. Begleitung des Product Drops Ice Contact 8 von der Agentur-Ideation bis zum Launch.',en:'Insights into global communication logic at Continental. Accompanying the Ice Contact 8 product drop from agency ideation to launch.'}, image:'https://s7g10.scene7.com/is/image/conti/Continental_IceContact-8_-_Product_Video_en-AVS?fmt=jpg&wid=1600', images:['https://s7g10.scene7.com/is/image/conti/Continental_IceContact-8_-_Product_Video_en-AVS?fmt=jpg&wid=1600','/images/continental1.jpg','/images/continental2.jpg'], videoSrc:'https://s7g10.scene7.com/is/content/conti/Continental_IceContact-8_-_Product_Video_en-AVS.m3u8', tags:{de:['Strategie','Kampagne','Copywriting'],en:['Strategy','Campaign','Copywriting']}, youtube: null },
  { id:3, title:{de:'HateAid',en:'HateAid'}, field:{de:'Awareness\nKampagne',en:'Awareness\nCampaign'}, description:{de:'Awareness-Kampagne für die NGO HateAid gemeinsam mit Partneragentur Creative Team. Unser Claim „Einer für alle, alle gegen Hass." stellt Solidarität ins Zentrum und macht Hass im Netz sichtbar.',en:'Awareness campaign for the NGO HateAid together with partner agency Creative Team. Our claim "One for all, all against hate." puts solidarity at the centre and makes online hate visible.'}, image:'/images/hateaid.jpg', images:['/images/hateaid.jpg','/images/hateaid1.jpg','/images/hateaid2.jpg','/images/hateaid3.jpg','/images/hateaid4.jpg'], tags:{de:['NGO','Awareness','Storytelling','GWA'],en:['NGO','Awareness','Storytelling','GWA']}, youtube: null },
  { id:4, title:{de:'Lebara',en:'Lebara'}, field:{de:'Social Media\nMarketing',en:'Social Media\nMarketing'}, description:{de:'Social Media Content, Community Management und Memes für den Mobilfunkanbieter Lebara. Vom Briefing bis zum Performance Review. Umgesetzt im Rahmen meines Praktikums bei Graco in Berlin.',en:'Social media content, community management and memes for mobile provider Lebara. From briefing to performance review. Realised during my internship at Graco in Berlin.'}, image:'/images/lebara.jpg', images:['/images/lebara.jpg','/images/lebara.jpg'], tags:{de:['Praktikum','Content Creation','Memes','TikTok'],en:['Internship','Content Creation','Memes','TikTok']}, youtube: null },
  { id:5, title:{de:'Ganbatte',en:'Ganbatte'}, field:{de:'Visuelle\nKommunikation',en:'Visual\nCommunication'}, description:{de:'Konzeption und Gestaltung einer Broschüre als Abgabe in Kommunikationsdesign. Von der Fotografie über das Texten bis zum Layout stammt alles aus meiner Hand. Als visuelle Inspiration diente meine Reise nach Thailand.',en:'Concept and design of a brochure as a submission in communication design. From photography to copywriting to layout, everything came from my own hand. My journey to Thailand served as visual inspiration.'}, image:'/images/ganbatte.jpg', images:['/images/ganbatte.jpg','/images/ganbatte.jpg'], tags:{de:['Broschüre','Fotografie','Layout','Thailand'],en:['Brochure','Photography','Layout','Thailand']}, youtube: null },
  { id:6, title:{de:'Cavallo',en:'Cavallo'}, field:{de:'UX & Web\nDesign',en:'UX & Web\nDesign'}, description:{de:'Entwicklung einer interaktiven Kommunikationskampagne für eine Eventlocation, inklusive Flowchart, Website-Layout und Mockups.',en:'Development of an interactive communication campaign for an event location, including flowchart, website layout and mockups.'}, image:'/images/cavallo.jpg', images:['/images/cavallo.jpg','/images/cavallo.jpg'], tags:{de:['UX','UI','Web Design','Mockup'],en:['UX','UI','Web Design','Mockup']}, youtube: null },
  { id:7, title:{de:'Bold.',en:'Bold.'}, field:{de:'Brand\nDesign',en:'Brand\nDesign'}, description:{de:'Corporate Branding für die Agentur Bold. Entwicklung einer konsistenten Markenidentität mit Logogestaltung, Typografie und Farbwelt. Motion Design und Postproduktion bringen die Benefits der Marke visuell auf den Punkt.',en:'Corporate branding for the agency Bold. Development of a consistent brand identity including logo design, typography and colour world. Motion design and post-production bring the brand benefits to the point visually.'}, image:'/images/bold.jpg', images:['/images/bold.jpg','/images/bold.jpg'], tags:{de:['Corporate Branding','Logo','Motion Design','Agentur'],en:['Corporate Branding','Logo','Motion Design','Agency']}, youtube: null },
  { id:8, title:{de:'pocoloco',en:'pocoloco'}, field:{de:'Corporate\nDesign',en:'Corporate\nDesign'}, description:{de:'Corporate Brand Communication für die kreative Agentur Pocoloco. Von der Markenstimme über das visuelle System bis zur digitalen Umsetzung mit Next.js und prozeduralen Scroll-Animationen.',en:'Corporate brand communication for the creative agency Pocoloco. From brand voice and visual system through to digital implementation with Next.js and procedural scroll animations.'}, image:'/images/pocoloco.jpg', images:['/images/pocoloco.jpg','/images/pocoloco1.jpg'], tags:{de:['Corporate Brand','Next.js','Animation','Agentur'],en:['Corporate Brand','Next.js','Animation','Agency']}, youtube: null },
  { id:9, title:{de:'BMW',en:'BMW'}, field:{de:'Generative\nIntelligence',en:'Generative\nIntelligence'}, description:{de:'Experimentelles Generative-Intelligence-Projekt für BMW mit Fokus auf AI-gestützte Bildwelt, Look-Transitions und visuellem Prompt-Design für starke Markenmomente.',en:'Experimental generative intelligence project for BMW focused on AI-driven visual worlds, look transitions and visual prompt design for strong brand moments.'}, image:'/images/bmw.png', images:['/icons/bmw.jpg','/icons/bmw.jpg'], tags:{de:['Generative Intelligence','AI Visuals','Transition'],en:['Generative Intelligence','AI Visuals','Transition']}, youtube: null },
  { id:10, title:{de:'Tennisheine',en:'Tennisheine'}, field:{de:'Bewegtbild',en:'Motion\nPicture'}, description:{de:'Bewegtbild-Produktion für den Tennisclub Tennisheine. Von der Konzeption über den Dreh bis zum fertigen Schnitt. Authentisches Storytelling im Sport.',en:'Moving image production for tennis club Tennisheine. From concept to shoot to final cut. Authentic storytelling in sport.'}, image:'/images/tennisheine.jpg', images:['/images/tennisheine.jpg','/images/tennisheine.jpg'], tags:{de:['Video','Schnitt','Sport','Storytelling'],en:['Video','Editing','Sport','Storytelling']}, youtube: 'https://www.youtube.com/watch?v=a5Im48lce0M' },
  { id:11, title:{de:'GWA\nMackingOff',en:'GWA\nMackingOff'}, field:{de:'Bewegtbild',en:'Motion\nPicture'}, description:{de:'MackingOff hat den Publikumspreis gewonnen. Von Pre- bis Post-Production habe ich geplant und ausgearbeitet, um den Zuschauern ein Erlebnis zu schaffen. Kreative Bildsprache und Montage im Dienst eines gesellschaftlich relevanten Themas.',en:'MackingOff won the audience award. From pre- to post-production I planned and developed everything to create an experience for the audience. Creative visual language and montage in service of a socially relevant topic.'}, image:'/images/gwa.jpg', images:['/images/gwa.jpg','/images/gwa.jpg'], tags:{de:['Publikumspreis','Regie','Pre-Production','Post-Production'],en:['Audience Award','Direction','Pre-Production','Post-Production']}, youtube: 'https://www.youtube.com/watch?v=a5Im48lce0M' },
  { id:12, title:{de:'Weros\nWebdynamics',en:'Weros\nWebdynamics'}, field:{de:'Fotografie',en:'Photography'}, description:{de:'Fotografie mit Technik sowie Pre- und Post-Production einer Arztpraxis im Auftrag für die Agentur Webdynamics. Professionelle Bildsprache, die Vertrauen und moderne Ästhetik verbindet.',en:'Photography with technique as well as pre- and post-production of a medical practice commissioned for the agency Webdynamics. Professional visual language combining trust and modern aesthetics.'}, image:'/images/weros.jpg', images:['/images/weros.jpg','/images/weros1.jpg'], tags:{de:['Fotografie','Pre-Production','Post-Production','Arztpraxis'],en:['Photography','Pre-Production','Post-Production','Medical']}, youtube: null },
]
type Project = (typeof PROJECTS)[number]
type Lang = 'de'|'en'

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
    <div style={{ position: 'relative', lineHeight: 0 }}>
      {natH > 0
        ? <canvas ref={cvs} width={w} height={natH} style={{ display: 'block', width: '100%', height: 'auto' }} />
        : <div style={{ width: w, height: Math.round(w * 0.75), background: '#111' }} />
      }
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

  const startCarousel = useCallback(() => {
    if (images.length > 1 && !iv.current) {
      iv.current = setInterval(() => doTransition(), 3000)
    }
  }, [images]) // eslint-disable-line

  function doTransition() {
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
  }

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
  }, []) // eslint-disable-line

  return <PixelCanvas src={curSrc} w={w} pixelSize={px} />
}

// ─── AnimatedHeading ──────────────────────────────────────────────────────────
function AnimatedHeading({ overlayOpen }: { overlayOpen: boolean }) {
  const { language } = useLanguage()
  const { scrollY, vw } = useScroll()
  const text = language === 'de' ? 'PROJEKTE' : 'PROJECTS'
  const { disp, scramble } = useScramble(text)
  const staticRef  = useRef<HTMLDivElement>(null)
  const fixedElRef = useRef<HTMLDivElement | null>(null)
  const startPosRef = useRef({ l: 0, t: 0 })
  const scrambleCleanupRef = useRef<(() => void) | null>(null)
  
  const isMobile = vw < 768

  useEffect(() => {
    if (fixedElRef.current) fixedElRef.current.textContent = disp
  }, [disp])

  useEffect(() => {
    if (isMobile) return
    if (fixedElRef.current) return // Already created
    
    const el = document.createElement('div')
    el.textContent = text
    Object.assign(el.style, {
      position: 'fixed', fontWeight: '900', textTransform: 'uppercase',
      color: '#ffffff', mixBlendMode: 'difference', zIndex: '100002',
      pointerEvents: 'none', userSelect: 'none', whiteSpace: 'nowrap',
      cursor: 'pointer', display: 'none', fontFamily: 'inherit',
    })
    el.addEventListener('click', () => {
      const sec = document.getElementById('projekte')
      if (!sec) return
      window.scrollTo({ top: sec.getBoundingClientRect().top + window.scrollY, behavior: 'smooth' })
    })
    el.addEventListener('mouseenter', () => {
      scrambleCleanupRef.current?.()
      scrambleCleanupRef.current = startScramble(text, (s) => { el.textContent = s }, { maxIterations: 16 })
    })
    document.body.appendChild(el)
    fixedElRef.current = el
    ;(el as any).__overlayOpenRef = { current: false }

    return () => {
      scrambleCleanupRef.current?.()
      el.remove()
      fixedElRef.current = null
    }
  }, [isMobile, text])

  // Scroll-based animation using shared scroll context
  useEffect(() => {
    if (isMobile) return
    const el = fixedElRef.current
    const staticEl = staticRef.current
    const section = document.getElementById('projekte')
    if (!el || !staticEl || !section) return

    const sr = section.getBoundingClientRect()
    const hr = staticEl.getBoundingClientRect()
    const raw = Math.max(0, Math.min(1, (-hr.top + 80) / 200))
    
    if (raw < 0.01) {
      startPosRef.current = { l: hr.left, t: hr.top }
      staticEl.style.visibility = 'visible'
      el.style.display = 'none'
      el.style.pointerEvents = 'none'
      return
    }
    if (sr.top > 200) {
      staticEl.style.visibility = 'visible'
      el.style.display = 'none'
      el.style.pointerEvents = 'none'
      return
    }
    
    const overlayOpenRef = (el as any).__overlayOpenRef
    staticEl.style.visibility = 'hidden'
    el.style.display = 'block'
    el.style.pointerEvents = overlayOpenRef?.current ? 'none' : 'auto'
    const vwUnit = vw / 100
    el.style.fontSize = `${8 * vwUnit + (14 - 8 * vwUnit) * raw}px`
    el.style.lineHeight = `${0.9 + 0.3 * raw}`
    el.style.left = `${32 + (startPosRef.current.l - 32) * (1 - raw)}px`
    el.style.top = `${68 + (startPosRef.current.t - 68) * (1 - raw)}px`
    el.style.letterSpacing = `${-2 + raw * 1.72}px`
    if (raw >= 0.98) {
      el.style.fontSize = '14px'
      el.style.lineHeight = '1.2'
      el.style.left = '32px'
      el.style.top = '68px'
      el.style.letterSpacing = '-0.02em'
    }
  }, [scrollY, vw, isMobile])

  useEffect(() => {
    const el = fixedElRef.current; if (!el) return
    const ref = (el as any).__overlayOpenRef
    if (ref) ref.current = overlayOpen
    el.style.transition    = 'filter 0.35s ease'
    el.style.filter        = overlayOpen ? 'blur(8px)' : 'none'
    el.style.pointerEvents = overlayOpen ? 'none' : 'auto'
    el.style.mixBlendMode  = overlayOpen ? 'normal' : 'difference'
    el.style.color         = overlayOpen ? '#0a0a0a' : '#ffffff'
    el.style.zIndex        = overlayOpen ? '999' : '99999'
  }, [overlayOpen])

  if (isMobile === null) return null
  if (isMobile) {
    return (
      <div onMouseEnter={scramble} onTouchStart={scramble} style={{
        fontSize: '10vw', fontWeight: 900, lineHeight: 0.9, letterSpacing: '-2px',
        textTransform: 'uppercase', color: '#0a0a0a', margin: 0, cursor: 'default',
        filter: overlayOpen ? 'blur(8px)' : 'none',
        transition: 'filter 0.35s ease',
      }}>{disp}</div>
    )
  }
  return (
    <div ref={staticRef} className="projekte-heading" onMouseEnter={scramble} onTouchStart={scramble} style={{
      fontSize: '8vw', fontWeight: 900, lineHeight: 0.9, letterSpacing: '-2px',
      textTransform: 'uppercase', color: '#0a0a0a', margin: 0, cursor: 'default', visibility: 'visible',
      filter: overlayOpen ? 'blur(8px)' : 'none',
      transition: 'filter 0.35s ease',
    }}>{disp}</div>
  )
}




function ProjectCard({ project, forceHover, overlayOpen, onClick, enterProgress, isMobile, layerIndex }: {
  project: Project
  forceHover: boolean
  overlayOpen: boolean
  onClick: () => void
  enterProgress: number
  isMobile: boolean
  layerIndex: number
}) {
  const { language } = useLanguage()
  const lang = language as Lang
  const titleText = project.title[lang]
  const fieldText = project.field[lang]
  const { disp: titleDisp, scramble: scrambleTitle } = useScramble(titleText)
  const { disp: fieldDisp, scramble: scrambleField } = useScramble(fieldText)
  const cardRef = useRef<HTMLDivElement>(null)
  const imageRef = useRef<HTMLImageElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const hlsRef = useRef<any>(null)
  const [inViewport, setInViewport] = useState(false)
  const [videoReady, setVideoReady] = useState(false)
  const hasVideo = project.id === 2 && typeof project.videoSrc === 'string'

  const p = Math.max(0, Math.min(1, enterProgress))
  const y = 100 - p * 100
  const cardOpacity = p < -0.001 ? 0 : 1
  const canClick = p > 0.985 && !overlayOpen
  const canInteract = !overlayOpen && enterProgress > -0.04 && enterProgress < 1.24
  const cardZ = p > 0.001 ? 62 + layerIndex : layerIndex
  const titleFloat = `translateY(${(1 - p) * 64}px)`
  const fieldFloat = `translateY(${(1 - p) * 52}px)`
  const exitT = Math.max(0, Math.min(1, (enterProgress - 1.28) / 0.18))
  const exitBlur = exitT * 9
  const exitDim = exitT * 0.28
  const cardFilter = `${overlayOpen ? 'blur(8px) ' : ''}${exitBlur > 0.01 ? `blur(${exitBlur}px) ` : ''}${exitDim > 0.001 ? `brightness(${1 - exitDim})` : ''}`.trim()

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

    const onReady = () => {
      if (!cancelled) setVideoReady(true)
    }
    v.addEventListener('loadeddata', onReady)
    v.addEventListener('canplay', onReady)

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

  return (
    <div
      ref={cardRef}
      onClick={() => { if (canClick) onClick() }}
      onMouseEnter={() => {
        if (!canInteract) return
        scrambleTitle()
        scrambleField()
      }}
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
      <img ref={imageRef} src={project.image} alt="" style={{
        position: 'absolute',
        inset: 0,
        display: 'block', width: '100%', height: '100%', objectFit: 'cover',
        transform: 'scale(1)',
        transition: 'none', userSelect: 'none', pointerEvents: 'none',
        opacity: hasVideo && videoReady ? 0 : 1,
      }} />
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(to top,rgba(0,0,0,0.56) 0%,rgba(0,0,0,0.18) 45%,rgba(0,0,0,0.06) 70%,transparent 100%)',
        zIndex: 1,
      }} />
      <div style={{
        position: 'absolute',
        left: isMobile ? '5vw' : '9vw',
        top: isMobile ? 'clamp(18px,4vw,36px)' : 'clamp(34px,4.2vw,68px)',
        right: isMobile ? '5vw' : '24vw',
        zIndex: 4,
        pointerEvents: 'none',
        perspective: '1200px',
      }}>
        <div
          onMouseEnter={scrambleTitle}
          onTouchStart={scrambleTitle}
          style={{
          fontSize: isMobile ? '11vw' : 'clamp(52px,8vw,132px)',
          fontWeight: 900,
          lineHeight: 0.9,
          letterSpacing: '-2px',
          textTransform: 'uppercase',
          color: '#ffffff',
          whiteSpace: 'pre-line',
          textShadow: '0 12px 36px rgba(0,0,0,0.34)',
          opacity: 1,
            transform: titleFloat,
          filter: 'none',
          transformOrigin: 'left top',
          pointerEvents: 'auto',
        }}>{titleDisp}</div>
      </div>
      <div style={{
        position: 'absolute',
        left: isMobile ? '5vw' : '9vw',
        bottom: isMobile ? 'clamp(18px,4vw,36px)' : 'clamp(34px,4.2vw,68px)',
        right: isMobile ? '5vw' : '24vw',
        zIndex: 4,
        pointerEvents: 'none',
        textAlign: 'left',
        perspective: '1200px',
      }}>
        <div
          onMouseEnter={scrambleField}
          onTouchStart={scrambleField}
          style={{
          display: 'inline-block',
          fontSize: isMobile ? '5.2vw' : 'clamp(24px,3vw,52px)',
          fontWeight: 800,
          lineHeight: 0.95,
          letterSpacing: '-0.6px',
          textTransform: 'uppercase',
          color: '#ffffff',
          whiteSpace: 'pre-line',
          textShadow: '0 10px 24px rgba(0,0,0,0.32)',
          opacity: 1,
            transform: fieldFloat,
          filter: 'none',
          transformOrigin: 'left bottom',
          pointerEvents: 'auto',
        }}>{fieldDisp}</div>
      </div>
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
  const [activeIdx, setActiveIdx] = useState<number|null>(null)
  
  const isMobile = vw < 768

  const open  = (i: number) => { setActiveIdx(i); setOpenIdx(i); onOverlayChange?.(true) }
  const close = () => { setOpenIdx(null); setTimeout(() => setActiveIdx(null), 500); onOverlayChange?.(false) }
  const nav   = (i: number) => { setActiveIdx(i); setOpenIdx(i) }

  const overlayOpen = openIdx !== null
  const steps = PROJECTS.length
  const segment = 1 / steps
  const enterBias = 0.62

  useEffect(() => {
    if (!mounted) return
    const sec = sectionRef.current
    if (!sec) return
    const scrolled = -sec.getBoundingClientRect().top
    const total = sec.offsetHeight - vh
    const next = total <= 0 ? 0 : Math.max(0, Math.min(1, scrolled / total))
    setSectionProgress(next)
  }, [scrollY, vh, mounted])

  return (
    <>
      <section ref={sectionRef} id="projekte" style={{
        backgroundColor: 'transparent',
        height: `${Math.max(420, steps * 90)}vh`,
        position: 'relative', zIndex: isMobile ? 10 : 1,
        marginTop: '-42vh',
      }}>
        <div style={{
          position: 'sticky', top: 0, height: '100vh', width: '100%', overflow: 'hidden',
          filter: overlayOpen ? 'blur(8px)' : 'none',
          transition: 'filter 0.35s ease',
        }}>
          {PROJECTS.map((p, i) => {
            const enter = (sectionProgress - i * segment) / segment + enterBias
            return (
              <ProjectCard
                key={p.id}
                project={p}
                forceHover={activeIdx === i}
                overlayOpen={overlayOpen}
                onClick={() => open(i)}
                enterProgress={enter}
                isMobile={isMobile}
                layerIndex={i}
              />
            )
          })}
        </div>
      </section>
      {openIdx !== null && <Overlay idx={openIdx} onClose={close} onNav={nav} />}
    </>
  )
}

type Phase = 'in'|'open'|'closing'

function Overlay({ idx, onClose, onNav }: {
  idx: number; onClose: () => void; onNav: (i: number) => void
}) {
  const { language } = useLanguage()
  const lang = language as Lang
  const [phase, setPhase]   = useState<Phase>('in')
  const [curIdx, setCurIdx] = useState(idx)
  const [navKey, setNavKey] = useState(0)
  const lockRef = useRef(false)
  const cur = PROJECTS[curIdx]

  const vw  = typeof window !== 'undefined' ? window.innerWidth : 1440
  const vh  = typeof window !== 'undefined' ? window.innerHeight : 800
  const mob = vw < 768
  const imgW = mob ? Math.round(vw * 0.88) : Math.min(Math.round(vw * 0.42), 520)
  const panW = mob ? Math.round(vw * 0.88) : Math.min(Math.round(vw * 0.46), 580)

  useEffect(() => {
    document.documentElement.style.setProperty('scrollbar-gutter', 'stable')
    document.body.style.overflow = 'hidden'
    document.body.classList.add('overlay-open')
    const raf = requestAnimationFrame(() => requestAnimationFrame(() => setPhase('open')))
    return () => {
      cancelAnimationFrame(raf)
      document.body.style.overflow = ''
      document.documentElement.style.removeProperty('scrollbar-gutter')
      document.body.classList.remove('overlay-open')
    }
  }, [])

  const close = useCallback(() => {
    if (phase === 'closing') return
    setPhase('closing')
    setTimeout(() => onClose(), 520)
  }, [phase, onClose])

  const navigate = useCallback((dir: 'l'|'r') => {
    if (lockRef.current) return
    lockRef.current = true
    const n = PROJECTS.length
    const ni = dir === 'r' ? (curIdx + 1) % n : (curIdx - 1 + n) % n
    setCurIdx(ni); setNavKey(k => k + 1); onNav(ni)
    setTimeout(() => { lockRef.current = false }, 700)
  }, [curIdx, onNav])

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
    ? `transform 300ms ${EASE} 200ms, opacity 280ms ease 200ms`
    : `transform 320ms ${EASE}, opacity 300ms ease`
  const panX       = (phase === 'in' || phase === 'closing') ? '-100%' : '0%'
  const panOpacity = (phase === 'in' || phase === 'closing') ? 0 : 1
  const panTransition = phase === 'closing'
    ? `transform 260ms ${EASE}, opacity 240ms ease`
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
      <style>{`
        body.overlay-open .fixed-ui {
          filter: blur(8px) !important;
          transition: filter 0.35s ease !important;
          pointer-events: none !important;
        }
        body.overlay-open .mobile-nav-blur {
          opacity: 0 !important;
          pointer-events: none !important;
        }
      `}</style>
      <div onClick={close} style={{
        position: 'fixed', inset: 0, zIndex: 999999,
        backgroundColor: phase === 'open' ? 'rgba(0,0,0,0.22)' : 'rgba(0,0,0,0)',
        backdropFilter:       phase === 'open' ? 'blur(12px)' : 'blur(0px)',
        WebkitBackdropFilter: phase === 'open' ? 'blur(12px)' : 'blur(0px)',
        transition: 'background-color 0.35s ease, backdrop-filter 0.35s ease',
        cursor: 'pointer',
      }} />
      <div style={{
        position: 'fixed', inset: 0, zIndex: 1000000,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        pointerEvents: 'none',
      }}>
        <div style={{
          display: 'flex',
          flexDirection: mob ? 'column' : 'row',
          alignItems: mob ? 'center' : 'stretch',
          pointerEvents: 'auto',
          cursor: 'default',
        }}>
          <div style={{
            width: imgW, flexShrink: 0, position: 'relative', zIndex: 1,
            transform: imgScale, opacity: imgOpacity, transition: imgTransition,
            overflow: 'hidden',
          }}>
            <PixelCarouselOneShot key={navKey} images={cur.images} w={imgW} animateIn={navKey > 0} />
          </div>
          <div
            onClick={e => e.stopPropagation()}
            style={{
              width: panW, flexShrink: 0, position: 'relative', zIndex: 0,
              transform: `translateX(${panX})`,
              opacity: panOpacity, transition: panTransition,
              backgroundColor: '#ffffff', overflow: 'hidden', cursor: 'default',
            }}
          >
            <button onClick={close}
              style={{ ...iconBtn, position: 'absolute', top: 18, right: 18, zIndex: 2 }}
              onMouseEnter={hi} onMouseLeave={hlo}>
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <line x1="1" y1="1" x2="17" y2="17" stroke="#0a0a0a" strokeWidth="3" strokeLinecap="square"/>
                <line x1="17" y1="1" x2="1" y2="17" stroke="#0a0a0a" strokeWidth="3" strokeLinecap="square"/>
              </svg>
            </button>
            <PanelContent key={curIdx} project={cur} idx={curIdx} lang={lang} doScramble={navKey > 0} onNav={navigate} isMobile={mob} />
          </div>
        </div>
      </div>
    </>
  )
}

function PanelContent({ project, idx, lang, doScramble, onNav, isMobile }: {
  project: Project; idx: number; lang: Lang
  doScramble: boolean; onNav: (d:'l'|'r') => void; isMobile: boolean
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
  }, []) // eslint-disable-line

  const b: React.CSSProperties = {
    background: 'none', border: 'none', cursor: 'pointer', padding: 6, lineHeight: 0,
    opacity: 0.3, transition: 'opacity 0.15s',
    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  }
  const hi  = (e: React.MouseEvent<HTMLButtonElement>) => ((e.currentTarget as HTMLElement).style.opacity = '1')
  const hlo = (e: React.MouseEvent<HTMLButtonElement>) => ((e.currentTarget as HTMLElement).style.opacity = '0.3')

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
        color: '#555',
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
          {String(idx + 1).padStart(2, '0')} / {String(PROJECTS.length).padStart(2, '0')}
        </span>
        <div style={{ display: 'flex', gap: 2 }}>
          <button onClick={() => onNav('l')} style={b} onMouseEnter={hi} onMouseLeave={hlo}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <polyline points="13,2 6,10 13,18" stroke="#0a0a0a" strokeWidth="3" strokeLinecap="square" strokeLinejoin="miter"/>
            </svg>
          </button>
          <button onClick={() => onNav('r')} style={b} onMouseEnter={hi} onMouseLeave={hlo}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <polyline points="7,2 14,10 7,18" stroke="#0a0a0a" strokeWidth="3" strokeLinecap="square" strokeLinejoin="miter"/>
            </svg>
          </button>
        </div>
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