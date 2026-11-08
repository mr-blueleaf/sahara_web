const CARD = '.panel, .goal, .member, .shot, .stats, .album, .tcard, .lead26-card, .ev-card'
const TEXT = 'h1, h2, h3, p, blockquote, .kicker, li > span, strong, summary, figcaption'
const DUR = 720
const SPREAD = 360
const FADE = 260
const LAND = 520
const SKEL_HOLD = 420

const coarse = typeof matchMedia !== 'undefined' && matchMedia('(pointer: coarse)').matches
const CAP = coarse ? 600 : 3000

type Rect = { x: number; y: number; w: number; h: number; card: boolean }

function measure(el: HTMLElement): Rect[] {
  const sy = scrollY
  const out: Rect[] = []
  const add = (r: DOMRect, card: boolean) => {
    if (r.width > 2 && r.height > 2) out.push({ x: r.left, y: r.top + sy, w: r.width, h: r.height, card })
  }
  const cards = el.matches(CARD) ? [el] : Array.from(el.querySelectorAll<HTMLElement>(CARD)).slice(0, 6)
  cards.forEach((c) => add(c.getBoundingClientRect(), true))
  const words = el.querySelectorAll<HTMLElement>('.split .w')
  if (words.length) mergeLines(Array.from(words, (w) => w.getBoundingClientRect())).forEach((r) => add(r, false))
  let lines = 0
  el.querySelectorAll<HTMLElement>(TEXT).forEach((t) => {
    if (t.closest('.split') || lines > 40) return
    const range = document.createRange()
    range.selectNodeContents(t)
    for (const r of Array.from(range.getClientRects()).slice(0, 6)) {
      add(r, false)
      lines++
    }
  })
  return out
}

function mergeLines(rs: DOMRect[]): DOMRect[] {
  const rows: DOMRect[] = []
  for (const r of rs) {
    const row = rows.find((q) => Math.abs(q.top - r.top) < r.height * 0.5)
    if (!row) rows.push(DOMRect.fromRect(r))
    else {
      const l = Math.min(row.left, r.left)
      const rt = Math.max(row.right, r.right)
      row.x = l
      row.width = rt - l
    }
  }
  return rows
}

function pointsFor(rects: Rect[]): [number, number][] {
  const pts: [number, number][] = []
  const k = coarse ? 0.5 : 1
  for (const r of rects) {
    if (r.card) {
      const n = Math.min(110, Math.max(30, (r.w * r.h) / 3200)) * k
      for (let i = 0; i < n; i++) {
        if (i < n * 0.6) {
          const t = Math.random() * 2 * (r.w + r.h)
          const x = t < r.w ? t : t < r.w + r.h ? r.w : t < 2 * r.w + r.h ? 2 * r.w + r.h - t : 0
          const y = t < r.w ? 0 : t < r.w + r.h ? t - r.w : t < 2 * r.w + r.h ? r.h : 2 * (r.w + r.h) - t
          pts.push([r.x + x, r.y + y])
        } else pts.push([r.x + Math.random() * r.w, r.y + Math.random() * r.h])
      }
    } else {
      const n = Math.min(30, Math.max(4, r.w / 12)) * k
      for (let i = 0; i < n; i++) pts.push([r.x + Math.random() * r.w, r.y + r.h * (0.3 + Math.random() * 0.45)])
    }
  }
  return pts
}

