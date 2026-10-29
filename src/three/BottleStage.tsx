import { useEffect, useRef, type MutableRefObject } from 'react'
import * as THREE from 'three'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'
import { createBottle, loadLabel, type BottleHandle } from './bottle'
import { labelUrl, products, type Side } from '../data'

export interface StageControl {
  spin: number // extra Y rotation (rad)
  x: number // horizontal offset as fraction of visible width
  y: number // vertical offset as fraction of visible height
  scale: number
  tilt: number
}

export const makeControl = (): StageControl => ({ spin: 0, x: 0, y: 0, scale: 1, tilt: 0 })

interface Props {
  side: Side
  flavorId: string
  control?: MutableRefObject<StageControl>
  interactive?: boolean
  autoRotate?: number
  fill?: number // fraction of viewport height used by the bottle
  className?: string
  viewRef?: MutableRefObject<{ snapTo: (angle: number) => void } | null>
}

const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)

export default function BottleStage({ side, flavorId, control, interactive = false, autoRotate = 0.25, fill = 0.62, className, viewRef }: Props) {
  const hostRef = useRef<HTMLDivElement>(null)
  const api = useRef<{ setFlavor: (id: string) => void } | null>(null)
  const flavorRef = useRef(flavorId)
  const autoRef = useRef(autoRotate)
  autoRef.current = autoRotate

  useEffect(() => {
    const host = hostRef.current!
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const mobile = window.matchMedia('(max-width: 760px)').matches

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, mobile ? 1.75 : 2))
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = side === 'black' ? 1.05 : 1.0
    renderer.outputColorSpace = THREE.SRGBColorSpace
    host.appendChild(renderer.domElement)

    const scene = new THREE.Scene()
    const pmrem = new THREE.PMREMGenerator(renderer)
    const envTex = pmrem.fromScene(new RoomEnvironment(), 0.04).texture
    scene.environment = envTex
    scene.environmentIntensity = side === 'black' ? 0.55 : 0.95

    const camera = new THREE.PerspectiveCamera(28, 1, 0.1, 100)

    const glowColor = new THREE.Color(products[side].flavors.find((f) => f.id === flavorId)?.glow ?? '#ffffff')
    scene.add(new THREE.HemisphereLight(0xffffff, side === 'black' ? 0x111111 : 0xdddde8, side === 'black' ? 0.25 : 0.6))
    const key = new THREE.DirectionalLight(0xffffff, side === 'black' ? 1.6 : 1.4)
    key.position.set(-3, 4, 6)
    scene.add(key)
    const rimL = new THREE.DirectionalLight(glowColor, side === 'black' ? 3.2 : 1.1)
    rimL.position.set(-6, 2, -4)
    scene.add(rimL)
    const rimR = new THREE.DirectionalLight(glowColor, side === 'black' ? 2.6 : 0.9)
    rimR.position.set(6, 1, -3)
    scene.add(rimR)
    const fillL = new THREE.PointLight(0xffffff, side === 'black' ? 6 : 3, 20)
    fillL.position.set(4, -1, 5)
    scene.add(fillL)

    const bottle: BottleHandle = createBottle(side)
    scene.add(bottle.group)
    const aniso = renderer.capabilities.getMaxAnisotropy()

    let current = flavorRef.current
    loadLabel(labelUrl(side, current), aniso).then((t) => bottle.setLabel(t)).catch(() => {})

    // flavor swap with a spin
    let swap: { start: number; tex: THREE.Texture | null; done: boolean; id: string; color: THREE.Color } | null = null
    let swapSpin = 0
    const setFlavor = (id: string) => {
      if (id === current) return
      current = id
      const color = new THREE.Color(products[side].flavors.find((f) => f.id === id)?.glow ?? '#ffffff')
      const s = { start: performance.now(), tex: null as THREE.Texture | null, done: false, id, color }
      swap = s
      loadLabel(labelUrl(side, id), aniso).then((t) => {
        if (swap === s) s.tex = t
        else if (current === id) bottle.setLabel(t)
      }).catch(() => {})
    }
    api.current = { setFlavor }

    // sizing
    let visW = 1, visH = 1
    const resize = () => {
      const w = host.clientWidth || 1
      const h = host.clientHeight || 1
      renderer.setSize(w, h, false)
      camera.aspect = w / h
      const vfov = THREE.MathUtils.degToRad(camera.fov)
      const distH = (bottle.height / fill) / 2 / Math.tan(vfov / 2)
      const hfov = 2 * Math.atan(Math.tan(vfov / 2) * camera.aspect)
      const distW = (2.3 / 0.62) / 2 / Math.tan(hfov / 2)
      const dist = Math.max(distH, distW)
      camera.position.set(0, 0.35, dist)
      camera.lookAt(0, 0, 0)
      camera.updateProjectionMatrix()
      visH = 2 * dist * Math.tan(vfov / 2)
      visW = visH * camera.aspect
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(host)

    // drag interaction
    let drag = 0, dragTarget = 0, vel = 0, tiltDrag = 0, tiltTarget = 0
    let pointerDown = false, lastX = 0, lastY = 0, lastT = 0
    let snapTarget: number | null = null
    const el = renderer.domElement
    el.style.touchAction = 'pan-y'
    const onDown = (e: PointerEvent) => {
      pointerDown = true
      lastX = e.clientX; lastY = e.clientY; lastT = performance.now()
      vel = 0
      snapTarget = null
      el.setPointerCapture(e.pointerId)
      host.classList.add('is-grabbing')
    }
    const onMove = (e: PointerEvent) => {
      if (!pointerDown) return
      const dx = e.clientX - lastX
      const dy = e.clientY - lastY
      const now = performance.now()
      dragTarget += dx * 0.012
      tiltTarget = THREE.MathUtils.clamp(tiltTarget + dy * 0.004, -0.35, 0.35)
      vel = (dx * 0.012) / Math.max(1, now - lastT) * 16
      lastX = e.clientX; lastY = e.clientY; lastT = now
    }
    const onUp = (e: PointerEvent) => {
      pointerDown = false
      host.classList.remove('is-grabbing')
      try { el.releasePointerCapture(e.pointerId) } catch { /* noop */ }
    }
    if (interactive) {
      el.addEventListener('pointerdown', onDown)
      el.addEventListener('pointermove', onMove)
      el.addEventListener('pointerup', onUp)
      el.addEventListener('pointercancel', onUp)
    }
    if (viewRef) {
      viewRef.current = {
        snapTo: (angle: number) => {
          // shortest path to the requested angle
          const cur = dragTarget + auto
          const base = Math.round((cur - angle) / (Math.PI * 2)) * Math.PI * 2 + angle
          snapTarget = base - auto
          vel = 0
        },
      }
    }

    // mouse parallax (desktop)
    let mx = 0, my = 0, pmx = 0, pmy = 0
    const onMouse = (e: MouseEvent) => {
      mx = e.clientX / window.innerWidth - 0.5
      my = e.clientY / window.innerHeight - 0.5
    }
    if (!mobile) window.addEventListener('mousemove', onMouse, { passive: true })

    // visibility
    let visible = true
    const io = new IntersectionObserver(([en]) => { visible = en.isIntersecting }, { rootMargin: '100px' })
    io.observe(host)

    let auto = 0
    let raf = 0
    let last = performance.now()
    const tick = (now: number) => {
      raf = requestAnimationFrame(tick)
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      if (!visible || document.hidden) return

      if (!pointerDown) {
        if (snapTarget !== null) {
          dragTarget += (snapTarget - dragTarget) * 0.12
          if (Math.abs(snapTarget - dragTarget) < 0.001) snapTarget = null
        } else {
          dragTarget += vel
          vel *= 0.94
          if (Math.abs(vel) < 0.0004 && !reduce) auto += autoRef.current * dt
        }
        tiltTarget *= 0.94
      }
      drag += (dragTarget - drag) * 0.18
      tiltDrag += (tiltTarget - tiltDrag) * 0.15

      if (swap) {
        const t = Math.min(1, (now - swap.start) / 1100)
        swapSpin = easeInOut(t) * Math.PI * 2
        if (t > 0.45 && !swap.done && swap.tex) {
          bottle.setLabel(swap.tex)
          swap.done = true
        }
        rimL.color.lerp(swap.color, 0.08)
        rimR.color.lerp(swap.color, 0.08)
        if (t >= 1) {
          if (!swap.done && swap.tex) bottle.setLabel(swap.tex)
          swap = null
          swapSpin = 0
        }
      }

      pmx += (mx - pmx) * 0.05
      pmy += (my - pmy) * 0.05
      const c = control?.current
      const g = bottle.group
      g.rotation.y = auto + drag + swapSpin + (c?.spin ?? 0) + pmx * 0.35
      g.rotation.x = tiltDrag + (c?.tilt ?? 0) + pmy * 0.12
      g.rotation.z = (c?.tilt ?? 0) * -0.3
      g.position.x = (c?.x ?? 0) * visW
      g.position.y = (c?.y ?? 0) * visH + Math.sin(now / 1400) * 0.04
      const sc = c?.scale ?? 1
      g.scale.setScalar(sc)
      renderer.render(scene, camera)
    }
    raf = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      io.disconnect()
      window.removeEventListener('mousemove', onMouse)
      el.removeEventListener('pointerdown', onDown)
      el.removeEventListener('pointermove', onMove)
      el.removeEventListener('pointerup', onUp)
      el.removeEventListener('pointercancel', onUp)
      bottle.dispose()
      envTex.dispose()
      pmrem.dispose()
      renderer.dispose()
      renderer.forceContextLoss()
      el.remove()
      api.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [side, interactive, fill])

  useEffect(() => {
    flavorRef.current = flavorId
    api.current?.setFlavor(flavorId)
  }, [flavorId])

  return <div ref={hostRef} className={`stage ${interactive ? 'stage--interactive' : ''} ${className ?? ''}`} />
}
