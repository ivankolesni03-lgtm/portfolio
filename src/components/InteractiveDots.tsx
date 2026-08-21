'use client'

import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'
import { useMobile } from '@/hooks/use-mobile'
import { useScroll } from '@/contexts/ScrollContext'
import { useScramble, runScramble } from '@/hooks/use-scramble'
import { ViewCursor } from '@/components/ProjectsSection'

export type Lang = 'de' | 'en'

export interface Program {
  id: number
  name: { de: string; en: string }
  icon: string
  iconImg: string
  color: string
  description: { de: string; en: string }
  skill: number
  works: { title: { de: string; en: string }; year: string; type: { de: string; en: string } }[]
}

// ─── ProgrammeHeading ───────────────────────────────────────────────────────
function ProgrammeHeading() {
  const { language } = useLanguage()
  const { isMobile } = useMobile()
  const text = language === 'de' ? 'Läuft\nbei mir' : 'My Toolkit'
  const { disp, scramble } = useScramble(text)

  return (
    <div 
      onMouseEnter={scramble}
      onTouchStart={scramble}
      style={{ 
        position: 'absolute', 
        top: isMobile ? 'var(--mobile-section-top)' : '9vw',     
        left: isMobile ? 'var(--mobile-section-x)' : '9vw',    
        zIndex: 20, 
        pointerEvents: 'auto',
        textAlign: 'left',
        maxWidth: '85vw' 
      }}
    >
      <div style={{
        fontSize: isMobile ? 'var(--mobile-heading-size)' : '8vw',           
        fontWeight: 900,           
        lineHeight: 0.95,         
        letterSpacing: '-2px',     
        textTransform: 'uppercase',
        color: '#ffffff',          
        margin: 0,
        cursor: 'default',
        userSelect: 'none',
        whiteSpace: 'pre-wrap',
      }}>
        {disp}
      </div>
    </div>
  )
}

export const defaultProgramData: Program[] = [
  { id:1,  name:{de:'Premiere Pro',en:'Premiere Pro'},       icon:'Pr', iconImg:'/icons/premiere-pro.png',           color:'#9999FF', skill:88, description:{de:'Videobearbeitung & Filmschnitt',en:'Video editing & film cutting'}, works:[{title:{de:'GWA MackingOff',en:'GWA MackingOff'},year:'2024',type:{de:'Kampagnenfilm',en:'Campaign Film'}},{title:{de:'Tennisheine',en:'Tennisheine'},year:'2024',type:{de:'Bewegtbild',en:'Motion Picture'}},{title:{de:'Lebara TikToks',en:'Lebara TikToks'},year:'2023',type:{de:'Social Media',en:'Social Media'}}]},
  { id:2,  name:{de:'Illustrator',en:'Illustrator'},         icon:'Ai', iconImg:'/icons/illustrator.png',          color:'#FF9A00', skill:80, description:{de:'Vektorgrafik & Logodesign',en:'Vector graphics & logo design'}, works:[{title:{de:'Bold. Branding',en:'Bold. Branding'},year:'2024',type:{de:'Corporate Branding',en:'Corporate Branding'}},{title:{de:'Glownation CI',en:'Glownation CI'},year:'2023',type:{de:'Corporate Identity',en:'Corporate Identity'}},{title:{de:'Hochschule Hannover',en:'Hochschule Hannover'},year:'2023',type:{de:'Kampagne',en:'Campaign'}}]},
  { id:3,  name:{de:'Photoshop',en:'Photoshop'},             icon:'Ps', iconImg:'/icons/photoshop.png',            color:'#31C5F0', skill:92, description:{de:'Bildbearbeitung & Compositing',en:'Image editing & compositing'}, works:[{title:{de:'Weros Webdynamics',en:'Weros Webdynamics'},year:'2024',type:{de:'Fotografie',en:'Photography'}},{title:{de:'HateAid Kampagne',en:'HateAid Campaign'},year:'2024',type:{de:'Awareness',en:'Awareness'}},{title:{de:'KI Compositing',en:'AI Compositing'},year:'2023',type:{de:'Digital Art',en:'Digital Art'}}]},
  { id:4,  name:{de:'After Effects',en:'After Effects'},     icon:'Ae', iconImg:'/icons/after-effects.png',            color:'#9999FF', skill:75, description:{de:'Motion Graphics & VFX',en:'Motion graphics & VFX'}, works:[{title:{de:'Bold. Motion',en:'Bold. Motion'},year:'2024',type:{de:'Motion Design',en:'Motion Design'}},{title:{de:'Intro Animations',en:'Intro Animations'},year:'2023',type:{de:'Animation',en:'Animation'}},{title:{de:'Social Media Motion',en:'Social Media Motion'},year:'2023',type:{de:'Social Media',en:'Social Media'}}]},
  { id:7,  name:{de:'InDesign',en:'InDesign'},               icon:'Id', iconImg:'/icons/indesign.png',             color:'#FF3366', skill:85, description:{de:'Layout & Print Design',en:'Layout & print design'}, works:[{title:{de:'Ganbatte Broschüre',en:'Ganbatte Brochure'},year:'2024',type:{de:'Print',en:'Print'}},{title:{de:'Continental Kampagne',en:'Continental Campaign'},year:'2024',type:{de:'Editorial',en:'Editorial'}},{title:{de:'HateAid Layouts',en:'HateAid Layouts'},year:'2023',type:{de:'NGO',en:'NGO'}}]},
  { id:9,  name:{de:'VS Code',en:'VS Code'},                 icon:'VS', iconImg:'/icons/vs-code.png',              color:'#007ACC', skill:82, description:{de:'Web Development & Next.js',en:'Web development & Next.js'}, works:[{title:{de:'Portfolio Next.js',en:'Portfolio Next.js'},year:'2024',type:{de:'Development',en:'Development'}},{title:{de:'Pocoloco Website',en:'Pocoloco Website'},year:'2024',type:{de:'Next.js',en:'Next.js'}},{title:{de:'API Entwicklung',en:'API Development'},year:'2023',type:{de:'Backend',en:'Backend'}}]},
  { id:10, name:{de:'ComfyUI',en:'ComfyUI'},                 icon:'CU', iconImg:'/icons/comfy-ui.png',             color:'#39ff14', skill:78, description:{de:'KI Bildgenerierung & Workflows',en:'AI image generation & workflows'}, works:[{title:{de:'LoRA Training',en:'LoRA Training'},year:'2024',type:{de:'KI',en:'AI'}},{title:{de:'KI Portraits',en:'AI Portraits'},year:'2024',type:{de:'Generative KI',en:'Generative AI'}},{title:{de:'N8N Automation',en:'N8N Automation'},year:'2023',type:{de:'Workflow',en:'Workflow'}}]},
  { id:12, name:{de:'Claude AI',en:'Claude AI'},             icon:'Cl', iconImg:'/icons/claude.png',               color:'#CC785C', skill:95, description:{de:'KI-Assistent & Prompt Design',en:'AI assistant & prompt design'}, works:[{title:{de:'Portfolio Entwicklung',en:'Portfolio Development'},year:'2024',type:{de:'Development',en:'Development'}},{title:{de:'Workflow Automation',en:'Workflow Automation'},year:'2024',type:{de:'KI',en:'AI'}},{title:{de:'Content Creation',en:'Content Creation'},year:'2023',type:{de:'Kreativ',en:'Creative'}}]},
  { id:13, name:{de:'Blender',en:'Blender'},                 icon:'Bl', iconImg:'/icons/blender.png',              color:'#EA7600', skill:55, description:{de:'3D Modellierung & Rendering',en:'3D modeling & rendering'}, works:[{title:{de:'3D Visualisierungen',en:'3D Visualizations'},year:'2024',type:{de:'3D',en:'3D'}},{title:{de:'Motion Renders',en:'Motion Renders'},year:'2023',type:{de:'Animation',en:'Animation'}},{title:{de:'Product Renders',en:'Product Renders'},year:'2023',type:{de:'3D',en:'3D'}}]},
  { id:14, name:{de:'CapCut',en:'CapCut'},                   icon:'CC', iconImg:'/icons/capcut.png',               color:'#ffffff', skill:85, description:{de:'Mobile Video Editing & Reels',en:'Mobile video editing & reels'}, works:[{title:{de:'Instagram Reels',en:'Instagram Reels'},year:'2024',type:{de:'Social Media',en:'Social Media'}},{title:{de:'TikTok Edits',en:'TikTok Edits'},year:'2024',type:{de:'TikTok',en:'TikTok'}},{title:{de:'Lebara Content',en:'Lebara Content'},year:'2023',type:{de:'Content',en:'Content'}}]},
  { id:15, name:{de:'FL Studio',en:'FL Studio'},             icon:'FL', iconImg:'/icons/fl-studio.png',            color:'#FF8C00', skill:50, description:{de:'Musikproduktion & Beats',en:'Music production & beats'}, works:[{title:{de:'Soundtrack GWA',en:'Soundtrack GWA'},year:'2024',type:{de:'Sound',en:'Sound'}},{title:{de:'Background Music',en:'Background Music'},year:'2023',type:{de:'Musik',en:'Music'}},{title:{de:'Sound Effects',en:'Sound Effects'},year:'2023',type:{de:'Audio',en:'Audio'}}]},
  { id:16, name:{de:'Higgsfield',en:'Higgsfield'},           icon:'HF', iconImg:'/icons/higgsfield.png',           color:'#a855f7', skill:72, description:{de:'KI Videogenerierung',en:'AI video generation'}, works:[{title:{de:'KI Videoclips',en:'AI Video Clips'},year:'2024',type:{de:'KI Video',en:'AI Video'}},{title:{de:'Motion Concepts',en:'Motion Concepts'},year:'2024',type:{de:'Konzept',en:'Concept'}},{title:{de:'Social Media KI',en:'Social Media AI'},year:'2023',type:{de:'KI',en:'AI'}}]},
  { id:17, name:{de:'PowerPoint',en:'PowerPoint'},           icon:'PP', iconImg:'/icons/powerpoint.png',           color:'#D24726', skill:88, description:{de:'Präsentationen & Pitch Decks',en:'Presentations & pitch decks'}, works:[{title:{de:'Pitch Decks',en:'Pitch Decks'},year:'2024',type:{de:'Präsentation',en:'Presentation'}},{title:{de:'Kampagnen Decks',en:'Campaign Decks'},year:'2024',type:{de:'Corporate',en:'Corporate'}},{title:{de:'Brand Präsentationen',en:'Brand Presentations'},year:'2023',type:{de:'Branding',en:'Branding'}}]},
  { id:18, name:{de:'Figma Weave',en:'Figma Weave'},         icon:'FW', iconImg:'/icons/weave.png',                 color:'#9747FF', skill:74, description:{de:'KI-gestütztes UI/UX Design mit Figma Weave',en:'AI-powered UI/UX design with Figma Weave'}, works:[{title:{de:'UI Exploration',en:'UI Exploration'},year:'2025',type:{de:'UI Design',en:'UI Design'}},{title:{de:'AI Layouts',en:'AI Layouts'},year:'2025',type:{de:'Generative UI',en:'Generative UI'}},{title:{de:'Prototyping',en:'Prototyping'},year:'2025',type:{de:'Design',en:'Design'}}]},
  { id:19, name:{de:'GitHub',en:'GitHub'},                   icon:'GH', iconImg:'/icons/github.png',                color:'#181717', skill:82, description:{de:'Versionskontrolle & Repository-Workflows',en:'Version control & repository workflows'}, works:[{title:{de:'Portfolio Next.js',en:'Portfolio Next.js'},year:'2025',type:{de:'Development',en:'Development'}},{title:{de:'Pocoloco Website',en:'Pocoloco Website'},year:'2024',type:{de:'Versioning',en:'Versioning'}},{title:{de:'Code Workflows',en:'Code Workflows'},year:'2024',type:{de:'Workflow',en:'Workflow'}}]},
]


