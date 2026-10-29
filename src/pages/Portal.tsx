import { useEffect, useRef, useState, type MouseEvent } from 'react'
import BottleStage, { makeControl } from '../three/BottleStage'
import Logo from '../components/Logo'
import { useUI } from '../components/UI'
import { gsap } from '../lib/smooth'
import { products } from '../data'

export default function Portal() {
  const { go } = useUI()
  const root = useRef<HTMLDivElement>(null)
  const ctrlW = useRef(makeControl())
  const ctrlB = useRef(makeControl())
  const [vertical, setVertical] = useState(() => window.matchMedia('(max-width: 760px)').matches)

  useEffect(() => {
    document.documentElement.dataset.side = 'portal'
    const mq = window.matchMedia('(max-width: 760px)')
    const onMq = () => setVertical(mq.matches)
    mq.addEventListener('change', onMq)
    return () => mq.removeEventListener('change', onMq)
  }, [])

  // bottles sit at the center of each half
  useEffect(() => {
    if (vertical) {
      Object.assign(ctrlW.current, { x: 0.2, y: 0.25, scale: 0.6 })
      Object.assign(ctrlB.current, { x: -0.2, y: -0.25, scale: 0.6 })
    } else {
      Object.assign(ctrlW.current, { x: -0.25, y: -0.03, scale: 0.92 })
      Object.assign(ctrlB.current, { x: 0.25, y: -0.03, scale: 0.92 })
    }
  }, [vertical])

  // split follows the pointer (pulls toward the hovered side)
  useEffect(() => {
    const el = root.current!
    let target = 50, cur = 50, raf = 0, t0 = performance.now()
    let touched = false
    const onMove = (e: PointerEvent) => {
      touched = true
      const f = vertical ? e.clientY / window.innerHeight : e.clientX / window.innerWidth
      target = 50 + (0.5 - f) * 2 * 22
    }
    const onLeave = () => { target = 50 }
    el.addEventListener('pointermove', onMove)
    el.addEventListener('pointerleave', onLeave)
    const loop = (now: number) => {
      raf = requestAnimationFrame(loop)
      const idle = touched ? 0 : Math.sin((now - t0) / 1600) * 6
      cur += (target + idle - cur) * 0.07
      el.style.setProperty('--split', `${cur}%`)
      const k = (cur - 50) / 22
      ctrlW.current.scale = (vertical ? 0.6 : 0.92) + Math.max(0, k) * 0.1
      ctrlB.current.scale = (vertical ? 0.6 : 0.92) + Math.max(0, -k) * 0.1
    }
    raf = requestAnimationFrame(loop)
    return () => { cancelAnimationFrame(raf); el.removeEventListener('pointermove', onMove); el.removeEventListener('pointerleave', onLeave) }
  }, [vertical])

  // intro
  useEffect(() => {
    const el = root.current!
    const tl = gsap.timeline({ defaults: { ease: 'expo.out' } })
    tl.fromTo(el.querySelectorAll('.portal__logo'), { yPercent: 40, opacity: 0, scale: 0.9 }, { yPercent: 0, opacity: 1, scale: 1, duration: 1.4 })
      .fromTo(el.querySelectorAll('.portal__word'), { opacity: 0, letterSpacing: '0.3em' }, { opacity: 1, letterSpacing: '-0.02em', duration: 1.6 }, 0.1)
      .fromTo(el.querySelectorAll('.portal__cta, .portal__meta, .portal__hint'), { y: 20, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.08, duration: 1 }, 0.5)
      .fromTo(el.querySelectorAll('.stage'), { opacity: 0, scale: 0.92 }, { opacity: 1, scale: 1, duration: 1.6 }, 0.2)
  }, [])

  const enter = (side: 'white' | 'black') => (e: MouseEvent) => {
    go(products[side].base, side, { x: e.clientX, y: e.clientY })
  }

  return (
    <div ref={root} className={`portal ${vertical ? 'portal--v' : ''}`}>
      <section className="portal__side portal__side--w" onClick={enter('white')} aria-label="Enter the light side: Botanical Tablets">
        <div className="portal__bg" />
        <div className="portal__word" aria-hidden>LIGHT</div>
        <BottleStage side="white" flavorId="bluerazz" control={ctrlW} fill={0.6} autoRotate={0.35} />
        <div className="portal__logo-wrap"><Logo variant="navy" className="portal__logo" /></div>
        <div className="portal__cta">
          <span className="eyebrow">The light side</span>
          <strong>Botanical Tablets</strong>
          <span className="portal__go">Enter <i>→</i></span>
        </div>
      </section>
      <section className="portal__side portal__side--b" onClick={enter('black')} aria-label="Enter the dark side: 7-OH Tablets">
        <div className="portal__bg" />
        <div className="portal__word" aria-hidden>DARK</div>
        <BottleStage side="black" flavorId="original" control={ctrlB} fill={0.6} autoRotate={-0.35} />
        <div className="portal__logo-wrap"><Logo variant="silver" className="portal__logo" /></div>
        <div className="portal__cta">
          <span className="eyebrow">The dark side</span>
          <strong>7-OH Tablets</strong>
          <span className="portal__go">Enter <i>→</i></span>
        </div>
      </section>
      <div className="portal__divider" aria-hidden><span>{vertical ? '⇅' : '⇆'}</span></div>
      <p className="portal__hint">Two sides. One Breeze. — choose yours</p>
      <p className="portal__meta">21+ only</p>
    </div>
  )
}
