'use client'
import { useState, useEffect, useRef } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'

const chars = "0123456789!@#$%&*АБВГДЕЖИКЛМНОПРСТУФХЦ"

interface ScrambleOnChangeProps {
  de: string
  en: string
  className?: string
  style?: React.CSSProperties
  as?: keyof JSX.IntrinsicElements
}

export function ScrambleOnChange({ de, en, className, style, as: Tag = 'span' }: ScrambleOnChangeProps) {
  const { language } = useLanguage()
  const targetText = language === 'de' ? de : en
  const [displayText, setDisplayText] = useState(targetText)
  const prevLang = useRef(language)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    // Nur scramble wenn Sprache sich wirklich geändert hat
    if (prevLang.current === language) return
    prevLang.current = language

    let iteration = 0
    const revealed = new Set<number>()

    if (intervalRef.current) clearInterval(intervalRef.current)

    intervalRef.current = setInterval(() => {
      iteration++
      const unrevealed = targetText.split('').map((_, i) => i).filter(i => !revealed.has(i))
      if (unrevealed.length > 0) {
        revealed.add(unrevealed[Math.floor(Math.random() * unrevealed.length)])
      }
      setDisplayText(
        targetText.split('').map((char, i) =>
          revealed.has(i) || char === ' ' ? targetText[i] : chars[Math.floor(Math.random() * chars.length)]
        ).join('')
      )
      if (iteration >= 14) {
        clearInterval(intervalRef.current!)
        setDisplayText(targetText)
      }
    }, 35)

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [language, targetText])

  // @ts-ignore
  return <Tag className={className} style={style}>{displayText}</Tag>
}
