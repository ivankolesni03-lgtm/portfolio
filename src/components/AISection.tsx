'use client'
import { useRef, useEffect, useState, useCallback } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'

// ─── Scramble ─────────────────────────────────────────────────────────────────
const CHARS = '!@#$%&*АБВГДЕЖИКЛМНОПРСТУФХЦ'
function runScramble(target: string, set: (s:string)=>void, ref: React.MutableRefObject<ReturnType<typeof setInterval>|null>) {
  let i = 0; const rev = new Set<number>()
  if (ref.current) clearInterval(ref.current)
  ref.current = setInterval(() => {
    i++
    const pool = target.split('').map((_,j)=>j).filter(j=>!rev.has(j)&&target[j]!==' '&&target[j]!=='\n')
    if (pool.length) rev.add(pool[Math.floor(Math.random()*pool.length)])
    set(target.split('').map((c,j)=>rev.has(j)||c===' '||c==='\n'?target[j]:CHARS[Math.floor(Math.random()*CHARS.length)]).join(''))
    if (i>=16){clearInterval(ref.current!);set(target)}
  },30)
}
function useScramble(text: string) {
  const [disp,setDisp]=useState(text)
  const ref=useRef<ReturnType<typeof setInterval>|null>(null)
  const prev=useRef(text)
  useEffect(()=>{if(prev.current!==text){prev.current=text;runScramble(text,setDisp,ref)}},[text])
  const scramble=useCallback(()=>runScramble(text,setDisp,ref),[text])
  return {disp,scramble}
}

// ─── StaticHeadingKI ──────────────────────────────────────────────────────────
function StaticHeadingKI() {
  const { language } = useLanguage()
  const de = language === 'de'
  const { disp: d1, scramble: s1 } = useScramble(de ? 'Generative' : 'Generative')
  const { disp: d2, scramble: s2 } = useScramble(de ? 'Intelligenz' : 'Intelligence')
  const scramble = () => { s1(); s2() }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { scramble() }, [language])
  return (
    <div onMouseEnter={scramble} style={{
      fontSize: '8vw', fontWeight: 900, lineHeight: 0.9, letterSpacing: '-2px',
      textTransform: 'uppercase', color: '#ffffff',
      margin: 0, cursor: 'default', userSelect: 'none',
    }}>
      <div style={{ whiteSpace: 'nowrap' }}>{d1}</div>
      <div style={{ whiteSpace: 'nowrap' }}>{d2}</div>
    </div>
  )
}

// ─── CodeRain ─────────────────────────────────────────────────────────────────
const MATRIX_CHARS = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ'
function CodeRain() {
  const cvs = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const c = cvs.current; if (!c) return
    const ctx = c.getContext('2d')!
    const fs = 14
    const resize = () => {
      c.width  = c.parentElement?.offsetWidth  ?? window.innerWidth
      c.height = c.parentElement?.offsetHeight ?? window.innerHeight
    }
    resize(); window.addEventListener('resize', resize)
    const cols = Math.floor(c.width / fs)
    const drops = Array.from({ length: cols }, () => Math.random() * -80)
    const spd   = Array.from({ length: cols }, () => 0.25 + Math.random() * 0.6)
    let raf = 0, last = 0
    const draw = (ts: number) => {
      raf = requestAnimationFrame(draw)
      if (ts - last < 60) return; last = ts
      ctx.fillStyle = 'rgba(10,10,10,0.08)'; ctx.fillRect(0, 0, c.width, c.height)
      ctx.font = `${fs}px monospace`
      for (let i = 0; i < cols; i++) {
        const y = drops[i] * fs; if (y < 0) { drops[i] += spd[i]; continue }
        ctx.fillStyle = 'rgba(180,255,180,0.9)'; ctx.fillText(MATRIX_CHARS[Math.floor(Math.random()*MATRIX_CHARS.length)], i*fs, y)
        ctx.fillStyle = 'rgba(40,180,60,0.35)';  ctx.fillText(MATRIX_CHARS[Math.floor(Math.random()*MATRIX_CHARS.length)], i*fs, y-fs)
        ctx.fillStyle = 'rgba(20,120,40,0.18)';  ctx.fillText(MATRIX_CHARS[Math.floor(Math.random()*MATRIX_CHARS.length)], i*fs, y-fs*2)
        drops[i] += spd[i]; if (y > c.height && Math.random() > 0.975) drops[i] = 0
      }
    }
    raf = requestAnimationFrame(draw)
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize) }
  }, [])
  return <canvas ref={cvs} style={{ position:'absolute', inset:0, width:'100%', height:'100%', zIndex:1, pointerEvents:'none', opacity:0.6 }} />
}

