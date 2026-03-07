'use client'

import { useState, useEffect, useRef } from 'react'

interface EyePos { x: number; y: number }

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

export function PasswordGate({ children }: { children: React.ReactNode }) {
  const [unlocked, setUnlocked] = useState(false)
  const [input, setInput] = useState('')
  const [error, setError] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [pupil, setPupil] = useState<EyePos>({ x: 0, y: 0 })
  const [blinking, setBlinking] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const smooth = useRef<EyePos>({ x: 0, y: 0 })
  const target = useRef<EyePos>({ x: 0, y: 0 })
  const rafRef = useRef(0)
  const blinkRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    setMounted(true)
    const saved = sessionStorage.getItem('unlocked')
    if (saved === 'true') setUnlocked(true)
  }, [])

  // Pupille folgt Maus
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
  }, [])

  // Smooth follow
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

  // Blinzeln
  useEffect(() => {
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
    return () => { if (blinkRef.current) clearTimeout(blinkRef.current) }
  }, [])

  const handleSubmit = () => {
    if (input === 'Sugoma') {
      sessionStorage.setItem('unlocked', 'true')
      setUnlocked(true)
      setError(false)
    } else {
      setError(true)
      setInput('')
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSubmit()
  }

  if (!mounted) return <>{children}</>
  if (unlocked) return <>{children}</>

  const eyeSize = typeof window !== 'undefined' && window.innerWidth < 768 ? 120 : 160

  return (
    <div
      ref={containerRef}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: '#000',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        fontFamily: 'monospace',
      }}
    >
      <div style={{ textAlign: 'center', width: '90%', maxWidth: '400px' }}>

        {/* Auge */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '48px' }}>
          <SingleEye pupil={pupil} blinking={blinking} size={eyeSize} />
        </div>

        {/* Titel */}
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
          onChange={e => { setInput(e.target.value); setError(false) }}
          onKeyDown={handleKeyDown}
          autoFocus
          placeholder="••••••"
          style={{
            width: '100%',
            background: 'transparent',
            border: 'none',
            borderBottom: `1px solid ${error ? '#ff3333' : '#333'}`,
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
          opacity: error ? 1 : 0,
          transition: 'opacity 0.2s',
        }}>
          NO
        </p>

        <button
          onClick={handleSubmit}
          style={{
            background: 'transparent',
            border: '1px solid #333',
            color: '#fff',
            fontSize: '11px',
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            padding: '14px 40px',
            cursor: 'pointer',
            width: '100%',
            transition: 'border-color 0.2s',
          }}
          onMouseEnter={e => { (e.target as HTMLButtonElement).style.borderColor = '#fff' }}
          onMouseLeave={e => { (e.target as HTMLButtonElement).style.borderColor = '#333' }}
        >
          ENTER
        </button>
      </div>
    </div>
  )
}

export default PasswordGate