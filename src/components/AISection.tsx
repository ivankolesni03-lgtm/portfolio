'use client'
import { useRef, useEffect, useState, useCallback } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'
import { useMobile } from '@/hooks/use-mobile'
import { useScroll } from '@/contexts/ScrollContext'
import { useScramble } from '@/hooks/use-scramble'

type Lang = 'de' | 'en'
type Port = { x: number; y: number }
type PortMap = Record<string, { out: Port; inp: Port }>
const FORMAT_OPTIONS = ['1:1','16:9','3:4'] as const
type OutputFormat = typeof FORMAT_OPTIONS[number]
const OUTPUT_MODE_OPTIONS = ['OUTPAINT','UPSCALE','VIDEO'] as const
type OutputMode = typeof OUTPUT_MODE_OPTIONS[number]

const BORNA = "'Borna','Helvetica Neue',Arial,sans-serif"
const MONO  = '"Courier New",monospace'
const NODE_Z_BASE = 5
const NODE_Z_CONTROL = 17
const NODE_Z_CONTROL_LOW = 16
const NODE_Z_CLICK = 18
const NODE_Z_EXPANDED = 19
const OUTPAINT_EXIT_MS = 300
const VIDEO_FAKE_LOAD_MS = 1300
const GENERATION_SIM_MS = 3000

// ─── Neon Heading ─────────────────────────────────────────────────────────────
function NeonHeading() {
  const { isMobile } = useMobile()
  const { language } = useLanguage()
  const [fl, setFl] = useState(1)
  const { disp: d1, scramble: s1 } = useScramble('ARTISTIC')
  const { disp: d2, scramble: s2 } = useScramble('INTELLIGENCE')
  const headingCopy = language === 'de'
    ? 'Ich sehe KI nicht als Ersatz für Gestaltung, sondern als kreatives Betriebssystem: ein Werkzeug, um Ideen schneller zu testen, Bildwelten präziser zu steuern und aus Experimenten markentaugliche Kommunikation zu formen.'
    : 'I see AI not as a replacement for design, but as a creative operating system: a way to test ideas faster, direct visual worlds more precisely and turn experiments into brand-ready communication.'
  const { disp: copyDisp, scramble: copyScramble } = useScramble(headingCopy)
  useEffect(() => {
    let t: ReturnType<typeof setTimeout>
    const go = () => { t = setTimeout(() => { const s=[0.1,1,0.05,0.9,0.2,1,0.7,1]; s.forEach((v,i)=>setTimeout(()=>setFl(v),i*55)); setTimeout(()=>{setFl(1);go()},s.length*55+400) }, 3000+Math.random()*8000) }
    go(); return () => clearTimeout(t)
  }, [])
  const glow = '0 0 7px #fff,0 0 18px #fff,0 0 40px rgba(255,255,255,0.5)'
  return (
    <div onMouseEnter={() => { s1(); s2(); copyScramble() }} style={{ cursor:'default', userSelect:'none', opacity:fl, transition:'opacity 0.04s' }}>
      <div style={{ fontSize: isMobile ? '10vw' : '8vw', fontWeight:900, lineHeight:0.88, letterSpacing:'-2px', textTransform:'uppercase', color:'#fff', textShadow:glow, fontFamily:BORNA }}>
        <div>{d1}</div><div style={{ display:'inline-block', transform:`scaleX(${isMobile ? 0.94 : 0.9})`, transformOrigin:'left center' }}>{d2}</div>
      </div>
      <p style={{ margin:isMobile?'34px 0 0':'8px 0 0', maxWidth:isMobile?'76vw':470, color:'rgba(255,255,255,0.8)', fontFamily:BORNA, fontSize:isMobile?13:15, lineHeight:1.45, fontWeight:500, letterSpacing:0, textShadow:'0 0 4px rgba(255,255,255,0.75),0 0 14px rgba(255,255,255,0.28),0 0 28px rgba(255,255,255,0.16),0 0 20px rgba(0,0,0,0.9)' }}>
        {copyDisp}
      </p>
    </div>
  )
}

// ─── Grid BG ──────────────────────────────────────────────────────────────────
function GridBg() {
  return (
    <div style={{ position:'absolute', inset:0, zIndex:1, pointerEvents:'none', overflow:'hidden' }}>
      <div style={{ position:'absolute', inset:0, backgroundImage:'linear-gradient(rgba(255,255,255,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.04) 1px,transparent 1px)', backgroundSize:'48px 48px' }}/>
      <div style={{ position:'absolute', left:0, right:0, height:1, background:'rgba(255,255,255,0.05)', animation:'scanln 12s linear infinite' }}/>
    </div>
  )
}

// ─── Crazy Terminal ───────────────────────────────────────────────────────────
const CRAZY = [
  {t:'c', c:'#!/usr/bin/env python3'},
  {t:'c', c:'import torch, diffusers, comfyui_core as cf'},
  {t:'c', c:'from lora_injector import LoRAStack, merge_weights'},
  {t:'m', c:'アイウエオ ЗАГРУЗКА カキクケコ СИСТЕМЫ BOOT'},
  {t:'r', c:'НЕЙРОСЕТЬ v4.2 :: инициализация матрицы весов [OK]'},
  {t:'c', c:'pipe = cf.StableDiffusionXLPipeline.from_pretrained('},
  {t:'c', c:'    "stabilityai/sdxl-base-1.0", torch_dtype=torch.float16'},
  {t:'c', c:').to("cuda")  # VRAM: 16.2 GB / 24.0 GB'},
  {t:'m', c:'マミムメモ LoRA_INJECT ヤユヨ rank=64 α=16 MERGED'},
  {t:'r', c:'ВНИМАНИЕ: аномальный градиент 0xDEAD → [ИГНОРИРУЮ]'},
  {t:'c', c:'lora = LoRAStack(rank=64, alpha=16, dropout=0.05)'},
  {t:'c', c:'lora.inject(pipe.unet, layers=["attn1","attn2","ff"])'},
  {t:'r', c:'BRAND_CONTEXT :: semantic layer active [OK]'},
  {t:'c', c:'prompt = "portrait, cinematic, 8k sharp, NIKITA_v2"'},
  {t:'c', c:'z = pipe.vae.encode(img).latent_dist.sample()*0.18215'},
  {t:'m', c:'ワヲン VISION_ENCODE アイウ CLIP→z[4,64,64] ラリルレロ'},
  {t:'c', c:'scheduler = DPMSolverMultistepScheduler(num_steps=28)'},
  {t:'c', c:'for t in scheduler.timesteps:  # step 0/28 → 28/28'},
  {t:'c', c:'    noise_pred = pipe.unet(z_t, t, enc_hidden)'},
  {t:'c', c:'    z_t = scheduler.step(noise_pred, t, z_t).prev'},
  {t:'r', c:'OUTPUT_MODE pass 27/28 :: final iteration [DONE]'},
  {t:'m', c:'サシスセソ UPSCALE タチツテト TILE[512×512] × 4 OUTPUT'},
  {t:'c', c:'image = pipe.vae.decode(z_t/0.18215).sample.clamp(-1,1)'},
  {t:'r', c:'✓ ГЕНЕРАЦИЯ ЗАВЕРШЕНА :: 4.97s — ПЕРЕДАЧА В PREVIEW'},
  {t:'c', c:'image.save(f"/preview/NIKITA_result.png", quality=100)'},
  {t:'m', c:'ナニヌネノ SYSTEM_NOMINAL ハヒフ ALL_CLEAR [OK]'},
]
function CrazyTerminal({ phase, isActive, lang }: { phase: number; isActive: boolean; lang: Lang }) {
  const [lines, setLines] = useState(() => CRAZY)
  const ref = useRef<HTMLDivElement>(null)
  const shown = useRef(-1)
  useEffect(() => {
    if (!isActive) { shown.current = -1; return }
    const idx = Math.min(Math.floor(phase * CRAZY.length), CRAZY.length - 1)
    if (idx > shown.current) {
      shown.current = idx
      const frame = requestAnimationFrame(() => setLines(p => [...p.slice(-12), CRAZY[idx]]))
      return () => cancelAnimationFrame(frame)
    }
  }, [isActive, phase])
  const col = (t: string) => t==='m' ? 'rgba(57,255,20,0.75)' : t==='r' ? '#ff9900' : 'rgba(100,200,255,0.9)'
  return (
    <div style={{ background:'#0d0d0d', fontFamily:MONO, fontSize:10, height:'100%', display:'flex', flexDirection:'column', overflow:'hidden' }}>
      <div ref={ref} style={{ padding:'7px 10px', flex:1, overflow:'hidden', display:'flex', flexDirection:'column', justifyContent:'flex-end', gap:2 }}>
        {lines.map((l,i) => <div key={i} style={{ color:col(l.t), whiteSpace:'pre-wrap', wordBreak:'break-all', lineHeight:1.4 }}>{l.c}</div>)}
        {!isActive && <div style={{ color:'rgba(57,255,20,0.2)', animation:'aiBlink 1.2s infinite' }}>█</div>}
      </div>
    </div>
  )
}

// ─── Progress Terminal ────────────────────────────────────────────────────────
const STAGES = [
  {label:'PROMPT DESIGN', start:0,    end:0.14},
  {label:'BRAND CONTEXT', start:0.14, end:0.28},
  {label:'VISUAL SYSTEM', start:0.28, end:0.42},
  {label:'FORMAT',        start:0.42, end:0.56},
  {label:'MODES',         start:0.56, end:0.70},
  {label:'OUTPUT REVIEW', start:0.70, end:0.85},
  {label:'→ CASE OUTPUT', start:0.85, end:1.00},
]
function ProgressTerm({ phase, isActive }: { phase: number; isActive: boolean }) {
  const pct = Math.round(phase * 100)
  const bw  = Math.round(phase * 18)
  const bar = '█'.repeat(bw) + '░'.repeat(18 - bw)
  return (
    <div style={{ background:'#0d0d0d', fontFamily:MONO, fontSize:10, height:'100%', display:'flex', alignItems:'center' }}>
      <div style={{ padding:'8px 10px', width:'100%' }}>
        <div style={{ color:isActive?'#39ff14':'rgba(57,255,20,0.38)', fontSize:12, background:'#000', padding:'4px 7px', whiteSpace:'nowrap' }}>[{bar}] {pct}%</div>
      </div>
    </div>
  )
}

