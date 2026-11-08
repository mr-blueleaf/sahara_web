export function initCursor(): () => void {
  const root = document.documentElement
  const glow = document.createElement('div')
  glow.className = 'cur-glow'
  glow.setAttribute('aria-hidden', 'true')
  document.body.prepend(glow)
  root.classList.add('has-cursor')

  let mx = innerWidth / 2, my = innerHeight / 2, gx = mx, gy = my
  let raf = 0
  let last = performance.now()
  const loop = (now: number) => {
    const dt = Math.min((now - last) / 1000, 0.05)
    last = now
    const k = 1 - Math.exp(-dt / 0.16)
    gx += (mx - gx) * k
    gy += (my - gy) * k
    glow.style.transform = `translate3d(${gx}px, ${gy}px, 0)`
    raf = Math.abs(mx - gx) + Math.abs(my - gy) > 0.5 ? requestAnimationFrame(loop) : 0
  }
  const move = (e: PointerEvent) => {
    if (e.pointerType !== 'mouse') return
    mx = e.clientX
    my = e.clientY
    glow.classList.add('on')
    if (!raf) {
      last = performance.now()
      raf = requestAnimationFrame(loop)
    }
  }
  const click = (e: PointerEvent) => {
    if (e.pointerType !== 'mouse') return
    const r = document.createElement('span')
    r.className = 'cur-ripple'
    r.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`
    document.body.append(r)
    r.addEventListener('animationend', () => r.remove(), { once: true })
  }
  const leave = () => glow.classList.remove('on')

  addEventListener('pointermove', move, { passive: true })
  addEventListener('pointerdown', click, { passive: true })
  document.addEventListener('mouseleave', leave)
  return () => {
    cancelAnimationFrame(raf)
    removeEventListener('pointermove', move)
    removeEventListener('pointerdown', click)
    document.removeEventListener('mouseleave', leave)
    root.classList.remove('has-cursor')
    glow.remove()
  }
}
