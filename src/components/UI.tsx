import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { gsap, lockScroll, ScrollTrigger, scrollTop } from '../lib/smooth'
import Logo from './Logo'
import { coaLab, coas, coaUrl, products, sideFromPath, type Side } from '../data'

interface UICtx {
  go: (to: string, side: Side, from?: { x: number; y: number }) => void
  /** without a flavor: go to the Lab Reports page; with a flavor: open that report */
  openLab: (flavorId?: string, side?: Side) => void
}

const Ctx = createContext<UICtx>({ go: () => {}, openLab: () => {} })
export const useUI = () => useContext(Ctx)

export function UIProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate()
  const overlay = useRef<HTMLDivElement>(null)
  const [overSide, setOverSide] = useState<Side>('black')
  const [lab, setLab] = useState<{ side: Side; id: string } | null>(null)
  const busy = useRef(false)

  const go = useCallback((to: string, side: Side, from?: { x: number; y: number }) => {
    if (busy.current) return
    if (to === window.location.pathname) { scrollTop(false); return }
    busy.current = true
    setOverSide(side)
    const el = overlay.current!
    const x = from?.x ?? window.innerWidth / 2
    const y = from?.y ?? window.innerHeight / 2
    const r = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y)) + 20
    gsap.killTweensOf(el)
    gsap.set(el, { display: 'grid', clipPath: `circle(0px at ${x}px ${y}px)` })
    gsap.fromTo(el.querySelector('.xfade__logo'), { opacity: 0, scale: 0.85 }, { opacity: 1, scale: 1, duration: 0.5, delay: 0.25, ease: 'power2.out' })
    gsap.to(el, {
      clipPath: `circle(${r}px at ${x}px ${y}px)`,
      duration: 0.75,
      ease: 'power3.inOut',
      onComplete: () => {
        navigate(to)
        scrollTop(true)
        requestAnimationFrame(() => {
          ScrollTrigger.refresh()
          gsap.to(el, {
            clipPath: `circle(0px at 50% 50%)`,
            duration: 0.7,
            delay: 0.15,
            ease: 'power3.inOut',
            onComplete: () => { gsap.set(el, { display: 'none' }); busy.current = false },
          })
        })
      },
    })
  }, [navigate])

  const openLab = useCallback((flavorId?: string, sideArg?: Side) => {
    const side = sideArg ?? sideFromPath(window.location.pathname) ?? 'black'
    if (flavorId) setLab({ side, id: flavorId })
    else go(products[side].base + '/lab-reports', side)
  }, [go])

  return (
    <Ctx.Provider value={{ go, openLab }}>
      {children}
      <div ref={overlay} className={`xfade xfade--${overSide}`} aria-hidden>
        <Logo variant={overSide === 'black' ? 'silver' : 'navy'} className="xfade__logo" />
      </div>
      {lab && <LabViewer side={lab.side} flavorId={lab.id} onClose={() => setLab(null)} onPick={(id) => setLab({ side: lab.side, id })} />}
    </Ctx.Provider>
  )
}

