'use client'

import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import Image from 'next/image'
import { useLanguage } from '@/contexts/LanguageContext'
import { useMobile } from '@/hooks/use-mobile'
import { useScroll } from '@/contexts/ScrollContext'
import { useScramble, runScramble } from '@/hooks/use-scramble'

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
        top: isMobile ? '20vw' : '9vw',     
        left: isMobile ? '5vw' : '9vw',    
        zIndex: 20, 
        pointerEvents: 'auto',
        textAlign: 'left',
        maxWidth: '85vw' 
      }}
    >
      <div style={{
        fontSize: isMobile ? '10vw' : '8vw',           
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
  { id:5,  name:{de:'Lightroom',en:'Lightroom'},             icon:'Lr', iconImg:'/icons/photoshop-lightroom.png',  color:'#31C5F0', skill:90, description:{de:'Fotobearbeitung & Farbgrading',en:'Photo editing & color grading'}, works:[{title:{de:'Thailand Reise',en:'Thailand Journey'},year:'2024',type:{de:'Fotografie',en:'Photography'}},{title:{de:'Tennisheine Fotos',en:'Tennisheine Photos'},year:'2024',type:{de:'Sport',en:'Sport'}},{title:{de:'Portrait Retusche',en:'Portrait Retouching'},year:'2023',type:{de:'Fotografie',en:'Photography'}}]},
  { id:6,  name:{de:'Adobe XD',en:'Adobe XD'},               icon:'Xd', iconImg:'/icons/xd.png',                  color:'#FF61F6', skill:70, description:{de:'UI/UX Design & Prototyping',en:'UI/UX design & prototyping'}, works:[{title:{de:'Cavallo UX',en:'Cavallo UX'},year:'2024',type:{de:'Web Design',en:'Web Design'}},{title:{de:'Pocoloco Website',en:'Pocoloco Website'},year:'2024',type:{de:'Prototyping',en:'Prototyping'}},{title:{de:'Dashboard Mockup',en:'Dashboard Mockup'},year:'2023',type:{de:'UI Design',en:'UI Design'}}]},
  { id:7,  name:{de:'InDesign',en:'InDesign'},               icon:'Id', iconImg:'/icons/indesign.png',             color:'#FF3366', skill:85, description:{de:'Layout & Print Design',en:'Layout & print design'}, works:[{title:{de:'Ganbatte Broschüre',en:'Ganbatte Brochure'},year:'2024',type:{de:'Print',en:'Print'}},{title:{de:'Continental Kampagne',en:'Continental Campaign'},year:'2024',type:{de:'Editorial',en:'Editorial'}},{title:{de:'HateAid Layouts',en:'HateAid Layouts'},year:'2023',type:{de:'NGO',en:'NGO'}}]},
  { id:8,  name:{de:'Acrobat',en:'Acrobat'},                 icon:'Ac', iconImg:'/icons/acrobat.png',              color:'#FF0000', skill:65, description:{de:'PDF & Dokumentendesign',en:'PDF & document design'}, works:[{title:{de:'Portfolio PDFs',en:'Portfolio PDFs'},year:'2024',type:{de:'Print',en:'Print'}},{title:{de:'Präsentationen',en:'Presentations'},year:'2023',type:{de:'Corporate',en:'Corporate'}},{title:{de:'Briefings',en:'Briefings'},year:'2023',type:{de:'Dokument',en:'Document'}}]},
  { id:9,  name:{de:'VS Code',en:'VS Code'},                 icon:'VS', iconImg:'/icons/vs-code.png',              color:'#007ACC', skill:82, description:{de:'Web Development & Next.js',en:'Web development & Next.js'}, works:[{title:{de:'Portfolio Next.js',en:'Portfolio Next.js'},year:'2024',type:{de:'Development',en:'Development'}},{title:{de:'Pocoloco Website',en:'Pocoloco Website'},year:'2024',type:{de:'Next.js',en:'Next.js'}},{title:{de:'API Entwicklung',en:'API Development'},year:'2023',type:{de:'Backend',en:'Backend'}}]},
  { id:10, name:{de:'ComfyUI',en:'ComfyUI'},                 icon:'CU', iconImg:'/icons/comfy-ui.png',             color:'#39ff14', skill:78, description:{de:'KI Bildgenerierung & Workflows',en:'AI image generation & workflows'}, works:[{title:{de:'LoRA Training',en:'LoRA Training'},year:'2024',type:{de:'KI',en:'AI'}},{title:{de:'KI Portraits',en:'AI Portraits'},year:'2024',type:{de:'Generative KI',en:'Generative AI'}},{title:{de:'N8N Automation',en:'N8N Automation'},year:'2023',type:{de:'Workflow',en:'Workflow'}}]},
  { id:11, name:{de:'Adobe Audition',en:'Adobe Audition'},   icon:'Au', iconImg:'/icons/adobe-audition.png',       color:'#00E4BB', skill:60, description:{de:'Audio Editing & Sound Design',en:'Audio editing & sound design'}, works:[{title:{de:'GWA Audio Mix',en:'GWA Audio Mix'},year:'2024',type:{de:'Sound',en:'Sound'}},{title:{de:'Podcast Edit',en:'Podcast Edit'},year:'2023',type:{de:'Audio',en:'Audio'}},{title:{de:'Voice Over',en:'Voice Over'},year:'2023',type:{de:'Produktion',en:'Production'}}]},
  { id:12, name:{de:'Claude AI',en:'Claude AI'},             icon:'Cl', iconImg:'/icons/claude.png',               color:'#CC785C', skill:95, description:{de:'KI-Assistent & Prompt Design',en:'AI assistant & prompt design'}, works:[{title:{de:'Portfolio Entwicklung',en:'Portfolio Development'},year:'2024',type:{de:'Development',en:'Development'}},{title:{de:'Workflow Automation',en:'Workflow Automation'},year:'2024',type:{de:'KI',en:'AI'}},{title:{de:'Content Creation',en:'Content Creation'},year:'2023',type:{de:'Kreativ',en:'Creative'}}]},
  { id:13, name:{de:'Blender',en:'Blender'},                 icon:'Bl', iconImg:'/icons/blender.png',              color:'#EA7600', skill:55, description:{de:'3D Modellierung & Rendering',en:'3D modeling & rendering'}, works:[{title:{de:'3D Visualisierungen',en:'3D Visualizations'},year:'2024',type:{de:'3D',en:'3D'}},{title:{de:'Motion Renders',en:'Motion Renders'},year:'2023',type:{de:'Animation',en:'Animation'}},{title:{de:'Product Renders',en:'Product Renders'},year:'2023',type:{de:'3D',en:'3D'}}]},
  { id:14, name:{de:'CapCut',en:'CapCut'},                   icon:'CC', iconImg:'/icons/capcut.png',               color:'#ffffff', skill:85, description:{de:'Mobile Video Editing & Reels',en:'Mobile video editing & reels'}, works:[{title:{de:'Instagram Reels',en:'Instagram Reels'},year:'2024',type:{de:'Social Media',en:'Social Media'}},{title:{de:'TikTok Edits',en:'TikTok Edits'},year:'2024',type:{de:'TikTok',en:'TikTok'}},{title:{de:'Lebara Content',en:'Lebara Content'},year:'2023',type:{de:'Content',en:'Content'}}]},
  { id:15, name:{de:'FL Studio',en:'FL Studio'},             icon:'FL', iconImg:'/icons/fl-studio.png',            color:'#FF8C00', skill:50, description:{de:'Musikproduktion & Beats',en:'Music production & beats'}, works:[{title:{de:'Soundtrack GWA',en:'Soundtrack GWA'},year:'2024',type:{de:'Sound',en:'Sound'}},{title:{de:'Background Music',en:'Background Music'},year:'2023',type:{de:'Musik',en:'Music'}},{title:{de:'Sound Effects',en:'Sound Effects'},year:'2023',type:{de:'Audio',en:'Audio'}}]},
  { id:16, name:{de:'Higgsfield',en:'Higgsfield'},           icon:'HF', iconImg:'/icons/higgsfield.png',           color:'#a855f7', skill:72, description:{de:'KI Videogenerierung',en:'AI video generation'}, works:[{title:{de:'KI Videoclips',en:'AI Video Clips'},year:'2024',type:{de:'KI Video',en:'AI Video'}},{title:{de:'Motion Concepts',en:'Motion Concepts'},year:'2024',type:{de:'Konzept',en:'Concept'}},{title:{de:'Social Media KI',en:'Social Media AI'},year:'2023',type:{de:'KI',en:'AI'}}]},
  { id:17, name:{de:'PowerPoint',en:'PowerPoint'},           icon:'PP', iconImg:'/icons/powerpoint.png',           color:'#D24726', skill:88, description:{de:'Präsentationen & Pitch Decks',en:'Presentations & pitch decks'}, works:[{title:{de:'Pitch Decks',en:'Pitch Decks'},year:'2024',type:{de:'Präsentation',en:'Presentation'}},{title:{de:'Kampagnen Decks',en:'Campaign Decks'},year:'2024',type:{de:'Corporate',en:'Corporate'}},{title:{de:'Brand Präsentationen',en:'Brand Presentations'},year:'2023',type:{de:'Branding',en:'Branding'}}]},
]

// ── Skill Bar ────────────────────────────────────────────────────────────────
function SkillBar({ skill, color, active }: { skill: number; color: string; active: boolean }) {
  const [width, setWidth] = useState(0)
  useEffect(() => {
    if (!active) { setWidth(0); return }
    const t = setTimeout(() => setWidth(skill), 80)
    return () => clearTimeout(t)
  }, [active, skill])
  return (
    <div style={{ marginBottom: 'clamp(16px,2vw,24px)' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:6 }}>
        <span style={{ fontSize:11, fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', color:'#0a0a0a' }}>Skill Level</span>
        <span style={{ fontSize:13, fontWeight:900, color:'#0a0a0a' }}>{width}%</span>
      </div>
      <div style={{ height:4, background:'#e8e8e8', borderRadius:2, overflow:'hidden' }}>
        <div style={{ height:'100%', background: color, borderRadius:2, width:`${width}%`, transition:'width 1.2s cubic-bezier(0.16,1,0.3,1)' }}/>
      </div>
    </div>
  )
}

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
  const { isMobile, isTouch } = useMobile()
  
  // More icons on mobile with tighter spacing
  const circleSize = isMobile ? 44 : defaultCircleSize
  const spacing = isMobile ? 52 : defaultSpacing
  const padding = isMobile ? 24 : defaultPadding
  const [hoveredId, setHoveredId] = useState<number | null>(null)
  const [exitP, setExitP] = useState(0)
  const [isEntering, setIsEntering] = useState(true)
  const [simulatedHover, setSimulatedHover] = useState<number | null>(null)
  const [simulatedNeighbors, setSimulatedNeighbors] = useState<Set<number>>(new Set())
  const [neighborIds, setNeighborIds] = useState<Set<number>>(new Set())
  const [openIdx, setOpenIdx] = useState<number | null>(null)
  const [phase, setPhase] = useState<'in' | 'open' | 'closing'>('in')
  const [lang] = useState<Lang>('de')
  const circlesRef = useRef<{ id: number; x: number; y: number; iconIndex: number }[]>([])
  const simulationRef = useRef<ReturnType<typeof setInterval> | null>(null)
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
    setRecentlyVisible(prev => {
      const next = new Set(prev)
      allVisible.forEach(id => next.add(id))
      return next
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
    
    return () => clearTimeout(timer)
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
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const x = padding + col * actualSpacingX
        const y = padding + row * actualSpacingY
        circles.push({ id: id++, x, y, iconIndex: Math.floor(Math.random() * programs.length) })
      }
    }
    circlesRef.current = circles
  }, [padding, spacing, programs.length])

  useEffect(() => {
    generateCircles()
    let t: ReturnType<typeof setTimeout>
    const onResize = () => { clearTimeout(t); t = setTimeout(generateCircles, 100) }
    window.addEventListener('resize', onResize)
    return () => { window.removeEventListener('resize', onResize); clearTimeout(t) }
  }, [generateCircles])


  const interactionTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  
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
    const mouseX = e.clientX - rect.left
    const mouseY = e.clientY - rect.top

    let closest: { id: number; dist: number } | null = null
    for (const circle of circlesRef.current) {
      const dx = mouseX - circle.x, dy = mouseY - circle.y
      const dist = Math.sqrt(dx * dx + dy * dy)
      if (dist < circleSize * 0.65 && (!closest || dist < closest.dist)) closest = { id: circle.id, dist }
    }

    const newHoveredId = closest ? closest.id : null
    const newNeighbors = new Set<number>()
    if (closest) {
      for (const circle of circlesRef.current) {
        if (circle.id === closest.id) continue
        const dx = mouseX - circle.x, dy = mouseY - circle.y
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist < spacing * 1.6) newNeighbors.add(circle.id)
      }
    }

    setHoveredId(newHoveredId)
    setNeighborIds(newNeighbors)
  }, [circleSize, spacing])

  const handleMouseLeave = useCallback(() => {
    setHoveredId(null)
    setNeighborIds(new Set())
  }, [])

  // Touch handlers for swipe-reveal on mobile
  const revealCirclesNearTouch = useCallback((touchX: number, touchY: number) => {
    const REVEAL_RADIUS = spacing * 1.8
    const FADE_DELAY = 2500 // Icons stay visible for 2.5s after touch leaves
    
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
  }, [spacing])

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
    }
  }, [])

  const openOverlay = useCallback((idx: number) => {
    setOpenIdx(idx)
    document.body.style.overflow = 'hidden'
    document.body.classList.add('overlay-open')
    requestAnimationFrame(() => requestAnimationFrame(() => setPhase('open')))
  }, [])

  const closeOverlay = useCallback(() => {
    if (phase === 'closing') return
    setPhase('closing')
    setTimeout(() => { 
      setOpenIdx(null)
      setPhase('in')
      document.body.style.overflow = ''
      document.body.classList.remove('overlay-open')
    }, 520)
  }, [phase])

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
        const centerX = window.innerWidth / 2
        const centerY = window.innerHeight / 2
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
        if (dist < spacing * 2) neighbors.add(c.id)
      })
      setSimulatedNeighbors(neighbors)
      
      // Faster movement - 200-400ms intervals
      const delay = 200 + Math.random() * 200
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
  }, [spacing])

  const renderedCircles = useMemo(() => {
    return circlesRef.current.map((circle) => {
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
        opacity = 0.5
        scale = 1.0
        transition = 'transform 0.2s ease, opacity 0.2s ease'
      } else if (wasRecentlyVisible) {
        // Was visible, now fading out - CSS handles the 6s fade
        opacity = 0
        scale = 1.0
        transition = 'transform 0.3s ease, opacity 6s ease-out'
      } else {
        // Never been visible or fully faded - render placeholder
        return <div key={circle.id} style={{ position:'absolute', left: circle.x - circleSize/2, top: circle.y - circleSize/2, width: circleSize, height: circleSize }} />
      }

      return (
        <button key={circle.id} onClick={() => openOverlay(circle.iconIndex)}
          style={{ position:'absolute', left: circle.x - circleSize/2, top: circle.y - circleSize/2, width: circleSize, height: circleSize, cursor:'pointer', zIndex: isHovered || isTouchRevealed ? 12 : 10, border:'none', background:'none', padding:0, display:'flex', alignItems:'center', justifyContent:'center' }}>
          <div style={{ width: circleSize, height: circleSize, borderRadius:'18%', overflow:'hidden', opacity, transition, transform:`scale(${scale})`, transformOrigin:'center' }}>
            <Image src={program.iconImg} alt={program.name[lang]} width={120} height={120}
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
  }, [hoveredId, neighborIds, simulatedHover, simulatedNeighbors, touchRevealedIds, recentlyVisible, circleSize, openOverlay, programs, lang])

  const selectedProgram = openIdx !== null ? programs[openIdx] : null

  return (
    <>
      <div ref={outerRef} style={{ position: 'relative', zIndex: 4, height: '300vh', marginTop: '-25vh' }}>
        <section 
          ref={containerRef} 
          onMouseMove={handleMouseMove} 
          onMouseLeave={handleMouseLeave}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          style={{ position: 'sticky', top: 0, width: '100%', height: '100vh', overflow: 'hidden', userSelect: 'none', cursor: isTouch ? 'default' : 'crosshair', backgroundColor, touchAction: 'pan-y' }}
        >
          <div style={{
            position: 'absolute',
            inset: 0,
            filter: exitP > 0.05 ? `blur(${exitP * 18}px)` : 'none',
            opacity: 1 - exitP * 0.9,
            transform: `scale(${1 - exitP * 0.04})`,
            transformOrigin: 'center top',
            willChange: 'filter, opacity, transform',
          }}>
            <ProgrammeHeading />
            {renderedCircles}
          </div>
        </section>
      </div>

      {selectedProgram && (
        <Overlay program={selectedProgram} idx={openIdx!} totalPrograms={programs.length} phase={phase} onClose={closeOverlay} onNavigate={navigate} lang={lang} />
      )}
    </>
  )
}

// ── Overlay ───────────────────────────────────────────────────────────────────
function Overlay({ program, idx, totalPrograms, phase, onClose, onNavigate, lang }: {
  program: Program; idx: number; totalPrograms: number
  phase: 'in' | 'open' | 'closing'; onClose: () => void
  onNavigate: (dir: 'l' | 'r') => void; lang: Lang
}) {
  const [titleDisp, setTitleDisp] = useState(program.name[lang])
  const [descDisp, setDescDisp] = useState(program.description[lang])
  const titleRef = useRef<(() => void) | null>(null)
  const descRef = useRef<(() => void) | null>(null)
  const isOpen = phase === 'open'

  useEffect(() => {
    runScramble(program.name[lang], setTitleDisp, titleRef)
    const t = setTimeout(() => runScramble(program.description[lang], setDescDisp, descRef), 60)
    return () => {
      clearTimeout(t)
      titleRef.current?.()
      descRef.current?.()
    }
  }, [lang, program])

  const EASE = 'cubic-bezier(0.76,0,0.24,1)'
  const vw = typeof window !== 'undefined' ? window.innerWidth : 1440
  const isMobile = vw < 768
  const imgW = isMobile ? Math.round(vw * 0.92) : Math.min(Math.round(vw * 0.38), 440)
  const panW = isMobile ? Math.round(vw * 0.92) : Math.min(Math.round(vw * 0.46), 560)
  const isOpening = phase === 'in'
  const isClosing = phase === 'closing'

  const iconBtn: React.CSSProperties = { background:'none', border:'none', cursor:'pointer', padding:6, lineHeight:0, opacity:0.3, transition:'opacity 0.15s', display:'flex', alignItems:'center', justifyContent:'center' }

  return (
    <>
      <style>{`
        body.overlay-open .mobile-nav-blur {
          opacity: 0 !important;
          pointer-events: none !important;
        }
      `}</style>
      <div onClick={onClose} style={{ position:'fixed', inset:0, zIndex:999999, backgroundColor: phase==='open'?'rgba(0,0,0,0.22)':'rgba(0,0,0,0)', backdropFilter: phase==='open'?'blur(12px)':'blur(0px)', WebkitBackdropFilter: phase==='open'?'blur(12px)':'blur(0px)', transition:'background-color 0.35s ease, backdrop-filter 0.35s ease', cursor:'pointer' }} />
      <div style={{ position:'fixed', inset:0, zIndex:1000000, display:'flex', alignItems:'center', justifyContent:'center', pointerEvents:'none' }}>
        <div style={{ display:'flex', flexDirection: isMobile?'column':'row', alignItems: isMobile?'center':'stretch', pointerEvents:'auto', cursor:'default' }}>
          <div style={{ width:imgW, flexShrink:0, alignSelf:'stretch', position:'relative', zIndex:1, transform: isOpening||isClosing?'scale(0.72)':'scale(1)', opacity: isOpening||isClosing?0:1, transition: isClosing?`transform 300ms ${EASE} 200ms, opacity 280ms ease 200ms`:`transform 320ms ${EASE}, opacity 300ms ease`, background:`radial-gradient(ellipse at 140% 140%, ${program.color}60 0%, ${program.color}20 40%, #0a0a0a 70%)`, display:'flex', alignItems:'center', justifyContent:'center' }}>
            <div style={{ width:'62%', aspectRatio:'1/1', borderRadius:'22%', overflow:'hidden', boxShadow:`0 24px 80px ${program.color}50` }}>
                <Image src={program.iconImg} alt={program.name[lang]} width={500} height={500} style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }} />
            </div>
          </div>
          <div onClick={e => e.stopPropagation()} style={{ width:panW, flexShrink:0, position:'relative', zIndex:0, transform:`translateX(${isOpening||isClosing?'-100%':'0%'})`, opacity: isOpening||isClosing?0:1, transition: isClosing?`transform 260ms ${EASE}, opacity 240ms ease`:`transform 300ms ${EASE} 100ms, opacity 280ms ease 100ms`, backgroundColor:'#ffffff', overflow:'hidden' }}>
            <button onClick={onClose} style={{ ...iconBtn, position:'absolute', top:18, right:18, zIndex:2 }} onMouseEnter={e=>e.currentTarget.style.opacity='1'} onMouseLeave={e=>e.currentTarget.style.opacity='0.3'}>
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><line x1="1" y1="1" x2="17" y2="17" stroke="#0a0a0a" strokeWidth="3" strokeLinecap="square"/><line x1="17" y1="1" x2="1" y2="17" stroke="#0a0a0a" strokeWidth="3" strokeLinecap="square"/></svg>
            </button>
            <div style={{ height:'100%', display:'flex', flexDirection:'column', padding:'clamp(52px,6vw,68px) clamp(28px,3.5vw,42px) clamp(28px,3.5vw,42px)', boxSizing:'border-box' }}>
              <h2 onMouseEnter={() => runScramble(program.name[lang], setTitleDisp, titleRef)} style={{ color:'#0a0a0a', fontSize:'clamp(24px,3vw,52px)', fontWeight:900, textTransform:'uppercase', margin:'0 0 clamp(8px,1.2vw,16px)', lineHeight:1, letterSpacing:'-1.5px', cursor:'default' }}>
                {titleDisp}
              </h2>
              <p style={{ color:'#555', fontSize:'clamp(13px,1.4vw,16px)', lineHeight:1.85, margin:'0 0 clamp(12px,1.5vw,20px)', flex:0 }}>{descDisp}</p>
              <SkillBar skill={program.skill} color={program.color} active={isOpen} />
              <h4 style={{ color:'#0a0a0a', fontSize:'11px', fontWeight:700, letterSpacing:'0.12em', textTransform:'uppercase', marginBottom:'10px', marginTop:0 }}>
                {lang==='de' ? 'Projekte' : 'Projects'}
              </h4>
              <div style={{ display:'flex', flexDirection:'column', gap:6, marginBottom:'clamp(12px,1.5vw,20px)', flex:1 }}>
                {program.works.map((work, i) => (
                  <div key={i} style={{ background:'#f5f5f5', padding:'9px 14px', display:'flex', justifyContent:'space-between', alignItems:'center', transition:'transform 0.2s, background 0.2s', cursor:'default' }} onMouseEnter={e=>{e.currentTarget.style.transform='translateX(4px)';e.currentTarget.style.background=program.color+'20'}} onMouseLeave={e=>{e.currentTarget.style.transform='translateX(0)';e.currentTarget.style.background='#f5f5f5'}}>
                    <span style={{ fontSize:'13px', fontWeight:600, color:'#0a0a0a' }}>{work.title[lang]}</span>
                    <span style={{ fontSize:9, backgroundColor:'#0a0a0a', color:'#fff', letterSpacing:'0.08em', textTransform:'uppercase', padding:'3px 7px' }}>{work.type[lang]}</span>
                  </div>
                ))}
              </div>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexShrink:0 }}>
                <span style={{ color:'#0a0a0a', fontSize:'clamp(14px,1.6vw,22px)', fontWeight:900, letterSpacing:'-0.5px', lineHeight:1 }}>
                  {String(idx+1).padStart(2,'0')} / {String(totalPrograms).padStart(2,'0')}
                </span>
                <div style={{ display:'flex', gap:2 }}>
                  <button onClick={()=>onNavigate('l')} style={iconBtn} onMouseEnter={e=>e.currentTarget.style.opacity='1'} onMouseLeave={e=>e.currentTarget.style.opacity='0.3'}>
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><polyline points="13,2 6,10 13,18" stroke="#0a0a0a" strokeWidth="3" strokeLinecap="square" strokeLinejoin="miter"/></svg>
                  </button>
                  <button onClick={()=>onNavigate('r')} style={iconBtn} onMouseEnter={e=>e.currentTarget.style.opacity='1'} onMouseLeave={e=>e.currentTarget.style.opacity='0.3'}>
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><polyline points="7,2 14,10 7,18" stroke="#0a0a0a" strokeWidth="3" strokeLinecap="square" strokeLinejoin="miter"/></svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}