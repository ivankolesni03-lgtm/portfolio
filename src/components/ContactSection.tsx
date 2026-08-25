'use client'
import { useState, useRef, useEffect, useCallback } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'
import { useMobile } from '@/hooks/use-mobile'
import { useScroll } from '@/contexts/ScrollContext'
import { useMouse } from '@/contexts/MouseContext'
import { useScramble } from '@/hooks/use-scramble'
import {
  CONTACT_MAX_EMAIL_LENGTH,
  CONTACT_MAX_MESSAGE_LENGTH,
  CONTACT_MAX_NAME_LENGTH,
  type ContactApiErrorCode,
  type ContactFormPayload,
  isContactApiErrorCode,
} from '@/lib/contact-config'

// ─── Texte ────────────────────────────────────────────────────────────────────
const T = {
  heading:  { de: 'KONTAKT',                     en: 'CONTACT'               },
  name:     { de: 'Name',                         en: 'Name'                  },
  email:    { de: 'E-Mail',                       en: 'Email'                 },
  message:  { de: 'Nachricht',                    en: 'Message'               },
  send:     { de: 'Senden',                       en: 'Send'                  },
  sending:  { de: 'Sendet...',                    en: 'Sending...'            },
  seen:     { de: 'Wir sehen uns...',             en: 'See you...'            },
  error:    { de: 'Versuch es einfach nochmal.',  en: 'Just try again.'       },
  invalid:  { de: 'Bitte pruefe deine Eingaben.', en: 'Please check your input.' },
  rate:     { de: 'Zu viele Anfragen. Versuch es spaeter nochmal.', en: 'Too many requests. Please try again later.' },
  bot:      { de: 'Anfrage blockiert. Bitte lade die Seite neu.', en: 'Request blocked. Please reload the page.' },
  tooLarge: { de: 'Die Nachricht ist zu lang.',   en: 'The message is too long.' },
}

type Lang = 'de' | 'en'

function createInitialFormState(): ContactFormPayload {
  return {
    name: '',
    email: '',
    message: '',
    company: '',
    startedAt: Date.now(),
  }
}

function getErrorMessage(code: ContactApiErrorCode | null, lang: Lang) {
  if (!code) return T.error[lang]
  if (code === 'validation_error' || code === 'invalid_json' || code === 'unsupported_media_type') {
    return T.invalid[lang]
  }
  if (code === 'payload_too_large') {
    return T.tooLarge[lang]
  }
  if (code === 'rate_limited') {
    return T.rate[lang]
  }
  if (code === 'bot_detected') {
    return T.bot[lang]
  }

  return T.error[lang]
}

// ─── Eye ──────────────────────────────────────────────────────────────────────
interface EyePos { x: number; y: number }

function Eye({ pupil, blinking, size }: { pupil: EyePos; blinking: boolean; size: number }) {
  const h = size * 0.5
  const pupilSize = size * 0.42
  const scale = size / 180
  return (
    <div style={{ position: 'relative', width: size, height: h, flexShrink: 0 }}>
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: '55%',
        backgroundColor: '#0a0a0a', zIndex: 10,
        transformOrigin: 'top center',
        transform: blinking ? 'scaleY(1)' : 'scaleY(0)',
        transition: 'transform 0.05s ease-in-out',
        borderBottomLeftRadius: '45%', borderBottomRightRadius: '45%',
      }} />
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: '55%',
        backgroundColor: '#0a0a0a', zIndex: 10,
        transformOrigin: 'bottom center',
        transform: blinking ? 'scaleY(1)' : 'scaleY(0)',
        transition: 'transform 0.05s ease-in-out',
        borderTopLeftRadius: '45%', borderTopRightRadius: '45%',
      }} />
      <div style={{
        width: size, height: h, backgroundColor: '#fff',
        borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%',
        position: 'relative', overflow: 'hidden',
        boxShadow: '0 0 40px rgba(255,255,255,0.05)',
      }}>
        <div style={{
          position: 'absolute', top: '50%', left: '50%',
          width: pupilSize, height: pupilSize, borderRadius: '50%',
          backgroundColor: '#000',
          transform: `translate(calc(-50% + ${pupil.x * scale}px), calc(-50% + ${pupil.y * scale}px))`,
        }}>
          <div style={{
            position: 'absolute', top: '15%', left: '15%',
            width: '20%', height: '20%', borderRadius: '50%', backgroundColor: '#fff',
          }} />
          <div style={{
            position: 'absolute', bottom: '18%', right: '18%',
            width: '11%', height: '11%', borderRadius: '50%', backgroundColor: '#fff',
          }} />
        </div>
      </div>
    </div>
  )
}

