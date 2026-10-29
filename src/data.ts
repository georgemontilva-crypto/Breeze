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