// ─── Slots & Bilder ───────────────────────────────────────────────────────────
const SLOT_POSITIONS = [
  { top: '8%',  left: '48%' },
  { top: '5%',  left: '72%' },
  { top: '30%', left: '55%' },
  { top: '28%', left: '80%' },
  { top: '55%', left: '48%' },
  { top: '58%', left: '74%' },
  { top: '15%', left: '62%' },
  { top: '45%', left: '64%' },
]
const IMG_SIZES = [
  { w: 260 }, { w: 300 }, { w: 220 }, { w: 340 },
  { w: 200 }, { w: 280 }, { w: 320 }, { w: 240 },
]
const SRCS = [
  '/ai-images/nikita-01.jpg', '/ai-images/nikita-04.jpg',
  '/ai-images/nikita-05.jpg', '/ai-images/nikita-06.jpg',
  '/ai-images/nikita-07.jpg', '/ai-images/nikita-08.jpg',
  '/ai-images/nikita-09.jpg', '/ai-images/nikita-10.jpg',
  '/ai-images/nikita-11.jpg', '/ai-images/nikita-12.jpg',
  '/ai-images/nikita-13.jpg', '/ai-images/nikita-14.jpg',
]

type SlotState = 'hidden' | 'appearing' | 'visible' | 'disappearing'
interface Slot {
  id: number; src: string
  pos: { top: string; left: string }
  w: number; state: SlotState; _posIdx: number
}

// ─── LoopingPixelImages ───────────────────────────────────────────────────────
function LoopingPixelImages() {
  const [slots, setSlots] = useState<Slot[]>([])
  const idRef = useRef(0)
  const activePositions = useRef(new Set<number>())

  const spawnImage = useCallback(() => {
    const free = SLOT_POSITIONS.map((_,i)=>i).filter(i=>!activePositions.current.has(i))
    if (free.length === 0) return
    const posIdx  = free[Math.floor(Math.random() * free.length)]
    const srcIdx  = Math.floor(Math.random() * SRCS.length)
    const sizeIdx = Math.floor(Math.random() * IMG_SIZES.length)
    activePositions.current.add(posIdx)
    const id = idRef.current++
    setSlots(prev => [...prev, {
      id, src: SRCS[srcIdx], pos: SLOT_POSITIONS[posIdx],
      w: IMG_SIZES[sizeIdx].w, state: 'appearing', _posIdx: posIdx,
    }])
    setTimeout(() => setSlots(prev => prev.map(s => s.id===id ? {...s,state:'visible'}      : s)), 2800)
    setTimeout(() => setSlots(prev => prev.map(s => s.id===id ? {...s,state:'disappearing'} : s)), 5200)
    setTimeout(() => { setSlots(prev => prev.filter(s=>s.id!==id)); activePositions.current.delete(posIdx) }, 6800)
  }, [])

  useEffect(() => {
    const t1=setTimeout(()=>spawnImage(),200)
    const t2=setTimeout(()=>spawnImage(),900)
    const t3=setTimeout(()=>spawnImage(),1800)
    const iv=setInterval(()=>spawnImage(),2000)
    return () => { clearTimeout(t1);clearTimeout(t2);clearTimeout(t3);clearInterval(iv) }
  }, [spawnImage])

  return <>{slots.map(slot=><PixelImageSlot key={slot.id} slot={slot}/>)}</>
}

