'use client'
import { useRef, useEffect, useState, useCallback } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'

// ─── Scramble ─────────────────────────────────────────────────────────────────
const CHARS = '!@#$%&*АБВГДЕЖИКЛМНОПРСТУФХЦ'
function runScramble(target:string,set:(s:string)=>void,ref:React.MutableRefObject<ReturnType<typeof setInterval>|null>){
  let i=0;const rev=new Set<number>()
  if(ref.current)clearInterval(ref.current)
  ref.current=setInterval(()=>{
    i++;const pool=target.split('').map((_,j)=>j).filter(j=>!rev.has(j)&&target[j]!==' '&&target[j]!=='\n')
    if(pool.length)rev.add(pool[Math.floor(Math.random()*pool.length)])
    set(target.split('').map((c,j)=>rev.has(j)||c===' '||c==='\n'?target[j]:CHARS[Math.floor(Math.random()*CHARS.length)]).join(''))
    if(i>=16){clearInterval(ref.current!);set(target)}
  },30)
}
function useScramble(text:string){
  const [disp,setDisp]=useState(text)
  const ref=useRef<ReturnType<typeof setInterval>|null>(null)
  const prev=useRef(text)
  useEffect(()=>{if(prev.current!==text){prev.current=text;runScramble(text,setDisp,ref)}},[text])
  const scramble=useCallback(()=>runScramble(text,setDisp,ref),[text])
  return {disp,scramble}
}

// ─── StaticHeadingGWA ────────────────────────────────────────────────────────
function StaticHeadingGWA() {
  const { language } = useLanguage()
  const {disp:d1,scramble:s1}=useScramble('Junior Agency')
  const {disp:d2,scramble:s2}=useScramble('Award 2026')
  const scramble=()=>{s1();s2()}
  useEffect(()=>{scramble()},[language]) // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <div onMouseEnter={scramble} style={{
      fontSize:'8vw',fontWeight:900,lineHeight:0.9,letterSpacing:'-2px',
      textTransform:'uppercase',color:'#0a0a0a',margin:0,cursor:'default',userSelect:'none',
    }}>
      <div style={{whiteSpace:'nowrap'}}>{d1}</div>
      <div style={{whiteSpace:'nowrap'}}>{d2}</div>
    </div>
  )
}

