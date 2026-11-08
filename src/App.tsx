import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { createScene } from './three/scene'
import { store } from './lib/store'
import { build } from './lib/build'
import { initCursor } from './cursor'
import { EVENTS, LINKS, NAV } from './data'
import { About, Contact, Events, Footer, Gallery, Hero, Team } from './sections'
import { Arrow, ParticleGather, SlotReel, useGlowTrail } from './ui'

gsap.registerPlugin(ScrollTrigger)

const ic = (d: string) => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={d} /></svg>
)
const ICONS: Record<string, React.ReactNode> = {
  about: ic('M12 21s-7-4.4-9.3-9A5.4 5.4 0 0 1 12 6a5.4 5.4 0 0 1 9.3 6c-2.3 4.6-9.3 9-9.3 9z'),
  events: ic('M4 6h16v14H4zM4 10h16M8 3v4M16 3v4'),
  team: ic('M9 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7zM2.5 20a6.5 6.5 0 0 1 13 0M16 4.5a3.5 3.5 0 0 1 0 6.5M18 14a6 6 0 0 1 3.5 6'),
  gallery: ic('M4 5h16v14H4zM4 15l5-5 4 4 3-3 4 4M15 9h.01'),
  contact: ic('M4 6h16v12H4zM4 7l8 6 8-6'),
}

const THEME_KEY = 'sahara-theme-v1'
const readTheme = () => {
  try {
    return localStorage.getItem(THEME_KEY) === 'dark' ? 'dark' : 'light'
  } catch {
    return 'light'
  }
}

