'use client'

const CHARS = '!@#$%&*АБВГДЕЖИКЛМНОПРСТУФХЦ01アイウエオ'

interface ActiveScramble {
  id: number
  target: string
  revealed: Set<number>
  iteration: number
  maxIterations: number
  callback: (text: string) => void
  onComplete?: () => void
}

let nextId = 0
const activeScrambles = new Map<number, ActiveScramble>()
let rafId: number | null = null
let lastTick = 0
const TICK_INTERVAL = 30 // ms between updates

function tick(now: number) {
  if (activeScrambles.size === 0) {
    rafId = null
    return
  }

  // Throttle to ~30ms intervals for consistent animation speed
  if (now - lastTick >= TICK_INTERVAL) {
    lastTick = now
    
    const toRemove: number[] = []
    
    activeScrambles.forEach((scramble, id) => {
      scramble.iteration++
      
      // Reveal one random character
      const pool = scramble.target
        .split('')
        .map((_, j) => j)
        .filter(j => !scramble.revealed.has(j) && scramble.target[j] !== ' ' && scramble.target[j] !== '\n')
      
      if (pool.length > 0) {
        scramble.revealed.add(pool[Math.floor(Math.random() * pool.length)])
      }
      
      // Generate display text
      const displayText = scramble.target
        .split('')
        .map((c, j) => 
          scramble.revealed.has(j) || c === ' ' || c === '\n' 
            ? scramble.target[j] 
            : CHARS[Math.floor(Math.random() * CHARS.length)]
        )
        .join('')
      
      scramble.callback(displayText)
      
      // Check if complete
      if (scramble.iteration >= scramble.maxIterations) {
        scramble.callback(scramble.target)
        scramble.onComplete?.()
        toRemove.push(id)
      }
    })
    
    toRemove.forEach(id => activeScrambles.delete(id))
  }
  
  rafId = requestAnimationFrame(tick)
}

function ensureRunning() {
  if (rafId === null) {
    lastTick = performance.now()
    rafId = requestAnimationFrame(tick)
  }
}

/**
 * Start a scramble animation
 * @returns cleanup function to cancel the scramble
 */
export function startScramble(
  target: string,
  callback: (text: string) => void,
  options?: {
    maxIterations?: number
    onComplete?: () => void
  }
): () => void {
  const id = nextId++
  const scramble: ActiveScramble = {
    id,
    target,
    revealed: new Set(),
    iteration: 0,
    maxIterations: options?.maxIterations ?? 14,
    callback,
    onComplete: options?.onComplete,
  }
  
  // Initial scrambled text
  callback(target.split('').map(c => 
    c === ' ' || c === '\n' ? c : CHARS[Math.floor(Math.random() * CHARS.length)]
  ).join(''))
  
  activeScrambles.set(id, scramble)
  ensureRunning()
  
  return () => {
    activeScrambles.delete(id)
  }
}

/**
 * Get count of currently active scrambles (for debugging)
 */
export function getActiveScrambleCount(): number {
  return activeScrambles.size
}
