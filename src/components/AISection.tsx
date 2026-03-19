'use client'
import { useRef, useEffect, useState, useCallback } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'

type Lang = 'de' | 'en'
type Port = { x: number; y: number }
type PortMap = Record<string, { out: Port; inp: Port }>

const BORNA = "'Borna','Helvetica Neue',Arial,sans-serif"
const MONO  = '"Courier New",monospace'

// ─── Scramble ─────────────────────────────────────────────────────────────────
const SCHARS = '!@#$%&*АБВГДЕЖИКЛМНОПРСТУФХЦШЩЪ01アイウエオ'
function useScramble(text: string) {
  const [d, setD] = useState(text)
  const iv = useRef<ReturnType<typeof setInterval>|null>(null)
  const p = useRef(text)
  useEffect(() => {
    if (p.current === text) return; p.current = text
    let i = 0; const r = new Set<number>()
    if (iv.current) clearInterval(iv.current)
    iv.current = setInterval(() => {
      i++
      const pool = text.split('').map((_,j)=>j).filter(j=>!r.has(j)&&text[j]!==' ')
      if (pool.length) r.add(pool[Math.floor(Math.random()*pool.length)])
      setD(text.split('').map((c,j)=>r.has(j)||c===' '?text[j]:SCHARS[Math.floor(Math.random()*SCHARS.length)]).join(''))
      if (i >= 14) { clearInterval(iv.current!); setD(text) }
    }, 30)
  }, [text])
  const scramble = useCallback(() => {
    let i = 0; const r = new Set<number>()
    if (iv.current) clearInterval(iv.current)
    iv.current = setInterval(() => {
      i++
      const pool = text.split('').map((_,j)=>j).filter(j=>!r.has(j)&&text[j]!==' ')
      if (pool.length) r.add(pool[Math.floor(Math.random()*pool.length)])
      setD(text.split('').map((c,j)=>r.has(j)||c===' '?text[j]:SCHARS[Math.floor(Math.random()*SCHARS.length)]).join(''))
      if (i >= 14) { clearInterval(iv.current!); setD(text) }
    }, 30)
  }, [text])
  return { disp: d, scramble }
}

