import { useEffect, useRef, useState, type MouseEvent } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { products, type Side } from '../data'
import { useUI } from './UI'
import Logo from './Logo'
import { gsap, lockScroll } from '../lib/smooth'

const links = [
  { to: '', label: 'Home' },
  { to: '/about', label: 'About Us' },
  { to: '/product', label: 'Product' },
  { to: '#lab', label: 'Lab Report' },
  { to: '/contact', label: 'Contact' },
]

export function SideLayout({ side }: { side: Side }) {
  useEffect(() => {
    document.documentElement.dataset.side = side
    const meta = document.querySelector('meta[name="theme-color"]')
    meta?.setAttribute('content', side === 'black' ? '#060607' : '#f4f2f7')
  }, [side])
  return (
    <div className={`site site--${side}`} data-side={side}>
      <Header side={side} />
      <main id="main">
        <Outlet />
      </main>
      <Footer side={side} />
    </div>
  )
}

export function SwitchSide({ side, compact = false }: { side: Side; compact?: boolean }) {
  const { go } = useUI()
  const loc = useLocation()
  const p = products[side]
  const other: Side = side === 'white' ? 'black' : 'white'
  const target = loc.pathname.replace(p.base, products[other].base)
  const onClick = (e: MouseEvent) => go(target, other, { x: e.clientX, y: e.clientY })
  return (
    <button className={`switch ${compact ? 'switch--compact' : ''}`} onClick={onClick} aria-label={`Switch to the ${other === 'black' ? 'dark (7-OH)' : 'light (Botanical)'} side`}>
      <span className="switch__dot"><i /></span>
      {!compact && <span className="switch__txt">{other === 'black' ? 'Dark side' : 'Light side'}</span>}
    </button>
  )
}

function Header({ side }: { side: Side }) {
  const p = products[side]
  const { go, openLab } = useUI()
  const [open, setOpen] = useState(false)
  const [hidden, setHidden] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const loc = useLocation()

  useEffect(() => {
    let lastY = window.scrollY
    const onScroll = () => {
      const y = window.scrollY
      setScrolled(y > 20)
      setHidden(y > 300 && y > lastY && !open)
      lastY = y
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [open])

  useEffect(() => { setOpen(false) }, [loc.pathname])

  useEffect(() => {
    lockScroll(open)
    document.body.classList.toggle('menu-open', open)
    if (open && menuRef.current) {
      gsap.fromTo(menuRef.current.querySelectorAll('.mmenu__link'), { yPercent: 120, opacity: 0 }, { yPercent: 0, opacity: 1, stagger: 0.06, duration: 0.8, ease: 'expo.out', delay: 0.1 })
    }
  }, [open])

  const click = (to: string) => (e: MouseEvent) => {
    e.preventDefault()
    setOpen(false)
    if (to === '#lab') { openLab(); return }
    go(p.base + to, side, { x: e.clientX, y: e.clientY })
  }

  return (
    <>
      <header className={`hdr ${hidden ? 'hdr--hidden' : ''} ${scrolled ? 'hdr--scrolled' : ''} ${open ? 'hdr--open' : ''}`}>
        <a href={p.base} className="hdr__logo" onClick={click('')} aria-label="Breeze home">
          <Logo variant={side === 'black' ? 'silver' : 'navy'} />
          <span className="hdr__tag">{p.short}</span>
        </a>
        <nav className="hdr__nav" aria-label="Main">
          {links.map((l) => l.to === '#lab' ? (
            <a key={l.to} href="#lab" onClick={click(l.to)} className="hdr__link">{l.label}</a>
          ) : (
            <NavLink key={l.to} to={p.base + l.to} end onClick={click(l.to)} className={({ isActive }) => `hdr__link ${isActive ? 'is-active' : ''}`}>{l.label}</NavLink>
          ))}
        </nav>
        <div className="hdr__right">
          <SwitchSide side={side} />
          <button className="burger" onClick={() => setOpen(!open)} aria-expanded={open} aria-label="Menu">
            <i /><i />
          </button>
        </div>
      </header>
      <div ref={menuRef} className={`mmenu ${open ? 'is-open' : ''}`} aria-hidden={!open}>
        <nav>
          {links.map((l, i) => (
            <a key={l.to} href={l.to === '#lab' ? '#lab' : p.base + l.to} onClick={click(l.to)} className="mmenu__link">
              <small>0{i + 1}</small>{l.label}
            </a>
          ))}
        </nav>
        <div className="mmenu__foot">
          <SwitchSide side={side} />
          <span>21+ only</span>
        </div>
      </div>
    </>
  )
}

function Footer({ side }: { side: Side }) {
  const p = products[side]
  const { go, openLab } = useUI()
  const other: Side = side === 'white' ? 'black' : 'white'
  const nav = (to: string) => (e: MouseEvent) => { e.preventDefault(); go(to, side, { x: e.clientX, y: e.clientY }) }
  return (
    <footer className="ftr">
      <a href={products[other].base} className={`ftr__cross ftr__cross--${other}`} onClick={(e) => { e.preventDefault(); go(products[other].base, other, { x: e.clientX, y: e.clientY }) }}>
        <span className="eyebrow">Discover the other side</span>
        <span className="ftr__crossTitle">{other === 'black' ? 'Go dark' : 'Go light'} <em>→</em></span>
        <span className="ftr__crossSub">{products[other].name} · {products[other].flavors.length} flavors</span>
      </a>
      <div className="ftr__grid">
        <div className="ftr__brand">
          <Logo variant={side === 'black' ? 'silver' : 'navy'} className="ftr__logo" />
          <p>Two sides. One Breeze.</p>
        </div>
        <div className="ftr__col">
          <h4>Explore</h4>
          <a href={p.base} onClick={nav(p.base)}>Home</a>
          <a href={p.base + '/about'} onClick={nav(p.base + '/about')}>About Us</a>
          <a href={p.base + '/product'} onClick={nav(p.base + '/product')}>Product</a>
          <a href="#lab" onClick={(e) => { e.preventDefault(); openLab() }}>Lab Report</a>
          <a href={p.base + '/contact'} onClick={nav(p.base + '/contact')}>Contact</a>
        </div>
        <div className="ftr__col">
          <h4>Lines</h4>
          <a href="/botanical" onClick={(e) => { e.preventDefault(); go('/botanical', 'white', { x: e.clientX, y: e.clientY }) }}>Botanical Tablets</a>
          <a href="/7oh" onClick={(e) => { e.preventDefault(); go('/7oh', 'black', { x: e.clientX, y: e.clientY }) }}>7-OH Tablets</a>
          <a href="/" onClick={(e) => { e.preventDefault(); go('/', side, { x: e.clientX, y: e.clientY }) }}>Choose a side</a>
        </div>
      </div>
      <div className="ftr__legal">
        <p><strong>21+ ONLY.</strong> Underage sale prohibited. Keep out of reach of children and pets. Not for use by pregnant or nursing women. Do not operate vehicles or machinery after use. Consult a physician before use if you have a medical condition or take medication.</p>
        <p>These statements have not been evaluated by the Food and Drug Administration. This product is not intended to diagnose, treat, cure or prevent any disease. Product availability varies by state; it is the buyer's responsibility to comply with local laws.</p>
        <p className="ftr__copy">© {new Date().getFullYear()} Breeze. All rights reserved.</p>
      </div>
    </footer>
  )
}
