'use client'
import { useState, useRef, useEffect, useCallback } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'

// ─── Scramble ─────────────────────────────────────────────────────────────────
const CHARS = '!@#$%&*АБВГДЕЖИКЛМНОПРСТУФХЦ'

function runScramble(
  target: string,
  set: (s: string) => void,
  ref: React.MutableRefObject<ReturnType<typeof setInterval> | null>
) {
  let i = 0
  const rev = new Set<number>()
  if (ref.current) clearInterval(ref.current)
  ref.current = setInterval(() => {
    i++
    const pool = target.split('').map((_, j) => j)
      .filter(j => !rev.has(j) && target[j] !== ' ' && target[j] !== '\n')
    if (pool.length) rev.add(pool[Math.floor(Math.random() * pool.length)])
    set(target.split('').map((c, j) =>
      rev.has(j) || c === ' ' || c === '\n'
        ? target[j]
        : CHARS[Math.floor(Math.random() * CHARS.length)]
    ).join(''))
    if (i >= 16) { clearInterval(ref.current!); set(target) }
  }, 30)
}

function useScramble(text: string) {
  const [disp, setDisp] = useState(text)
  const ref = useRef<ReturnType<typeof setInterval> | null>(null)
  const prev = useRef(text)
  useEffect(() => {
    if (prev.current !== text) {
      prev.current = text
      runScramble(text, setDisp, ref)
    }
  }, [text])
  const scramble = useCallback(() => runScramble(text, setDisp, ref), [text])
  return { disp, scramble }
}

// ─── Texte ────────────────────────────────────────────────────────────────────
const T = {
  heading:  { de: 'KONTAKT',                 en: 'CONTACT'             },
  name:     { de: 'Name',                    en: 'Name'                },
  email:    { de: 'E-Mail',                  en: 'Email'               },
  message:  { de: 'Nachricht',               en: 'Message'             },
  send:     { de: 'Senden',                  en: 'Send'                },
  sending:  { de: 'Sendet...',               en: 'Sending...'          },
  seen:     { de: 'Wir sehen uns...',            en: 'See you...'                    },
  error:    { de: 'Versuch es einfach nochmal.', en: 'Just try again.'               },
}

type Lang = 'de' | 'en'

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