// ─── Images – preloaded at module level ──────────────────────────────────────
const AI_SRCS = [
  '/ai-images/ai-01.jpg',
  '/ai-images/ai-02.jpg',
  '/ai-images/ai-03.jpg',
  '/ai-images/ai-04.jpg',
  '/ai-images/ai-05.jpg',
 
]
const INITIAL_AI_IMAGE_INDEX = 0

const AI_IMAGES: Array<HTMLImageElement | undefined> = []

function getAiImage(index: number) {
  const existing = AI_IMAGES[index]
  if (existing) return existing
  const img = new window.Image()
  img.decoding = 'async'
  img.src = AI_SRCS[index]
  AI_IMAGES[index] = img
  return img
}

function ensureLoaded(img: HTMLImageElement, src: string): Promise<HTMLImageElement> {
  if (img.complete && img.naturalWidth > 0) return Promise.resolve(img)
  return new Promise(resolve => {
    const done = () => resolve(img)
    img.addEventListener('load', done, { once: true })
    img.addEventListener('error', done, { once: true })
    if (!img.src || img.src === window.location.href) img.src = src
  })
}

function drawToCanvas(cv: HTMLCanvasElement, img: HTMLImageElement, opacity: number, px: number) {
  const w = cv.width, h = cv.height
  if (!w || !h || !img.naturalWidth) return
  const ctx = cv.getContext('2d'); if (!ctx) return
  ctx.fillStyle = '#000'; ctx.fillRect(0, 0, w, h)
  if (opacity <= 0) return
  const ia = img.naturalWidth / img.naturalHeight, ca = w / h
  let dw = w, dh = h, dx = 0, dy = 0
  if (ia > ca) { dw = h * ia; dx = (w - dw) / 2 } else { dh = w / ia; dy = (h - dh) / 2 }
  const p = Math.max(1, Math.round(px))
  ctx.globalAlpha = opacity
  if (p <= 1.5) { ctx.imageSmoothingEnabled = true; ctx.drawImage(img, dx, dy, dw, dh) }
  else {
    const pw = Math.max(1, Math.floor(dw/p)), ph = Math.max(1, Math.floor(dh/p))
    const tmp = document.createElement('canvas'); tmp.width = pw; tmp.height = ph
    const tc = tmp.getContext('2d')!; tc.imageSmoothingEnabled = true; tc.drawImage(img, 0, 0, pw, ph)
    ctx.imageSmoothingEnabled = false; ctx.drawImage(tmp, 0, 0, pw, ph, dx, dy, dw, dh)
  }
  ctx.globalAlpha = 1
}

// ─── Cables ───────────────────────────────────────────────────────────────────
const TOPO = [
  {from:'generate',  to:'prompt',   seg:0},
  {from:'prompt',    to:'erfahrung',seg:1},
  {from:'prompt',    to:'vision',   seg:1},
  {from:'erfahrung', to:'upscale',  seg:2},
  {from:'vision',    to:'upscale',  seg:2},
  {from:'modes',     to:'upscale',  seg:3, optionalMode:true},
  {from:'upscale',   to:'terminal', seg:4},
  {from:'terminal',  to:'progress', seg:5},
  {from:'progress',  to:'preview',  seg:6},
]
const SEG_N = 7

function CablesLayer({ ports, phase, isActive, exitP, modeSelected }: { ports: PortMap; phase: number; isActive: boolean; exitP: number; modeSelected: boolean }) {
  const cableOpacity = Math.max(0, 1 - exitP * 2)
  return (
    <svg style={{ position:'absolute', inset:0, width:'100%', height:'100%', zIndex:4, pointerEvents:'none', overflow:'visible', opacity:cableOpacity, filter:exitP>0.02?`blur(${exitP*18}px)`:'none', transition:'none', willChange:'opacity' }}>
      {TOPO.map(({ from, to, seg, optionalMode }, i) => {
        const a = ports[from], b = ports[to]; if (!a || !b) return null
        const f = a.out, t2 = b.inp
        const ss = seg / SEG_N, se = (seg+1) / SEG_N
        const lit = isActive && phase >= ss && (!optionalMode || modeSelected)
        const pt  = !isActive ? 0 : phase >= se ? 1 : phase >= ss ? (phase-ss)/(se-ss) : 0
        const dx  = t2.x - f.x
        const c1x = f.x  + Math.max(60, Math.abs(dx)*0.45)
        const c2x = t2.x - Math.max(60, Math.abs(dx)*0.45)
        const d   = `M${f.x},${f.y} C${c1x},${f.y} ${c2x},${t2.y} ${t2.x},${t2.y}`
        const px_ = f.x*(1-pt)**3 + 3*c1x*(1-pt)**2*pt + 3*c2x*(1-pt)*pt**2 + t2.x*pt**3
        const py_ = f.y*(1-pt)**3 + 3*f.y*(1-pt)**2*pt + 3*t2.y*(1-pt)*pt**2 + t2.y*pt**3
        const stroke = lit ? '#39ff14' : 'rgba(255,255,255,0.38)'
        return (
          <g key={i}>
            <path d={d} fill="none" stroke={stroke} strokeWidth={2.5} strokeLinecap="round"/>
            {lit && pt > 0.02 && pt < 0.98 && <>
              <circle cx={px_} cy={py_} r={5} fill="white" opacity={0.95}/>
              <circle cx={px_} cy={py_} r={10} fill="#39ff14" opacity={0.3}/>
            </>}
            <circle cx={f.x}  cy={f.y}  r={4} fill={stroke}/>
            <circle cx={t2.x} cy={t2.y} r={4} fill={stroke}/>
          </g>
        )
      })}
    </svg>
  )
}