// ─── PixelImageSlot ───────────────────────────────────────────────────────────
function PixelImageSlot({ slot }: { slot: Slot }) {
  const [hovered, setHovered] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const imgRef    = useRef<HTMLImageElement>(null)
  const rafRef    = useRef(0)
  const pixelRef  = useRef(48)
  const blurRef   = useRef(8)
  const stateRef  = useRef(slot.state)
  const hovRef    = useRef(false)

  useEffect(() => { stateRef.current = slot.state }, [slot.state])
  useEffect(() => { hovRef.current   = hovered     }, [hovered])

  useEffect(() => {
    pixelRef.current = 48
    blurRef.current  = 8

    const image = new Image()
    image.src = slot.src

    const canvas = canvasRef.current; if (!canvas) return
    const ctx = canvas.getContext('2d'); if (!ctx) return

    const onLoad = () => {
      const ratio = image.naturalHeight / image.naturalWidth
      canvas.width  = slot.w * 2
      canvas.height = Math.round(slot.w * 2 * ratio)
    }
    image.addEventListener('load', onLoad)
    if (image.complete) onLoad()

    const animate = () => {
      rafRef.current = requestAnimationFrame(animate)
      const s   = stateRef.current
      const hov = hovRef.current

      const targetPixel = (hov || s === 'visible' || s === 'appearing') ? 1 : 48
      const targetBlur  = (hov || s === 'appearing' || s === 'visible') ? 0 : 8

      pixelRef.current += (targetPixel - pixelRef.current) * 0.05
      blurRef.current  += (targetBlur  - blurRef.current)  * 0.06

      const ps = Math.max(1, Math.round(pixelRef.current))
      const bl = Math.max(0, blurRef.current)
      const isSharp = ps <= 1 && bl < 0.3

      if (imgRef.current)    imgRef.current.style.opacity    = isSharp ? '1' : '0'
      if (canvasRef.current) canvasRef.current.style.opacity = isSharp ? '0' : '1'

      if (isSharp || !image.complete) return

      const cw = canvas.width; const ch = canvas.height
      ctx.imageSmoothingEnabled = false
      ctx.clearRect(0, 0, cw, ch)

      if (ps <= 2) {
        ctx.filter = bl > 0.3 ? `blur(${bl.toFixed(1)}px)` : 'none'
        ctx.drawImage(image, 0, 0, cw, ch)
        ctx.filter = 'none'
      } else {
        const sw = Math.max(1, Math.floor(cw / ps))
        const sh = Math.max(1, Math.floor(ch / ps))
        ctx.drawImage(image, 0, 0, sw, sh)
        ctx.filter = bl > 0.3 ? `blur(${bl.toFixed(1)}px)` : 'none'
        ctx.drawImage(canvas, 0, 0, sw, sh, 0, 0, cw, ch)
        ctx.filter = 'none'
      }
    }

    rafRef.current = requestAnimationFrame(animate)
    return () => { cancelAnimationFrame(rafRef.current); image.removeEventListener('load', onLoad) }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slot.src, slot.w])

  const opacity = (slot.state === 'disappearing' && !hovered) ? 0 : 1

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: 'absolute',
        top:  slot.pos.top,
        left: slot.pos.left,
        width:  slot.w,
        height: 'auto',
        overflow: 'hidden',
        cursor: 'crosshair',
        zIndex: 2,
        transform: hovered ? 'scale(1.14)' : 'scale(1)',
        opacity,
        transition: 'transform 0.5s cubic-bezier(0.25,0.46,0.45,0.94), opacity 1.4s ease',
      }}
    >
      <canvas
        ref={canvasRef}
        style={{ width: '100%', height: 'auto', display: 'block', imageRendering: 'pixelated' }}
      />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        ref={imgRef}
        src={slot.src}
        alt=""
        style={{
          position: 'absolute', inset: 0,
          width: '100%', height: '100%',
          objectFit: 'fill',
          display: 'block',
          opacity: 0,
        }}
      />
    </div>
  )
}

// ─── Texte & Tags ─────────────────────────────────────────────────────────────
const T = {
  blocks: {
    de: [
      {
        label: 'Erfahrung',
        body: 'Ich teste stets die neuesten Tools wie Sora oder Kling und baue daraus eigene lokale Workflows. Mit ComfyUI, N8N und gezieltem LoRA-Training erschaffe ich Bild und Video. Auch Deepfakes nutze ich vielseitig für neue Dimensionen der digitalen Inszenierung. Technik und Ästhetik verschmelzen hier zu meiner eigenen Sprache.',
        tags: ['ComfyUI', 'LoRA-Training', 'N8N', 'Sora', 'Kling', 'Deepfakes', 'Python', 'Next.js', 'Automatisierung', 'Postproduktion'],
      },
      {
        label: 'Vision',
        body: 'KI ist für mich kein bloßes Werkzeug, sondern ein neues Medium der Inspiration. Als Pionier der ersten Stunde nutze ich die generative Kraft, um meine künstlerische Ausdruckskraft zu schärfen und Visionen präziser greifbar zu machen. Es ist die Suche nach der perfekten Symbiose aus Mensch und Maschine.',
        tags: [],
      },
    ],
    en: [
      {
        label: 'Experience',
        body: 'I constantly test the latest tools like Sora or Kling and build my own local workflows from them. With ComfyUI, N8N and targeted LoRA training I create image and video. I also use deepfakes in versatile ways for new dimensions of digital staging. Technology and aesthetics merge here into my own language.',
        tags: ['ComfyUI', 'LoRA Training', 'N8N', 'Sora', 'Kling', 'Deepfakes', 'Python', 'Next.js', 'Automation', 'Post-Production'],
      },
      {
        label: 'Vision',
        body: 'AI is not a mere tool for me, but a new medium of inspiration. As an early adopter I use generative power to sharpen my artistic expression and make visions more precisely tangible. It is the search for the perfect symbiosis of human and machine.',
        tags: [],
      },
    ],
  },
}
type Lang='de'|'en'