// ─── ThirdEye ─────────────────────────────────────────────────────────────────
function ThirdEye({ open, pupil, size }: { open: boolean; pupil: EyePos; size: number }) {
  const h = size * 0.5
  const pupilSize = size * 0.42
  const scale = size / 180
  return (
    <div style={{
      position: 'absolute',
      top: '50%', left: '50%',
      transform: 'translate(-50%, -50%)',
      width: size, height: h,
      flexShrink: 0,
      zIndex: 20,
      transition: 'transform 0.6s cubic-bezier(0.34,1.56,0.64,1)',
    }}>
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: '55%',
        backgroundColor: '#0a0a0a', zIndex: 10,
        transformOrigin: 'top center',
        transform: open ? 'scaleY(0)' : 'scaleY(1)',
        transition: 'transform 0.7s cubic-bezier(0.34,1.56,0.64,1)',
        borderBottomLeftRadius: '45%', borderBottomRightRadius: '45%',
      }} />
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: '55%',
        backgroundColor: '#0a0a0a', zIndex: 10,
        transformOrigin: 'bottom center',
        transform: open ? 'scaleY(0)' : 'scaleY(1)',
        transition: 'transform 0.7s cubic-bezier(0.34,1.56,0.64,1)',
        borderTopLeftRadius: '45%', borderTopRightRadius: '45%',
      }} />
      {open && (
        <div style={{
          position: 'absolute', inset: 0,
          borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%',
          boxShadow: '0 0 40px 12px rgba(255,255,255,0.45), 0 0 80px 24px rgba(255,255,255,0.18)',
          zIndex: 20,
          pointerEvents: 'none',
        }} />
      )}
      <div style={{
        width: size, height: h, backgroundColor: '#fff',
        borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%',
        position: 'relative', overflow: 'hidden',
        boxShadow: open ? '0 0 40px rgba(255,255,255,0.5), 0 0 80px rgba(255,255,255,0.2)' : 'none',
        transition: 'box-shadow 0.8s ease',
      }}>
        <div style={{
          position: 'absolute', top: '50%', left: '50%',
          width: pupilSize, height: pupilSize, borderRadius: '50%',
          backgroundColor: '#000',
          transform: `translate(calc(-50% + ${pupil.x * scale}px), calc(-50% + ${pupil.y * scale}px))`,
          transition: open ? 'none' : 'transform 0s',
        }}>
          <div style={{
            position: 'absolute', top: '15%', left: '15%',
            width: '20%', height: '20%', borderRadius: '50%', backgroundColor: '#fff',
          }} />
          <div style={{
            position: 'absolute', bottom: '18%', right: '18%',
            width: '11%', height: '11%', borderRadius: '50%', backgroundColor: '#fff',
          }} />
        </div>
      </div>
    </div>
  )
}

