import * as THREE from 'three'
import type { Side } from '../data'

/**
 * Procedural pill bottle (body + ribbed child-proof cap + wrap label).
 * Units: body radius = 1. Group origin is the visual center of the bottle.
 */

interface Spec {
  wallTop: number
  shoulderTop: number
  neckR: number
  neckTop: number
  capR: number
  capBottom: number
  capTop: number
  labelH: number
  labelCenter: number
  labelAspect: number // texture width / height
  bodyColor: number
  bodyRough: number
  capColor: number
  capRough: number
  labelRough: number
}

const SPECS: Record<Side, Spec> = {
  black: {
    wallTop: 1.95, shoulderTop: 2.24, neckR: 0.86, neckTop: 2.5,
    capR: 1.03, capBottom: 2.36, capTop: 3.18,
    labelH: 1.62, labelCenter: 1.03, labelAspect: 2048 / 641,
    bodyColor: 0x060607, bodyRough: 0.16, capColor: 0x0d0d0e, capRough: 0.5, labelRough: 0.3,
  },
  white: {
    wallTop: 2.3, shoulderTop: 2.58, neckR: 0.86, neckTop: 2.82,
    capR: 0.99, capBottom: 2.68, capTop: 3.62,
    labelH: 2.0, labelCenter: 1.24, labelAspect: 2400 / 889,
    bodyColor: 0xf1f1f2, bodyRough: 0.4, capColor: 0xf6f6f7, capRough: 0.48, labelRough: 0.42,
  },
}

function bodyProfile(s: Spec) {
  const pts: THREE.Vector2[] = []
  pts.push(new THREE.Vector2(0, 0.02))
  pts.push(new THREE.Vector2(0.8, 0.0))
  // rounded bottom edge
  for (let i = 0; i <= 8; i++) {
    const a = (-Math.PI / 2) + (i / 8) * (Math.PI / 2)
    pts.push(new THREE.Vector2(0.86 + Math.cos(a) * 0.14, 0.14 + Math.sin(a) * 0.14))
  }
  pts.push(new THREE.Vector2(1, s.wallTop))
  // shoulder
  const sh = s.shoulderTop - s.wallTop
  for (let i = 1; i <= 10; i++) {
    const t = i / 10
    const a = t * (Math.PI / 2)
    const r = s.neckR + (1 - s.neckR) * Math.cos(a)
    pts.push(new THREE.Vector2(r, s.wallTop + Math.sin(a) * sh))
  }
  pts.push(new THREE.Vector2(s.neckR, s.neckTop))
  pts.push(new THREE.Vector2(s.neckR - 0.08, s.neckTop))
  return pts
}

function capGeometry(s: Spec) {
  const h = s.capTop - s.capBottom
  const R = s.capR
  const pts: THREE.Vector2[] = []
  pts.push(new THREE.Vector2(R - 0.12, s.capBottom))
  pts.push(new THREE.Vector2(R - 0.02, s.capBottom))
  pts.push(new THREE.Vector2(R, s.capBottom + 0.03))
  const steps = 18
  for (let i = 1; i <= steps; i++) {
    pts.push(new THREE.Vector2(R, s.capBottom + 0.03 + (h - 0.2) * (i / steps)))
  }
  // top bevel
  for (let i = 1; i <= 8; i++) {
    const a = (i / 8) * (Math.PI / 2)
    pts.push(new THREE.Vector2(R - 0.13 + Math.cos(a) * 0.13, s.capTop - 0.13 + Math.sin(a) * 0.13 - 0.04 + 0.04 * (i / 8)))
  }
  pts.push(new THREE.Vector2(R - 0.3, s.capTop))
  pts.push(new THREE.Vector2(0, s.capTop - 0.01))
  const geo = new THREE.LatheGeometry(pts, 420)
  const pos = geo.attributes.position as THREE.BufferAttribute
  const ridges = 64
  const y0 = s.capBottom + 0.07
  const y1 = s.capTop - 0.14
  const v = new THREE.Vector3()
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i)
    const r = Math.hypot(v.x, v.z)
    if (r > R - 0.005 && v.y > y0 && v.y < y1) {
      const phi = Math.atan2(v.x, v.z)
      const k = Math.min(1, (v.y - y0) / 0.06, (y1 - v.y) / 0.06)
      const c = 0.5 + 0.5 * Math.cos(phi * ridges)
      const groove = Math.pow(c, 0.45)
      const nr = r - 0.035 * (1 - groove) * k
      v.x *= nr / r
      v.z *= nr / r
      pos.setXYZ(i, v.x, v.y, v.z)
    }
  }
  geo.computeVertexNormals()
  return geo
}