function LabViewer({ side, flavorId, onClose, onPick }: { side: Side; flavorId: string; onClose: () => void; onPick: (id: string) => void }) {
  const ref = useRef<HTMLDivElement>(null)
  const p = products[side]
  const f = p.flavors.find((x) => x.id === flavorId) ?? p.flavors[0]
  const c = coas[side][f.id]
  const idx = p.flavors.indexOf(f)
  const [zoom, setZoom] = useState(false)
  const step = (d: number) => onPick(p.flavors[(idx + d + p.flavors.length) % p.flavors.length].id)
  useEffect(() => {
    lockScroll(true)
    const el = ref.current!
    gsap.fromTo(el, { opacity: 0 }, { opacity: 1, duration: 0.3 })
    gsap.fromTo(el.querySelector('.coa__card'), { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, ease: 'expo.out' })
    ;(el.querySelector('.coa__close') as HTMLButtonElement)?.focus()
    return () => lockScroll(false)
  }, [])
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
      if (e.key === 'ArrowRight') step(1)
      if (e.key === 'ArrowLeft') step(-1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })
  const close = () => { gsap.to(ref.current, { opacity: 0, duration: 0.2, onComplete: onClose }) }
  return (
    <div ref={ref} className={`coa coa--${side}`} data-side={side} role="dialog" aria-modal="true" aria-labelledby="coa-title" onClick={(e) => { if (e.target === e.currentTarget) close() }} style={{ ['--fc' as string]: f.color }}>
      <div className="coa__card">
        <header className="coa__head">
          <div>
            <p className="eyebrow">Certificate of Analysis · {coaLab.name}</p>
            <h2 id="coa-title" className="coa__title">{p.short} <span className="script">{f.name}</span></h2>
            <p className="coa__meta">Sample {c?.sampleId} · Reported {coaLab.reported} · {coaLab.accreditation}</p>
          </div>
          <button className="coa__close" onClick={close} aria-label="Close">
            <svg viewBox="0 0 24 24" width="22" height="22"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
          </button>
        </header>
        <div className={`coa__doc ${zoom ? 'is-zoom' : ''}`} key={f.id} onClick={() => setZoom(!zoom)}>
          <span className="coa__zoom">{zoom ? 'Tap to fit' : 'Tap to zoom'}</span>
          <img src={coaUrl(side, f.id, 'img')} alt={`Lab report — Breeze ${p.short} ${f.name}`} />
        </div>
        <footer className="coa__foot">
          <div className="coa__nav">
            <button onClick={() => step(-1)} aria-label="Previous flavor">←</button>
            <span>{idx + 1} / {p.flavors.length}</span>
            <button onClick={() => step(1)} aria-label="Next flavor">→</button>
          </div>
          <div className="coa__btns">
            <a className="btn btn--ghost" href={coaUrl(side, f.id, 'pdf')} target="_blank" rel="noopener">Open PDF</a>
            <a className="btn btn--solid" href={coaUrl(side, f.id, 'pdf')} download={`Breeze-${p.short}-${f.name.replace(/\s+/g, '')}-COA.pdf`}>Download</a>
          </div>
        </footer>
      </div>
    </div>
  )
}

export function AgeGate() {
  const [ok, setOk] = useState(() => {
    try { return localStorage.getItem('breeze-21') === 'yes' } catch { return false }
  })
  const [denied, setDenied] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (ok) return
    lockScroll(true)
    gsap.fromTo(ref.current!.querySelectorAll('.gate__in > *'), { y: 24, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.08, duration: 0.8, ease: 'expo.out', delay: 0.2 })
    return () => lockScroll(false)
  }, [ok])
  if (ok) return null
  const yes = () => {
    try { localStorage.setItem('breeze-21', 'yes') } catch { /* private mode */ }
    gsap.to(ref.current, { opacity: 0, duration: 0.5, onComplete: () => setOk(true) })
  }
  return (
    <div ref={ref} className="gate" role="dialog" aria-modal="true" aria-labelledby="gate-title">
      <div className="gate__half gate__half--w" />
      <div className="gate__half gate__half--b" />
      <div className="gate__in">
        <div className="gate__logos">
          <Logo variant="navy" className="gate__logo gate__logo--w" />
          <Logo variant="silver" className="gate__logo gate__logo--b" />
        </div>
        {denied ? (
          <>
            <h2 id="gate-title" className="gate__title">Sorry.</h2>
            <p className="gate__text">You must be 21 or older to enter this site.</p>
          </>
        ) : (
          <>
            <p className="eyebrow">Age verification</p>
            <h2 id="gate-title" className="gate__title">Are you 21 or older?</h2>
            <p className="gate__text">Breeze products are intended for adults 21+ only. By entering you confirm you are of legal age in your state.</p>
            <div className="gate__btns">
              <button className="btn btn--solid" onClick={yes}>Yes, I'm 21+</button>
              <button className="btn btn--ghost" onClick={() => setDenied(true)}>No</button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