// ─── Eyes Pair ────────────────────────────────────────────────────────────────
function Eyes({
  containerRef, success, isMobile,
}: {
  containerRef: React.RefObject<HTMLDivElement | null>
  success: boolean
  isMobile: boolean
}) {
  const [pupil, setPupil] = useState<EyePos>({ x: 0, y: 0 })
  const [blinking, setBlinking] = useState(false)
  const [thirdOpen, setThirdOpen] = useState(false)
  const smooth = useRef<EyePos>({ x: 0, y: 0 })
  const target = useRef<EyePos>({ x: 0, y: 0 })
  const blinkRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const autoAnimTime = useRef(0)
  const { mouseX, mouseY } = useMouse()

  // responsive eye size
  const eyeSize = isMobile ? 90 : 170

  useEffect(() => {
    if (!success) return
    const t1 = setTimeout(() => setThirdOpen(true), 400)
    return () => { clearTimeout(t1) }
  }, [success])

  useEffect(() => {
    const tick = () => {
      smooth.current.x += (target.current.x - smooth.current.x) * 0.08
      smooth.current.y += (target.current.y - smooth.current.y) * 0.08
      const nextX = smooth.current.x
      const nextY = smooth.current.y

      // Guard invalid values and skip tiny deltas to reduce unnecessary renders.
      if (Number.isFinite(nextX) && Number.isFinite(nextY)) {
        setPupil((prev) => {
          if (Math.abs(prev.x - nextX) < 0.08 && Math.abs(prev.y - nextY) < 0.08) return prev
          return { x: nextX, y: nextY }
        })
      }
    }

    const intervalId = window.setInterval(tick, 33)
    return () => {
      window.clearInterval(intervalId)
    }
  }, [])

  // Desktop: Mouse tracking via context
  useEffect(() => {
    if (isMobile) return
    
    const el = containerRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const cx = rect.left + rect.width / 2
    const cy = rect.top + rect.height / 2
    const dx = mouseX - cx
    const dy = mouseY - cy
    const dist = Math.sqrt(dx * dx + dy * dy)
    const max = 28
    target.current = {
      x: (dx / Math.max(dist, 1)) * Math.min(dist / 15, max),
      y: (dy / Math.max(dist, 1)) * Math.min(dist / 15, max),
    }
  }, [containerRef, isMobile, mouseX, mouseY])

  // Mobile: Scroll-based + gentle automatic movement
  useEffect(() => {
    if (!isMobile) return
    
    let lastScrollY = window.scrollY
    let scrollVelocity = 0
    
    const onScroll = () => {
      const currentScrollY = window.scrollY
      scrollVelocity = (currentScrollY - lastScrollY) * 0.15
      lastScrollY = currentScrollY
      
      // Clamp velocity to reasonable range
      scrollVelocity = Math.max(-20, Math.min(20, scrollVelocity))
      
      // Eyes look up when scrolling down, down when scrolling up
      target.current.y = -scrollVelocity
    }
    
    // Gentle automatic horizontal movement when not scrolling
    const autoAnimate = () => {
      autoAnimTime.current += 0.02
      
      // Subtle figure-8 pattern
      const autoX = Math.sin(autoAnimTime.current) * 8
      const autoY = Math.sin(autoAnimTime.current * 2) * 4
      
      // Blend scroll velocity with auto animation
      const scrollInfluence = Math.abs(scrollVelocity) / 20
      target.current.x = autoX * (1 - scrollInfluence)
      target.current.y = target.current.y * scrollInfluence + autoY * (1 - scrollInfluence)
      
      // Decay scroll velocity over time
      scrollVelocity *= 0.95
    }
    
    window.addEventListener('scroll', onScroll, { passive: true })
    const autoAnimInterval = setInterval(autoAnimate, 50)
    
    return () => {
      window.removeEventListener('scroll', onScroll)
      clearInterval(autoAnimInterval)
    }
  }, [isMobile])

  useEffect(() => {
    const schedule = () => {
      blinkRef.current = setTimeout(() => {
        setBlinking(true)
        const dur = 100 + Math.random() * 50
        setTimeout(() => {
          setBlinking(false)
          if (Math.random() > 0.85) {
            setTimeout(() => { setBlinking(true); setTimeout(() => setBlinking(false), 100) }, 150)
          }
          schedule()
        }, dur)
      }, 2000 + Math.random() * 4000)
    }
    schedule()
    return () => { if (blinkRef.current) clearTimeout(blinkRef.current) }
  }, [])

  const gap = eyeSize * 0.5
  const thirdSize = eyeSize

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0 }}>
      {/* Third eye */}
      <div style={{
        opacity: success ? 1 : 0,
        transform: success ? `scale(1) translateY(${isMobile ? '-60px' : '-120px'})` : 'scale(0.4) translateY(40px)',
        transition: 'opacity 0.5s ease, transform 0.8s cubic-bezier(0.34,1.56,0.64,1)',
        pointerEvents: success ? 'auto' : 'none',
        marginBottom: -eyeSize * 0.1,
        zIndex: 10,
        position: 'relative',
        filter: success && thirdOpen ? 'drop-shadow(0 0 18px rgba(255,255,255,0.6)) drop-shadow(0 0 40px rgba(255,255,255,0.25))' : 'none',
      }}>
        <ThirdEye open={thirdOpen} pupil={pupil} size={thirdSize} />
      </div>

      {/* Two eyes */}
      <div style={{ display: 'flex', flexDirection: 'row', gap, alignItems: 'center', position: 'relative', zIndex: 1 }}>
        <Eye pupil={pupil} blinking={blinking} size={eyeSize} />
        <Eye pupil={pupil} blinking={blinking} size={eyeSize} />
      </div>
    </div>
  )
}