function shadowTexture() {
  const c = document.createElement('canvas')
  c.width = c.height = 256
  const g = c.getContext('2d')!
  const grd = g.createRadialGradient(128, 128, 0, 128, 128, 128)
  grd.addColorStop(0, 'rgba(0,0,0,0.55)')
  grd.addColorStop(0.45, 'rgba(0,0,0,0.25)')
  grd.addColorStop(1, 'rgba(0,0,0,0)')
  g.fillStyle = grd
  g.fillRect(0, 0, 256, 256)
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  return t
}

const loader = new THREE.TextureLoader()
const texCache = new Map<string, Promise<THREE.Texture>>()
export function loadLabel(url: string, maxAniso: number) {
  let p = texCache.get(url)
  if (!p) {
    p = new Promise((res, rej) => {
      loader.load(url, (t) => {
        t.colorSpace = THREE.SRGBColorSpace
        t.anisotropy = maxAniso
        t.wrapS = THREE.ClampToEdgeWrapping
        res(t)
      }, undefined, rej)
    })
    texCache.set(url, p)
  }
  return p
}

export interface BottleHandle {
  group: THREE.Group
  inner: THREE.Group
  setLabel: (t: THREE.Texture) => void
  height: number
  dispose: () => void
}

export function createBottle(side: Side): BottleHandle {
  const s = SPECS[side]
  const group = new THREE.Group()
  const inner = new THREE.Group()
  group.add(inner)

  const bodyMat = new THREE.MeshPhysicalMaterial({
    color: s.bodyColor, roughness: s.bodyRough, metalness: 0,
    clearcoat: side === 'black' ? 1 : 0.35, clearcoatRoughness: side === 'black' ? 0.06 : 0.3,
  })
  const body = new THREE.Mesh(new THREE.LatheGeometry(bodyProfile(s), 160), bodyMat)
  inner.add(body)

  const capMat = new THREE.MeshPhysicalMaterial({
    color: s.capColor, roughness: s.capRough, metalness: 0,
    clearcoat: side === 'black' ? 0.4 : 0.15, clearcoatRoughness: 0.4,
  })
  const cap = new THREE.Mesh(capGeometry(s), capMat)
  inner.add(cap)

  // dark ring under the cap (thread gap)
  const ring = new THREE.Mesh(
    new THREE.CylinderGeometry(s.capR - 0.05, s.capR - 0.05, 0.02, 96, 1, true),
    new THREE.MeshBasicMaterial({ color: 0x050505, side: THREE.DoubleSide }),
  )
  ring.position.y = s.capBottom + 0.005
  inner.add(ring)

  // label wraps an arc whose length matches the texture aspect
  const arc = Math.min(Math.PI * 2, s.labelH * s.labelAspect)
  const labelMat = new THREE.MeshPhysicalMaterial({
    color: 0xffffff, roughness: s.labelRough, metalness: 0,
    clearcoat: side === 'black' ? 0.8 : 0.35, clearcoatRoughness: 0.18,
    transparent: false,
  })
  // thetaStart chosen so the texture's horizontal center faces +Z (camera)
  const label = new THREE.Mesh(
    new THREE.CylinderGeometry(1.006, 1.006, s.labelH, 220, 1, true, -arc / 2, arc),
    labelMat,
  )
  label.position.y = s.labelCenter
  label.visible = false
  inner.add(label)

  // ground shadow
  const shadow = new THREE.Mesh(
    new THREE.PlaneGeometry(4.2, 4.2),
    new THREE.MeshBasicMaterial({ map: shadowTexture(), transparent: true, depthWrite: false, opacity: side === 'black' ? 0.9 : 0.5 }),
  )
  shadow.rotation.x = -Math.PI / 2
  shadow.position.y = -0.01
  inner.add(shadow)

  inner.position.y = -s.capTop / 2

  return {
    group,
    inner,
    height: s.capTop,
    setLabel(t) {
      labelMat.map = t
      labelMat.needsUpdate = true
      label.visible = true
    },
    dispose() {
      group.traverse((o) => {
        const m = o as THREE.Mesh
        if (m.isMesh) {
          m.geometry.dispose()
          const mat = m.material as THREE.Material
          mat.dispose()
        }
      })
    },
  }
}