// ─── Draggable Window ─────────────────────────────────────────────────────────
function Win({ id, title, width, initPos, onPortChange, onFocus, zIndex, lit=false, minH, freezePortY=false, offset={x:0,y:0}, animateLayout=false, children }: {
  id: string; title: string; width: number
  initPos: {x: number; y: number}
  onPortChange: (id: string, out: Port, inp: Port) => void
  onFocus: (id: string) => void
  zIndex: number; lit?: boolean; minH?: number; freezePortY?: boolean
  offset?: {x: number; y: number}; animateLayout?: boolean
  children: React.ReactNode
}) {
  const [pos, setPos] = useState(initPos)
  const domRef   = useRef<HTMLDivElement>(null)
  const dOff     = useRef({x:0, y:0})
  const dragging = useRef(false)
  const magRef = useRef({ x:0, y:0 })
  const targetMagRef = useRef({ x:0, y:0 })
  const magDirRef = useRef({ x:1, y:0 })
  const pointerRef = useRef<{ x: number; y: number } | null>(null)
  const magRafRef = useRef(0)
  const pointerRafRef = useRef(0)
  const magResetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const needsFinalPortEmit = useRef(false)
  const lastPortMagRef = useRef({ x:0, y:0 })
  const frozenPortYRef = useRef<number | null>(null)
  const { disp, scramble } = useScramble(title)

  const emit = useCallback(() => {
    const el = domRef.current; if (!el) return
    const sec = el.closest('section'); if (!sec) return
    const sr = sec.getBoundingClientRect(), er = el.getBoundingClientRect()
    const lx = er.left-sr.left, ty = er.top-sr.top, h = er.height
    if (freezePortY && frozenPortYRef.current === null) frozenPortYRef.current = h / 2
    const portY = freezePortY ? frozenPortYRef.current ?? h / 2 : h / 2
    onPortChange(id, {x:lx+er.width, y:ty+portY}, {x:lx, y:ty+portY})
  }, [freezePortY, id, onPortChange])

  useEffect(() => { emit() }, [pos, offset.x, offset.y, emit])
  useEffect(() => {
    const t1 = setTimeout(emit, 60)
    const t2 = setTimeout(emit, 200)
    const t3 = setTimeout(emit, 500)
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3) }
  }, [])

  useEffect(() => {
    const el = domRef.current
    if (!el || typeof ResizeObserver === 'undefined') return
    const observer = new ResizeObserver(() => emit())
    observer.observe(el)
    return () => observer.disconnect()
  }, [emit])

  const onMD = useCallback((e: React.MouseEvent) => {
    e.preventDefault(); onFocus(id)
    const el = domRef.current
    if (el) {
      if (magResetTimerRef.current) {
        clearTimeout(magResetTimerRef.current)
        magResetTimerRef.current = null
      }
      needsFinalPortEmit.current = false
      magRef.current = { x:0, y:0 }
      targetMagRef.current = { x:0, y:0 }
      lastPortMagRef.current = { x:0, y:0 }
      magDirRef.current = { x:1, y:0 }
      el.style.setProperty('--ai-mx', '0px')
      el.style.setProperty('--ai-my', '0px')
      emit()
    }
    dOff.current = {x: e.clientX-(pos.x+offset.x), y: e.clientY-(pos.y+offset.y)}; dragging.current = true
  }, [pos, offset.x, offset.y, id, onFocus])

  const finishMagReset = useCallback(() => {
    if (!needsFinalPortEmit.current) return
    needsFinalPortEmit.current = false
    if (magResetTimerRef.current) {
      clearTimeout(magResetTimerRef.current)
      magResetTimerRef.current = null
    }
    lastPortMagRef.current = { x:0, y:0 }
    emit()
  }, [emit])

  const emitMovingPorts = useCallback((next: { x: number; y: number }) => {
    const prev = lastPortMagRef.current
    if (Math.abs(next.x - prev.x) < 0.55 && Math.abs(next.y - prev.y) < 0.55) return
    lastPortMagRef.current = next
    emit()
  }, [emit])

  const animateMag = useCallback(() => {
    magRafRef.current = 0
    const el = domRef.current; if (!el) return
    const current = magRef.current
    const target = targetMagRef.current
    const next = {
      x: current.x + (target.x - current.x) * 0.16,
      y: current.y + (target.y - current.y) * 0.16,
    }
    if (Math.abs(next.x - target.x) < 0.02) next.x = target.x
    if (Math.abs(next.y - target.y) < 0.02) next.y = target.y
    magRef.current = next
    el.style.setProperty('--ai-mx', `${next.x.toFixed(2)}px`)
    el.style.setProperty('--ai-my', `${next.y.toFixed(2)}px`)
    emitMovingPorts(next)
    const settled = Math.abs(next.x - target.x) < 0.03 && Math.abs(next.y - target.y) < 0.03
    if (!settled) {
      magRafRef.current = requestAnimationFrame(animateMag)
      return
    }
    if (Math.abs(target.x) < 0.01 && Math.abs(target.y) < 0.01) finishMagReset()
  }, [emitMovingPorts, finishMagReset])

  const startMagAnimation = useCallback(() => {
    if (!magRafRef.current) magRafRef.current = requestAnimationFrame(animateMag)
  }, [animateMag])

  const updateMagFromPointer = useCallback((clientX: number, clientY: number) => {
    pointerRef.current = { x: clientX, y: clientY }
    if (pointerRafRef.current) return
    pointerRafRef.current = requestAnimationFrame(() => {
      pointerRafRef.current = 0
      if (dragging.current) return
      const pointer = pointerRef.current
      const el = domRef.current; if (!el || !pointer) return
      const r = el.getBoundingClientRect()
      const cx = r.left - magRef.current.x + r.width / 2
      const cy = r.top - magRef.current.y + r.height / 2
      const dx = pointer.x - cx, dy = pointer.y - cy
      const dist = Math.hypot(dx, dy)
      const radius = 235
      const influence = Math.max(0, 1 - dist / radius)
      const maxPull = 11
      const centerDeadzone = 8
      if (dist > centerDeadzone) {
        magDirRef.current = { x: dx / dist, y: dy / dist }
      }
      const dir = magDirRef.current
      const pull = maxPull * Math.pow(influence, 1.45)
      const next = influence <= 0 ? { x:0, y:0 } : { x: dir.x * pull, y: dir.y * pull }
      const wasMagnetized = Math.abs(targetMagRef.current.x) > 0.01 || Math.abs(targetMagRef.current.y) > 0.01 || Math.abs(magRef.current.x) > 0.01 || Math.abs(magRef.current.y) > 0.01
      const nextIsResting = Math.abs(next.x) <= 0.01 && Math.abs(next.y) <= 0.01
      targetMagRef.current = next
      if (magResetTimerRef.current) {
        clearTimeout(magResetTimerRef.current)
        magResetTimerRef.current = null
      }
      if (nextIsResting && wasMagnetized) {
        needsFinalPortEmit.current = true
      } else if (!nextIsResting) {
        needsFinalPortEmit.current = false
      }
      startMagAnimation()
    })
  }, [startMagAnimation])

  const resetMag = useCallback(() => {
    if (dragging.current) return
    const el = domRef.current; if (!el) return
    if (magResetTimerRef.current) {
      clearTimeout(magResetTimerRef.current)
      magResetTimerRef.current = null
    }
    targetMagRef.current = { x:0, y:0 }
    needsFinalPortEmit.current = true
    startMagAnimation()
    magResetTimerRef.current = setTimeout(() => {
      if (!needsFinalPortEmit.current) return
      needsFinalPortEmit.current = false
      magResetTimerRef.current = null
      emit()
    }, 360)
  }, [emit, startMagAnimation])

  useEffect(() => {
    const move = (e: MouseEvent) => { if (!dragging.current) return; setPos({x:e.clientX-dOff.current.x-offset.x, y:e.clientY-dOff.current.y-offset.y}) }
    const up   = () => {
      const wasDragging = dragging.current
      dragging.current = false
      if (wasDragging) emit()
    }
    window.addEventListener('mousemove', move); window.addEventListener('mouseup', up)
    return () => { window.removeEventListener('mousemove', move); window.removeEventListener('mouseup', up) }
  }, [emit, offset.x, offset.y])

  useEffect(() => {
    const move = (e: MouseEvent) => updateMagFromPointer(e.clientX, e.clientY)
    window.addEventListener('mousemove', move, { passive: true })
    window.addEventListener('blur', resetMag)
    document.addEventListener('mouseleave', resetMag)
    return () => {
      window.removeEventListener('mousemove', move)
      window.removeEventListener('blur', resetMag)
      document.removeEventListener('mouseleave', resetMag)
    }
  }, [updateMagFromPointer, resetMag])

  useEffect(() => {
    return () => {
      if (pointerRafRef.current) cancelAnimationFrame(pointerRafRef.current)
      if (magRafRef.current) cancelAnimationFrame(magRafRef.current)
      if (magResetTimerRef.current) clearTimeout(magResetTimerRef.current)
    }
  }, [])

  const outline = lit ? '1px solid #39ff14' : 'none'
  const shadow  = lit ? '0 0 14px rgba(57,255,20,0.35)' : 'none'

  return (
    <div ref={domRef} data-ai-node={id} onMouseDown={() => onFocus(id)} style={{ position:'absolute', left:pos.x+offset.x, top:pos.y+offset.y, width, minHeight:minH, background:'#e8e8e8', border:'1px solid rgba(255,255,255,0.25)', outline, boxShadow:shadow, zIndex, display:'flex', flexDirection:'column', transform:'translate3d(var(--ai-mx,0px),var(--ai-my,0px),0)', transition:animateLayout?'left 0.28s ease,top 0.28s ease,width 0.28s ease,outline 0.3s,box-shadow 0.3s':'outline 0.3s,box-shadow 0.3s', willChange:'transform' }}>
      <div onMouseDown={onMD} style={{ display:'flex', alignItems:'center', gap:6, padding:'7px 12px', background:'rgba(0,0,0,0.06)', borderBottom:'1px solid rgba(0,0,0,0.12)', cursor:'grab', flexShrink:0, userSelect:'none' }}>
        <div style={{width:12, height:12, borderRadius:'50%', background:'#27ca40', flexShrink:0}}/>
        <div style={{width:12, height:12, borderRadius:'50%', background:'#ffbd2e', flexShrink:0}}/>
        <div style={{width:12, height:12, borderRadius:'50%', background:'#ff5f56', flexShrink:0}}/>
        <span onMouseEnter={scramble} style={{ marginLeft:6, color:'#111', fontSize:11, letterSpacing:'0.08em', textTransform:'uppercase', fontFamily:BORNA, flex:1, cursor:'grab', fontWeight:600, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{disp}</span>
      </div>
      <div style={{ flex:1 }}>{children}</div>
    </div>
  )
}

// ─── ExpandCard ───────────────────────────────────────────────────────────────
function ExpandCard({ text, tags, hint, onOpenChange }: { text: string; tags?: string[]; hint: string; onOpenChange?: (open: boolean) => void }) {
  const [open, setOpen] = useState(false)
  const tS: React.CSSProperties = { background:'rgba(0,0,0,0.08)', border:'1px solid rgba(0,0,0,0.2)', color:'#000', fontSize:9, letterSpacing:'0.08em', textTransform:'uppercase', padding:'4px 9px', fontFamily:BORNA, display:'inline-block', fontWeight:600 }

  const setHoverOpen = useCallback((nextOpen: boolean) => {
    setOpen(nextOpen)
    onOpenChange?.(nextOpen)
  }, [onOpenChange])

  return (
    <div
      onMouseEnter={() => setHoverOpen(true)}
      onMouseLeave={() => setHoverOpen(false)}
      style={{ padding:'11px 12px', fontFamily:BORNA, fontSize:11, color:'#111', lineHeight:1.6, fontWeight:500, cursor:'none', overflow:'hidden' }}
    >
      <div style={{ display:'grid', gap:5 }}>
        <span style={{ opacity:open?1:0.82, fontSize:12, color:'#111', fontWeight:700, lineHeight:1.25, transition:'opacity 0.22s ease' }}>{hint}</span>
      </div>
      <div style={{ maxHeight:open?260:0, opacity:open?1:0, transform:open?'translateY(0)':'translateY(-6px)', overflow:'hidden', transition:'max-height 0.36s cubic-bezier(0.22,1,0.36,1), opacity 0.2s ease, transform 0.28s ease' }}>
        <p style={{ margin:'9px 0 12px' }}>{text}</p>
        {tags && <div style={{ display:'flex', flexWrap:'wrap', gap:5 }}>{tags.map((t,i) => <span key={i} style={tS}>{t}</span>)}</div>}
      </div>
    </div>
  )
}

// ─── AISection ────────────────────────────────────────────────────────────────
export function AISection() {
  const { language } = useLanguage()
  const lang = language as Lang

  const outerRef   = useRef<HTMLDivElement>(null)
  const sectionRef = useRef<HTMLElement>(null)
  const canvasRef  = useRef<HTMLCanvasElement>(null)
  const upscaleCanvasRef = useRef<HTMLCanvasElement>(null)
  const previewRef = useRef<HTMLDivElement>(null)
  const rafRef     = useRef(0)
  const upscaleDragCleanupRef = useRef<(() => void) | null>(null)
  const upscaleIntroRafRef = useRef(0)
  const outpaintGuideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const videoFakeLoadTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const autoGenerateTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const curImgIdx  = useRef(INITIAL_AI_IMAGE_INDEX)
  const initialImageDrawnRef = useRef(false)
  const shuffledQueue = useRef<number[]>([])

  const [mounted,  setMounted]  = useState(false)
  const [exitP,    setExitP]    = useState(0)
  const [isActive, setIsActive] = useState(false)
  const [nearViewport, setNearViewport] = useState(false)
  const [phase,    setPhase]    = useState(0)
  const [ports,    setPorts]    = useState<PortMap>({})
  const [expandedNode, setExpandedNode] = useState<string | null>(null)
  const [outputFormat, setOutputFormat] = useState<OutputFormat>('1:1')
  const [pendingOutputFormat, setPendingOutputFormat] = useState<OutputFormat>('1:1')
  const [outputModes, setOutputModes] = useState<OutputMode[]>([])
  const [hoveredControl, setHoveredControl] = useState<string | null>(null)
  const [upscaleSplit, setUpscaleSplit] = useState(0.5)
  const [upscaleHandleHovered, setUpscaleHandleHovered] = useState(false)
  const [upscaleDragging, setUpscaleDragging] = useState(false)
  const [upscaleIntroActive, setUpscaleIntroActive] = useState(false)
  const [outpaintGuideVisible, setOutpaintGuideVisible] = useState(false)
  const [videoReady, setVideoReady] = useState(false)
  // VW/VH measured from the actual section element – consistent across environments
  const [dims, setDims] = useState<{w:number,h:number}|null>(null)
  const [zOrders, setZOrders] = useState<Record<string,number>>(
    Object.fromEntries(['generate','prompt','erfahrung','vision','upscale','modes','terminal','progress','preview'].map((id,i) => [id, NODE_Z_BASE+i]))
  )
  const { isMobile, width, visualHeight } = useMobile()
  const { scrollY, vh: scrollVh } = useScroll()
  const isOutpaintMode = outputModes.includes('OUTPAINT')
  const isUpscaleMode = outputModes.includes('UPSCALE')
  const isVideoMode = outputModes.includes('VIDEO')
  const outputAspect = outputFormat === '16:9' ? '16/9' : outputFormat === '3:4' ? '3/4' : '1/1'
  const outputAspectValue = outputFormat === '16:9' ? 16/9 : outputFormat === '3:4' ? 3/4 : 1
  const outputDefaultWidth = 470
  const outputBaseWidth = outputFormat === '16:9' ? 620 : outputDefaultWidth
  const outputFullImageWidth = outputBaseWidth + 80
  const outputShowsFullImage = isOutpaintMode
  const outputWinWidth = outputShowsFullImage ? outputFullImageWidth : outputBaseWidth
  const outputRevealDelta = outputWinWidth - outputBaseWidth
  const outputFormatOffset = {
    x: outputFormat === '16:9' ? -(outputBaseWidth - outputDefaultWidth) : 0,
    y: outputFormat === '3:4' ? -(outputBaseWidth / outputAspectValue - outputDefaultWidth) : 0,
  }
  const outputWindowOffset = {
    x: outputFormatOffset.x - outputRevealDelta / 2,
    y: outputFormatOffset.y - (outputRevealDelta / outputAspectValue) / 2,
  }
  const outputShellHeight = (outputWinWidth - 2) / outputAspectValue
  const previewFrameWidth = `${outputFullImageWidth}px`
  const outputOriginalFrameWidth = outputBaseWidth - 2
  const outpaintGuideInsetX = (outputFullImageWidth - outputOriginalFrameWidth) / 2
  const outpaintGuideInsetY = outpaintGuideInsetX / outputAspectValue
  const outpaintGuideInset = `${outpaintGuideInsetY}px ${outpaintGuideInsetX}px`
  const outputPixelSize = isUpscaleMode ? 0 : 3
  const upscalePixelReveal = Math.max(0.001, 1 - upscaleSplit)

  const drawUpscalePixelCanvas = useCallback(() => {
    const cv = upscaleCanvasRef.current, pv = previewRef.current
    if (!cv || !pv || !pv.offsetWidth) return
    cv.width = pv.offsetWidth
    cv.height = pv.offsetHeight
    const img = getAiImage(curImgIdx.current)
    if (img.complete && img.naturalWidth > 0) {
      drawToCanvas(cv, img, 1, 3)
      return
    }
    ensureLoaded(img, AI_SRCS[curImgIdx.current]).then(loaded => {
      const c2 = upscaleCanvasRef.current, p2 = previewRef.current
      if (c2 && p2 && p2.offsetWidth) {
        c2.width = p2.offsetWidth
        c2.height = p2.offsetHeight
        drawToCanvas(c2, loaded, 1, 3)
      }
    })
  }, [])

  const setUpscaleSplitFromClientX = useCallback((clientX: number) => {
    const el = previewRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    setUpscaleSplit(Math.max(0, Math.min(1, (clientX - rect.left) / rect.width)))
  }, [])

  const cancelUpscaleIntro = useCallback(() => {
    if (upscaleIntroRafRef.current) {
      cancelAnimationFrame(upscaleIntroRafRef.current)
      upscaleIntroRafRef.current = 0
    }
    setUpscaleIntroActive(false)
  }, [])

  const endUpscaleDrag = useCallback(() => {
    if (upscaleDragCleanupRef.current) {
      upscaleDragCleanupRef.current()
      upscaleDragCleanupRef.current = null
    }
    setUpscaleDragging(false)
    setUpscaleHandleHovered(false)
  }, [])

  const beginUpscaleDrag = useCallback((clientX: number) => {
    cancelUpscaleIntro()
    if (upscaleDragCleanupRef.current) upscaleDragCleanupRef.current()
    setUpscaleDragging(true)
    setUpscaleHandleHovered(true)
    setUpscaleSplitFromClientX(clientX)
    const move = (event: PointerEvent) => setUpscaleSplitFromClientX(event.clientX)
    const mouseMove = (event: MouseEvent) => setUpscaleSplitFromClientX(event.clientX)
    const end = () => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', end)
      window.removeEventListener('pointercancel', end)
      window.removeEventListener('mousemove', mouseMove)
      window.removeEventListener('mouseup', end)
      upscaleDragCleanupRef.current = null
      setUpscaleDragging(false)
      setUpscaleHandleHovered(false)
    }
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', end)
    window.addEventListener('pointercancel', end)
    window.addEventListener('mousemove', mouseMove)
    window.addEventListener('mouseup', end)
    upscaleDragCleanupRef.current = () => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', end)
      window.removeEventListener('pointercancel', end)
      window.removeEventListener('mousemove', mouseMove)
      window.removeEventListener('mouseup', end)
    }
  }, [cancelUpscaleIntro, setUpscaleSplitFromClientX])

  useEffect(() => () => {
    if (upscaleDragCleanupRef.current) upscaleDragCleanupRef.current()
    if (upscaleIntroRafRef.current) cancelAnimationFrame(upscaleIntroRafRef.current)
    if (outpaintGuideTimerRef.current) clearTimeout(outpaintGuideTimerRef.current)
    if (videoFakeLoadTimerRef.current) clearTimeout(videoFakeLoadTimerRef.current)
  }, [])

  useEffect(() => {
    if (outpaintGuideTimerRef.current) {
      clearTimeout(outpaintGuideTimerRef.current)
      outpaintGuideTimerRef.current = null
    }

    if (isOutpaintMode) {
      setOutpaintGuideVisible(true)
      return
    }

    if (!outpaintGuideVisible) return

    outpaintGuideTimerRef.current = setTimeout(() => {
      outpaintGuideTimerRef.current = null
      setOutpaintGuideVisible(false)
    }, OUTPAINT_EXIT_MS)

    return () => {
      if (outpaintGuideTimerRef.current) {
        clearTimeout(outpaintGuideTimerRef.current)
        outpaintGuideTimerRef.current = null
      }
    }
  }, [isOutpaintMode, outpaintGuideVisible])

  useEffect(() => {
    if (!isUpscaleMode) {
      cancelUpscaleIntro()
      return
    }

    if (upscaleIntroRafRef.current) cancelAnimationFrame(upscaleIntroRafRef.current)
    const start = 0.035
    const end = 0.5
    const duration = 780
    let startedAt: number | null = null

    setUpscaleSplit(start)
    setUpscaleIntroActive(true)

    const tick = (now: number) => {
      if (startedAt === null) startedAt = now
      const t = Math.min(1, (now - startedAt) / duration)
      const eased = Math.log1p(9 * t) / Math.log1p(9)
      setUpscaleSplit(start + (end - start) * eased)

      if (t < 1) {
        upscaleIntroRafRef.current = requestAnimationFrame(tick)
        return
      }

      upscaleIntroRafRef.current = 0
      setUpscaleSplit(end)
      setUpscaleIntroActive(false)
    }

    upscaleIntroRafRef.current = requestAnimationFrame(tick)
    return () => {
      if (upscaleIntroRafRef.current) {
        cancelAnimationFrame(upscaleIntroRafRef.current)
        upscaleIntroRafRef.current = 0
      }
    }
  }, [cancelUpscaleIntro, isUpscaleMode])

  useEffect(() => {
    if (videoFakeLoadTimerRef.current) {
      clearTimeout(videoFakeLoadTimerRef.current)
      videoFakeLoadTimerRef.current = null
    }

    if (!isVideoMode) {
      setVideoReady(false)
      return
    }

    setVideoReady(false)
    videoFakeLoadTimerRef.current = setTimeout(() => {
      videoFakeLoadTimerRef.current = null
      setVideoReady(true)
    }, VIDEO_FAKE_LOAD_MS)

    return () => {
      if (videoFakeLoadTimerRef.current) {
        clearTimeout(videoFakeLoadTimerRef.current)
        videoFakeLoadTimerRef.current = null
      }
    }
  }, [isVideoMode])

  useEffect(() => {
    const initFrame = requestAnimationFrame(() => {
      setMounted(true)
    })

    const measure = () => {
      const sec = sectionRef.current
      if (sec) {
        setDims({ w: sec.offsetWidth, h: sec.offsetHeight })
      }
    }

    // Measure after paint so section has its final size
    requestAnimationFrame(() => { requestAnimationFrame(measure) })
    window.addEventListener('resize', measure)

    return () => {
      cancelAnimationFrame(initFrame)
      window.removeEventListener('resize', measure)
    }
  }, [])

  useEffect(() => {
    const el = outerRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => setNearViewport(entry.isIntersecting),
      { rootMargin: '900px 0px', threshold: 0 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [mounted])

  useEffect(() => {
    if (!mounted) return
    if (initialImageDrawnRef.current) return
    initialImageDrawnRef.current = true
    curImgIdx.current = INITIAL_AI_IMAGE_INDEX
    shuffledQueue.current = []

    let cancelled = false
    let frame = 0
    const timers: ReturnType<typeof setTimeout>[] = []

    const drawInitialImage = () => {
      if (cancelled) return
      const cv = canvasRef.current, pv = previewRef.current
      if (!cv || !pv || !pv.offsetWidth) return
      cv.width = pv.offsetWidth
      cv.height = pv.offsetHeight
      const img = getAiImage(INITIAL_AI_IMAGE_INDEX)
      if (img.complete && img.naturalWidth > 0) {
        drawToCanvas(cv, img, 1, 3)
        return
      }
      ensureLoaded(img, AI_SRCS[INITIAL_AI_IMAGE_INDEX]).then(loaded => {
        if (cancelled) return
        const c2 = canvasRef.current, p2 = previewRef.current
        if (c2 && p2 && p2.offsetWidth) {
          c2.width = p2.offsetWidth
          c2.height = p2.offsetHeight
          drawToCanvas(c2, loaded, 1, 3)
        }
      })
    }

    frame = requestAnimationFrame(() => requestAnimationFrame(drawInitialImage))
    timers.push(setTimeout(drawInitialImage, 120), setTimeout(drawInitialImage, 500))

    return () => {
      cancelled = true
      cancelAnimationFrame(frame)
      timers.forEach(clearTimeout)
    }
  }, [mounted])

  useEffect(() => {
    if (!nearViewport) return
    const timers = AI_SRCS.map((_, index) => window.setTimeout(() => {
      getAiImage(index)
    }, index < 2 ? 0 : 1000 + index * 220))
    return () => timers.forEach(window.clearTimeout)
  }, [nearViewport])

  useEffect(() => {
    if (!mounted || !nearViewport) return
    const tryDraw = () => {
      const cv = canvasRef.current, pv = previewRef.current
      if (!cv || !pv || !pv.offsetWidth) return
      cv.width = pv.offsetWidth; cv.height = pv.offsetHeight
      const img = getAiImage(curImgIdx.current)
      if (img.complete && img.naturalWidth > 0) {
        drawToCanvas(cv, img, 1, outputPixelSize)
      } else {
        ensureLoaded(img, AI_SRCS[curImgIdx.current]).then(loaded => {
          const c2 = canvasRef.current, p2 = previewRef.current
          if (c2 && p2 && p2.offsetWidth) { c2.width = p2.offsetWidth; c2.height = p2.offsetHeight; drawToCanvas(c2, loaded, 1, outputPixelSize) }
        })
      }
    }
    const t1 = setTimeout(tryDraw, 80)
    const t2 = setTimeout(tryDraw, 500)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [mounted, nearViewport, outputAspect, outputModes, outputPixelSize])

  useEffect(() => {
    if (!isUpscaleMode) return
    const t1 = setTimeout(drawUpscalePixelCanvas, 80)
    const t2 = setTimeout(drawUpscalePixelCanvas, 360)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [drawUpscalePixelCanvas, outputAspect, isUpscaleMode, phase])

  useEffect(() => {
    const el = outerRef.current; if (!el) return
    const s = Math.max(0, -el.getBoundingClientRect().top)
    setExitP(Math.max(0, Math.min(1, (s-scrollVh*0.5)/scrollVh)))
  }, [scrollY, scrollVh])

  const onPortChange = useCallback((id: string, out: Port, inp: Port) => {
    setPorts(p => {
      const prev = p[id]
      if (prev && Math.abs(prev.out.x-out.x)<1 && Math.abs(prev.out.y-out.y)<1 &&
                  Math.abs(prev.inp.x-inp.x)<1 && Math.abs(prev.inp.y-inp.y)<1) return p
      return {...p, [id]: {out, inp}}
    })
  }, [])

  const onFocus = useCallback((id: string) => {
    setZOrders(p => {
      const ordered = Object.entries(p)
        .filter(([key]) => key !== id)
        .sort((a, b) => a[1] - b[1])
      const next: Record<string, number> = {}
      ordered.forEach(([key], index) => { next[key] = NODE_Z_BASE + index })
      next[id] = NODE_Z_CLICK
      return next
    })
  }, [])

  const onExpandChange = useCallback((id: string, open: boolean) => {
    setExpandedNode(current => open ? id : current === id ? null : current)
  }, [])

  const toggleOutputMode = useCallback((mode: OutputMode) => {
    if (isActive) return
    if (mode === 'VIDEO') {
      setOutpaintGuideVisible(false)
      cancelUpscaleIntro()
      endUpscaleDrag()
    } else {
      setVideoReady(false)
    }
    setOutputModes(current => {
      if (mode === 'VIDEO') return current.includes('VIDEO') ? [] : ['VIDEO']
      const imageModes = current.filter(item => item !== 'VIDEO')
      return imageModes.includes(mode) ? imageModes.filter(item => item !== mode) : [...imageModes, mode]
    })
  }, [cancelUpscaleIntro, endUpscaleDrag, isActive])

  const onPromptExpandChange = useCallback((open: boolean) => onExpandChange('prompt', open), [onExpandChange])
  const onWorkflowExpandChange = useCallback((open: boolean) => onExpandChange('erfahrung', open), [onExpandChange])
  const onDirectionExpandChange = useCallback((open: boolean) => onExpandChange('vision', open), [onExpandChange])

  useEffect(() => {
    document.body.classList.toggle('ai-expand-hover', expandedNode !== null)
    return () => document.body.classList.remove('ai-expand-hover')
  }, [expandedNode])

  const generate = useCallback(() => {
    if (isActive) return
    const generationPixelSize = 3
    setOutputFormat(pendingOutputFormat)
    setOutputModes([])
    setVideoReady(false)
    setOutpaintGuideVisible(false)
    cancelUpscaleIntro()
    endUpscaleDrag()
    if (shuffledQueue.current.length === 0) {
      const indices = Array.from({length: AI_SRCS.length}, (_, i) => i).filter(i => i !== curImgIdx.current)
      for (let k = indices.length - 1; k > 0; k--) {
        const j = Math.floor(Math.random() * (k + 1));
        [indices[k], indices[j]] = [indices[j], indices[k]]
      }
      shuffledQueue.current = indices
    }
    const nextIdx = shuffledQueue.current.pop()!
    curImgIdx.current = nextIdx
    setIsActive(true); setPhase(0)

    const TOTAL = GENERATION_SIM_MS
    let t0: number | null = null, lastPhaseSet = 0

    const cv = canvasRef.current, pv = previewRef.current
    if (cv && pv && pv.offsetWidth) {
      cv.width = pv.offsetWidth; cv.height = pv.offsetHeight
      const ctx = cv.getContext('2d')
      if (ctx) { ctx.fillStyle='#000'; ctx.fillRect(0,0,cv.width,cv.height) }
    }

    const img = getAiImage(nextIdx)
    void ensureLoaded(img, AI_SRCS[nextIdx])
    cancelAnimationFrame(rafRef.current)

    const tick = (now: number) => {
      if (!t0) t0 = now
      const t = Math.min((now-t0) / TOTAL, 1)
      if (now - lastPhaseSet > 120 || t >= 1) { lastPhaseSet = now; setPhase(t) }

      const canvas = canvasRef.current, pvEl = previewRef.current
      if (canvas && pvEl) {
        if (canvas.width !== pvEl.offsetWidth || canvas.height !== pvEl.offsetHeight) {
          canvas.width = pvEl.offsetWidth || 470; canvas.height = pvEl.offsetHeight || 470
        }
        if (canvas.width > 0 && canvas.height > 0) {
          // Quadratic pixel decay: chunky most of the time, then lands on the selected output quality.
          const tShift = Math.max(0, (0.96 - t) / 0.96)
          const pixelSize = Math.max(generationPixelSize, 40 * Math.pow(tShift, 1.4))
          const opacity = t
          if (img.complete && img.naturalWidth > 0) {
            drawToCanvas(canvas, img, opacity, pixelSize)
          }
        }
      }

      if (t < 1) {
        rafRef.current = requestAnimationFrame(tick)
      } else {
        const cv2 = canvasRef.current, pv2 = previewRef.current
        if (cv2 && pv2) {
          cv2.width = pv2.offsetWidth||470; cv2.height = pv2.offsetHeight||470
          if (img.complete && img.naturalWidth > 0) { drawToCanvas(cv2, img, 1, generationPixelSize) }
          else { img.onload = () => { const c=canvasRef.current,p=previewRef.current; if(c&&p){c.width=p.offsetWidth||470;c.height=p.offsetHeight||470;drawToCanvas(c,img,1,generationPixelSize)} } }
        }
        setPhase(0); setIsActive(false)
      }
    }
    rafRef.current = requestAnimationFrame(tick)
  }, [cancelUpscaleIntro, endUpscaleDrag, isActive, pendingOutputFormat])

  useEffect(() => {
    if (autoGenerateTimerRef.current) {
      clearTimeout(autoGenerateTimerRef.current)
      autoGenerateTimerRef.current = null
    }
    if (!mounted || !nearViewport || isActive || outputModes.length > 0) return

    autoGenerateTimerRef.current = setTimeout(() => {
      autoGenerateTimerRef.current = null
      generate()
    }, 10000)

    return () => {
      if (autoGenerateTimerRef.current) {
        clearTimeout(autoGenerateTimerRef.current)
        autoGenerateTimerRef.current = null
      }
    }
  }, [generate, isActive, mounted, nearViewport, outputModes.length])

  const wLit = (seg: number) => isActive && phase >= seg / SEG_N
  const currentStage = STAGES.find(s => phase >= s.start && phase < s.end)
  const activeStageLabel = currentStage?.label === 'MODES' && outputModes.length === 0 ? 'OUTPUT REVIEW' : currentStage?.label ?? 'OUTPUT READY'

  // Always render the outer wrapper with sectionRef attached so we can measure
  if (!mounted) return (
    <div ref={outerRef} id="ai-section" data-textcolor="white" style={{ position:'relative', zIndex:isMobile ? 50 : 40, height:isMobile ? '230svh' : '240vh', marginTop:isMobile ? '-230svh' : '-420vh' }}>
      <section ref={sectionRef} id="ki" style={{ position:'sticky', top:0, backgroundColor:'#000', height:'var(--app-visual-height, 100svh)' }}/>
    </div>
  )

  const VW = dims?.w ?? width
  const VH = dims?.h ?? visualHeight

  // ── Mobile ────────────────────────────────────────────────────────────────
  if (isMobile) return (
    <div ref={outerRef} id="ai-section" data-textcolor="white" style={{ position:'relative', zIndex:50, height:'230svh', marginTop:'-230svh' }}>
      <style>{`
        @keyframes aiBlink{0%,100%{opacity:1}50%{opacity:0.1}}
        @keyframes spin{0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}}
        @keyframes spinReverse{0%{transform:rotate(0deg)}100%{transform:rotate(-360deg)}}
        @keyframes terminalScroll{0%{transform:translateY(0)}100%{transform:translateY(-50%)}}
        @font-face{font-family:'Borna';src:url('/fonts/Borna-Medium.otf') format('opentype');font-weight:500;font-display:swap}
        @font-face{font-family:'Borna';src:url('/fonts/Borna-Bold.otf') format('opentype');font-weight:700;font-display:swap}
        @font-face{font-family:'Borna';src:url('/fonts/Borna-SemiBold.otf') format('opentype');font-weight:600;font-display:swap}
      `}</style>
      <section ref={sectionRef} id="ki" style={{ position:'sticky', top:0, backgroundColor:'#000', height:'var(--app-visual-height, 100svh)', boxSizing:'border-box', overflow:'hidden' }}>
        <GridBg/>
        <div style={{ position:'relative', zIndex:3, height:'100%', boxSizing:'border-box', padding:'20vw 5vw 5vw', display:'flex', flexDirection:'column', justifyContent:'space-between', gap: 12, filter:exitP>0.02?`blur(${exitP*18}px)`:'none', opacity:1-exitP*0.9, transform:`scale(${1-exitP*0.04})`, transformOrigin:'center top', willChange:'filter,opacity,transform' }}>
          <NeonHeading/>
          
          {/* ═══ ARTISTIC INTELLIGENCE INTERFACE ═══ */}
          <div style={{ position: 'relative', background: '#111', border: '1px solid rgba(57,255,20,0.3)', overflow: 'hidden' }}>
            
            {/* Terminal Background Layer */}
            <div style={{ 
              position: 'absolute', 
              inset: 0, 
              opacity: isActive ? 0.15 : 0.08,
              overflow: 'hidden',
              pointerEvents: 'none',
              transition: 'opacity 0.5s'
            }}>
              <div style={{ 
                fontFamily: MONO, 
                fontSize: 8, 
                color: '#39ff14', 
                lineHeight: 1.4,
                padding: 8,
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-all'
              }}>
                {CRAZY.map((l, i) => (
                  <div key={i} style={{ opacity: isActive && phase * CRAZY.length > i ? 1 : 0.3 }}>{l.c}</div>
                ))}
              </div>
            </div>
            
            {/* Main Preview Area */}
            <div ref={previewRef} style={{ 
              position: 'relative', 
              width: '100%', 
              height: 'min(38svh, 72vw)',
              background: 'transparent',
              zIndex: 2
            }}>
              <canvas ref={canvasRef} style={{ position:'absolute', inset:0, width:'100%', height:'100%', display:'block' }}/>
              
              {/* Progress ring overlay when generating */}
              {isActive && (
                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 5 }}>
                  <svg width={80} height={80} style={{ filter: 'drop-shadow(0 0 10px rgba(57,255,20,0.5))' }}>
                    <circle cx={40} cy={40} r={35} fill="none" stroke="rgba(57,255,20,0.2)" strokeWidth={2}/>
                    <circle cx={40} cy={40} r={35} fill="none" stroke="#39ff14" strokeWidth={2}
                      strokeDasharray={`${2*Math.PI*35*phase} ${2*Math.PI*35*(1-phase)}`} strokeLinecap="round"
                      style={{ transformOrigin:'40px 40px', transform: 'rotate(-90deg)' }}/>
                    <circle cx={40} cy={40} r={24} fill="rgba(0,0,0,0.6)" stroke="rgba(57,255,20,0.3)" strokeWidth={1}/>
                    <text x={40} y={44} textAnchor="middle" fill="#39ff14" fontSize={14} fontFamily={MONO} fontWeight="bold">{Math.round(phase*100)}%</text>
                  </svg>
                </div>
              )}
              
            </div>
            
            {/* Workflow Button */}
            <button onClick={() => generate()} disabled={isActive}
              style={{ 
                display: 'block',
                width: '100%',
                background: isActive ? 'rgba(57,255,20,0.1)' : '#39ff14', 
                border: 'none',
                color: isActive ? '#39ff14' : '#000', 
                padding: '12px', 
                fontFamily: BORNA, 
                fontSize: 12, 
                letterSpacing: '0.1em', 
                cursor: isActive ? 'not-allowed' : 'pointer', 
                fontWeight: 800,
                textTransform: 'uppercase',
                transition: 'all 0.3s'
              }}>
              {isActive ? '◈ GENERATING' : '[ GENERATE ]'}
            </button>
          </div>
          
          {/* ═══ INFO CARDS ═══ */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            
            {/* WORKFLOW Card */}
            <div style={{ background: '#0d0d0d', border: '1px solid rgba(57,255,20,0.2)' }}>
              <div style={{ 
                padding: '7px 10px', 
                borderBottom: '1px solid rgba(57,255,20,0.15)',
                display: 'flex',
                alignItems: 'center',
                gap: 8
              }}>
                <span style={{ color: '#39ff14', fontSize: 10 }}>◈</span>
                <span style={{ color: '#fff', fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', fontFamily: BORNA, fontWeight: 600 }}>
                  {lang==='de'?'WORKFLOW':'WORKFLOW'}
                </span>
              </div>
              <div style={{ padding: '8px 10px' }}>
                <p style={{ margin: 0, color: 'rgba(255,255,255,0.7)', fontSize: 10.5, lineHeight: 1.4, fontFamily: BORNA }}>
                  {lang==='de'
                    ?'Ich teste stets die neuesten Tools wie Sora oder Kling und baue daraus eigene lokale Workflows. Mit ComfyUI, N8N und gezieltem LoRA-Training erschaffe ich Bild und Video.'
                    :'I constantly test the latest tools like Sora and Kling, building my own local workflows. Using ComfyUI, N8N and targeted LoRA training, I create image and video.'}
                </p>
                <div style={{ display: 'none', flexWrap: 'wrap', gap: 6 }}>
                  {['ComfyUI','LoRA','N8N','Sora','Kling','Synthetic Media'].map((t,i) => (
                    <span key={i} style={{ 
                      background: 'rgba(57,255,20,0.1)', 
                      border: '1px solid rgba(57,255,20,0.3)', 
                      color: '#39ff14', 
                      fontSize: 9, 
                      padding: '4px 8px', 
                      fontFamily: MONO,
                      letterSpacing: '0.05em'
                    }}>{t}</span>
                  ))}
                </div>
              </div>
            </div>
            
            {/* VISION Card */}
            <div style={{ background: '#0d0d0d', border: '1px solid rgba(57,255,20,0.2)' }}>
              <div style={{ 
                padding: '7px 10px', 
                borderBottom: '1px solid rgba(57,255,20,0.15)',
                display: 'flex',
                alignItems: 'center',
                gap: 8
              }}>
                <span style={{ color: '#39ff14', fontSize: 10 }}>◈</span>
                <span style={{ color: '#fff', fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', fontFamily: BORNA, fontWeight: 600 }}>VISION</span>
              </div>
              <div style={{ padding: '8px 10px' }}>
                <p style={{ margin: 0, color: 'rgba(255,255,255,0.7)', fontSize: 10.5, lineHeight: 1.4, fontFamily: BORNA }}>
                  {lang==='de'
                    ?'KI ist für mich kein bloßes Werkzeug, sondern ein neues Medium der Inspiration. Als Pionier der ersten Stunde nutze ich die generative Kraft, um meine künstlerische Ausdruckskraft zu schärfen.'
                    :'AI is not merely a tool for me, but a new medium of inspiration. As an early adopter, I use generative power to sharpen my artistic expression and make visions more precisely tangible.'}
                </p>
              </div>
            </div>
            
          </div>
        </div>
      </section>
    </div>
  )

  // ── Desktop ───────────────────────────────────────────────────────────────
  const cs: React.CSSProperties = { padding:'10px 12px', color:'#111', fontSize:11, lineHeight:1.6, fontFamily:BORNA, fontWeight:500 }
  const controlNodeWidth = 192
  const controlButtonBase: React.CSSProperties = { height:30, padding:'0 10px', border:'1px solid rgba(0,0,0,0.18)', fontFamily:BORNA, fontSize:10, lineHeight:1, fontWeight:800, letterSpacing:'0.08em', textAlign:'left', cursor:'pointer', textTransform:'uppercase' }

  // ─── Fenster-Positionen ────────────────────────────────────────────────────
  // VW/VH = section.offsetWidth/Height (gemessen, nicht window)
  // Spalten X: VW * 0.XX | Zeilen Y: VH * 0.XX
  // +0.01 ≈ +14px rechts (bei 1440px) / +9px unten (bei 900px)
  const C1 = Math.round(VW * 0.088)   // GENERATE + PROMPT DESIGN
  const C2 = Math.round(VW * 0.286)   // WORKFLOW + VISION
  const C3 = Math.round(VW * 0.494)   // FORMAT + MODES
  const C4 = Math.round(VW * 0.494)   // TERMINAL
  const C5 = Math.round(VW * 0.764)   // PROGRESS

  const TERM_TOP     = Math.round(VH * 0.151)  // TERMINAL + PIPELINE (oben)
  const PROGRESS_TOP = Math.round(VH * 0.214)  // PROGRESS
  const GEN_TOP      = Math.round(VH * 0.532)  // GENERATE
  const PROMPT_TOP   = Math.max(Math.round(VH * 0.680), GEN_TOP + 126)  // PROMPT DESIGN
  const ERF_TOP      = Math.round(VH * 0.521)  // WORKFLOW
  const VIS_TOP      = Math.max(Math.round(VH * 0.661), ERF_TOP + 118)  // VISION
  const UPS_TOP      = Math.round(VH * 0.495)  // FORMAT
  const MODES_TOP    = Math.max(Math.round(VH * 0.702), UPS_TOP + 171)  // MODES
  const PREV_TOP   = Math.round(VH * 0.328)  // OUTPUT
  const PREV_LEFT  = Math.max(Math.round(VW * 0.638), C3 + controlNodeWidth + 6)

  return (
    <div ref={outerRef} id="ai-section" data-textcolor="white" style={{ position:'relative', zIndex:40, height:'240vh', marginTop:'-420vh' }}>
      <style>{`
        @keyframes aiBlink{0%,100%{opacity:1}50%{opacity:0.1}}
        @keyframes scanln{0%{top:-2px}100%{top:100%}}
        @keyframes aiOutpaintGrow{0%{inset:44px;opacity:0.35}45%{opacity:0.85}100%{inset:9px;opacity:1}}
        @keyframes spin{0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}}
        @keyframes spinReverse{0%{transform:rotate(0deg)}100%{transform:rotate(-360deg)}}
        @font-face{font-family:'Borna';src:url('/fonts/Borna-Medium.otf') format('opentype');font-weight:500;font-display:swap}
        @font-face{font-family:'Borna';src:url('/fonts/Borna-Bold.otf') format('opentype');font-weight:700;font-display:swap}
        @font-face{font-family:'Borna';src:url('/fonts/Borna-SemiBold.otf') format('opentype');font-weight:600;font-display:swap}
        .ai-gen-btn:active{transform:scale(0.91)!important;transition:transform 0.07s}
        .ai-gen-btn:hover{transform:scale(0.96);transition:transform 0.12s}
        .ai-gen-btn-active{transform:none}
        .ai-format-btn,.ai-mode-btn{transition:background-color 0.16s ease,color 0.16s ease,border-color 0.16s ease,transform 0.12s ease,box-shadow 0.16s ease;transform-origin:center}
        .ai-format-btn:hover,.ai-mode-btn:hover{transform:scale(0.96);border-color:rgba(0,0,0,0.48)!important;box-shadow:none}
        .ai-format-btn:active,.ai-mode-btn:active{transform:scale(0.91)!important;box-shadow:none;transition:transform 0.07s}
        .ai-mode-btn:disabled,.ai-mode-btn:disabled:hover,.ai-mode-btn:disabled:active{transform:none!important;box-shadow:none!important;cursor:default!important}
        body.ai-expand-hover .custom-cursor{display:none!important;opacity:0!important;visibility:hidden!important}
      `}</style>

      <section ref={sectionRef} id="ki" style={{ position:'sticky', top:0, backgroundColor:'#000', overflow:'hidden', height:'var(--app-visual-height, 100svh)', boxSizing:'border-box' }}>
        <GridBg/>
        <CablesLayer ports={ports} phase={phase} isActive={isActive} exitP={exitP} modeSelected={outputModes.length > 0}/>

        <div style={{ position:'absolute', inset:0, zIndex:5, filter:exitP>0.02?`blur(${exitP*18}px)`:'none', opacity:1-exitP*0.9, transform:`scale(${1-exitP*0.04})`, transformOrigin:'center top', willChange:'filter,opacity,transform' }}>

          <div style={{ position:'absolute', top:'9vw', left:'9vw', zIndex:20, pointerEvents:'none' }}>
            <NeonHeading/>
          </div>

          {/* PROMPT DESIGN */}
          <Win id="prompt" title="PROMPT DESIGN" width={245} initPos={{x:C1, y:PROMPT_TOP}} onPortChange={onPortChange} onFocus={onFocus} zIndex={expandedNode==='prompt'?NODE_Z_EXPANDED:zOrders.prompt} lit={wLit(0)} freezePortY>
            <ExpandCard hint={lang==='de'?'Aus einer Idee wird eine steuerbare Bildwelt.':'An idea becomes a controllable visual world.'}
              text={lang==='de'?'Ich verstehe Prompt Design als gestalterische Regie: Ziele, Markenhaltung, Stilreferenzen und Grenzen werden so präzise formuliert, dass KI nicht zufällig wirkt, sondern bewusst in eine visuelle Richtung geführt wird. Gute Prompts sind für mich kein Trick, sondern ein kompaktes Creative-Briefing.':'I understand prompt design as creative direction: goals, brand attitude, style references and constraints are formulated precisely enough that AI does not feel random, but is guided into a deliberate visual direction. Good prompts are not a trick to me, but a compact creative briefing.'}
              onOpenChange={onPromptExpandChange}/>
          </Win>

          {/* GENERATE */}
          <Win id="generate" title="GENERATE" width={210} initPos={{x:C1, y:GEN_TOP}} onPortChange={onPortChange} onFocus={onFocus} zIndex={zOrders.generate}>
            <div style={{ padding:'12px' }}>
              <button onClick={() => generate()} disabled={isActive}
                className={isActive ? 'ai-gen-btn-active' : 'ai-gen-btn'}
                style={{ background:isActive?'rgba(0,0,0,0.06)':'#000', border:'2px solid #000', color:isActive?'rgba(0,0,0,0.3)':'#fff', padding:'14px 0', width:'100%', fontFamily:BORNA, fontSize:15, letterSpacing:'0.08em', cursor:isActive?'not-allowed':'pointer', animation:isActive?'aiBlink 0.75s infinite':'none', fontWeight:800, textTransform:'uppercase' }}>
                {isActive ? '[ GENERATING ]' : '[ GENERATE ]'}
              </button>
            </div>
          </Win>

          {/* WORKFLOW */}
          <Win id="erfahrung" title="WORKFLOW" width={265} initPos={{x:C2, y:ERF_TOP}} onPortChange={onPortChange} onFocus={onFocus} zIndex={expandedNode==='erfahrung'?NODE_Z_EXPANDED:zOrders.erfahrung} lit={wLit(1)} freezePortY>
            <ExpandCard hint={lang==='de'?'Tools werden zu einem wiederholbaren Produktionssystem.':'Tools become a repeatable production system.'}
              text={lang==='de'?'Ich teste stets die neuesten Tools wie Sora oder Kling und baue daraus eigene lokale Workflows. Mit ComfyUI, N8N und gezieltem LoRA-Training erschaffe ich Bild und Video. Auch Synthetic-Media-Workflows nutze ich vielseitig für neue Dimensionen der digitalen Inszenierung. Technik und Ästhetik verschmelzen hier zu meiner eigenen Sprache.':'I constantly test the latest tools like Sora and Kling, building my own local workflows. Using ComfyUI, N8N and targeted LoRA training, I create image and video. I also use synthetic media workflows for new dimensions of digital staging. Technology and aesthetics merge into my own language.'}
              onOpenChange={onWorkflowExpandChange}/>
          </Win>

          {/* VISION */}
          <Win id="vision" title="VISION" width={250} initPos={{x:C2, y:VIS_TOP}} onPortChange={onPortChange} onFocus={onFocus} zIndex={expandedNode==='vision'?NODE_Z_EXPANDED:zOrders.vision} lit={wLit(1)} freezePortY>
            <ExpandCard hint={lang==='de'?'KI erweitert meine Handschrift, sie ersetzt sie nicht.':'AI extends my voice; it does not replace it.'}
              text={lang==='de'?'KI ist für mich kein bloßes Werkzeug, sondern ein neues Medium der Inspiration. Als Pionier der ersten Stunde nutze ich die generative Kraft, um meine künstlerische Ausdruckskraft zu schärfen und Visionen präziser greifbar zu machen. Es ist die Suche nach der perfekten Symbiose aus Mensch und Maschine.':'AI is not merely a tool for me, but a new medium of inspiration. As an early adopter, I use generative power to sharpen my artistic expression and make visions more precisely tangible. It is the search for the perfect symbiosis of human and machine.'} onOpenChange={onDirectionExpandChange}/>
          </Win>

          {/* FORMAT */}
          <Win id="upscale" title="FORMAT" width={controlNodeWidth} initPos={{x:C3, y:UPS_TOP}} onPortChange={onPortChange} onFocus={onFocus} zIndex={Math.max(zOrders.upscale, NODE_Z_CONTROL)} lit={wLit(2)}>
            <div style={{...cs, display:'grid', gridTemplateColumns:'1fr', gap:6}}>
              {FORMAT_OPTIONS.map(ratio => (
                <button
                  key={ratio}
                  type="button"
                  className="ai-format-btn"
                  aria-pressed={pendingOutputFormat===ratio}
                  onPointerEnter={() => setHoveredControl(`format-${ratio}`)}
                  onPointerLeave={() => setHoveredControl(null)}
                  onMouseOver={() => setHoveredControl(`format-${ratio}`)}
                  onMouseEnter={() => setHoveredControl(`format-${ratio}`)}
                  onMouseLeave={() => setHoveredControl(null)}
                  onClick={() => setPendingOutputFormat(ratio)}
                  style={{ ...controlButtonBase, background:pendingOutputFormat===ratio?'#000':'rgba(0,0,0,0.08)', color:pendingOutputFormat===ratio?'#fff':'#111', borderColor:hoveredControl===`format-${ratio}`?'rgba(0,0,0,0.48)':'rgba(0,0,0,0.18)', transform:hoveredControl===`format-${ratio}`?'scale(0.96)':'none' }}
                >{ratio}</button>
              ))}
            </div>
          </Win>

          {/* MODES */}
          <Win id="modes" title="MODES" width={controlNodeWidth} initPos={{x:C3, y:MODES_TOP}} onPortChange={onPortChange} onFocus={onFocus} zIndex={Math.max(zOrders.modes, NODE_Z_CONTROL_LOW)} lit={outputModes.length > 0 && wLit(3)}>
            <div style={{...cs, display:'grid', gridTemplateColumns:'1fr', gap:6}}>
              {OUTPUT_MODE_OPTIONS.map(mode => (
                <button
                  key={mode}
                  type="button"
                  className="ai-mode-btn"
                  aria-pressed={outputModes.includes(mode)}
                  aria-disabled={isActive}
                  disabled={isActive}
                  onPointerEnter={() => setHoveredControl(`mode-${mode}`)}
                  onPointerLeave={() => setHoveredControl(null)}
                  onMouseOver={() => setHoveredControl(`mode-${mode}`)}
                  onMouseEnter={() => setHoveredControl(`mode-${mode}`)}
                  onMouseLeave={() => setHoveredControl(null)}
                  onClick={() => toggleOutputMode(mode)}
                  style={{ ...controlButtonBase, background:outputModes.includes(mode)?'#000':'rgba(0,0,0,0.08)', color:outputModes.includes(mode)?'#fff':'#111', borderColor:hoveredControl===`mode-${mode}`?'rgba(0,0,0,0.48)':'rgba(0,0,0,0.18)', cursor:isActive?'default':'pointer', opacity:isActive?0.42:1, transform:hoveredControl===`mode-${mode}` && !isActive?'scale(0.96)':'none' }}
                >{mode}</button>
              ))}
            </div>
          </Win>

          {/* TERMINAL */}
          <Win id="terminal" title="WORKFLOW LOG" width={390} initPos={{x:C4, y:TERM_TOP}} onPortChange={onPortChange} onFocus={onFocus} zIndex={zOrders.terminal} lit={wLit(4)} minH={250}>
            <div style={{ height:238, background:'#0d0d0d', overflow:'hidden' }}><CrazyTerminal phase={phase} isActive={isActive} lang={lang}/></div>
          </Win>

          {/* PROGRESS */}
          <Win id="progress" title="PROGRESS" width={205} initPos={{x:C5, y:PROGRESS_TOP}} onPortChange={onPortChange} onFocus={onFocus} zIndex={zOrders.progress} lit={wLit(5)}>
            <div style={{ height:42, background:'#0d0d0d' }}><ProgressTerm phase={phase} isActive={isActive}/></div>
          </Win>

          {/* OUTPUT */}
          <Win id="preview" title="OUTPUT" width={outputWinWidth} initPos={{x:PREV_LEFT, y:PREV_TOP}} offset={outputWindowOffset} animateLayout onPortChange={onPortChange} onFocus={onFocus} zIndex={zOrders.preview} lit={wLit(6)}>
            <div style={{ width:'100%', height:outputShellHeight, position:'relative', overflow:'hidden', background:'#111', transition:'height 0.28s ease', boxSizing:'border-box' }}>
              <div ref={previewRef} style={{ position:'absolute', left:'50%', top:'50%', transform:'translate(-50%,-50%)', width:previewFrameWidth, aspectRatio:outputAspect, overflow:'hidden', background:'#111' }}>
                <canvas ref={canvasRef} style={{ position:'absolute', inset:0, width:'100%', height:'100%', display:'block' }}/>
                {outpaintGuideVisible && <div data-ai-outpaint-guide style={{ position:'absolute', inset:outpaintGuideInset, border:'1px dashed rgba(255,255,255,0.76)', zIndex:5, pointerEvents:'none' }}/>} 
              {isUpscaleMode && <>
                  <div data-ai-mode-effect="upscale" style={{ position:'absolute', left:`${upscaleSplit*100}%`, right:0, top:0, bottom:0, overflow:'hidden', zIndex:3, pointerEvents:'none' }}>
                    <canvas ref={upscaleCanvasRef} style={{ position:'absolute', right:0, top:0, width:`${100 / upscalePixelReveal}%`, height:'100%', display:'block', imageRendering:'pixelated' }}/>
                  </div>
                  <div
                    data-ai-upscale-track
                    role="slider"
                    aria-label="Upscale comparison split"
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={Math.round(upscaleSplit * 100)}
                    tabIndex={0}
                    onPointerDown={(e) => { e.stopPropagation(); beginUpscaleDrag(e.clientX) }}
                    onPointerMove={(e) => { if (e.buttons !== 1) return; setUpscaleSplitFromClientX(e.clientX) }}
                    onPointerUp={endUpscaleDrag}
                    onPointerCancel={endUpscaleDrag}
                    onMouseDown={(e) => e.stopPropagation()}
                    style={{ position:'absolute', inset:0, zIndex:4, cursor:upscaleIntroActive?'default':'ew-resize', pointerEvents:upscaleIntroActive?'none':'auto', touchAction:'none', background:'transparent', outline:'none' }}
                  />
                  <div
                    data-ai-upscale-line
                    style={{ position:'absolute', left:`calc(${upscaleSplit*100}% - 13px)`, top:0, bottom:0, width:26, zIndex:5, pointerEvents:'none' }}
                  >
                    <div style={{ position:'absolute', left:12, top:0, bottom:0, width:2, background:'#fff' }}/>
                    <div style={{ position:'absolute', left:4, top:'50%', transform:`translateY(-50%) scale(${upscaleDragging ? 1.14 : upscaleHandleHovered ? 1.08 : 1})`, width:18, height:38, background: upscaleDragging || upscaleHandleHovered ? 'rgba(57,255,20,0.16)' : 'rgba(0,0,0,0.62)', border:`1px solid ${upscaleDragging || upscaleHandleHovered ? 'rgba(57,255,20,0.92)' : 'rgba(255,255,255,0.62)'}`, display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontFamily:MONO, fontSize:10, fontWeight:800, transition:'transform 0.16s ease,background 0.16s ease,border-color 0.16s ease' }}>||</div>
                  </div>
              </>} 
              </div>
              {isVideoMode && <div data-ai-mode-effect="video" style={{ position:'absolute', inset:0, zIndex:6, pointerEvents:'none' }}>
                {!videoReady ? (
                  <div data-ai-video-loading style={{ position:'absolute', left:'50%', top:'50%', transform:'translate(-50%,-50%)', width:62, height:62, borderRadius:'50%', background:'rgba(0,0,0,0.52)', border:'1px solid rgba(255,255,255,0.34)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                    <div style={{ width:34, height:34, borderRadius:'50%', border:'2px solid rgba(255,255,255,0.24)', borderTopColor:'#fff', animation:'spin 0.78s linear infinite' }}/>
                  </div>
                ) : <>
                  <div data-ai-video-play style={{ position:'absolute', left:'50%', top:'50%', transform:'translate(-50%,-50%)', width:54, height:54, borderRadius:'50%', background:'rgba(0,0,0,0.62)', border:'1px solid rgba(255,255,255,0.68)', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 0 18px rgba(0,0,0,0.55)' }}>
                    <div style={{ width:0, height:0, borderTop:'10px solid transparent', borderBottom:'10px solid transparent', borderLeft:'16px solid #fff', marginLeft:4 }}/>
                  </div>
                  <div data-ai-video-timeline style={{ position:'absolute', left:12, right:12, bottom:12, height:36, background:'rgba(0,0,0,0.72)', border:'1px solid rgba(255,255,255,0.24)', display:'flex', alignItems:'center', gap:7, padding:'0 9px' }}>
                    <div style={{ width:8, height:8, borderRadius:'50%', background:'#39ff14', boxShadow:'0 0 10px rgba(57,255,20,0.65)' }}/>
                    <div style={{ flex:1, height:5, background:'rgba(255,255,255,0.2)', position:'relative', overflow:'hidden' }}>
                      <div style={{ position:'absolute', left:0, top:0, bottom:0, width:'38%', background:'#fff' }}/>
                      <div style={{ position:'absolute', left:'38%', top:-4, width:2, height:13, background:'#39ff14' }}/>
                    </div>
                    <div style={{ color:'#fff', fontFamily:MONO, fontSize:9, fontWeight:700 }}>00:04</div>
                  </div>
                </>}
              </div>}
            </div>
          </Win>

        </div>
      </section>
    </div>
  )
}