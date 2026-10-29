import { useEffect, useLayoutEffect, type RefObject } from 'react'
import { gsap, ScrollTrigger } from './smooth'

export const isMobile = () => window.matchMedia('(max-width: 760px)').matches

/** Generic scroll reveals for [data-reveal] (fade-up), [data-split] (line/word rise) and [data-par] (parallax). */
export function useReveals(scope: RefObject<HTMLElement>, deps: unknown[] = []) {
  useLayoutEffect(() => {
    const root = scope.current
    if (!root) return
    const ctx = gsap.context(() => {
      root.querySelectorAll<HTMLElement>('[data-split]').forEach((el) => {
        if (!el.dataset.splitDone) {
          const words = (el.textContent ?? '').trim().split(/\s+/)
          el.innerHTML = words.map((w) => `<span class="w"><span class="wi">${w}</span></span>`).join(' ')
          el.dataset.splitDone = '1'
        }
        gsap.fromTo(el.querySelectorAll('.wi'), { yPercent: 115 }, {
          yPercent: 0, duration: 1.1, ease: 'expo.out', stagger: 0.05,
          scrollTrigger: { trigger: el, start: 'top 88%' },
        })
      })
      root.querySelectorAll<HTMLElement>('[data-reveal]').forEach((el) => {
        gsap.fromTo(el, { y: 50, opacity: 0 }, {
          y: 0, opacity: 1, duration: 1.1, ease: 'expo.out', delay: Number(el.dataset.delay ?? 0),
          scrollTrigger: { trigger: el, start: 'top 90%' },
        })
      })
      root.querySelectorAll<HTMLElement>('[data-par]').forEach((el) => {
        const amt = Number(el.dataset.par ?? 15)
        gsap.fromTo(el, { yPercent: -amt }, {
          yPercent: amt, ease: 'none',
          scrollTrigger: { trigger: el.parentElement ?? el, start: 'top bottom', end: 'bottom top', scrub: true },
        })
      })
      root.querySelectorAll<HTMLElement>('[data-fill]').forEach((el) => {
        if (!el.dataset.splitDone) {
          const words = (el.textContent ?? '').trim().split(/\s+/)
          el.innerHTML = words.map((w) => `<span class="fw">${w}</span>`).join(' ')
          el.dataset.splitDone = '1'
        }
        gsap.fromTo(el.querySelectorAll('.fw'), { opacity: 0.14 }, {
          opacity: 1, stagger: 0.1, ease: 'none',
          scrollTrigger: { trigger: el, start: 'top 80%', end: 'bottom 45%', scrub: true },
        })
      })
      root.querySelectorAll<HTMLElement>('[data-count]').forEach((el) => {
        const to = Number(el.dataset.count)
        const o = { v: 0 }
        gsap.to(o, {
          v: to, duration: 1.6, ease: 'power3.out',
          scrollTrigger: { trigger: el, start: 'top 90%' },
          onUpdate: () => { el.textContent = Math.round(o.v).toLocaleString('en-US') },
        })
      })
    }, root)
    requestAnimationFrame(() => ScrollTrigger.refresh())
    let t = 0
    const onImg = () => { clearTimeout(t); t = window.setTimeout(() => ScrollTrigger.refresh(), 120) }
    const imgs = Array.from(root.querySelectorAll('img')).filter((i) => !i.complete)
    imgs.forEach((i) => i.addEventListener('load', onImg, { once: true }))
    return () => { clearTimeout(t); imgs.forEach((i) => i.removeEventListener('load', onImg)); ctx.revert() }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
}

/** Subtle 3D tilt toward the pointer for cards. */
export function useTilt(scope: RefObject<HTMLElement>, selector = '[data-tilt]') {
  useEffect(() => {
    const root = scope.current
    if (!root || isMobile()) return
    const els = Array.from(root.querySelectorAll<HTMLElement>(selector))
    const handlers = els.map((el) => {
      const move = (e: PointerEvent) => {
        const r = el.getBoundingClientRect()
        const x = (e.clientX - r.left) / r.width - 0.5
        const y = (e.clientY - r.top) / r.height - 0.5
        el.style.transform = `perspective(900px) rotateY(${x * 10}deg) rotateX(${-y * 10}deg) translateZ(0)`
        el.style.setProperty('--mx', `${(x + 0.5) * 100}%`)
        el.style.setProperty('--my', `${(y + 0.5) * 100}%`)
      }
      const leave = () => { el.style.transform = '' }
      el.addEventListener('pointermove', move)
      el.addEventListener('pointerleave', leave)
      return () => { el.removeEventListener('pointermove', move); el.removeEventListener('pointerleave', leave) }
    })
    return () => handlers.forEach((h) => h())
  }, [scope, selector])
}