// ─── HaseEyesModel (PROVISORISCH – Testersatz für die Augen) ─────────────────
// Ersetzt testweise die Eyes-Grafik durch das hase01.glb in Chrom/Silber.
// Dreht sich sanft zum Cursor (wie figur01.glb in GWASection). Nicht verschiebbar.
function HaseEyesModel({ size }: { size: number }) {
  const mountRef = useRef<HTMLDivElement>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const { mouseX, mouseY } = useMouse()
  const mouseRef = useRef({ x: 0, y: 0 })

  useEffect(() => { mouseRef.current = { x: mouseX, y: mouseY } }, [mouseX, mouseY])

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return
    let cancelled = false
    let cleanupFn: (() => void) | null = null

    const init = async () => {
      const THREE = await import('three')
      const { GLTFLoader } = await import('three/addons/loaders/GLTFLoader.js') as any
      const { DRACOLoader } = await import('three/addons/loaders/DRACOLoader.js') as any
      const { RoomEnvironment } = await import('three/addons/environments/RoomEnvironment.js') as any
      if (cancelled) return

      const dracoLoader = new DRACOLoader()
      dracoLoader.setDecoderPath('/draco/')

      const w = mount.clientWidth || size
      const h = mount.clientHeight || size

      const scene = new THREE.Scene()
      const camera = new THREE.PerspectiveCamera(35, w / h, 0.1, 100)
      camera.position.set(0, 0, 5)

      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
      renderer.setSize(w, h)
      renderer.setClearColor(0x000000, 0)
      mount.appendChild(renderer.domElement)

      // Studio-Environment für Reflexionen – sonst wirkt volles Metall schwarz.
      const pmremGenerator = new THREE.PMREMGenerator(renderer)
      const envTexture = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture
      scene.environment = envTexture

      scene.add(new THREE.HemisphereLight(0xffffff, 0x444444, 1.2))
      scene.add(new THREE.AmbientLight(0xffffff, 0.9))
      const dirLight = new THREE.DirectionalLight(0xffffff, 1.6)
      dirLight.position.set(3, 4, 5)
      scene.add(dirLight)
      const dirLight2 = new THREE.DirectionalLight(0xffffff, 0.7)
      dirLight2.position.set(-4, -2, -3)
      scene.add(dirLight2)

      const group = new THREE.Group()
      group.position.set(-0.1, -0.15, 0)
      scene.add(group)

      new GLTFLoader().setDRACOLoader(dracoLoader).load(
        '/models/hase01-v2.glb',
        (gltf: any) => {
          if (cancelled) return
          const model = gltf.scene
          model.traverse((c: any) => {
            if (c.isMesh) {
              c.material = new THREE.MeshStandardMaterial({
                color: 0xd8dade, metalness: 1, roughness: 0.22, envMapIntensity: 1.4,
              })
            }
          })
          const box = new THREE.Box3().setFromObject(model)
          const modelSize = box.getSize(new THREE.Vector3())
          const center = box.getCenter(new THREE.Vector3())
          const maxDim = Math.max(modelSize.x, modelSize.y, modelSize.z) || 1
          const scale = 2.6 / maxDim
          model.scale.setScalar(scale)
          model.position.sub(center.multiplyScalar(scale))
          group.add(model)
        },
        undefined,
        (err: any) => console.error('hase01.glb load error', err)
      )

      const targetRot = { x: 0, y: 0.4 }
      const currentRot = { x: 0, y: 0.4 }
      // dragOffset ist die manuell hinzugefügte Rotation (durch Ziehen). Sie
      // wird immer zur Cursor-Basisrotation addiert, damit es beim
      // Loslassen keinen Sprung gibt – die Basis und der Offset ändern sich
      // beide nur kontinuierlich, nie sprunghaft.
      const dragOffset = { x: 0, y: 0 }

      const computeBaseRotation = () => {
        const wrap = wrapperRef.current
        if (!wrap) return { x: 0, y: 0 }
        const r = wrap.getBoundingClientRect()
        return {
          x: ((mouseRef.current.y - (r.top + r.height / 2)) / (r.height / 2)) * 0.22,
          y: ((mouseRef.current.x - (r.left + r.width / 2)) / (r.width / 2)) * 0.26,
        }
      }

      // Gedrückthalten + Ziehen dreht das Modell frei um sich selbst – die
      // Position (group.position) wird dabei nie verändert, nur die Rotation.
      let dragging = false
      let lastPointer = { x: 0, y: 0 }
      let frozenBase = { x: 0, y: 0 }

      const onPointerDown = (e: PointerEvent) => {
        dragging = true
        lastPointer = { x: e.clientX, y: e.clientY }
        frozenBase = computeBaseRotation()
        mount.style.cursor = 'grabbing'
        // Bewusst KEIN setPointerCapture UND KEIN e.preventDefault() hier:
        // preventDefault() auf pointerdown unterdrückt laut Spec alle
        // nachfolgenden kompatiblen Maus-Events (u.a. mousemove) für diesen
        // Pointer, was die globale Mausverfolgung (MouseContext/CustomCursor)
        // einfrieren lässt, solange gedrückt gehalten wird. Textauswahl
        // verhindern wir stattdessen gezielt per CSS.
        document.body.style.userSelect = 'none'
        window.addEventListener('pointermove', onPointerMove)
        window.addEventListener('pointerup', onPointerUp)
        window.addEventListener('pointercancel', onPointerUp)
      }
      const onPointerMove = (e: PointerEvent) => {
        if (!dragging) return
        const dx = e.clientX - lastPointer.x
        const dy = e.clientY - lastPointer.y
        lastPointer = { x: e.clientX, y: e.clientY }
        dragOffset.y += dx * 0.012
        dragOffset.x += dy * 0.012
      }
      const onPointerUp = (e: PointerEvent) => {
        if (!dragging) return
        dragging = false
        // Basis am Loslass-Zeitpunkt neu berechnen und den Offset so
        // anpassen, dass targetRot exakt gleich bleibt – dadurch geht die
        // Cursor-Rotation danach nahtlos weiter, ohne zu springen.
        const base = computeBaseRotation()
        dragOffset.x = targetRot.x - base.x
        dragOffset.y = targetRot.y - base.y
        mount.style.cursor = 'grab'
        document.body.style.userSelect = ''
        window.removeEventListener('pointermove', onPointerMove)
        window.removeEventListener('pointerup', onPointerUp)
        window.removeEventListener('pointercancel', onPointerUp)
      }

      mount.style.cursor = 'grab'
      mount.style.touchAction = 'none'
      mount.addEventListener('pointerdown', onPointerDown)

      let raf = 0
      const animate = () => {
        raf = requestAnimationFrame(animate)
        const base = dragging ? frozenBase : computeBaseRotation()
        targetRot.x = base.x + dragOffset.x
        targetRot.y = base.y + dragOffset.y
        currentRot.x += (targetRot.x - currentRot.x) * 0.06
        currentRot.y += (targetRot.y - currentRot.y) * 0.06
        group.rotation.x = currentRot.x
        group.rotation.y = currentRot.y
        renderer.render(scene, camera)
      }
      animate()

      const onResize = () => {
        const nw = mount.clientWidth || size
        const nh = mount.clientHeight || size
        camera.aspect = nw / nh
        camera.updateProjectionMatrix()
        renderer.setSize(nw, nh)
      }
      window.addEventListener('resize', onResize)

      cleanupFn = () => {
        cancelAnimationFrame(raf)
        window.removeEventListener('resize', onResize)
        mount.removeEventListener('pointerdown', onPointerDown)
        window.removeEventListener('pointermove', onPointerMove)
        window.removeEventListener('pointerup', onPointerUp)
        window.removeEventListener('pointercancel', onPointerUp)
        document.body.style.userSelect = ''
        pmremGenerator.dispose()
        renderer.dispose()
        if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement)
      }
    }
    init()
    return () => { cancelled = true; cleanupFn?.() }
  }, [size])

  return (
    <div
      ref={wrapperRef}
      style={{
        width: size,
        height: size,
      }}
    >
      <div ref={mountRef} style={{ width: '100%', height: '100%' }} />
    </div>
  )
}