// ─── Trophy3D ────────────────────────────────────────────────────────────────
function Trophy3D({ sectionRef }: { sectionRef: React.RefObject<HTMLDivElement> }) {
  const mountRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = mountRef.current
    if (!el) return
    let cancelled = false
    let cleanupFn: (() => void) | null = null
    const init = async () => {
      const THREE = await import('three')
      const { GLTFLoader } = await import('three/addons/loaders/GLTFLoader.js') as any
      const { OrbitControls } = await import('three/addons/controls/OrbitControls.js') as any
      if (cancelled) return
      const w = el.clientWidth; const h = el.clientHeight || 500
      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
      renderer.setSize(w, h); renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
      renderer.outputColorSpace = THREE.SRGBColorSpace
      renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap
      renderer.setClearColor(0x000000, 0); el.appendChild(renderer.domElement)
      const scene = new THREE.Scene()
      const camera = new THREE.PerspectiveCamera(42, w / h, 0.01, 100)
      camera.position.set(0, 0.2, 2.2)
      scene.add(new THREE.AmbientLight(0xfff8f0, 1.4))
      const key = new THREE.DirectionalLight(0xffffff, 3.0); key.position.set(3, 5, 4); key.castShadow = true; scene.add(key)
      const fill = new THREE.DirectionalLight(0xfff0d0, 1.2); fill.position.set(-4, 2, -2); scene.add(fill)
      const rim = new THREE.DirectionalLight(0xffe0a0, 0.8); rim.position.set(0, -3, -4); scene.add(rim)
      const topLight = new THREE.DirectionalLight(0xffffff, 0.6); topLight.position.set(0, 8, 0); scene.add(topLight)
      const controls = new OrbitControls(camera, renderer.domElement)
      controls.enableDamping = true; controls.dampingFactor = 0.07
      controls.enablePan = false; controls.enableZoom = false
      controls.minDistance = 2.8; controls.maxDistance = 2.8
      controls.autoRotate = false; controls.target.set(0, 0, 0)
      const targetRot = { x: 0, y: 0 }
      const onMouseMove = (e: MouseEvent) => {
        const sec = sectionRef.current; if (!sec) return
        const sr = sec.getBoundingClientRect()
        if (e.clientX < sr.left || e.clientX > sr.right || e.clientY < sr.top || e.clientY > sr.bottom) return
        targetRot.x = ((e.clientY - (sr.top + sr.height / 2)) / (sr.height / 2)) * 0.3
        targetRot.y = ((e.clientX - (sr.left + sr.width / 2)) / (sr.width / 2)) * 0.3
      }
      window.addEventListener('mousemove', onMouseMove)
      let loadedModel: any = null
      new GLTFLoader().load('/models/figur01.glb', (gltf: any) => {
        if (cancelled) return
        const model = gltf.scene
        const box = new THREE.Box3().setFromObject(model)
        const center = box.getCenter(new THREE.Vector3()); const size = box.getSize(new THREE.Vector3())
        const scale = 1.6 / Math.max(size.x, size.y, size.z)
        model.position.copy(center.multiplyScalar(-scale)); model.scale.setScalar(scale)
        model.traverse((c: any) => { if (c.isMesh) { c.castShadow = true; c.receiveShadow = true } })
        scene.add(model); loadedModel = model; controls.update()
      }, undefined, (err: any) => console.error('GLB load error:', err))
      const onResize = () => {
        const nw = el.clientWidth; const nh = el.clientHeight || 500
        camera.aspect = nw / nh; camera.updateProjectionMatrix(); renderer.setSize(nw, nh)
      }
      window.addEventListener('resize', onResize)
      let rafId = 0; const currentRot = { x: 0, y: 0 }
      const animate = () => {
        rafId = requestAnimationFrame(animate)
        currentRot.x += (targetRot.x - currentRot.x) * 0.06
        currentRot.y += (targetRot.y - currentRot.y) * 0.06
        if (loadedModel) { loadedModel.rotation.x = currentRot.x; loadedModel.rotation.y = currentRot.y }
        controls.update(); renderer.render(scene, camera)
      }
      animate()
      cleanupFn = () => {
        cancelAnimationFrame(rafId); window.removeEventListener('resize', onResize)
        window.removeEventListener('mousemove', onMouseMove); controls.dispose(); renderer.dispose()
        if (el.contains(renderer.domElement)) el.removeChild(renderer.domElement)
      }
    }
    init()
    return () => { cancelled = true; cleanupFn?.() }
  }, []) // eslint-disable-line
  return <div ref={mountRef} style={{ width:'100%', height:'100%', cursor:'grab', background:'transparent', display:'block' }} />
}

// ─── AwardBadge – einheitlich schwarz/weiß ────────────────────────────────────
function AwardBadge({ label }: { label: string }) {
  const [hov, setHov] = useState(false)
  return (
    <span onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)} style={{
      display: 'inline-block', backgroundColor: hov ? '#333' : '#0a0a0a', color: '#ffffff',
      fontSize: 10, fontWeight: 800, letterSpacing: '0.14em', textTransform: 'uppercase',
      padding: '7px 14px', transform: hov ? 'scale(0.96)' : 'scale(1)', transition: 'all 0.15s ease', cursor: 'default',
    }}>{label}</span>
  )
}

// ─── LogoRow – drei Logos mit × dazwischen ────────────────────────────────────
function LogoRow() {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 'clamp(12px,2vw,28px)',
      marginBottom: 'clamp(28px,3.5vw,48px)',
    }}>
      {[
        { src: '/images/hsh-logo.png',     alt: 'HSH' },
        { src: '/images/hateaid-logo.png', alt: 'HateAid' },
        { src: '/images/cc-logo.png',      alt: 'Creative Team' },
      ].map((logo, i) => (
        <div key={logo.alt} style={{ display: 'flex', alignItems: 'center', gap: 'clamp(12px,2vw,28px)' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={logo.src} alt={logo.alt}
            style={{ height: 'clamp(56px,7.5vw,110px)', width: 'auto', objectFit: 'contain', filter: 'grayscale(1) contrast(1.2)' }}
          />
          {i < 2 && (
            <span style={{ color: '#0a0a0a', fontSize: 'clamp(24px,3.2vw,48px)', fontWeight: 900, lineHeight: 1, userSelect: 'none' }}>×</span>
          )}
        </div>
      ))}
    </div>
  )
}

