'use client'
import { createContext, useContext, useState, useRef, useCallback, ReactNode } from 'react'

type Language = 'de' | 'en'

const chars = "0123456789!@#$%&*АБВГДЕЖИКЛМНОПРСТУФХЦ"

interface LanguageContextType {
  language: Language
  toggleLanguage: () => void
  t: (de: string, en: string) => string
  scrambleText: (text: string, onUpdate: (t: string) => void, onDone: () => void) => void
}

const LanguageContext = createContext<LanguageContextType | null>(null)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('de')
  const languageRef = useRef<Language>('de')

  const scrambleText = useCallback((
    text: string,
    onUpdate: (t: string) => void,
    onDone: () => void
  ) => {
    let iteration = 0
    const revealed = new Set<number>()
    const interval = setInterval(() => {
      iteration++
      const indices = text.split('').map((_, i) => i)
      const unrevealed = indices.filter(i => !revealed.has(i))
      if (unrevealed.length > 0) {
        revealed.add(unrevealed[Math.floor(Math.random() * unrevealed.length)])
      }
      onUpdate(
        text.split('').map((char, i) =>
          revealed.has(i) || char === ' ' ? text[i] : chars[Math.floor(Math.random() * chars.length)]
        ).join('')
      )
      if (iteration >= 12) {
        clearInterval(interval)
        onDone()
      }
    }, 40)
  }, [])

  const toggleLanguage = useCallback(() => {
    const next: Language = languageRef.current === 'de' ? 'en' : 'de'
    languageRef.current = next
    setLanguage(next)
  }, [])

  const t = useCallback((de: string, en: string) => {
    return language === 'de' ? de : en
  }, [language])

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, t, scrambleText }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider')
  return ctx
}