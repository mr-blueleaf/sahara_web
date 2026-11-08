import { useEffect, useRef, useState, type FormEvent } from 'react'
import { RealBook } from './realbook'
import { ALBUMS, EVENTS, FAQ, GALLERY, GOALS, IDENTITIES, LEADERSHIP_2026, LINKS, NAV, PURPOSES, STATS, TEAM, TESTIMONIALS, type EventItem } from './data'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Arrow, ElasticString, Modal, Odometer, Split } from './ui'


export function Hero() {
  return (
    <section id="top" className="hero" data-act="0">
      <h1 className="masthead" data-reveal aria-label="SAHARA">
        {'SAHARA'.split('').map((c, i) => (
          <span key={i} style={{ transitionDelay: `${150 + i * 70}ms` }}>{c}</span>
        ))}
      </h1>
      <div className="hero-front" data-reveal>
        <p className="eyebrow"><span className="dot" /> The Social Welfare Society · IIT Madras BS Degree</p>
        <Split as="p" className="hero-line" text="Be the support someone is waiting for." delay={500} />
        <p className="hero-sub fade" style={{ transitionDelay: '900ms' }}>
          Students of the IIT Madras BS Degree bringing purpose and joy to the lives of those who need it most, by
          raising awareness, inspiring compassion and showing up in person.
        </p>
        <div className="cta-row fade" style={{ transitionDelay: '1100ms' }}>
          <a className="btn btn-primary" href={LINKS.join} target="_blank" rel="noopener noreferrer">Join SAHARA <span className="btn-ic"><Arrow /></span></a>
          <a className="btn btn-ghost" href="#events">See our work <span className="btn-ic"><Arrow /></span></a>
        </div>
      </div>
      <a href="#about" className="scroll-cue" aria-label="Scroll to About"><span /></a>
      <Ticker />
    </section>
  )
}

function Ticker() {
  const items = ['Offline volunteering', 'Animal Aid Unlimited, Udaipur', 'Robin Hood Army, Indore', 'Guest sessions with changemakers', 'Poster competitions', 'Spreading awareness', 'Be a SAHARA']
  const row = items.map((t, i) => (
    <span key={i}>
      <b>✦</b> {t}
    </span>
  ))
  return (
    <div className="ticker" aria-hidden="true">
      <div className="ticker-track">{row}{row}</div>
    </div>
  )
}


const gi = (d: string) => (
  <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={d} /></svg>
)
const GOAL_ICONS = [
  gi('M12 20s-6.5-4-8.6-8.2A4.8 4.8 0 0 1 12 6.6a4.8 4.8 0 0 1 8.6 5.2C18.5 16 12 20 12 20z'),
  gi('M3 10v4h3l6 4V6L6 10H3zM16 9a4 4 0 0 1 0 6M18.5 6.5a7.5 7.5 0 0 1 0 11'),
  gi('M7 11V6a1.5 1.5 0 0 1 3 0v5M10 10V4.5a1.5 1.5 0 0 1 3 0V10M13 10V5.5a1.5 1.5 0 0 1 3 0V12M16 9.5a1.5 1.5 0 0 1 3 0V14a7 7 0 0 1-7 7h-1a6 6 0 0 1-5-2.7L3.5 15a1.5 1.5 0 0 1 2.4-1.8L7 14.5'),
  gi('M3 17h18M5 17v-4a7 7 0 0 1 14 0v4M9 17v-3M15 17v-3M12 17v-4'),
]

