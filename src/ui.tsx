import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react'


export function Split({ text, as: Tag = 'span', className = '', delay = 0 }: { text: string; as?: 'span' | 'h1' | 'h2' | 'h3' | 'p'; className?: string; delay?: number }) {
  const words = text.split(' ')
  return (
    <Tag className={`split ${className}`} aria-label={text}>
      {words.map((w, i) => (
        <span key={i}>
          <span className="w" aria-hidden="true">
            <span style={{ transitionDelay: `${delay + i * 55}ms`, ['--i' as string]: i }}>{w}</span>
          </span>{i < words.length - 1 ? ' ' : ''}
        </span>
      ))}
    </Tag>
  )
}


export function Odometer({ value, prefix = '', suffix = '' }: { value: number; prefix?: string; suffix?: string }) {
  const chars = value.toLocaleString('en-IN').split('')
  return (
    <span className="odo" aria-label={`${prefix}${value.toLocaleString('en-IN')}${suffix}`}>
      <span aria-hidden="true">{prefix}</span>
      {chars.map((c, i) =>
        /\d/.test(c) ? (
          <span className="odo-col" aria-hidden="true" key={i}>
            <span className="odo-strip" style={{ ['--d' as string]: c, transitionDelay: `${i * 90}ms` }}>
              {'0123456789'.split('').map((n) => (
                <span key={n}>{n}</span>
              ))}
            </span>
          </span>
        ) : (
          <span aria-hidden="true" key={i}>{c}</span>
        ),
      )}
      <span aria-hidden="true">{suffix}</span>
    </span>
  )
}


export function Modal({ open, onClose, children, className = '', label }: { open: boolean; onClose: () => void; children: ReactNode; className?: string; label: string }) {
  const ref = useRef<HTMLDialogElement>(null)
  useEffect(() => {
    const d = ref.current
    if (!d) return
    if (open && !d.open) d.showModal()
    if (!open && d.open) d.close()
    if (!open) return

    const html = document.documentElement
    html.style.overflow = 'hidden'
    return () => { html.style.overflow = '' }
  }, [open])
  return (
    <dialog
      ref={ref}
      className={`modal ${className}`}
      aria-label={label}
      onClose={onClose}
      onClick={(e) => e.target === ref.current && onClose()}
    >
      <button className="modal-x" onClick={onClose} aria-label="Close">
        ✕
      </button>
      {open && children}
    </dialog>
  )
}

export const Arrow = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
    <path d="M3 11 11 3M5 3h6v6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
)


export function useGlowTrail(container: React.RefObject<HTMLElement | null>, active: string) {
  const prev = useRef<{ x: number; w: number } | null>(null)
  const [s, setS] = useState({ x: 0, w: 0, px: 0, pw: 0, tx: 0, tw: 0, dir: 'r', key: 0, on: false })
  useLayoutEffect(() => {
    const c = container.current
    const el = c?.querySelector<HTMLElement>(`[data-id="${active}"]`)
    if (!c || !el) return setS((v) => ({ ...v, on: false }))
    const x = el.offsetLeft, w = el.offsetWidth
    const p = prev.current ?? { x, w }
    prev.current = { x, w }
    setS((v) => ({ x, w, px: p.x, pw: p.w, tx: Math.min(p.x, x), tw: Math.abs(x - p.x) + w, dir: x >= p.x ? 'r' : 'l', key: v.key + 1, on: true }))
  }, [active, container])
  return s
}

export function GlowTrail({ s, className = '' }: { s: ReturnType<typeof useGlowTrail>; className?: string }) {
  if (!s.on) return null
  return (
    <>
      <span key={s.key} className={`trail-tail ${className} dir-${s.dir}`} style={{ left: s.tx, width: s.tw }} aria-hidden="true" />
      <span className={`trail-ind ${className}`} style={{ left: s.x, width: s.w }} aria-hidden="true" />
    </>
  )
}


export function ElasticString({ count, active, onPick, labels }: { count: number; active: number; onPick: (i: number) => void; labels: string[] }) {
  const path = useRef<SVGPathElement>(null)
  const bead = useRef<SVGCircleElement>(null)
  const st = useRef({ x: 0, vx: 0, amp: 0, va: 0, raf: 0, init: false })
  const W = 300, Y = 16
  const L = 10, R = W - 10
  const xs = Array.from({ length: count }, (_, i) => L + (i * (R - L)) / (count - 1))
  useEffect(() => {
    const s = st.current
    const tx = xs[active]
    if (!s.init) { s.x = tx; s.init = true } else { s.va += (tx > s.x ? 1 : -1) * 90 }
    cancelAnimationFrame(s.raf)
    let last = performance.now()
    const tick = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.033)
      last = now
      s.vx += ((tx - s.x) * 120 - s.vx * 16) * dt
      s.x += s.vx * dt
      s.va += (-s.amp * 260 - s.va * 7) * dt
      s.amp += s.va * dt
      path.current?.setAttribute('d', `M${L} ${Y} Q ${(L + s.x) / 2} ${Y + s.amp * 1.1} ${s.x} ${Y + s.amp} Q ${(s.x + R) / 2} ${Y + s.amp * 0.9} ${R} ${Y}`)
      bead.current?.setAttribute('cx', String(s.x))
      bead.current?.setAttribute('cy', String(Y + s.amp))
      if (Math.abs(tx - s.x) + Math.abs(s.vx) + Math.abs(s.amp) + Math.abs(s.va) > 0.05) s.raf = requestAnimationFrame(tick)
    }
    s.raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(s.raf)

  }, [active, count])
  return (
    <svg className="estring" viewBox={`0 0 ${W} 32`} role="group" aria-label="Choose an event">
      <path ref={path} d={`M${L} ${Y} L${R} ${Y}`} className="estring-line" />
      {xs.map((x, i) => (
        <g key={i} className={`estring-stop ${i === active ? 'on' : ''}`} onClick={() => onPick(i)} role="button" tabIndex={0} aria-label={labels[i]}
          onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onPick(i)}>
          <rect x={x - 14} y={0} width={28} height={32} fill="transparent" />
          <circle cx={x} cy={Y} r={3} />
        </g>
      ))}
      <circle ref={bead} r={7} cx={xs[active]} cy={Y} className="estring-bead" />
    </svg>
  )
}


