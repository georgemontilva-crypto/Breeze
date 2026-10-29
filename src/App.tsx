import { useEffect } from 'react'
import { Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import { UIProvider, AgeGate, useUI } from './components/UI'
import { SideLayout } from './components/SiteChrome'
import Portal from './pages/Portal'
import SideHome from './pages/SideHome'
import About from './pages/About'
import ProductPage from './pages/ProductPage'
import Contact from './pages/Contact'
import LabReports from './pages/LabReports'
import { initSmooth, ScrollTrigger, scrollTop } from './lib/smooth'
import { products, sideFromPath, type Side } from './data'

function LabRoute({ side }: { side: Side }) {
  const nav = useNavigate()
  useEffect(() => { nav(products[side].base + '/lab-reports', { replace: true }) }, [side, nav])
  return null
}

function NotFound() {
  const { go } = useUI()
  return (
    <div className="nf" data-side="black">
      <h1 className="display">404</h1>
      <p className="lead">This page drifted away.</p>
      <button className="btn btn--solid" onClick={(e) => go('/', 'black', { x: e.clientX, y: e.clientY })}>Back to Breeze</button>
    </div>
  )
}

function Titles() {
  const loc = useLocation()
  useEffect(() => {
    const side = sideFromPath(loc.pathname)
    const seg = loc.pathname.split('/')[2]
    const names: Record<string, string> = { about: 'About Us', product: 'Product', contact: 'Contact', 'lab-reports': 'Lab Reports' }
    document.title = side
      ? `${seg ? names[seg] ?? 'Breeze' : products[side].name} — Breeze ${products[side].short}`
      : 'Breeze — Two sides. One Breeze.'
    requestAnimationFrame(() => ScrollTrigger.refresh())
  }, [loc.pathname])
  useEffect(() => {
    const onPop = () => scrollTop(true)
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])
  return null
}

export default function App() {
  useEffect(() => { initSmooth() }, [])
  return (
    <UIProvider>
      <Titles />
      <Routes>
        <Route path="/" element={<Portal />} />
        {(['white', 'black'] as Side[]).map((s) => (
          <Route key={s} path={products[s].base} element={<SideLayout key={s} side={s} />}>
            <Route index element={<SideHome key={s} side={s} />} />
            <Route path="about" element={<About key={s} side={s} />} />
            <Route path="product" element={<ProductPage key={s} side={s} />} />
            <Route path="contact" element={<Contact key={s} side={s} />} />
            <Route path="lab-reports" element={<LabReports key={s} side={s} />} />
            <Route path="lab-report" element={<LabRoute side={s} />} />
          </Route>
        ))}
        <Route path="*" element={<NotFound />} />
      </Routes>
      <AgeGate />
    </UIProvider>
  )
}