export function About() {
  return (
    <section id="about" className="section about" data-act="1">
      <div className="wrap">
        <div className="about-lead" data-reveal>
          <p className="kicker">01 · Who we are</p>
          <Split as="h2" className="display" text="Official social welfare society of the IIT Madras BS Degree." />
          <p className="lead-body fade">
            We help people in need and create opportunities for willing hearts: offline volunteering with established
            NGOs, conversations with social activists, and competitions on the issues that matter. Along the way, our
            members build leadership, public speaking and a habit of selflessness.
          </p>
        </div>

        <div className="mv-grid">
          <article className="panel mv" data-reveal>
            <p className="kicker">Mission</p>
            <p className="mv-text">To <em>raise awareness</em>, <em>inspire compassion</em> and <em>promote humanity</em> by every means we can.</p>
          </article>
          <article className="panel mv mv-vision" data-reveal>
            <p className="kicker">Vision</p>
            <p className="mv-text">A student community where giving back is part of how every member learns, leads and lives.</p>
          </article>
        </div>

        <ol className="goals">
          {GOALS.map((g, i) => (
            <li className="panel goal" key={g.title} data-reveal style={{ transitionDelay: `${i * 90}ms` }}>
              <span className="goal-top"><span className="goal-ic">{GOAL_ICONS[i]}</span><span className="goal-n">0{i + 1}</span></span>
              <h3>{g.title}</h3>
              <p>{g.body}</p>
            </li>
          ))}
        </ol>

        <div className="stats" data-reveal>
          {STATS.map((s) => (
            <div className="stat" key={s.label}>
              <Odometer value={s.value} prefix={s.prefix} suffix={s.suffix} />
              <p>{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}


function pickEvent(i: number) {
  const st = ScrollTrigger.getById('events')
  if (!st) return
  window.scrollTo({ top: st.start + ((i + 0.5) / EVENTS.length) * (st.end - st.start), behavior: 'smooth' })
}

export function Events({ active }: { active: number }) {
  const [open, setOpen] = useState<number | null>(null)

  const [shown, setShown] = useState(active)
  const wide = useWide()
  const turning = shown !== active
  const fwd = active > shown
  const o = open === null ? null : EVENTS[open]
  const Left = (k: number) => <ImagePage i={k} />
  const Right = (k: number) => <TextPage i={k} onOpen={() => setOpen(k)} />
  return (
    <section id="events" className="events" data-act="2">
      <div className="events-inner wrap" data-reveal>
        <div className="events-head">
          <p className="kicker">02 · Events &amp; activities</p>
          <p className="ev-count" aria-hidden="true">
            <span className="ev-roll" style={{ ['--i' as string]: active }}>
              {EVENTS.map((_, i) => <span key={i}>{String(i + 1).padStart(2, '0')}</span>)}
            </span>
            <span className="ev-total">/ {String(EVENTS.length).padStart(2, '0')}</span>
          </p>
        </div>

        {wide ? <RealBook active={active} onOpen={setOpen} /> : (
        <div className="book">
          <div className="page page-l">{Left(turning && fwd ? shown : active)}</div>
          <div className="page page-r">{Right(turning && !fwd ? shown : active)}</div>
          <div className="spine" aria-hidden="true" />
          {turning && (
            <div key={`${shown}-${active}`} className={`leaf ${fwd ? 'leaf-fwd' : 'leaf-back'}`} onAnimationEnd={(e) => e.target === e.currentTarget && setShown(active)} aria-hidden="true">
              <div className="leaf-face front">{fwd ? Right(shown) : Left(shown)}</div>
              <div className="leaf-face back">{fwd ? Left(active) : Right(active)}</div>
            </div>
          )}
        </div>
        )}

        <ElasticString count={EVENTS.length} active={active} labels={EVENTS.map((e) => e.title)} onPick={pickEvent} />
      </div>

      <Modal open={o !== null} onClose={() => setOpen(null)} label={o?.title ?? 'Event'} className="modal-event">
        {o && (
          <div className="me">
            {o.img ? <img src={o.img} alt={o.title} /> : <Poster e={o} n={open ?? 0} />}
            <div className="me-body">
              <p className="kicker">{o.kind}</p>
              <h3>{o.title}</h3>
              <p className="ev-when">{o.date} · {o.place}</p>
              {o.detail.map((d) => <p key={d}>{d}</p>)}
              {o.partners && <p className="chips">{o.partners.map((p) => <span key={p}>{p}</span>)}</p>}
              {o.galleryUrl && (
                <a className="btn btn-ghost" href={o.galleryUrl} target="_blank" rel="noopener noreferrer">View full album <span className="btn-ic"><Arrow /></span></a>
              )}
            </div>
          </div>
        )}
      </Modal>
    </section>
  )
}

function useWide() {
  const q = '(min-width: 901px)'
  const [wide, setWide] = useState(() => matchMedia(q).matches)
  useEffect(() => {
    const m = matchMedia(q)
    const on = () => setWide(m.matches)
    m.addEventListener('change', on)
    return () => m.removeEventListener('change', on)
  }, [])
  return wide
}

function ImagePage({ i }: { i: number }) {
  const e = EVENTS[i]
  return (
    <figure className="pg-img">
      {e.img ? <img src={e.img} alt="" loading="lazy" /> : <Poster e={e} n={i} />}
      <figcaption>{e.date}</figcaption>
    </figure>
  )
}

function TextPage({ i, onOpen }: { i: number; onOpen: () => void }) {
  const e = EVENTS[i]
  return (
    <div className="pg-text">
      <p className="ev-meta">{e.kind}</p>
      <h3 className="ev-title">{e.title}</h3>
      <p className="ev-when">{e.date} · {e.place}</p>
      <p className="ev-sum">{e.summary}</p>
      <button className="btn btn-primary" onClick={onOpen}>Read the story <span className="btn-ic"><Arrow /></span></button>
      <span className="pg-num">{String(i + 1).padStart(2, '0')}</span>
    </div>
  )
}


function Poster({ e, n }: { e: EventItem; n: number }) {
  return (
    <div className={`poster poster-${n % 3}`}>
      <span className="poster-kind">{e.kind.split(' · ')[0]}</span>
      <span className="poster-place">{e.place === 'Online' ? e.title : e.place.split(',')[0]}</span>
      <span className="poster-date">{e.date}</span>
      <img src="/img/logo.jpeg" alt="" className="poster-logo" />
    </div>
  )
}


export function Team() {
  const [flipped, setFlipped] = useState<string | null>(null)
  return (
    <section id="team" className="section team" data-act="3">
      <div className="wrap">
        <div className="sec-head" data-reveal>
          <p className="kicker">03 · Our team</p>
          <Split as="h2" className="display" text="The faces behind SAHARA." />
        </div>

        <div className="lead26" data-reveal>
          <p className="kicker">Leading in 2026</p>
          <div className="lead26-row">
            {LEADERSHIP_2026.map((p) => (
              <div className="panel lead26-card" key={p.name}>
                <span className="mono">{p.name.split(' ').map((w) => w[0]).join('')}</span>
                <div><strong>{p.name}</strong><span>{p.role}</span></div>
              </div>
            ))}
          </div>
        </div>

        <p className="kicker team-sub" data-reveal>Founding team &amp; core members</p>
        <ul className="team-grid">
          {TEAM.map((p, i) => (
            <li key={p.name} data-reveal style={{ transitionDelay: `${(i % 4) * 80}ms` }}>
              <button className={`member ${flipped === p.name ? 'flipped' : ''}`} onClick={() => setFlipped(flipped === p.name ? null : p.name)}
                onPointerMove={tilt} onPointerLeave={untilt} aria-pressed={flipped === p.name} aria-label={`${p.name}, ${p.role}. Show their words`}>
                <span className="member-inner">
                  <span className="member-front">
                    <span className="member-img"><img src={p.img} alt="" loading="lazy" /><span className="flip-hint" aria-hidden="true">↻ Click to flip</span></span>
                    <span className="member-txt"><strong>{p.name}</strong><span>{p.role}</span></span>
                  </span>
                  <span className="member-back">
                    <span className="flip-hint back" aria-hidden="true">↻ Flip back</span><span className="q">“{p.quote ?? 'Proud to be part of SAHARA, working together for those who need it most.'}”</span>
                    <span className="member-txt"><strong>{p.name}</strong><span>{p.role}</span></span>
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

function tilt(e: React.PointerEvent<HTMLElement>) {
  if (e.pointerType !== 'mouse') return
  const r = e.currentTarget.getBoundingClientRect()
  e.currentTarget.style.setProperty('--rx', `${((e.clientY - r.top) / r.height - 0.5) * -12}deg`)
  e.currentTarget.style.setProperty('--ry', `${((e.clientX - r.left) / r.width - 0.5) * 12}deg`)
}
function untilt(e: React.PointerEvent<HTMLElement>) {
  e.currentTarget.style.setProperty('--rx', '0deg')
  e.currentTarget.style.setProperty('--ry', '0deg')
}


export function Gallery() {
  const [i, setI] = useState<number | null>(null)
  const n = GALLERY.length
  const step = (d: number) => setI((v) => (v === null ? v : (v + d + n) % n))
  return (
    <section id="gallery" className="section gallery" data-act="4">
      <div className="wrap">
        <div className="sec-head" data-reveal>
          <p className="kicker">04 · Gallery</p>
          <Split as="h2" className="display" text="Moments that stayed with us." />
        </div>
        <ul className="masonry">
          {GALLERY.map((g, k) => (
            <li key={g.src} data-reveal>
              <button className="shot wipe" onClick={() => setI(k)} aria-label={`Open photo: ${g.caption}`}>
                <img src={g.src} alt={g.caption} loading="lazy" />
                <span className="shot-cap">{g.caption}</span>
              </button>
            </li>
          ))}
          {ALBUMS.map((a) => (
            <li key={a.url} data-reveal>
              <a className="album" href={a.url} target="_blank" rel="noopener noreferrer">
                <span className="kicker">Full album</span>
                <strong>{a.title}</strong>
                <span className="btn-ic"><Arrow /></span>
              </a>
            </li>
          ))}
        </ul>

        <div className="testi" data-reveal>
          <p className="kicker">In their words</p>
          <div className="testi-track">
            {[...TESTIMONIALS, ...TESTIMONIALS].map((t, k) => (
              <figure className="panel tcard" key={k} aria-hidden={k >= TESTIMONIALS.length}>
                <blockquote>“{t.quote}”</blockquote>
                <figcaption><strong>{t.name}</strong> · {t.trip}</figcaption>
              </figure>
            ))}
          </div>
        </div>
      </div>

      <Modal open={i !== null} onClose={() => setI(null)} label="Photo viewer" className="modal-lightbox">
        {i !== null && (
          <div className="lb" onKeyDown={(e) => { if (e.key === 'ArrowRight') step(1); if (e.key === 'ArrowLeft') step(-1) }}>
            <img src={GALLERY[i].src} alt={GALLERY[i].caption} />
            <div className="lb-bar">
              <button onClick={() => step(-1)} aria-label="Previous photo">←</button>
              <span>{GALLERY[i].caption} · {i + 1}/{n}</span>
              <button onClick={() => step(1)} aria-label="Next photo" autoFocus>→</button>
            </div>
          </div>
        )}
      </Modal>
    </section>
  )
}


type Errors = Partial<Record<'name' | 'email' | 'purpose' | 'message', string>>

export function Contact() {
  const [errors, setErrors] = useState<Errors>({})
  const [state, setState] = useState<'idle' | 'sending' | 'sent' | 'failed'>('idle')

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const f = new FormData(form)
    const v = (k: string) => String(f.get(k) ?? '').trim()
    const errs: Errors = {}
    if (v('name').length < 2) errs.name = 'Please tell us your name.'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v('email'))) errs.email = 'That email doesn’t look right.'
    if (!PURPOSES.includes(v('purpose'))) errs.purpose = 'Pick what this is about.'
    if (v('message').length < 10) errs.message = 'A few more words, please (10+ characters).'
    setErrors(errs)
    if (Object.keys(errs).length || state === 'sending') return
    if (v('website')) return setState('sent')

    const row = {
      name: v('name').slice(0, 120),
      email: v('email').slice(0, 160),
      identity: IDENTITIES.includes(v('identity')) ? v('identity') : 'Student',
      purpose: v('purpose'),
      message: v('message').slice(0, 3000),
    }
    setState('sending')
    try {
      const r = await fetch('/api/submit', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(row) })
      if (!r.ok) throw new Error(`submit ${r.status}`)
      setState('sent')
      form.reset()
    } catch (err) {
      console.warn('submission failed', err)
      setState('failed')
    }
  }

  return (
    <section id="contact" className="section contact" data-act="5">
      <div className="wrap contact-grid">
        <div className="contact-left" data-reveal>
          <p className="kicker">05 · Contact</p>
          <Split as="h2" className="display" text="Let’s make a difference, together." />
          <ul className="contact-list fade">
            <li><span>Email</span><a href={`mailto:${LINKS.email}`}>{LINKS.email}</a></li>
            <li><span>Instagram</span><a href={LINKS.instagram} target="_blank" rel="noopener noreferrer">@sahara_iitmbs</a></li>
            <li><span>LinkedIn</span><a href={LINKS.linkedin} target="_blank" rel="noopener noreferrer">SAHARA · The Social Welfare Society</a></li>
            <li><span>YouTube</span><a href={LINKS.youtube} target="_blank" rel="noopener noreferrer">@saharaiitm</a></li>
          </ul>
          <div className="faq panel">
            <p className="kicker">Questions, answered</p>
            {FAQ.map((f) => (
              <details key={f.q}>
                <summary>{f.q}</summary>
                <p>{f.a}</p>
              </details>
            ))}
          </div>
        </div>

        <form className="panel form" onSubmit={submit} noValidate data-reveal>
          <h3>Send us a message</h3>
          <div className="row2">
            <Field label="Your name" name="name" error={errors.name} autoComplete="name" />
            <Field label="Email" name="email" type="email" error={errors.email} autoComplete="email" />
          </div>
          <Seesaw />
          <PurposeTrail error={errors.purpose} />
          <label className={`field ${errors.message ? 'bad' : ''}`}>
            <span>Message</span>
            <textarea name="message" rows={4} maxLength={3000} aria-invalid={!!errors.message} />
            {errors.message && <em role="alert">{errors.message}</em>}
          </label>
          <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hp" aria-hidden="true" />
          <button className="btn btn-primary" type="submit" disabled={state === 'sending'}>
            {state === 'sending' ? 'Sending…' : 'Send message'} <span className="btn-ic"><Arrow /></span>
          </button>
          <p className={`form-note ${state}`} role="status">
            {state === 'sent' && 'Message received! The SAHARA team will get back to you soon. 💛'}
            {state === 'failed' && <>Couldn’t send right now. Please try again, or email us at <a href={`mailto:${LINKS.email}`}>{LINKS.email}</a>.</>}
            {(state === 'idle' || state === 'sending') && 'We usually reply within a few days.'}
          </p>
        </form>
      </div>
    </section>
  )
}


function Seesaw() {
  const [v, setV] = useState('Student')
  const [kick, setKick] = useState({ tilt: 0, n: 0 })
  return (
    <fieldset className="field seesaw-field">
      <legend>I am a…</legend>
      <div key={kick.n} className="seesaw" style={{ ['--tilt' as string]: `${kick.tilt}deg` }}>
        {IDENTITIES.map((x, i) => (
          <label key={x} className={v === x ? 'on' : ''}>
            <input type="radio" name="identity" value={x} checked={v === x}
              onChange={() => { setV(x); setKick((k) => ({ tilt: ((i - (IDENTITIES.length - 1) / 2) / IDENTITIES.length) * 9, n: k.n + 1 })) }} />
            {x}
          </label>
        ))}
      </div>
    </fieldset>
  )
}


const PURPOSE_ICON: Record<string, string> = {
  Volunteer: 'M12 20s-7-4.4-7-9.5A3.8 3.8 0 0 1 12 8a3.8 3.8 0 0 1 7 2.5C19 15.6 12 20 12 20Z M3 16l3 3 M21 16l-3 3',
  'Join Core Team': 'M12 3l2.6 5.4 5.9.8-4.3 4.1 1 5.8L12 16.4 6.8 19.1l1-5.8-4.3-4.1 5.9-.8Z',
  'Event Suggestion': 'M9 18h6 M10 21h4 M12 3a6 6 0 0 0-3.6 10.8c.6.5.9 1.2.9 2V16h5.4v-.2c0-.8.3-1.5.9-2A6 6 0 0 0 12 3Z',
  Collaboration: 'M4 12a5 5 0 1 0 10 0a5 5 0 1 0-10 0 M10 12a5 5 0 1 0 10 0a5 5 0 1 0-10 0',
  Sponsorship: 'M7 4h10 M7 8.5h10 M7 4h3.5a4.3 4.3 0 0 1 0 8.6H7l7.5 7.4',
  'Social Activity Participation': 'M12 21v-8 M12 13c0-5 3.5-8 8.5-8 0 5-3.5 8-8.5 8Z M12 16c0-4-3-6.5-7.5-6.5 0 4 3 6.5 7.5 6.5Z',
  Feedback: 'M4 5h16v11H9l-5 4Z M8 9.5h8 M8 12.5h5',
  Other: 'M12 3v4 M12 17v4 M3 12h4 M17 12h4 M6 6l2.5 2.5 M15.5 15.5 18 18 M6 18l2.5-2.5 M15.5 8.5 18 6',
}

function PurposeIcon({ name }: { name: string }) {
  return (
    <svg className="p-ic" viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" fill="none" stroke="currentColor"
      strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d={PURPOSE_ICON[name] ?? PURPOSE_ICON.Other} /></svg>
  )
}


function PurposeTrail({ error }: { error?: string }) {
  const tray = useRef<HTMLDivElement>(null)
  const [v, setV] = useState('')
  const [box, setBox] = useState<{ x: number; y: number; w: number; h: number; dir: number } | null>(null)
  const measure = (dir = 0) => {
    const el = tray.current?.querySelector<HTMLElement>('label.on')
    if (el) setBox((b) => ({ x: el.offsetLeft, y: el.offsetTop, w: el.offsetWidth, h: el.offsetHeight, dir: dir || b?.dir || 1 }))
  }
  useEffect(() => {
    const ro = new ResizeObserver(() => measure())
    if (tray.current) ro.observe(tray.current)
    return () => ro.disconnect()
  }, [])
  useEffect(() => measure(), [v])
  return (
    <fieldset className={`field seesaw-field ${error ? 'bad' : ''}`} aria-invalid={!!error}>
      <legend>What brings you here?</legend>
      <div ref={tray} className="seesaw trail">
        {box && <span className="trail-pill" aria-hidden="true"
          style={{ transform: `translate(${box.x}px, ${box.y}px)`, width: box.w, height: box.h, ['--dir' as string]: box.dir }}><span key={v} className="trail-tail" /></span>}
        {PURPOSES.map((x) => (
          <label key={x} className={v === x ? 'on' : ''}>
            <input type="radio" name="purpose" value={x} checked={v === x}
              onChange={(e) => {
                const old = tray.current?.querySelector<HTMLElement>('label.on')
                const to = e.currentTarget.parentElement!
                if (old && box) setBox({ ...box, dir: to.offsetTop !== old.offsetTop ? Math.sign(to.offsetTop - old.offsetTop) : Math.sign(to.offsetLeft - old.offsetLeft) })
                setV(x)
              }} />
            <PurposeIcon name={x} />{x}
          </label>
        ))}
      </div>
      {error && <em role="alert">{error}</em>}
    </fieldset>
  )
}

function Field({ label, name, type = 'text', error, autoComplete }: { label: string; name: string; type?: string; error?: string; autoComplete?: string }) {
  return (
    <label className={`field ${error ? 'bad' : ''}`}>
      <span>{label}</span>
      <input name={name} type={type} maxLength={120} autoComplete={autoComplete} aria-invalid={!!error} />
      {error && <em role="alert">{error}</em>}
    </label>
  )
}


export function Footer() {
  return (
    <footer className="footer" data-act="6">
      <div className="wrap">
        <div className="foot-hero" data-reveal>
          <Split as="p" className="foot-line" text="Be a SAHARA." />
          <a className="btn btn-primary" href={LINKS.join} target="_blank" rel="noopener noreferrer">Join us <span className="btn-ic"><Arrow /></span></a>
        </div>
        <div className="foot-grid">
          <div className="foot-brand">
            <img src="/img/logo.jpeg" alt="SAHARA logo" width="56" height="56" />
            <p><strong>SAHARA</strong><br />The Social Welfare Society<br />IIT Madras BS Degree Programme</p>
          </div>
          <nav aria-label="Footer">
            <p className="kicker">Navigate</p>
            {NAV.map((n) => <a key={n.id} href={`#${n.id}`}>{n.label}</a>)}
          </nav>
          <div>
            <p className="kicker">Connect</p>
            <a href={`mailto:${LINKS.email}`}>Email</a>
            <a href={LINKS.instagram} target="_blank" rel="noopener noreferrer">Instagram</a>
            <a href={LINKS.linkedin} target="_blank" rel="noopener noreferrer">LinkedIn</a>
            <a href={LINKS.youtube} target="_blank" rel="noopener noreferrer">YouTube</a>
          </div>
          <div>
            <p className="kicker">Society</p>
            <a href={LINKS.join} target="_blank" rel="noopener noreferrer">Join SAHARA</a>
            <a href="#contact">Collaborate</a>
            <a href="https://study.iitm.ac.in/ds/" target="_blank" rel="noopener noreferrer">IIT Madras BS Degree</a>
          </div>
        </div>
        <div className="foot-base">
          <span>© 2026 SAHARA – The Social Welfare Society, IIT Madras. All rights reserved.</span>
          <span>Built by SAHARA WebOps · An official society of the IIT Madras BS Degree</span>
        </div>
      </div>
    </footer>
  )
}