// ─── ScrambleP – Fließtext mit Scramble bei Sprachwechsel ────────────────────
function ScrambleP({ text, style }: { text: string; style?: React.CSSProperties }) {
  const [disp, setDisp] = useState(text)
  const ref  = useRef<ReturnType<typeof setInterval>|null>(null)
  const prev = useRef(text)
  useEffect(() => {
    if (prev.current !== text) { prev.current = text; runScramble(text, setDisp, ref) }
  }, [text])
  return <p style={style}>{disp}</p>
}

// ─── ProcessTimeline ──────────────────────────────────────────────────────────
const PROCESS_STEPS = {
  de: ['Briefing', 'Strategie', 'Ideation', 'Creation', 'Pitch'],
  en: ['Briefing', 'Strategy', 'Ideation', 'Creation', 'Pitch'],
}
const PROCESS_HINTS = {
  de: [
    'Kundenbrief lesen, Ziele & Zielgruppe verstehen.',
    'Positionierung, Kanalwahl & Messaging entwickeln.',
    'Ideen generieren, Konzepte skizzieren & bewerten.',
    'Inhalte produzieren, Design & Copy finalisieren.',
    'Kampagne präsentieren & Feedback einarbeiten.',
  ],
  en: [
    'Read client brief, understand goals & audience.',
    'Define positioning, channels & messaging.',
    'Generate ideas, sketch & evaluate concepts.',
    'Produce content, finalise design & copy.',
    'Present campaign & incorporate feedback.',
  ],
}

