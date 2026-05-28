'use client'

import { useState, useEffect, useRef } from 'react'
import { CustomCursor } from '@/components/CustomCursor'
import { useMobile } from '@/hooks/use-mobile'
import { useMouse } from '@/contexts/MouseContext'

interface EyePos { x: number; y: number }

type GateStatus = 'checking' | 'locked' | 'submitting' | 'unlocked'

interface PasswordGateProps {
  onUnlock: () => void
}

function SingleEye({ pupil, blinking, size }: { pupil: EyePos; blinking: boolean; size: number }) {
  const h = size * 0.5
  const pupilSize = size * 0.42
  const scale = size / 180
  return (
    <div style={{ position: 'relative', width: size, height: h, flexShrink: 0 }}>
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: '55%',
        backgroundColor: '#000', zIndex: 10,
        transformOrigin: 'top center',
        transform: blinking ? 'scaleY(1)' : 'scaleY(0)',
        transition: 'transform 0.05s ease-in-out',
        borderBottomLeftRadius: '45%', borderBottomRightRadius: '45%',
      }} />
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: '55%',
        backgroundColor: '#000', zIndex: 10,
        transformOrigin: 'bottom center',
        transform: blinking ? 'scaleY(1)' : 'scaleY(0)',
        transition: 'transform 0.05s ease-in-out',
        borderTopLeftRadius: '45%', borderTopRightRadius: '45%',
      }} />
      <div style={{
        width: size, height: h, backgroundColor: '#fff',
        borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%',
        position: 'relative', overflow: 'hidden',
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

export function PasswordGate({ onUnlock }: PasswordGateProps) {
  const [status, setStatus] = useState<GateStatus>('locked')
  const [input, setInput] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [pupil, setPupil] = useState<EyePos>({ x: 0, y: 0 })
  const [blinking, setBlinking] = useState(false)
  const [inputFocused, setInputFocused] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const smooth = useRef<EyePos>({ x: 0, y: 0 })
  const target = useRef<EyePos>({ x: 0, y: 0 })
  const rafRef = useRef(0)
  const blinkRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const autoAnimTime = useRef(0)
  const { isMobile } = useMobile()
  const { mouseX, mouseY } = useMouse()

  // Desktop: Mouse tracking via context
  useEffect(() => {
    if (status !== 'locked' && status !== 'submitting') return
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
  }, [status, isMobile, mouseX, mouseY])

  // Mobile: Gentle automatic eye movement
  useEffect(() => {
    if (status !== 'locked' && status !== 'submitting') return
    if (!isMobile) return

    const autoAnimate = () => {
      autoAnimTime.current += 0.03
      // Subtle circular/figure-8 movement
      const autoX = Math.sin(autoAnimTime.current) * 12
      const autoY = Math.sin(autoAnimTime.current * 1.5) * 6
      target.current = { x: autoX, y: autoY }
    }

    const interval = setInterval(autoAnimate, 50)
    return () => clearInterval(interval)
  }, [status, isMobile])

  useEffect(() => {
    if (status !== 'locked' && status !== 'submitting') {
      setPupil({ x: 0, y: 0 })
      smooth.current = { x: 0, y: 0 }
      target.current = { x: 0, y: 0 }
      return
    }

    const step = () => {
      smooth.current.x += (target.current.x - smooth.current.x) * 0.08
      smooth.current.y += (target.current.y - smooth.current.y) * 0.08
      setPupil({ x: smooth.current.x, y: smooth.current.y })
      rafRef.current = requestAnimationFrame(step)
    }
    rafRef.current = requestAnimationFrame(step)
    return () => cancelAnimationFrame(rafRef.current)
  }, [status])

  useEffect(() => {
    if (status !== 'locked' && status !== 'submitting') {
      setBlinking(false)
      return
    }

    const schedule = () => {
      blinkRef.current = setTimeout(() => {
        setBlinking(true)
        const dur = 100 + Math.random() * 50
        setTimeout(() => {
          setBlinking(false)
          schedule()
        }, dur)
      }, 2000 + Math.random() * 4000)
    }
    schedule()
    return () => {
      if (blinkRef.current) clearTimeout(blinkRef.current)
    }
  }, [status])

  const handleSubmit = async () => {
    if (!input) {
      setErrorMessage('NO')
      return
    }

    setStatus('submitting')
    setErrorMessage('')

    try {
      const response = await fetch('/api/password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password: input }),
      })

      if (!response.ok) {
        setStatus('locked')
        setErrorMessage('NO')
        setInput('')
        return
      }

      sessionStorage.setItem('unlocked', 'true')
      setStatus('unlocked')
      setInput('')
      onUnlock()
    } catch {
      setStatus('locked')
      setErrorMessage('TRY AGAIN')
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSubmit()
  }

  if (status === 'checking' || status === 'unlocked') return null

  const eyeSize = isMobile ? 120 : 160

  return (
    <>
      {!inputFocused && <CustomCursor />}
      <div
        ref={containerRef}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: '100vw',
          height: '100vh',
          backgroundColor: '#000',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          fontFamily: 'monospace',
          overflow: 'hidden',
        }}
      >
      <div style={{ textAlign: 'center', width: '90%', maxWidth: '400px' }}>

        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '48px' }}>
          <SingleEye pupil={pupil} blinking={blinking} size={eyeSize} />
        </div>

        <div style={{
          fontSize: 'clamp(20px, 5vw, 28px)',
          fontWeight: '900',
          color: '#fff',
          letterSpacing: '-0.02em',
          marginBottom: '40px',
          lineHeight: 0.9,
        }}>
          WHO ARE YOU?
        </div>

        <p style={{
          color: '#555',
          fontSize: '11px',
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          marginBottom: '24px',
        }}>

        </p>

        <input
          type="password"
          value={input}
          onChange={e => { setInput(e.target.value); setErrorMessage('') }}
          onKeyDown={handleKeyDown}
          onFocus={() => setInputFocused(true)}
          onBlur={() => setInputFocused(false)}
          autoFocus
          placeholder="••••••"
          disabled={status === 'submitting'}
          style={{
            width: '100%',
            background: 'transparent',
            border: 'none',
            borderBottom: `1px solid ${errorMessage ? '#ff3333' : '#333'}`,
            color: '#fff',
            fontSize: '18px',
            padding: '12px 0',
            outline: 'none',
            textAlign: 'center',
            letterSpacing: '0.3em',
            marginBottom: '8px',
            transition: 'border-color 0.2s',
          }}
        />

        <p style={{
          color: '#ff3333',
          fontSize: '11px',
          letterSpacing: '0.15em',
          textTransform: 'uppercase',
          height: '20px',
          marginBottom: '32px',
          opacity: errorMessage ? 1 : 0,
          transition: 'opacity 0.2s',
        }}>
          {errorMessage || ' '}
        </p>

        <button
          onClick={handleSubmit}
          disabled={status === 'submitting'}
          style={{
            background: 'transparent',
            border: '1px solid #333',
            color: '#fff',
            fontSize: '11px',
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            padding: '14px 40px',
            cursor: status === 'submitting' ? 'default' : 'pointer',
            width: '100%',
            transition: 'border-color 0.2s',
            opacity: status === 'submitting' ? 0.65 : 1,
          }}
          onMouseEnter={e => { (e.target as HTMLButtonElement).style.borderColor = '#fff' }}
          onMouseLeave={e => { (e.target as HTMLButtonElement).style.borderColor = '#333' }}
        >
          {status === 'submitting' ? 'CHECKING' : 'ENTER'}
        </button>
      </div>
    </div>
    </>
  )
}

export default PasswordGate