export function SlotReel({ index, faces }: { index: number; faces: ReactNode[] }) {
  return (
    <span className="reel" aria-hidden="true">
      <span className="reel-strip" style={{ transform: `translateY(${-index * 100}%)` }}>
        {faces.map((f, i) => <span key={i}>{f}</span>)}
      </span>
    </span>
  )
}


export function ParticleGather({ s }: { s: ReturnType<typeof useGlowTrail> }) {
  const cv = useRef<HTMLCanvasElement>(null)
  const [flying, setFlying] = useState(false)
  useEffect(() => {
    const c = cv.current
    if (!c || !s.on || (s.px === s.x && s.pw === s.w)) return
    const host = c.parentElement!
    const PAD = 44
    const dpr = Math.min(devicePixelRatio, 2)
    const W = host.offsetWidth, H = host.offsetHeight + PAD * 2
    c.width = W * dpr
    c.height = H * dpr
    const ctx = c.getContext('2d')!
    ctx.scale(dpr, dpr)
    const h = host.offsetHeight
    const inPill = (x: number, w: number) => {

      const r = h / 2
      for (;;) {
        const px = x + Math.random() * w, py = Math.random() * h
        const cx = Math.min(Math.max(px, x + r), x + w - r)
        if (Math.hypot(px - cx, py - r) <= r) return [px, py + PAD]
      }
    }
    const up = Math.random() < 0.5 ? -1 : 1
    const N = 70
    const ps = Array.from({ length: N }, () => {
      const [sx, sy] = inPill(s.px, s.pw)
      const [ex, ey] = inPill(s.x, s.w)
      return {
        sx, sy, ex, ey,
        cx: (sx + ex) / 2 + (Math.random() - 0.5) * 60,
        cy: (sy + ey) / 2 + up * (18 + Math.random() * 34),
        d: Math.random() * 0.28,
        r: 1.2 + Math.random() * 1.8,
        hue: Math.random(),
      }
    })
    setFlying(true)
    const DUR = 0.78
    const t0 = performance.now()
    let raf = 0
    const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)
    const tick = (now: number) => {
      const el = (now - t0) / 1000
      ctx.clearRect(0, 0, W, H)
      ctx.globalCompositeOperation = 'lighter'
      for (const p of ps) {
        const t = Math.min(Math.max((el - p.d) / DUR, 0), 1)
        const e = ease(t), u = 1 - e
        const x = u * u * p.sx + 2 * u * e * p.cx + e * e * p.ex
        const y = u * u * p.sy + 2 * u * e * p.cy + e * e * p.ey
        const burst = Math.sin(Math.PI * t)
        const a = t >= 1 ? Math.max(0, 1 - (el - p.d - DUR) / 0.18) : 1
        const col = p.hue < 0.6 ? '247,160,60' : '255,214,140'
        ctx.fillStyle = `rgba(${col},${0.07 * a})`
        ctx.beginPath(); ctx.arc(x, y, p.r * (2.6 + burst * 2), 0, 7); ctx.fill()
        ctx.fillStyle = `rgba(${col},${0.75 * a})`
        ctx.beginPath(); ctx.arc(x, y, p.r * (0.8 + burst * 0.6), 0, 7); ctx.fill()
      }
      if (el > 0.5 + DUR * 0.6) setFlying(false)
      if (el < 0.28 + DUR + 0.2) raf = requestAnimationFrame(tick)
      else ctx.clearRect(0, 0, W, H)
    }
    raf = requestAnimationFrame(tick)
    return () => { cancelAnimationFrame(raf); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, c.width, c.height) }

  }, [s.key])
  if (!s.on) return null
  return (
    <>
      <canvas ref={cv} className="pg-canvas" aria-hidden="true" />
      <span className={`trail-ind pg-pill ${flying ? 'gone' : ''}`} style={{ left: s.x, width: s.w }} aria-hidden="true" />
    </>
  )
}
