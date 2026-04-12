'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { CustomCursor } from '@/components/CustomCursor'
import { useMobile } from '@/hooks/use-mobile'
import { useMouse } from '@/contexts/MouseContext'
import { useLanguage } from '@/contexts/LanguageContext'
import { startScramble } from '@/lib/scramble'
import { track } from '@vercel/analytics'

type GateStatus = 'checking' | 'captcha' | 'password' | 'submitting' | 'unlocked'

// CAPTCHA options - replace with your own goofy images in /public/captcha/
const captchaOptions = [
  { id: 1, label: 'job', img: 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=200&h=200&fit=crop' }, // Business handshake
  { id: 2, label: 'portfolio', img: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=200&h=200&fit=crop' }, // Laptop with analytics
  { id: 3, label: 'stalking', img: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=200&h=200&fit=crop' }, // Suspicious coffee spy vibes
  { id: 4, label: 'boredom', img: 'https://images.unsplash.com/photo-1541199249251-f713e6145474?w=200&h=200&fit=crop' }, // Bored cat
  { id: 5, label: 'inspiration', img: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=200&h=200&fit=crop' }, // Notebook with coffee
  { id: 6, label: 'stealing', img: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=200&h=200&fit=crop' }, // Sneaky raccoon energy
  { id: 7, label: 'accident', img: 'https://images.unsplash.com/photo-1518020382113-a7e8fc38eac9?w=200&h=200&fit=crop' }, // Confused dog
  { id: 8, label: 'curious', img: 'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=200&h=200&fit=crop' }, // Curious cat
  { id: 9, label: 'noIdea', img: 'https://images.unsplash.com/photo-1533738363-b7f9aef128ce?w=200&h=200&fit=crop' }, // Cat with sunglasses
]

export function PasswordGate({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<GateStatus>('checking')
  const [input, setInput] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const { isMobile } = useMobile()
  const { language, toggleLanguage, t } = useLanguage()

  const [selectedCaptcha, setSelectedCaptcha] = useState<number[]>([])
  const [captchaResponse, setCaptchaResponse] = useState('')
  const [showPasswordPanel, setShowPasswordPanel] = useState(false)
  
  // Language button state
  const [langDisplayText, setLangDisplayText] = useState(language === 'de' ? 'DE' : 'ENG')
  const languageRef = useRef(language)
  const langCleanupRef = useRef<(() => void) | null>(null)

  // Scrambling text states
  const [captchaTitle, setCaptchaTitle] = useState(language === 'de' ? 'Wähle aus, was dich hierher geführt hat' : 'Select what brought you here')
  const [captchaSubtitle, setCaptchaSubtitle] = useState(language === 'de' ? 'Wähle alle zutreffenden aus' : 'Select all that apply')
  const [verifyText, setVerifyText] = useState(language === 'de' ? 'BESTÄTIGEN' : 'VERIFY')
  const [selectedText, setSelectedText] = useState(language === 'de' ? 'ausgewählt' : 'selected')
  const [accessText, setAccessText] = useState(language === 'de' ? 'ZUGANGSCODE' : 'ACCESS CODE')
  const [enterText, setEnterText] = useState(language === 'de' ? 'WEITER' : 'ENTER')
  const [checkingText, setCheckingText] = useState(language === 'de' ? 'PRÜFE...' : 'CHECKING...')
  const [verifiedText, setVerifiedText] = useState(language === 'de' ? '✓ Verifiziert' : '✓ Verified')

  const cleanupRefs = useRef<{[key: string]: (() => void) | null}>({})

  const scrambleTextTo = useCallback((
    key: string,
    target: string, 
    setter: React.Dispatch<React.SetStateAction<string>>
  ) => {
    cleanupRefs.current[key]?.()
    cleanupRefs.current[key] = startScramble(target, setter, { maxIterations: 12 })
  }, [])

  // Update texts when language changes
  useEffect(() => {
    if (languageRef.current === language) return
    languageRef.current = language
    
    setLangDisplayText(language === 'de' ? 'DE' : 'ENG')
    scrambleTextTo('captchaTitle', language === 'de' ? 'Wähle aus, was dich hierher geführt hat' : 'Select what brought you here', setCaptchaTitle)
    scrambleTextTo('captchaSubtitle', language === 'de' ? 'Wähle alle zutreffenden aus' : 'Select all that apply', setCaptchaSubtitle)
    scrambleTextTo('verify', language === 'de' ? 'BESTÄTIGEN' : 'VERIFY', setVerifyText)
    scrambleTextTo('selected', language === 'de' ? 'ausgewählt' : 'selected', setSelectedText)
    scrambleTextTo('access', language === 'de' ? 'ZUGANGSCODE' : 'ACCESS CODE', setAccessText)
    scrambleTextTo('enter', language === 'de' ? 'WEITER' : 'ENTER', setEnterText)
    scrambleTextTo('checking', language === 'de' ? 'PRÜFE...' : 'CHECKING...', setCheckingText)
    scrambleTextTo('verified', language === 'de' ? '✓ Verifiziert' : '✓ Verified', setVerifiedText)
  }, [language, scrambleTextTo])

  const scrambleLangTo = useCallback((target: string) => {
    langCleanupRef.current?.()
    langCleanupRef.current = startScramble(target, setLangDisplayText, { maxIterations: 12 })
  }, [])

  const handleLangToggle = () => {
    const next = language === 'de' ? 'ENG' : 'DE'
    scrambleLangTo(next)
    setTimeout(() => toggleLanguage(), 12 * 40)
  }

  const handleLangHover = () => {
    const cur = language === 'de' ? 'DE' : 'ENG'
    scrambleLangTo(cur)
  }

  useEffect(() => {
    const saved = sessionStorage.getItem('unlocked')
    setStatus(saved === 'true' ? 'unlocked' : 'captcha')
  }, [])

  const handleSubmit = async () => {
    if (!input) {
      setErrorMessage(t('NEIN', 'NO'))
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
        setStatus('password')
        setErrorMessage(t('NEIN', 'NO'))
        setInput('')
        return
      }

      sessionStorage.setItem('unlocked', 'true')
      setStatus('unlocked')
      setInput('')
    } catch {
      setStatus('password')
      setErrorMessage(t('NOCHMAL', 'TRY AGAIN'))
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSubmit()
  }

  const handleCaptchaSelect = (id: number) => {
    setSelectedCaptcha(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
  }

  const handleCaptchaSubmit = () => {
    if (selectedCaptcha.length === 0) {
      setCaptchaResponse(t("Wähle mindestens eins. Ich bin neugierig.", "Select at least one. I'm curious."))
      return
    }
    
    // Get selected labels
    const selectedLabels = selectedCaptcha.map(id => captchaOptions.find(o => o.id === id)?.label || '')
    
    // Custom responses based on selection
    let response = ''
    if (selectedCaptcha.length === 9) {
      response = t("Gierig. Ich mag das.", "Greedy. I like that.")
    } else if (selectedLabels.includes('stalking') && selectedCaptcha.length === 1) {
      response = t("Respekt für die Ehrlichkeit.", "Respect for the honesty.")
    } else if (selectedLabels.includes('stealing')) {
      response = t("Nimm dir was du brauchst.", "Take what you need.")
    } else if (selectedLabels.includes('job') && selectedCaptcha.length === 1) {
      response = t("Sehr professionell.", "Very professional.")
    } else if (selectedLabels.includes('noIdea')) {
      response = t("Macht nichts. Ich auch nicht.", "That's fine. Me neither.")
    } else if (selectedLabels.includes('boredom')) {
      response = t("Verständlich.", "Understandable.")
    } else {
      const fallbackDE = ["Interessant.", "Notiert.", "Verstehe.", "Fair genug."]
      const fallbackEN = ["Interesting.", "Noted.", "I see.", "Fair enough."]
      const fallback = language === 'de' ? fallbackDE : fallbackEN
      response = fallback[Math.floor(Math.random() * fallback.length)]
    }
    
    setCaptchaResponse(response)
    
    // Track selection with Vercel Analytics
    track('captcha_selection', { 
      selections: selectedLabels.join(','),
      count: selectedCaptcha.length 
    })
    
    setTimeout(() => {
      setStatus('password')
      setShowPasswordPanel(true)
    }, 800)
  }

  if (status === 'checking') return null
  if (status === 'unlocked') return <>{children}</>

  const LangButton = () => (
    <button
      className="scramble-text"
      onClick={handleLangToggle}
      onMouseEnter={handleLangHover}
      onTouchStart={handleLangHover}
      style={{
        position: 'fixed',
        top: isMobile ? '12px' : '1.5rem',
        right: isMobile ? '16px' : '2rem',
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        fontSize: isMobile ? '11px' : '14px',
        fontWeight: '700',
        fontFamily: 'var(--font-borna), sans-serif',
        color: '#ffffff',
        letterSpacing: isMobile ? '-0.02em' : '0.05em',
        lineHeight: '1.2',
        padding: 0,
        zIndex: 10000,
        mixBlendMode: 'difference',
      }}
    >
      {langDisplayText}
    </button>
  )

  const isPasswordPhase = status === 'password' || status === 'submitting'

  return (
    <>
      <CustomCursor />
      <LangButton />
      <div
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: '#000',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '20px',
          gap: isMobile ? '0' : '20px',
        }}
      >
        {/* CAPTCHA Panel */}
        <div 
          style={{ 
            width: '100%', 
            maxWidth: isMobile ? '340px' : '380px',
            backgroundColor: '#fff',
            borderRadius: '3px',
            overflow: 'hidden',
            boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
            transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
            transform: isPasswordPhase 
              ? (isMobile ? 'scale(0.92)' : 'scale(0.95)') 
              : 'scale(1)',
            opacity: isPasswordPhase ? 0.3 : 1,
            filter: isPasswordPhase ? 'blur(3px)' : 'none',
            pointerEvents: isPasswordPhase ? 'none' : 'auto',
            position: 'absolute',
            zIndex: 1,
          }}
        >
          {/* Blue Header */}
          <div style={{
            backgroundColor: '#4285f4',
            padding: isMobile ? '14px 16px' : '16px 20px',
          }}>
            <div 
              className="scramble-text"
              style={{
                fontSize: isMobile ? '14px' : '16px',
                fontWeight: '700',
                color: '#fff',
                fontFamily: 'var(--font-borna), sans-serif',
                marginBottom: '4px',
              }}
            >
              {isPasswordPhase ? verifiedText : captchaTitle}
            </div>
            {!isPasswordPhase && (
              <div 
                className="scramble-text"
                style={{
                  fontSize: isMobile ? '11px' : '12px',
                  color: 'rgba(255,255,255,0.8)',
                  fontFamily: 'var(--font-borna), sans-serif',
                }}
              >
                {captchaSubtitle}
              </div>
            )}
          </div>

          {/* Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '2px',
            padding: '2px',
            backgroundColor: '#e0e0e0',
          }}>
            {captchaOptions.map((option) => {
              const isSelected = selectedCaptcha.includes(option.id)
              return (
                <button
                  key={option.id}
                  onClick={() => !isPasswordPhase && handleCaptchaSelect(option.id)}
                  style={{
                    aspectRatio: '1',
                    backgroundColor: '#fff',
                    border: 'none',
                    cursor: isPasswordPhase ? 'default' : 'pointer',
                    transition: 'all 0.15s ease',
                    padding: 0,
                    position: 'relative',
                    outline: isSelected ? '4px solid #4285f4' : 'none',
                    outlineOffset: '-4px',
                    overflow: 'hidden',
                  }}
                >
                  {isSelected && (
                    <div style={{
                      position: 'absolute',
                      top: '6px',
                      right: '6px',
                      width: '20px',
                      height: '20px',
                      backgroundColor: '#4285f4',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      zIndex: 2,
                    }}>
                      <span style={{ color: '#fff', fontSize: '12px', fontWeight: 'bold' }}>✓</span>
                    </div>
                  )}
                  <img
                    src={option.img}
                    alt={option.label}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      opacity: isSelected ? 0.8 : 1,
                      transition: 'opacity 0.15s',
                    }}
                  />
                </button>
              )
            })}
          </div>

          {/* Footer */}
          <div style={{
            padding: isMobile ? '10px 16px' : '14px 20px',
            backgroundColor: '#f9f9f9',
            borderTop: '1px solid #e0e0e0',
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            alignItems: isMobile ? 'stretch' : 'center',
            justifyContent: 'space-between',
            gap: isMobile ? '10px' : '0',
          }}>
            <div 
              className="scramble-text"
              style={{
                fontSize: isMobile ? '10px' : '11px',
                color: captchaResponse ? '#34a853' : '#5f6368',
                fontFamily: 'var(--font-borna), sans-serif',
                fontWeight: captchaResponse ? '600' : '500',
                textAlign: isMobile ? 'center' : 'left',
              }}
            >
              {captchaResponse || `${selectedCaptcha.length} ${selectedText}`}
            </div>
            <button
              className="scramble-text"
              onClick={handleCaptchaSubmit}
              disabled={isPasswordPhase}
              style={{
                backgroundColor: '#4285f4',
                border: 'none',
                color: '#fff',
                fontSize: isMobile ? '12px' : '13px',
                fontWeight: '600',
                fontFamily: 'var(--font-borna), sans-serif',
                padding: isMobile ? '10px 16px' : '8px 24px',
                borderRadius: '3px',
                cursor: isPasswordPhase ? 'default' : 'pointer',
                width: isMobile ? '100%' : 'auto',
                opacity: isPasswordPhase ? 0.5 : 1,
              }}
            >
              {verifyText}
            </button>
          </div>
        </div>

        {/* Password Panel - slides in from right */}
        <div 
          style={{ 
            width: '100%', 
            maxWidth: isMobile ? '300px' : '320px',
            backgroundColor: '#fff',
            borderRadius: '3px',
            overflow: 'hidden',
            boxShadow: '0 4px 30px rgba(0,0,0,0.6)',
            transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
            transform: showPasswordPanel 
              ? 'translateX(0) scale(1)' 
              : (isMobile ? 'translateY(60px) scale(0.9)' : 'translateX(80px) scale(0.9)'),
            opacity: showPasswordPanel ? 1 : 0,
            pointerEvents: showPasswordPanel ? 'auto' : 'none',
            position: 'absolute',
            zIndex: 2,
          }}
        >
          {/* Blue Header - same style as CAPTCHA */}
          <div style={{
            backgroundColor: '#4285f4',
            padding: isMobile ? '14px 16px' : '16px 20px',
            textAlign: 'center',
          }}>
            <div 
              className="scramble-text"
              style={{
                fontSize: isMobile ? '14px' : '16px',
                fontWeight: '700',
                color: '#fff',
                fontFamily: 'var(--font-borna), sans-serif',
                letterSpacing: '0.05em',
              }}
            >
              {accessText}
            </div>
          </div>

          {/* Input area */}
          <div style={{ padding: isMobile ? '20px 16px' : '24px 20px' }}>
            <input
              type="password"
              value={input}
              onChange={e => { setInput(e.target.value); setErrorMessage('') }}
              onKeyDown={handleKeyDown}
              autoFocus={showPasswordPanel}
              placeholder="••••••"
              disabled={status === 'submitting'}
              style={{
                width: '100%',
                background: '#f5f5f5',
                border: `2px solid ${errorMessage ? '#ff3333' : '#e0e0e0'}`,
                borderRadius: '3px',
                color: '#1a1a1a',
                fontSize: '18px',
                padding: '12px 14px',
                outline: 'none',
                textAlign: 'center',
                letterSpacing: '0.3em',
                transition: 'border-color 0.2s',
                fontFamily: 'var(--font-borna), monospace',
              }}
            />

            {/* Error message */}
            <div style={{
              height: '20px',
              marginTop: '8px',
              textAlign: 'center',
            }}>
              <span 
                className="scramble-text"
                style={{
                  color: '#ff3333',
                  fontSize: '11px',
                  fontWeight: '600',
                  fontFamily: 'var(--font-borna), sans-serif',
                  opacity: errorMessage ? 1 : 0,
                  transition: 'opacity 0.2s',
                }}
              >
                {errorMessage}
              </span>
            </div>

            <button
              className="scramble-text"
              onClick={handleSubmit}
              disabled={status === 'submitting'}
              style={{
                width: '100%',
                marginTop: '8px',
                backgroundColor: '#4285f4',
                border: 'none',
                color: '#fff',
                fontSize: isMobile ? '12px' : '13px',
                fontWeight: '600',
                fontFamily: 'var(--font-borna), sans-serif',
                letterSpacing: '0.05em',
                padding: isMobile ? '12px 20px' : '10px 24px',
                borderRadius: '3px',
                cursor: status === 'submitting' ? 'default' : 'pointer',
                transition: 'background-color 0.2s',
                opacity: status === 'submitting' ? 0.7 : 1,
              }}
              onMouseEnter={e => { if (status !== 'submitting') (e.target as HTMLButtonElement).style.backgroundColor = '#3367d6' }}
              onMouseLeave={e => { (e.target as HTMLButtonElement).style.backgroundColor = '#4285f4' }}
            >
              {status === 'submitting' ? checkingText : enterText}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

export default PasswordGate
