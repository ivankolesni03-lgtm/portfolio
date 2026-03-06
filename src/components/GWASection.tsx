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

// ─── StaticHeadingGWA ─────────────────────────────────────────────────────────
function StaticHeadingGWA() {
  const {disp:d1,scramble:s1}=useScramble('Junior Agency')
  const {disp:d2,scramble:s2}=useScramble('Award 2026')
  const scramble=()=>{s1();s2()}
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

// ─── Trophy3D ─────────────────────────────────────────────────────────────────
function Trophy3D() {
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

      const w = el.clientWidth
      const h = el.clientHeight || 500

      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
      renderer.setSize(w, h)
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
      renderer.outputColorSpace = THREE.SRGBColorSpace
      renderer.shadowMap.enabled = true
      renderer.shadowMap.type = THREE.PCFSoftShadowMap
      renderer.setClearColor(0x000000, 0)
      el.appendChild(renderer.domElement)

      const scene = new THREE.Scene()
      const camera = new THREE.PerspectiveCamera(42, w / h, 0.01, 100)
      camera.position.set(0, 0.2, 2.2)

      scene.add(new THREE.AmbientLight(0xfff8f0, 1.4))
      const key = new THREE.DirectionalLight(0xffffff, 3.0)
      key.position.set(3, 5, 4); key.castShadow = true; scene.add(key)
      const fill = new THREE.DirectionalLight(0xfff0d0, 1.2)
      fill.position.set(-4, 2, -2); scene.add(fill)
      const rim = new THREE.DirectionalLight(0xffe0a0, 0.8)
      rim.position.set(0, -3, -4); scene.add(rim)
      const topLight = new THREE.DirectionalLight(0xffffff, 0.6)
      topLight.position.set(0, 8, 0); scene.add(topLight)

      const controls = new OrbitControls(camera, renderer.domElement)
      controls.enableDamping = true; controls.dampingFactor = 0.07
      controls.enablePan = false; controls.enableZoom = false
      controls.minDistance = 2.8; controls.maxDistance = 2.8
      controls.autoRotate = false; controls.target.set(0, 0, 0)

      const targetRot = { x: 0, y: 0 }
      const onMouseMove = (e: MouseEvent) => {
        const rect = el.getBoundingClientRect()
        const dx = (e.clientX - rect.left - rect.width / 2) / (rect.width / 2)
        const dy = (e.clientY - rect.top - rect.height / 2) / (rect.height / 2)
        targetRot.x = dy * 0.25
        targetRot.y = dx * 0.25
      }
      window.addEventListener('mousemove', onMouseMove)

      let loadedModel: any = null
      const loader = new GLTFLoader()
      loader.load('/models/brown_sculptural_trophy_3d_model.glb',
        (gltf: any) => {
          if (cancelled) return
          const model = gltf.scene
          const box = new THREE.Box3().setFromObject(model)
          const center = box.getCenter(new THREE.Vector3())
          const size = box.getSize(new THREE.Vector3())
          const maxDim = Math.max(size.x, size.y, size.z)
          const scale = 1.6 / maxDim
          model.position.copy(center.multiplyScalar(-scale))
          model.scale.setScalar(scale)
          model.traverse((child: any) => {
            if (child.isMesh) { child.castShadow = true; child.receiveShadow = true }
          })
          scene.add(model); loadedModel = model; controls.update()
        },
        undefined,
        (err: any) => console.error('GLB load error:', err)
      )

      const onResize = () => {
        const nw = el.clientWidth; const nh = el.clientHeight || 500
        camera.aspect = nw / nh; camera.updateProjectionMatrix()
        renderer.setSize(nw, nh)
      }
      window.addEventListener('resize', onResize)

      let rafId = 0
      const currentRot = { x: 0, y: 0 }
      const animate = () => {
        rafId = requestAnimationFrame(animate)
        currentRot.x += (targetRot.x - currentRot.x) * 0.06
        currentRot.y += (targetRot.y - currentRot.y) * 0.06
        if (loadedModel) {
          loadedModel.rotation.x = currentRot.x
          loadedModel.rotation.y = currentRot.y
        }
        controls.update()
        renderer.render(scene, camera)
      }
      animate()

      cleanupFn = () => {
        cancelAnimationFrame(rafId)
        window.removeEventListener('resize', onResize)
        window.removeEventListener('mousemove', onMouseMove)
        controls.dispose(); renderer.dispose()
        if (el.contains(renderer.domElement)) el.removeChild(renderer.domElement)
      }
    }

    init()
    return () => { cancelled = true; cleanupFn?.() }
  }, [])

  return (
    <div ref={mountRef} style={{ width:'100%', height:'100%', cursor:'grab', background:'transparent', display:'block' }} />
  )
}