export default function App() {
  const sceneHost = useRef<HTMLDivElement>(null)
  const navRef = useRef<HTMLElement>(null)
  const tabRef = useRef<HTMLElement>(null)
  const [active, setActive] = useState(0)
  const [nav, setNav] = useState('')
  const [menu, setMenu] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [theme, setTheme] = useState<'light' | 'dark'>(readTheme)

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    try {
      localStorage.setItem(THEME_KEY, theme)
    } catch {  }
  }, [theme])

  useEffect(() => (matchMedia('(pointer: fine)').matches ? initCursor() : undefined), [])

  useEffect(() => {
    const host = sceneHost.current
    if (!host) return
    let dispose: (() => void) | undefined
    try {
      dispose = createScene(host)
    } catch (err) {
      console.warn('WebGL unavailable, showing the CSS sky only', err)
    }
    let lit: HTMLElement | null = null
    let mag: HTMLElement | null = null
    const onPointer = (e: PointerEvent) => {
      store.pointerX = (e.clientX / innerWidth) * 2 - 1
      store.pointerY = (e.clientY / innerHeight) * 2 - 1
      if (e.pointerType !== 'mouse') return

      const t = e.target as HTMLElement

      const btn = t.closest?.<HTMLElement>('.btn')
      if (mag && mag !== btn) mag.style.translate = ''
      mag = btn ?? null
      if (btn) {
        const b = btn.getBoundingClientRect()
        btn.style.translate = `${(e.clientX - b.left - b.width / 2) * 0.22}px ${(e.clientY - b.top - b.height / 2) * 0.3}px`
      }
      const card = t.closest?.<HTMLElement>('.panel, .member, .album, .shot, .stat, .lead26-card')
      if (lit && lit !== card) {
        lit.classList.remove('lit')
        lit.style.removeProperty('--rx')
        lit.style.removeProperty('--ry')
      }
      lit = card ?? null
      if (!card) return
      const r = card.getBoundingClientRect()
      const x = e.clientX - r.left, y = e.clientY - r.top
      card.style.setProperty('--mx', `${x}px`)
      card.style.setProperty('--my', `${y}px`)

      if (r.width < 520) {
        card.style.setProperty('--rx', `${(y / r.height - 0.5) * -10}deg`)
        card.style.setProperty('--ry', `${(x / r.width - 0.5) * 10}deg`)
      }
      card.classList.add('lit')
    }
    addEventListener('pointermove', onPointer)
    return () => {
      removeEventListener('pointermove', onPointer)
      dispose?.()
    }
  }, [])

  useLayoutEffect(() => {
    let revealIO: IntersectionObserver | undefined
    const ctx = gsap.context(() => {
      document.querySelectorAll<HTMLElement>('[data-act]').forEach((el) => {
        const act = Number(el.dataset.act)
        const report = (self: ScrollTrigger) => {
          store.phase = act + self.progress
        }
        if (el.id === 'events') {
          const n = EVENTS.length
          ScrollTrigger.create({
            trigger: el,
            start: 'top top',
            end: () => `+=${innerHeight * 0.75 * n}`,
            pin: true,
            id: 'events',
            onUpdate: (self) => {
              report(self)
              setActive(Math.min(n - 1, Math.floor(self.progress * n)))
            },
            onToggle: report,
          })
        } else if (act === 6) {
          ScrollTrigger.create({ trigger: el, start: 'top bottom', onEnter: () => (store.phase = 6), onLeaveBack: (self) => report(self) })
        } else {
          ScrollTrigger.create({
            trigger: el,
            start: act === 0 ? 'top top' : 'top center',
            end: 'bottom center',
            onUpdate: report,
            onToggle: report,
          })
        }
        if (el.id) {
          ScrollTrigger.create({ trigger: el, start: 'top center', end: 'bottom center', onToggle: (s) => s.isActive && setNav(el.id) })
        }
      })

      const io = new IntersectionObserver((entries) => {
        for (const e of entries) {
          if (e.intersectionRect.height < Math.min(e.boundingClientRect.height * 0.5, innerHeight * 0.7) - 1) continue
          io.unobserve(e.target)
          build(e.target as HTMLElement)
        }
      }, { threshold: Array.from({ length: 21 }, (_, i) => i / 20) })
      document.querySelectorAll<HTMLElement>('[data-reveal]').forEach((el) => io.observe(el))
      revealIO = io

      ScrollTrigger.create({ start: 40, end: 'max', onToggle: (s) => setScrolled(s.isActive) })
    })

    const refresh = () => ScrollTrigger.refresh()
    addEventListener('load', refresh)
    return () => {
      removeEventListener('load', refresh)
      revealIO?.disconnect()
      ctx.revert()
    }
  }, [])

  useEffect(() => {
    document.body.style.overflow = menu ? 'hidden' : ''
  }, [menu])

  const trail = useGlowTrail(navRef, nav)
  const tabTrail = useGlowTrail(tabRef, nav)

  return (
    <>
      <div className="scene-host" ref={sceneHost} aria-hidden="true" />

      <header className={`header ${scrolled ? 'scrolled' : ''}`}>
        <a href="#top" className="brand" aria-label="SAHARA home: replays the logo" onClick={() => (store.gatherAt = performance.now())}>
          <img src="/img/logo.jpeg" alt="" width="36" height="36" />
          <span><strong>SAHARA</strong><small>IIT Madras</small></span>
        </a>
        <nav ref={navRef} className={`nav ${menu ? 'open' : ''}`} aria-label="Primary">
          <ParticleGather s={trail} />
          {NAV.map((n, i) => (
            <a key={n.id} data-id={n.id} href={`#${n.id}`} className={nav === n.id ? 'on' : ''} aria-current={nav === n.id ? 'true' : undefined} onClick={() => setMenu(false)} style={{ ['--i' as string]: i }}>
              {n.label}
            </a>
          ))}
          <a className="btn btn-primary nav-join" href={LINKS.join}>Join us <span className="btn-ic"><Arrow /></span></a>
        </nav>
        <div className="header-tools">
          <button className="icon-btn" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}>
            <SlotReel index={theme === 'dark' ? 1 : 0} faces={['☾', '☀']} />
          </button>
          <a className="btn btn-primary header-join" href={LINKS.join}>Join us <span className="btn-ic"><Arrow /></span></a>
          <button className={`icon-btn burger ${menu ? 'x' : ''}`} onClick={() => setMenu(!menu)} aria-label="Menu" aria-expanded={menu}>
            <span /><span />
          </button>
        </div>
      </header>

      <nav ref={tabRef} className={`tabbar ${scrolled ? 'show' : ''}`} aria-label="Sections">
        <ParticleGather s={tabTrail} />
        {NAV.map((n) => (
          <a key={n.id} data-id={n.id} href={`#${n.id}`} className={`tab-item ${nav === n.id ? 'on' : ''}`} aria-current={nav === n.id ? 'true' : undefined}>
            <span className="flip">
              <span className="face front">{ICONS[n.id]}</span>
              <span className="face back">{ICONS[n.id]}</span>
            </span>
            <small>{n.label}</small>
          </a>
        ))}
      </nav>

      <main>
        <Hero />
        <About />
        <Events active={active} />
        <Team />
        <Gallery />
        <Contact />
      </main>
      <Footer />
    </>
  )
}
