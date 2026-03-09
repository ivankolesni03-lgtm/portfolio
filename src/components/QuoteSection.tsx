'use client'
import { useEffect, useRef, useState, useCallback } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'

const chars = "0123456789!@#$%&*АБВГДЕЖИКЛМНОПРСТУФХЦ"

const bigWords = {
  de: ['FALLEN', 'LERNEN', 'AUFSTEHEN', 'WIEDERHOLEN'],
  en: ['FALL', 'LEARN', 'RISE', 'REPEAT'],
}

function LocalBrush({ containerRef }: { containerRef: React.RefObject<HTMLDivElement | null> }) {
  const [points, setPoints] = useState<{ id: number; x: number; y: number }[]>([])
  const lastTimeRef = useRef(0)
  const idRef = useRef(0)

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const now = Date.now()
      if (now - lastTimeRef.current < 4) return
      lastTimeRef.current = now

      const rect = containerRef.current?.getBoundingClientRect()
      if (!rect) return
      if (e.clientX < rect.left || e.clientX > rect.right || e.clientY < rect.top || e.clientY > rect.bottom) return

      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      const id = idRef.current++

      setPoints(prev => [...prev, { id, x, y }])
      setTimeout(() => setPoints(prev => prev.filter(p => p.id !== id)), 2000)
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [containerRef])

  return (
    <>
      {points.map(p => (
        <div key={p.id} className="brush-trail" style={{ left: p.x, top: p.y }} />
      ))}
    </>
  )
}

function BigWord({ de, en, scrollY }: { de: string; en: string; scrollY: number }) {
  const { language } = useLanguage()
  const targetText = language === 'de' ? de : en
  const ref = useRef<HTMLDivElement>(null)
  const [scrollProgress, setScrollProgress] = useState(0)
  const [displayLetters, setDisplayLetters] = useState(targetText.split(''))
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const mountedRef = useRef(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    setIsMobile(window.innerWidth < 768)
  }, [])

  useEffect(() => {
    if (!ref.current) return
    const rect = ref.current.getBoundingClientRect()
    const windowHeight = window.innerHeight
    const elementCenter = rect.top + rect.height / 2
    const p = Math.max(0, Math.min(1, (windowHeight * 0.75 - elementCenter) / (windowHeight * 0.25) + 1))
    setScrollProgress(Math.max(0, Math.min(1, p)))
  }, [scrollY])

  const scramble = useCallback((text: string) => {
    let iteration = 0
    const revealed = new Set<number>()
    if (intervalRef.current) clearInterval(intervalRef.current)
    intervalRef.current = setInterval(() => {
      iteration++
      const unrevealed = text.split('').map((_, i) => i).filter(i => !revealed.has(i) && text[i] !== ' ')
      if (unrevealed.length > 0) revealed.add(unrevealed[Math.floor(Math.random() * unrevealed.length)])
      setDisplayLetters(text.split('').map((char, i) =>
        revealed.has(i) || char === ' ' ? text[i] : chars[Math.floor(Math.random() * chars.length)]
      ))
      if (iteration >= 14) {
        clearInterval(intervalRef.current!)
        setDisplayLetters(text.split(''))
      }
    }, 35)
  }, [])

  useEffect(() => {
    if (!mountedRef.current) { mountedRef.current = true; return }
    scramble(targetText)
  }, [language]) // eslint-disable-line

  useEffect(() => {
    if (!mountedRef.current) return
    setDisplayLetters(targetText.split(''))
  }, [targetText])

  return (
    <div
      ref={ref}
      onMouseEnter={() => scramble(targetText)}
      style={{
        fontSize: isMobile ? '11vw' : '8vw',
        fontWeight: '900',
        lineHeight: '0.92',
        letterSpacing: isMobile ? '-1px' : '-3px',
        textTransform: 'uppercase',
        color: '#ffffff',
        overflow: 'hidden',
        marginBottom: '0.05em',
        cursor: 'default',
        position: 'relative',
        zIndex: 4,
      }}
    >
      {displayLetters.map((char, i) => {
        const delay = (i / displayLetters.length) * 0.25
        const localProgress = Math.max(0, Math.min(1, (scrollProgress - delay) / (1 - delay)))
        return (
          <span
            key={i}
            style={{
              display: 'inline-block',
              transform: `translateY(${(1 - localProgress) * 80}px)`,
              opacity: localProgress,
              willChange: 'transform, opacity',
            }}
          >
            {char}
          </span>
        )
      })}
    </div>
  )
}