// ── Main Component ────────────────────────────────────────────────────────────
export function InteractiveDots({
  programs = defaultProgramData,
  circleSize: defaultCircleSize = 56,
  spacing: defaultSpacing = 72,
  padding: defaultPadding = 40,
  backgroundColor = '#000000',
}: {
  programs?: Program[]
  circleSize?: number
  spacing?: number
  padding?: number
  backgroundColor?: string
}) {
  const outerRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const { isMobile } = useMobile()
  const { vh, vw } = useScroll()
  
  // More icons on mobile with tighter spacing
  const circleSize = isMobile ? 44 : defaultCircleSize
  const spacing = isMobile ? 50 : defaultSpacing
  const padding = isMobile ? 24 : defaultPadding
  const [hoveredId, setHoveredId] = useState<number | null>(null)
  const [exitP, setExitP] = useState(0)
  const [isEntering, setIsEntering] = useState(true)
  const [simulatedHover, setSimulatedHover] = useState<number | null>(null)
  const [simulatedNeighbors, setSimulatedNeighbors] = useState<Set<number>>(new Set())
  const [neighborIds, setNeighborIds] = useState<Set<number>>(new Set())
  const [openIdx, setOpenIdx] = useState<number | null>(null)
  const [openRect, setOpenRect] = useState<{ x: number; y: number; w: number; h: number } | null>(null)
  const [phase, setPhase] = useState<'in' | 'open' | 'closing'>('in')
  const [lang] = useState<Lang>('de')
  const [showHint, setShowHint] = useState(false)
  const hintShownRef = useRef(false)
  const circlesRef = useRef<{ id: number; x: number; y: number; iconIndex: number }[]>([])
  const [circleItems, setCircleItems] = useState<{ id: number; x: number; y: number; iconIndex: number }[]>([])
  const simulationRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const fakeSwipeRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const userInteractedRef = useRef(false)
  
  // Touch-specific state for swipe-reveal
  const [touchRevealedIds, setTouchRevealedIds] = useState<Set<number>>(new Set())
  const touchRevealTimersRef = useRef<Map<number, NodeJS.Timeout>>(new Map())
  const lastTouchPosRef = useRef<{ x: number; y: number } | null>(null)

  const hoveredIdRef = useRef<number | null>(null)
  const neighborIdsRef = useRef<Set<number>>(new Set())
  
  // Track previously visible circles for fade-out (CSS handles the animation)
  const [recentlyVisible, setRecentlyVisible] = useState<Set<number>>(new Set())

  useEffect(() => { hoveredIdRef.current = hoveredId }, [hoveredId])
  useEffect(() => { neighborIdsRef.current = neighborIds }, [neighborIds])
  
  // Track circles that were recently hovered/neighbors for fade-out effect
  useEffect(() => {
    const allVisible = new Set<number>()
    if (hoveredId !== null) allVisible.add(hoveredId)
    if (simulatedHover !== null) allVisible.add(simulatedHover)
    neighborIds.forEach(id => allVisible.add(id))
    simulatedNeighbors.forEach(id => allVisible.add(id))
    touchRevealedIds.forEach(id => allVisible.add(id))
    
    // Add currently visible to recently visible
    const frame = requestAnimationFrame(() => {
      setRecentlyVisible(prev => {
        const next = new Set(prev)
        allVisible.forEach(id => next.add(id))
        return next
      })
    })
    
    // Clear old entries after fade-out duration (6s)
    const timer = setTimeout(() => {
      setRecentlyVisible(prev => {
        const next = new Set<number>()
        // Only keep currently active ones
        allVisible.forEach(id => next.add(id))
        return next
      })
    }, 6000)
    
    return () => {
      cancelAnimationFrame(frame)
      clearTimeout(timer)
    }
  }, [hoveredId, simulatedHover, neighborIds, simulatedNeighbors, touchRevealedIds])

  const generateCircles = useCallback(() => {
    if (!containerRef.current) return
    const { width, height } = containerRef.current.getBoundingClientRect()
    const circles: { id: number; x: number; y: number; iconIndex: number }[] = []
    
    // Calculate how many icons fit with minimum spacing
    const cols = Math.floor((width - padding * 2) / spacing) + 1
    const rows = Math.floor((height - padding * 2) / spacing) + 1
    
    // Calculate actual spacing to distribute evenly
    const actualSpacingX = (width - padding * 2) / Math.max(1, cols - 1)
    const actualSpacingY = (height - padding * 2) / Math.max(1, rows - 1)
    
    let id = 0
    const iconGrid: number[][] = []
    for (let row = 0; row < rows; row++) {
      iconGrid[row] = []
      for (let col = 0; col < cols; col++) {
        const x = padding + col * actualSpacingX
        const y = padding + row * actualSpacingY
        const blockedIcons = new Set<number>()

        if (col > 0) blockedIcons.add(iconGrid[row][col - 1])
        if (row > 0) {
          blockedIcons.add(iconGrid[row - 1][col])
          if (col > 0) blockedIcons.add(iconGrid[row - 1][col - 1])
          if (col < cols - 1) blockedIcons.add(iconGrid[row - 1][col + 1])
        }

        const candidates = Array.from({ length: programs.length }, (_, i) => i).filter((i) => !blockedIcons.has(i))
        const pool = candidates.length > 0 ? candidates : Array.from({ length: programs.length }, (_, i) => i)
        const iconIndex = pool[Math.floor(Math.random() * pool.length)]

        iconGrid[row][col] = iconIndex
        circles.push({ id: id++, x, y, iconIndex })
      }
    }
    circlesRef.current = circles
    requestAnimationFrame(() => setCircleItems(circles))
  }, [padding, spacing, programs.length])

  useEffect(() => {
    generateCircles()
    let t: ReturnType<typeof setTimeout>
    const onResize = () => { clearTimeout(t); t = setTimeout(generateCircles, 100) }
    window.addEventListener('resize', onResize)
    return () => { window.removeEventListener('resize', onResize); clearTimeout(t) }
  }, [generateCircles])


  const interactionTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const lastMousePosRef = useRef<{ x: number; y: number } | null>(null)
  const pendingMousePosRef = useRef<{ x: number; y: number } | null>(null)
  const mouseMoveRafRef = useRef<number | null>(null)
  // Tracks the real cursor position in viewport coordinates at all times (even
  // while the Toolkit overlay is open and blocking mousemove on the section),
  // so we can immediately resolve hover state on close without waiting for
  // the user to move the mouse again.
  const globalMousePosRef = useRef<{ x: number; y: number } | null>(null)

  useEffect(() => {
    const onWindowMouseMove = (e: MouseEvent) => {
      globalMousePosRef.current = { x: e.clientX, y: e.clientY }
    }
    window.addEventListener('mousemove', onWindowMouseMove)
    return () => window.removeEventListener('mousemove', onWindowMouseMove)
  }, [])

  // Processes the latest mouse position once per animation frame. Sampling
  // points along the segment from the last processed position avoids gaps
  // in the trail when the mouse moves fast between mousemove events.
  const processMouseMove = useCallback((mouseX: number, mouseY: number) => {
    const last = lastMousePosRef.current
    lastMousePosRef.current = { x: mouseX, y: mouseY }

    const points: { x: number; y: number }[] = [{ x: mouseX, y: mouseY }]
    if (last) {
      const dx = mouseX - last.x, dy = mouseY - last.y
      const dist = Math.sqrt(dx * dx + dy * dy)
      const step = circleSize * 0.5
      const steps = Math.min(24, Math.floor(dist / step))
      for (let i = 1; i < steps; i++) {
        const t = i / steps
        points.push({ x: last.x + dx * t, y: last.y + dy * t })
      }
    }

    let closest: { id: number; dist: number } | null = null
    const newNeighbors = new Set<number>()

    for (const circle of circlesRef.current) {
      let minDist = Infinity
      for (const p of points) {
        const dx = p.x - circle.x, dy = p.y - circle.y
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist < minDist) minDist = dist
      }
      if (minDist < circleSize * 0.65 && (!closest || minDist < closest.dist)) closest = { id: circle.id, dist: minDist }
      if (minDist < spacing * 1.6) newNeighbors.add(circle.id)
    }

    const newHoveredId = closest ? closest.id : null
    if (newHoveredId !== null) newNeighbors.delete(newHoveredId)

    setHoveredId(prev => (prev === newHoveredId ? prev : newHoveredId))
    setNeighborIds(prev => {
      if (prev.size === newNeighbors.size && [...prev].every(id => newNeighbors.has(id))) return prev
      return newNeighbors
    })
  }, [circleSize, spacing])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    // Pause simulated hover when user interacts
    userInteractedRef.current = true
    setSimulatedHover(null)
    setSimulatedNeighbors(new Set())
    
    // Resume simulation after 3 seconds of no interaction
    if (interactionTimeoutRef.current) clearTimeout(interactionTimeoutRef.current)
    interactionTimeoutRef.current = setTimeout(() => {
      userInteractedRef.current = false
    }, 3000)
    
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    pendingMousePosRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top }

    // Throttle heavy hit-testing to once per animation frame so rapid
    // native mousemove events don't cause layout thrash / jank.
    if (mouseMoveRafRef.current == null) {
      mouseMoveRafRef.current = requestAnimationFrame(() => {
        mouseMoveRafRef.current = null
        const pos = pendingMousePosRef.current
        if (pos) processMouseMove(pos.x, pos.y)
      })
    }
  }, [processMouseMove])

  const handleMouseLeave = useCallback(() => {
    if (mouseMoveRafRef.current != null) {
      cancelAnimationFrame(mouseMoveRafRef.current)
      mouseMoveRafRef.current = null
    }
    lastMousePosRef.current = null
    pendingMousePosRef.current = null
    setHoveredId(null)
    setNeighborIds(new Set())
  }, [])

  // Touch handlers for swipe-reveal on mobile
  const revealCirclesNearTouch = useCallback((touchX: number, touchY: number) => {
    const REVEAL_RADIUS = spacing * (isMobile ? 2.2 : 1.8)
    const FADE_DELAY = isMobile ? 3000 : 2500 // Mobile remains visible a bit longer, but less aggressive
    
    const circlesNearTouch: number[] = []
    
    for (const circle of circlesRef.current) {
      const dx = touchX - circle.x
      const dy = touchY - circle.y
      const dist = Math.sqrt(dx * dx + dy * dy)
      
      if (dist < REVEAL_RADIUS) {
        circlesNearTouch.push(circle.id)
        
        // Clear existing timer for this circle if any
        const existingTimer = touchRevealTimersRef.current.get(circle.id)
        if (existingTimer) {
          clearTimeout(existingTimer)
        }
      }
    }
    
    if (circlesNearTouch.length > 0) {
      setTouchRevealedIds(prev => {
        const next = new Set(prev)
        circlesNearTouch.forEach(id => next.add(id))
        return next
      })
    }
    
    // Set timers for fade-out (only for circles not currently being touched)
    circlesNearTouch.forEach(id => {
      const timer = setTimeout(() => {
        setTouchRevealedIds(prev => {
          const next = new Set(prev)
          next.delete(id)
          return next
        })
        touchRevealTimersRef.current.delete(id)
      }, FADE_DELAY)
      touchRevealTimersRef.current.set(id, timer)
    })
  }, [spacing, isMobile])

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    userInteractedRef.current = true
    setSimulatedHover(null)
    setSimulatedNeighbors(new Set())
    
    // Resume simulation after 3 seconds of no interaction
    if (interactionTimeoutRef.current) clearTimeout(interactionTimeoutRef.current)
    interactionTimeoutRef.current = setTimeout(() => {
      userInteractedRef.current = false
    }, 3000)
    
    if (!containerRef.current) return
    const touch = e.touches[0]
    const rect = containerRef.current.getBoundingClientRect()
    const touchX = touch.clientX - rect.left
    const touchY = touch.clientY - rect.top
    
    lastTouchPosRef.current = { x: touchX, y: touchY }
    revealCirclesNearTouch(touchX, touchY)
  }, [revealCirclesNearTouch])

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!containerRef.current) return
    const touch = e.touches[0]
    const rect = containerRef.current.getBoundingClientRect()
    const touchX = touch.clientX - rect.left
    const touchY = touch.clientY - rect.top
    
    // Only reveal if finger moved significantly (prevents accidental reveals)
    if (lastTouchPosRef.current) {
      const dx = touchX - lastTouchPosRef.current.x
      const dy = touchY - lastTouchPosRef.current.y
      const dist = Math.sqrt(dx * dx + dy * dy)
      if (dist > 5) { // Small threshold to debounce
        revealCirclesNearTouch(touchX, touchY)
        lastTouchPosRef.current = { x: touchX, y: touchY }
      }
    } else {
      lastTouchPosRef.current = { x: touchX, y: touchY }
      revealCirclesNearTouch(touchX, touchY)
    }
  }, [revealCirclesNearTouch])

  const handleTouchEnd = useCallback(() => {
    lastTouchPosRef.current = null
    // Timers are already set in revealCirclesNearTouch, so icons will fade naturally
  }, [])

  // Cleanup touch timers on unmount
  useEffect(() => {
    return () => {
      touchRevealTimersRef.current.forEach(timer => clearTimeout(timer))
      touchRevealTimersRef.current.clear()
      if (mouseMoveRafRef.current != null) cancelAnimationFrame(mouseMoveRafRef.current)
    }
  }, [])

  const dismissHint = useCallback(() => {
    setShowHint(false)
    try { localStorage.setItem('toolkit-hint-seen', '1') } catch {}
  }, [])

  const openOverlay = useCallback((idx: number, rect?: DOMRect) => {
    if (rect) setOpenRect({ x: rect.left, y: rect.top, w: rect.width, h: rect.height })
    dismissHint()
    setOpenIdx(idx)
    document.body.style.overflow = 'hidden'
    document.body.classList.add('toolkit-overlay-open')
    requestAnimationFrame(() => requestAnimationFrame(() => setPhase('open')))
  }, [dismissHint])

  // Immediately re-derives hover/neighbor state from the real (tracked) cursor
  // position, without needing a fresh mousemove event over the section. Used
  // when the overlay closes so the small icons near the cursor reappear right
  // away instead of the section looking empty/black until the mouse moves.
  const resyncHoverFromCursor = useCallback(() => {
    const container = containerRef.current
    const pos = globalMousePosRef.current
    if (!container || !pos) return
    const rect = container.getBoundingClientRect()
    const x = pos.x - rect.left
    const y = pos.y - rect.top
    if (x < 0 || y < 0 || x > rect.width || y > rect.height) return
    lastMousePosRef.current = null
    processMouseMove(x, y)
  }, [processMouseMove])

  const closeOverlay = useCallback(() => {
    if (phase === 'closing') return
    setPhase('closing')
    resyncHoverFromCursor()
    setTimeout(() => { 
      setOpenIdx(null)
      setPhase('in')
      document.body.style.overflow = ''
      document.body.classList.remove('toolkit-overlay-open')
      resyncHoverFromCursor()
    }, 520)
  }, [phase, resyncHoverFromCursor])

  useEffect(() => {
    return () => {
      document.body.classList.remove('toolkit-overlay-open')
    }
  }, [])

  const navigate = useCallback((dir: 'l' | 'r') => {
    if (phase !== 'open') return
    setOpenIdx(prev => { const n = programs.length; return dir === 'r' ? ((prev ?? 0) + 1) % n : ((prev ?? 0) - 1 + n) % n })
  }, [phase, programs.length])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeOverlay()
      if (e.key === 'ArrowRight') navigate('r')
      if (e.key === 'ArrowLeft') navigate('l')
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [closeOverlay, navigate])

  const { scrollY, vh: scrollVh } = useScroll()

  // Exit blur/opacity effect when next section scrolls over
  // Also track if section is entering (not yet sticky)
  useEffect(() => {
    const el = outerRef.current; if (!el) return
    const rect = el.getBoundingClientRect()
    const scrolled = Math.max(0, -rect.top)
    setExitP(Math.max(0, Math.min(1, (scrolled - scrollVh * 0.3) / (scrollVh * 1.5))))
    
    // Section is "entering" when top is between 0 and vh (scrolling into view)
    const entering = rect.top > 0 && rect.top < scrollVh
    setIsEntering(entering)

    // One-time onboarding hint: nudge visitors that icons are clickable
    if (entering && !hintShownRef.current && typeof window !== 'undefined' && !localStorage.getItem('toolkit-hint-seen')) {
      hintShownRef.current = true
      setTimeout(() => setShowHint(true), 700)
    }
    
    // Only stop simulation if user has actively interacted
    if (userInteractedRef.current) {
      setSimulatedHover(null)
      setSimulatedNeighbors(new Set())
    }
  }, [scrollY, scrollVh])

  // Simulated hover effects - continuous natural cursor movement
  useEffect(() => {
    // Only stop if user is actively interacting
    if (userInteractedRef.current || circlesRef.current.length === 0) {
      if (simulationRef.current) {
        clearTimeout(simulationRef.current)
        simulationRef.current = null
      }
      return
    }

    let currentCircleId: number | null = null
    let isActive = true
    let direction = { x: 1, y: 0.5 } // Movement direction for smooth paths

    const findNearbyCircle = (fromId: number | null) => {
      const circles = circlesRef.current
      if (circles.length === 0) return null
      
      if (fromId === null) {
        // Start with a circle in the visible area (center-ish)
        const centerX = vw / 2
        const centerY = vh / 2
        const sorted = [...circles].sort((a, b) => {
          const distA = Math.sqrt((a.x - centerX) ** 2 + (a.y - centerY) ** 2)
          const distB = Math.sqrt((b.x - centerX) ** 2 + (b.y - centerY) ** 2)
          return distA - distB
        })
        return sorted[Math.floor(Math.random() * Math.min(5, sorted.length))]
      }
      
      const current = circles.find(c => c.id === fromId)
      if (!current) return circles[Math.floor(Math.random() * circles.length)]
      
      // Find nearby circles and prefer ones in the current direction
      const nearby = circles.filter(c => {
        if (c.id === fromId) return false
        const dx = c.x - current.x
        const dy = c.y - current.y
        const dist = Math.sqrt(dx * dx + dy * dy)
        return dist < spacing * 3
      })
      
      if (nearby.length === 0) {
        // Change direction when hitting edge
        direction.x = -direction.x + (Math.random() - 0.5) * 0.5
        direction.y = -direction.y + (Math.random() - 0.5) * 0.5
        return circles[Math.floor(Math.random() * circles.length)]
      }
      
      // Score circles based on direction alignment
      const scored = nearby.map(c => {
        const dx = c.x - current.x
        const dy = c.y - current.y
        const dist = Math.sqrt(dx * dx + dy * dy)
        const dirScore = (dx * direction.x + dy * direction.y) / dist
        return { circle: c, score: dirScore + Math.random() * 0.5 }
      })
      
      scored.sort((a, b) => b.score - a.score)
      const chosen = scored[Math.floor(Math.random() * Math.min(3, scored.length))]
      
      // Slightly adjust direction towards chosen circle
      if (chosen && current) {
        const dx = chosen.circle.x - current.x
        const dy = chosen.circle.y - current.y
        const dist = Math.sqrt(dx * dx + dy * dy)
        direction.x = direction.x * 0.7 + (dx / dist) * 0.3
        direction.y = direction.y * 0.7 + (dy / dist) * 0.3
      }
      
      return chosen?.circle || nearby[0]
    }

    const simulate = () => {
      if (!isActive || userInteractedRef.current) return
      
      const circles = circlesRef.current
      if (circles.length === 0) return
      
      const nextCircle = findNearbyCircle(currentCircleId)
      if (!nextCircle) return
      
      currentCircleId = nextCircle.id
      setSimulatedHover(nextCircle.id)
      
      // Find neighbors with larger radius for more visible effect
      const neighbors = new Set<number>()
      circles.forEach(c => {
        if (c.id === nextCircle.id) return
        const dx = c.x - nextCircle.x
        const dy = c.y - nextCircle.y
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist < spacing * (isMobile ? 2.2 : 2)) neighbors.add(c.id)
      })
      setSimulatedNeighbors(neighbors)
      
      // Slightly faster movement on mobile, but still controlled
      const delay = isMobile ? 150 + Math.random() * 220 : 200 + Math.random() * 200
      simulationRef.current = setTimeout(simulate, delay)
    }

    // Start simulation quickly
    simulationRef.current = setTimeout(simulate, 100)

    return () => {
      isActive = false
      if (simulationRef.current) {
        clearTimeout(simulationRef.current)
        simulationRef.current = null
      }
    }
  }, [spacing, isMobile, vw, vh])

  // Mobile-only fake swipe sweeps: reveal broad trails to make many icons glow at once.
  useEffect(() => {
    if (!isMobile || circlesRef.current.length === 0 || userInteractedRef.current) {
      if (fakeSwipeRef.current) {
        clearTimeout(fakeSwipeRef.current)
        fakeSwipeRef.current = null
      }
      return
    }

    let active = true

    const runFakeSwipe = () => {
      if (!active || userInteractedRef.current) return
      const circles = circlesRef.current
      if (circles.length === 0) return

      const fromLeft = Math.random() > 0.5
      const yBase = padding + Math.random() * Math.max(1, vh - padding * 2)
      const steps = 8
      const swipeIds = new Set<number>()

      for (let i = 0; i < steps; i++) {
        const t = i / (steps - 1)
        const x = fromLeft ? (padding + t * (vw - padding * 2)) : (vw - padding - t * (vw - padding * 2))
        const y = yBase + Math.sin(t * Math.PI * 2) * (spacing * 0.5)

        circles.forEach((circle) => {
          const dx = circle.x - x
          const dy = circle.y - y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < spacing * 1.5) swipeIds.add(circle.id)
        })
      }

      if (swipeIds.size > 0) {
        setTouchRevealedIds(prev => {
          const next = new Set(prev)
          swipeIds.forEach(id => next.add(id))
          return next
        })

        const idsToClear = Array.from(swipeIds)
        setTimeout(() => {
          setTouchRevealedIds(prev => {
            const next = new Set(prev)
            idsToClear.forEach(id => next.delete(id))
            return next
          })
        }, 2200)
      }

      fakeSwipeRef.current = setTimeout(runFakeSwipe, 900)
    }

    fakeSwipeRef.current = setTimeout(runFakeSwipe, 350)

    return () => {
      active = false
      if (fakeSwipeRef.current) {
        clearTimeout(fakeSwipeRef.current)
        fakeSwipeRef.current = null
      }
    }
  }, [isMobile, vw, vh, spacing, padding, scrollY])

  const renderedCircles = useMemo(() => {
    return circleItems.map((circle) => {
      const program = programs[circle.iconIndex]
      const isHovered = circle.id === hoveredId || circle.id === simulatedHover
      const isNeighbor = neighborIds.has(circle.id) || simulatedNeighbors.has(circle.id)
      const isTouchRevealed = touchRevealedIds.has(circle.id)
      const wasRecentlyVisible = recentlyVisible.has(circle.id)

      // Determine state: hovered > neighbor > fading > hidden
      let opacity: number
      let scale: number
      let transition: string

      if (isTouchRevealed) {
        opacity = 1
        scale = 1.15
        transition = 'transform 0.15s ease, opacity 0.15s ease'
      } else if (isHovered) {
        opacity = 1
        scale = 1.22
        transition = 'transform 0.15s ease, opacity 0.15s ease'
      } else if (isNeighbor) {
        opacity = isMobile ? 0.62 : 0.5
        scale = 1.0
        transition = 'transform 0.2s ease, opacity 0.2s ease'
      } else if (wasRecentlyVisible) {
        // Was visible, now fading out - CSS handles the 6s fade
        opacity = isMobile ? 0.08 : 0
        scale = 1.0
        transition = isMobile ? 'transform 0.3s ease, opacity 6.5s ease-out' : 'transform 0.3s ease, opacity 6s ease-out'
      } else {
        // Never been visible or fully faded - render placeholder
        return <div key={circle.id} style={{ position:'absolute', left: circle.x - circleSize/2, top: circle.y - circleSize/2, width: circleSize, height: circleSize }} />
      }

      return (
        <button key={circle.id} onClick={(e) => openOverlay(circle.iconIndex, e.currentTarget.getBoundingClientRect())}
          style={{ position:'absolute', left: circle.x - circleSize/2, top: circle.y - circleSize/2, width: circleSize, height: circleSize, cursor:'pointer', zIndex: isHovered || isTouchRevealed ? 12 : 10, border:'none', background:'none', padding:0, display:'flex', alignItems:'center', justifyContent:'center' }}>
          <div className={isHovered ? 'toolkit-icon-halo' : undefined} style={{ width: circleSize, height: circleSize, borderRadius:'18%', overflow:'hidden', opacity, transition, transform:`scale(${scale})`, transformOrigin:'center' }}>
            <img src={program.iconImg} alt={program.name[lang]}
              style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }}
              onError={(e) => {
                const el = e.currentTarget.parentElement!
                e.currentTarget.style.display = 'none'
                el.style.background = program.color
                el.style.display = 'flex'
                el.style.alignItems = 'center'
                el.style.justifyContent = 'center'
                el.innerHTML = `<span style="color:#000;font-weight:900;font-size:14px">${program.icon}</span>`
              }}
            />
          </div>
        </button>
      )
    })
  }, [circleItems, hoveredId, neighborIds, simulatedHover, simulatedNeighbors, touchRevealedIds, recentlyVisible, circleSize, openOverlay, programs, lang, isMobile])

  const selectedProgram = openIdx !== null ? programs[openIdx] : null

  return (
    <>
      <style>{`
        @keyframes toolkitHintIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes toolkitHintPulse { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.4; transform: scale(1.6); } }
        @keyframes toolkitHalo { 0% { box-shadow: 0 0 0 0 rgba(255,255,255,0.45); } 100% { box-shadow: 0 0 0 16px rgba(255,255,255,0); } }
        .toolkit-icon-halo { animation: toolkitHalo 0.9s ease-out; }
      `}</style>
      <div ref={outerRef} data-textcolor="white" style={{ position: 'relative', zIndex: 60, height: '300vh', marginTop: isMobile ? 'calc(-1 * var(--mobile-flow-overlap-section))' : '-10vh' }}>
        <section 
          ref={containerRef} 
          onMouseMove={handleMouseMove} 
          onMouseLeave={handleMouseLeave}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onTouchCancel={handleTouchEnd}
          style={{ position: 'sticky', top: 0, width: '100%', height: 'var(--app-visual-height, 100svh)', overflow: 'hidden', userSelect: 'none', cursor: 'default', backgroundColor, touchAction: 'pan-y' }}
        >
          <div style={{
            position: 'absolute',
            inset: 0,
            filter: exitP > 0.05 ? `blur(calc(${exitP} * var(--mobile-exit-blur)))` : 'none',
            opacity: 1 - exitP * 0.9,
            transform: `scale(${1 - exitP * 0.04})`,
            transformOrigin: 'center top',
            willChange: 'filter, opacity, transform',
          }}>
            <ProgrammeHeading />
            {renderedCircles}
            {showHint && (
              <div
                onClick={dismissHint}
                style={{
                  position: 'absolute',
                  top: isMobile ? 'calc(var(--mobile-section-top) + 76px)' : 'calc(9vw + 92px)',
                  left: isMobile ? 'var(--mobile-section-x)' : '9vw',
                  zIndex: 21,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '8px 14px',
                  borderRadius: 999,
                  background: 'rgba(255,255,255,0.08)',
                  border: '1px solid rgba(255,255,255,0.25)',
                  backdropFilter: 'blur(6px)',
                  WebkitBackdropFilter: 'blur(6px)',
                  color: '#fff',
                  fontSize: 12,
                  fontWeight: 600,
                  letterSpacing: '0.02em',
                  cursor: 'pointer',
                  animation: 'toolkitHintIn 0.5s cubic-bezier(0.16,1,0.3,1) both',
                }}
              >
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#fff', animation: 'toolkitHintPulse 1.6s ease-in-out infinite', flexShrink: 0 }} />
                {lang === 'de' ? 'Icons antippen für Details' : 'Tap icons for details'}
              </div>
            )}
          </div>
        </section>
      </div>

      {selectedProgram && (
        <Overlay program={selectedProgram} idx={openIdx!} totalPrograms={programs.length} phase={phase} onClose={closeOverlay} onNavigate={navigate} lang={lang} originRect={openRect} isMobile={isMobile} />
      )}
    </>
  )
}

