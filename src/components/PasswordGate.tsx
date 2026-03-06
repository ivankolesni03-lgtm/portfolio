'use client'

import { useState, useEffect } from 'react'

export function PasswordGate({ children }: { children: React.ReactNode }) {
  const [unlocked, setUnlocked] = useState(false)
  const [input, setInput] = useState('')
  const [error, setError] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const saved = sessionStorage.getItem('unlocked')
    if (saved === 'true') setUnlocked(true)
  }, [])

  const handleSubmit = () => {
    if (input === 'sugoma') {
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

  return (
    <div
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
        <div
          style={{
            fontSize: 'clamp(24px, 6vw, 36px)',
            fontWeight: '900',
            color: '#fff',
            letterSpacing: '-0.02em',
            marginBottom: '60px',
            lineHeight: 0.9,
          }}
        >
          IVAN<br />KOLESNIKOV
        </div>

        <p style={{ color: '#555', fontSize: '11px', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '24px' }}>
          Passwort eingeben
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
          Falsches Passwort
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