import { useLayoutEffect, useRef } from 'react'
import { coaLab, coas, coaUrl, products, type Side } from '../data'
import { useReveals, useTilt } from '../lib/hooks'
import { gsap } from '../lib/smooth'
import { useUI } from '../components/UI'

export default function LabReports({ side }: { side: Side }) {
  const p = products[side]
  const root = useRef<HTMLDivElement>(null)
  const { openLab } = useUI()
  useReveals(root, [side])
  useTilt(root)

  useLayoutEffect(() => {
    const el = root.current!
    const ctx = gsap.context(() => {
      gsap.fromTo(el.querySelectorAll('.labs__hero .wi'), { yPercent: 120 }, { yPercent: 0, stagger: 0.06, duration: 1.3, ease: 'expo.out', delay: 0.3 })
    }, el)
    return () => ctx.revert()
  }, [side])

  return (
    <div ref={root} className="labs">
      <section className="labs__hero">
        <p className="eyebrow">Lab reports · Certificates of analysis</p>
        <h1 className="display">
          <span className="w"><span className="wi">Tested.</span></span>{' '}
          <span className="w"><span className="wi accent-word">Published.</span></span>
        </h1>
        <p className="lead" data-reveal>
          Every {p.name} flavor was tested by {coaLab.name}, an {coaLab.accreditation.split(' · ')[0]} accredited lab. Tap any flavor to read its full certificate or download the PDF.
        </p>
        <div className="labs__facts" data-reveal>
          <div><b>{p.flavors.length}</b><span>Flavors tested</span></div>
          <div><b>{coaLab.reported.split(',')[0]}</b><span>Reported {coaLab.reported.split(', ')[1]}</span></div>
          <div><b>HPLC</b><span>Kratom alkaloid panel</span></div>
        </div>
      </section>

      <section className="labs__grid">
        {p.flavors.map((f, i) => {
          const c = coas[side][f.id]
          return (
            <button key={f.id} className="labs__card" style={{ ['--c' as string]: f.color }} onClick={() => openLab(f.id, side)} data-reveal data-delay={(i % 3) * 0.06} data-tilt>
              <span className="labs__thumb"><img src={coaUrl(side, f.id, 'thumb')} alt="" loading="lazy" /></span>
              <span className="labs__body">
                <span className="labs__name script">{f.name}</span>
                <span className="labs__res">
                  <b>{c.result === 'ND' ? 'Not detected' : c.result}</b>
                  <small>{c.result === 'ND' ? 'Kratom alkaloid panel' : c.detail}</small>
                </span>
                <span className="labs__row"><small>Sample {c.sampleId}</small><span className="labs__view">View report →</span></span>
              </span>
            </button>
          )
        })}
      </section>
    </div>
  )
}