// ── Magnetic edge arrow (adapted for fullscreen Toolkit overlay nav) ────────
function MagnetArrow({ side, mob, onClick, label, visible }: {
  side: 'left' | 'right'; mob: boolean; onClick: () => void; label: string; visible: boolean
}) {
  const btnRef = useRef<HTMLButtonElement>(null)
  const svgRef = useRef<HTMLSpanElement>(null)
  const animRef = useRef<number>(0)
  const stateRef = useRef({ hovering: false, cx: 0, cy: 0, tx: 0, ty: 0, ax: 0, ay: 0, scale: 1, targetScale: 1 })

  useEffect(() => {
    const btn = btnRef.current
    const svg = svgRef.current
    if (!btn || !svg) return

    const MAGNET_RADIUS = 12
    const PULL = 0.85
    const LERP_HOVER = 0.35
    const LERP_LEAVE = 0.22
    const SCALE_HOVER = 1.5
    const SCALE_LERP = 0.25

    let mouseX = 0, mouseY = 0

    const onMove = (e: MouseEvent) => { mouseX = e.clientX; mouseY = e.clientY }
    window.addEventListener('mousemove', onMove)

    const onEnter = () => {
      const s = stateRef.current
      s.hovering = true
      s.targetScale = SCALE_HOVER
      const r = btn.getBoundingClientRect()
      s.cx = r.left + r.width / 2
      s.cy = r.top + r.height / 2
      document.body.classList.add('hide-x-cursor')
    }

    const onBtnMove = () => {
      const s = stateRef.current
      const r = btn.getBoundingClientRect()
      s.cx = r.left + r.width / 2
      s.cy = r.top + r.height / 2
      let dx = (mouseX - s.cx) * PULL
      let dy = (mouseY - s.cy) * PULL
      const dist = Math.hypot(dx, dy)
      if (dist > MAGNET_RADIUS) {
        dx = (dx / dist) * MAGNET_RADIUS
        dy = (dy / dist) * MAGNET_RADIUS
      }
      s.tx = dx; s.ty = dy
    }

    const onLeave = () => {
      const s = stateRef.current
      s.hovering = false
      s.targetScale = 1
      s.tx = 0; s.ty = 0
      document.body.classList.remove('hide-x-cursor')
    }

    btn.addEventListener('mouseenter', onEnter)
    btn.addEventListener('mousemove', onBtnMove)
    btn.addEventListener('mouseleave', onLeave)

    const animate = () => {
      const s = stateRef.current
      const lerp = s.hovering ? LERP_HOVER : LERP_LEAVE
      s.ax += (s.tx - s.ax) * lerp
      s.ay += (s.ty - s.ay) * lerp
      s.scale += (s.targetScale - s.scale) * SCALE_LERP
      svg.style.transform = `translate(${s.ax.toFixed(2)}px, ${s.ay.toFixed(2)}px) scale(${s.scale.toFixed(3)})`
      animRef.current = requestAnimationFrame(animate)
    }
    animRef.current = requestAnimationFrame(animate)

    return () => {
      window.removeEventListener('mousemove', onMove)
      btn.removeEventListener('mouseenter', onEnter)
      btn.removeEventListener('mousemove', onBtnMove)
      btn.removeEventListener('mouseleave', onLeave)
      cancelAnimationFrame(animRef.current)
      document.body.classList.remove('hide-x-cursor')
    }
  }, [])

  return (
    <button
      ref={btnRef}
      aria-label={label}
      onPointerDown={(e) => e.stopPropagation()}
      onClick={(e) => { e.stopPropagation(); onClick() }}
      style={{
        position: 'fixed',
        top: '50%',
        [side]: mob ? 10 : 24,
        width: mob ? 58 : 86,
        height: mob ? 96 : 132,
        transform: 'translateY(-50%)',
        border: 'none',
        background: 'transparent',
        color: '#ffffff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        pointerEvents: visible ? 'auto' : 'none',
        zIndex: 1000005,
        opacity: visible ? 1 : 0,
        transition: 'opacity 240ms ease',
      }}
    >
      <span ref={svgRef} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', willChange: 'transform' }}>
        <svg width={mob ? 34 : 52} height={mob ? 54 : 82} viewBox="0 0 42 42" fill="none">
          {side === 'left'
            ? <polyline points="29,7 13,21 29,35" stroke="currentColor" strokeWidth="7" strokeLinecap="square" strokeLinejoin="miter"/>
            : <polyline points="13,7 29,21 13,35" stroke="currentColor" strokeWidth="7" strokeLinecap="square" strokeLinejoin="miter"/>
          }
        </svg>
      </span>
    </button>
  )
}

