'use client'
import { useRef, useEffect, useState, useCallback } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'
import { useMobile } from '@/hooks/use-mobile'
import { useScroll } from '@/contexts/ScrollContext'
import { useScramble } from '@/hooks/use-scramble'

type Lang = 'de' | 'en'
type Port = { x: number; y: number }
type PortMap = Record<string, { out: Port; inp: Port; inpAlt?: Port }>
const FORMAT_OPTIONS = ['1:1','16:9','3:4'] as const
type OutputFormat = typeof FORMAT_OPTIONS[number]
const OUTPUT_MODE_OPTIONS = ['UPSCALE','OUTPAINT','VIDEO'] as const
type OutputMode = typeof OUTPUT_MODE_OPTIONS[number]
type AICursorMode = 'normal' | 'normalClick' | 'finger' | 'click' | 'hand' | 'fist'
type AICursorEvent = React.MouseEvent<HTMLElement> | React.PointerEvent<HTMLElement>
const OUTPUT_MODE_LABELS: Record<OutputMode, string> = {
  UPSCALE: 'UPSCALE',
  OUTPAINT: 'OUTPAINTING',
  VIDEO: 'VIDEO',
}

const BORNA = "'Borna','Helvetica Neue',Arial,sans-serif"
const MONO  = '"Courier New",monospace'
const NODE_Z_BASE = 5
const NODE_Z_CONTROL = 17
const NODE_Z_CONTROL_LOW = 16
const NODE_Z_CLICK = 30
const NODE_Z_EXPANDED = 19
const AI_HEADING_Z = 1000
const AI_NODE_REFERENCE_W = 1183
const AI_NODE_REFERENCE_H = 768
const INITIAL_AI_Z_ORDERS: Record<string, number> = {
  generate: 5,
  prompt: 6,
  erfahrung: 7,
  vision: 8,
  modes: 15,
  preview: 16,
  upscale: 19,
  terminal: 14,
  progress: 12,
}
const OUTPAINT_EXIT_MS = 300
const OUTPAINT_GROW_MS = 520
const VIDEO_LOAD_SIM_MS = 850
const IMAGE_MODE_LOAD_SIM_MS = 420
const GENERATION_SIM_MS = 3000
const MIN_OUTPUT_PIXEL_SIZE = 2
const VIDEO_PIXEL_DECAY_POWER = 2.7
const CRT_GREEN = '#b7ff9c'
const CRT_GREEN_SOFT = 'rgba(183,255,156,0.62)'
const CRT_GREEN_DIM = 'rgba(117,255,96,0.38)'
const CRT_GLOW = '0 0 5px rgba(215,255,190,0.9),0 0 14px rgba(57,255,20,0.62)'
const CRT_BOX_GLOW = `0 0 5px rgba(215,255,190,0.72),0 0 18px rgba(57,255,20,0.46),0 0 36px rgba(57,255,20,0.2)`
const CRT_DROP_GLOW = 'drop-shadow(0 0 5px rgba(215,255,190,0.72)) drop-shadow(0 0 18px rgba(57,255,20,0.46)) drop-shadow(0 0 36px rgba(57,255,20,0.2))'
const AI_CURSOR_NORMAL = 'none'
const AI_CURSOR_OPEN = 'none'
const AI_CURSOR_FIST = 'none'
const AI_CURSOR_VERSION = '20260801-hand-reload-2'
const AI_CURSOR_ASSETS = ['/icons/pixelmaus-maus.png', '/icons/pixelmaus-maus1.png', '/icons/pixelmaus-finger.png', '/icons/pixelmaus-finger1.png', '/icons/pixelmaus-hand.png', '/icons/pixelmaus-fist.png'].map((src) => `${src}?v=${AI_CURSOR_VERSION}`) as readonly string[]
const AI_CURSOR_SRC: Record<AICursorMode, string> = {
  normal: `/icons/pixelmaus-maus.png?v=${AI_CURSOR_VERSION}`,
  normalClick: `/icons/pixelmaus-maus1.png?v=${AI_CURSOR_VERSION}`,
  finger: `/icons/pixelmaus-finger.png?v=${AI_CURSOR_VERSION}`,
  click: `/icons/pixelmaus-finger1.png?v=${AI_CURSOR_VERSION}`,
  hand: `/icons/pixelmaus-hand.png?v=${AI_CURSOR_VERSION}`,
  fist: `/icons/pixelmaus-fist.png?v=${AI_CURSOR_VERSION}`,
}
const AI_CURSOR_SIZE: Record<AICursorMode, { width: number; height: number }> = {
  normal: { width: 64, height: 80 },
  normalClick: { width: 64, height: 80 },
  finger: { width: 64, height: 80 },
  click: { width: 64, height: 80 },
  hand: { width: 64, height: 80 },
  fist: { width: 64, height: 80 },
}
const AI_CURSOR_HOTSPOT: Record<AICursorMode, { x: number; y: number }> = {
  normal: { x: 3, y: 80 },
  normalClick: { x: 3, y: 80 },
  finger: { x: 10, y: 80 },
  click: { x: 10, y: 80 },
  hand: { x: 10, y: 80 },
  fist: { x: 10, y: 80 },
}
const AI_CURSOR_RENDER_SCALE = 0.375
const AI_CURSOR_RENDER_OFFSET_Y = 22

if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  AI_CURSOR_ASSETS.forEach((href) => {
    const existingPreload = document.querySelector(`link[rel="preload"][as="image"][href="${href}"]`)
    if (!existingPreload) {
      const link = document.createElement('link')
      link.rel = 'preload'
      link.as = 'image'
      link.href = href
      link.setAttribute('fetchpriority', 'high')
      document.head.appendChild(link)
    }

    const img = new window.Image()
    img.fetchPriority = 'high'
    img.src = href
  })
}

// ─── Neon Heading ─────────────────────────────────────────────────────────────
function NeonHeading({ showCopy = true }: { showCopy?: boolean }) {
  const { isMobile } = useMobile()
  const { language } = useLanguage()
  const [flickerLevels, setFlickerLevels] = useState<Record<string, number>>({})
  const { disp: d1, scramble: s1 } = useScramble('ARTISTIC')
  const { disp: d2, scramble: s2 } = useScramble('INTELLIGENCE')
  const headingCopy = language === 'de'
    ? 'Ich sehe KI nicht als Ersatz für Gestaltung, sondern als kreatives Betriebssystem: ein Werkzeug, um Ideen schneller zu testen, Bildwelten präziser zu steuern und aus Experimenten markentaugliche Kommunikation zu formen.'
    : 'I see AI not as a replacement for design, but as a creative operating system: a way to test ideas faster, direct visual worlds more precisely\nand turn experiments into\nbrand-ready communication.'
  const { disp: copyDisp, scramble: copyScramble } = useScramble(headingCopy)
  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = []
    const makeKeys = () => {
      const line = Math.random() > 0.42 ? 'b' : 'a'
      const length = line === 'a' ? 'ARTISTIC'.length : 'INTELLIGENCE'.length
      const mode = Math.random()
      if (mode < 0.48) return [`${line}-${Math.floor(Math.random() * length)}`]
      if (mode < 0.78) {
        const start = Math.floor(Math.random() * Math.max(1, length - 2))
        return Array.from({ length: 2 + Math.floor(Math.random() * 3) }, (_, index) => `${line}-${Math.min(length - 1, start + index)}`)
      }
      return Array.from({ length: 2 + Math.floor(Math.random() * 4) }, () => `${line}-${Math.floor(Math.random() * length)}`)
    }
    const pulse = (keys: string[], hold = 34 + Math.random() * 58) => {
      const level = Math.random() < 0.42 ? 0.05 + Math.random() * 0.18 : 0.22 + Math.random() * 0.5
      setFlickerLevels(Object.fromEntries(keys.map(key => [key, level])))
      timers.push(setTimeout(() => setFlickerLevels({}), hold))
    }
    const schedule = () => {
      const wait = 650 + Math.random() * 2600
      timers.push(setTimeout(() => {
        const baseKeys = makeKeys()
        const sequence = Math.random()
        const steps = sequence < 0.38
          ? [0, 54, 112, 330 + Math.random() * 120]
          : sequence < 0.72
            ? [0, 38, 82, 145, 410 + Math.random() * 170, 488 + Math.random() * 210]
            : [0, 27, 68, 118, 190, 520 + Math.random() * 220]
        steps.forEach((delay, stepIndex) => {
          timers.push(setTimeout(() => {
            const reuseBase = stepIndex < 3 || Math.random() < 0.58
            const keys = reuseBase ? baseKeys : makeKeys()
            pulse(keys, stepIndex > 2 ? 24 + Math.random() * 48 : 26 + Math.random() * 76)
          }, delay))
        })
        if (Math.random() < 0.34) {
          timers.push(setTimeout(() => pulse([...baseKeys, ...makeKeys()].slice(0, 5), 18 + Math.random() * 34), 740 + Math.random() * 260))
        }
        timers.push(setTimeout(schedule, 980 + Math.random() * 3200))
      }, wait))
    }
    schedule()
    return () => timers.forEach(clearTimeout)
  }, [])
  const glow = '0 0 7px #fff,0 0 18px #fff,0 0 40px rgba(255,255,255,0.5)'
  const dimGlow = '0 0 2px rgba(255,255,255,0.55),0 0 8px rgba(255,255,255,0.18)'
  const renderFlickerText = (text: string, line: 'a' | 'b') => Array.from(text).map((char, index) => {
    const opacity = flickerLevels[`${line}-${index}`] ?? 1
    return (
      <span key={`${line}-${index}-${char}`} style={{ display:'inline-block', opacity, textShadow:opacity < 0.96 ? dimGlow : glow, transition:'opacity 34ms linear,text-shadow 34ms linear' }}>
        {char === ' ' ? '\u00A0' : char}
      </span>
    )
  })
  return (
    <div onMouseEnter={() => { s1(); s2(); if (showCopy) copyScramble() }} style={{ cursor:'default', userSelect:'none' }}>
      <div style={{ fontSize: isMobile ? 'var(--mobile-heading-size)' : '8vw', fontWeight:900, lineHeight:0.88, letterSpacing:'-2px', textTransform:'uppercase', color:'#fff', textShadow:glow, fontFamily:BORNA }}>
        <div>{renderFlickerText(d1, 'a')}</div><div style={{ display:'inline-block', transform:`scaleX(${isMobile ? 0.94 : 0.9})`, transformOrigin:'left center' }}>{renderFlickerText(d2, 'b')}</div>
      </div>
      {showCopy && <div style={{ margin:isMobile?'14px 0 0':'8px 0 0', maxWidth:isMobile?'64vw':470, color:'rgba(255,255,255,0.8)', fontFamily:BORNA, fontSize:isMobile?13:15, lineHeight:1.45, fontWeight:500, letterSpacing:0, textShadow:'0 0 4px rgba(255,255,255,0.75),0 0 14px rgba(255,255,255,0.28),0 0 28px rgba(0,0,0,0.16),0 0 20px rgba(0,0,0,0.9)' }}>
        {copyDisp.split('\n').map((line, i) => <div key={i}>{line}</div>)}
      </div>}
    </div>
  )
}

// ─── Grid BG ──────────────────────────────────────────────────────────────────
function GridBg() {
  return (
    <div style={{ position:'absolute', inset:0, zIndex:1, pointerEvents:'none', overflow:'hidden' }}>
      <div style={{ position:'absolute', inset:0, backgroundImage:'linear-gradient(rgba(255,255,255,0.085) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.085) 1px,transparent 1px)', backgroundSize:'48px 48px' }}/>
      <div style={{ position:'absolute', left:0, right:0, height:1, background:'rgba(255,255,255,0.085)', animation:'scanln 12s linear infinite' }}/>
      <div style={{ position:'absolute', inset:0, background:'radial-gradient(ellipse at center, transparent 45%, rgba(0,0,0,0.36) 74%, rgba(0,0,0,0.78) 100%)' }}/>
    </div>
  )
}

// ─── Crazy Terminal ───────────────────────────────────────────────────────────
type TerminalLine = { t: 'c' | 'm' | 'r'; c: string }

const AI_PROMPTS = [
  'realistic macro still life of a human eye embedded in wet moss, dark soil and small white daisies on a flat saturated blue studio backdrop, hard direct flash, glossy eyelid texture, sharp iris catchlight, visible pores, 100mm macro lens, centered editorial product-surreal composition, green CRT edge-map pass and botanical mask locked in the render pipeline',
  'realistic front-facing Hansaplast retail box with HateAid cooperation visible on a clean blue studio surface, softbox from upper left, controlled commercial reflections, readable cardboard packaging text, centered 70mm product lens, crisp edges, OCR region locked and label contrast checked through the green terminal pipeline',
  'white BMW SUV driving at night on a curved coastal mountain road beside a dark lake and distant city lights, headlights cutting across wet asphalt lane lines, stormy black mountain silhouette, low-key automotive campaign lighting, tracking-rig perspective, road spline tracked and headlight bloom clamped by the render system',
  'dense full-frame pile of colorful realistic frogs with wet skin and glossy black eyes, humid terrarium flash, natural brown and green gaps, macro documentary realism, close focus stack with crowded texture, instance masks per frog, color clusters indexed and eye highlights preserved by the green computer analysis pass',
  'young monkey in a Russian-style astronaut suit sitting on a realistic moon surface with large Earth rising behind it, black star field, rocky lunar foreground, hard space sunlight, helmet reflection, long lunar shadow, low angle 35mm space documentary frame, helmet glass refraction solved and suit seams tracked',
  'white BMW performance sedan driving on a sunny Pacific coastal highway with ocean coastline, palm trees, modern glass villa and hazy mountains, golden hour sunlight, realistic road motion blur, clean automotive reflections, low rear three-quarter chase camera, vehicle mask pinned and road motion vectors stabilized',
]

const CRT_DIAGNOSTIC_SALT = { sus:'screen_unit_signal', max:69, frog:420, checksum:539 } as const

const CRAZY_BASE: TerminalLine[] = [
  {t:'c', c:'#!/usr/bin/env python3'},
  {t:'c', c:'import torch, diffusers, comfyui_core as cf'},
  {t:'c', c:'from lora_injector import LoRAStack, merge_weights'},
  {t:'m', c:'ЗАГРУЗКА СИСТЕМЫ :: СТАРЫЙ ЭКРАН ВКЛЮЧЕН [OK]'},
  {t:'r', c:'НЕЙРОСЕТЬ v4.2 :: инициализация матрицы весов [OK]'},
  {t:'c', c:'pipe = cf.StableDiffusionXLPipeline.from_pretrained('},
  {t:'c', c:'    "stabilityai/sdxl-base-1.0", torch_dtype=torch.float16'},
  {t:'c', c:').to("cuda")  # VRAM: 16.2 GB / 24.0 GB'},
  {t:'m', c:'ПАМЯТЬ :: LoRA_INJECT rank=64 alpha=16 :: СЛИТО В МОДЕЛЬ'},
  {t:'r', c:'ВНИМАНИЕ: аномальный градиент 0xDEAD → [ИГНОРИРУЮ]'},
  {t:'c', c:'lora = LoRAStack(rank=64, alpha=16, dropout=0.05)'},
  {t:'c', c:'lora.inject(pipe.unet, layers=["attn1","attn2","ff"])'},
  {t:'r', c:'BRAND_CONTEXT :: semantic layer active [OK]'},
]