// ─── ContactSection ──────────────────────────────────────────────────────────
export function ContactSection() {
  const { language } = useLanguage()
  const lang = language as Lang
  const headingText = T.heading[lang]
  const { disp: headingDisp, scramble: headingScramble } = useScramble(headingText)
  const seenText = T.seen[lang]
  const { disp: seenDisp, scramble: seenScramble } = useScramble(seenText)

  const [form, setForm] = useState<ContactFormPayload>(() => createInitialFormState())
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle')
  const [errorCode, setErrorCode] = useState<ContactApiErrorCode | null>(null)
  const eyesRef = useRef<HTMLDivElement>(null)
  const { isMobile } = useMobile()
  const { vh, visualVh } = useScroll()
  const mobileViewport = visualVh || vh || 0
  const compactMobile = isMobile && mobileViewport > 0 && mobileViewport <= 760
  const tightMobile = isMobile && mobileViewport > 0 && mobileViewport <= 680
  const mobileFieldPadding = tightMobile ? '10px 0' : compactMobile ? '12px 0' : '14px 0'

  const updateField = (field: 'name' | 'email' | 'message' | 'company', value: string) => {
    setForm(current => ({ ...current, [field]: value }))
    if (status === 'error') {
      setStatus('idle')
      setErrorCode(null)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (status === 'sending') return
    setStatus('sending')
    setErrorCode(null)

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json().catch(() => null)
      if (res.ok) {
        setStatus('success')
        setForm(createInitialFormState())
        return
      }

      setStatus('error')
      setErrorCode(isContactApiErrorCode(data?.code) ? data.code : 'server_error')
    } catch {
      setStatus('error')
      setErrorCode('server_error')
    }
  }

  const fieldStyle: React.CSSProperties = {
    width: '100%', background: 'transparent', border: 'none',
    borderBottom: '1.5px solid rgba(255,255,255,0.15)',
    color: '#ffffff', fontSize: 'clamp(15px,1.5vw,18px)', fontWeight: 500,
    padding: '14px 0', outline: 'none', fontFamily: 'inherit',
    letterSpacing: '0.01em', boxSizing: 'border-box', transition: 'border-color 0.18s ease',
  }
  const onFocus = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    (e.target.style.borderBottomColor = 'rgba(255,255,255,0.7)')
  const onBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    (e.target.style.borderBottomColor = 'rgba(255,255,255,0.15)')

  // ── Mobile Layout ────────────────────────────────────────────────────────────
  if (isMobile) {
    return (
      <section
        id="kontakt"
        data-textcolor="white"
        style={{
          backgroundColor: '#0a0a0a',
          height: 'var(--app-visual-height, 100svh)',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          zIndex: 80,
          marginTop: 'calc(-1 * var(--mobile-flow-overlap-section))',
          boxSizing: 'border-box',
          overflow: 'hidden',
        }}
      >
        <div className="mobile-section-shell" style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          paddingTop: tightMobile ? 'clamp(68px,13svh,86px)' : compactMobile ? 'clamp(72px,14svh,98px)' : 'var(--mobile-section-top)',
          paddingBottom: tightMobile ? 'clamp(8px,2.4svh,14px)' : compactMobile ? 'clamp(10px,3svh,18px)' : '10vw',
          gap: tightMobile ? 'clamp(12px,2.6svh,18px)' : compactMobile ? 'clamp(16px,3.2svh,24px)' : 'clamp(32px,8vw,52px)',
        }}>

          {/* Heading */}
          <h2
            onMouseEnter={headingScramble}
            onTouchStart={headingScramble}
            style={{
              color: '#ffffff',
              fontSize: tightMobile ? 'clamp(34px,9.8vw,48px)' : 'var(--mobile-heading-size)',
              fontWeight: 900, lineHeight: 0.9, letterSpacing: '-2px',
              textTransform: 'uppercase', margin: 0,
              cursor: 'default', userSelect: 'none',
            }}
          >{headingDisp}</h2>

          {/* Eyes – provisorisch durch hase01.glb ersetzt (Test) */}
          <div
            ref={eyesRef}
            style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: tightMobile ? 46 : compactMobile ? 64 : 80 }}
          >
            <HaseEyesModel size={tightMobile ? 170 : compactMobile ? 215 : 250} />
          </div>

          {/* Form or success */}
          <div>
            {status === 'success' ? (
              <p
                onMouseEnter={seenScramble}
                style={{
                  color: '#ffffff',
                  fontSize: tightMobile ? 'clamp(24px,7.8vw,44px)' : 'clamp(28px,9vw,56px)',
                  fontWeight: 900, letterSpacing: '-1.5px', lineHeight: 0.95,
                  textTransform: 'uppercase', margin: 0,
                  animation: 'fadeIn 0.6s ease',
                  cursor: 'default', userSelect: 'none',
                }}
              >{seenDisp}</p>
            ) : (
              <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                <div style={{ position: 'absolute', left: '-9999px', opacity: 0, pointerEvents: 'none' }} aria-hidden="true">
                  <label htmlFor="company-mobile">Company</label>
                  <input
                    id="company-mobile"
                    type="text"
                    tabIndex={-1}
                    autoComplete="off"
                    value={form.company}
                    onChange={e => updateField('company', e.target.value)}
                  />
                </div>
                <div style={{ marginBottom: tightMobile ? 'clamp(6px,1.8svh,10px)' : compactMobile ? 'clamp(10px,2.6svh,16px)' : 'clamp(18px,5vw,28px)' }}>
                  <input type="text" placeholder={T.name[lang]} value={form.name} required maxLength={CONTACT_MAX_NAME_LENGTH}
                    autoComplete="name"
                    onChange={e => updateField('name', e.target.value)}
                    onFocus={onFocus} onBlur={onBlur}
                    style={{ ...fieldStyle, fontSize: 'var(--mobile-body-size)', padding: mobileFieldPadding }} />
                </div>
                <div style={{ marginBottom: tightMobile ? 'clamp(6px,1.8svh,10px)' : compactMobile ? 'clamp(10px,2.6svh,16px)' : 'clamp(18px,5vw,28px)' }}>
                  <input type="email" placeholder={T.email[lang]} value={form.email} required maxLength={CONTACT_MAX_EMAIL_LENGTH}
                    autoComplete="email"
                    onChange={e => updateField('email', e.target.value)}
                    onFocus={onFocus} onBlur={onBlur}
                    style={{ ...fieldStyle, fontSize: 'var(--mobile-body-size)', padding: mobileFieldPadding }} />
                </div>
                <div style={{ marginBottom: tightMobile ? 'clamp(8px,2.2svh,12px)' : compactMobile ? 'clamp(12px,3svh,20px)' : 'clamp(24px,6vw,36px)' }}>
                  <textarea placeholder={T.message[lang]} value={form.message} required rows={tightMobile ? 2 : compactMobile ? 3 : 4} maxLength={CONTACT_MAX_MESSAGE_LENGTH}
                    onChange={e => updateField('message', e.target.value)}
                    onFocus={onFocus as React.FocusEventHandler<HTMLTextAreaElement>}
                    onBlur={onBlur as React.FocusEventHandler<HTMLTextAreaElement>}
                    style={{ ...fieldStyle, resize: 'none', fontSize: 'var(--mobile-body-size)', padding: mobileFieldPadding }} />
                </div>
                {status === 'error' && (
                  <p style={{ color: 'rgba(255,100,100,0.9)', fontSize: 13, margin: '0 0 14px', fontWeight: 600 }}>
                    {getErrorMessage(errorCode, lang)}
                  </p>
                )}
                {/* Full-width send button on mobile */}
                <SendButton
                  label={status === 'sending' ? T.sending[lang] : T.send[lang]}
                  disabled={status === 'sending'}
                  fullWidth
                  compact={compactMobile}
                  tight={tightMobile}
                />
              </form>
            )}
          </div>
        </div>

        {/* Footer */}
        <MobileFooter compact={compactMobile} tight={tightMobile} />
      </section>
    )
  }

  // ── Desktop Layout ───────────────────────────────────────────────────────────
  return (
    <section
      id="kontakt"
      data-textcolor="white"
      style={{
        backgroundColor: '#0a0a0a',
        minHeight: 'var(--app-visual-height, 100svh)',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        zIndex: 80,
        marginTop: '-85vh',
        boxSizing: 'border-box',
      }}
    >
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'row',
        paddingTop: 'clamp(60px,10vw,120px)',
        position: 'relative',
      }}>
        {/* Left: Form */}
        <div style={{
          flex: '0 0 55%',
          paddingLeft: '9vw', paddingRight: '4vw',
          paddingBottom: 'clamp(40px,5vw,60px)',
          display: 'flex', flexDirection: 'column', justifyContent: 'flex-start',
        }}>
          <h2
            onMouseEnter={headingScramble}
            onTouchStart={headingScramble}
            style={{
              color: '#ffffff', fontSize: '8vw', fontWeight: 900,
              lineHeight: 0.9, letterSpacing: '-2px', textTransform: 'uppercase',
              margin: 0,
              cursor: 'default', userSelect: 'none',
            }}
          >{headingDisp}</h2>

          <div style={{ maxWidth: 500, marginTop: 'clamp(36px,4.5vw,58px)' }}>
            {status === 'success' ? (
              <p
                onMouseEnter={seenScramble}
                style={{
                  color: '#ffffff',
                  fontSize: 'clamp(32px,5vw,72px)',
                  fontWeight: 900, letterSpacing: '-2px', lineHeight: 0.95,
                  textTransform: 'uppercase',
                  margin: 'clamp(80px,12vw,160px) 0 0',
                  animation: 'fadeIn 0.6s ease',
                  cursor: 'default', userSelect: 'none',
                }}
              >{seenDisp}</p>
            ) : (
              <form onSubmit={handleSubmit} noValidate>
                <div style={{ position: 'absolute', left: '-9999px', opacity: 0, pointerEvents: 'none' }} aria-hidden="true">
                  <label htmlFor="company-desktop">Company</label>
                  <input
                    id="company-desktop"
                    type="text"
                    tabIndex={-1}
                    autoComplete="off"
                    value={form.company}
                    onChange={e => updateField('company', e.target.value)}
                  />
                </div>
                <div style={{ marginBottom: 'clamp(16px,1.8vw,26px)' }}>
                  <input type="text" placeholder={T.name[lang]} value={form.name} required maxLength={CONTACT_MAX_NAME_LENGTH}
                    autoComplete="name"
                    onChange={e => updateField('name', e.target.value)}
                    onFocus={onFocus} onBlur={onBlur} style={fieldStyle} />
                </div>
                <div style={{ marginBottom: 'clamp(16px,1.8vw,26px)' }}>
                  <input type="email" placeholder={T.email[lang]} value={form.email} required maxLength={CONTACT_MAX_EMAIL_LENGTH}
                    autoComplete="email"
                    onChange={e => updateField('email', e.target.value)}
                    onFocus={onFocus} onBlur={onBlur} style={fieldStyle} />
                </div>
                <div style={{ marginBottom: 'clamp(22px,2.8vw,36px)' }}>
                  <textarea placeholder={T.message[lang]} value={form.message} required rows={4} maxLength={CONTACT_MAX_MESSAGE_LENGTH}
                    onChange={e => updateField('message', e.target.value)}
                    onFocus={onFocus as React.FocusEventHandler<HTMLTextAreaElement>}
                    onBlur={onBlur as React.FocusEventHandler<HTMLTextAreaElement>}
                    style={{ ...fieldStyle, resize: 'none' }} />
                </div>
                {status === 'error' && (
                  <p style={{ color: 'rgba(255,100,100,0.9)', fontSize: 13, margin: '0 0 14px', fontWeight: 600 }}>
                    {getErrorMessage(errorCode, lang)}
                  </p>
                )}
                <SendButton label={status === 'sending' ? T.sending[lang] : T.send[lang]} disabled={status === 'sending'} />
              </form>
            )}
          </div>
        </div>

        {/* Right: provisorisch durch hase01.glb ersetzt (Test) */}
        {/* position:absolute damit die Größe/Reflow der Überschrift (Scramble-Effekt)
            die Position des 3D-Modells niemals beeinflussen kann. */}
        <div
          ref={eyesRef}
          style={{
            position: 'absolute',
            top: '50%',
            right: '9vw',
            transform: 'translateY(-50%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <HaseEyesModel size={480} />
        </div>
      </div>

      {/* Footer */}
      <DesktopFooter />
    </section>
  )
}