// ── Overlay background gradient variants (cycled per program id for variety) ──
const GRADIENT_VARIANTS = [
  {
    bg: (c: string) => `radial-gradient(circle at 12% 8%, ${c}70 0%, transparent 42%), radial-gradient(circle at 88% 92%, ${c}42 0%, transparent 50%), linear-gradient(150deg, #0a0a0a 0%, #141414 32%, ${c} 145%)`,
    blob1: { width: '62vw', height: '62vw', left: '-14%', top: '-18%', anim: 'toolkitBgDrift1', dur: '17s' },
    blob2: { width: '50vw', height: '50vw', right: '-10%', bottom: '-16%', anim: 'toolkitBgDrift2', dur: '23s' },
  },
  {
    bg: (c: string) => `radial-gradient(circle at 90% 10%, ${c}75 0%, transparent 45%), radial-gradient(circle at 8% 85%, ${c}40 0%, transparent 52%), linear-gradient(60deg, #0a0a0a 0%, #141414 30%, ${c} 150%)`,
    blob1: { width: '55vw', height: '55vw', right: '-16%', top: '-14%', anim: 'toolkitBgDrift3', dur: '20s' },
    blob2: { width: '46vw', height: '46vw', left: '-10%', bottom: '-18%', anim: 'toolkitBgDrift4', dur: '25s' },
  },
  {
    bg: (c: string) => `radial-gradient(circle at 50% 12%, ${c}65 0%, transparent 48%), radial-gradient(circle at 20% 92%, ${c}48 0%, transparent 55%), linear-gradient(205deg, #0a0a0a 0%, #161616 35%, ${c} 140%)`,
    blob1: { width: '58vw', height: '58vw', left: '20%', top: '-22%', anim: 'toolkitBgDrift1', dur: '22s' },
    blob2: { width: '50vw', height: '50vw', right: '4%', bottom: '-22%', anim: 'toolkitBgDrift4', dur: '16s' },
  },
  {
    bg: (c: string) => `radial-gradient(circle at 15% 92%, ${c}70 0%, transparent 46%), radial-gradient(circle at 85% 12%, ${c}45 0%, transparent 50%), linear-gradient(115deg, #0a0a0a 0%, #131313 30%, ${c} 148%)`,
    blob1: { width: '64vw', height: '64vw', left: '-18%', bottom: '-16%', anim: 'toolkitBgDrift3', dur: '19s' },
    blob2: { width: '44vw', height: '44vw', right: '-8%', top: '-10%', anim: 'toolkitBgDrift2', dur: '26s' },
  },
]

