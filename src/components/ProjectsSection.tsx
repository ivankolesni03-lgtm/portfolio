'use client'
import { useState, useRef, useEffect, useCallback } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'

const CHARS = '!@#$%&*АБВГДЕЖИКЛМНОПРСТУФХЦ'

const PROJECTS = [
  { id:1, title:{de:'Hochschule\nHannover',en:'Hannover\nUASA'}, field:{de:'Image\nKampagne',en:'Image\nCampaign'}, description:{de:'Mangelnde Brand-Sichtbarkeit und eine zu sachliche Web-Präsenz verhindern den emotionalen Zugang. „Home of Community" positioniert die Hochschule als ein Ort für Kreative.',en:'Lack of brand visibility and an overly factual web presence prevent emotional engagement. "Home of Community" positions the university as a place for creatives.'}, image:'/images/hochschule.jpg', images:['/images/hochschule0.jpg','/images/hochschule1.jpg','/images/hochschule3.jpg','/images/hochschule4.jpg'], tags:{de:['Social Media','OOH','Brand Strategie'],en:['Social Media','OOH','Brand Strategy']}, youtube: null },
  { id:2, title:{de:'Continental',en:'Continental'}, field:{de:'Produkt\nKampagne',en:'Product\nCampaign'}, description:{de:'Einblicke in die globale Kommunikationslogik bei Continental. Begleitung des Product Drops Ice Contact 8 von der Agentur-Ideation bis zum Launch.',en:'Insights into global communication logic at Continental. Accompanying the Ice Contact 8 product drop from agency ideation to launch.'}, image:'/images/continental.jpg', images:['/images/continental.jpg','/images/continental1.jpg','/images/continental2.jpg'], tags:{de:['Strategie','Kampagne','Copywriting'],en:['Strategy','Campaign','Copywriting']}, youtube: null },
  { id:3, title:{de:'HateAid',en:'HateAid'}, field:{de:'Awareness\nKampagne',en:'Awareness\nCampaign'}, description:{de:'Produktion von Short-Form Video Content für verschiedene Marken. Von der Idee bis zum fertigen Reel – Storytelling, Schnitt und Postproduktion.',en:'Production of short-form video content for various brands. From idea to finished reel – storytelling, editing and post-production.'}, image:'/images/hateaid.jpg', images:['/images/hateaid.jpg','/images/paece.jpg'], tags:{de:['Reels','Schnitt','Storytelling','TikTok'],en:['Reels','Editing','Storytelling','TikTok']}, youtube: null },
  { id:4, title:{de:'Lebara',en:'Lebara'}, field:{de:'Social Media\nMarketing',en:'Social Media\nMarketing'}, description:{de:'Social Media Content, Community Management und Memes für den Mobilfunkanbieter Lebara. Vom Briefing bis zum Performance Review.',en:'Social media content, community management and memes for mobile provider Lebara. From briefing to performance review.'}, image:'/images/lebara.jpg', images:['/images/lebara.jpg','/images/ai.jpg','/images/hateaid.jpg'], tags:{de:['Content Creation','Memes','TikTok','Community'],en:['Content Creation','Memes','TikTok','Community']}, youtube: null },
  { id:5, title:{de:'Ganbatte',en:'Ganbatte'}, field:{de:'Visuelle\nKommunikation',en:'Visual\nCommunication'}, description:{de:'KI als neues Medium der Inspiration. Mit ComfyUI, N8N und gezieltem LoRA-Training entstehen Bild und Video.',en:'AI as a new medium of inspiration. With ComfyUI, N8N and targeted LoRA training, images and videos are created.'}, image:'/images/ganbatte.jpg', images:['/images/ganbatte.jpg','/images/continental.jpg','/images/ai.jpg'], tags:{de:['ComfyUI','LoRA','N8N','Generative KI'],en:['ComfyUI','LoRA','N8N','Generative AI']}, youtube: null },
  { id:6, title:{de:'Cavallo',en:'Cavallo'}, field:{de:'UX & Web\nDesign',en:'UX & Web\nDesign'}, description:{de:'Entwicklung einer interaktiven Kommunikationskampagne für eine Eventlocation, inklusive Flowchart, Website-Layout und Mockups.',en:'Development of an interactive communication campaign for an event location, including flowchart, website layout and mockups.'}, image:'/images/cavallo.jpg', images:['/images/cavallo.jpg','/images/hochschule.png'], tags:{de:['UX','UI','Web Design','Mockup'],en:['UX','UI','Web Design','Mockup']}, youtube: null },
  { id:7, title:{de:'Bold.',en:'Bold.'}, field:{de:'Brand\nDesign',en:'Brand\nDesign'}, description:{de:'Social-Media-Kampagne für eine Supplement-Marke. Motion Design und Postproduktion, um Benefits hervorzuheben.',en:'Social media campaign for a supplement brand. Motion design and post-production to highlight benefits.'}, image:'/images/bold.jpg', images:['/images/bold.jpg','/images/lebara.jpg'], tags:{de:['Motion Design','Postproduktion','Social Media'],en:['Motion Design','Post-Production','Social Media']}, youtube: null },
  { id:8, title:{de:'pocoloco',en:'pocoloco'}, field:{de:'Corporate\nDesign',en:'Corporate\nDesign'}, description:{de:'Konzeption und Umsetzung eines digitalen Portfolios mit Next.js, Tailwind und prozeduralen Scroll-Animationen.',en:'Conception and implementation of a digital portfolio with Next.js, Tailwind and procedural scroll animations.'}, image:'/images/pocoloco.jpg', images:['/images/pocoloco.jpg','/images/ai.jpg'], tags:{de:['Next.js','TypeScript','Animation','Branding'],en:['Next.js','TypeScript','Animation','Branding']}, youtube: null },
  { id:9, title:{de:'Glow\nNation',en:'Glow\nNation'}, field:{de:'Kommunikations\nDesign',en:'Communication\nDesign'}, description:{de:'Ganzheitliche Kommunikationsstrategien für mittelständische Unternehmen. Zielgruppenanalyse, Kanalwahl und Messaging-Architektur.',en:'Holistic communication strategies for medium-sized companies. Target group analysis, channel selection and messaging architecture.'}, image:'/images/glownation.jpg', images:['/images/glownation.jpg','/images/cavallo.jpg'], tags:{de:['Strategie','Beratung','B2B','Analyse'],en:['Strategy','Consulting','B2B','Analysis']}, youtube: null },
  { id:10, title:{de:'Tennisheine',en:'Tennisheine'}, field:{de:'Bewegtbild',en:'Motion\nPicture'}, description:{de:'Bewegtbild-Produktion für den Tennisclub Tennisheine. Von der Konzeption über den Dreh bis zum fertigen Schnitt – authentisches Storytelling im Sport.',en:'Moving image production for tennis club Tennisheine. From concept to shoot to final cut – authentic storytelling in sport.'}, image:'/images/tennisheine.jpg', images:['/images/tennisheine.jpg','/images/bold.jpg'], tags:{de:['Video','Schnitt','Sport','Storytelling'],en:['Video','Editing','Sport','Storytelling']}, youtube: 'https://www.youtube.com/watch?v=a5Im48lce0M' },
  { id:11, title:{de:'GWA\nMackingOff',en:'GWA\nMackingOff'}, field:{de:'Bewegtbild',en:'Motion\nPicture'}, description:{de:'Kampagnenfilm für den GWA MackingOff Award. Kreative Umsetzung eines gesellschaftlich relevanten Themas mit gezieltem Einsatz von Bildsprache und Montage.',en:'Campaign film for the GWA HackingOff Award. Creative realisation of a socially relevant topic through targeted use of visual language and montage.'}, image:'/images/gwa.jpg', images:['/images/gwa.jpg','/images/hateaid.jpg'], tags:{de:['Kampagnenfilm','Regie','Montage','Award'],en:['Campaign Film','Direction','Montage','Award']}, youtube: 'https://www.youtube.com/watch?v=a5Im48lce0M' },
  { id:12, title:{de:'Weros\nWebdynamics',en:'Weros\nWebdynamics'}, field:{de:'Fotografie',en:'Photography'}, description:{de:'Produktfotografie und visuelle Identität für Weros Webdynamics. Klare Bildsprache, die technische Kompetenz und moderne Ästhetik verbindet.',en:'Product photography and visual identity for Weros Webdynamics. Clear visual language combining technical expertise with modern aesthetics.'}, image:'/images/weros.jpg', images:['/images/weros.jpg','/images/weros1.jpg','/images/weros2.jpg'], tags:{de:['Fotografie','Produktfoto','Branding','Visual Identity'],en:['Photography','Product Photo','Branding','Visual Identity']}, youtube: null },
]
type Project = typeof PROJECTS[0]
type Lang = 'de'|'en'

