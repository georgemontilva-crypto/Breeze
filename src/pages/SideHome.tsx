import { useEffect, useLayoutEffect, useRef, useState, type MouseEvent } from 'react'
import BottleStage, { makeControl } from '../three/BottleStage'
import { photoUrl, products, type Side } from '../data'
import { gsap, ScrollTrigger } from '../lib/smooth'
import { isMobile, useReveals, useTilt } from '../lib/hooks'
import { useUI } from '../components/UI'
import Logo from '../components/Logo'

export default function SideHome({ side }: { side: Side }) {
  const p = products[side]
  const root = useRef<HTMLDivElement>(null)
  useReveals(root, [side])
  useTilt(root)
  return (
    <div ref={root} className="home">
      <Hero side={side} />
      <Marquee side={side} />
      <FlavorShowcase side={side} />
      {side === 'white' ? <MotionGallery /> : <Lineup />}
      {side === 'white' && <Campaign />}
      <LabTeaser side={side} />
      <section className="statement">
        <p className="statement__txt" data-fill>
          {side === 'white'
            ? 'Soft colors. Bright flavors. Breeze Botanical Tablets bring a lighter mood to your day — ten tablets, five flavors, zero noise.'
            : 'Deep black. Liquid gold. Breeze 7-OH is the bold side of the brand — eight flavors wrapped in chrome and shadow, made strictly for adults.'}
        </p>
        <span className="statement__sig">{p.tagline}</span>
      </section>
    </div>
  )
}

function Hero({ side }: { side: Side }) {
  const p = products[side]
  const sec = useRef<HTMLElement>(null)
  const ctrl = useRef(makeControl())
  const { go, openLab } = useUI()

  useLayoutEffect(() => {
    const el = sec.current!
    const m = isMobile()
    const c = ctrl.current
    Object.assign(c, { x: 0, y: m ? 0.1 : 0.08, scale: m ? 0.8 : 0.9, spin: 0, tilt: 0 })
    const ctx = gsap.context(() => {
      // intro
      gsap.fromTo(el.querySelectorAll('.hero__line .wi'), { yPercent: 120 }, { yPercent: 0, stagger: 0.07, duration: 1.3, ease: 'expo.out', delay: 0.35 })
      gsap.fromTo(el.querySelector('.hero__kicker'), { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 1, delay: 0.6 })
      gsap.fromTo(el.querySelector('.hero__scroll'), { opacity: 0 }, { opacity: 1, duration: 1, delay: 1.2 })
      gsap.fromTo(c, { scale: c.scale * 0.6, spin: -2.4 }, { scale: c.scale, spin: 0, duration: 2, ease: 'expo.out', delay: 0.2 })

      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: { trigger: el, start: 'top top', end: 'bottom bottom', scrub: 0.9 },
      })
      tl.to(el.querySelector('.hero__head'), { yPercent: -60, opacity: 0, duration: 0.18 }, 0.02)
        .to(el.querySelector('.hero__scroll'), { opacity: 0, duration: 0.05 }, 0)
        .to(el.querySelector('.hero__word'), { xPercent: m ? -35 : -22, duration: 1 }, 0)
        .to(c, { spin: Math.PI * 2, duration: 0.8 }, 0.05)
        .to(c, m ? { y: 0.14, scale: 0.72, duration: 0.2 } : { x: 0.2, scale: 0.95, duration: 0.2 }, 0.05)
      const specs = el.querySelectorAll('.hero__spec')
      specs.forEach((s, i) => {
        const at = 0.2 + i * 0.17
        tl.fromTo(s, { opacity: 0, y: 60 }, { opacity: 1, y: 0, duration: 0.07 }, at)
        if (i < specs.length - 1) tl.to(s, { opacity: m ? 0 : 0.28, y: m ? -40 : 0, duration: 0.07 }, at + 0.15)
      })
      tl.to(c, m ? { y: 0.1, scale: 0.8, duration: 0.15 } : { x: 0.18, scale: 1.02, tilt: 0.06, duration: 0.15 }, 0.8)
      tl.fromTo(el.querySelector('.hero__end'), { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.08 }, 0.82)
    }, el)
    return () => ctx.revert()
  }, [side])

  const words = p.tagline.split(' ')
  const nav = (to: string) => (e: MouseEvent) => go(to, side, { x: e.clientX, y: e.clientY })

  return (
    <section ref={sec} className="hero">
      <div className="hero__sticky">
        <div className="hero__glow" />
        <div className="hero__word" aria-hidden>{side === 'white' ? 'BOTANICAL' : '7-HYDROXY'}</div>
        <BottleStage side={side} flavorId={p.flavors[0].id} control={ctrl} interactive fill={0.66} autoRotate={0.18} className="hero__stage" />
        <div className="hero__head">
          <p className="hero__kicker eyebrow">{side === 'white' ? 'Breeze · Botanical Tablets' : 'Breeze · 7-Hydroxymitragynine'}</p>
          <h1 className="hero__title">
            {words.map((w, i) => (
              <span key={i} className="hero__line"><span className="w"><span className="wi">{w}</span></span> </span>
            ))}
          </h1>
        </div>
        <div className="hero__specs">
          <div className="hero__spec"><b>{p.count}</b><span>Count<small>tablets per bottle</small></span></div>
          <div className="hero__spec"><b>{p.perTablet}<em>mg</em></b><span>Per tablet<small>{side === 'white' ? 'botanical blend' : '7-hydroxymitragynine'}</small></span></div>
          <div className="hero__spec"><b>{p.total.toLocaleString('en-US')}<em>mg</em></b><span>{p.totalLabel}<small>{p.flavors.length} flavors to choose</small></span></div>
        </div>
        <div className="hero__end">
          <span className="price-badge"><span>{p.price.replace(/\.\d+$/, '')}</span><sup>{p.price.split('.')[1]}</sup></span>
          <div className="hero__btns">
            <button className="btn btn--solid" onClick={nav(p.base + '/product')}>View in 3D</button>
            <button className="btn btn--ghost" onClick={openLab}>Lab report</button>
          </div>
        </div>
        <div className="hero__scroll"><span>Scroll</span><i /></div>
        <p className="hero__drag">Drag the bottle</p>
      </div>
    </section>
  )
}

