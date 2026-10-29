import { Fragment, useLayoutEffect, useRef, type MouseEvent } from 'react'
import { photoUrl, products, type Side } from '../data'
import { useReveals, useTilt } from '../lib/hooks'
import { gsap } from '../lib/smooth'
import { useUI } from '../components/UI'

export default function About({ side }: { side: Side }) {
  const root = useRef<HTMLDivElement>(null)
  const { go } = useUI()
  useReveals(root, [side])
  useTilt(root)
  const p = products[side]

  useLayoutEffect(() => {
    const el = root.current!
    const ctx = gsap.context(() => {
      gsap.fromTo(el.querySelectorAll('.about__hero .wi'), { yPercent: 120 }, { yPercent: 0, stagger: 0.06, duration: 1.3, ease: 'expo.out', delay: 0.3 })
      gsap.to(el.querySelector('.about__halves'), {
        '--open': 1,
        ease: 'none',
        scrollTrigger: { trigger: el.querySelector('.about__duo'), start: 'top 85%', end: 'center center', scrub: true },
      })
    }, el)
    return () => ctx.revert()
  }, [side])

  const nav = (to: string, s: Side) => (e: MouseEvent) => { e.preventDefault(); go(to, s, { x: e.clientX, y: e.clientY }) }
  const title = ['Two', 'sides.', 'One', 'Breeze.']

  return (
    <div ref={root} className="about">
      <section className="about__hero">
        <p className="eyebrow">About us</p>
        <h1 className="display">
          {title.map((w, i) => <Fragment key={i}><span className="w"><span className={`wi ${i === 3 ? 'accent-word' : ''}`}>{w}</span></span>{' '}</Fragment>)}
        </h1>
        <p className="lead about__lead" data-reveal>
          Breeze is a tablet brand built around contrast — a light side and a dark side, each with its own personality, its own flavors and its own look. Same obsession with detail on both.
        </p>
      </section>

      <section className="statement">
        <p className="statement__txt" data-fill>
          We started with a simple idea: a product people actually want to hold. So we designed every bottle like a collectible — chrome lettering, liquid color, flavor names written by hand — and we test every batch before it leaves.
        </p>
      </section>

      <section className="about__duo">
        <div className="about__halves">
          <a href="/botanical" onClick={nav('/botanical', 'white')} className="about__half about__half--w" data-tilt>
            <img src={photoUrl('white', 'bluerazz')} alt="Breeze Botanical Tablets Blue Razz" loading="lazy" />
            <div>
              <span className="eyebrow">The light side</span>
              <h3>Botanical Tablets</h3>
              <p>Five fruit-forward flavors in soft watercolor whites. 10 count · 150mg per tablet · 1500mg total.</p>
              <span className="link-arrow">Explore light →</span>
            </div>
          </a>
          <a href="/7oh" onClick={nav('/7oh', 'black')} className="about__half about__half--b" data-tilt>
            <img src={photoUrl('black', 'original')} alt="Breeze 7-OH Original" loading="lazy" />
            <div>
              <span className="eyebrow">The dark side</span>
              <h3>7-OH Tablets</h3>
              <p>Eight flavors in black, chrome and liquid color. 10 count · 200mg per tablet · 2000mg per bottle.</p>
              <span className="link-arrow">Explore dark →</span>
            </div>
          </a>
        </div>
      </section>

      <section className="values">
        <p className="eyebrow" data-reveal>What we stand for</p>
        <div className="values__grid">
          {[
            { n: '01', t: 'Flavor first', d: 'From Blue Razz to Cotton Candy — every flavor is developed to taste like its name.' },
            { n: '02', t: 'Batch tested', d: 'Third-party certificates of analysis for every flavor, linked from the QR code on the label.' },
            { n: '03', t: 'Adults only', d: 'Sold exclusively to adults 21+. Clear labeling, honest serving information, no shortcuts.' },
          ].map((v, i) => (
            <article key={v.n} className="values__card" data-reveal data-delay={i * 0.08} data-tilt>
              <span className="values__n">{v.n}</span>
              <h3>{v.t}</h3>
              <p>{v.d}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="numbers">
        <div className="numbers__item" data-reveal><b data-count="13">0</b><span>Flavors across both lines</span></div>
        <div className="numbers__item" data-reveal data-delay="0.08"><b data-count="2">0</b><span>Sides, one brand</span></div>
        <div className="numbers__item" data-reveal data-delay="0.16"><b><span data-count="21">0</span>+</b><span>Adults only, always</span></div>
      </section>

      {side === 'white' ? (
        <section className="about__film">
          <video src="/video/breeze-2.mp4" poster="/video/breeze-2.jpg" muted loop playsInline autoPlay preload="metadata" data-par="6" />
          <div className="about__filmCopy">
            <p className="eyebrow">{p.name}</p>
            <h2 className="h2" data-split>Light enough to carry anywhere.</h2>
          </div>
        </section>
      ) : (
        <section className="about__film about__film--dark">
          <img src="/labels/black-original.webp" alt="" aria-hidden data-par="6" />
          <div className="about__filmCopy">
            <p className="eyebrow">{p.name}</p>
            <h2 className="h2" data-split>Wrapped in chrome. Made for the night.</h2>
          </div>
        </section>
      )}
    </div>
  )
}