// ─── AwardBadge ───────────────────────────────────────────────────────────────
function AwardBadge({label,gold=false}:{label:string;gold?:boolean}){
  const [hov,setHov]=useState(false)
  return (
    <span onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)} style={{
      display:'inline-block',
      backgroundColor:gold?(hov?'#C9A84C':'#E8C96A'):(hov?'#e0e0e0':'#f0f0f0'),
      color:'#0a0a0a',fontSize:10,fontWeight:800,letterSpacing:'0.14em',
      textTransform:'uppercase',padding:'7px 14px',
      transform:hov?'scale(0.96)':'scale(1)',transition:'all 0.15s ease',cursor:'default',
    }}>{label}</span>
  )
}

// ─── Texte ────────────────────────────────────────────────────────────────────
const T={
  sub:{de:'Junior Agency Award 2026',en:'Junior Agency Award 2026'},
  award1:{de:'3. Platz',en:'3rd Place'},
  award2:{de:'Making-Off Award',en:'Making-Off Award'},
  award3:{de:'Publikumspreis',en:'Audience Award'},
  p1:{de:'Beim GWA Junior Agency Award 2026 hat unser Team den dritten Platz gewonnen – und damit gleich zwei zusätzliche Auszeichnungen mitgenommen: den Making-Off Award für die beste Behind-the-Scenes-Dokumentation und den Publikumspreis.',en:'At the GWA Junior Agency Award 2026 our team won third place – taking home two additional prizes: the Making-Off Award for the best behind-the-scenes documentation and the Audience Award.'},
  p2:{de:'Der GWA Junior Agency Award ist einer der renommiertesten Nachwuchswettbewerbe der deutschen Werbebranche. Kreative Kampagnenentwicklung, strategisches Denken und Teamarbeit standen im Mittelpunkt.',en:'The GWA Junior Agency Award is one of the most prestigious junior competitions in the German advertising industry. Creative campaign development, strategic thinking and teamwork were at the centre.'},
}
type Lang='de'|'en'

