import { useEffect, useRef, useState, type MouseEvent } from 'react'
import BottleStage, { makeControl } from '../three/BottleStage'
import { photoUrl, products, type Side } from '../data'
import { useReveals, useTilt } from '../lib/hooks'
import { gsap, scrollTop } from '../lib/smooth'
import { useUI } from '../components/UI'

const VIEWS = [
  { id: 'front', label: 'Front', angle: 0 },
  { id: 'left', label: 'Facts', angle: Math.PI * 0.55 },
  { id: 'back', label: 'Back', angle: Math.PI },
  { id: 'right', label: 'Warnings', angle: -Math.PI * 0.55 },
]

export default function ProductPage({ side }: { side: Side }) {
  const p = products[side]
  const root = useRef<HTMLDivElement>(null)
  const ctrl = useRef(makeControl())
  const view = useRef<{ snapTo: (a: number) => void } | null>(null)
  const [idx, setIdx] = useState(0)
  const [spin, setSpin] = useState(true)
  const [zoom, setZoom] = useState(1)
  const [touched, setTouched] = useState(false)
  const [activeView, setActiveView] = useState('front')
  const { go, openLab } = useUI()
  const f = p.flavors[idx]
  useReveals(root, [side])
  useTilt(root)

  useEffect(() => {
    gsap.to(ctrl.current, { scale: zoom, duration: 0.8, ease: 'expo.out' })
  }, [zoom])

  useEffect(() => {
    const el = root.current!
    gsap.fromTo(el.querySelectorAll('.pv__in'), { y: 30, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.08, duration: 1.1, ease: 'expo.out', delay: 0.3 })
    gsap.fromTo(ctrl.current, { scale: 0.5, spin: -3 }, { scale: 1, spin: 0, duration: 2, ease: 'expo.out' })
  }, [])

  useEffect(() => {
    const el = root.current!.querySelector('.pv__flavor')
    if (el) gsap.fromTo(el, { yPercent: 50, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.8, ease: 'expo.out' })
  }, [idx])

  // the black label puts Product Facts on the left and warnings on the right
  const views = side === 'black' ? VIEWS : VIEWS.map((v) => v.id === 'left' ? { ...v, label: 'Specs' } : v.id === 'right' ? { ...v, label: '21+' } : v)
  const nav = (to: string) => (e: MouseEvent) => go(to, side, { x: e.clientX, y: e.clientY })

  return (
    <div ref={root} className="pp" style={{ ['--fc' as string]: f.color, ['--ft' as string]: f.tint, ['--fg' as string]: f.glow }}>
      <section className="pv" onPointerDown={() => setTouched(true)}>
        <div className="pv__bg" />
        <div className="pv__ring" aria-hidden />
        <BottleStage side={side} flavorId={f.id} control={ctrl} interactive autoRotate={spin ? 0.3 : 0} fill={window.innerWidth < 760 ? 0.56 : 0.6} className="pv__stage" viewRef={view} />

        <div className="pv__top pv__in">
          <p className="eyebrow">Breeze · {p.name}</p>
          <h1 className="pv__title">{p.short} <span>Tablets</span></h1>
        </div>
        <span className="pv__flavor script" key={f.id} aria-live="polite">{f.name}</span>

        <div className={`pv__hint ${touched ? 'is-gone' : ''}`} aria-hidden>
          <svg viewBox="0 0 48 24" width="48" height="24"><path d="M4 12h40M4 12l6-6M4 12l6 6M44 12l-6-6M44 12l-6 6" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>
          Drag to rotate 360°
        </div>

        <div className="pv__views pv__in" role="group" aria-label="Camera views">
          {views.map((v) => (
            <button key={v.id} className={activeView === v.id ? 'is-on' : ''} onClick={() => { setSpin(false); setActiveView(v.id); view.current?.snapTo(v.angle) }}>{v.label}</button>
          ))}
        </div>

        <div className="pv__tools pv__in">
          <button onClick={() => setSpin(!spin)} aria-pressed={spin} title="Auto rotate">
            <svg viewBox="0 0 24 24" width="18" height="18"><path d="M20 12a8 8 0 1 1-2.3-5.6M20 4v4h-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </button>
          <button onClick={() => setZoom((z) => Math.min(1.6, +(z + 0.2).toFixed(2)))} aria-label="Zoom in">+</button>
          <button onClick={() => setZoom((z) => Math.max(0.8, +(z - 0.2).toFixed(2)))} aria-label="Zoom out">−</button>
        </div>

        <div className="pv__swatches pv__in" role="radiogroup" aria-label="Flavor">
          {p.flavors.map((fl, i) => (
            <button key={fl.id} role="radio" aria-checked={i === idx} className={i === idx ? 'is-on' : ''} style={{ ['--c' as string]: fl.color }} onClick={() => setIdx(i)}>
              <span className="sw" /><span className="sw__name">{fl.name}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="pd">
        <div className="pd__media" data-tilt>
          <img key={f.id} src={photoUrl(side, f.id)} alt={`Breeze ${p.name} ${f.name}`} />
        </div>
        <div className="pd__info">
          <p className="eyebrow" data-reveal>{side === 'white' ? 'Botanical Tablets' : '7-Hydroxymitragynine Tablets'}</p>
          <h2 className="h2" data-reveal>Breeze {p.short} — <span className="script pd__script">{f.name}</span></h2>
          <div className="pd__price" data-reveal>
            <span className="price-badge price-badge--sm"><span>{p.price.replace(/\.\d+$/, '')}</span><sup>{p.price.split('.')[1]}</sup></span>
            <span className="pd__msrp">MSRP · per bottle</span>
          </div>
          <p className="lead" data-reveal>
            {side === 'white'
              ? 'Breeze Botanical Tablets come in a clean white bottle with a child-resistant cap and watercolor flavor art. Ten tablets per bottle, five fruit flavors.'
              : 'Breeze 7-OH comes in a gloss-black bottle with chrome lettering and flavor-matched liquid color. Ten tablets per bottle, eight flavors. For adults 21+ only.'}
          </p>
          <dl className="pd__specs" data-reveal>
            <div><dt>Count</dt><dd data-count={p.count}>0</dd></div>
            <div><dt>Per tablet</dt><dd><span data-count={p.perTablet}>0</span><small>mg</small></dd></div>
            <div><dt>{p.totalLabel}</dt><dd><span data-count={p.total}>0</span><small>mg</small></dd></div>
            <div><dt>Format</dt><dd className="pd__fmt">Tablet</dd></div>
          </dl>
          <div className="pd__chips" data-reveal>
            {p.flavors.map((fl, i) => (
              <button key={fl.id} className={`chip ${i === idx ? 'is-on' : ''}`} style={{ ['--c' as string]: fl.color }} onClick={() => { setIdx(i); scrollTop(false) }}>{fl.name}</button>
            ))}
          </div>
          <div className="pd__btns" data-reveal>
            <button className="btn btn--solid" onClick={() => openLab(f.id, side)}>Lab report · {f.name}</button>
            <button className="btn btn--ghost" onClick={nav(p.base + '/contact')}>Wholesale inquiry</button>
          </div>
          <details className="pd__warn" data-reveal>
            <summary>Warnings &amp; disclaimer</summary>
            {side === 'black' ? (
              <p>This product contains 7-Hydroxymitragynine. Use only as directed on the label. Intoxicating effects may be delayed for up to two hours. Do not use if you are pregnant, nursing, or have heart disease, liver disorder or high blood pressure. Do not operate vehicles or machinery while using. Do not combine with prescription medications such as pain relievers, opioids, antidepressants, blood pressure drugs, MAO inhibitors, stimulants or antihistamines. Not for daily or prolonged use. Keep out of reach of children. 21+ only. Availability depends on state and federal law.</p>
            ) : (
              <p>For adults 21+ only. Read the entire label before use. Do not use if pregnant or nursing. Consult a physician before use if you have a medical condition or take medication. Do not operate vehicles or machinery after use. Keep out of reach of children. Store in a cool, dry place.</p>
            )}
            <p>These statements have not been evaluated by the Food and Drug Administration. This product is not intended to diagnose, treat, cure or prevent any disease.</p>
          </details>
        </div>
      </section>

      <section className="pf">
        {[
          { t: 'Child-resistant cap', d: 'Ribbed push-and-turn closure on every bottle.' },
          { t: 'QR on every label', d: 'Scan to reach the lab report for your exact flavor.' },
          { t: 'Batch & lot coded', d: 'Lot number, batch, manufacturing and expiry dates printed on the label.' },
        ].map((x, i) => (
          <article key={x.t} className="pf__card" data-reveal data-delay={i * 0.08} data-tilt>
            <span className="pf__n">0{i + 1}</span>
            <h3>{x.t}</h3>
            <p>{x.d}</p>
          </article>
        ))}
      </section>
    </div>
  )
}