function buildCompletedWorkflowLog(prompt: string, imageIndex: number, lang: Lang): TerminalLine[] {
  const diagnosticOffset = (CRT_DIAGNOSTIC_SALT.sus.length + CRT_DIAGNOSTIC_SALT.max + CRT_DIAGNOSTIC_SALT.frog + CRT_DIAGNOSTIC_SALT.checksum) % 97
  const seed = 240193 + imageIndex * 7919 + diagnosticOffset
  const promptHash = `0x${(0x9f3a21 + imageIndex * 0x31f2).toString(16).toUpperCase()}`
  return [
    {t:'m', c:'ЭКРАН ГОТОВ :: ФИНАЛЬНЫЙ БУФЕР УДЕРЖИВАЕТСЯ'},
    {t:'r', c:`PROMPT_PACKET LOCKED :: ${promptHash} :: CFG=6.8 SEED=${seed}`},
    ...buildPromptBlock(prompt),
    {t:'c', c:'negative_prompt = "lowres, watermark, smeared typography, plastic skin, weak composition"'},
    {t:'m', c:lang === 'de' ? 'РУССКИЙ ТЕРМИНАЛ :: PROMPT LESBAR :: LICHTPUNKTE STABIL' : 'РУССКИЙ ТЕРМИНАЛ :: PROMPT READABLE :: LIGHT POINTS STABLE'},
    {t:'r', c:'СИСТЕМА ОЖИДАЕТ :: OUTPUT READY :: CURSOR HOLD'},
  ]
}

function buildPromptBlock(prompt: string): TerminalLine[] {
  return [
    {t:'c', c:`prompt = ${JSON.stringify(prompt)}`},
  ]
}

function buildWorkflowLog(prompt: string, imageIndex: number, lang: Lang): TerminalLine[] {
  const diagnosticOffset = (CRT_DIAGNOSTIC_SALT.sus.length + CRT_DIAGNOSTIC_SALT.max + CRT_DIAGNOSTIC_SALT.frog + CRT_DIAGNOSTIC_SALT.checksum) % 97
  const seed = 240193 + imageIndex * 7919 + diagnosticOffset
  const promptHash = `0x${(0x9f3a21 + imageIndex * 0x31f2).toString(16).toUpperCase()}`
  return [
    ...CRAZY_BASE,
    ...buildPromptBlock(prompt),
    {t:'c', c:'negative_prompt = "lowres, watermark, smeared typography, plastic skin, weak composition"'},
    {t:'r', c:`PROMPT_PACKET :: ${promptHash} :: CLIP_TOKENS=${126 + imageIndex * 3 + diagnosticOffset % 9} CFG=6.8 SEED=${seed}`},
    {t:'m', c:lang === 'de' ? 'ВВОД ПРОМПТА :: DE_BRAND_TONE + VISUAL_SYSTEM + OUTPUT_CONSTRAINTS' : 'ВВОД ПРОМПТА :: EN_BRAND_TONE + VISUAL_SYSTEM + OUTPUT_CONSTRAINTS'},
    {t:'c', c:'z = pipe.vae.encode(img).latent_dist.sample()*0.18215'},
    {t:'m', c:'ВЕКТОР ЗРЕНИЯ :: CLIP -> z[4,64,64] :: ШУМ СТАБИЛИЗИРОВАН'},
    {t:'c', c:'scheduler = DPMSolverMultistepScheduler(num_steps=28)'},
    {t:'c', c:'for t in scheduler.timesteps:  # step 0/28 → 28/28'},
    {t:'c', c:'    noise_pred = pipe.unet(z_t, t, enc_hidden)'},
    {t:'c', c:'    z_t = scheduler.step(noise_pred, t, z_t).prev'},
    {t:'r', c:'OUTPUT_MODE pass 27/28 :: final iteration [DONE]'},
    {t:'m', c:'МАСШТАБИРОВАНИЕ :: TILE[512x512] x4 :: КОНТУР УСИЛЕН'},
    {t:'c', c:'image = pipe.vae.decode(z_t/0.18215).sample.clamp(-1,1)'},
    {t:'r', c:'ГЕНЕРАЦИЯ ЗАВЕРШЕНА :: 4.97s :: ПЕРЕДАЧА В PREVIEW'},
    {t:'c', c:'image.save(f"/preview/NIKITA_result.png", quality=100)'},
    {t:'m', c:'СИСТЕМА НОМИНАЛЬНА :: ЗЕЛЕНЫЙ ЭКРАН :: ALL_CLEAR [OK]'},
    ...buildCompletedWorkflowLog(prompt, imageIndex, lang),
  ]
}

function typeTerminalLines(lines: TerminalLine[], charBudget: number): TerminalLine[] {
  const typed: TerminalLine[] = []
  let remaining = Math.max(0, charBudget)
  for (const line of lines) {
    const cost = line.c.length + 1
    if (remaining >= cost) {
      typed.push(line)
      remaining -= cost
      continue
    }
    typed.push({ ...line, c: `${line.c.slice(0, remaining)}█` })
    break
  }
  return typed
}

function buildActiveWorkflowLog(prompt: string, imageIndex: number, lang: Lang, phase: number): TerminalLine[] {
  const workflowLog = buildWorkflowLog(prompt, imageIndex, lang)
  const promptStart = workflowLog.findIndex(line => line.c.startsWith('prompt ='))
  const promptEnd = promptStart
  if (promptStart < 0 || promptEnd < 0) return workflowLog.slice(0, Math.max(1, Math.ceil(workflowLog.length * phase)))

  const bootLines = workflowLog.slice(0, promptStart)
  const promptLines = workflowLog.slice(promptStart, promptEnd + 1)
  const pythonLines = workflowLog.slice(promptEnd + 1)
  const executeLine: TerminalLine = {t:'c', c:'graph.submit(prompt_packet, sampler="dpmpp_2m", enter=True)'}
  const bootEnd = 0.18
  const promptEndPhase = 0.54
  const executeEnd = 0.6

  if (phase < bootEnd) {
    const bootCount = Math.max(1, Math.ceil((phase / bootEnd) * bootLines.length))
    return bootLines.slice(0, bootCount)
  }

  if (phase < promptEndPhase) {
    const progress = (phase - bootEnd) / (promptEndPhase - bootEnd)
    const promptChars = promptLines.reduce((sum, line) => sum + line.c.length + 1, 0)
    return [...bootLines, ...typeTerminalLines(promptLines, Math.floor(promptChars * progress))]
  }

  if (phase < executeEnd) {
    const progress = (phase - promptEndPhase) / (executeEnd - promptEndPhase)
    return [...bootLines, ...promptLines, ...typeTerminalLines([executeLine], Math.floor(executeLine.c.length * progress))]
  }

  const pythonProgress = (phase - executeEnd) / (1 - executeEnd)
  const pythonCount = Math.max(1, Math.ceil(pythonLines.length * pythonProgress))
  return [...bootLines, ...promptLines, executeLine, ...pythonLines.slice(0, pythonCount)]
}

function CrazyTerminal({ phase, isActive, lang, prompt, imageIndex }: { phase: number; isActive: boolean; lang: Lang; prompt: string; imageIndex: number }) {
  const [lines, setLines] = useState(() => buildCompletedWorkflowLog(prompt, imageIndex, lang))
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!isActive) {
      setLines(buildCompletedWorkflowLog(prompt, imageIndex, lang))
      return
    }
    const frame = requestAnimationFrame(() => setLines(buildActiveWorkflowLog(prompt, imageIndex, lang, phase)))
    return () => cancelAnimationFrame(frame)
  }, [imageIndex, isActive, lang, phase, prompt])
  const col = (t: string) => t==='m' ? 'rgba(132,255,120,0.9)' : t==='r' ? 'rgba(205,255,174,0.98)' : 'rgba(68,255,92,0.86)'
  return (
    <div style={{ position:'relative', background:'#010a03', backgroundImage:'radial-gradient(circle at 18% 22%,rgba(161,255,135,0.14),transparent 28%),linear-gradient(rgba(57,255,20,0.055) 50%,rgba(0,0,0,0.12) 50%)', backgroundSize:'100% 100%,100% 4px', boxShadow:'inset 0 0 18px rgba(57,255,20,0.2),inset 0 0 44px rgba(57,255,20,0.09)', fontFamily:MONO, fontSize:10, height:'100%', display:'flex', flexDirection:'column', overflow:'hidden' }}>
      <div style={{ position:'absolute', inset:0, pointerEvents:'none', background:'linear-gradient(90deg,rgba(255,255,255,0.02),transparent 8%,transparent 92%,rgba(255,255,255,0.025))', opacity:0.72 }}/>
      <div ref={ref} style={{ position:'relative', zIndex:1, padding:'8px 11px', flex:1, overflow:'hidden', display:'flex', flexDirection:'column', justifyContent:isActive?'flex-end':'flex-start', gap:2 }}>
        {lines.map((l,i) => {
          const isPromptLine = l.c.startsWith('prompt =')
          return <div key={i} style={{ color:col(l.t), whiteSpace:'pre-wrap', wordBreak:'break-word', lineHeight:1.42, textShadow:isPromptLine?'0 0 4px rgba(220,255,190,0.95),0 0 12px rgba(57,255,20,0.65)':'0 0 4px rgba(57,255,20,0.58)', opacity:isPromptLine?1:0.92, fontWeight:isPromptLine?700:400 }}>{l.c}</div>
        })}
        {!isActive && <div style={{ position:'absolute', left:11, bottom:8, color:'rgba(156,255,124,0.6)', textShadow:'0 0 8px rgba(57,255,20,0.8)', animation:'aiBlink 1.2s infinite' }}>█</div>}
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
    <div style={{ position:'relative', background:'#010a03', backgroundImage:'linear-gradient(rgba(57,255,20,0.06) 50%,rgba(0,0,0,0.12) 50%)', backgroundSize:'100% 4px', boxShadow:'inset 0 0 13px rgba(57,255,20,0.18)', fontFamily:MONO, fontSize:10, height:'100%', display:'flex', alignItems:'center', overflow:'hidden' }}>
      <div style={{ padding:'8px 10px', width:'100%', position:'relative', zIndex:1 }}>
        <div style={{ color:isActive?CRT_GREEN:CRT_GREEN_SOFT, fontSize:12, background:'rgba(0,18,3,0.86)', padding:'4px 7px', whiteSpace:'nowrap', textShadow:isActive?CRT_GLOW:`0 0 5px ${CRT_GREEN_DIM}`, boxShadow:'inset 0 0 10px rgba(57,255,20,0.16)' }}>[{bar}] {pct}%</div>
      </div>
    </div>
  )
}

