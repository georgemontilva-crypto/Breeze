import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { gsap, lockScroll, ScrollTrigger, scrollTop } from '../lib/smooth'
import Logo from './Logo'
import type { Side } from '../data'

interface UICtx {
  go: (to: string, side: Side, from?: { x: number; y: number }) => void
  openLab: () => void
}

const Ctx = createContext<UICtx>({ go: () => {}, openLab: () => {} })
export const useUI = () => useContext(Ctx)

export function UIProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate()
  const overlay = useRef<HTMLDivElement>(null)
  const [overSide, setOverSide] = useState<Side>('black')
  const [lab, setLab] = useState(false)
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

  const openLab = useCallback(() => setLab(true), [])

  return (
    <Ctx.Provider value={{ go, openLab }}>
      {children}
      <div ref={overlay} className={`xfade xfade--${overSide}`} aria-hidden>
        <Logo variant={overSide === 'black' ? 'silver' : 'navy'} className="xfade__logo" />
      </div>
      {lab && <LabModal onClose={() => setLab(false)} />}
    </Ctx.Provider>
  )
}

function LabModal({ onClose }: { onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    lockScroll(true)
    const el = ref.current!
    gsap.fromTo(el, { opacity: 0 }, { opacity: 1, duration: 0.35 })
    gsap.fromTo(el.querySelector('.lab__card'), { y: 40, scale: 0.96, opacity: 0 }, { y: 0, scale: 1, opacity: 1, duration: 0.6, ease: 'expo.out', delay: 0.05 })
    gsap.fromTo(el.querySelectorAll('.lab__title span'), { yPercent: 110 }, { yPercent: 0, stagger: 0.04, duration: 0.8, ease: 'expo.out', delay: 0.15 })
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') close() }
    window.addEventListener('keydown', onKey)
    ;(el.querySelector('.lab__close') as HTMLButtonElement)?.focus()
    return () => { window.removeEventListener('keydown', onKey); lockScroll(false) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  const close = () => {
    gsap.to(ref.current, { opacity: 0, duration: 0.25, onComplete: onClose })
  }
  const word = 'COMING SOON'
  return (
    <div ref={ref} className="lab" role="dialog" aria-modal="true" aria-labelledby="lab-title" onClick={(e) => { if (e.target === e.currentTarget) close() }}>
      <div className="lab__card">
        <button className="lab__close" onClick={close} aria-label="Close">
          <svg viewBox="0 0 24 24" width="22" height="22"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
        </button>
        <div className="lab__doc" aria-hidden>
          <div className="lab__scan" />
          {Array.from({ length: 9 }).map((_, i) => <i key={i} style={{ width: `${55 + ((i * 37) % 40)}%` }} />)}
          <div className="lab__stamp">IN TESTING</div>
        </div>
        <p className="eyebrow">Lab Report · Certificate of Analysis</p>
        <h2 id="lab-title" className="lab__title">
          {word.split('').map((c, i) => <span key={i}>{c === ' ' ? ' ' : c}</span>)}
        </h2>
        <p className="lab__text">Third-party lab reports for every flavor and batch are on their way. Check back soon — every number will be published here.</p>
        <button className="btn btn--solid" onClick={close}>Got it</button>
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