// ─── Neon Heading ─────────────────────────────────────────────────────────────
function NeonHeading() {
  const [fl, setFl] = useState(1)
  const { disp: d1, scramble: s1 } = useScramble('PROMPT')
  const { disp: d2, scramble: s2 } = useScramble('DESIGN')
  useEffect(() => {
    let t: ReturnType<typeof setTimeout>
    const go = () => { t = setTimeout(() => { const s=[0.1,1,0.05,0.9,0.2,1,0.7,1]; s.forEach((v,i)=>setTimeout(()=>setFl(v),i*55)); setTimeout(()=>{setFl(1);go()},s.length*55+400) }, 3000+Math.random()*8000) }
    go(); return () => clearTimeout(t)
  }, [])
  const glow = '0 0 7px #fff,0 0 18px #fff,0 0 40px rgba(255,255,255,0.5)'
  return (
    <div onMouseEnter={() => { s1(); s2() }} style={{ cursor:'default', userSelect:'none', opacity:fl, transition:'opacity 0.04s' }}>
      <div style={{ fontSize:'8vw', fontWeight:900, lineHeight:0.88, letterSpacing:'-2px', textTransform:'uppercase', color:'#fff', textShadow:glow, fontFamily:BORNA }}>
        <div>{d1}</div><div>{d2}</div>
      </div>
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

// ─── Spinner ──────────────────────────────────────────────────────────────────
function SpinnerContent({ isActive, phase }: { isActive: boolean; phase: number }) {
  const s=130, c=65, r1=52, r2=40, r3=25
  const pct = Math.round(phase*100)
  const arc = (r: number, t: number) => `${2*Math.PI*r*t} ${2*Math.PI*r*(1-t)}`
  return (
    <div style={{ padding:'14px', display:'flex', flexDirection:'column', alignItems:'center', gap:8 }}>
      <svg width={s} height={s}>
        <circle cx={c} cy={c} r={r1} fill="none" stroke="rgba(0,0,0,0.1)" strokeWidth={3}/>
        <circle cx={c} cy={c} r={r1} fill="none" stroke={isActive?'#39ff14':'rgba(0,0,0,0.15)'} strokeWidth={3}
          strokeDasharray={arc(r1,phase)} strokeLinecap="round"
          style={{ transformOrigin:`${c}px ${c}px`, animation:'spin 4s linear infinite' }}/>
        <circle cx={c} cy={c} r={r2} fill="none" stroke="rgba(0,0,0,0.08)" strokeWidth={2}/>
        <circle cx={c} cy={c} r={r2} fill="none" stroke={isActive?'rgba(57,255,20,0.5)':'rgba(0,0,0,0.1)'} strokeWidth={2}
          strokeDasharray={arc(r2,0.6)} style={{ transformOrigin:`${c}px ${c}px`, animation:'spinReverse 2s linear infinite' }}/>
        <circle cx={c} cy={c} r={r3} fill="none" stroke="rgba(0,0,0,0.06)" strokeWidth={1.5}/>
        <circle cx={c} cy={c} r={r3} fill="none" stroke={isActive?'rgba(57,255,20,0.4)':'rgba(0,0,0,0.08)'} strokeWidth={1.5}
          strokeDasharray={arc(r3,phase*0.8)} style={{ transformOrigin:`${c}px ${c}px`, animation:'spin 1.5s linear infinite' }}/>
        {Array.from({length:24},(_,i)=>{ const a=(i/24)*Math.PI*2; return <line key={i} x1={c+Math.cos(a)*(r1+3)} y1={c+Math.sin(a)*(r1+3)} x2={c+Math.cos(a)*(r1+8)} y2={c+Math.sin(a)*(r1+8)} stroke={i/24<=phase?'#000':'rgba(0,0,0,0.2)'} strokeWidth={i/24<=phase?2:1}/> })}
        <circle cx={c} cy={c} r={12} fill={isActive?'#39ff14':'rgba(0,0,0,0.15)'}/>
        <text x={c} y={c+4} textAnchor="middle" fill={isActive?'#000':'rgba(0,0,0,0.4)'} fontSize={9} fontFamily={MONO} fontWeight="bold">{pct}%</text>
      </svg>
      <div style={{ fontFamily:MONO, fontSize:9, color:isActive?'#39ff14':'rgba(0,0,0,0.35)', letterSpacing:'0.1em', textAlign:'center' }}>
        {isActive ? 'PROCESSING...' : 'STANDBY'}
      </div>
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
  {t:'r', c:'ОБРАБОТКА ERFAHRUNG :: семантический стек АКТИВЕН'},
  {t:'c', c:'prompt = "portrait, cinematic, 8k sharp, NIKITA_v2"'},
  {t:'c', c:'z = pipe.vae.encode(img).latent_dist.sample()*0.18215'},
  {t:'m', c:'ワヲン VISION_ENCODE アイウ CLIP→z[4,64,64] ラリルレロ'},
  {t:'c', c:'scheduler = DPMSolverMultistepScheduler(num_steps=28)'},
  {t:'c', c:'for t in scheduler.timesteps:  # step 0/28 → 28/28'},
  {t:'c', c:'    noise_pred = pipe.unet(z_t, t, enc_hidden)'},
  {t:'c', c:'    z_t = scheduler.step(noise_pred, t, z_t).prev'},
  {t:'r', c:'DENOISE шаг 27/28 DPM++ :: финальная итерация [DONE]'},
  {t:'m', c:'サシスセソ UPSCALE タチツテト TILE[512×512] × 4 OUTPUT'},
  {t:'c', c:'image = pipe.vae.decode(z_t/0.18215).sample.clamp(-1,1)'},
  {t:'r', c:'✓ ГЕНЕРАЦИЯ ЗАВЕРШЕНА :: 4.97s — ПЕРЕДАЧА В PREVIEW'},
  {t:'c', c:'image.save(f"/preview/NIKITA_result.png", quality=100)'},
  {t:'m', c:'ナニヌネノ SYSTEM_NOMINAL ハヒフ ALL_CLEAR [OK]'},
]
function CrazyTerminal({ phase, isActive, lang }: { phase: number; isActive: boolean; lang: Lang }) {
  const [lines, setLines] = useState([
    {t:'c', c:'#!/usr/bin/env python3  # ATOMIC_HEART ТЕРМИНАЛ v4.2'},
    {t:'r', c:'СИСТЕМА ГОТОВА — ожидание команды GENERATE'},
    {t:'c', c:'import comfyui_core, lora_injector, vae, clip, torch'},
    {t:'m', c:'サシスセソ ALL_SYSTEMS_NOMINAL タチツテト [OK]'},
  ])
  const ref = useRef<HTMLDivElement>(null)
  const shown = useRef(-1)
  useEffect(() => {
    if (!isActive) { shown.current = -1; return }
    const idx = Math.min(Math.floor(phase * CRAZY.length), CRAZY.length - 1)
    if (idx > shown.current) { shown.current = idx; setLines(p => [...p.slice(-20), CRAZY[idx]]) }
  }, [isActive, phase])
  useEffect(() => { if (ref.current) ref.current.scrollTop = ref.current.scrollHeight }, [lines])
  const col = (t: string) => t==='m' ? 'rgba(57,255,20,0.75)' : t==='r' ? '#ff9900' : 'rgba(100,200,255,0.9)'
  return (
    <div style={{ background:'#0d0d0d', fontFamily:MONO, fontSize:11, height:'100%', display:'flex', flexDirection:'column' }}>
      <div style={{ padding:'5px 12px', background:'rgba(57,255,20,0.08)', borderBottom:'1px solid rgba(57,255,20,0.2)', flexShrink:0, display:'flex', alignItems:'center', gap:8 }}>
        <span style={{ color:'rgba(57,255,20,0.6)', fontSize:10 }}>{lang==='de'?'ТЕРМИНАЛ.exe':'TERMINAL.exe'}</span>
        <div style={{ flex:1 }}/>
        {isActive && <span style={{ color:'#39ff14', fontSize:9, animation:'aiBlink 0.5s infinite', background:'rgba(57,255,20,0.15)', padding:'1px 5px', border:'1px solid rgba(57,255,20,0.3)' }}>◈ АКТИВЕН</span>}
      </div>
      <div ref={ref} style={{ padding:'8px 12px', flex:1, overflowY:'auto', display:'flex', flexDirection:'column', gap:2 }}>
        {lines.map((l,i) => <div key={i} style={{ color:col(l.t), whiteSpace:'pre-wrap', wordBreak:'break-all', lineHeight:1.5 }}>{l.c}</div>)}
        {!isActive && <div style={{ color:'rgba(57,255,20,0.2)', animation:'aiBlink 1.2s infinite' }}>█</div>}
      </div>
    </div>
  )
}

// ─── Progress Terminal ────────────────────────────────────────────────────────
const STAGES = [
  {label:'PROMPT PARSE', start:0,    end:0.14},
  {label:'ERFAHRUNG',    start:0.14, end:0.28},
  {label:'VISION',       start:0.28, end:0.42},
  {label:'UPSCALE 4x',   start:0.42, end:0.56},
  {label:'DENOISE',      start:0.56, end:0.70},
  {label:'DECODE/VAE',   start:0.70, end:0.85},
  {label:'→ PREVIEW',    start:0.85, end:1.00},
]
function ProgressTerm({ phase, isActive }: { phase: number; isActive: boolean }) {
  const pct = Math.round(phase * 100)
  const bw  = Math.round(phase * 22)
  const bar = '█'.repeat(bw) + '░'.repeat(22 - bw)
  return (
    <div style={{ background:'#0d0d0d', fontFamily:MONO, fontSize:10, height:'100%', display:'flex', flexDirection:'column' }}>
      <div style={{ padding:'5px 12px', background:'rgba(57,255,20,0.08)', borderBottom:'1px solid rgba(57,255,20,0.2)', flexShrink:0 }}>
        <span style={{ color:'rgba(57,255,20,0.6)', fontSize:10 }}>PIPELINE.status</span>
      </div>
      <div style={{ padding:'10px 12px', flex:1, display:'flex', flexDirection:'column', gap:4 }}>
        <div style={{ color:'#39ff14', fontSize:13, background:'#000', padding:'4px 8px' }}>[{bar}] {pct}%</div>
        <div style={{ color: isActive ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.25)', fontSize:10, marginBottom:4 }}>
          {isActive ? `► ${STAGES.find(s=>phase>=s.start&&phase<s.end)?.label ?? 'COMPLETE'}` : 'STANDBY'}
        </div>
        <div style={{ height:1, background:'rgba(57,255,20,0.15)', marginBottom:4 }}/>
        {STAGES.map((s, i) => {
          const done = phase >= s.end, active = phase >= s.start && phase < s.end
          const sp = active ? Math.round(((phase-s.start)/(s.end-s.start))*100) : done ? 100 : 0
          const sb = '▓'.repeat(Math.round(sp/10)) + '░'.repeat(10-Math.round(sp/10))
          return (
            <div key={i} style={{ display:'flex', gap:5, alignItems:'center', opacity: done||active ? 1 : 0.25 }}>
              <span style={{ color: done?'#39ff14':active?'#fff':'rgba(255,255,255,0.3)', fontSize:9 }}>{done?'✓':active?'►':'○'}</span>
              <span style={{ color:'rgba(255,255,255,0.7)', fontSize:9, minWidth:82 }}>{s.label}</span>
              <span style={{ color: done?'#39ff14':'rgba(255,255,255,0.3)', fontSize:9 }}>[{sb}]</span>
              {active && <span style={{ color:'#39ff14', fontSize:9, animation:'aiBlink 0.6s infinite', fontWeight:700 }}>{sp}%</span>}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Images – preloaded at module level ──────────────────────────────────────
const AI_SRCS = [
  '/ai-images/nikita-01.jpg',
  '/ai-images/nikita-13.jpg',
  '/ai-images/nikita-14.jpg',
  '/ai-images/nikita-04.jpg',
  '/ai-images/nikita-05.jpg',
  '/ai-images/nikita-06.jpg',
  '/ai-images/nikita-07.jpg',
  '/ai-images/nikita-08.jpg',
  '/ai-images/nikita-09.jpg',
  '/ai-images/nikita-10.jpg',
  '/ai-images/nikita-11.jpg',
  '/ai-images/nikita-12.jpg',
]

// Images are created at module load time (SSR-safe: typeof window check)
const AI_IMAGES: HTMLImageElement[] = typeof window !== 'undefined'
  ? AI_SRCS.map(src => { const img = new window.Image(); img.src = src; return img })
  : []

/** Ensure a specific image is loaded, resolving immediately if already done */
function ensureLoaded(img: HTMLImageElement, src: string): Promise<HTMLImageElement> {
  if (img.complete && img.naturalWidth > 0) return Promise.resolve(img)
  return new Promise(resolve => {
    const done = () => resolve(img)
    img.addEventListener('load', done, { once: true })
    img.addEventListener('error', done, { once: true })
    // Re-set src in case it failed silently
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
  if (ia > ca) { dh = w / ia; dy = (h - dh) / 2 } else { dw = h * ia; dx = (w - dw) / 2 }
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
  {from:'upscale',   to:'denoise',  seg:3},
  {from:'denoise',   to:'spinner',  seg:3},
  {from:'denoise',   to:'terminal', seg:4},
  {from:'spinner',   to:'terminal', seg:4},
  {from:'terminal',  to:'progress', seg:5},
  {from:'progress',  to:'preview',  seg:6},
]
const SEG_N = 7

function CablesLayer({ ports, phase, isActive, exitP }: { ports: PortMap; phase: number; isActive: boolean; exitP: number }) {
  const cableOpacity = Math.max(0, 1 - exitP * 2)
  return (
    <svg style={{ position:'absolute', inset:0, width:'100%', height:'100%', zIndex:4, pointerEvents:'none', overflow:'visible', opacity:cableOpacity, filter:exitP>0.05?`blur(${exitP*18}px)`:'none', transition:'none', willChange:'opacity' }}>
      {TOPO.map(({ from, to, seg }, i) => {
        const a = ports[from], b = ports[to]; if (!a || !b) return null
        const f = a.out, t2 = b.inp
        const ss = seg / SEG_N, se = (seg+1) / SEG_N
        const lit = isActive && phase >= ss
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
function Win({ id, title, width, initPos, onPortChange, onFocus, zIndex, lit=false, minH, children }: {
  id: string; title: string; width: number
  initPos: {x: number; y: number}
  onPortChange: (id: string, out: Port, inp: Port) => void
  onFocus: (id: string) => void
  zIndex: number; lit?: boolean; minH?: number
  children: React.ReactNode
}) {
  const [pos, setPos] = useState(initPos)
  const domRef   = useRef<HTMLDivElement>(null)
  const dOff     = useRef({x:0, y:0})
  const dragging = useRef(false)
  const { disp, scramble } = useScramble(title)

  const emit = useCallback(() => {
    const el = domRef.current; if (!el) return
    const sec = el.closest('section'); if (!sec) return
    const sr = sec.getBoundingClientRect(), er = el.getBoundingClientRect()
    const lx = er.left-sr.left, ty = er.top-sr.top, h = er.height
    onPortChange(id, {x:lx+er.width, y:ty+h/2}, {x:lx, y:ty+h/2})
  }, [id, onPortChange])

  useEffect(() => { emit() }, [pos, emit])
  useEffect(() => { const t = setTimeout(emit, 60); return () => clearTimeout(t) }, []) // eslint-disable-line

  const onMD = useCallback((e: React.MouseEvent) => {
    e.preventDefault(); onFocus(id)
    dOff.current = {x: e.clientX-pos.x, y: e.clientY-pos.y}; dragging.current = true
  }, [pos, id, onFocus])

  useEffect(() => {
    const move = (e: MouseEvent) => { if (!dragging.current) return; setPos({x:e.clientX-dOff.current.x, y:e.clientY-dOff.current.y}) }
    const up   = () => { dragging.current = false }
    window.addEventListener('mousemove', move); window.addEventListener('mouseup', up)
    return () => { window.removeEventListener('mousemove', move); window.removeEventListener('mouseup', up) }
  }, [])

  const outline = lit ? '1px solid #39ff14' : 'none'
  const shadow  = lit ? '0 0 14px rgba(57,255,20,0.35)' : 'none'

  return (
    <div ref={domRef} onMouseDown={() => onFocus(id)} style={{ position:'absolute', left:pos.x, top:pos.y, width, minHeight:minH, background:'#e8e8e8', border:'1px solid rgba(255,255,255,0.25)', outline, boxShadow:shadow, zIndex, display:'flex', flexDirection:'column', transition:'outline 0.3s,box-shadow 0.3s' }}>
      <div onMouseDown={onMD} style={{ display:'flex', alignItems:'center', gap:6, padding:'7px 12px', background:lit?'rgba(57,255,20,0.1)':'rgba(0,0,0,0.06)', borderBottom:lit?'1px solid rgba(57,255,20,0.25)':'1px solid rgba(0,0,0,0.12)', cursor:'grab', flexShrink:0, userSelect:'none' }}>
        <div style={{width:12, height:12, borderRadius:'50%', background:'#27ca40', flexShrink:0}}/>
        <div style={{width:12, height:12, borderRadius:'50%', background:'#ffbd2e', flexShrink:0}}/>
        <div style={{width:12, height:12, borderRadius:'50%', background:'#ff5f56', flexShrink:0}}/>
        <span onMouseEnter={scramble} style={{ marginLeft:6, color:lit?'#39ff14':'#111', fontSize:11, letterSpacing:'0.08em', textTransform:'uppercase', fontFamily:BORNA, flex:1, cursor:'grab', fontWeight:lit?700:600, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{disp}</span>
        {lit && <span style={{ width:8, height:8, borderRadius:'50%', background:'#39ff14', boxShadow:'0 0 8px #39ff14', display:'inline-block', animation:'aiBlink 0.8s infinite', flexShrink:0 }}/>}
      </div>
      <div style={{ flex:1 }}>{children}</div>
    </div>
  )
}

// ─── ExpandCard ───────────────────────────────────────────────────────────────
function ExpandCard({ text, tags, hint, lang }: { text: string; tags?: string[]; hint: string; lang: Lang }) {
  const [open, setOpen] = useState(false)
  const tS: React.CSSProperties = { background:'rgba(0,0,0,0.08)', border:'1px solid rgba(0,0,0,0.2)', color:'#000', fontSize:9, letterSpacing:'0.08em', textTransform:'uppercase', padding:'4px 9px', fontFamily:BORNA, display:'inline-block', fontWeight:600 }
  return (
    <div style={{ padding:'10px 12px', fontFamily:BORNA, fontSize:11, color:'#111', lineHeight:1.6, fontWeight:500 }}>
      {!open
        ? <div style={{ cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'space-between', gap:8 }} onClick={() => setOpen(true)}>
            <span style={{ opacity:0.7, fontSize:11, color:'#111', fontWeight:500, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis', flex:1 }}>{hint}</span>
            <span className="ai-open-btn" style={{ color:'#fff', background:'#000', fontSize:10, padding:'4px 10px', whiteSpace:'nowrap', letterSpacing:'0.1em', fontFamily:BORNA, fontWeight:700, flexShrink:0, display:'inline-block', cursor:'pointer' }}>
              [ {lang==='de'?'ÖFFNEN':'OPEN'} ]
            </span>
          </div>
        : <div>
            <div style={{ cursor:'pointer', color:'rgba(0,0,0,0.35)', fontSize:9, textAlign:'right', marginBottom:8 }} onClick={() => setOpen(false)}>▼ {lang==='de'?'SCHLIEẞEN':'CLOSE'}</div>
            <p style={{ margin:'0 0 12px' }}>{text}</p>
            {tags && <div style={{ display:'flex', flexWrap:'wrap', gap:5 }}>{tags.map((t,i) => <span key={i} style={tS}>{t}</span>)}</div>}
          </div>
      }
    </div>
  )
}

// ─── AISection ────────────────────────────────────────────────────────────────
export function AISection() {
  const { language } = useLanguage()
  const lang = language as Lang

  const outerRef   = useRef<HTMLDivElement>(null)
  const canvasRef  = useRef<HTMLCanvasElement>(null)
  const previewRef = useRef<HTMLDivElement>(null)
  const rafRef     = useRef(0)
  const curImgIdx  = useRef(0)
  const shuffledQueue = useRef<number[]>([])

  const [mounted,  setMounted]  = useState(false)
  const [exitP,    setExitP]    = useState(0)
  const [mobile,   setMobile]   = useState(false)
  const [isActive, setIsActive] = useState(false)
  const [phase,    setPhase]    = useState(0)
  const [ports,    setPorts]    = useState<PortMap>({})
  const [zOrders,  setZOrders]  = useState<Record<string,number>>(
    Object.fromEntries(['generate','prompt','erfahrung','vision','upscale','denoise','spinner','terminal','progress','preview'].map((id,i) => [id, 10+i]))
  )
  const [seed, setSeed] = useState(42667)
  const steps = 28

  useEffect(() => {
    setMounted(true)
    setMobile(window.innerWidth < 768)
    const c = () => setMobile(window.innerWidth < 768)
    window.addEventListener('resize', c)
    // Images already preloaded at module level – just trigger load of any not yet started
    if (AI_IMAGES.length === 0) {
      // SSR fallback: populate on client
      AI_SRCS.forEach((src, i) => { const img = new window.Image(); img.src = src; AI_IMAGES[i] = img })
    }
    return () => window.removeEventListener('resize', c)
  }, [])

  // Draw nikita-01.jpg as soon as canvas is ready
  useEffect(() => {
    if (!mounted) return
    const tryDraw = () => {
      const cv = canvasRef.current, pv = previewRef.current
      if (!cv || !pv || !pv.offsetWidth) return
      cv.width = pv.offsetWidth; cv.height = pv.offsetHeight
      const img = AI_IMAGES[0]
      if (img.complete && img.naturalWidth > 0) {
        drawToCanvas(cv, img, 1, 1)
      } else {
        ensureLoaded(img, AI_SRCS[0]).then(loaded => {
          const c2 = canvasRef.current, p2 = previewRef.current
          if (c2 && p2 && p2.offsetWidth) {
            c2.width = p2.offsetWidth; c2.height = p2.offsetHeight
            drawToCanvas(c2, loaded, 1, 1)
          }
        })
      }
    }
    const t1 = setTimeout(tryDraw, 80)
    const t2 = setTimeout(tryDraw, 400)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [mounted])

  useEffect(() => {
    const fn = () => {
      const el = outerRef.current; if (!el) return
      const vh = window.innerHeight, s = Math.max(0, -el.getBoundingClientRect().top)
      setExitP(Math.max(0, Math.min(1, (s-vh*0.6)/vh)))
    }
    window.addEventListener('scroll', fn, {passive:true}); fn()
    return () => window.removeEventListener('scroll', fn)
  }, [])

  const onPortChange = useCallback((id: string, out: Port, inp: Port) => {
    setPorts(p => {
      const prev = p[id]
      if (prev && Math.abs(prev.out.x-out.x)<1 && Math.abs(prev.out.y-out.y)<1 &&
                  Math.abs(prev.inp.x-inp.x)<1 && Math.abs(prev.inp.y-inp.y)<1) return p
      return {...p, [id]: {out, inp}}
    })
  }, [])

  const onFocus = useCallback((id: string) => {
    setZOrders(p => { const max = Math.max(...Object.values(p))+1; return {...p,[id]:max} })
  }, [])

  const generate = useCallback(() => {
    if (isActive) return
    // Pick random next image – refill shuffled queue when empty
    if (shuffledQueue.current.length === 0) {
      const indices = Array.from({length: AI_SRCS.length}, (_, i) => i)
        .filter(i => i !== curImgIdx.current)
      // Fisher-Yates shuffle
      for (let k = indices.length - 1; k > 0; k--) {
        const j = Math.floor(Math.random() * (k + 1));
        [indices[k], indices[j]] = [indices[j], indices[k]]
      }
      shuffledQueue.current = indices
    }
    const nextIdx = shuffledQueue.current.pop()!
    curImgIdx.current = nextIdx
    setSeed(Math.floor(Math.random() * 999999))
    setIsActive(true)
    setPhase(0)

    const TOTAL = 5000
    let t0: number | null = null
    let lastPhaseSet = 0

    // Init canvas immediately
    const cv = canvasRef.current, pv = previewRef.current
    if (cv && pv && pv.offsetWidth) {
      cv.width = pv.offsetWidth; cv.height = pv.offsetHeight
      const ctx = cv.getContext('2d')
      if (ctx) { ctx.fillStyle='#000'; ctx.fillRect(0,0,cv.width,cv.height) }
    }

    // Get the preloaded image element – always available at module level
    const img = AI_IMAGES[nextIdx]

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
          // Pixel dissolve: starts immediately with large blocks, clears as cable hits PREVIEW
          // Full 10s animation: first 85% = pixelated scramble, last 15% = dissolve to sharp
          // Pixel: chunky most of the time, only sharp in final 10% (last ~1s)
          // curve stays above ~2px until t=0.85, then drops fast to 1
          const tShift = Math.max(0, (0.96 - t) / 0.96)
          const pixelSize = Math.max(1, 40 * Math.pow(tShift, 1.4))
          // Opacity: linear
          const opacity = t
          // Only draw if image loaded, else keep black
          if (img.complete && img.naturalWidth > 0) {
            drawToCanvas(canvas, img, opacity, Math.max(1, pixelSize))
          }
        }
      }

      if (t < 1) {
        rafRef.current = requestAnimationFrame(tick)
      } else {
        // Final draw – if image still loading, set onload to draw when ready
        const cv2 = canvasRef.current, pv2 = previewRef.current
        if (cv2 && pv2) {
          cv2.width = pv2.offsetWidth||470; cv2.height = pv2.offsetHeight||470
          if (img.complete && img.naturalWidth > 0) {
            drawToCanvas(cv2, img, 1, 1)
          } else {
            img.onload = () => {
              const c = canvasRef.current, p = previewRef.current
              if (c && p) { c.width=p.offsetWidth||470; c.height=p.offsetHeight||470; drawToCanvas(c,img,1,1) }
            }
          }
        }
        setPhase(0); setIsActive(false)
      }
    }
    rafRef.current = requestAnimationFrame(tick)
  }, [isActive])

  const wLit = (seg: number) => isActive && phase >= seg / SEG_N

  if (!mounted) return (
    <div ref={outerRef} style={{ position:'relative', zIndex:3, height:'260vh' }}>
      <section id="ki" style={{ position:'sticky', top:0, backgroundColor:'#000', height:'100vh' }}/>
    </div>
  )

  const VW = window.innerWidth, VH = window.innerHeight

  // ── Mobile ────────────────────────────────────────────────────────────────
  if (mobile) return (
    <div ref={outerRef} style={{ position:'relative', zIndex:3, height:'auto', minHeight:'100vh' }}>
      <style>{`
        @keyframes aiBlink{0%,100%{opacity:1}50%{opacity:0.1}}
        @keyframes spin{0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}}
        @keyframes spinReverse{0%{transform:rotate(0deg)}100%{transform:rotate(-360deg)}}
        @font-face{font-family:'Borna';src:url('/fonts/Borna-Medium.woff2') format('woff2');font-weight:500;font-display:swap}
        @font-face{font-family:'Borna';src:url('/fonts/Borna-Bold.woff2') format('woff2');font-weight:700;font-display:swap}
        @font-face{font-family:'Borna';src:url('/fonts/Borna-SemiBold.woff2') format('woff2');font-weight:600;font-display:swap}
      `}</style>
      <section id="ki" style={{ backgroundColor:'#000', minHeight:'100vh', boxSizing:'border-box', padding:'0 0 40px' }}>
        <GridBg/>
        <div style={{ position:'relative', zIndex:3, padding:'20vw 5vw 5vw', display:'flex', flexDirection:'column', gap:16 }}>
          <NeonHeading/>
          <div ref={previewRef} style={{ width:'100%', aspectRatio:'1/1', position:'relative', overflow:'hidden', background:'#111', border:'1px solid rgba(255,255,255,0.2)' }}>
            <canvas ref={canvasRef} style={{ position:'absolute', inset:0, width:'100%', height:'100%', display:'block' }}/>
            <div style={{ position:'absolute', bottom:5, left:8, right:8, display:'flex', justifyContent:'space-between', color:'rgba(255,255,255,0.4)', fontSize:9, fontFamily:MONO, zIndex:4 }}>
              <span>{isActive ? '▓ LOADING...' : 'NIKITA AI'}</span>
              <span>SEED:{seed}</span>
            </div>
          </div>
          <button onClick={() => generate()} disabled={isActive}
            style={{ background:isActive?'rgba(0,0,0,0.1)':'#000', border:'2px solid #000', color:isActive?'rgba(0,0,0,0.3)':'#fff', padding:'16px', width:'100%', fontFamily:BORNA, fontSize:16, letterSpacing:'0.08em', cursor:isActive?'not-allowed':'pointer', animation:isActive?'aiBlink 0.75s infinite':'none', fontWeight:800 }}>
            {isActive ? '[ GENERATING ]' : '[ GENERATE ]'}
          </button>
          <div style={{ height:220, background:'#0d0d0d', border:'1px solid rgba(255,255,255,0.1)' }}>
            <ProgressTerm phase={phase} isActive={isActive}/>
          </div>
          <div style={{ background:'#e8e8e8', border:'1px solid rgba(255,255,255,0.15)' }}>
            <div style={{ padding:'8px 12px', background:'rgba(0,0,0,0.06)', borderBottom:'1px solid rgba(0,0,0,0.12)', fontFamily:BORNA, fontSize:11, fontWeight:600, letterSpacing:'0.08em', textTransform:'uppercase' }}>{lang==='de'?'ERFAHRUNG':'EXPERIENCE'}</div>
            <ExpandCard lang={lang} hint="ComfyUI · LoRA · Sora · Deepfakes..."
              text={lang==='de'?'Ich teste stets die neuesten Tools wie Sora oder Kling und baue daraus eigene lokale Workflows. Mit ComfyUI, N8N und gezieltem LoRA-Training erschaffe ich Bild und Video. Auch Deepfakes nutze ich vielseitig für neue Dimensionen der digitalen Inszenierung. Technik und Ästhetik verschmelzen hier zu meiner eigenen Sprache.':'I constantly test the latest tools like Sora and Kling, building my own local workflows. Using ComfyUI, N8N and targeted LoRA training, I create image and video. I also use deepfakes for new dimensions of digital staging. Technology and aesthetics merge into my own language.'}
              tags={['ComfyUI','LoRA-Training','N8N','Sora','Kling','Deepfakes','Python','Next.js']}/>
          </div>
          <div style={{ background:'#e8e8e8', border:'1px solid rgba(255,255,255,0.15)' }}>
            <div style={{ padding:'8px 12px', background:'rgba(0,0,0,0.06)', borderBottom:'1px solid rgba(0,0,0,0.12)', fontFamily:BORNA, fontSize:11, fontWeight:600, letterSpacing:'0.08em', textTransform:'uppercase' }}>VISION</div>
            <ExpandCard lang={lang} hint={lang==='de'?'KI als neues Medium...':'AI as a new medium...'}
              text={lang==='de'?'KI ist für mich kein bloßes Werkzeug, sondern ein neues Medium der Inspiration. Als Pionier der ersten Stunde nutze ich die generative Kraft, um meine künstlerische Ausdruckskraft zu schärfen und Visionen präziser greifbar zu machen. Es ist die Suche nach der perfekten Symbiose aus Mensch und Maschine.':'AI is not merely a tool for me, but a new medium of inspiration. As an early adopter, I use generative power to sharpen my artistic expression and make visions more precisely tangible. It is the search for the perfect symbiosis of human and machine.'}/>
          </div>
          <div style={{ height:240, background:'#0d0d0d', border:'1px solid rgba(57,255,20,0.2)' }}>
            <CrazyTerminal phase={phase} isActive={isActive} lang={lang}/>
          </div>
        </div>
      </section>
    </div>
  )

  // ── Desktop ───────────────────────────────────────────────────────────────
  const cs: React.CSSProperties = { padding:'10px 12px', color:'#111', fontSize:11, lineHeight:1.6, fontFamily:BORNA, fontWeight:500 }

  // Layout 1:1 from screenshot
  // ─── Fenster-Positionen ─────────────────────────────────────────────────────
  // Spalten (X-Achse): VW * 0.XX  → XX% der Bildschirmbreite von links
  // Zeilen  (Y-Achse): VH * 0.XX  → XX% der Bildschirmhöhe von oben
  // Wert +0.01 = ca. 14px weiter rechts/unten bei 1440×900px
  //
  const C1 = Math.round(VW * 0.106)   // GENERATE + HYPERPARAMETERS (ganz links)
  const C2 = Math.round(VW * 0.284)   // ERFAHRUNG + VISION
  const C3 = Math.round(VW * 0.540)   // UPSCALE + DENOISE
  const C4 = Math.round(VW * 0.489)   // TERMINAL
  const C5 = Math.round(VW * 0.784)   // PIPELINE STATUS

  const TERM_TOP   = Math.round(VH * 0.152)  // TERMINAL + PIPELINE (oben)
  const PROMPT_TOP = Math.round(VH * 0.462)  // HYPERPARAMETERS
  const GEN_TOP    = Math.round(VH * 0.571)  // GENERATE
  const ERF_TOP    = Math.round(VH * 0.429)  // ERFAHRUNG
  const VIS_TOP    = Math.round(VH * 0.549)  // VISION
  const UPS_TOP    = Math.round(VH * 0.330)  // UPSCALE
  const DEN_TOP    = Math.round(VH * 0.430)  // DENOISE
  const SPIN_TOP   = Math.round(VH * 0.152)  // POZESSOR
  const PREV_TOP   = Math.round(VH * 0.288)  // PREVIEW

  return (
    <div ref={outerRef} style={{ position:'relative', zIndex:3, height:'260vh' }}>
      <style>{`
        @keyframes aiBlink{0%,100%{opacity:1}50%{opacity:0.1}}
        @keyframes scanln{0%{top:-2px}100%{top:100%}}
        @keyframes spin{0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}}
        @keyframes spinReverse{0%{transform:rotate(0deg)}100%{transform:rotate(-360deg)}}
        @font-face{font-family:'Borna';src:url('/fonts/Borna-Medium.woff2') format('woff2'),url('/fonts/Borna-Medium.woff') format('woff');font-weight:500;font-display:swap}
        @font-face{font-family:'Borna';src:url('/fonts/Borna-Bold.woff2') format('woff2'),url('/fonts/Borna-Bold.woff') format('woff');font-weight:700;font-display:swap}
        @font-face{font-family:'Borna';src:url('/fonts/Borna-SemiBold.woff2') format('woff2'),url('/fonts/Borna-SemiBold.woff') format('woff');font-weight:600;font-display:swap}
        .ai-gen-btn:active{transform:scale(0.91)!important;transition:transform 0.07s}
        .ai-gen-btn:hover{transform:scale(0.96);transition:transform 0.12s}
        .ai-gen-btn-active{transform:none}
        .ai-open-btn:active{transform:scale(0.88)!important;transition:transform 0.07s}
        .ai-open-btn:hover{transform:scale(0.93);transition:transform 0.12s}
      `}</style>

      <section id="ki" style={{ position:'sticky', top:0, backgroundColor:'#000', overflow:'hidden', height:'100vh', boxSizing:'border-box' }}>
        <GridBg/>
        <CablesLayer ports={ports} phase={phase} isActive={isActive} exitP={exitP}/>

        <div style={{ position:'absolute', inset:0, zIndex:5, filter:exitP>0.05?`blur(${exitP*18}px)`:'none', opacity:1-exitP*0.9, transform:`scale(${1-exitP*0.04})`, transformOrigin:'center top', willChange:'filter,opacity,transform' }}>

          <div style={{ position:'absolute', top:'9vw', left:'9vw', zIndex:20, pointerEvents:'none' }}>
            <NeonHeading/>
          </div>

          {/* PROMPT NODE */}
          <Win id="prompt" title="LATENT SAMPLER" width={215} initPos={{x:C1, y:PROMPT_TOP}} onPortChange={onPortChange} onFocus={onFocus} zIndex={zOrders.prompt} lit={wLit(0)}>
            <div style={{...cs}}>
              <div>SEED: <b>{seed}</b></div>
              <div>CFG: <b>7.5</b> | STEPS: <b>{steps}</b></div>
            </div>
          </Win>

          {/* GENERATE */}
          <Win id="generate" title="GENERATE" width={210} initPos={{x:C1, y:GEN_TOP}} onPortChange={onPortChange} onFocus={onFocus} zIndex={zOrders.generate}>
            <div style={{ padding:'12px' }}>
<button
                onClick={() => generate()} disabled={isActive}
                className={isActive ? 'ai-gen-btn-active' : 'ai-gen-btn'}
                style={{ background:isActive?'rgba(0,0,0,0.06)':'#000', border:'2px solid #000', color:isActive?'rgba(0,0,0,0.3)':'#fff', padding:'14px 0', width:'100%', fontFamily:BORNA, fontSize:15, letterSpacing:'0.08em', cursor:isActive?'not-allowed':'pointer', animation:isActive?'aiBlink 0.75s infinite':'none', fontWeight:800, textTransform:'uppercase' }}>
                {isActive ? '[ GENERATING ]' : '[ GENERATE ]'}
              </button>
            </div>
          </Win>

          {/* ERFAHRUNG */}
          <Win id="erfahrung" title={lang==='de'?'ERFAHRUNG':'EXPERIENCE'} width={265} initPos={{x:C2, y:ERF_TOP}} onPortChange={onPortChange} onFocus={onFocus} zIndex={zOrders.erfahrung} lit={wLit(1)}>
            <ExpandCard lang={lang} hint="ComfyUI · LoRA · Sora · Deepfakes..."
              text={lang==='de'?'Ich teste stets die neuesten Tools wie Sora oder Kling und baue daraus eigene lokale Workflows. Mit ComfyUI, N8N und gezieltem LoRA-Training erschaffe ich Bild und Video. Auch Deepfakes nutze ich vielseitig für neue Dimensionen der digitalen Inszenierung. Technik und Ästhetik verschmelzen hier zu meiner eigenen Sprache.':'I constantly test the latest tools like Sora and Kling, building my own local workflows. Using ComfyUI, N8N and targeted LoRA training, I create image and video. I also use deepfakes for new dimensions of digital staging. Technology and aesthetics merge into my own language.'}
              tags={['ComfyUI','LoRA-Training','N8N','Sora','Kling','Deepfakes','Python','Next.js','Automatisierung','Postproduktion']}/>
          </Win>

          {/* VISION */}
          <Win id="vision" title="VISION" width={250} initPos={{x:C2, y:VIS_TOP}} onPortChange={onPortChange} onFocus={onFocus} zIndex={zOrders.vision} lit={wLit(1)}>
            <ExpandCard lang={lang} hint={lang==='de'?'KI als neues Medium...':'AI as a new medium...'}
              text={lang==='de'?'KI ist für mich kein bloßes Werkzeug, sondern ein neues Medium der Inspiration. Als Pionier der ersten Stunde nutze ich die generative Kraft, um meine künstlerische Ausdruckskraft zu schärfen und Visionen präziser greifbar zu machen. Es ist die Suche nach der perfekten Symbiose aus Mensch und Maschine.':'AI is not merely a tool for me, but a new medium of inspiration. As an early adopter, I use generative power to sharpen my artistic expression and make visions more precisely tangible. It is the search for the perfect symbiosis of human and machine.'}/>
          </Win>

          {/* UPSCALE */}
          <Win id="upscale" title="UPSCALE 4x" width={160} initPos={{x:C3, y:UPS_TOP}} onPortChange={onPortChange} onFocus={onFocus} zIndex={zOrders.upscale} lit={wLit(2)}>
            <div style={{...cs}}>
              <div style={{whiteSpace:'nowrap'}}>REALESRGAN v3.2</div>
            </div>
          </Win>

          {/* DENOISE */}
          <Win id="denoise" title="DENOISE" width={160} initPos={{x:C3, y:DEN_TOP}} onPortChange={onPortChange} onFocus={onFocus} zIndex={zOrders.denoise} lit={wLit(3)}>
            <div style={{...cs}}>
              <div style={{whiteSpace:'nowrap'}}>DPM++ · σ=0.{isActive?Math.round(phase*99).toString().padStart(2,'0'):'00'}</div>
            </div>
          </Win>

          {/* SPINNER */}
          <Win id="spinner" title="POZESSOR" width={165} initPos={{x:Math.round(VW*0.740), y:SPIN_TOP}} onPortChange={onPortChange} onFocus={onFocus} zIndex={zOrders.spinner} lit={wLit(3)}>
            <SpinnerContent isActive={isActive&&wLit(3)} phase={phase}/>
          </Win>

          {/* TERMINAL */}
          <Win id="terminal" title="TERMINAL" width={430} initPos={{x:C4, y:TERM_TOP}} onPortChange={onPortChange} onFocus={onFocus} zIndex={zOrders.terminal} lit={wLit(4)} minH={295}>
            <div style={{ height:283, background:'#0d0d0d' }}>
              <CrazyTerminal phase={phase} isActive={isActive} lang={lang}/>
            </div>
          </Win>

          {/* PROGRESS */}
          <Win id="progress" title="PIPELINE STATUS" width={255} initPos={{x:C5, y:TERM_TOP}} onPortChange={onPortChange} onFocus={onFocus} zIndex={zOrders.progress} lit={wLit(5)} minH={255}>
            <div style={{ height:243, background:'#0d0d0d' }}>
              <ProgressTerm phase={phase} isActive={isActive}/>
            </div>
          </Win>

          {/* PREVIEW */}
          <Win id="preview" title="PREVIEW" width={470} initPos={{x:Math.round(VW*0.644), y:PREV_TOP}} onPortChange={onPortChange} onFocus={onFocus} zIndex={zOrders.preview} lit={wLit(6)}>
            <div ref={previewRef} style={{ width:'100%', aspectRatio:'1/1', position:'relative', overflow:'hidden', background:'#111' }}>
              <canvas ref={canvasRef} style={{ position:'absolute', inset:0, width:'100%', height:'100%', display:'block' }}/>
              <div style={{ position:'absolute', inset:0, pointerEvents:'none', backgroundImage:'repeating-linear-gradient(0deg,rgba(0,0,0,0.07) 0px,rgba(0,0,0,0.07) 1px,transparent 1px,transparent 3px)', zIndex:2 }}/>
              {([{top:6,left:6},{top:6,right:6},{bottom:6,left:6},{bottom:6,right:6}] as const).map((s,i) => (
                <div key={i} style={{ position:'absolute', ...s, width:14, height:14,
                  borderTop:   i<2  ? '2px solid rgba(57,255,20,0.6)' : 'none',
                  borderBottom:i>=2 ? '2px solid rgba(57,255,20,0.6)' : 'none',
                  borderLeft:  i%2===0 ? '2px solid rgba(57,255,20,0.6)' : 'none',
                  borderRight: i%2===1 ? '2px solid rgba(57,255,20,0.6)' : 'none',
                  zIndex:3 }}/>
              ))}
              <div style={{ position:'absolute', bottom:6, left:10, right:10, display:'flex', justifyContent:'space-between', color:'rgba(255,255,255,0.4)', fontSize:9, fontFamily:MONO, zIndex:4 }}>
                <span>{isActive ? '▓ ДЕКОДИРОВАНИЕ...' : 'NIKITA AI — COMFYUI v3'}</span>
                <span>SEED:{seed}</span>
              </div>
            </div>
          </Win>

        </div>
      </section>
    </div>
  )
}