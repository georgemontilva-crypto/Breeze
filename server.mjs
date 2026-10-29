// Production server: serves the built SPA and the contact endpoint.
// Env vars: PORT (Railway sets it), RESEND_API_KEY, CONTACT_TO, CONTACT_FROM
import express from 'express'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const dist = path.join(__dirname, 'dist')
const app = express()
app.disable('x-powered-by')
app.use(express.json({ limit: '32kb' }))

const esc = (s = '') => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]))

// naive in-memory rate limit: 5 messages / 10 min per IP
const hits = new Map()
const limited = (ip) => {
  const now = Date.now()
  const arr = (hits.get(ip) || []).filter((t) => now - t < 600000)
  arr.push(now)
  hits.set(ip, arr)
  return arr.length > 5
}

app.post('/api/contact', async (req, res) => {
  const { name, email, company, state, message, topic, line, website } = req.body || {}
  if (website) return res.json({ ok: true })
  if (!name || !email || !message || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email))) {
    return res.status(400).json({ ok: false, error: 'Please fill in your name, a valid email and a message.' })
  }
  const ip = req.headers['x-forwarded-for']?.toString().split(',')[0].trim() || req.socket.remoteAddress || ''
  if (limited(ip)) return res.status(429).json({ ok: false, error: 'Too many messages. Please try again later.' })

  const key = process.env.RESEND_API_KEY
  const to = process.env.CONTACT_TO
  const from = process.env.CONTACT_FROM || 'Breeze Website <onboarding@resend.dev>'
  if (!key || !to) {
    console.warn('[contact] RESEND_API_KEY / CONTACT_TO not configured. Message:', { name, email, topic })
    return res.status(503).json({ ok: false, error: 'Contact form is not configured yet. Please try again later.' })
  }
  const html = `
    <h2>New Breeze inquiry — ${esc(topic)}</h2>
    <p><b>Line:</b> ${esc(line)}</p>
    <p><b>Name:</b> ${esc(name)}<br><b>Email:</b> ${esc(email)}<br><b>Company:</b> ${esc(company)}<br><b>State:</b> ${esc(state)}</p>
    <p style="white-space:pre-wrap">${esc(message)}</p>`
  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from, to: to.split(',').map((s) => s.trim()), reply_to: email, subject: `Breeze — ${topic || 'Contact'} from ${name}`, html }),
    })
    if (!r.ok) {
      console.error('[contact] resend error', r.status, await r.text())
      return res.status(502).json({ ok: false, error: 'Could not send your message. Please try again.' })
    }
    res.json({ ok: true })
  } catch (e) {
    console.error('[contact]', e)
    res.status(500).json({ ok: false, error: 'Could not send your message. Please try again.' })
  }
})

app.use('/assets', express.static(path.join(dist, 'assets'), { immutable: true, maxAge: '1y' }))
app.use(express.static(dist, { maxAge: '7d', index: false }))
app.get('*', (_req, res) => {
  res.set('Cache-Control', 'no-cache, no-store, must-revalidate')
  res.sendFile(path.join(dist, 'index.html'))
})

const port = process.env.PORT || 3000
app.listen(port, () => console.log(`Breeze running on :${port}`))
