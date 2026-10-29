export type Side = 'white' | 'black'

export interface Flavor {
  id: string
  name: string
  color: string // accent
  tint: string // soft background tint
  glow: string // rim light / glow color
}

export interface Product {
  side: Side
  slug: string
  base: string // route base
  name: string
  short: string
  tagline: string
  price: string
  count: number
  perTablet: number
  total: number
  totalLabel: string
  flavors: Flavor[]
  otherBase: string
}

export const products: Record<Side, Product> = {
  white: {
    side: 'white',
    slug: 'botanical',
    base: '/botanical',
    name: 'Botanical Tablets',
    short: 'Botanical',
    tagline: 'Light as a breeze.',
    price: '$59.99',
    count: 10,
    perTablet: 150,
    total: 1500,
    totalLabel: 'Total',
    otherBase: '/7oh',
    flavors: [
      { id: 'bluerazz', name: 'Blue Razz', color: '#3b3fb3', tint: '#e3e7fb', glow: '#8fa2ff' },
      { id: 'strawberry', name: 'Strawberry', color: '#d9243f', tint: '#fde4e9', glow: '#ff8fa3' },
      { id: 'raspberry', name: 'Raspberry', color: '#cf1a77', tint: '#fbe1ef', glow: '#ff86c1' },
      { id: 'watermelon', name: 'Watermelon', color: '#23824a', tint: '#e5f3e6', glow: '#ff9aa8' },
      { id: 'cherry', name: 'Cherry', color: '#8c1d2b', tint: '#f9e2e5', glow: '#ff7a8a' },
    ],
  },
  black: {
    side: 'black',
    slug: '7oh',
    base: '/7oh',
    name: '7-OH Tablets',
    short: '7-OH',
    tagline: 'The dark side of Breeze.',
    price: '$74.99',
    count: 10,
    perTablet: 200,
    total: 2000,
    totalLabel: 'Per bottle',
    otherBase: '/botanical',
    flavors: [
      { id: 'original', name: 'Original', color: '#d99a3a', tint: '#2a1a08', glow: '#ffb347' },
      { id: 'mango', name: 'Mango', color: '#ff8a1f', tint: '#2a1405', glow: '#ff9d3c' },
      { id: 'strawberry', name: 'Strawberry', color: '#ff4d6d', tint: '#2a0a12', glow: '#ff5c7f' },
      { id: 'cherry', name: 'Cherry', color: '#e5232f', tint: '#260708', glow: '#ff3344' },
      { id: 'watermelon', name: 'Watermelon', color: '#ff4a5a', tint: '#1f0c0e', glow: '#3ddc84' },
      { id: 'bluerazz', name: 'Blue Razz', color: '#4ea6ff', tint: '#07152a', glow: '#3d8bff' },
      { id: 'grape', name: 'Grape', color: '#a173ff', tint: '#160b2a', glow: '#9a5cff' },
      { id: 'cottoncandy', name: 'Cotton Candy', color: '#ff6fb8', tint: '#2a0b1d', glow: '#ff7cc4' },
    ],
  },
}

export const labelUrl = (side: Side, flavorId: string) => `/labels/${side}-${flavorId}.webp`
export const photoUrl = (side: Side, flavorId: string) => `/img/${side}-${flavorId}.webp`

export const sideFromPath = (path: string): Side | null =>
  path.startsWith('/7oh') ? 'black' : path.startsWith('/botanical') ? 'white' : null

/* ---------- Lab reports (PharmLabs San Diego COAs) ---------- */
export interface Coa {
  sampleId: string
  result: string // headline result
  detail: string
}
export const coaLab = { name: 'PharmLabs San Diego', accreditation: 'ISO/IEC 17025:2017 · Acc. 85368', received: 'Oct 09, 2026', reported: 'Oct 16, 2026' }

const ND = { result: 'ND', detail: 'Kratom alkaloid panel (7-OH, MGM-15, mitragynine, speciogynine, speciociliatine): not detected' }
export const coas: Record<Side, Record<string, Coa>> = {
  white: {
    bluerazz: { sampleId: 'SD261009-001', ...ND },
    strawberry: { sampleId: 'SD261009-002', ...ND },
    watermelon: { sampleId: 'SD261009-003', ...ND },
    cherry: { sampleId: 'SD261009-004', ...ND },
    raspberry: { sampleId: 'SD261009-006', ...ND },
  },
  black: {
    bluerazz: { sampleId: 'SD261009-007', result: '200.22 mg', detail: '7-OH per tablet · 40.04%' },
    cherry: { sampleId: 'SD261009-008', result: '200.19 mg', detail: '7-OH per tablet · 40.03%' },
    cottoncandy: { sampleId: 'SD261009-009', result: '200.68 mg', detail: '7-OH per tablet · 40.13%' },
    grape: { sampleId: 'SD261009-010', result: '200.54 mg', detail: '7-OH per tablet · 40.10%' },
    mango: { sampleId: 'SD261009-011', result: '200.74 mg', detail: '7-OH per tablet · 40.14%' },
    original: { sampleId: 'SD261009-012', result: '200.09 mg', detail: '7-OH per tablet · 40.01%' },
    strawberry: { sampleId: 'SD261009-013', result: '200.36 mg', detail: '7-OH per tablet · 40.07%' },
    watermelon: { sampleId: 'SD261009-014', result: '200.87 mg', detail: '7-OH per tablet · 40.17%' },
  },
}
export const coaUrl = (side: Side, id: string, kind: 'pdf' | 'img' | 'thumb') =>
  `/coa/${side}-${id}${kind === 'pdf' ? '.pdf' : kind === 'img' ? '.webp' : '-thumb.webp'}`