function ProcessTimeline({ lang }: { lang: 'de' | 'en' }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [progress, setProgress] = useState(0)
  const [hovIdx,   setHovIdx]   = useState<number|null>(null)
  const steps = PROCESS_STEPS[lang]
  const hints = PROCESS_HINTS[lang]

  useEffect(() => {
    const fn = () => {
      const el = containerRef.current; if (!el) return
      const rect = el.getBoundingClientRect(); const vh = window.innerHeight
      const raw = (vh * 0.6 - rect.top) / (rect.height * 0.55)
      setProgress(Math.max(0, Math.min(1, raw)))
    }
    window.addEventListener('scroll', fn, { passive: true }); fn()
    return () => window.removeEventListener('scroll', fn)
  }, [])

  return (
    <div ref={containerRef} style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      {steps.map((step, i) => {
        const segStart = i / steps.length
        const segEnd   = (i + 1) / steps.length
        const segP     = Math.max(0, Math.min(1, (progress - segStart) / (segEnd - segStart)))
        const isActive = progress > segStart + 0.005
        const isHov    = hovIdx === i

        return (
          <div key={step} style={{ display: 'flex', flexDirection: 'column' }}>

            {/* Row: label + floating hint block */}
            <div
              onMouseEnter={() => setHovIdx(i)}
              onMouseLeave={() => setHovIdx(null)}
              style={{ display: 'flex', alignItems: 'center', gap: 'clamp(14px,1.6vw,24px)', cursor: 'default' }}
            >
              {/* Label */}
              <span style={{
                fontSize: 'clamp(24px,3.2vw,52px)', fontWeight: 900,
                letterSpacing: '-1px', lineHeight: 1.05, textTransform: 'uppercase',
                color: '#0a0a0a',
                opacity: isActive || isHov ? 1 : 0.18,
                transform: isHov ? 'translateX(4px)' : 'translateX(0)',
                transition: 'opacity 0.3s ease, transform 0.2s ease',
                whiteSpace: 'nowrap', userSelect: 'none', flexShrink: 0,
              }}>{step}</span>

              {/* Hint block – slides in, text wraps properly */}
              <div style={{
                overflow: 'hidden',
                maxWidth: isHov ? 320 : 0,
                opacity: isHov ? 1 : 0,
                transition: 'max-width 0.32s cubic-bezier(0.16,1,0.3,1), opacity 0.22s ease',
                flexShrink: 0,
              }}>
                <div style={{
                  backgroundColor: '#0a0a0a',
                  padding: '8px 14px',
                  width: 320,
                }}>
                  <span style={{
                    color: '#ffffff',
                    fontSize: 'clamp(9px,0.85vw,12px)',
                    fontWeight: 500,
                    letterSpacing: '0.04em',
                    lineHeight: 1.5,
                    whiteSpace: 'normal',
                    display: 'block',
                  }}>{hints[i]}</span>
                </div>
              </div>
            </div>

            {/* Vertical fill line between steps */}
            {i < steps.length - 1 && (
              <div style={{
                marginTop: 'clamp(8px,1.1vw,16px)',
                marginBottom: 'clamp(8px,1.1vw,16px)',
                marginLeft: 6,
                width: 4,
                height: 'clamp(24px,3.2vw,48px)',
                backgroundColor: 'rgba(10,10,10,0.08)',
                position: 'relative', overflow: 'hidden', borderRadius: 2,
              }}>
                <div style={{
                  position: 'absolute', top: 0, left: 0, right: 0,
                  height: `${segP * 100}%`,
                  backgroundColor: '#0a0a0a', borderRadius: 2,
                  transition: 'height 0.05s linear',
                }} />
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

// ─── ScrollLinkedVideo ────────────────────────────────────────────────────────
function ScrollLinkedVideo({ lang }: { lang: 'de' | 'en' }) {
  const wrapRef  = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const [scale, setScale] = useState(0.4)
  const [hovBtn, setHovBtn] = useState(false)
  const btnText = lang === 'de' ? 'Ansehen' : 'Watch'
  const { disp: btnDisp, scramble: btnScramble } = useScramble(btnText)

  // Scale on scroll
  useEffect(() => {
    const fn = () => {
      const el = wrapRef.current; if (!el) return
      const rect = el.getBoundingClientRect(); const vh = window.innerHeight
      const elCenter = rect.top + rect.height / 2
      const distFromCenter = elCenter - vh / 2
      const range = vh * 0.7
      const s = 1.2 - Math.min(1, Math.abs(distFromCenter) / range) * 0.8
      setScale(s)
    }
    window.addEventListener('scroll', fn, { passive: true }); fn()
    return () => window.removeEventListener('scroll', fn)
  }, [])

  // Autoplay when visible – runs once on mount, never resets video
  useEffect(() => {
    const video = videoRef.current; if (!video) return
    video.muted = true
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) video.play().catch(() => {})
      else video.pause()
    }, { threshold: 0.1 })
    obs.observe(video)
    return () => obs.disconnect()
  }, [])

  const VIDEO_W   = 560
  const VIDEO_H   = Math.round(VIDEO_W * 9 / 16)
  const BTN_H     = 42
  const GAP       = 18
  const CONTENT_H = VIDEO_H + GAP + BTN_H

  return (
    <div ref={wrapRef} style={{
      position: 'relative',
      width: VIDEO_W,
      height: CONTENT_H * scale,
      transition: 'height 0.06s linear',
      overflow: 'visible',
    }}>
      <div style={{
        position: 'absolute', top: 0, left: 0,
        display: 'flex', flexDirection: 'column', alignItems: 'flex-start',
        transform: `scale(${scale})`,
        transformOrigin: 'left top',
        transition: 'transform 0.06s linear',
        width: VIDEO_W,
      }}>
        <div style={{ width: VIDEO_W, height: VIDEO_H, overflow: 'hidden', flexShrink: 0 }}>
          <video
            ref={videoRef}
            src="/videos/gwavideo.mp4"
            loop playsInline preload="auto"
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
        </div>

        <a
          href="https://www.youtube.com/live/WTt66Ojzi44?si=ufzNc8ExJtfVg_mo&t=4409"
          target="_blank" rel="noopener noreferrer"
          onMouseEnter={() => { setHovBtn(true); btnScramble() }}
          onMouseLeave={() => setHovBtn(false)}
          style={{
            marginTop: GAP,
            display: 'inline-flex', alignItems: 'center', gap: 10,
            backgroundColor: hovBtn ? '#333' : '#0a0a0a',
            color: '#fff', fontSize: 11, fontWeight: 700,
            letterSpacing: '0.12em', textTransform: 'uppercase',
            padding: '11px 20px', textDecoration: 'none',
            transition: 'background-color 0.15s ease', cursor: 'pointer',
          }}
        >
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
            <polygon points="2,1 12,6.5 2,12" fill="#fff"/>
          </svg>
          {btnDisp}
        </a>
      </div>
    </div>
  )
}

// ─── Texte ────────────────────────────────────────────────────────────────────
const T = {
  award1: { de: '3. Platz', en: '3rd Place' },
  award2: { de: 'Making-Off Award', en: 'Making-Off Award' },
  award3: { de: 'Publikumspreis', en: 'Audience Award' },
  p1: {
    de: 'Beim GWA Junior Agency Award 2026 belegte unser Team Hannover den dritten Platz – und holte gleich zwei weitere Auszeichnungen: den Making-Off Award für die beste Behind-the-Scenes-Dokumentation und den Publikumspreis.',
    en: 'At the GWA Junior Agency Award 2026 our Hannover team secured third place – and took home two additional prizes: the Making-Off Award for best behind-the-scenes documentation and the Audience Award.',
  },
  p2: {
    de: 'Unser Kunde war HateAid, unsere Partneragentur Creative Team. Die Aufgabe: Hass im Netz sichtbar machen und Awareness für HateAid schaffen. Unser Claim – „Einer für alle, alle gegen Hass" – stellte den Teamgedanken ins Zentrum der Kampagne und mobilisierte das Publikum.',
    en: 'Our client was HateAid, our partner agency Creative Team. The brief: make hate online visible and raise awareness for HateAid. Our claim – "One for all, all against hate" – put the team spirit at the heart of the campaign and mobilised the audience.',
  },
}
type Lang = 'de' | 'en'

// ─── GWASection ───────────────────────────────────────────────────────────────
export function GWASection() {
  const { language } = useLanguage(); const lang = language as Lang
  const secRef  = useRef<HTMLDivElement>(null)
  const figRef  = useRef<HTMLDivElement>(null)
  const [figureExit, setFigureExit] = useState({ blur: 0, opacity: 1 })
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check(); window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  useEffect(() => {
    if (isMobile) return
    const applyStyle = () => {
      const fig = figRef.current; const sec = secRef.current; if (!fig || !sec) return
      const vw = window.innerWidth; const vh = window.innerHeight
      const sr = sec.getBoundingClientRect()
      const TARGET = vh * 0.12; const figW = vw * 0.42; const figH = Math.min(Math.max(vw * 0.82, 460), 860)
      if (sr.top + TARGET > TARGET) {
        fig.style.position = 'absolute'; fig.style.top = `${TARGET}px`
        fig.style.left = ''; fig.style.right = `${vw * 0.01}px`
        fig.style.width = `${figW}px`; fig.style.height = `${figH}px`
      } else {
        fig.style.position = 'fixed'; fig.style.top = `${TARGET}px`
        fig.style.left = `${vw - vw * 0.01 - figW}px`; fig.style.right = ''
        fig.style.width = `${figW}px`; fig.style.height = `${figH}px`
      }
      const p = Math.max(0, Math.min(1, 1 - sr.bottom / (vh * 0.8)))
      setFigureExit({ blur: p * 24, opacity: 1 - p * 0.95 })
    }
    window.addEventListener('scroll', applyStyle, { passive: true })
    window.addEventListener('resize', applyStyle); applyStyle()
    return () => { window.removeEventListener('scroll', applyStyle); window.removeEventListener('resize', applyStyle) }
  }, [isMobile])

  // ── Mobile ──────────────────────────────────────────────────────────────────
  if (isMobile) {
    return (
      <div ref={secRef} style={{ position: 'relative', zIndex: 5, marginTop: '-5vh' }}>
        <section id="gwa" style={{ backgroundColor: '#ffffff', boxSizing: 'border-box', overflow: 'hidden', padding: '14vw 6vw 18vw', display: 'flex', flexDirection: 'column' }}>
          <div style={{ marginBottom: 'clamp(20px,5vw,32px)' }}><StaticHeadingGWA /></div>
          <div style={{ width: '100%', height: '72vw', maxHeight: 340, marginBottom: 'clamp(24px,6vw,40px)' }}>
            <Trophy3D sectionRef={secRef as React.RefObject<HTMLDivElement>} />
          </div>
          <LogoRow />
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 'clamp(20px,5vw,32px)' }}>
            <AwardBadge label={T.award1[lang]} />
            <AwardBadge label={T.award2[lang]} />
            <AwardBadge label={T.award3[lang]} />
          </div>
          <ScrambleP text={T.p1[lang]} style={{ color: 'rgba(10,10,10,0.75)', fontSize: 'clamp(14px,4vw,17px)', lineHeight: 1.8, fontWeight: 400, margin: '0 0 clamp(12px,3vw,20px)' }} />
          <ScrambleP text={T.p2[lang]} style={{ color: '#0a0a0a', fontSize: 'clamp(14px,4vw,17px)', lineHeight: 1.8, fontWeight: 400, margin: '0 0 clamp(40px,10vw,60px)' }} />
          <ProcessTimeline lang={lang} />
          <div style={{ marginTop: 'clamp(40px,10vw,64px)' }}>
            {/* mobile: simple 16:9 video, no scale trick */}
            <div style={{ width: '100%', aspectRatio: '16 / 9', overflow: 'hidden', marginBottom: 'clamp(14px,4vw,20px)' }}>
              <video src="/videos/gwavideo.mp4" autoPlay loop muted playsInline style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
            </div>
            <MobileLivestreamBtn lang={lang} />
          </div>
        </section>
      </div>
    )
  }

  // ── Desktop ──────────────────────────────────────────────────────────────────
  return (
    <div ref={secRef} style={{ position: 'relative', zIndex: 5, marginTop: '-110vh' }}>
      <section id="gwa" style={{ position: 'relative', backgroundColor: '#ffffff', minHeight: '280vh', display: 'flex', alignItems: 'stretch', boxSizing: 'border-box', overflow: 'visible' }}>
        <div style={{ flex: '0 0 55%', paddingTop: '9vw', paddingBottom: '10vw', paddingLeft: '9vw', paddingRight: '4vw', display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', boxSizing: 'border-box' }}>

          {/* Heading */}
          <div style={{ marginBottom: 'clamp(28px,3.5vw,48px)' }}><StaticHeadingGWA /></div>

          {/* Logos */}
          <LogoRow />

          {/* Badges */}
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 'clamp(28px,3.5vw,44px)' }}>
            <AwardBadge label={T.award1[lang]} />
            <AwardBadge label={T.award2[lang]} />
            <AwardBadge label={T.award3[lang]} />
          </div>

          {/* Body text */}
          <ScrambleP text={T.p1[lang]} style={{ color: 'rgba(10,10,10,0.75)', fontSize: 'clamp(14px,1.4vw,17px)', lineHeight: 1.8, fontWeight: 400, margin: '0 0 clamp(16px,1.8vw,24px)', maxWidth: 560 }} />
          <ScrambleP text={T.p2[lang]} style={{ color: '#0a0a0a', fontSize: 'clamp(14px,1.4vw,17px)', lineHeight: 1.8, fontWeight: 400, margin: '0 0 clamp(56px,7vw,96px)', maxWidth: 560 }} />

          {/* Process timeline */}
          <ProcessTimeline lang={lang} />

          {/* Scroll-linked 16:9 video + button */}
          <div style={{ marginTop: 'clamp(56px,7vw,96px)' }}>
            <ScrollLinkedVideo lang={lang} />
          </div>

        </div>
        <div style={{ flex: 1 }} />
        <div ref={figRef} style={{ position: 'absolute', top: '12vh', right: '1vw', width: '42%', height: '82vw', maxHeight: 860, minHeight: 460, zIndex: 10, filter: figureExit.blur > 0.1 ? `blur(${figureExit.blur}px)` : 'none', opacity: figureExit.opacity, boxSizing: 'border-box' }}>
          <Trophy3D sectionRef={secRef as React.RefObject<HTMLDivElement>} />
        </div>
      </section>
    </div>
  )
}

// ─── Mobile Livestream Button ─────────────────────────────────────────────────
function MobileLivestreamBtn({ lang }: { lang: 'de' | 'en' }) {
  const [hov, setHov] = useState(false)
  const { disp, scramble } = useScramble(lang === 'de' ? 'Ansehen' : 'Watch')
  return (
    <a href="https://www.youtube.com/live/WTt66Ojzi44?si=ufzNc8ExJtfVg_mo&t=4409" target="_blank" rel="noopener noreferrer"
      onMouseEnter={() => { setHov(true); scramble() }} onMouseLeave={() => setHov(false)}
      style={{ display: 'inline-flex', alignItems: 'center', gap: 10, backgroundColor: hov ? '#333' : '#0a0a0a', color: '#ffffff', fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', padding: '11px 20px', textDecoration: 'none', transition: 'background-color 0.15s ease', cursor: 'pointer' }}>
      <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><polygon points="2,1 12,6.5 2,12" fill="#ffffff"/></svg>
      {disp}
    </a>
  )
}