// ─── GWASection ───────────────────────────────────────────────────────────────
export function GWASection() {
  const {language}=useLanguage(); const lang=language as Lang
  const secRef  = useRef<HTMLDivElement>(null)
  const figRef  = useRef<HTMLDivElement>(null)
  const isFixed = useRef(false)
  const [figureExit,setFigureExit] = useState({blur:0,opacity:1})

  // Figur-Dimensionen
  const FIG_W_PCT   = 0.42
  const FIG_RIGHT   = 0.01   // 1vw vom rechten Rand — weiter rechts
  const FIG_TOP_ABS = 0.12   // 12vh — etwas höher
  const FIG_H_PCT   = 0.82

  useEffect(()=>{
    const applyStyle = () => {
      const fig = figRef.current
      const sec = secRef.current
      if (!fig || !sec) return

      const vw  = window.innerWidth
      const vh  = window.innerHeight
      const sr  = sec.getBoundingClientRect()
      const TARGET = vh * FIG_TOP_ABS

      const figW = vw * FIG_W_PCT
      const figL = vw - vw * FIG_RIGHT - figW
      const figH = Math.min(Math.max(vw * FIG_H_PCT, 460), 860)

      // Natürliche Position der Figur im Viewport:
      // section.top + FIG_TOP_ABS * vh
      const naturalTopInViewport = sr.top + TARGET

      if (naturalTopInViewport > TARGET) {
        // Noch nicht eingerastet — scrollt mit
        isFixed.current = false
        fig.style.position = 'absolute'
        fig.style.top      = `${TARGET}px`
        fig.style.left     = ''
        fig.style.right    = `${vw * FIG_RIGHT}px`
        fig.style.width    = `${figW}px`
        fig.style.height   = `${figH}px`
      } else {
        // Eingerastet — fixed
        isFixed.current = true
        fig.style.position = 'fixed'
        fig.style.top      = `${TARGET}px`
        fig.style.left     = `${figL}px`
        fig.style.right    = ''
        fig.style.width    = `${figW}px`
        fig.style.height   = `${figH}px`
      }

      // Exit blur + opacity
      const p = Math.max(0, Math.min(1, 1 - (sr.bottom / (vh * 0.8))))
      setFigureExit({ blur: p * 24, opacity: 1 - p * 0.95 })
    }

    window.addEventListener('scroll', applyStyle, { passive: true })
    window.addEventListener('resize', applyStyle)
    applyStyle()
    return () => {
      window.removeEventListener('scroll', applyStyle)
      window.removeEventListener('resize', applyStyle)
    }
  }, [])

  return (
    <div ref={secRef} style={{position:'relative', zIndex:5, marginTop:'-110vh'}}>
      <section id="gwa" style={{
        position:'relative',
        backgroundColor:'#ffffff',
        minHeight:'220vh',
        display:'flex',
        alignItems:'stretch',
        boxSizing:'border-box',
        overflow:'visible',
      }}>

        {/* LINKS — Text */}
        <div style={{
          flex:'0 0 55%',
          paddingTop:'9vw', paddingBottom:'9vw',
          paddingLeft:'9vw', paddingRight:'4vw',
          display:'flex', flexDirection:'column', justifyContent:'flex-start',
          boxSizing:'border-box',
        }}>
          <div style={{marginBottom:'clamp(8px,1vw,14px)'}}>
            <StaticHeadingGWA/>
          </div>
          <p style={{color:'rgba(10,10,10,0.45)',fontSize:'clamp(12px,1.1vw,15px)',fontWeight:600,letterSpacing:'0.12em',textTransform:'uppercase',margin:'0 0 clamp(32px,4vw,52px)'}}>{T.sub[lang]}</p>
          <div style={{display:'flex',gap:10,flexWrap:'wrap',marginBottom:'clamp(28px,3.5vw,44px)'}}>
            <AwardBadge label={T.award1[lang]} gold/>
            <AwardBadge label={T.award2[lang]}/>
            <AwardBadge label={T.award3[lang]}/>
          </div>
          <p style={{color:'rgba(10,10,10,0.75)',fontSize:'clamp(14px,1.4vw,17px)',lineHeight:1.8,fontWeight:400,margin:'0 0 clamp(16px,1.8vw,24px)',maxWidth:560}}>{T.p1[lang]}</p>
          <p style={{color:'rgba(10,10,10,0.5)',fontSize:'clamp(13px,1.25vw,15px)',lineHeight:1.8,fontWeight:400,margin:0,maxWidth:520}}>{T.p2[lang]}</p>
        </div>

        {/* Platzhalter rechts */}
        <div style={{flex:1}} />

        {/* Trophy — einmal gemountet, styles werden direkt per ref gesetzt */}
        <div
          ref={figRef}
          style={{
            position:'absolute',
            top: '12vh',
            right: '1vw',
            width: '42%',
            height: '82vw',
            maxHeight: 860,
            minHeight: 460,
            zIndex: 10,
            filter: figureExit.blur > 0.1 ? `blur(${figureExit.blur}px)` : 'none',
            opacity: figureExit.opacity,
            boxSizing:'border-box',
          }}
        >
          <Trophy3D />
        </div>

      </section>
    </div>
  )
}