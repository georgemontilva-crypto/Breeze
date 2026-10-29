# Breeze — Two sides. One Breeze.

Brand site for Breeze tablets with two worlds:

- `/` — portal: split screen, light (Botanical Tablets) vs dark (7-OH). Drag/hover moves the divider.
- `/botanical/*` — white site: Home, About Us, Product (3D viewer), Contact.
- `/7oh/*` — black site: Home, About Us, Product (3D viewer), Contact.
- "Lab Report" opens a *Coming soon* overlay (also `/botanical/lab-report`, `/7oh/lab-report`).
- 21+ age gate on first visit.

The 3D bottle is procedural (Three.js) and wraps the real label artwork (`public/labels`).
The logo (`public/logo.svg`) is the vector extracted from the label files.

## Stack
React 18 + Vite + TypeScript, Three.js, GSAP ScrollTrigger + Lenis. Express serves `dist/` and `/api/contact`.

## Run
```bash
npm install
npm run dev          # http://localhost:5173 (contact API needs `npm start` in another terminal)
npm run build
npm start            # serves dist on $PORT (default 3000)
```

## Environment variables (contact form, via Resend)
| Var | Example |
|---|---|
| `RESEND_API_KEY` | `re_xxx` |
| `CONTACT_TO` | `info@yourdomain.com` (comma separated allowed) |
| `CONTACT_FROM` | `Breeze <web@yourdomain.com>` (verified domain in Resend) |

Without them the form shows a friendly "not configured yet" error; everything else works.

## Railway
Build: `npm run build` · Start: `npm start`. No database needed.
