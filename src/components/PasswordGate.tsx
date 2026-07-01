'use client'

import { useEffect, useState, type KeyboardEvent } from 'react'
import { CustomCursor } from '@/components/CustomCursor'
import { useMobile } from '@/hooks/use-mobile'
import { useLanguage } from '@/contexts/LanguageContext'
import { getIntroLayout } from '@/lib/intro-layout'

type GateStatus = 'checking' | 'locked' | 'submitting' | 'unlocked'

interface PasswordGateProps {
  onUnlock: () => void
}

export function PasswordGate({ onUnlock }: PasswordGateProps) {
  const [status, setStatus] = useState<GateStatus>('checking')
  const [input, setInput] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [inputFocused, setInputFocused] = useState(false)

  const { isMobile, width, height } = useMobile()
  const { t } = useLanguage()

  const emptyError = t('PASSWORT FEHLT', 'PASSWORD REQUIRED')
  const wrongError = t('FALSCHES PASSWORT', 'WRONG PASSWORD')
  const retryError = t('BITTE ERNEUT VERSUCHEN', 'PLEASE TRY AGAIN')
  const inputPlaceholder = t('PASSWORT', 'PASSWORD')
  const enterText = t('EINGEBEN', 'ENTER')

  useEffect(() => {
    const saved = sessionStorage.getItem('unlocked')
    let frame: number | null = null
    if (saved === 'true') {
      frame = requestAnimationFrame(() => {
        setStatus('unlocked')
        onUnlock()
      })
      return () => { if (frame !== null) cancelAnimationFrame(frame) }
    }
    frame = requestAnimationFrame(() => setStatus('locked'))
    return () => { if (frame !== null) cancelAnimationFrame(frame) }
  }, [onUnlock])

  const handleSubmit = async () => {
    if (!input) {
      setErrorMessage(emptyError)
      return
    }

    setStatus('submitting')
    setErrorMessage('')

    try {
      const response = await fetch('/api/password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: input }),
      })

      if (!response.ok) {
        setStatus('locked')
        setErrorMessage(wrongError)
        setInput('')
        return
      }

      sessionStorage.setItem('unlocked', 'true')
      setStatus('unlocked')
      setInput('')
      onUnlock()
    } catch {
      setStatus('locked')
      setErrorMessage(retryError)
    }
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleSubmit()
  }

  if (status === 'checking' || status === 'unlocked') return null

  const introLayout = getIntroLayout({ isMobile, width, height })
  const left = introLayout.nameLeft
  const top = introLayout.nameTop
  const fontSize = introLayout.nameFontSize
  const rowTop = top + fontSize * 1.85
  const rowLeft = left + fontSize * (isMobile ? 0.065 : 0.062)
  const inputWidth = isMobile ? '50vw' : '24.5vw'
  const passwordInputFontSize = 'clamp(20px, 2.15vw, 26px)'
  const enterFontSize = 'clamp(12px, 1.1vw, 15px)'

  return (
    <>
      {!inputFocused && <CustomCursor />}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          width: '100vw',
          height: 'var(--app-visual-height, 100svh)',
          backgroundColor: '#ffffff',
          zIndex: 9999,
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'fixed',
            right: isMobile ? '-12vw' : '1.5vw',
            top: isMobile ? '30svh' : 'auto',
            bottom: isMobile ? 'auto' : '10svh',
            zIndex: 0,
            pointerEvents: 'none',
            maskImage: 'radial-gradient(ellipse at center, rgba(0,0,0,1) 76%, rgba(0,0,0,0) 100%)',
            WebkitMaskImage: 'radial-gradient(ellipse at center, rgba(0,0,0,1) 76%, rgba(0,0,0,0) 100%)',
          }}
        >
          <img
            src="/photos/background.jpg"
            alt=""
            style={{
              width: isMobile ? '100vw' : '660px',
              height: 'auto',
              display: 'block',
            }}
          />
        </div>

        <div
          style={{
            position: 'fixed',
            left,
            top,
            zIndex: 10,
            mixBlendMode: 'difference',
            pointerEvents: 'none',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', userSelect: 'none' }}>
            <span
              className="text-white"
              style={{
                fontSize,
                lineHeight: 0.9,
                letterSpacing: '-0.02em',
                display: 'block',
                fontWeight: 700,
              }}
            >
              IVAN
            </span>
            <span
              className="text-white"
              style={{
                fontSize,
                lineHeight: 0.9,
                letterSpacing: '-0.02em',
                display: 'block',
                fontWeight: 700,
              }}
            >
              KOLESNIKOV
            </span>
          </div>
        </div>

        <div
          style={{
            position: 'fixed',
            left: rowLeft,
            top: rowTop,
            zIndex: 20,
            width: isMobile ? '84vw' : '44vw',
            maxWidth: 640,
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-end',
              gap: isMobile ? 12 : 18,
              width: '100%',
            }}
          >
            <input
              id="portfolio-password"
              type="password"
              value={input}
              onChange={(e) => {
                setInput(e.target.value)
                setErrorMessage('')
              }}
              onKeyDown={handleKeyDown}
              onFocus={() => setInputFocused(true)}
              onBlur={() => setInputFocused(false)}
              autoFocus
              placeholder={inputPlaceholder}
              disabled={status === 'submitting'}
              style={{
                width: inputWidth,
                background: 'transparent',
                border: 'none',
                borderBottom: `2px solid ${errorMessage ? '#ff2d2d' : '#0a0a0a'}`,
                color: '#0a0a0a',
                fontSize: passwordInputFontSize,
                fontWeight: 700,
                lineHeight: 1,
                padding: '8px 0',
                outline: 'none',
                letterSpacing: '0.06em',
                transition: 'border-color 0.2s ease',
                boxSizing: 'border-box',
                textTransform: 'uppercase',
              }}
            />

            <button
              onClick={handleSubmit}
              disabled={status === 'submitting'}
              style={{
                background: '#0a0a0a',
                border: '1px solid #0a0a0a',
                color: '#ffffff',
                fontSize: enterFontSize,
                fontWeight: 700,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                borderRadius: 0,
                padding: isMobile ? '8px 14px' : '10px 18px',
                cursor: status === 'submitting' ? 'default' : 'pointer',
                minWidth: isMobile ? 108 : 136,
                transition: 'opacity 0.2s ease, transform 0.15s ease',
                opacity: status === 'submitting' ? 0.65 : 1,
                flexShrink: 0,
              }}
              onMouseDown={(e) => {
                ;(e.currentTarget as HTMLButtonElement).style.transform = 'scale(0.98)'
              }}
              onMouseUp={(e) => {
                ;(e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)'
              }}
              onMouseLeave={(e) => {
                ;(e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)'
              }}
            >
              {enterText}
            </button>
          </div>

          <p
            style={{
              color: '#ff2d2d',
              fontSize: '11px',
              fontWeight: 700,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              minHeight: 20,
              marginTop: 10,
              opacity: errorMessage ? 1 : 0,
              transition: 'opacity 0.2s',
            }}
          >
            {errorMessage || ' '}
          </p>
        </div>

        {/* Experience Designer label - matches Hero animation start position, static */}
        <div
          style={{
            position: 'fixed',
            left: introLayout.experienceLeft,
            top: introLayout.experienceTop,
            zIndex: 10,
            mixBlendMode: 'difference',
            pointerEvents: 'none',
            color: '#ffffff',
            fontWeight: 900,
            textTransform: 'uppercase',
            letterSpacing: '-1px',
            lineHeight: 1.12,
            fontSize: isMobile ? 'clamp(20px, 6.4vw, 34px)' : 'clamp(28px, 2.7vw, 46px)',
          }}
        >
          Experience<br />Designer
        </div>

        <style jsx>{`
          #portfolio-password::placeholder {
            font-size: ${enterFontSize};
            line-height: 1;
          }
        `}</style>
      </div>
    </>
  )
}

export default PasswordGate