// ─── ThirdEye — öffnet sich zwischen den beiden Augen ─────────────────────────
function ThirdEye({ open, pupil, size }: { open: boolean; pupil: EyePos; size: number }) {
  const h = size * 0.5
  const pupilSize = size * 0.42
  const scale = size / 180
  // Lider fahren auseinander wenn open=true
  return (
    <div style={{
      position: 'absolute',
      top: '50%', left: '50%',
      transform: 'translate(-50%, -50%)',
      width: size, height: h,
      flexShrink: 0,
      zIndex: 20,
      // Beim Öffnen: leicht größer werden
      transition: 'transform 0.6s cubic-bezier(0.34,1.56,0.64,1)',
    }}>
      {/* Oberes Lid */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: '55%',
        backgroundColor: '#0a0a0a', zIndex: 10,
        transformOrigin: 'top center',
        transform: open ? 'scaleY(0)' : 'scaleY(1)',
        transition: 'transform 0.7s cubic-bezier(0.34,1.56,0.64,1)',
        borderBottomLeftRadius: '45%', borderBottomRightRadius: '45%',
      }} />
      {/* Unteres Lid */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: '55%',
        backgroundColor: '#0a0a0a', zIndex: 10,
        transformOrigin: 'bottom center',
        transform: open ? 'scaleY(0)' : 'scaleY(1)',
        transition: 'transform 0.7s cubic-bezier(0.34,1.56,0.64,1)',
        borderTopLeftRadius: '45%', borderTopRightRadius: '45%',
      }} />
      {/* Leucht-Overlay — über den Lidern (zIndex > 10) */}
      {open && (
        <div style={{
          position: 'absolute', inset: 0,
          borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%',
          boxShadow: '0 0 40px 12px rgba(255,255,255,0.45), 0 0 80px 24px rgba(255,255,255,0.18)',
          zIndex: 20,
          pointerEvents: 'none',
        }} />
      )}
      {/* Augapfel */}
      <div style={{
        width: size, height: h, backgroundColor: '#fff',
        borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%',
        position: 'relative', overflow: 'hidden',
        boxShadow: open ? '0 0 40px rgba(255,255,255,0.5), 0 0 80px rgba(255,255,255,0.2)' : 'none',
        transition: 'box-shadow 0.8s ease',
      }}>
        {/* Pupille */}
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
  containerRef, success, lang,
}: {
  containerRef: React.RefObject<HTMLDivElement | null>
  success: boolean
  lang: Lang
}) {
  const [pupil, setPupil] = useState<EyePos>({ x: 0, y: 0 })
  const [blinking, setBlinking] = useState(false)
  const [thirdOpen, setThirdOpen] = useState(false)
  const smooth = useRef<EyePos>({ x: 0, y: 0 })
  const target = useRef<EyePos>({ x: 0, y: 0 })
  const rafRef = useRef(0)
  const blinkRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [eyeSize, setEyeSize] = useState(170)

  useEffect(() => {
    const update = () => setEyeSize(window.innerWidth < 768 ? 110 : window.innerWidth < 1200 ? 140 : 170)
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  useEffect(() => {
    if (!success) return
    const t1 = setTimeout(() => setThirdOpen(true), 400)
    return () => { clearTimeout(t1) }
  }, [success])

  useEffect(() => {
    const step = () => {
      smooth.current.x += (target.current.x - smooth.current.x) * 0.08
      smooth.current.y += (target.current.y - smooth.current.y) * 0.08
      setPupil({ x: smooth.current.x, y: smooth.current.y })
      rafRef.current = requestAnimationFrame(step)
    }
    rafRef.current = requestAnimationFrame(step)
    return () => cancelAnimationFrame(rafRef.current)
  }, [])

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      const el = containerRef.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      const cx = rect.left + rect.width / 2
      const cy = rect.top + rect.height / 2
      const dx = e.clientX - cx
      const dy = e.clientY - cy
      const dist = Math.sqrt(dx * dx + dy * dy)
      const max = 28
      target.current = {
        x: (dx / Math.max(dist, 1)) * Math.min(dist / 15, max),
        y: (dy / Math.max(dist, 1)) * Math.min(dist / 15, max),
      }
    }
    window.addEventListener('mousemove', onMove)
    return () => window.removeEventListener('mousemove', onMove)
  }, [containerRef])

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

      {/* Drittes Auge — höher oben */}
      <div style={{
        opacity: success ? 1 : 0,
        transform: success ? 'scale(1) translateY(-120px)' : 'scale(0.4) translateY(40px)',
        transition: 'opacity 0.5s ease, transform 0.8s cubic-bezier(0.34,1.56,0.64,1)',
        pointerEvents: success ? 'auto' : 'none',
        marginBottom: -eyeSize * 0.1,
        zIndex: 10,
        position: 'relative',
        filter: success && thirdOpen ? 'drop-shadow(0 0 18px rgba(255,255,255,0.6)) drop-shadow(0 0 40px rgba(255,255,255,0.25))' : 'none',
      }}>
        <ThirdEye open={thirdOpen} pupil={pupil} size={thirdSize} />
      </div>

      {/* Zwei normale Augen */}
      <div style={{ display: 'flex', flexDirection: 'row', gap, alignItems: 'center', position: 'relative', zIndex: 1 }}>
        <Eye pupil={pupil} blinking={blinking} size={eyeSize} />
        <Eye pupil={pupil} blinking={blinking} size={eyeSize} />
      </div>

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
  // Scramble bei Sprachwechsel
  useEffect(() => { seenScramble() }, [lang]) // eslint-disable-line react-hooks/exhaustive-deps
  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle')
  const eyesRef = useRef<HTMLDivElement>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (status === 'sending') return
    setStatus('sending')
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(form),
      })
      if (res.ok) { setStatus('success'); setForm({ name: '', email: '', message: '' }) }
      else setStatus('error')
    } catch { setStatus('error') }
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

  return (
    <section
      id="kontakt"
      style={{
        backgroundColor: '#0a0a0a',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        zIndex: 5,
        boxSizing: 'border-box',
      }}
    >
      {/* ── Hauptbereich: links Form, rechts Augen ── */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'row',
        paddingTop: 'clamp(52px,7vw,88px)',
      }}>

        {/* LINKS */}
        <div style={{
          flex: '0 0 55%',
          paddingLeft: '9vw',
          paddingRight: '4vw',
          paddingBottom: 'clamp(40px,5vw,60px)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-start',
        }}>
          <h2
            onMouseEnter={headingScramble}
            style={{
              color: '#ffffff', fontSize: '8vw', fontWeight: 900,
              lineHeight: 0.9, letterSpacing: '-2px',
              textTransform: 'uppercase',
              margin: '0 0 clamp(36px,4.5vw,58px)',
              cursor: 'default', userSelect: 'none',
            }}
          >{headingDisp}</h2>

          <div style={{ maxWidth: 500 }}>
            {status === 'success' ? (
              <p
                onMouseEnter={seenScramble}
                style={{
                color: '#ffffff',
                fontSize: 'clamp(32px,5vw,72px)',
                fontWeight: 900,
                letterSpacing: '-2px',
                lineHeight: 0.95,
                textTransform: 'uppercase',
                margin: 'clamp(80px,12vw,160px) 0 0',
                animation: 'fadeIn 0.6s ease',
                cursor: 'default', userSelect: 'none',
              }}>{seenDisp}</p>
            ) : (
              <form onSubmit={handleSubmit} noValidate>
                <div style={{ marginBottom: 'clamp(16px,1.8vw,26px)' }}>
                  <input type="text" placeholder={T.name[lang]} value={form.name} required
                    onChange={e => setForm(s => ({ ...s, name: e.target.value }))}
                    onFocus={onFocus} onBlur={onBlur} style={fieldStyle} />
                </div>
                <div style={{ marginBottom: 'clamp(16px,1.8vw,26px)' }}>
                  <input type="email" placeholder={T.email[lang]} value={form.email} required
                    onChange={e => setForm(s => ({ ...s, email: e.target.value }))}
                    onFocus={onFocus} onBlur={onBlur} style={fieldStyle} />
                </div>
                <div style={{ marginBottom: 'clamp(22px,2.8vw,36px)' }}>
                  <textarea placeholder={T.message[lang]} value={form.message} required rows={4}
                    onChange={e => setForm(s => ({ ...s, message: e.target.value }))}
                    onFocus={onFocus as React.FocusEventHandler<HTMLTextAreaElement>}
                    onBlur={onBlur as React.FocusEventHandler<HTMLTextAreaElement>}
                    style={{ ...fieldStyle, resize: 'none' }} />
                </div>
                {status === 'error' && (
                  <p style={{ color: 'rgba(255,100,100,0.9)', fontSize: 13, margin: '0 0 14px', fontWeight: 600 }}>
                    {T.error[lang]}
                  </p>
                )}
                <SendButton label={status === 'sending' ? T.sending[lang] : T.send[lang]} disabled={status === 'sending'} />
              </form>
            )}
          </div>
        </div>

        {/* RECHTS: Augen */}
        <div
          ref={eyesRef}
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            paddingRight: '9vw',
          }}
        >
          <Eyes containerRef={eyesRef} success={status === 'success'} lang={lang} />
        </div>
      </div>

      {/* ── Footer ── */}
      <div style={{
        padding: '18px 9vw 26px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 12,
      }}>
        <span style={{
          color: '#ffffff', fontSize: 'clamp(13px,1.2vw,16px)',
          fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase',
        }}>
          © {new Date().getFullYear()} Ivan Kolesnikov
        </span>
        <div style={{ display: 'flex', gap: 18, alignItems: 'center' }}>
          <IconLink href="https://www.linkedin.com/in/ivan-kolesnikov-flrr/" label="LinkedIn" newTab>
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="#ffffff" strokeWidth="2.6" strokeLinecap="square" strokeLinejoin="miter">
              <rect x="2" y="2" width="24" height="24"/>
              <line x1="9" y1="13" x2="9" y2="20"/>
              <circle cx="9" cy="9.5" r="1" fill="#ffffff" stroke="none"/>
              <path d="M14 20v-4a3 3 0 0 1 6 0v4"/>
              <line x1="14" y1="13" x2="14" y2="20"/>
            </svg>
          </IconLink>
          <IconLink href="mailto:ivan.kolesni03@gmail.com" label="E-Mail">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="#ffffff" strokeWidth="2.6" strokeLinecap="square" strokeLinejoin="miter">
              <rect x="2" y="5" width="24" height="18"/>
              <polyline points="2,5 14,15 26,5"/>
            </svg>
          </IconLink>
        </div>
      </div>
    </section>
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
        opacity: hov ? 1 : 0.65,
        transform: hov ? 'scale(1.1)' : 'scale(1)',
        transition: 'opacity 0.15s, transform 0.15s',
      }}
    >{children}</a>
  )
}

// ─── SendButton ───────────────────────────────────────────────────────────────
function SendButton({ label, disabled }: { label: string; disabled: boolean }) {
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
        padding: '13px 34px',
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