function ModeLoadingIndicator() {
  return (
    <div data-ai-mode-loading style={{ position:'absolute', left:'50%', top:'50%', transform:'translate(-50%,-50%)', width:40, height:40, display:'flex', alignItems:'center', justifyContent:'center', filter:'drop-shadow(0 1px 6px rgba(0,0,0,0.82))', zIndex:3 }}>
      <div style={{ width:34, height:34, borderRadius:'50%', border:'4px solid rgba(255,255,255,0.28)', borderTopColor:'#fff', animation:'spin 0.82s linear infinite' }}/>
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
  '/ai-images/ai-06.jpg',
 
]
const AI_VIDEO_SRCS: Array<string | null> = [
  '/ai-images/ai-01.mp4',
  '/ai-images/ai-02.mp4',
  '/ai-images/ai-03.mp4',
  '/ai-images/ai-04.mp4',
  '/ai-images/ai-05.mp4',
  '/ai-images/ai-06.mp4',
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

function drawVideoToCanvas(cv: HTMLCanvasElement, video: HTMLVideoElement, px: number) {
  const w = cv.width, h = cv.height
  if (!w || !h || !video.videoWidth) return
  const ctx = cv.getContext('2d'); if (!ctx) return
  ctx.fillStyle = '#000'; ctx.fillRect(0, 0, w, h)
  const va = video.videoWidth / video.videoHeight, ca = w / h
  let dw = w, dh = h, dx = 0, dy = 0
  if (va > ca) { dw = h * va; dx = (w - dw) / 2 } else { dh = w / va; dy = (h - dh) / 2 }
  const p = Math.max(1, px)
  if (p <= 1.02) { ctx.imageSmoothingEnabled = true; ctx.drawImage(video, dx, dy, dw, dh) }
  else {
    const pw = Math.max(1, Math.floor(dw/p)), ph = Math.max(1, Math.floor(dh/p))
    const tmp = document.createElement('canvas'); tmp.width = pw; tmp.height = ph
    const tc = tmp.getContext('2d')!; tc.imageSmoothingEnabled = true; tc.drawImage(video, 0, 0, pw, ph)
    ctx.imageSmoothingEnabled = false; ctx.drawImage(tmp, 0, 0, pw, ph, dx, dy, dw, dh)
  }
}

// ─── Cables ───────────────────────────────────────────────────────────────────
const TOPO = [
  {from:'generate',  to:'prompt',   seg:0},
  {from:'prompt',    to:'erfahrung',seg:1},
  {from:'prompt',    to:'vision',   seg:1},
  {from:'erfahrung', to:'upscale',  seg:2},
  {from:'vision',    to:'upscale',  seg:2},
  {from:'modes',     to:'preview',  seg:3, optionalMode:true},
  {from:'upscale',   to:'terminal', seg:4, cableZ:13},
  {from:'terminal',  to:'progress', seg:5},
  {from:'progress',  to:'preview',  seg:6, useAltInp:true, cableZ:15},
]
const SEG_N = 7
const AI_NODE_DEPTH: Record<string, number> = {
  generate: 0,
  prompt: 0,
  erfahrung: 1,
  vision: 1,
  upscale: 2,
  modes: 2,
  terminal: 2.65,
  progress: 3.35,
  preview: 4,
}

function CablesLayer({ ports, phase, isActive, exitP, modeSelected, modeGlowStage, nodeZOrders, focusedNode, extraConnections = [] }: { ports: PortMap; phase: number; isActive: boolean; exitP: number; modeSelected: boolean; modeGlowStage: number; nodeZOrders: Record<string, number>; focusedNode: string | null; extraConnections?: Array<{ from: string; to: string; seg: number; optionalMode?: boolean; useAltInp?: boolean; cableZ?: number }> }) {
  const cableOpacity = Math.max(0, 1 - exitP * 2)
  const renderCableCap = (point: Port, active: boolean, side: 'out' | 'in', green = false) => {
    const sideSign = side === 'out' ? 1 : -1
    const outletX = side === 'out' ? -0.5 : -9.5
    const outletStroke = green ? 'rgba(220,255,205,0.94)' : active ? 'rgba(255,245,240,0.82)' : 'rgba(238,232,225,0.62)'
    const redDepth = green ? 'rgba(255,145,32,0.72)' : active ? 'rgba(255,74,58,0.56)' : 'rgba(255,74,58,0.34)'
    return (
      <g transform={`translate(${point.x},${point.y})`} opacity={active ? 1 : 0.92}>
        <path d={`M${sideSign * -0.5},0 H${sideSign * 12}`} stroke="rgba(255,248,242,0.98)" strokeWidth={4.8} strokeLinecap="round" opacity={active ? 0.96 : 0.78}/>
        <path d={`M${sideSign * -0.5},1.4 H${sideSign * 12}`} stroke={redDepth} strokeWidth={5.8} strokeLinecap="round" opacity={active ? 0.3 : 0.2}/>
        <rect x={outletX + 0.9} y={-3.2} width={10} height={8} rx={1} fill={redDepth} opacity={active ? 0.34 : 0.24}/>
        <rect x={outletX} y={-4.2} width={10} height={8} rx={1} fill="#030303" stroke={outletStroke} strokeWidth={0.9}/>
      </g>
    )
  }
  const svgBase: React.CSSProperties = { position:'absolute', inset:0, width:'100%', height:'100%', pointerEvents:'none', overflow:'visible', opacity:cableOpacity, filter:exitP>0.02?`blur(${exitP*18}px)`:'none', transition:'none', willChange:'opacity' }
  const groups = new Map<number, Array<{ from: string; to: string; seg: number; optionalMode?: boolean; useAltInp?: boolean; cableZ?: number }>>()
  ;[...TOPO, ...extraConnections].forEach(e => {
    const staticZ = (e as {cableZ?:number}).cableZ ?? 4
    const z = e.from === 'upscale' && e.to === 'terminal'
      ? focusedNode === 'preview'
        ? Math.max(staticZ, (nodeZOrders.preview ?? 0) - 1)
        : Math.max(staticZ, (nodeZOrders.preview ?? 0) + 1)
      : staticZ
    if (!groups.has(z)) groups.set(z, [])
    groups.get(z)!.push(e)
  })
  return <>
    {[...groups.entries()].map(([z, cables]) => (
      <svg key={z} style={{...svgBase, zIndex:z}}>
        {cables.map(({ from, to, seg, optionalMode, useAltInp }, i) => {
        const a = ports[from], b = ports[to]; if (!a || !b) return null
        const f = a.out, t2 = (useAltInp && b.inpAlt) ? b.inpAlt : b.inp
        const ss = seg / SEG_N, se = (seg+1) / SEG_N
          const modeSimulation = Boolean(optionalMode && modeSelected && modeGlowStage >= 2)
          const lit = (isActive && phase >= ss && (!optionalMode || modeSelected)) || modeSimulation
        const pt  = !isActive ? 0 : phase >= se ? 1 : phase >= ss ? (phase-ss)/(se-ss) : 0
          const f2 = { x: f.x + 10, y: f.y }
          const t3 = { x: t2.x - 10, y: t2.y }
          // Each cable exits its port straight (horizontal tangent), then bends.
          // Tension scales with distance → short cables stiff, long cables sweeping.
          const dist = Math.hypot(t3.x - f2.x, t3.y - f2.y)
          const tension = Math.max(88, dist * 0.48)
          const c1x = f2.x + tension, c1y = f2.y          // exits right from out-port
          const c2x = t3.x - tension, c2y = t3.y          // arrives from left at in-port
          const d   = `M${f2.x},${f2.y} C${c1x},${c1y} ${c2x},${c2y} ${t3.x},${t3.y}`
          const px_ = f2.x*(1-pt)**3 + 3*c1x*(1-pt)**2*pt + 3*c2x*(1-pt)*pt**2 + t3.x*pt**3
          const py_ = f2.y*(1-pt)**3 + 3*c1y*(1-pt)**2*pt + 3*c2y*(1-pt)*pt**2 + t3.y*pt**3
        const tubeDepth = modeSimulation ? 'rgba(74,29,0,0.5)' : lit ? 'rgba(12,0,0,0.34)' : 'rgba(0,0,0,0.22)'
        const tubeShadow = modeSimulation ? 'rgba(255,145,32,0.74)' : lit ? 'rgba(255,58,48,0.42)' : 'rgba(255,76,64,0.25)'
        const tubeBody = lit ? 'rgba(252,248,240,0.98)' : 'rgba(246,242,235,0.84)'
        const tubeHighlight = lit ? 'rgba(255,255,255,0.96)' : 'rgba(255,255,255,0.64)'
        return (
          <g key={i} style={{ filter:modeSimulation ? 'drop-shadow(0 0 5px rgba(255,230,194,0.84)) drop-shadow(0 0 15px rgba(255,126,20,0.62))' : lit ? 'drop-shadow(0 0 5px rgba(255,238,232,0.62)) drop-shadow(0 0 13px rgba(255,72,55,0.24))' : 'none' }}>
            <path d={d} fill="none" stroke={tubeDepth} strokeWidth={lit ? 10.5 : 9.2} strokeLinecap="round" opacity={lit ? 0.42 : 0.28}/>
            <path d={d} fill="none" stroke={tubeShadow} strokeWidth={lit ? 8.8 : 7.8} strokeLinecap="round" opacity={lit ? 0.74 : 0.52}/>
            <path d={d} fill="none" stroke={tubeBody} strokeWidth={lit ? 5.2 : 4.8} strokeLinecap="round" opacity={lit ? 1 : 0.94}/>
            <path d={d} fill="none" stroke={tubeHighlight} strokeWidth={lit ? 1.55 : 1.35} strokeLinecap="round" opacity={lit ? 0.92 : 0.7}/>
            {lit && pt > 0.02 && pt < 0.98 && <>
              <circle cx={px_} cy={py_} r={4.2} fill="rgba(255,255,255,0.96)" opacity={0.95}/>
              <circle cx={px_} cy={py_} r={10} fill={modeSimulation ? 'rgba(255,126,20,0.52)' : 'rgba(255,74,58,0.42)'} opacity={0.36}/>
            </>}
            {renderCableCap(f, lit, 'out', modeSimulation)}
            {renderCableCap(t2, lit, 'in', modeSimulation)}
          </g>
        )})}
      </svg>
    ))}
  </>
}

// ─── Draggable Window ─────────────────────────────────────────────────────────
function Win({ id, title, width, initPos, onPortChange, onFocus, zIndex, lit=false, glowTone='green', minH, freezePortY=false, offset={x:0,y:0}, animateLayout=false, emitAltInp=false, altInpY=16, inpAtFrac=0.5, showHeader=true, children }: {
  id: string; title: string; width: number
  initPos: {x: number; y: number}
  onPortChange: (id: string, out: Port, inp: Port, inpAlt?: Port) => void
  onFocus: (id: string) => void
  zIndex: number; lit?: boolean; glowTone?: 'green' | 'orange'; minH?: number; freezePortY?: boolean
  offset?: {x: number; y: number}; animateLayout?: boolean
  altInpY?: number
  emitAltInp?: boolean; inpAtFrac?: number
  showHeader?: boolean
  children: React.ReactNode
}) {
  const [pos, setPos] = useState(initPos)
  const domRef   = useRef<HTMLDivElement>(null)
  const dOff     = useRef({x:0, y:0})
  const dragging = useRef(false)
  const dragStartRef = useRef({ x:0, y:0 })
  const dragMovedRef = useRef(false)
  const [isDragging, setIsDragging] = useState(false)
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
    if (freezePortY && frozenPortYRef.current === null) frozenPortYRef.current = h * inpAtFrac
    const inpY = freezePortY ? frozenPortYRef.current ?? h * inpAtFrac : h * inpAtFrac
    const altPort = emitAltInp ? {x:lx, y:ty+altInpY} : undefined
    onPortChange(id, {x:lx+er.width, y:ty+h/2}, {x:lx, y:ty+inpY}, altPort)
  }, [freezePortY, id, onPortChange, emitAltInp, altInpY, inpAtFrac])

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
    if (e.button !== 0) return
    if (e.target instanceof Element && e.target.closest('button, input, select, textarea, option, label, a, [role="button"], [data-ai-stop-drag]')) {
      onFocus(id)
      return
    }
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
    dOff.current = {x: e.clientX-(pos.x+offset.x), y: e.clientY-(pos.y+offset.y)}; dragStartRef.current = { x:e.clientX, y:e.clientY }; dragMovedRef.current = false; dragging.current = true; setIsDragging(true); document.body.classList.add('ai-node-dragging')
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
    const move = (e: MouseEvent) => {
      if (!dragging.current) return
      if (Math.hypot(e.clientX - dragStartRef.current.x, e.clientY - dragStartRef.current.y) > 3) dragMovedRef.current = true
      setPos({x:e.clientX-dOff.current.x-offset.x, y:e.clientY-dOff.current.y-offset.y})
    }
    const up   = () => {
      const wasDragging = dragging.current
      dragging.current = false
      setIsDragging(false)
      document.body.classList.remove('ai-node-dragging')
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
      document.body.classList.remove('ai-node-dragging')
    }
  }, [])

  const visualDepth = AI_NODE_DEPTH[id] ?? 0
  const orangeGlow = glowTone === 'orange'
  const nodeGlow = orangeGlow
    ? '0 0 5px rgba(255,226,188,0.78),0 0 18px rgba(255,145,32,0.56),0 0 36px rgba(255,106,0,0.26)'
    : CRT_BOX_GLOW
  const depthShade = Math.min(0.22, visualDepth * 0.045)
  const surfaceTop = visualDepth >= 3 ? '#eeeeee' : visualDepth >= 2 ? '#f1f1f1' : '#f5f5f5'
  const surfaceMid = visualDepth >= 3 ? '#d8d8d8' : visualDepth >= 2 ? '#dedede' : '#e7e7e7'
  const surfaceBottom = visualDepth >= 3 ? '#b9b9b9' : visualDepth >= 2 ? '#c7c7c7' : '#d5d5d5'
  const headerTop = visualDepth >= 3 ? 'rgba(255,255,255,0.98)' : 'rgba(255,255,255,0.96)'
  const headerBottom = visualDepth >= 3 ? 'rgba(178,178,178,0.98)' : 'rgba(198,198,198,0.94)'
  const nearShadow = `${2 + visualDepth * 0.8}px ${3 + visualDepth * 1.1}px ${5 + visualDepth * 1.8}px rgba(0,0,0,${0.16 + visualDepth * 0.018})`
  const depthShadow = `${8 + visualDepth * 3.2}px ${13 + visualDepth * 4.6}px ${24 + visualDepth * 8}px rgba(0,0,0,${0.18 + visualDepth * 0.035})`
  const ambientShadow = `${-2 + visualDepth * 0.3}px ${5 + visualDepth * 2.4}px ${22 + visualDepth * 8}px rgba(0,0,0,${0.1 + visualDepth * 0.018})`
  const redDepthShadow = `${4 + visualDepth * 1.4}px ${6 + visualDepth * 1.8}px ${15 + visualDepth * 4}px rgba(255,72,55,${0.045 + visualDepth * 0.018})`
  const bevelShadow = `inset 1px 1px 0 rgba(255,255,255,${0.88 - depthShade}), inset -2px -2px 0 rgba(0,0,0,${0.13 + visualDepth * 0.028}), inset 0 -5px 9px rgba(0,0,0,${0.045 + visualDepth * 0.018})`
  const outline = lit ? `1px solid ${orangeGlow ? '#ff9d32' : CRT_GREEN}` : 'none'
  const shadow  = lit ? `${nodeGlow}, ${nearShadow}, ${depthShadow}, ${ambientShadow}, ${redDepthShadow}, ${bevelShadow}, inset 0 0 13px ${orangeGlow ? 'rgba(255,126,20,0.16)' : 'rgba(57,255,20,0.13)'}` : `${nearShadow}, ${depthShadow}, ${ambientShadow}, ${redDepthShadow}, ${bevelShadow}`
  const nodeBackground = `linear-gradient(135deg, ${surfaceTop} 0%, ${surfaceMid} 48%, ${surfaceBottom} 100%)`
  const nodeBorder = visualDepth >= 3 ? '1px solid rgba(255,255,255,0.62)' : '1px solid rgba(255,255,255,0.46)'
  const headerBackground = `linear-gradient(180deg, ${headerTop} 0%, rgba(232,232,232,0.96) 38%, ${headerBottom} 100%)`

  const stopDraggedClick = useCallback((event: React.MouseEvent) => {
    if (!dragMovedRef.current) return
    event.preventDefault()
    event.stopPropagation()
    dragMovedRef.current = false
  }, [])

  return (
    <div ref={domRef} data-ai-node={id} onMouseDown={onMD} onClickCapture={stopDraggedClick} style={{ position:'absolute', left:pos.x+offset.x, top:pos.y+offset.y, width, minHeight:minH, background:nodeBackground, border:nodeBorder, outline, boxShadow:shadow, zIndex, display:'flex', flexDirection:'column', transform:'translate3d(var(--ai-mx,0px),var(--ai-my,0px),0)', transition:animateLayout?'left 0.28s ease,top 0.28s ease,width 0.28s ease,outline 0.3s,box-shadow 0.3s,background 0.3s':'outline 0.3s,box-shadow 0.3s,background 0.3s', willChange:'transform', isolation:'isolate', cursor:isDragging ? AI_CURSOR_FIST : AI_CURSOR_OPEN }}>
      {showHeader && <div style={{ position:'relative', zIndex:1, display:'flex', alignItems:'center', gap:6, padding:'7px 12px', background:headerBackground, borderBottom:'1px solid rgba(0,0,0,0.16)', boxShadow:'inset 0 1px 0 rgba(255,255,255,0.72), inset 0 -1px 0 rgba(0,0,0,0.08)', cursor:isDragging ? AI_CURSOR_FIST : AI_CURSOR_OPEN, flexShrink:0, userSelect:'none' }}>
        <div style={{width:12, height:12, borderRadius:'50%', background:'#27ca40', flexShrink:0}}/>
        <div style={{width:12, height:12, borderRadius:'50%', background:'#ffbd2e', flexShrink:0}}/>
        <div style={{width:12, height:12, borderRadius:'50%', background:'#ff5f56', flexShrink:0}}/>
        <span onMouseEnter={scramble} style={{ marginLeft:6, color:'#111', fontSize:11, letterSpacing:'0.08em', textTransform:'uppercase', fontFamily:BORNA, flex:1, cursor:isDragging ? AI_CURSOR_FIST : AI_CURSOR_OPEN, fontWeight:600, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{disp}</span>
      </div>}
      <div style={{ position:'relative', zIndex:1, flex:1 }}>{children}</div>
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

function MobileDesktopNode({
  title,
  children,
  width,
  delay,
}: {
  title: string
  children: React.ReactNode
  width: string
  delay: string
}) {
  return (
    <div style={{
      width,
      minHeight: 52,
      border: '1px solid rgba(255,255,255,0.58)',
      background: 'linear-gradient(135deg, #f4f4f4 0%, #dedede 52%, #c9c9c9 100%)',
      boxShadow: '2px 3px 5px rgba(0,0,0,0.3), 9px 15px 28px rgba(0,0,0,0.3), inset 1px 1px 0 rgba(255,255,255,0.88), inset -2px -2px 0 rgba(0,0,0,0.15)',
      color: '#111',
      animation: `mobileAiFloat 4.8s var(--mobile-motion-ease) ${delay} infinite alternate`,
      willChange: 'transform',
    }}>
      <div style={{
        height: 20,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 6px 0 8px',
        background: 'linear-gradient(180deg, #fff 0%, #eeeeee 42%, #bdbdbd 100%)',
        borderBottom: '1px solid rgba(0,0,0,0.3)',
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.92)',
        fontFamily: MONO,
        fontWeight: 800,
        fontSize: 8,
        letterSpacing: '0.08em',
      }}>
        <span>{title}</span><span aria-hidden="true">▣</span>
      </div>
      <div style={{ padding: '7px 8px', fontFamily: MONO, fontSize: 9, fontWeight: 700, lineHeight: 1.25 }}>{children}</div>
    </div>
  )
}

function MobileAIWorkspace({
  previewRef,
  canvasRef,
  isActive,
  phase,
  exitP,
  generate,
  outputFormat,
  outpaintReveal,
  pendingOutputFormat,
  setPendingOutputFormat,
  outputModes,
  toggleOutputMode,
  imageModeLoading,
  modeGlowStage,
  currentWorkflowPrompt,
  currentImageIndex,
  isUpscaleMode,
  isVideoMode,
  activeVideoSrc,
  upscaleCanvasRef,
  videoRef,
  videoCanvasRef,
  upscaleSplit,
  upscalePixelReveal,
  upscaleIntroActive,
  beginUpscaleDrag,
  setUpscaleSplitFromClientX,
  endUpscaleDrag,
  outpaintGuideIsVisible,
  outpaintGuideInset,
  outpaintGuideOpacity,
  videoReady,
  videoPlaying,
  setVideoCanPlay,
  toggleVideoPlayback,
}: {
  previewRef: React.RefObject<HTMLDivElement | null>
  canvasRef: React.RefObject<HTMLCanvasElement | null>
  isActive: boolean
  phase: number
  exitP: number
  generate: () => void
  outputFormat: OutputFormat
  outpaintReveal: number
  pendingOutputFormat: OutputFormat
  setPendingOutputFormat: (format: OutputFormat) => void
  outputModes: OutputMode[]
  toggleOutputMode: (mode: OutputMode) => void
  imageModeLoading: boolean
  modeGlowStage: number
  currentWorkflowPrompt: string
  currentImageIndex: number
  isUpscaleMode: boolean
  isVideoMode: boolean
  activeVideoSrc: string | null
  upscaleCanvasRef: React.RefObject<HTMLCanvasElement | null>
  videoRef: React.RefObject<HTMLVideoElement | null>
  videoCanvasRef: React.RefObject<HTMLCanvasElement | null>
  upscaleSplit: number
  upscalePixelReveal: number
  upscaleIntroActive: boolean
  beginUpscaleDrag: (clientX: number) => void
  setUpscaleSplitFromClientX: (clientX: number) => void
  endUpscaleDrag: () => void
  outpaintGuideIsVisible: boolean
  outpaintGuideInset: string
  outpaintGuideOpacity: number
  videoReady: boolean
  videoPlaying: boolean
  setVideoCanPlay: (value: boolean) => void
  toggleVideoPlayback: () => void
}) {
  return (
    <div style={{
      position: 'relative', height: '100%', overflow: 'hidden', color: '#fff',
      background: '#020503',
      backgroundImage: 'radial-gradient(circle at 16% 14%, rgba(57,255,20,0.18), transparent 30%), linear-gradient(rgba(183,255,156,0.065) 1px, transparent 1px), linear-gradient(90deg, rgba(183,255,156,0.065) 1px, transparent 1px)',
      backgroundSize: '100% 100%, 28px 28px, 28px 28px',
    }}>
      <style>{`@keyframes mobileAiFloat { from { transform: translate3d(0, -2px, 0); } to { transform: translate3d(0, 5px, 0); } }`}</style>
      <div style={{
        position: 'absolute', inset: 0, zIndex: 1, pointerEvents: 'none',
        background: 'radial-gradient(ellipse at center, transparent 34%, rgba(0,0,0,0.18) 66%, rgba(0,0,0,0.78) 100%)',
      }} />
      <div className="mobile-section-shell" style={{
        position: 'relative', zIndex: 2, height: '100%', display: 'flex', flexDirection: 'column', paddingBottom: 'var(--mobile-section-bottom)', gap: 12,
        filter: exitP > 0.02 ? `blur(calc(${exitP} * var(--mobile-exit-blur)))` : 'none',
        opacity: 1 - exitP * 0.9,
        transform: `scale(${1 - exitP * 0.04})`,
        transformOrigin: 'center top',
        willChange: 'filter, opacity, transform',
      }}>
        <header>
          <p style={{ margin: '0 0 10px', color: CRT_GREEN, fontFamily: MONO, fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textShadow: CRT_GLOW }}>
            AI LAB / LIVE SYSTEM
          </p>
          <h2 className="mobile-section-heading" style={{ color: '#fff', textShadow: '0 0 16px rgba(255,255,255,0.32)' }}>
            ARTISTIC<br />INTELLIGENCE
          </h2>
        </header>

        <div style={{ position: 'relative', border: '1px solid rgba(255,255,255,0.58)', background: '#d8d8d8', boxShadow: '3px 5px 8px rgba(0,0,0,0.36), 13px 20px 38px rgba(0,0,0,0.26), inset 1px 1px 0 rgba(255,255,255,0.86), inset -2px -2px 0 rgba(0,0,0,0.16)', overflow: 'hidden' }}>
          <div style={{ height: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 8px', borderBottom: '1px solid rgba(0,0,0,0.32)', background: 'linear-gradient(180deg, #fff 0%, #eeeeee 42%, #bdbdbd 100%)', fontFamily: MONO, fontSize: 9, fontWeight: 800, letterSpacing: '0.1em', color: '#111' }}>
            <span>OUTPUT / IMAGE</span><span>{isActive ? `${Math.round(phase * 100)}%` : 'READY'} ▣</span>
          </div>
          <div ref={previewRef} style={{ position: 'relative', height: 'min(29svh, 57vw)', background: '#071008', overflow: 'hidden' }}>
            <img src={AI_SRCS[INITIAL_AI_IMAGE_INDEX]} alt="" aria-hidden="true" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', filter: 'saturate(0.9) contrast(1.05)' }} />
            <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', display: 'block', mixBlendMode: 'screen' }} />
            <div aria-hidden="true" style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: 'linear-gradient(rgba(57,255,20,0.07) 50%, rgba(0,0,0,0.15) 50%)', backgroundSize: '100% 4px', mixBlendMode: 'screen' }} />
            {isActive && <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', background: 'rgba(0,10,2,0.22)' }}>
              <div style={{ minWidth: 94, padding: '9px 12px', border: '1px solid rgba(183,255,156,0.74)', background: 'rgba(0,8,2,0.88)', color: CRT_GREEN, fontFamily: MONO, fontSize: 11, fontWeight: 700, textAlign: 'center', boxShadow: CRT_BOX_GLOW }}>
                {Math.round(phase * 100)}%<br /><span style={{ fontSize: 8, letterSpacing: '0.12em' }}>RENDERING</span>
              </div>
            </div>}
          </div>
          <button type="button" onClick={generate} disabled={isActive} style={{ width: '100%', minHeight: 37, border: 0, borderTop: '1px solid rgba(0,0,0,0.32)', background: isActive ? '#9d9d9d' : '#111', color: isActive ? '#fff' : CRT_GREEN, fontFamily: MONO, fontSize: 10, fontWeight: 800, letterSpacing: '0.13em', textTransform: 'uppercase', cursor: isActive ? 'wait' : 'pointer' }}>
            {isActive ? 'GENERATING…' : '◈ GENERATE OUTPUT'}
          </button>
        </div>

        <div style={{ position: 'relative', minHeight: 134, marginTop: 'auto' }}>
          <div aria-hidden="true" style={{ position: 'absolute', top: 39, left: '15%', right: '17%', height: 1, background: 'rgba(183,255,156,0.5)', boxShadow: CRT_GLOW }} />
          <div aria-hidden="true" style={{ position: 'absolute', top: 39, left: '15%', width: 7, height: 7, borderRadius: '50%', background: CRT_GREEN, boxShadow: CRT_GLOW }} />
          <div aria-hidden="true" style={{ position: 'absolute', top: 39, right: '17%', width: 7, height: 7, borderRadius: '50%', background: CRT_GREEN, boxShadow: CRT_GLOW }} />
          <div style={{ position: 'absolute', top: 0, left: 0 }}><MobileDesktopNode title="PROMPT DESIGN" width="44vw" delay="0s">CREATIVE BRIEF<br />VISUAL SYSTEM</MobileDesktopNode></div>
          <div style={{ position: 'absolute', top: 13, right: 0 }}><MobileDesktopNode title="WORKFLOW" width="37vw" delay="0.8s"><span style={{ color: '#257512' }}>COMFYUI / LoRA / N8N</span></MobileDesktopNode></div>
          <div style={{ position: 'absolute', bottom: 0, left: '14vw' }}><MobileDesktopNode title="VISION" width="47vw" delay="0.35s">IMAGE → MOTION<br /><span style={{ color: '#666' }}>ART DIRECTION</span></MobileDesktopNode></div>
        </div>
      </div>
    </div>
  )
}

function MobileDesktopWorkspace({
  lang,
  previewRef,
  canvasRef,
  isActive,
  phase,
  exitP,
  generate,
  outputFormat,
  outpaintReveal,
  pendingOutputFormat,
  setPendingOutputFormat,
  outputModes,
  toggleOutputMode,
  imageModeLoading,
  modeGlowStage,
  currentWorkflowPrompt,
  currentImageIndex,
  isUpscaleMode,
  isVideoMode,
  activeVideoSrc,
  upscaleCanvasRef,
  videoRef,
  videoCanvasRef,
  upscaleSplit,
  upscalePixelReveal,
  upscaleIntroActive,
  beginUpscaleDrag,
  setUpscaleSplitFromClientX,
  endUpscaleDrag,
  outpaintGuideIsVisible,
  outpaintGuideInset,
  outpaintGuideOpacity,
  videoReady,
  videoPlaying,
  setVideoCanPlay,
  toggleVideoPlayback,
  ports,
  onPortChange,
  onFocus,
  zOrders,
  expandedNode,
  onPromptExpandChange,
  onWorkflowExpandChange,
  onDirectionExpandChange,
  focusedNode,
}: {
  lang: Lang
  previewRef: React.RefObject<HTMLDivElement | null>
  canvasRef: React.RefObject<HTMLCanvasElement | null>
  isActive: boolean
  phase: number
  exitP: number
  generate: () => void
  outputFormat: OutputFormat
  outpaintReveal: number
  pendingOutputFormat: OutputFormat
  setPendingOutputFormat: (format: OutputFormat) => void
  outputModes: OutputMode[]
  toggleOutputMode: (mode: OutputMode) => void
  imageModeLoading: boolean
  modeGlowStage: number
  currentWorkflowPrompt: string
  currentImageIndex: number
  isUpscaleMode: boolean
  isVideoMode: boolean
  activeVideoSrc: string | null
  upscaleCanvasRef: React.RefObject<HTMLCanvasElement | null>
  videoRef: React.RefObject<HTMLVideoElement | null>
  videoCanvasRef: React.RefObject<HTMLCanvasElement | null>
  upscaleSplit: number
  upscalePixelReveal: number
  upscaleIntroActive: boolean
  beginUpscaleDrag: (clientX: number) => void
  setUpscaleSplitFromClientX: (clientX: number) => void
  endUpscaleDrag: () => void
  outpaintGuideIsVisible: boolean
  outpaintGuideInset: string
  outpaintGuideOpacity: number
  videoReady: boolean
  videoPlaying: boolean
  setVideoCanPlay: (value: boolean) => void
  toggleVideoPlayback: () => void
  ports: PortMap
  onPortChange: (id: string, out: Port, inp: Port, inpAlt?: Port) => void
  onFocus: (id: string) => void
  zOrders: Record<string, number>
  expandedNode: string | null
  onPromptExpandChange: (open: boolean) => void
  onWorkflowExpandChange: (open: boolean) => void
  onDirectionExpandChange: (open: boolean) => void
  focusedNode: string | null
}) {
  const lit = (segment: number) => isActive && phase >= segment / SEG_N
  const controlButtonBase: React.CSSProperties = { height: 28, padding: '0 7px', border: '1px solid rgba(0,0,0,0.18)', fontFamily: BORNA, fontSize: 9, lineHeight: 1, fontWeight: 800, letterSpacing: '0.06em', textAlign: 'left', cursor: 'pointer', textTransform: 'uppercase' }
  const outputAspectValue = outputFormat === '16:9' ? 16 / 9 : outputFormat === '3:4' ? 3 / 4 : 1
  const outputBaseWidth = 266
  const outputOutpaintWidth = 42
  const outputGrow = outputOutpaintWidth * outpaintReveal
  const outputWidth = outputBaseWidth + outputGrow
  const outputHeight = (outputWidth - 2) / outputAspectValue
  const outputBaseHeight = (outputBaseWidth - 2) / outputAspectValue
  const outputFrameWidth = outputBaseWidth + outputOutpaintWidth
  const outputFrameHeight = (outputFrameWidth - 2) / outputAspectValue
  // Keep the output clear of the introductory copy while preserving a shared
  // bottom edge across the selectable output formats.
  const outputTop = 580 - 28 - outputBaseHeight
  const outputOffset = { x: -outputGrow / 2, y: -(outputGrow / outputAspectValue) / 2 }
  const mobileOutpaintGuideInset = `${(outputGrow / outputAspectValue) / 2}px ${outputGrow / 2}px`

  return (
    <div style={{ position: 'relative', height: '100%', overflow: 'hidden', background: '#000' }}>
      <GridBg />
      <div style={{ position: 'absolute', inset: 0, zIndex: 5, filter: exitP > 0.02 ? `blur(${exitP * 18}px)` : 'none', opacity: 1 - exitP * 0.9, transform: `scale(${1 - exitP * 0.04})`, transformOrigin: 'center top', willChange: 'filter, opacity, transform' }}>
        <CablesLayer ports={ports} phase={phase} isActive={isActive} exitP={exitP} modeSelected={outputModes.length > 0} modeGlowStage={modeGlowStage} nodeZOrders={zOrders} focusedNode={focusedNode} extraConnections={[{ from: 'generate', to: 'upscale', seg: 0 }]} />

        <div style={{ position: 'absolute', top: 'var(--mobile-section-top)', left: 'var(--mobile-section-x)', zIndex: AI_HEADING_Z, pointerEvents: 'none' }}>
          <NeonHeading />
        </div>

        <Win id="generate" title="" width={64} initPos={{ x: 270, y: 196 }} onPortChange={onPortChange} onFocus={onFocus} zIndex={zOrders.generate} lit={lit(0)} showHeader={false}>
          <div style={{ padding: 5 }}>
            <button type="button" aria-label="Generate" onClick={generate} disabled={isActive} style={{ width: '100%', aspectRatio: '1', border: '1px solid rgba(0,0,0,0.34)', background: isActive ? '#bcbcbc' : '#d5d5d5', display: 'grid', placeItems: 'center', padding: 0 }}>
              <img src="/icons/gen-01.png" alt="" aria-hidden="true" style={{ width: 22, height: 22, objectFit: 'contain', opacity: isActive ? 0.32 : 1 }} />
            </button>
          </div>
        </Win>

        <Win id="upscale" title="FORMAT" width={64} initPos={{ x: 52, y: 320 }} onPortChange={onPortChange} onFocus={onFocus} zIndex={zOrders.upscale} lit={lit(2)} showHeader={false}>
          <div style={{ padding: 5, display: 'grid', gridTemplateColumns: '1fr', gap: 5 }}>
            {FORMAT_OPTIONS.map((ratio) => <button key={ratio} type="button" aria-label={ratio} aria-pressed={pendingOutputFormat === ratio} onMouseDown={(event) => event.stopPropagation()} onClick={() => setPendingOutputFormat(ratio)} style={{ ...controlButtonBase, width: '100%', aspectRatio: '1', height: 'auto', padding: 0, textAlign: 'center', fontSize: 13, fontWeight: 900, letterSpacing: '0.02em', background: pendingOutputFormat === ratio ? '#000' : 'rgba(0,0,0,0.08)', color: pendingOutputFormat === ratio ? '#fff' : '#111' }}>{ratio}</button>)}
          </div>
        </Win>

        <Win id="modes" title="MODES" width={182} initPos={{ x: 128, y: 645 }} onPortChange={onPortChange} onFocus={onFocus} zIndex={zOrders.preview + 1} lit={modeGlowStage >= 1} glowTone="orange" showHeader={false}>
          <div style={{ padding: 5, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 5 }}>
            {OUTPUT_MODE_OPTIONS.map((mode, index) => <button key={mode} type="button" aria-label={OUTPUT_MODE_LABELS[mode]} aria-pressed={outputModes.includes(mode)} disabled={isActive} onMouseDown={(event) => event.stopPropagation()} onClick={() => toggleOutputMode(mode)} style={{ ...controlButtonBase, width: '100%', aspectRatio: '1', height: 'auto', padding: 0, display: 'grid', placeItems: 'center', background: outputModes.includes(mode) ? '#000' : 'rgba(0,0,0,0.08)', opacity: isActive ? 0.42 : 1 }}>
              <img src={`/icons/modes-0${index + 1}.png`} alt="" aria-hidden="true" style={{ width: '56%', height: '56%', objectFit: 'contain', filter: outputModes.includes(mode) ? 'invert(1)' : 'none' }} />
            </button>)}
          </div>
        </Win>

        <Win id="terminal" title="WORKFLOW LOG" width={284} initPos={{ x: 40, y: 530 }} onPortChange={onPortChange} onFocus={onFocus} zIndex={1} lit={lit(4)} minH={184}>
          <div style={{ height: 172, background: '#010a03', overflow: 'hidden', boxShadow: 'inset 0 0 22px rgba(57,255,20,0.18)' }}><CrazyTerminal phase={phase} isActive={isActive} lang={lang} prompt={currentWorkflowPrompt} imageIndex={currentImageIndex} /></div>
        </Win>

        <Win id="preview" title="OUTPUT" width={outputWidth} initPos={{ x: 94, y: outputTop }} offset={outputOffset} onPortChange={onPortChange} onFocus={onFocus} zIndex={zOrders.preview} lit={lit(6) || modeGlowStage >= 3} glowTone={modeGlowStage > 0 ? 'orange' : 'green'} emitAltInp altInpY={52} inpAtFrac={0.91}>
          <div style={{ position: 'relative', width: '100%', height: outputHeight, overflow: 'hidden', background: '#111' }}>
            {outpaintReveal > 0.02 && <div data-ai-outpaint-guide style={{ position: 'absolute', inset: mobileOutpaintGuideInset, border: '1px dashed rgba(255,255,255,0.76)', opacity: Math.min(1, outpaintReveal * 1.35), zIndex: 5, pointerEvents: 'none' }} />}
            <div ref={previewRef} style={{ position: 'absolute', left: '50%', top: '50%', width: outputFrameWidth, height: outputFrameHeight, transform: 'translate(-50%, -50%)' }}>
              <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', display: 'block' }} />
            {isUpscaleMode && <>
              <div data-ai-mode-effect="upscale" style={{ position: 'absolute', left: `${upscaleSplit * 100}%`, right: 0, top: 0, bottom: 0, overflow: 'hidden', zIndex: 3, pointerEvents: 'none' }}>
                <canvas ref={upscaleCanvasRef} style={{ position: 'absolute', right: 0, top: 0, width: `${100 / upscalePixelReveal}%`, height: '100%', display: 'block', imageRendering: 'pixelated' }} />
              </div>
              <div data-ai-upscale-track role="slider" aria-label="Upscale comparison split" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(upscaleSplit * 100)} tabIndex={0} onPointerDown={(event) => { event.stopPropagation(); beginUpscaleDrag(event.clientX) }} onPointerMove={(event) => { if (event.buttons === 1) setUpscaleSplitFromClientX(event.clientX) }} onPointerUp={endUpscaleDrag} onPointerCancel={endUpscaleDrag} onMouseDown={(event) => event.stopPropagation()} style={{ position: 'absolute', inset: 0, zIndex: 4, cursor: upscaleIntroActive ? 'default' : 'ew-resize', pointerEvents: upscaleIntroActive ? 'none' : 'auto', touchAction: 'none', background: 'transparent', outline: 'none' }} />
              <div style={{ position: 'absolute', left: `calc(${upscaleSplit * 100}% - 13px)`, top: 0, bottom: 0, width: 26, zIndex: 5, pointerEvents: 'none' }}><div style={{ position: 'absolute', left: 12, top: 0, bottom: 0, width: 3, background: '#fff' }} /></div>
            </>}
            {isVideoMode && <div data-ai-mode-effect="video" style={{ position: 'absolute', inset: 0, zIndex: 6, pointerEvents: 'none' }}>
              {activeVideoSrc && <video key={activeVideoSrc} ref={videoRef} src={activeVideoSrc} preload="auto" loop muted playsInline onLoadedData={() => setVideoCanPlay(true)} onCanPlay={() => setVideoCanPlay(true)} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0, zIndex: 1 }} />}
              <canvas ref={videoCanvasRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', display: 'block', opacity: videoReady ? 1 : 0, transition: 'opacity 0.18s ease', zIndex: 2 }} />
              {!videoReady ? <ModeLoadingIndicator /> : <button type="button" aria-label={videoPlaying ? 'Pause preview' : 'Play preview'} onMouseDown={(event) => event.stopPropagation()} onClick={(event) => { event.stopPropagation(); toggleVideoPlayback() }} style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%,-50%)', width: 44, height: 44, border: 0, padding: 0, background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', pointerEvents: 'auto', filter: 'drop-shadow(0 1px 6px rgba(0,0,0,0.82))', zIndex: 4 }}>
                {videoPlaying ? <span style={{ width: 18, height: 23, display: 'flex', gap: 6 }}><span style={{ flex: 1, background: '#fff' }} /><span style={{ flex: 1, background: '#fff' }} /></span> : <span style={{ width: 0, height: 0, borderTop: '12px solid transparent', borderBottom: '12px solid transparent', borderLeft: '20px solid #fff', marginLeft: 5 }} />}
              </button>}
            </div>}
            {imageModeLoading && <div style={{ position: 'absolute', inset: 0, zIndex: 2, pointerEvents: 'none' }}><ModeLoadingIndicator /></div>}
            </div>
          </div>
        </Win>
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
  const videoRef = useRef<HTMLVideoElement>(null)
  const videoCanvasRef = useRef<HTMLCanvasElement>(null)
  const previewRef = useRef<HTMLDivElement>(null)
  const rafRef     = useRef(0)
  const upscaleDragCleanupRef = useRef<(() => void) | null>(null)
  const upscaleIntroRafRef = useRef(0)
  const videoPixelRafRef = useRef(0)
  const outpaintRevealRafRef = useRef(0)
  const outpaintRevealRef = useRef(0)
  const outpaintGuideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const videoLoadSimTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const imageModeLoadTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const pendingImageModeRef = useRef<OutputMode | null>(null)
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
  const [focusedNode, setFocusedNode] = useState<string | null>(null)
  const [outputFormat, setOutputFormat] = useState<OutputFormat>('1:1')
  const [pendingOutputFormat, setPendingOutputFormat] = useState<OutputFormat>('1:1')
  const [outputModes, setOutputModes] = useState<OutputMode[]>([])
  const [modeGlowStage, setModeGlowStage] = useState(0)
  const [hoveredControl, setHoveredControl] = useState<string | null>(null)
  const [upscaleSplit, setUpscaleSplit] = useState(0.5)
  const [upscaleHandleHovered, setUpscaleHandleHovered] = useState(false)
  const [upscaleDragging, setUpscaleDragging] = useState(false)
  const [upscaleIntroActive, setUpscaleIntroActive] = useState(false)
  const [outpaintReveal, setOutpaintReveal] = useState(0)
  const [outpaintGuideVisible, setOutpaintGuideVisible] = useState(false)
  const [videoReady, setVideoReady] = useState(false)
  const [videoCanPlay, setVideoCanPlay] = useState(false)
  const [videoLoadSimDone, setVideoLoadSimDone] = useState(false)
  const [videoPlaying, setVideoPlaying] = useState(false)
  const [imageModeLoading, setImageModeLoading] = useState(false)
  const aiCursorImgRef = useRef<HTMLImageElement>(null)
  const aiCursorModeRef = useRef<AICursorMode>('normal')
  const aiCursorPressedRef = useRef(false)
  const aiCursorHoldTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const aiCursorRafRef = useRef(0)
  const aiCursorRectRef = useRef<DOMRect | null>(null)
  const aiCursorPointRef = useRef({ x:-100, y:-100 })
  const aiCursorClientRef = useRef({ x:0, y:0, active:false })
  const aiCursorVisibleRef = useRef(false)
  const aiCursorTargetRef = useRef<EventTarget | null>(null)
  // VW/VH measured from the actual section element – consistent across environments
  const [dims, setDims] = useState<{w:number,h:number}|null>(null)
  const [zOrders, setZOrders] = useState<Record<string,number>>(() => ({...INITIAL_AI_Z_ORDERS}))
  const { isMobile, width, visualHeight } = useMobile()
  const { scrollY, vh: scrollVh } = useScroll()

  useEffect(() => {
    if (outputModes.length === 0) {
      setModeGlowStage(0)
      return
    }
    setModeGlowStage(1)
    const cableTimer = setTimeout(() => setModeGlowStage(2), 180)
    const outputTimer = setTimeout(() => setModeGlowStage(3), 380)
    return () => {
      clearTimeout(cableTimer)
      clearTimeout(outputTimer)
    }
  }, [outputModes])

  const isOutpaintMode = outputModes.includes('OUTPAINT')
  const isUpscaleMode = outputModes.includes('UPSCALE')
  const isVideoMode = outputModes.includes('VIDEO')
  const activeVideoSrc = AI_VIDEO_SRCS[curImgIdx.current] ?? AI_VIDEO_SRCS[INITIAL_AI_IMAGE_INDEX]
  const outputAspect = outputFormat === '16:9' ? '16/9' : outputFormat === '3:4' ? '3/4' : '1/1'
  const outputAspectValue = outputFormat === '16:9' ? 16/9 : outputFormat === '3:4' ? 3/4 : 1
  const outputDefaultWidth = 470
  const outputBaseWidth = outputFormat === '16:9' ? 620 : outputDefaultWidth
  const outputFullImageWidth = outputBaseWidth + 80
  const outputRevealDelta = (outputFullImageWidth - outputBaseWidth) * outpaintReveal
  const outputWinWidth = outputBaseWidth + outputRevealDelta
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
  const outpaintGuideIsVisible = outpaintReveal > 0.02 || outpaintGuideVisible
  const outpaintGuideOpacity = Math.min(1, Math.max(0, outpaintReveal * 1.35))
  const outputPixelSize = isUpscaleMode ? 0 : MIN_OUTPUT_PIXEL_SIZE
  const upscalePixelReveal = Math.max(0.001, 1 - upscaleSplit)

  const applyAiCursorMode = useCallback((mode: AICursorMode) => {
    if (aiCursorModeRef.current === mode) return
    aiCursorModeRef.current = mode
    const cursor = aiCursorImgRef.current ?? sectionRef.current?.querySelector<HTMLImageElement>('.ai-pixel-cursor')
    if (!cursor) return
    const hotspot = AI_CURSOR_HOTSPOT[mode]
    const size = AI_CURSOR_SIZE[mode]
    cursor.src = AI_CURSOR_SRC[mode]
    cursor.style.width = `${size.width * AI_CURSOR_RENDER_SCALE}px`
    cursor.style.height = 'auto'
    cursor.style.setProperty('--ai-cursor-hotspot-x', `${hotspot.x * AI_CURSOR_RENDER_SCALE}px`)
    cursor.style.setProperty('--ai-cursor-hotspot-y', `${hotspot.y * AI_CURSOR_RENDER_SCALE}px`)
  }, [])

  const getAiCursorMode = useCallback((target: EventTarget | null): AICursorMode => {
    if (!(target instanceof Element)) return 'normal'
    if (target.closest('button, input, select, textarea, [role="button"], [data-ai-upscale-track]')) return 'finger'
    return target.closest('[data-ai-node]') ? 'hand' : 'normal'
  }, [])

  const clearAiCursorHold = useCallback(() => {
    if (!aiCursorHoldTimerRef.current) return
    clearTimeout(aiCursorHoldTimerRef.current)
    aiCursorHoldTimerRef.current = null
  }, [])

  const updateAiCursorPosition = useCallback((clientX: number, clientY: number, forceMeasure = false, eventSection?: HTMLElement) => {
    const section = sectionRef.current ?? eventSection
    if (!section) return
    aiCursorClientRef.current = { x: clientX, y: clientY, active: true }
    if (forceMeasure || !aiCursorRectRef.current) aiCursorRectRef.current = section.getBoundingClientRect()
    const rect = aiCursorRectRef.current
    aiCursorPointRef.current = { x: clientX - rect.left, y: clientY - rect.top }
    const activeCursor = aiCursorImgRef.current ?? section.querySelector<HTMLImageElement>('.ai-pixel-cursor')
    if (activeCursor && !aiCursorVisibleRef.current) {
      aiCursorVisibleRef.current = true
      activeCursor.style.opacity = '1'
    }
    if (aiCursorRafRef.current) return
    aiCursorRafRef.current = requestAnimationFrame(() => {
      aiCursorRafRef.current = 0
      const currentSection = sectionRef.current
      if (!currentSection) return
      const cursor = aiCursorImgRef.current ?? currentSection.querySelector<HTMLImageElement>('.ai-pixel-cursor')
      if (!cursor) return
      currentSection.style.setProperty('--ai-cursor-x', `${aiCursorPointRef.current.x}px`)
      currentSection.style.setProperty('--ai-cursor-y', `${aiCursorPointRef.current.y}px`)
    })
  }, [])

  const moveAiCursor = useCallback((event: AICursorEvent) => {
    updateAiCursorPosition(event.clientX, event.clientY, event.type === 'mouseenter' || event.type === 'pointerenter', event.currentTarget)
    if (!aiCursorPressedRef.current && aiCursorTargetRef.current !== event.target) {
      aiCursorTargetRef.current = event.target
      applyAiCursorMode(getAiCursorMode(event.target))
    }
    if (!document.body.classList.contains('ai-section-cursor-active')) document.body.classList.add('ai-section-cursor-active')
  }, [applyAiCursorMode, getAiCursorMode, updateAiCursorPosition])

  const pressAiCursor = useCallback((event: AICursorEvent) => {
    updateAiCursorPosition(event.clientX, event.clientY, true, event.currentTarget)
    if (!document.body.classList.contains('ai-section-cursor-active')) document.body.classList.add('ai-section-cursor-active')
    aiCursorPressedRef.current = true
    clearAiCursorHold()
    if (!(event.target instanceof Element)) {
      applyAiCursorMode('normalClick')
      return
    }
    if (event.target.closest('button, input, select, textarea, [role="button"], [data-ai-upscale-track]')) {
      applyAiCursorMode('click')
      return
    }
    if (!event.target.closest('[data-ai-node]')) {
      applyAiCursorMode('normalClick')
      return
    }
    applyAiCursorMode('fist')
  }, [applyAiCursorMode, clearAiCursorHold, updateAiCursorPosition])

  const releaseAiCursor = useCallback((event: AICursorEvent) => {
    clearAiCursorHold()
    aiCursorPressedRef.current = false
    updateAiCursorPosition(event.clientX, event.clientY, false, event.currentTarget)
    applyAiCursorMode(getAiCursorMode(event.target))
  }, [applyAiCursorMode, clearAiCursorHold, getAiCursorMode, updateAiCursorPosition])

  const hideAiCursor = useCallback(() => {
    clearAiCursorHold()
    aiCursorPressedRef.current = false
    aiCursorClientRef.current.active = false
    if (aiCursorRafRef.current) {
      cancelAnimationFrame(aiCursorRafRef.current)
      aiCursorRafRef.current = 0
    }
    aiCursorRectRef.current = null
    aiCursorTargetRef.current = null
    const cursor = aiCursorImgRef.current ?? sectionRef.current?.querySelector<HTMLImageElement>('.ai-pixel-cursor')
    aiCursorVisibleRef.current = false
    if (cursor) cursor.style.opacity = '0'
    applyAiCursorMode('normal')
    document.body.classList.remove('ai-section-cursor-active')
  }, [applyAiCursorMode, clearAiCursorHold])

  useEffect(() => {
    const onWindowMouseUp = (event: MouseEvent) => {
      if (!aiCursorPressedRef.current) return
      clearAiCursorHold()
      aiCursorPressedRef.current = false
      const section = sectionRef.current
      const target = document.elementFromPoint(event.clientX, event.clientY)
      if (section && target && section.contains(target)) {
        updateAiCursorPosition(event.clientX, event.clientY)
        applyAiCursorMode(getAiCursorMode(target))
        return
      }
      hideAiCursor()
    }
    window.addEventListener('mouseup', onWindowMouseUp)
    return () => window.removeEventListener('mouseup', onWindowMouseUp)
  }, [applyAiCursorMode, clearAiCursorHold, getAiCursorMode, hideAiCursor, updateAiCursorPosition])

  useEffect(() => {
    if (!aiCursorVisibleRef.current || !aiCursorClientRef.current.active) return
    const { x, y } = aiCursorClientRef.current
    updateAiCursorPosition(x, y, true)
  }, [scrollY, width, visualHeight, updateAiCursorPosition])

  const drawUpscalePixelCanvas = useCallback(() => {
    const cv = upscaleCanvasRef.current, pv = previewRef.current
    if (!cv || !pv || !pv.offsetWidth) return
    cv.width = pv.offsetWidth
    cv.height = pv.offsetHeight
    const img = getAiImage(curImgIdx.current)
    if (img.complete && img.naturalWidth > 0) {
      drawToCanvas(cv, img, 1, MIN_OUTPUT_PIXEL_SIZE)
      return
    }
    ensureLoaded(img, AI_SRCS[curImgIdx.current]).then(loaded => {
      const c2 = upscaleCanvasRef.current, p2 = previewRef.current
      if (c2 && p2 && p2.offsetWidth) {
        c2.width = p2.offsetWidth
        c2.height = p2.offsetHeight
        drawToCanvas(c2, loaded, 1, MIN_OUTPUT_PIXEL_SIZE)
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
    if (outpaintRevealRafRef.current) cancelAnimationFrame(outpaintRevealRafRef.current)
    if (outpaintGuideTimerRef.current) clearTimeout(outpaintGuideTimerRef.current)
    if (videoPixelRafRef.current) cancelAnimationFrame(videoPixelRafRef.current)
    if (videoLoadSimTimerRef.current) clearTimeout(videoLoadSimTimerRef.current)
    if (imageModeLoadTimerRef.current) clearTimeout(imageModeLoadTimerRef.current)
    pendingImageModeRef.current = null
    if (aiCursorHoldTimerRef.current) clearTimeout(aiCursorHoldTimerRef.current)
    if (aiCursorRafRef.current) cancelAnimationFrame(aiCursorRafRef.current)
    document.body.classList.remove('ai-section-cursor-active')
  }, [])

  useEffect(() => {
    if (outpaintRevealRafRef.current) cancelAnimationFrame(outpaintRevealRafRef.current)
    const from = outpaintRevealRef.current
    const to = isOutpaintMode ? 1 : 0
    if (Math.abs(from - to) < 0.001) {
      outpaintRevealRef.current = to
      setOutpaintReveal(to)
      return
    }

    let startedAt: number | null = null
    const tick = (now: number) => {
      if (startedAt === null) startedAt = now
      const progress = Math.min(1, (now - startedAt) / OUTPAINT_GROW_MS)
      const eased = Math.log1p(progress * 9) / Math.log(10)
      const next = from + (to - from) * eased
      outpaintRevealRef.current = next
      setOutpaintReveal(next)
      if (progress < 1) {
        outpaintRevealRafRef.current = requestAnimationFrame(tick)
      } else {
        outpaintRevealRef.current = to
        setOutpaintReveal(to)
      }
    }
    outpaintRevealRafRef.current = requestAnimationFrame(tick)
    return () => {
      if (outpaintRevealRafRef.current) cancelAnimationFrame(outpaintRevealRafRef.current)
    }
  }, [isOutpaintMode])

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
    const video = videoRef.current
    setVideoPlaying(false)
    setVideoReady(false)
    setVideoCanPlay(false)
    setVideoLoadSimDone(false)

    if (videoPixelRafRef.current) {
      cancelAnimationFrame(videoPixelRafRef.current)
      videoPixelRafRef.current = 0
    }

    if (videoLoadSimTimerRef.current) {
      clearTimeout(videoLoadSimTimerRef.current)
      videoLoadSimTimerRef.current = null
    }

    if (!isVideoMode || !video) return

    video.pause()
    video.currentTime = 0
    video.load()
    videoLoadSimTimerRef.current = setTimeout(() => {
      videoLoadSimTimerRef.current = null
      setVideoLoadSimDone(true)
    }, VIDEO_LOAD_SIM_MS)

    return () => {
      if (videoLoadSimTimerRef.current) {
        clearTimeout(videoLoadSimTimerRef.current)
        videoLoadSimTimerRef.current = null
      }
    }
  }, [activeVideoSrc, isVideoMode])

  useEffect(() => {
    const ready = isVideoMode && videoCanPlay && videoLoadSimDone
    setVideoReady(ready)
    if (ready) {
      const video = videoRef.current
      if (video) video.currentTime = 0
      setVideoPlaying(true)
    }
  }, [isVideoMode, videoCanPlay, videoLoadSimDone])

  useEffect(() => {
    const drawVideoFrame = () => {
      const video = videoRef.current, cv = videoCanvasRef.current, pv = previewRef.current
      if (!video || !cv || !pv || !pv.offsetWidth) return
      cv.width = pv.offsetWidth
      cv.height = pv.offsetHeight
      const duration = video.duration && Number.isFinite(video.duration) ? video.duration : 3
      const progress = duration > 0 ? Math.min(1, Math.max(0, video.currentTime / duration)) : 0
      const pixelSize = 1 + (MIN_OUTPUT_PIXEL_SIZE - 1) * Math.pow(1 - progress, VIDEO_PIXEL_DECAY_POWER)
      drawVideoToCanvas(cv, video, pixelSize)
      videoPixelRafRef.current = requestAnimationFrame(drawVideoFrame)
    }

    if (videoPixelRafRef.current) {
      cancelAnimationFrame(videoPixelRafRef.current)
      videoPixelRafRef.current = 0
    }
    if (!isVideoMode || !videoReady) return

    videoPixelRafRef.current = requestAnimationFrame(drawVideoFrame)
    return () => {
      if (videoPixelRafRef.current) {
        cancelAnimationFrame(videoPixelRafRef.current)
        videoPixelRafRef.current = 0
      }
    }
  }, [activeVideoSrc, isVideoMode, videoReady])

  useEffect(() => {
    const video = videoRef.current
    if (!isVideoMode || !videoReady || !video) return

    if (!videoPlaying) {
      video.pause()
      return
    }

    void video.play().catch(() => setVideoPlaying(false))
  }, [isVideoMode, videoReady, videoPlaying])

  const toggleVideoPlayback = useCallback(() => {
    if (!videoReady) return
    const video = videoRef.current
    if (videoPlaying) {
      setVideoPlaying(false)
      return
    }
    if (video?.ended) {
      video.currentTime = 0
    }
    setVideoPlaying(true)
  }, [videoPlaying, videoReady])

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
        drawToCanvas(cv, img, 1, MIN_OUTPUT_PIXEL_SIZE)
        return
      }
      ensureLoaded(img, AI_SRCS[INITIAL_AI_IMAGE_INDEX]).then(loaded => {
        if (cancelled) return
        const c2 = canvasRef.current, p2 = previewRef.current
        if (c2 && p2 && p2.offsetWidth) {
          c2.width = p2.offsetWidth
          c2.height = p2.offsetHeight
          drawToCanvas(c2, loaded, 1, MIN_OUTPUT_PIXEL_SIZE)
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
    const frame = requestAnimationFrame(tryDraw)
    const t1 = setTimeout(tryDraw, 80)
    const t2 = setTimeout(tryDraw, 500)
    return () => { cancelAnimationFrame(frame); clearTimeout(t1); clearTimeout(t2) }
  }, [mounted, nearViewport, outputAspect, outputModes, outputPixelSize])

  useEffect(() => {
    if (!isUpscaleMode) return
    const t1 = setTimeout(drawUpscalePixelCanvas, 80)
    const t2 = setTimeout(drawUpscalePixelCanvas, 360)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [drawUpscalePixelCanvas, outputAspect, isUpscaleMode, phase])

  useEffect(() => {
    const el = outerRef.current; if (!el) return
    if (scrollVh <= 0) {
      setExitP((prev) => (prev === 0 ? prev : 0))
      return
    }
    const s = Math.max(0, -el.getBoundingClientRect().top)
    const next = Math.max(0, Math.min(1, (s-scrollVh*0.5)/scrollVh))
    setExitP((prev) => (Math.abs(prev - next) < 0.002 ? prev : next))
  }, [scrollY, scrollVh])

  const onPortChange = useCallback((id: string, out: Port, inp: Port, inpAlt?: Port) => {
    setPorts(p => {
      const prev = p[id]
      if (prev && Math.abs(prev.out.x-out.x)<1 && Math.abs(prev.out.y-out.y)<1 &&
                  Math.abs(prev.inp.x-inp.x)<1 && Math.abs(prev.inp.y-inp.y)<1 &&
                  (!inpAlt || (prev.inpAlt && Math.abs(prev.inpAlt.x-inpAlt.x)<1 && Math.abs(prev.inpAlt.y-inpAlt.y)<1))) return p
      return {...p, [id]: {out, inp, ...(inpAlt ? {inpAlt} : {})}}
    })
  }, [])

  const onFocus = useCallback((id: string) => {
    setFocusedNode(id)
    setZOrders(p => {
      const normalized = Object.fromEntries(
        Object.entries(p)
          .filter(([nodeId]) => nodeId !== id)
          .sort(([, a], [, b]) => a - b)
          .map(([nodeId], index) => [nodeId, NODE_Z_BASE + index])
      )
      return {...normalized, [id]: NODE_Z_CLICK}
    })
  }, [])

  const onExpandChange = useCallback((id: string, open: boolean) => {
    setExpandedNode(current => open ? id : current === id ? null : current)
  }, [])

  const toggleOutputMode = useCallback((mode: OutputMode) => {
    if (isActive) return

    if (imageModeLoadTimerRef.current) {
      clearTimeout(imageModeLoadTimerRef.current)
      imageModeLoadTimerRef.current = null
    }
    pendingImageModeRef.current = null

    if (mode === 'VIDEO') {
      setOutpaintGuideVisible(false)
      cancelUpscaleIntro()
      endUpscaleDrag()
      setImageModeLoading(false)
      setOutputModes(current => current.includes('VIDEO') ? [] : ['VIDEO'])
      return
    }

    setVideoReady(false)
    setVideoPlaying(false)

    if (outputModes.includes(mode)) {
      setImageModeLoading(false)
      setOutputModes(current => current.filter(item => item !== mode))
      return
    }

    pendingImageModeRef.current = mode
    setImageModeLoading(true)
    imageModeLoadTimerRef.current = setTimeout(() => {
      imageModeLoadTimerRef.current = null
      if (pendingImageModeRef.current !== mode) return
      pendingImageModeRef.current = null
      setImageModeLoading(false)
      setOutputModes(current => [...current.filter(item => item !== 'VIDEO'), mode])
    }, IMAGE_MODE_LOAD_SIM_MS)
  }, [cancelUpscaleIntro, endUpscaleDrag, isActive, outputModes])

  const onPromptExpandChange = useCallback((open: boolean) => onExpandChange('prompt', open), [onExpandChange])
  const onWorkflowExpandChange = useCallback((open: boolean) => onExpandChange('erfahrung', open), [onExpandChange])
  const onDirectionExpandChange = useCallback((open: boolean) => onExpandChange('vision', open), [onExpandChange])

  useEffect(() => {
    document.body.classList.toggle('ai-expand-hover', expandedNode !== null)
    return () => document.body.classList.remove('ai-expand-hover')
  }, [expandedNode])

  const generate = useCallback(() => {
    if (isActive) return
    if (imageModeLoadTimerRef.current) {
      clearTimeout(imageModeLoadTimerRef.current)
      imageModeLoadTimerRef.current = null
    }
    pendingImageModeRef.current = null
    setImageModeLoading(false)
    const generationPixelSize = MIN_OUTPUT_PIXEL_SIZE
    setOutputFormat(pendingOutputFormat)
    setOutputModes([])
    setVideoReady(false)
    setVideoPlaying(false)
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
      if (now - lastPhaseSet > 34 || t >= 1) { lastPhaseSet = now; setPhase(t) }

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
  const currentImageIndex = curImgIdx.current
  const currentWorkflowPrompt = AI_PROMPTS[currentImageIndex] ?? AI_PROMPTS[INITIAL_AI_IMAGE_INDEX]
  const currentWorkflowLog = isActive
    ? buildActiveWorkflowLog(currentWorkflowPrompt, currentImageIndex, lang, phase)
    : buildCompletedWorkflowLog(currentWorkflowPrompt, currentImageIndex, lang)

  // Always render the outer wrapper with sectionRef attached so we can measure
  if (!mounted) return (
    <div ref={outerRef} id="ai-section" data-textcolor="white" style={{ position:'relative', zIndex:isMobile ? 50 : 40, height:isMobile ? '230svh' : '240vh', marginTop:isMobile ? 'calc(-1 * var(--mobile-flow-overlap-ai))' : '-420vh' }}>
      <section ref={sectionRef} id="ki" style={{ position:'sticky', top:0, backgroundColor:'#000', height:'var(--app-visual-height, 100svh)' }}/>
    </div>
  )

  const VW = dims?.w ?? width
  const VH = dims?.h ?? visualHeight

  if (isMobile) {
    return (
      <div ref={outerRef} id="ai-section" data-textcolor="white" style={{ position: 'relative', zIndex: 50, height: '280svh', marginTop: 'calc(-1 * var(--mobile-flow-overlap-ai))' }}>
        <section ref={sectionRef} id="ki" style={{ position: 'sticky', top: 0, height: 'var(--app-visual-height, 100svh)', overflow: 'hidden', background: '#020503' }}>
          <MobileDesktopWorkspace
            lang={lang}
            previewRef={previewRef}
            canvasRef={canvasRef}
            isActive={isActive}
            phase={phase}
            exitP={exitP}
            generate={generate}
            outputFormat={outputFormat}
            outpaintReveal={outpaintReveal}
            pendingOutputFormat={pendingOutputFormat}
            setPendingOutputFormat={setPendingOutputFormat}
            outputModes={outputModes}
            toggleOutputMode={toggleOutputMode}
            imageModeLoading={imageModeLoading}
            modeGlowStage={modeGlowStage}
            currentWorkflowPrompt={currentWorkflowPrompt}
            currentImageIndex={currentImageIndex}
            isUpscaleMode={isUpscaleMode}
            isVideoMode={isVideoMode}
            activeVideoSrc={activeVideoSrc}
            upscaleCanvasRef={upscaleCanvasRef}
            videoRef={videoRef}
            videoCanvasRef={videoCanvasRef}
            upscaleSplit={upscaleSplit}
            upscalePixelReveal={upscalePixelReveal}
            upscaleIntroActive={upscaleIntroActive}
            beginUpscaleDrag={beginUpscaleDrag}
            setUpscaleSplitFromClientX={setUpscaleSplitFromClientX}
            endUpscaleDrag={endUpscaleDrag}
            outpaintGuideIsVisible={outpaintGuideIsVisible}
            outpaintGuideInset={outpaintGuideInset}
            outpaintGuideOpacity={outpaintGuideOpacity}
            videoReady={videoReady}
            videoPlaying={videoPlaying}
            setVideoCanPlay={setVideoCanPlay}
            toggleVideoPlayback={toggleVideoPlayback}
            ports={ports}
            onPortChange={onPortChange}
            onFocus={onFocus}
            zOrders={zOrders}
            expandedNode={expandedNode}
            onPromptExpandChange={onPromptExpandChange}
            onWorkflowExpandChange={onWorkflowExpandChange}
            onDirectionExpandChange={onDirectionExpandChange}
            focusedNode={focusedNode}
          />
        </section>
      </div>
    )
  }

  // ── Mobile ────────────────────────────────────────────────────────────────
  if (isMobile) return (
    <div ref={outerRef} id="ai-section" data-textcolor="white" style={{ position:'relative', zIndex:50, height:'230svh', marginTop:'calc(-1 * var(--mobile-flow-overlap-ai))' }}>
      <style>{`
        @keyframes aiBlink{0%,100%{opacity:1}50%{opacity:0.1}}
        @keyframes spin{0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}}
        @keyframes spinReverse{0%{transform:rotate(0deg)}100%{transform:rotate(-360deg)}}
        @keyframes terminalScroll{0%{transform:translateY(0)}100%{transform:translateY(-50%)}}
        @font-face{font-family:'Borna';src:url('/fonts/Borna-Medium.otf') format('opentype');font-weight:500;font-display:swap}
        @font-face{font-family:'Borna';src:url('/fonts/Borna-Bold.otf') format('opentype');font-weight:700;font-display:swap}
        @font-face{font-family:'Borna';src:url('/fonts/Borna-SemiBold.otf') format('opentype');font-weight:600;font-display:swap}
        body.ai-section-cursor-active .custom-cursor{display:none!important;opacity:0!important;visibility:hidden!important}
        #ki,#ki *{cursor:none!important}
        body:has(#ki:hover) .custom-cursor{display:none!important;opacity:0!important;visibility:hidden!important}
        .ai-pixel-cursor{image-rendering:pixelated;image-rendering:crisp-edges}
        #ki:hover .ai-pixel-cursor,body.ai-section-cursor-active #ki .ai-pixel-cursor{opacity:1!important}
      `}</style>
      <section
        ref={sectionRef}
        id="ki"
        onPointerEnter={moveAiCursor}
        onPointerMove={moveAiCursor}
        onPointerLeave={hideAiCursor}
        onPointerDownCapture={pressAiCursor}
        onPointerUpCapture={releaseAiCursor}
        style={{ position:'sticky', top:0, backgroundColor:'#000', height:'var(--app-visual-height, 100svh)', boxSizing:'border-box', overflow:'hidden', cursor:AI_CURSOR_NORMAL }}
      >
        <GridBg/>
        <div className="mobile-section-shell" style={{ position:'relative', zIndex:3, height:'100%', boxSizing:'border-box', paddingBottom:'5vw', display:'flex', flexDirection:'column', justifyContent:'space-between', gap: 12, filter:exitP>0.02?`blur(calc(${exitP} * var(--mobile-exit-blur)))`:'none', opacity:1-exitP*0.9, transform:`scale(${1-exitP*0.04})`, transformOrigin:'center top', willChange:'filter,opacity,transform' }}>
          <NeonHeading/>
          
          {/* ═══ ARTISTIC INTELLIGENCE INTERFACE ═══ */}
          <div style={{ position: 'relative', background: '#111', border: '1px solid rgba(57,255,20,0.3)', overflow: 'hidden' }}>
            
            {/* Terminal Background Layer */}
            <div style={{ 
              position: 'absolute', 
              inset: 0, 
              opacity: isActive ? 0.2 : 0.1,
              overflow: 'hidden',
              pointerEvents: 'none',
              transition: 'opacity 0.5s',
              backgroundImage: 'radial-gradient(circle at 22% 18%,rgba(170,255,130,0.13),transparent 30%),linear-gradient(rgba(57,255,20,0.05) 50%,rgba(0,0,0,0.11) 50%)',
              backgroundSize: '100% 100%,100% 4px',
              boxShadow: 'inset 0 0 32px rgba(57,255,20,0.14)'
            }}>
              <div style={{ 
                fontFamily: MONO, 
                fontSize: 8, 
                color: '#8cff74', 
                lineHeight: 1.4,
                padding: 8,
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                textShadow: '0 0 5px rgba(57,255,20,0.62)'
              }}>
                {currentWorkflowLog.map((l, i) => {
                  const isPromptLine = l.c.startsWith('prompt =')
                  return <div key={i} style={{ opacity: isActive && phase * currentWorkflowLog.length > i ? 1 : 0.38, color:isPromptLine?'#d8ffc8':'inherit', textShadow:isPromptLine?'0 0 5px rgba(230,255,210,0.94),0 0 12px rgba(57,255,20,0.68)':'inherit' }}>{l.c}</div>
                })}
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
                  <svg width={80} height={80} style={{ filter: CRT_DROP_GLOW }}>
                    <circle cx={40} cy={40} r={35} fill="none" stroke={CRT_GREEN_DIM} strokeWidth={2}/>
                    <circle cx={40} cy={40} r={35} fill="none" stroke={CRT_GREEN} strokeWidth={2}
                      strokeDasharray={`${2*Math.PI*35*phase} ${2*Math.PI*35*(1-phase)}`} strokeLinecap="round"
                      style={{ transformOrigin:'40px 40px', transform: 'rotate(-90deg)' }}/>
                    <circle cx={40} cy={40} r={24} fill="rgba(0,0,0,0.6)" stroke={CRT_GREEN_SOFT} strokeWidth={1}/>
                    <text x={40} y={44} textAnchor="middle" fill={CRT_GREEN} fontSize={14} fontFamily={MONO} fontWeight="bold" style={{ textShadow: CRT_GLOW }}>{Math.round(phase*100)}%</text>
                  </svg>
                </div>
              )}
              
            </div>
            
            {/* Workflow Button */}
            <button onClick={() => generate()} disabled={isActive}
              style={{ 
                display: 'block',
                width: '100%',
                background: isActive ? 'rgba(57,255,20,0.1)' : CRT_GREEN, 
                border: 'none',
                color: isActive ? CRT_GREEN : '#000', 
                padding: '12px', 
                fontFamily: BORNA, 
                fontSize: 12, 
                letterSpacing: '0.1em', 
                cursor: isActive ? 'not-allowed' : 'pointer', 
                fontWeight: 800,
                textTransform: 'uppercase',
                textShadow: isActive ? CRT_GLOW : 'none',
                boxShadow: isActive ? `inset 0 0 14px rgba(57,255,20,0.2),${CRT_BOX_GLOW}` : `0 0 14px rgba(57,255,20,0.28)`,
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
                <span style={{ color: CRT_GREEN, fontSize: 10, textShadow: CRT_GLOW }}>◈</span>
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
                      color: CRT_GREEN, 
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
                <span style={{ color: CRT_GREEN, fontSize: 10, textShadow: CRT_GLOW }}>◈</span>
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
        <img
          ref={aiCursorImgRef}
          className="ai-pixel-cursor"
          src={AI_CURSOR_SRC.normal}
          alt=""
          aria-hidden="true"
          draggable={false}
          style={{
            position:'absolute',
            left:0,
            top:0,
            width:AI_CURSOR_SIZE.normal.width * AI_CURSOR_RENDER_SCALE,
            height:'auto',
            opacity:0,
            pointerEvents:'none',
            zIndex:2000000,
            transform:`translate3d(calc(var(--ai-cursor-x, -100px) - var(--ai-cursor-hotspot-x, ${AI_CURSOR_HOTSPOT.normal.x * AI_CURSOR_RENDER_SCALE}px)), calc(var(--ai-cursor-y, -100px) - var(--ai-cursor-hotspot-y, ${AI_CURSOR_HOTSPOT.normal.y * AI_CURSOR_RENDER_SCALE}px) + ${AI_CURSOR_RENDER_OFFSET_Y}px), 0)`,
            transformOrigin:'top left',
            transition:'opacity 60ms linear',
            filter:exitP>0.02?`blur(${exitP*18}px)`:'none',
            userSelect:'none',
            willChange:'transform,opacity,filter',
          }}
        />
        <div
          aria-hidden="true"
          style={{
            position:'absolute',
            inset:0,
            // The vignette sits above the artwork so its edge falloff also
            // shades the cursor, nodes, and cables consistently.
            zIndex:2000001,
            pointerEvents:'none',
            background:'radial-gradient(ellipse at center, transparent 48%, rgba(0,0,0,0.025) 56%, rgba(0,0,0,0.08) 67%, rgba(0,0,0,0.22) 77%, rgba(0,0,0,0.5) 88%, rgba(0,0,0,0.82) 95%, rgba(0,0,0,0.98) 100%)',
          }}
        />
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
  const NODE_STACK_Y_OFFSET = Math.max(
    0,
    Math.round((VW - AI_NODE_REFERENCE_W) * 0.14),
    Math.round((VH - AI_NODE_REFERENCE_H) * 0.12)
  ) - 24
  const C1 = Math.round(VW * 0.088)   // GENERATE + PROMPT DESIGN
  const C2 = Math.round(VW * 0.286)   // WORKFLOW + VISION
  const C3 = Math.round(VW * 0.495)   // MODES
  const C6 = Math.round(VW * 0.530)   // MODES
  const FORMAT_LEFT = C6
  const C4 = Math.round(VW * 0.500)   // TERMINAL
  const C5 = Math.round(VW * 0.774)   // PROGRESS

  const TERM_TOP     = Math.round(VH * 0.151) + NODE_STACK_Y_OFFSET  // TERMINAL + PIPELINE (oben)
  const PROGRESS_TOP = Math.round(VH * 0.214) + NODE_STACK_Y_OFFSET  // PROGRESS
  const GEN_TOP      = Math.round(VH * 0.532) + NODE_STACK_Y_OFFSET  // GENERATE
  const PROMPT_TOP   = Math.max(Math.round(VH * 0.680) + NODE_STACK_Y_OFFSET, GEN_TOP + 126)  // PROMPT DESIGN
  const ERF_TOP      = Math.round(VH * 0.521) + NODE_STACK_Y_OFFSET  // WORKFLOW
  const VIS_TOP      = Math.max(Math.round(VH * 0.661) + NODE_STACK_Y_OFFSET, ERF_TOP + 118)  // VISION
  const UPS_TOP      = Math.round(VH * 0.495) + NODE_STACK_Y_OFFSET  // FORMAT
  const MODES_TOP    = Math.max(Math.round(VH * 0.641) + NODE_STACK_Y_OFFSET, UPS_TOP + 10)  // MODES
  const PREV_TOP   = Math.round(VH * 0.328) + NODE_STACK_Y_OFFSET  // OUTPUT
  const PREV_LEFT  = Math.round(VW * 0.638)

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
        .ai-video-control{transition:transform 0.14s ease,opacity 0.14s ease;transform-origin:center;opacity:0.94}
        .ai-video-control:hover{opacity:1}
        .ai-video-control:active{opacity:1}
        body.ai-expand-hover .custom-cursor{display:none!important;opacity:0!important;visibility:hidden!important}
        body.ai-section-cursor-active .custom-cursor{display:none!important;opacity:0!important;visibility:hidden!important}
        #ki{cursor:${AI_CURSOR_NORMAL}}
        #ki,#ki *{cursor:none!important}
        #ki section{cursor:${AI_CURSOR_NORMAL}}
        #ki [data-ai-node],#ki [data-ai-node] *{cursor:${AI_CURSOR_OPEN}!important}
        #ki [data-ai-node]:active,#ki [data-ai-node]:active *{cursor:${AI_CURSOR_FIST}!important}
        body.ai-node-dragging #ki,body.ai-node-dragging #ki *{cursor:${AI_CURSOR_FIST}!important}
        body:has(#ki:hover) .custom-cursor{display:none!important;opacity:0!important;visibility:hidden!important}
        .ai-pixel-cursor{image-rendering:pixelated;image-rendering:crisp-edges}
        #ki:hover .ai-pixel-cursor,body.ai-section-cursor-active #ki .ai-pixel-cursor{opacity:1!important}
      `}</style>

      <section
        ref={sectionRef}
        id="ki"
        onPointerEnter={moveAiCursor}
        onPointerMove={moveAiCursor}
        onPointerLeave={hideAiCursor}
        onPointerDownCapture={pressAiCursor}
        onPointerUpCapture={releaseAiCursor}
        style={{ position:'sticky', top:0, backgroundColor:'#000', overflow:'hidden', height:'var(--app-visual-height, 100svh)', boxSizing:'border-box', cursor:AI_CURSOR_NORMAL }}
      >
        <GridBg/>

        <div style={{ position:'absolute', inset:0, zIndex:5, filter:exitP>0.02?`blur(${exitP*18}px)`:'none', opacity:1-exitP*0.9, transform:`scale(${1-exitP*0.04})`, transformOrigin:'center top', willChange:'filter,opacity,transform' }}>
          <CablesLayer ports={ports} phase={phase} isActive={isActive} exitP={exitP} modeSelected={outputModes.length > 0} modeGlowStage={modeGlowStage} nodeZOrders={zOrders} focusedNode={focusedNode}/>

          <div style={{ position:'absolute', top:'9vw', left:'9vw', zIndex:AI_HEADING_Z, pointerEvents:'none' }}>
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
          <Win id="upscale" title="FORMAT" width={controlNodeWidth} initPos={{x:FORMAT_LEFT, y:UPS_TOP}} onPortChange={onPortChange} onFocus={onFocus} zIndex={zOrders.upscale} lit={wLit(2)}>
            <div style={{...cs, display:'grid', gridTemplateColumns:'repeat(3, 46px)', justifyContent:'center', gap:6}}>
              {FORMAT_OPTIONS.map(ratio => (
                <button
                  key={ratio}
                  type="button"
                  className="ai-format-btn"
                  aria-pressed={pendingOutputFormat===ratio}
                  onPointerDown={(event) => event.stopPropagation()}
                  onMouseDown={(event) => event.stopPropagation()}
                  onPointerEnter={() => setHoveredControl(`format-${ratio}`)}
                  onPointerLeave={() => setHoveredControl(null)}
                  onClick={() => setPendingOutputFormat(ratio)}
                  style={{ ...controlButtonBase, width:46, height:46, padding:0, display:'inline-flex', alignItems:'center', justifyContent:'center', textAlign:'center', letterSpacing:'0.03em', background:pendingOutputFormat===ratio?'#000':'rgba(0,0,0,0.08)', color:pendingOutputFormat===ratio?'#fff':'#111', borderColor:hoveredControl===`format-${ratio}`?'rgba(0,0,0,0.48)':'rgba(0,0,0,0.18)', transform:hoveredControl===`format-${ratio}`?'scale(0.96)':'none' }}
                >{ratio}</button>
              ))}
            </div>
          </Win>

          {/* MODES */}
          <Win id="modes" title="MODES" width={controlNodeWidth} initPos={{x:C3, y:MODES_TOP}} onPortChange={onPortChange} onFocus={onFocus} zIndex={zOrders.modes} lit={modeGlowStage >= 1} glowTone="orange">
            <div style={{...cs, display:'grid', gridTemplateColumns:'1fr', gap:6}}>
              {OUTPUT_MODE_OPTIONS.map(mode => (
                <button
                  key={mode}
                  type="button"
                  className="ai-mode-btn"
                  aria-pressed={outputModes.includes(mode)}
                  aria-disabled={isActive}
                  disabled={isActive}
                  onPointerDown={(event) => event.stopPropagation()}
                  onMouseDown={(event) => event.stopPropagation()}
                  onPointerEnter={() => setHoveredControl(`mode-${mode}`)}
                  onPointerLeave={() => setHoveredControl(null)}
                  onClick={() => toggleOutputMode(mode)}
                  style={{ ...controlButtonBase, display:'flex', alignItems:'center', gap:6, background:outputModes.includes(mode)?'#000':'rgba(0,0,0,0.08)', color:outputModes.includes(mode)?'#fff':'#111', borderColor:hoveredControl===`mode-${mode}`?'rgba(0,0,0,0.48)':'rgba(0,0,0,0.18)', cursor:isActive?'default':'pointer', opacity:isActive?0.42:1, transform:hoveredControl===`mode-${mode}` && !isActive?'scale(0.96)':'none' }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={`/icons/modes-0${OUTPUT_MODE_OPTIONS.indexOf(mode)+1}.png`} alt="" width={10} height={10} style={{width:'1em',height:'1em',display:'block',flexShrink:0,filter:outputModes.includes(mode)?'invert(1)':'none'}}/>
                  {OUTPUT_MODE_LABELS[mode]}
                </button>
              ))}
            </div>
          </Win>

          {/* TERMINAL */}
          <Win id="terminal" title="WORKFLOW LOG" width={390} initPos={{x:C4, y:TERM_TOP}} onPortChange={onPortChange} onFocus={onFocus} zIndex={zOrders.terminal} lit={wLit(4)} minH={250}>
            <div style={{ height:238, background:'#010a03', overflow:'hidden', boxShadow:'inset 0 0 22px rgba(57,255,20,0.18)' }}><CrazyTerminal phase={phase} isActive={isActive} lang={lang} prompt={currentWorkflowPrompt} imageIndex={currentImageIndex}/></div>
          </Win>

          {/* PROGRESS */}
          <Win id="progress" title="PROGRESS" width={205} initPos={{x:C5, y:PROGRESS_TOP}} onPortChange={onPortChange} onFocus={onFocus} zIndex={zOrders.progress} lit={wLit(5)}>
            <div style={{ height:42, background:'#010a03', boxShadow:'inset 0 0 18px rgba(57,255,20,0.16)' }}><ProgressTerm phase={phase} isActive={isActive}/></div>
          </Win>

          {/* OUTPUT */}
          <Win id="preview" title="OUTPUT" width={outputWinWidth} initPos={{x:PREV_LEFT, y:PREV_TOP}} offset={outputWindowOffset} onPortChange={onPortChange} zIndex={zOrders.preview} onFocus={onFocus} lit={wLit(6) || modeGlowStage >= 3} glowTone={modeGlowStage > 0 ? 'orange' : 'green'} emitAltInp altInpY={52} inpAtFrac={0.91}>
            <div style={{ width:'100%', height:outputShellHeight, position:'relative', overflow:'hidden', background:'#111', transition:'none', boxSizing:'border-box' }}>
              <div ref={previewRef} style={{ position:'absolute', left:'50%', top:'50%', transform:'translate(-50%,-50%)', width:previewFrameWidth, aspectRatio:outputAspect, overflow:'hidden', background:'#111' }}>
                <canvas ref={canvasRef} style={{ position:'absolute', inset:0, width:'100%', height:'100%', display:'block' }}/>
                {outpaintGuideIsVisible && <div data-ai-outpaint-guide style={{ position:'absolute', inset:outpaintGuideInset, border:'1px dashed rgba(255,255,255,0.76)', opacity:outpaintGuideOpacity, zIndex:5, pointerEvents:'none' }}/>} 
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
                    <div style={{ position:'absolute', left:12, top:0, bottom:0, width:3, background:'#fff' }}/>
                  </div>
              </>} 
              {isVideoMode && <div data-ai-mode-effect="video" style={{ position:'absolute', inset:0, zIndex:6, pointerEvents:'none' }}>
                {activeVideoSrc && <video
                  key={activeVideoSrc}
                  ref={videoRef}
                  src={activeVideoSrc}
                  preload="auto"
                  loop
                  muted
                  playsInline
                  onLoadedData={() => setVideoCanPlay(true)}
                  onCanPlay={() => setVideoCanPlay(true)}
                  style={{ position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover', opacity:0, zIndex:1 }}
                />}
                <canvas ref={videoCanvasRef} style={{ position:'absolute', inset:0, width:'100%', height:'100%', display:'block', opacity:videoReady ? 1 : 0, transition:'opacity 0.18s ease', zIndex:2 }}/>
                {!videoReady ? (
                  <ModeLoadingIndicator />
                ) : <>
                  <button
                    type="button"
                    className="ai-video-control"
                    data-ai-video-play
                    aria-label={videoPlaying ? 'Pause preview' : 'Play preview'}
                    onPointerEnter={() => setHoveredControl('video-play')}
                    onPointerLeave={() => setHoveredControl(null)}
                    onMouseEnter={() => setHoveredControl('video-play')}
                    onMouseLeave={() => setHoveredControl(null)}
                    onMouseDown={(event) => event.stopPropagation()}
                    onClick={(event) => { event.stopPropagation(); toggleVideoPlayback() }}
                    style={{ position:'absolute', left:'50%', top:'50%', transform:`translate(-50%,-50%) scale(${hoveredControl === 'video-play' ? 1.16 : 1})`, transition:'transform 0.14s ease,opacity 0.14s ease', width:44, height:44, border:0, padding:0, background:'transparent', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', pointerEvents:'auto', filter:'drop-shadow(0 1px 6px rgba(0,0,0,0.82))', zIndex:4 }}
                  >
                    {videoPlaying ? (
                      <span style={{ width:18, height:23, display:'flex', gap:6, alignItems:'stretch' }}>
                        <span style={{ flex:1, background:'#fff' }}/>
                        <span style={{ flex:1, background:'#fff' }}/>
                      </span>
                    ) : (
                      <span style={{ width:0, height:0, borderTop:'12px solid transparent', borderBottom:'12px solid transparent', borderLeft:'20px solid #fff', marginLeft:5 }} />
                    )}
                  </button>
                </>}
              </div>}
              {imageModeLoading && !isVideoMode && <div data-ai-image-mode-loading style={{ position:'absolute', inset:0, zIndex:7, pointerEvents:'none' }}><ModeLoadingIndicator /></div>}
              </div>
            </div>
          </Win>

        </div>
        <img
          ref={aiCursorImgRef}
          className="ai-pixel-cursor"
          src={AI_CURSOR_SRC.normal}
          alt=""
          aria-hidden="true"
          draggable={false}
          style={{
            position:'absolute',
            left:0,
            top:0,
            width:AI_CURSOR_SIZE.normal.width * AI_CURSOR_RENDER_SCALE,
            height:'auto',
            opacity:0,
            pointerEvents:'none',
            zIndex:2000000,
            transform:`translate3d(calc(var(--ai-cursor-x, -100px) - var(--ai-cursor-hotspot-x, ${AI_CURSOR_HOTSPOT.normal.x * AI_CURSOR_RENDER_SCALE}px)), calc(var(--ai-cursor-y, -100px) - var(--ai-cursor-hotspot-y, ${AI_CURSOR_HOTSPOT.normal.y * AI_CURSOR_RENDER_SCALE}px) + ${AI_CURSOR_RENDER_OFFSET_Y}px), 0)`,
            transformOrigin:'top left',
            transition:'opacity 60ms linear',
            filter:exitP>0.02?`blur(${exitP*18}px)`:'none',
            userSelect:'none',
            willChange:'transform,opacity,filter',
          }}
        />
        <div
          aria-hidden="true"
          style={{
            position:'absolute',
            inset:0,
            // The vignette sits above the artwork so its edge falloff also
            // shades the cursor, nodes, and cables consistently.
            zIndex:2000001,
            pointerEvents:'none',
            background:'radial-gradient(ellipse at center, transparent 48%, rgba(0,0,0,0.025) 56%, rgba(0,0,0,0.08) 67%, rgba(0,0,0,0.22) 77%, rgba(0,0,0,0.5) 88%, rgba(0,0,0,0.82) 95%, rgba(0,0,0,0.98) 100%)',
          }}
        />
      </section>
    </div>
  )
}