// ─── Footer – Desktop ─────────────────────────────────────────────────────────
function DesktopFooter() {
  return (
    <div style={{
      padding: '18px 9vw 26px',
      display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end',
      flexWrap: 'wrap', gap: 12,
    }}>
      <span style={{
        color: '#ffffff', fontSize: 'clamp(13px,1.2vw,16px)',
        fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase',
      }}>
        © {new Date().getFullYear()} Ivan Kolesnikov
      </span>
      <SocialIcons />
    </div>
  )
}

// ─── Footer – Mobile ──────────────────────────────────────────────────────────
function MobileFooter({ compact = false, tight = false }: { compact?: boolean; tight?: boolean }) {
  return (
    <div style={{
      padding: tight ? '10px 6vw 14px' : compact ? '14px 6vw 20px' : '20px 6vw 32px',
      display: 'flex', flexDirection: 'column', gap: tight ? 10 : compact ? 14 : 18,
      borderTop: '1px solid rgba(255,255,255,0.08)',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 16 }}>
        <span style={{
          color: 'rgba(255,255,255,0.4)', fontSize: tight ? 10 : 12,
          fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase',
        }}>
          © {new Date().getFullYear()} Ivan Kolesnikov
        </span>
        <SocialIcons />
      </div>
    </div>
  )
}

