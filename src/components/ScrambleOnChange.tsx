'use client'
import { useState, useEffect, useRef, type CSSProperties, type ElementType } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'
import { startScramble } from '@/lib/scramble'

interface ScrambleOnChangeProps {
  de: string
  en: string
  className?: string
  style?: CSSProperties
  as?: keyof React.JSX.IntrinsicElements
}

export function ScrambleOnChange({ de, en, className, style, as: Tag = 'span' }: ScrambleOnChangeProps) {
  const { language } = useLanguage()
  const targetText = language === 'de' ? de : en
  const [displayText, setDisplayText] = useState(targetText)
  const prevLang = useRef(language)
  const cleanupRef = useRef<(() => void) | null>(null)
  const Component = Tag as ElementType

  useEffect(() => {
    if (prevLang.current === language) return
    prevLang.current = language
    
    cleanupRef.current?.()
    cleanupRef.current = startScramble(targetText, setDisplayText, { maxIterations: 14 })

    return () => { cleanupRef.current?.() }
  }, [language, targetText])

  return <Component className={className} style={style}>{displayText}</Component>
}