function runScramble(
  target: string,
  set: (s:string) => void,
  ref: React.MutableRefObject<ReturnType<typeof setInterval>|null>,
  onDone?: () => void
) {
  let i = 0
  const rev = new Set<number>()
  if (ref.current) clearInterval(ref.current)
  ref.current = setInterval(() => {
    i++
    const pool = target.split('').map((_,j)=>j)
      .filter(j => !rev.has(j) && target[j] !== ' ' && target[j] !== '\n')
    if (pool.length) rev.add(pool[Math.floor(Math.random() * pool.length)])
    set(target.split('').map((c,j) =>
      rev.has(j) || c === ' ' || c === '\n'
        ? target[j]
        : CHARS[Math.floor(Math.random() * CHARS.length)]
    ).join(''))
    if (i >= 16) { clearInterval(ref.current!); set(target); onDone?.() }
  }, 30)
}

function useScramble(text: string) {
  const [disp, setDisp] = useState(text)
  const ref = useRef<ReturnType<typeof setInterval>|null>(null)
  const prevText = useRef(text)
  useEffect(() => {
    if (prevText.current !== text) {
      prevText.current = text
      runScramble(text, setDisp, ref)
    }
  }, [text])
  const go = useCallback(() => runScramble(text, setDisp, ref), [text])
  return { disp, scramble: go }
}