// ─── SocialIcons ──────────────────────────────────────────────────────────────
function SocialIcons() {
  return (
    <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
      <IconLink href="https://www.linkedin.com/in/ivan-kolesnikov-flrr/" label="LinkedIn" newTab>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="2" width="20" height="20" rx="2"/>
          <path d="M8 11v5M8 8v.01M12 16v-5c0-1.5 1-2 2-2s2 .5 2 2v5"/>
        </svg>
      </IconLink>
      <IconLink href="mailto:ivan.kolesni03@gmail.com" label="E-Mail">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="2" width="20" height="20" rx="2"/>
          <polyline points="4,7 12,13 20,7"/>
        </svg>
      </IconLink>
    </div>
  )
}

// ─── IconLink ─────────────────────────────────────────────────────────────────
function IconLink({ href, label, children, newTab }: {
  href: string; label: string; children: React.ReactNode; newTab?: boolean
}) {
  const [hov, setHov] = useState(false)
  return (
    <a
      href={href}
      target={newTab ? '_blank' : undefined}
      rel={newTab ? 'noopener noreferrer' : undefined}
      aria-label={label}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        color: '#ffffff', lineHeight: 0, display: 'block',
        opacity: 1,
        transform: hov ? 'scale(1.1)' : 'scale(1)',
        transition: 'transform 0.15s',
      }}
    >{children}</a>
  )
}

