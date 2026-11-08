import { useEffect, useRef } from 'react'

import { PageFlip } from 'page-flip/dist/js/page-flip.module.js'
import { EVENTS, type EventItem } from './data'



type Flip = {
  loadFromHTML: (els: NodeListOf<HTMLElement> | HTMLElement[]) => void
  flipNext: (corner?: 'top' | 'bottom') => void
  flipPrev: (corner?: 'top' | 'bottom') => void
  getCurrentPageIndex: () => number
  getState: () => string
  on: (ev: string, cb: (e: { data: unknown }) => void) => void
  destroy: () => void
}

const h = (tag: string, cls = '', text = '') => {
  const el = document.createElement(tag)
  if (cls) el.className = cls
  if (text) el.textContent = text
  return el
}

function imagePage(e: EventItem, i: number) {
  const page = h('div', 'bk-page bk-left')
  const fig = h('figure', 'pg-img')
  if (e.img) {
    const img = h('img') as HTMLImageElement
    img.src = e.img
    img.alt = ''
    img.decoding = 'async'
    fig.append(img)
  } else {

    const p = h('div', `poster poster-${i % 3}`)
    p.append(
      h('span', 'poster-kind', e.kind.split(' · ')[0]),
      h('span', 'poster-place', e.place === 'Online' ? e.title : e.place.split(',')[0]),
      h('span', 'poster-date', e.date),
    )
    const logo = h('img', 'poster-logo') as HTMLImageElement
    logo.src = '/img/logo.jpeg'
    logo.alt = ''
    p.append(logo)
    fig.append(p)
  }
  fig.append(h('figcaption', '', e.date))
  page.append(fig)
  return page
}

function textPage(e: EventItem, i: number, onOpen: (i: number) => void) {
  const page = h('div', 'bk-page bk-right')
  const t = h('div', 'pg-text')
  const btn = h('button', 'btn btn-primary', 'Read the story ')
  const ic = h('span', 'btn-ic', '↗')
  btn.append(ic)
  btn.addEventListener('click', () => onOpen(i))
  t.append(
    h('p', 'ev-meta', e.kind),
    h('h3', 'ev-title', e.title),
    h('p', 'ev-when', `${e.date} · ${e.place}`),
    h('p', 'ev-sum', e.summary),
    btn,
    h('span', 'pg-num', String(i + 1).padStart(2, '0')),
  )
  page.append(t)
  return page
}

export function RealBook({ active, onOpen }: { active: number; onOpen: (i: number) => void }) {
  const host = useRef<HTMLDivElement>(null)
  const pf = useRef<Flip | null>(null)
  const want = useRef(active * 2)
  const openRef = useRef(onOpen)
  openRef.current = onOpen

  const timer = useRef(0)

  const chase = (p: Flip) => {
    clearTimeout(timer.current)
    if (pf.current !== p) return
    const cur = p.getCurrentPageIndex()
    if (cur === want.current) return
    if (p.getState() === 'read') {
      if (cur < want.current) p.flipNext('top')
      else p.flipPrev('top')
    }
    timer.current = window.setTimeout(() => chase(p), 140)
  }

  useEffect(() => {
    const root = host.current!
    const block = h('div', 'bk-block')
    root.append(block)
    const pages = EVENTS.flatMap((e, i) => [imagePage(e, i), textPage(e, i, (k) => openRef.current(k))])
    block.append(...pages)
    const p: Flip = new PageFlip(block, {
      width: 560,
      height: 520,
      size: 'stretch',
      minWidth: 320,
      maxWidth: 700,
      minHeight: 300,
      maxHeight: 650,
      startPage: want.current,
      showCover: false,
      usePortrait: false,
      drawShadow: true,
      maxShadowOpacity: 0.55,
      flippingTime: 850,
      useMouseEvents: false,
      autoSize: true,
    })
    p.loadFromHTML(pages)

    p.on('changeState', (e) => {
      if (e.data === 'read') chase(p)
    })
    pf.current = p
    return () => {
      pf.current = null
      clearTimeout(timer.current)
      p.destroy()
    }
  }, [])

  useEffect(() => {
    want.current = active * 2
    if (pf.current) chase(pf.current)
  }, [active])

  return <div className="realbook" ref={host} data-ribbon aria-label={`Event ${active + 1} of ${EVENTS.length}: ${EVENTS[active].title}`} />
}