function Marquee({ side }: { side: Side }) {
  const p = products[side]
  const ref = useRef<HTMLDivElement>(null)
  useLayoutEffect(() => {
    const el = ref.current!
    const ctx = gsap.context(() => {
      const track = el.querySelector('.marq__track')!
      const tw = gsap.to(track, { xPercent: -50, duration: 40, ease: 'none', repeat: -1 })
      ScrollTrigger.create({
        trigger: el, start: 'top bottom', end: 'bottom top',
        onUpdate: (s) => {
          const v = s.getVelocity() / 300
          gsap.to(tw, { timeScale: 1 + Math.min(6, Math.abs(v)), duration: 0.2, overwrite: true })
          gsap.to(tw, { timeScale: 1, duration: 1.2, delay: 0.25 })
        },
      })
    }, el)
    return () => ctx.revert()
  }, [side])
  const items = [...p.flavors, ...p.flavors]
  return (
    <div ref={ref} className="marq" aria-hidden>
      <div className="marq__track">
        {[0, 1].map((k) => (
          <div key={k} className="marq__set">
            {items.map((f, i) => (
              <span key={i} className="marq__item">
                <span className="script" style={{ color: f.color }}>{f.name}</span>
                <span className="marq__star">✦</span>
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

function FlavorShowcase({ side }: { side: Side }) {
  const p = products[side]
  const [idx, setIdx] = useState(0)
  const [auto, setAuto] = useState(true)
  const ref = useRef<HTMLElement>(null)
  const ctrl = useRef(makeControl())
  const f = p.flavors[idx]

  useEffect(() => {
    if (!auto) return
    let inView = false
    const io = new IntersectionObserver(([e]) => { inView = e.isIntersecting }, { threshold: 0.4 })
    io.observe(ref.current!)
    const t = setInterval(() => { if (inView && !document.hidden) setIdx((i) => (i + 1) % p.flavors.length) }, 3600)
    return () => { clearInterval(t); io.disconnect() }
  }, [auto, p.flavors.length])

  useEffect(() => {
    const el = ref.current!
    gsap.fromTo(el.querySelector('.fshow__name'), { yPercent: 60, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.9, ease: 'expo.out' })
  }, [idx])

  const pick = (i: number) => { setAuto(false); setIdx(i) }

  return (
    <section ref={ref} className="fshow" style={{ ['--fc' as string]: f.color, ['--ft' as string]: f.tint, ['--fg' as string]: f.glow }}>
      <div className="fshow__bg" />
      <div className="fshow__inner">
        <div className="fshow__copy">
          <p className="eyebrow" data-reveal>Pick your flavor</p>
          <h2 className="h2" data-split>{side === 'white' ? 'Five flavors. One breeze.' : 'Eight flavors. Pure chrome.'}</h2>
          <ul className="fshow__list" role="tablist" aria-label="Flavors">
            {p.flavors.map((fl, i) => (
              <li key={fl.id}>
                <button role="tab" aria-selected={i === idx} className={`fshow__btn ${i === idx ? 'is-on' : ''}`} onClick={() => pick(i)} style={{ ['--c' as string]: fl.color }}>
                  <span className="fshow__dot" />
                  <span className="fshow__label">{fl.name}</span>
                  {i === idx && auto && <span className="fshow__bar" key={idx} />}
                </button>
              </li>
            ))}
          </ul>
        </div>
        <div className="fshow__view">
          <span className="fshow__name script" key={f.id}>{f.name}</span>
          <BottleStage side={side} flavorId={f.id} control={ctrl} interactive fill={0.7} autoRotate={0.3} className="fshow__stage" />
          <span className="fshow__hint">Drag to rotate · tap a flavor</span>
        </div>
      </div>
    </section>
  )
}

function MotionGallery() {
  const ref = useRef<HTMLElement>(null)
  useEffect(() => {
    const vids = Array.from(ref.current!.querySelectorAll('video'))
    const io = new IntersectionObserver((ents) => ents.forEach((e) => {
      const v = e.target as HTMLVideoElement
      if (e.isIntersecting) v.play().catch(() => {})
      else v.pause()
    }), { threshold: 0.25 })
    vids.forEach((v) => io.observe(v))
    return () => io.disconnect()
  }, [])
  return (
    <section ref={ref} className="motion">
      <div className="motion__head">
        <p className="eyebrow" data-reveal>Breeze in motion</p>
        <h2 className="h2" data-split>Cool, light, and always in season.</h2>
      </div>
      <div className="motion__row">
        {[1, 2, 3].map((n, i) => (
          <figure key={n} className={`motion__card motion__card--${i}`} data-reveal data-delay={i * 0.1}>
            <video src={`/video/breeze-${n}.mp4`} poster={`/video/breeze-${n}.jpg`} muted loop playsInline preload="metadata" />
          </figure>
        ))}
      </div>
    </section>
  )
}

function Campaign() {
  return (
    <section className="campaign">
      <div className="campaign__head">
        <p className="eyebrow" data-reveal>The campaign</p>
        <h2 className="h2" data-split>Made to be seen.</h2>
      </div>
      <div className="campaign__grid">
        {['boxes', 'cablecar', 'cart'].map((n, i) => (
          <div key={n} className={`campaign__card campaign__card--${i}`} data-tilt data-reveal data-delay={i * 0.08}>
            <img src={`/img/poster-${n}.webp`} alt="Breeze Botanical Tablets campaign artwork" loading="lazy" />
            <span className="campaign__shine" />
          </div>
        ))}
      </div>
    </section>
  )
}

function Lineup() {
  const p = products.black
  const ref = useRef<HTMLElement>(null)
  useLayoutEffect(() => {
    if (isMobile()) return
    const el = ref.current!
    const ctx = gsap.context(() => {
      const track = el.querySelector<HTMLElement>('.lineup__track')!
      gsap.to(track, {
        x: () => -(track.scrollWidth - window.innerWidth + 64),
        ease: 'none',
        scrollTrigger: { trigger: el, start: 'top top', end: () => `+=${track.scrollWidth}`, pin: el.querySelector('.lineup__pin'), scrub: 0.8, invalidateOnRefresh: true },
      })
    }, el)
    return () => ctx.revert()
  }, [])
  return (
    <section ref={ref} className="lineup">
      <div className="lineup__pin">
        <div className="lineup__head">
          <p className="eyebrow">The lineup</p>
          <h2 className="h2">Eight shades of dark.</h2>
        </div>
        <div className="lineup__track">
          {p.flavors.map((f, i) => (
            <figure key={f.id} className="lineup__card" style={{ ['--c' as string]: f.glow }} data-tilt>
              <span className="lineup__num">0{i + 1}</span>
              <img src={photoUrl('black', f.id)} alt={`Breeze 7-OH ${f.name}`} loading="lazy" />
              <figcaption><span className="script">{f.name}</span><small>10 ct · 200mg</small></figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  )
}

function LabTeaser({ side }: { side: Side }) {
  const { openLab } = useUI()
  return (
    <section className="labt">
      <div className="labt__card" data-reveal>
        <div className="labt__grid" aria-hidden>
          {Array.from({ length: 24 }).map((_, i) => <i key={i} />)}
        </div>
        <div className="labt__copy">
          <p className="eyebrow">Transparency</p>
          <h2 className="h2">Tested. Batch by batch.</h2>
          <p className="lead">Every flavor will have its own third-party certificate of analysis — published right here, scannable from the QR on every label.</p>
          <button className="btn btn--solid" onClick={openLab}>See lab reports</button>
        </div>
        <Logo variant={side === 'black' ? 'silver' : 'navy'} className="labt__logo" />
      </div>
    </section>
  )
}