// ─── SendButton ───────────────────────────────────────────────────────────────
function SendButton({ label, disabled, fullWidth, compact = false, tight = false }: { label: string; disabled: boolean; fullWidth?: boolean; compact?: boolean; tight?: boolean }) {
  const [pressed, setPressed] = useState(false)
  const [hov, setHov] = useState(false)
  return (
    <button
      type="submit" disabled={disabled}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => { setHov(false); setPressed(false) }}
      style={{
        background: '#ffffff', color: '#0a0a0a', border: 'none',
        padding: tight ? '10px 26px' : compact ? '11px 30px' : '13px 34px',
        width: fullWidth ? '100%' : undefined,
        minHeight: fullWidth ? (tight ? 40 : compact ? 44 : 48) : undefined,
        fontSize: 'clamp(14px,1.6vw,20px)',
        fontWeight: 800, letterSpacing: '-0.3px',
        textTransform: 'uppercase', cursor: disabled ? 'wait' : 'pointer',
        fontFamily: 'inherit',
        transform: pressed ? 'scale(0.94)' : hov ? 'scale(0.98)' : 'scale(1)',
        opacity: disabled ? 0.5 : 1,
        transition: 'transform 0.14s ease, opacity 0.15s ease',
      }}
    >{label}</button>
  )
}