function ScrambleText({ text, style }: { text: string; style?: React.CSSProperties }) {
  const { disp, scramble } = useScramble(text)
  return <span onMouseEnter={scramble} style={{ cursor: 'default', ...style }}>{disp}</span>
}

function PixelCanvas({ src, w, pixelSize = 1 }: { src: string; w: number; pixelSize?: number }) {
  const cvs    = useRef<HTMLCanvasElement>(null)
  const domImg = useRef<HTMLImageElement>(null)
  const natHRef = useRef(0)
  const [natH, setNatH] = useState(0)

  const draw = useCallback(() => {
    const img = domImg.current
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

  const handleLoad = useCallback(() => {
    const img = domImg.current
    if (!img || !img.naturalWidth || !img.naturalHeight) return
    const h = Math.round(w * img.naturalHeight / img.naturalWidth)
    natHRef.current = h
    setNatH(h)
    draw()
  }, [w, draw])

  useEffect(() => {
    if (natH) draw()
  }, [pixelSize, draw, natH])

  return (
    <div style={{ position: 'relative', lineHeight: 0 }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img ref={domImg} src={src} alt="" onLoad={handleLoad} aria-hidden="true"
        style={{ position: 'absolute', width: 0, height: 0, opacity: 0, pointerEvents: 'none' }}
      />
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

function AnimatedHeading() {
  const { language } = useLanguage()
  const text = language === 'de' ? 'PROJEKTE' : 'PROJECTS'
  const { disp, scramble } = useScramble(text)
  const staticRef  = useRef<HTMLDivElement>(null)
  const fixedElRef = useRef<HTMLDivElement | null>(null)
  const [isMobile, setIsMobile] = useState<boolean | null>(null)

  useEffect(() => {
    setIsMobile(window.innerWidth < 768)
  }, [])

  useEffect(() => {
    if (fixedElRef.current) fixedElRef.current.textContent = disp
  }, [disp])

  useEffect(() => {
    if (isMobile === null || isMobile) return

    const el = document.createElement('div')
    el.textContent = text
    Object.assign(el.style, {
      position: 'fixed', fontWeight: '900', textTransform: 'uppercase',
      color: '#ffffff', mixBlendMode: 'difference', zIndex: '99999',
      pointerEvents: 'none', userSelect: 'none', whiteSpace: 'nowrap',
      cursor: 'pointer', display: 'none', fontFamily: 'inherit',
    })
    el.addEventListener('click', () => {
      const sec = document.getElementById('projekte')
      if (!sec) return
      window.scrollTo({ top: sec.getBoundingClientRect().top + window.scrollY, behavior: 'smooth' })
    })
    el.addEventListener('mouseenter', () => {
      let i = 0
      const rev = new Set<number>()
      const iv = setInterval(() => {
        i++
        const pool = text.split('').map((_,j)=>j).filter(j => !rev.has(j) && text[j] !== ' ')
        if (pool.length) rev.add(pool[Math.floor(Math.random() * pool.length)])
        el.textContent = text.split('').map((c,j) =>
          rev.has(j) || c === ' ' ? text[j] : CHARS[Math.floor(Math.random() * CHARS.length)]
        ).join('')
        if (i >= 16) { clearInterval(iv); el.textContent = text }
      }, 30)
    })
    document.body.appendChild(el)
    fixedElRef.current = el

    const startPos = { l: 0, t: 0 }
    const fn = () => {
      const staticEl = staticRef.current
      const section  = document.getElementById('projekte')
      if (!staticEl || !section) return
      const sr  = section.getBoundingClientRect()
      const hr  = staticEl.getBoundingClientRect()
      const raw = Math.max(0, Math.min(1, (-hr.top + 80) / 200))

      if (raw < 0.01) {
        startPos.l = hr.left; startPos.t = hr.top
        staticEl.style.visibility = 'visible'
        el.style.display = 'none'; el.style.pointerEvents = 'none'
        return
      }
      if (sr.top > 200) {
        staticEl.style.visibility = 'visible'
        el.style.display = 'none'; el.style.pointerEvents = 'none'
        return
      }
      staticEl.style.visibility = 'hidden'
      el.style.display = 'block'; el.style.pointerEvents = 'auto'

      const vw = window.innerWidth / 100
      el.style.fontSize      = `${8 * vw + (14 - 8 * vw) * raw}px`
      el.style.lineHeight    = `${0.9 + 0.3 * raw}`
      el.style.left          = `${32 + (startPos.l - 32) * (1 - raw)}px`
      el.style.top           = `${68 + (startPos.t - 68) * (1 - raw)}px`
      el.style.letterSpacing = `${-2 + raw * 1.72}px`

      if (raw >= 0.98) {
        el.style.fontSize = '14px'; el.style.lineHeight = '1.2'
        el.style.left = '32px'; el.style.top = '68px'
        el.style.letterSpacing = '-0.02em'
      }
    }
    window.addEventListener('scroll', fn, { passive: true }); fn()
    return () => { window.removeEventListener('scroll', fn); el.remove() }
  }, [isMobile]) // eslint-disable-line

  if (isMobile === null) return null

  return (
    <div
      ref={staticRef}
      className="projekte-heading"
      onMouseEnter={isMobile ? undefined : scramble}
      style={{
        fontSize: isMobile ? '16vw' : '8vw',
        fontWeight: 900, lineHeight: 0.9, letterSpacing: '-2px',
        textTransform: 'uppercase', color: '#0a0a0a',
        margin: 0, cursor: 'default', visibility: 'visible',
      }}
    >{disp}</div>
  )
}

const STATS_DATA = [
  { value: 20,  suffix: '+', labelDe: 'Projekte',  labelEn: 'Projects'  },
  { value: 100, suffix: '%', labelDe: 'Ambition',  labelEn: 'Ambition'  },
  { value: 6,   suffix: '',  labelDe: 'Semester',  labelEn: 'Semesters' },
]

export function StatsBlock() {
  const { language } = useLanguage()
  const lang = language as Lang
  const spacerRef = useRef<HTMLDivElement>(null)
  const stickyRef = useRef<HTMLDivElement>(null)
  const [progress,  setProgress] = useState(0)
  const [isFixed,   setIsFixed]  = useState(false)
  const [exitBlur,  setExitBlur] = useState(0)
  const [isMobile,  setIsMobile] = useState(false)
  const fixedRef        = useRef(false)
  const fixedScrollYRef = useRef(0)

  useEffect(() => { setIsMobile(window.innerWidth < 768) }, [])

  useEffect(() => {
    const fn = () => {
      const spacer = spacerRef.current; const sticky = stickyRef.current
      if (!spacer || !sticky) return
      const sr = spacer.getBoundingClientRect()
      const vh = window.innerHeight

      if (!fixedRef.current && sr.top < vh * 0.6 && sr.bottom > vh * 0.1) {
        fixedRef.current = true; fixedScrollYRef.current = window.scrollY; setIsFixed(true)
      }
      if (fixedRef.current) {
        const delta = window.scrollY - fixedScrollYRef.current
        setProgress(Math.max(0, Math.min(1, delta / (vh * 0.20))))
        setExitBlur(1 - Math.max(0, Math.min(1, sr.bottom / (vh * 1.5))))
      }
      if (sr.bottom < vh * 0.05 && fixedRef.current) {
        fixedRef.current = false; setIsFixed(false); setExitBlur(0)
      }
      if (sr.top > vh * 0.7) {
        if (fixedRef.current) { fixedRef.current = false; setIsFixed(false); setExitBlur(0) }
        setProgress(0)
      }
    }
    window.addEventListener('scroll', fn, { passive: true }); fn()
    return () => window.removeEventListener('scroll', fn)
  }, [])

  const renderGrid = () => (
    <div style={{
      paddingLeft:  isMobile ? '8vw' : 'clamp(80px,18vw,260px)',
      paddingRight: isMobile ? '8vw' : 'clamp(24px,6vw,80px)',
      boxSizing: 'border-box' as const, width: '100%',
      filter:  exitBlur > 0 ? `blur(${exitBlur * 24}px)` : 'none',
      opacity: exitBlur > 0 ? 1 - exitBlur : 1,
    }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr 1fr',
        columnGap: 'clamp(60px,10vw,140px)',
        rowGap: isMobile ? '10vw' : 0,
        alignItems: 'end',
      }}>
        {STATS_DATA.map((s, i) => {
          const label = lang === 'de' ? s.labelDe : s.labelEn
          const val   = Math.round(progress * s.value)
          return (
            <div key={i}>
              <div style={{
                fontSize: isMobile ? 'clamp(72px,22vw,120px)' : 'clamp(80px,13vw,192px)',
                fontWeight: 900, lineHeight: 0.85,
                letterSpacing: isMobile ? '-3px' : '-6px',
                color: '#0a0a0a', margin: '0 0 clamp(8px,1vw,16px)',
                fontVariantNumeric: 'tabular-nums',
              }}>{val}{s.suffix}</div>
              <ScrambleText text={label} style={{
                display: 'block', color: '#0a0a0a',
                fontSize: isMobile ? '18px' : 'clamp(14px,2.2vw,24px)',
                fontWeight: 800, letterSpacing: '-0.5px',
                textTransform: 'uppercase', lineHeight: 1.1,
              }} />
            </div>
          )
        })}
      </div>
    </div>
  )

  return (
    <>
      <div ref={spacerRef} style={{
        height: isMobile ? '320vh' : '250vh',
        backgroundColor: '#ffffff', position: 'relative', zIndex: 2,
        marginTop: isMobile ? 'clamp(40px,8vw,80px)' : 'clamp(80px,14vw,180px)',
      }}>
        <div ref={stickyRef} style={{
          position: 'sticky', top: '50%', transform: 'translateY(-50%)',
          width: '100%', pointerEvents: 'none', opacity: isFixed ? 0 : 1,
        }}>
          {renderGrid()}
        </div>
      </div>
      <div style={{
        position: 'fixed', inset: 0, zIndex: 2, display: 'flex', alignItems: 'center',
        backgroundColor: '#ffffff', pointerEvents: 'none',
        opacity: isFixed ? 1 : 0, transition: 'opacity 0.15s ease',
      }}>
        {renderGrid()}
      </div>
    </>
  )
}

function ProjectCard({ project, forceHover, onClick }: {
  project: Project; forceHover: boolean; onClick: () => void
}) {
  const { language } = useLanguage()
  const lang = language as Lang
  const [hov, setHov] = useState(false)
  const [pressed, setPressed] = useState(false)
  const isActive = hov || forceHover
  const titleText = project.title[lang]
  const fieldText = project.field[lang]
  const [disp, setDisp] = useState(titleText)
  const sRef = useRef<ReturnType<typeof setInterval>|null>(null)
  const prevLang = useRef(lang)

  useEffect(() => {
    if (prevLang.current !== lang) {
      prevLang.current = lang
      runScramble(hov ? fieldText : titleText, setDisp, sRef)
    }
  }, [lang, titleText, fieldText, hov])

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => { setHov(true); runScramble(fieldText, setDisp, sRef) }}
      onMouseLeave={() => { setHov(false); setPressed(false); runScramble(titleText, setDisp, sRef) }}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      style={{
        position: 'relative', cursor: 'pointer',
        transform: pressed ? 'scale(0.93)' : isActive ? 'scale(0.97)' : 'scale(1)',
        transition: 'transform 0.32s cubic-bezier(0.16,1,0.3,1)',
      }}
    >
      <img src={project.image} alt="" style={{
        display: 'block', width: '100%', height: 'auto',
        filter: isActive ? 'none' : 'invert(1) hue-rotate(180deg) grayscale(1)',
        transition: 'filter 0.22s ease-out', userSelect: 'none', pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(to top,rgba(0,0,0,0.6) 0%,rgba(0,0,0,0.08) 40%,transparent 65%)',
        zIndex: 1,
      }} />
      <div style={{
        position: 'absolute', bottom: 'clamp(8px,2vw,18px)',
        left: 'clamp(8px,2.5vw,18px)', right: 'clamp(8px,2.5vw,18px)', zIndex: 2,
      }}>
        <h3 style={{
          color: '#fff', fontSize: 'clamp(11px,2.2vw,24px)', fontWeight: 800,
          textTransform: 'uppercase', margin: 0, lineHeight: 1.1,
          letterSpacing: '-0.5px', whiteSpace: 'pre-line',
        }}>{disp}</h3>
      </div>
    </div>
  )
}

export function ProjectsSection() {
  const [openIdx, setOpenIdx] = useState<number|null>(null)
  const [activeIdx, setActiveIdx] = useState<number|null>(null)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => { setIsMobile(window.innerWidth < 768) }, [])

  const open  = (i: number) => { setActiveIdx(i); setOpenIdx(i) }
  const close = () => { setOpenIdx(null); setTimeout(() => setActiveIdx(null), 500) }
  const nav   = (i: number) => { setActiveIdx(i); setOpenIdx(i) }

  return (
    <>
      <section id="projekte" style={{
        backgroundColor: '#ffffff',
        padding: isMobile ? '48px 5vw 40px' : 'clamp(60px,10vw,120px) 9vw clamp(120px,18vw,240px)',
        position: 'relative', zIndex: 1,
        marginTop: isMobile ? '-5vh' : '-70vh',
      }}>
        <div style={{ marginBottom: isMobile ? '6vw' : 'clamp(40px,6vw,72px)' }}>
          <AnimatedHeading />
        </div>
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(3,1fr)',
          gap: isMobile ? '3vw' : 'clamp(12px,2vw,24px)',
        }}>
          {PROJECTS.map((p, i) => (
            <ProjectCard key={p.id} project={p} forceHover={activeIdx === i} onClick={() => open(i)} />
          ))}
        </div>
      </section>
      <StatsBlock />
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
  const mob = vw < 768
  const imgW = mob ? Math.round(vw * 0.92) : Math.min(Math.round(vw * 0.42), 520)
  const panW = mob ? Math.round(vw * 0.92) : Math.min(Math.round(vw * 0.46), 580)

  useEffect(() => {
    document.documentElement.style.setProperty('scrollbar-gutter', 'stable')
    document.body.style.overflow = 'hidden'
    const raf = requestAnimationFrame(() => requestAnimationFrame(() => setPhase('open')))
    return () => {
      cancelAnimationFrame(raf)
      document.body.style.overflow = ''
      document.documentElement.style.removeProperty('scrollbar-gutter')
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
      <div onClick={close} style={{
        position: 'fixed', inset: 0, zIndex: 100000,
        backgroundColor: phase === 'open' ? 'rgba(0,0,0,0.22)' : 'rgba(0,0,0,0)',
        backdropFilter:       phase === 'open' ? 'blur(12px)' : 'blur(0px)',
        WebkitBackdropFilter: phase === 'open' ? 'blur(12px)' : 'blur(0px)',
        transition: 'background-color 0.35s ease, backdrop-filter 0.35s ease',
        cursor: 'pointer',
      }} />

      <div style={{
        position: 'fixed', inset: 0, zIndex: 100001,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        pointerEvents: 'none',
      }}>
        <div style={{
          display: 'flex',
          flexDirection: mob ? 'column' : 'row',
          alignItems: mob ? 'center' : 'stretch',
          pointerEvents: 'auto',
          maxHeight: mob ? '90vh' : 'none',
          overflowY: mob ? 'auto' : 'visible',
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
            <PanelContent
              key={curIdx} project={cur} idx={curIdx} lang={lang}
              doScramble={navKey > 0} onNav={navigate}
            />
          </div>
        </div>
      </div>
    </>
  )
}

function PanelContent({ project, idx, lang, doScramble, onNav }: {
  project: Project; idx: number; lang: Lang
  doScramble: boolean; onNav: (d:'l'|'r') => void
}) {
  const titleRaw = project.title[lang]
  const descRaw  = project.description[lang]
  const [titleDisp, setTitleDisp] = useState(titleRaw)
  const [descDisp,  setDescDisp]  = useState(descRaw)
  const titleRef = useRef<ReturnType<typeof setInterval>|null>(null)
  const descRef  = useRef<ReturnType<typeof setInterval>|null>(null)
  const [hovYT, setHovYT] = useState(false)

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
      padding: 'clamp(56px,6vw,72px) clamp(28px,3.5vw,42px) clamp(28px,3.5vw,42px)',
      boxSizing: 'border-box',
    }}>
      <h2
        onMouseEnter={() => runScramble(titleRaw, setTitleDisp, titleRef)}
        style={{
          color: '#0a0a0a', fontSize: 'clamp(24px,3vw,54px)', fontWeight: 900,
          textTransform: 'uppercase', margin: '0 0 clamp(12px,1.8vw,22px)',
          lineHeight: 1.0, letterSpacing: '-1.5px', flexShrink: 0,
          whiteSpace: 'pre-line', cursor: 'default',
        }}
      >{titleDisp}</h2>

      <p style={{
        color: '#555', fontSize: 'clamp(13px,1.4vw,16px)',
        lineHeight: 1.85, margin: '0 0 clamp(14px,1.8vw,24px)', flex: 1,
        userSelect: 'text',
      }}>{descDisp}</p>

      {project.youtube && (
        <a
          href={project.youtube}
          target="_blank"
          rel="noopener noreferrer"
          onMouseEnter={() => setHovYT(true)}
          onMouseLeave={() => setHovYT(false)}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 10,
            backgroundColor: hovYT ? '#333' : '#0a0a0a',
            color: '#ffffff', fontSize: 11, fontWeight: 700,
            letterSpacing: '0.12em', textTransform: 'uppercase',
            padding: '11px 20px', textDecoration: 'none',
            marginBottom: 'clamp(16px,2vw,24px)',
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

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 'clamp(16px,2vw,24px)', flexShrink: 0 }}>
        {project.tags[lang].map((tag, i) => <TagPill key={i} label={tag} />)}
      </div>

      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexShrink: 0 }}>
        <span style={{
          color: '#0a0a0a', fontSize: 'clamp(14px,1.6vw,22px)',
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

function TagPill({ label }: { label: string }) {
  const [pressed, setPressed] = useState(false)
  return (
    <span
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      onMouseLeave={() => setPressed(false)}
      style={{
        backgroundColor: '#0a0a0a', color: '#ffffff',
        fontSize: 9, letterSpacing: '0.12em',
        textTransform: 'uppercase', padding: '5px 10px',
        transform: pressed ? 'scale(0.92)' : 'scale(1)',
        transition: 'transform 0.12s ease',
        cursor: 'default', display: 'inline-block',
      }}
    >{label}</span>
  )
}