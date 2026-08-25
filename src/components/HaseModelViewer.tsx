'use client'

// PROVISORISCH: Temporärer 3D-Viewer für hase01.glb in der Hero-Section.
// Ziehen (linke Maustaste) bewegt das Modell auf dem Screen,
// Shift + Ziehen dreht den Blickwinkel (Y/X-Rotation).
import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'

export function HaseModelViewer() {
  const mountRef = useRef<HTMLDivElement>(null)
  const modelRef = useRef<THREE.Object3D | null>(null)
  const rotationRef = useRef({ x: -0.15, y: 0.4 })
  const [pos, setPos] = useState({ x: 0, y: 0 })
  const posRef = useRef(pos)
  const dragRef = useRef<{ mode: 'move' | 'rotate'; startX: number; startY: number; startPos: { x: number; y: number }; startRot: { x: number; y: number } } | null>(null)
  const [status, setStatus] = useState<'loading' | 'loaded' | 'error'>('loading')
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => { posRef.current = pos }, [pos])

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return

    // Guard against a 0×0 read on first paint (e.g. layout not settled yet) —
    // fall back to a fixed size so the camera/renderer never get a degenerate aspect.
    const width = mount.clientWidth || 420
    const height = mount.clientHeight || 420

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(35, width / height, 0.1, 100)
    camera.position.set(0, 0, 5)

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(width, height)
    renderer.setClearColor(0x000000, 0)
    mount.appendChild(renderer.domElement)

    // Chrome/silver metal needs reflections to read as anything but black —
    // generate a neutral studio environment map and use it for the whole scene.
    const pmremGenerator = new THREE.PMREMGenerator(renderer)
    const envTexture = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture
    scene.environment = envTexture

    scene.add(new THREE.HemisphereLight(0xffffff, 0x444444, 1.2))
    scene.add(new THREE.AmbientLight(0xffffff, 0.9))
    const dirLight = new THREE.DirectionalLight(0xffffff, 1.6)
    dirLight.position.set(3, 4, 5)
    scene.add(dirLight)
    const dirLight2 = new THREE.DirectionalLight(0xffffff, 0.7)
    dirLight2.position.set(-4, -2, -3)
    scene.add(dirLight2)

    // Visible placeholder shown immediately, replaced once the glb has loaded —
    // proves the canvas itself is rendering even if the model fails to load.
    const placeholder = new THREE.Mesh(
      new THREE.BoxGeometry(1.4, 1.4, 1.4),
      new THREE.MeshStandardMaterial({ color: 0xff5533, wireframe: true })
    )
    scene.add(placeholder)

    const group = new THREE.Group()
    scene.add(group)

    let disposed = false
    const loader = new GLTFLoader()
    loader.load(
      '/models/hase01.glb',
      (gltf) => {
        if (disposed) return
        scene.remove(placeholder)
        const model = gltf.scene

        // Force a chrome/silver look regardless of the original material —
        // high metalness + low roughness relies on scene.environment for reflections.
        model.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            child.material = new THREE.MeshStandardMaterial({
              color: 0xd8dade,
              metalness: 1,
              roughness: 0.22,
              envMapIntensity: 1.4,
            })
          }
        })

        const box = new THREE.Box3().setFromObject(model)
        const size = box.getSize(new THREE.Vector3())
        const center = box.getCenter(new THREE.Vector3())
        const maxDim = Math.max(size.x, size.y, size.z) || 1
        const scale = 2.2 / maxDim
        model.scale.setScalar(scale)
        model.position.sub(center.multiplyScalar(scale))
        group.add(model)
        modelRef.current = group
        setStatus('loaded')
      },
      undefined,
      (err) => {
        console.error('hase01.glb load error', err)
        setStatus('error')
        setErrorMsg(err instanceof Error ? err.message : String(err))
      }
    )

    let raf = 0
    const animate = () => {
      group.rotation.x = rotationRef.current.x
      group.rotation.y = rotationRef.current.y
      placeholder.rotation.y += 0.01
      renderer.render(scene, camera)
      raf = requestAnimationFrame(animate)
    }
    animate()

    const handleResize = () => {
      if (!mount) return
      const w = mount.clientWidth || 420
      const h = mount.clientHeight || 420
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      renderer.setSize(w, h)
    }
    window.addEventListener('resize', handleResize)

    return () => {
      disposed = true
      window.removeEventListener('resize', handleResize)
      cancelAnimationFrame(raf)
      renderer.dispose()
      pmremGenerator.dispose()
      if (renderer.domElement.parentNode === mount) mount.removeChild(renderer.domElement)
    }
  }, [])

  const handlePointerDown = (e: React.PointerEvent) => {
    e.currentTarget.setPointerCapture(e.pointerId)
    dragRef.current = {
      mode: e.shiftKey ? 'rotate' : 'move',
      startX: e.clientX,
      startY: e.clientY,
      startPos: posRef.current,
      startRot: { ...rotationRef.current },
    }
  }

  const handlePointerMove = (e: React.PointerEvent) => {
    const drag = dragRef.current
    if (!drag) return
    const dx = e.clientX - drag.startX
    const dy = e.clientY - drag.startY
    if (drag.mode === 'move') {
      const next = { x: drag.startPos.x + dx, y: drag.startPos.y + dy }
      posRef.current = next
      setPos(next)
    } else {
      rotationRef.current = {
        x: Math.max(-1.4, Math.min(1.4, drag.startRot.x + dy * 0.01)),
        y: drag.startRot.y + dx * 0.01,
      }
    }
  }

  const handlePointerUp = (e: React.PointerEvent) => {
    if (e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId)
    dragRef.current = null
  }

  return (
    <div
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      style={{
        position: 'fixed',
        top: '12vh',
        left: '50%',
        width: 'min(46vw, 420px)',
        height: 'min(46vw, 420px)',
        transform: `translate(calc(-50% + ${pos.x}px), ${pos.y}px)`,
        zIndex: 999999,
        cursor: 'grab',
        touchAction: 'none',
        // Temporary debug affordance so the box itself is always visible,
        // even if the glb model or WebGL context fails for some reason.
        border: '1px dashed rgba(255,0,0,0.4)',
        background: 'rgba(255,255,255,0.05)',
      }}
    >
      <div ref={mountRef} style={{ width: '100%', height: '100%' }} />
      <div style={{
        position: 'absolute', bottom: -26, left: '50%', transform: 'translateX(-50%)',
        fontSize: 11, fontFamily: 'monospace', color: '#0a0a0a', opacity: 0.7,
        whiteSpace: 'nowrap', pointerEvents: 'none',
      }}>
        {status === 'loading' && 'hase01.glb lädt…'}
        {status === 'loaded' && 'ziehen = bewegen · shift+ziehen = drehen (provisorisch)'}
        {status === 'error' && `fehler beim laden: ${errorMsg}`}
      </div>
    </div>
  )
}