let skelLayer: HTMLDivElement | null = null
function skeleton(rects: Rect[]) {
  if (!skelLayer) {
    skelLayer = document.createElement('div')
    skelLayer.className = 'skel-layer'
    skelLayer.setAttribute('aria-hidden', 'true')
    document.body.appendChild(skelLayer)
  }
  const frag = document.createDocumentFragment()
  const nodes = rects.map((r) => {
    const d = document.createElement('div')
    d.className = r.card ? 'skel skel-card' : 'skel skel-line'
    const h = r.card ? r.h : Math.max(6, r.h * 0.42)
    d.style.cssText = `left:${r.x}px;top:${r.card ? r.y : r.y + (r.h - h) / 2}px;width:${r.w}px;height:${h}px`
    frag.appendChild(d)
    return d
  })
  skelLayer.appendChild(frag)
  setTimeout(() => nodes.forEach((n) => n.classList.add('on')), LAND - 160)
  setTimeout(() => nodes.forEach((n) => n.classList.add('off')), LAND + SKEL_HOLD)
  setTimeout(() => nodes.forEach((n) => n.remove()), LAND + SKEL_HOLD + 700)
}

let canvas: HTMLCanvasElement | null = null
let gl: WebGLRenderingContext | null = null
let buf: WebGLBuffer | null = null
let uNow: WebGLUniformLocation | null = null
let uScroll: WebGLUniformLocation | null = null
let uView: WebGLUniformLocation | null = null
let uDpr: WebGLUniformLocation | null = null
let head = 0
let busyUntil = 0
let raf = 0
let dpr = 1
let failed = false
const t0 = performance.now()
const STRIDE = 9
const data = new Float32Array(CAP * STRIDE)

const VS = `
attribute vec2 aS; attribute vec2 aC; attribute vec2 aE; attribute vec2 aT; attribute float aCol;
uniform float uNow; uniform float uScroll; uniform vec2 uView; uniform float uDpr;
varying float vA; varying float vCol;
void main(){
  float age = uNow - aT.x;
  float t = clamp(age / ${DUR}.0, 0.0, 1.0);
  float e = 1.0 - pow(1.0 - t, 3.0); float u = 1.0 - e;
  vec2 p = u*u*aS + 2.0*u*e*aC + e*e*aE;
  p.y -= uScroll;
  vA = age < 0.0 ? 0.0 : min(1.0, t * 4.0) * (1.0 - clamp((age - ${DUR}.0) / ${FADE}.0, 0.0, 1.0));
  vCol = aCol;
  gl_Position = vec4(p.x / uView.x * 2.0 - 1.0, 1.0 - p.y / uView.y * 2.0, 0.0, 1.0);
  gl_PointSize = vA > 0.0 ? aT.y * (2.0 + sin(3.14159 * t) * 1.8) * uDpr * 2.0 : 0.0;
}`
const FS = `
precision mediump float; varying float vA; varying float vCol;
void main(){
  float d = length(gl_PointCoord - 0.5) * 2.0;
  float a = smoothstep(1.0, 0.5, d) * vA * 0.95;
  if (a < 0.01) discard;
  vec3 c = vCol < 0.5 ? vec3(.886,.463,.110) : vCol < 1.5 ? vec3(.953,.604,.180) : vCol < 2.5 ? vec3(.788,.329,.102) : vCol < 3.5 ? vec3(.969,.702,.310) : vec3(1.,.812,.478);
  gl_FragColor = vec4(c * a, a);
}`

