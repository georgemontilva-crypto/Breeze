import { useRef, useState, type FormEvent } from 'react'
import { products, type Side } from '../data'
import { useReveals } from '../lib/hooks'

type Status = 'idle' | 'sending' | 'ok' | 'error'

export default function Contact({ side }: { side: Side }) {
  const root = useRef<HTMLDivElement>(null)
  useReveals(root, [side])
  const [status, setStatus] = useState<Status>('idle')
  const [err, setErr] = useState('')
  const [topic, setTopic] = useState('Wholesale')

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const body = Object.fromEntries(fd.entries())
    if (body.website) return // honeypot
    setStatus('sending')
    setErr('')
    try {
      const r = await fetch('/api/contact', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...body, topic, line: products[side].name }) })
      const j = await r.json().catch(() => ({}))
      if (!r.ok || !j.ok) throw new Error(j.error || 'Could not send your message.')
      setStatus('ok')
    } catch (x) {
      setErr((x as Error).message)
      setStatus('error')
    }
  }

  return (
    <div ref={root} className="contact">
      <section className="contact__wrap">
        <div className="contact__copy">
          <p className="eyebrow">Contact</p>
          <h1 className="display" data-split>Let's talk.</h1>
          <p className="lead" data-reveal>Retailers, distributors and curious minds — drop us a line and the Breeze team will get back to you.</p>
          <div className="contact__cards">
            {[
              { t: 'Wholesale', d: 'Bulk pricing and distribution for smoke shops and retailers.' },
              { t: 'Retail partners', d: 'Display kits and point-of-sale material for both lines.' },
              { t: 'General', d: 'Questions about flavors, labels or lab reports.' },
            ].map((c, i) => (
              <button key={c.t} type="button" className={`contact__card ${topic === c.t ? 'is-on' : ''}`} onClick={() => setTopic(c.t)} data-reveal data-delay={i * 0.06}>
                <b>{c.t}</b><span>{c.d}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="contact__formWrap" data-reveal>
          {status === 'ok' ? (
            <div className="contact__ok">
              <svg viewBox="0 0 52 52" width="64" height="64"><circle cx="26" cy="26" r="24" fill="none" stroke="currentColor" strokeWidth="2" /><path d="M15 27l7 7 15-16" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" /></svg>
              <h2 className="h2">Message sent.</h2>
              <p className="lead">Thanks — we'll be in touch shortly.</p>
              <button className="btn btn--ghost" onClick={() => setStatus('idle')}>Send another</button>
            </div>
          ) : (
            <form className="form" onSubmit={submit} noValidate={false}>
              <div className="form__topic">Topic: <b>{topic}</b></div>
              <label className="field"><input name="name" required placeholder=" " autoComplete="name" maxLength={120} /><span>Full name</span></label>
              <label className="field"><input name="email" type="email" required placeholder=" " autoComplete="email" maxLength={160} /><span>Email</span></label>
              <div className="form__row">
                <label className="field"><input name="company" placeholder=" " autoComplete="organization" maxLength={160} /><span>Company / store</span></label>
                <label className="field"><input name="state" placeholder=" " autoComplete="address-level1" maxLength={60} /><span>State</span></label>
              </div>
              <label className="field field--area"><textarea name="message" required rows={5} placeholder=" " maxLength={4000} /><span>Message</span></label>
              <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hp" aria-hidden />
              <label className="check"><input type="checkbox" required /> <span>I confirm I am 21 years of age or older.</span></label>
              {status === 'error' && <p className="form__err" role="alert">{err}</p>}
              <button className="btn btn--solid btn--wide" disabled={status === 'sending'}>{status === 'sending' ? 'Sending…' : 'Send message'}</button>
            </form>
          )}
        </div>
      </section>
    </div>
  )
}