// ── Overlay ───────────────────────────────────────────────────────────────────
function Overlay({ program, idx, totalPrograms, phase, onClose, onNavigate, lang, originRect, isMobile }: {
  program: Program; idx: number; totalPrograms: number
  phase: 'in' | 'open' | 'closing'; onClose: () => void
  onNavigate: (dir: 'l' | 'r') => void; lang: Lang
  originRect: { x: number; y: number; w: number; h: number } | null
  isMobile: boolean
}) {
  const [titleDisp, setTitleDisp] = useState(program.name[lang])
  const [descDisp, setDescDisp] = useState(program.description[lang])
  const [skillWidth, setSkillWidth] = useState(0)
  const titleRef = useRef<(() => void) | null>(null)
  const descRef = useRef<(() => void) | null>(null)
  const isOpen = phase === 'open'
  const isOpening = phase === 'in'
  const isClosing = phase === 'closing'
  const { vw, vh, isShort } = useScroll()
  const variant = GRADIENT_VARIANTS[program.id % GRADIENT_VARIANTS.length]

  useEffect(() => {
    runScramble(program.name[lang], setTitleDisp, titleRef)
    const t = setTimeout(() => runScramble(program.description[lang], setDescDisp, descRef), 60)
    return () => {
      clearTimeout(t)
      titleRef.current?.()
      descRef.current?.()
    }
  }, [lang, program])

  useEffect(() => {
    if (!isOpen) {
      const frame = requestAnimationFrame(() => setSkillWidth(0))
      return () => cancelAnimationFrame(frame)
    }
    const t = setTimeout(() => setSkillWidth(program.skill), 120)
    return () => clearTimeout(t)
  }, [isOpen, program.skill])

  const originTransform = originRect
    ? `translate(${originRect.x + originRect.w / 2 - vw / 2}px, ${originRect.y + originRect.h / 2 - vh / 2}px) scale(${originRect.w / vw}, ${originRect.h / vh})`
    : 'scale(0.1)'

  return (
    <>
      <style>{`
        body.toolkit-overlay-open .mobile-nav-blur {
          opacity: 0 !important;
          pointer-events: none !important;
        }
        @keyframes toolkitContentIn { from { opacity: 0; transform: translateY(18px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes toolkitColorIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes toolkitBgDrift1 { 0% { transform: translate(0,0) scale(1) rotate(0deg); } 33% { transform: translate(10vw, 13vh) scale(1.32) rotate(14deg); } 66% { transform: translate(-8vw, 9vh) scale(0.8) rotate(-11deg); } 100% { transform: translate(0,0) scale(1) rotate(0deg); } }
        @keyframes toolkitBgDrift2 { 0% { transform: translate(0,0) scale(1) rotate(0deg); } 33% { transform: translate(-11vw, -9vh) scale(1.25) rotate(-16deg); } 66% { transform: translate(9vw, -13vh) scale(0.78) rotate(12deg); } 100% { transform: translate(0,0) scale(1) rotate(0deg); } }
        @keyframes toolkitBgDrift3 { 0% { transform: translate(0,0) scale(1) rotate(0deg); } 40% { transform: translate(-13vw, 11vh) scale(1.35) rotate(-15deg); } 70% { transform: translate(9vw, -8vh) scale(0.76) rotate(9deg); } 100% { transform: translate(0,0) scale(1) rotate(0deg); } }
        @keyframes toolkitBgDrift4 { 0% { transform: translate(0,0) scale(1) rotate(0deg); } 40% { transform: translate(13vw, 12vh) scale(0.75) rotate(16deg); } 70% { transform: translate(-9vw, -10vh) scale(1.3) rotate(-12deg); } 100% { transform: translate(0,0) scale(1) rotate(0deg); } }
      `}</style>
      <div
        onClick={onClose}
        data-textcolor="white"
        style={{
          position: 'fixed', inset: 0, zIndex: 1000003,
          backgroundColor: '#0a0a0a',
          transform: isOpening ? originTransform : isClosing ? 'scale(0.94)' : 'scale(1)',
          opacity: isClosing ? 0 : 1,
          transition: isOpening
            ? 'transform 640ms cubic-bezier(0.16,1,0.3,1), opacity 300ms ease'
            : 'transform 420ms cubic-bezier(0.16,1,0.3,1), opacity 0.32s ease',
          transformOrigin: 'center center',
          cursor: 'none',
          overflow: 'hidden',
        }}
      >
        <div key={`bg-${program.id}`} style={{
          position: 'absolute', inset: 0,
          background: variant.bg(program.color),
          animation: 'toolkitColorIn 0.45s ease both',
        }} />
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
          <div style={{
            position: 'absolute', width: variant.blob1.width, height: variant.blob1.height,
            left: variant.blob1.left, top: variant.blob1.top, right: variant.blob1.right, bottom: variant.blob1.bottom,
            background: `radial-gradient(circle, ${program.color}70 0%, transparent 70%)`,
            filter: 'blur(55px)', mixBlendMode: 'screen',
            animation: `${variant.blob1.anim} ${variant.blob1.dur} ease-in-out infinite`,
          }} />
          <div style={{
            position: 'absolute', width: variant.blob2.width, height: variant.blob2.height,
            left: variant.blob2.left, top: variant.blob2.top, right: variant.blob2.right, bottom: variant.blob2.bottom,
            background: `radial-gradient(circle, ${program.color}60 0%, transparent 70%)`,
            filter: 'blur(65px)', mixBlendMode: 'screen',
            animation: `${variant.blob2.anim} ${variant.blob2.dur} ease-in-out infinite`,
          }} />
        </div>
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.2) 45%, transparent 78%)',
          pointerEvents: 'none',
        }} />

        <div key={`icon-${program.id}`} style={{
          position: 'absolute',
          top: isMobile ? (isShort ? 'calc(var(--mobile-overlay-side) + 1vw)' : 'calc(var(--mobile-overlay-side) + 7vw)') : '13vw',
          right: isMobile ? (isShort ? 'calc(var(--mobile-overlay-side) + 3vw)' : 'calc(var(--mobile-overlay-side) + 9vw)') : '19vw',
          zIndex: 2,
          width: isMobile ? (isShort ? 'clamp(90px,20vh,140px)' : 'clamp(190px,50vw,260px)') : 'clamp(300px,24vw,440px)',
          height: isMobile ? (isShort ? 'clamp(90px,20vh,140px)' : 'clamp(190px,50vw,260px)') : 'clamp(300px,24vw,440px)',
          borderRadius: '22%',
          overflow: 'hidden',
          opacity: isOpen ? 1 : 0,
          transform: isOpen ? 'scale(1)' : 'scale(0.85)',
          transition: 'opacity 0.5s ease, transform 0.5s cubic-bezier(0.16,1,0.3,1)',
          boxShadow: `0 24px 70px ${program.color}55`,
        }}>
          <img src={program.iconImg} alt={program.name[lang]} style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }} />
        </div>

        <div key={`content-${program.id}`} onClick={e => e.stopPropagation()} style={{
          position: 'absolute',
          left: isMobile ? 'var(--mobile-overlay-side)' : '8vw',
          right: isMobile ? 'var(--mobile-overlay-side)' : '30vw',
          bottom: isMobile ? 'var(--mobile-overlay-bottom)' : '11vh',
          zIndex: 2,
          opacity: isOpen ? 1 : 0,
          transition: 'opacity 0.4s ease',
          animation: isOpen ? 'toolkitContentIn 0.55s cubic-bezier(0.16,1,0.3,1) both' : 'none',
        }}>
          <h2 style={{ fontSize: isMobile?'var(--mobile-overlay-title-size)':'clamp(40px,6vw,96px)', fontWeight:900, lineHeight:0.9, letterSpacing:'-2px', textTransform:'uppercase', color:'#fff', margin:0, textShadow:'0 12px 36px rgba(0,0,0,0.45)', cursor:'default' }}
            onMouseEnter={() => runScramble(program.name[lang], setTitleDisp, titleRef)}>
            {titleDisp}
          </h2>
          <div style={{ display:'inline-block', marginTop: isMobile?'0.5em':'0.4em', fontSize: isMobile?'var(--mobile-overlay-subtitle-size)':'clamp(16px,1.8vw,26px)', fontWeight:700, fontStyle:'italic', letterSpacing:'-0.4px', color:'rgba(255,255,255,0.92)', textShadow:'0 10px 24px rgba(0,0,0,0.4)' }}>
            {descDisp}
          </div>

          <div style={{ marginTop: isMobile?'1.15em':'1em', maxWidth: isMobile?'100%':320 }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:6 }}>
              <span style={{ fontSize:11, fontWeight:700, letterSpacing:'0.14em', textTransform:'uppercase', color:'rgba(255,255,255,0.7)' }}>{lang==='de' ? 'Skill Level' : 'Skill Level'}</span>
              <span style={{ fontSize:13, fontWeight:900, color:'#fff' }}>{skillWidth}%</span>
            </div>
            <div style={{ height:4, background:'rgba(255,255,255,0.25)', borderRadius:2, overflow:'hidden' }}>
              <div style={{ height:'100%', background:'#fff', borderRadius:2, width:`${skillWidth}%`, transition:'width 1.1s cubic-bezier(0.16,1,0.3,1)' }} />
            </div>
          </div>

          <div style={{ marginTop: isMobile?'1.1em':'1.1em', display:'flex', flexWrap:'wrap', gap:8 }}>
            {program.works.map((work, i) => (
              <span key={i} style={{ border:'1px solid rgba(255,255,255,0.4)', color:'#fff', fontSize: isMobile?11:12, fontWeight:700, letterSpacing:'0.06em', textTransform:'uppercase', padding:'6px 12px', borderRadius:999 }}>
                {work.title[lang]}
              </span>
            ))}
          </div>
        </div>
      </div>

      <MagnetArrow side="left" mob={isMobile} onClick={() => onNavigate('l')} label="previous" visible={isOpen} />
      <MagnetArrow side="right" mob={isMobile} onClick={() => onNavigate('r')} label="next" visible={isOpen} />
      <ViewCursor show={isOpen} mode="close" />
    </>
  )
}