// ─── TagPill (weiß mit schwarzer Schrift + Hover) ────────────────────────────
function TagPill({ label }: { label: string }) {
  const [pressed, setPressed] = useState(false)
  const [hovered, setHovered] = useState(false)
  return (
    <span
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setPressed(false) }}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      style={{
        backgroundColor: '#0a0a0a', color: '#ffffff',
        border: '1px solid rgba(255,255,255,0.35)',
        fontSize: 9, letterSpacing: '0.12em',
        textTransform: 'uppercase', padding: '5px 10px',
        transform: pressed ? 'scale(0.92)' : hovered ? 'scale(0.97)' : 'scale(1)',
        transition: 'transform 0.12s ease',
        cursor: 'default', display: 'inline-block',
      }}
    >{label}</span>
  )
}

// ─── TextRow ──────────────────────────────────────────────────────────────────
function TextRow({ label, body, tags }: { label: string; body: string; tags: string[] }) {
  const labelRef = useRef<ReturnType<typeof setInterval>|null>(null)
  const [labelDisp, setLabelDisp] = useState(label)

  useEffect(() => { runScramble(label, setLabelDisp, labelRef) }, [label])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(8px,0.8vw,12px)' }}>
      {/* Label – Projektkarten-Größe */}
      <div
        onMouseEnter={() => runScramble(label, setLabelDisp, labelRef)}
        style={{
          fontSize: 'clamp(11px,2.2vw,24px)',
          fontWeight: 900,
          letterSpacing: '-0.5px',
          lineHeight: 1.1,
          textTransform: 'uppercase',
          color: '#ffffff',
          cursor: 'default',
          userSelect: 'none',
        }}
      >{labelDisp}</div>
      {/* Body */}
      <p style={{
        color: 'rgba(255,255,255,0.65)',
        fontSize: 'clamp(12px,1.2vw,15px)',
        lineHeight: 1.8, fontWeight: 400, margin: 0,
      }}>{body}</p>
      {/* Tags */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 'clamp(16px,2vw,28px)' }}>
        {tags.map((tag, i) => <TagPill key={i} label={tag} />)}
      </div>
    </div>
  )
}

// ─── AISection ────────────────────────────────────────────────────────────────
export function AISection() {
  const {language}=useLanguage(); const lang=language as Lang
  const outerRef = useRef<HTMLDivElement>(null)
  const [exitP, setExitP] = useState(0)

  useEffect(()=>{
    const fn = () => {
      const el = outerRef.current; if (!el) return
      const vh = window.innerHeight
      const scrolled = Math.max(0, -el.getBoundingClientRect().top)
      const exitStart = vh * 0.6
      const exitEnd   = vh * 1.6
      setExitP(Math.max(0, Math.min(1, (scrolled-exitStart)/(exitEnd-exitStart))))
    }
    window.addEventListener('scroll', fn, {passive:true}); fn()
    return () => window.removeEventListener('scroll', fn)
  }, [])

  const blurV  = exitP * 18
  const opacV  = 1 - exitP * 0.92
  const scaleV = 1 - exitP * 0.03

  return (
    <div ref={outerRef} style={{position:'relative', zIndex:3, height:'260vh'}}>
      <section id="ki" style={{
        position:'sticky', top:0,
        backgroundColor:'#0a0a0a',
        overflow:'hidden',
        height:'100vh',
        boxSizing:'border-box',
      }}>
        <CodeRain />
        <LoopingPixelImages />

        <div style={{
          position:'absolute',inset:0,zIndex:2,
          background:'linear-gradient(to right, rgba(10,10,10,0.97) 0%, rgba(10,10,10,0.82) 44%, rgba(10,10,10,0.15) 100%)',
          pointerEvents:'none',
        }}/>

        <div style={{
          position:'absolute', inset:0, zIndex:3,
          filter:    blurV > 0.1 ? `blur(${blurV}px)` : 'none',
          opacity:   opacV,
          transform: `scale(${scaleV})`,
          transformOrigin: 'center top',
          willChange: 'filter,opacity,transform',
          display:'flex', flexDirection:'column', justifyContent:'flex-start',
          paddingTop:'9vw',
          paddingBottom:'clamp(60px,8vw,100px)',
          paddingLeft:'9vw',
          paddingRight:'4vw',
          maxWidth:'52%',
          boxSizing:'border-box',
          gap: 'clamp(24px,2.5vw,36px)',
        }}>

          <StaticHeadingKI/>

          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 'clamp(24px,3vw,48px)',
          }}>
            {T.blocks[lang].map((block, i) => (
              <TextRow key={i} label={block.label} body={block.body} tags={block.tags} />
            ))}
          </div>

          <style>{`@keyframes fadeIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}`}</style>

        </div>

      </section>
    </div>
  )
}