function YinYang({ visible, scrolledIn, sectionHeight }: {
  visible: boolean
  scrolledIn: number
  sectionHeight: number
}) {
  const [textHeight, setTextHeight] = useState(0)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    setIsMobile(window.innerWidth < 768)
    const el = document.querySelector('.quote-text-block') as HTMLElement
    if (el) setTextHeight(el.offsetHeight)
  }, [visible])

  const rotation = sectionHeight > 0 ? (scrolledIn / sectionHeight) * 360 : 0

  const size = isMobile
    ? Math.min(window.innerWidth * 0.55, 220)
    : (textHeight > 20 ? textHeight * 1.0 : 240)

  const appearProgress = Math.max(0, Math.min(1,
    (scrolledIn - (typeof window !== 'undefined' ? window.innerHeight : 800) * 0.2) /
    ((typeof window !== 'undefined' ? window.innerHeight : 800) * 0.3)
  ))

  return (
    <div style={{ opacity: appearProgress, willChange: 'opacity' }}>
      <div style={{ transform: `rotate(${rotation}deg)`, willChange: 'transform' }}>
        <img
          src="/images/jing-jang.png"
          alt=""
          style={{ width: size, height: size, display: 'block' }}
        />
      </div>
    </div>
  )
}

export function QuoteSection() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const stickyRef = useRef<HTMLDivElement>(null)
  const [scrollY, setScrollY] = useState(0)
  const [exitProgress, setExitProgress] = useState(0)
  const [midReached, setMidReached] = useState(false)
  const [scrolledIn, setScrolledIn] = useState(0)
  const [sectionHeight, setSectionHeight] = useState(0)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    setIsMobile(window.innerWidth < 768)
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      const y = window.scrollY
      setScrollY(y)

      if (!sectionRef.current) return
      const rect = sectionRef.current.getBoundingClientRect()
      const vh = window.innerHeight

      const scrolledInVal = Math.max(0, -rect.top)
      setScrolledIn(scrolledInVal)
      setSectionHeight(sectionRef.current.offsetHeight)

      setMidReached(scrolledInVal >= vh * 0.4)

      const exitStart = vh
      const exitEnd = vh * 1.8
      const ep = Math.max(0, Math.min(1, (scrolledInVal - exitStart) / (exitEnd - exitStart)))
      setExitProgress(ep)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const blur = exitProgress * 24
  const opacity = 1 - exitProgress

  const padding = isMobile ? '0 5vw' : '0 9vw'

  // Text: Mobile weiter oben (30vh vom unteren Rand)
  const textBottom = isMobile ? '30vh' : '9vw'
  const textLeft = isMobile ? '5vw' : '9vw'
  const textRight = isMobile ? '5vw' : '9vw'

  // Symbol: Mobile weiter unten (5vh vom unteren Rand)
  const yinYangBottom = isMobile ? '45vh' : 'auto'
  const yinYangTop = isMobile ? 'auto' : '7vw'
  const yinYangRight = isMobile ? '5vw' : '9vw'

  return (
    <div
      ref={sectionRef}
      style={{
        backgroundColor: '#000000',
        height: '300vh',
        position: 'relative',
        zIndex: 1,
      }}
    >
      <div
        ref={stickyRef}
        style={{
          position: 'sticky',
          top: 0,
          height: '100vh',
          padding,
          overflow: 'hidden',
        }}
      >
        <LocalBrush containerRef={stickyRef} />

        {/* Yin Yang — Mobile: unten rechts, Desktop: oben rechts */}
        <div
          style={{
            position: 'absolute',
            top: yinYangTop,
            bottom: yinYangBottom,
            right: yinYangRight,
            filter: `blur(${blur}px)`,
            opacity,
            willChange: 'filter, opacity',
            zIndex: 4,
          }}
        >
          <YinYang
            visible={midReached}
            scrolledIn={scrolledIn}
            sectionHeight={sectionHeight}
          />
        </div>

        {/* Text — Mobile: weiter oben, Desktop: unten links */}
        <div
          style={{
            position: 'absolute',
            bottom: textBottom,
            left: textLeft,
            right: textRight,
            filter: `blur(${blur}px)`,
            opacity,
            willChange: 'filter, opacity',
            zIndex: 4,
          }}
        >
          <div className="quote-text-block">
            {bigWords.de.map((_, i) => (
              <BigWord
                key={i}
                de={bigWords.de[i]}
                en={bigWords.en[i]}
                scrollY={scrollY}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}