function init(): boolean {
  if (gl) return true
  if (failed) return false
  canvas = document.createElement('canvas')
  canvas.className = 'build-canvas'
  canvas.setAttribute('aria-hidden', 'true')
  document.body.appendChild(canvas)
  const g = canvas.getContext('webgl', { alpha: true, premultipliedAlpha: true, antialias: false, depth: false, stencil: false })
  if (!g) return !(failed = true)
  const sh = (type: number, src: string) => {
    const s = g.createShader(type)!
    g.shaderSource(s, src)
    g.compileShader(s)
    return s
  }
  const prog = g.createProgram()!
  g.attachShader(prog, sh(g.VERTEX_SHADER, VS))
  g.attachShader(prog, sh(g.FRAGMENT_SHADER, FS))
  g.linkProgram(prog)
  if (!g.getProgramParameter(prog, g.LINK_STATUS)) return !(failed = true)
  g.useProgram(prog)
  buf = g.createBuffer()
  g.bindBuffer(g.ARRAY_BUFFER, buf)
  for (let i = 0; i < CAP; i++) data[i * STRIDE + 6] = -1e9
  g.bufferData(g.ARRAY_BUFFER, data, g.DYNAMIC_DRAW)
  const attr = (name: string, size: number, off: number) => {
    const loc = g.getAttribLocation(prog, name)
    g.enableVertexAttribArray(loc)
    g.vertexAttribPointer(loc, size, g.FLOAT, false, STRIDE * 4, off * 4)
  }
  attr('aS', 2, 0)
  attr('aC', 2, 2)
  attr('aE', 2, 4)
  attr('aT', 2, 6)
  attr('aCol', 1, 8)
  uNow = g.getUniformLocation(prog, 'uNow')
  uScroll = g.getUniformLocation(prog, 'uScroll')
  uView = g.getUniformLocation(prog, 'uView')
  uDpr = g.getUniformLocation(prog, 'uDpr')
  g.enable(g.BLEND)
  g.blendFunc(g.ONE, g.ONE_MINUS_SRC_ALPHA)
  gl = g
  const size = () => {
    dpr = Math.min(devicePixelRatio, coarse ? 1 : 2)
    canvas!.width = innerWidth * dpr
    canvas!.height = innerHeight * dpr
    g.viewport(0, 0, canvas!.width, canvas!.height)
  }
  size()
  addEventListener('resize', size)
  return true
}

function frame() {
  const g = gl!
  const now = performance.now() - t0
  g.clearColor(0, 0, 0, 0)
  g.clear(g.COLOR_BUFFER_BIT)
  if (now > busyUntil) {
    raf = 0
    return
  }
  g.uniform1f(uNow, now)
  g.uniform1f(uScroll, scrollY)
  g.uniform2f(uView, innerWidth, innerHeight)
  g.uniform1f(uDpr, dpr)
  g.drawArrays(g.POINTS, 0, CAP)
  raf = requestAnimationFrame(frame)
}

export function build(el: HTMLElement, onDone: () => void = () => el.classList.add('in')) {
  const rects = measure(el)
  if (!rects.length || !init()) return onDone()
  let pts = pointsFor(rects)
  if (pts.length > CAP / 2) pts = pts.sort(() => Math.random() - 0.5).slice(0, CAP / 2)
  const now = performance.now() - t0
  const from = head
  for (const [ex, ey] of pts) {
    const sx = ex + (Math.random() - 0.5) * 420
    const sy = ey + 140 + Math.random() * 260
    const o = head * STRIDE
    data[o] = sx
    data[o + 1] = sy
    data[o + 2] = (sx + ex) / 2 + (Math.random() - 0.5) * 260
    data[o + 3] = Math.min(sy, ey) - 40 - Math.random() * 120
    data[o + 4] = ex
    data[o + 5] = ey
    data[o + 6] = now + Math.random() * SPREAD
    data[o + 7] = 0.9 + Math.random() * 1.6
    data[o + 8] = (Math.random() * 5) | 0
    head = (head + 1) % CAP
  }

  const g = gl!
  g.bindBuffer(g.ARRAY_BUFFER, buf)
  if (head > from) g.bufferSubData(g.ARRAY_BUFFER, from * STRIDE * 4, data.subarray(from * STRIDE, head * STRIDE))
  else if (head < from) {
    g.bufferSubData(g.ARRAY_BUFFER, from * STRIDE * 4, data.subarray(from * STRIDE))
    if (head) g.bufferSubData(g.ARRAY_BUFFER, 0, data.subarray(0, head * STRIDE))
  }
  busyUntil = Math.max(busyUntil, now + SPREAD + DUR + FADE + 50)
  if (!raf) raf = requestAnimationFrame(frame)

  skeleton(rects)
  setTimeout(onDone, LAND + SKEL_HOLD - 120)
}
