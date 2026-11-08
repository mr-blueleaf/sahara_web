import * as THREE from 'three'
import { store } from '../lib/store'
import { stateFor } from '../lib/choreography'



const PX = 0.02
const IMG_W = 750
const IMG_H = 790
const LAYERS = [
  { name: 'rays', z: -0.95, depth: 0.2, at: 0.22 },
  { name: 'sun', z: -0.5, depth: 0.42, at: 0 },
  { name: 'figure', z: 0.1, depth: 0.32, at: 0.4 },
  { name: 'swooshes', z: 0.62, depth: 0.5, at: 0.56 },
] as const
const FLY = 0.75
const JITTER = 0.3
const LAST_LAND = 0.56 + JITTER + FLY
const END = LAST_LAND + 0.35
const GATHER_SECS = 2.8

export function createScene(host: HTMLElement) {
  const coarse = matchMedia('(pointer: coarse)').matches
  const canvas = document.createElement('canvas')
  canvas.className = 'scene-canvas'
  host.appendChild(canvas)

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: !coarse, powerPreference: 'high-performance' })
  let maxDpr = Math.min(devicePixelRatio, coarse ? 1 : 1.5)
  renderer.setPixelRatio(maxDpr)
  renderer.setClearColor(0x000000, 0)

  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 3000)
  const time = { value: 0 }

  const subject = new THREE.Group()
  subject.position.y = 2.6
  scene.add(subject)


  const haloMat = new THREE.ShaderMaterial({
    uniforms: { uGlow: { value: 1 } },
    vertexShader: `varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }`,
    fragmentShader:  `
      uniform float uGlow; varying vec2 vUv;
      void main(){
        float d = length(vUv-.5)*2.;
        float a = (exp(-d*3.4)*.7 + exp(-d*1.3)*.22) * uGlow * (1.-smoothstep(.85,1.,d));
        vec3 c = mix(vec3(1.,.86,.55), vec3(1.,.55,.2), d);
        gl_FragColor = vec4(c*a, a);
      }`,
    transparent: true,
    depthWrite: false,
    blending: THREE.CustomBlending,
    blendSrc: THREE.OneFactor,
    blendDst: THREE.OneMinusSrcAlphaFactor,
  })
  const halo = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), haloMat)
  halo.scale.setScalar(24)
  halo.position.set(0, (IMG_H / 2 - 340) * PX, -2.2)
  subject.add(halo)


  const plane = new THREE.PlaneGeometry(IMG_W * PX, IMG_H * PX)
  const slicesPer = coarse ? 3 : 4
  const layerGroups: { g: THREE.Group; z: number; mats: THREE.MeshBasicMaterial[] }[] = []
  const loader = new THREE.TextureLoader()
  const textures: THREE.Texture[] = []

  LAYERS.forEach((L) => {
    const tex = loader.load(`/img/logo3d/${L.name}.webp`)
    tex.colorSpace = THREE.SRGBColorSpace
    tex.anisotropy = 4
    textures.push(tex)
    const front = new THREE.MeshBasicMaterial({ map: tex, alphaTest: 0.5, alphaToCoverage: true, side: THREE.DoubleSide, transparent: true, opacity: 0 })
    const body = new THREE.MeshBasicMaterial({ map: tex, alphaTest: 0.5, color: new THREE.Color(0.62, 0.5, 0.42), side: THREE.DoubleSide, transparent: true, opacity: 0 })
    const g = new THREE.Group()
    for (let i = 0; i < slicesPer; i++) {
      const m = new THREE.Mesh(plane, i === 0 ? front : body)
      m.position.z = -(i / (slicesPer - 1)) * L.depth
      g.add(m)
    }
    subject.add(g)
    layerGroups.push({ g, z: L.z, mats: [front, body] })
  })


  const maxP = coarse ? 2600 : 7000
  const pGeo = new THREE.BufferGeometry()
  const pMat = new THREE.ShaderMaterial({
    uniforms: { uP: { value: 0 }, uScale: { value: 1 } },
    vertexShader:  `
      attribute vec3 aStart; attribute vec3 aCtrl; attribute vec3 aColor; attribute vec3 aT;
      uniform float uP; uniform float uScale; varying vec3 vC; varying float vA;
      void main(){
        float t = clamp((uP - aT.x - aT.y) / ${FLY.toFixed(2)}, 0., 1.);
        float e = 1. - pow(1. - t, 3.);
        float u = 1. - e;
        vec3 p = u*u*aStart + 2.*u*e*aCtrl + e*e*position;
        float a = aT.z * u * u;
        vec2 d = p.xy - position.xy;
        p.xy = position.xy + vec2(d.x*cos(a) - d.y*sin(a), d.x*sin(a) + d.y*cos(a));
        float spark = smoothstep(.78, .97, t) * (1. - smoothstep(.97, 1., t) * .6);
        vC = mix(aColor * (1.25 + u*.9), vec3(1., .96, .85), spark * .75);
        float landed = aT.x + ${(JITTER + FLY).toFixed(2)};
        vA = smoothstep(0., .06, uP - aT.x - aT.y) * (1. - smoothstep(landed, landed + .3, uP));
        vec4 mv = modelViewMatrix*vec4(p,1.);
        gl_PointSize = (mix(4.2, 2.1, e) + spark * 2.4) * uScale * 30. / -mv.z;
        gl_Position = projectionMatrix*mv;
      }`,
    fragmentShader: `varying vec3 vC; varying float vA; void main(){ float d=length(gl_PointCoord-.5); float a=smoothstep(.5,.1,d)*vA; gl_FragColor=vec4(vC*a,a); }`,
    transparent: true,
    depthWrite: false,
    blending: THREE.CustomBlending,
    blendSrc: THREE.OneFactor,
    blendDst: THREE.OneMinusSrcAlphaFactor,
  })
  const particles = new THREE.Points(pGeo, pMat)
  particles.frustumCulled = false
  particles.visible = false
  subject.add(particles)
  let target: Float32Array | null = null
  let gatherP = -1
  let bursting = false

  const startGather = (burst: boolean) => {
    if (!target) return
    const n = target.length / 3
    const start = new Float32Array(n * 3)
    const ctrl = new Float32Array(n * 3)
    const v = new THREE.Vector3()
    for (let i = 0; i < n; i++) {
      const tx = target[i * 3], ty = target[i * 3 + 1], tz = target[i * 3 + 2]
      v.randomDirection()
      if (burst) {
        start.set([tx, ty, tz], i * 3)
        ctrl.set([tx + v.x * 14, ty + v.y * 10 + 4, tz + v.z * 12], i * 3)
      } else {

        const th = Math.random() * Math.PI * 2, r = 20 + Math.random() * 16
        start.set([Math.cos(th) * r, -9 + Math.random() * 6, Math.sin(th) * r * 0.5 + 4], i * 3)
        ctrl.set([tx * 0.4 + Math.cos(th) * 6, ty + 5 + Math.random() * 5, tz + 7 + Math.random() * 4], i * 3)
      }
    }
    pGeo.setAttribute('aStart', new THREE.BufferAttribute(start, 3))
    pGeo.setAttribute('aCtrl', new THREE.BufferAttribute(ctrl, 3))
    bursting = burst
    gatherP = 0
  }

  const loadImg = (src: string) =>
    new Promise<HTMLImageElement>((res, rej) => {
      const im = new Image()
      im.onload = () => res(im)
      im.onerror = rej
      im.src = src
    })

  Promise.all(LAYERS.map((L) => loadImg(`/img/logo3d/${L.name}.webp`)))
    .then((imgs) => {
      const step = coarse ? 5 : 4
      const cw = Math.ceil(IMG_W / step), ch = Math.ceil(IMG_H / step)
      const c2 = document.createElement('canvas')
      c2.width = cw
      c2.height = ch
      const ctx = c2.getContext('2d', { willReadFrequently: true })!
      const pts: number[] = [], cols: number[] = [], lay: number[] = []
      imgs.forEach((im, li) => {
        ctx.clearRect(0, 0, cw, ch)
        ctx.drawImage(im, 0, 0, cw, ch)
        const d = ctx.getImageData(0, 0, cw, ch).data
        for (let y = 0; y < ch; y++)
          for (let x = 0; x < cw; x++) {
            const k = (y * cw + x) * 4
            if (d[k + 3] < 150) continue
            pts.push((x * step - IMG_W / 2) * PX, (IMG_H / 2 - y * step) * PX, LAYERS[li].z + 0.05)
            cols.push(d[k] / 255, d[k + 1] / 255, d[k + 2] / 255)
            lay.push(LAYERS[li].at)
          }
      })
      const total = pts.length / 3
      const n = Math.min(maxP, total)

      const idx = Array.from({ length: total }, (_, i) => i)
      for (let i = 0; i < n; i++) {
        const j = i + Math.floor(Math.random() * (total - i))
        ;[idx[i], idx[j]] = [idx[j], idx[i]]
      }
      target = new Float32Array(n * 3)
      const color = new Float32Array(n * 3)
      const tim = new Float32Array(n * 3)
      for (let i = 0; i < n; i++) {
        const s = idx[i]
        target.set(pts.slice(s * 3, s * 3 + 3), i * 3)
        color.set(cols.slice(s * 3, s * 3 + 3), i * 3)
        tim.set([lay[s], Math.random() * JITTER, (Math.random() < 0.5 ? -1 : 1) * (1.6 + Math.random() * 1.6)], i * 3)
      }
      pGeo.setAttribute('position', new THREE.BufferAttribute(target, 3))
      pGeo.setAttribute('aColor', new THREE.BufferAttribute(color, 3))
      pGeo.setAttribute('aT', new THREE.BufferAttribute(tim, 3))
      startGather(false)
    })
    .catch(() => layerGroups.forEach((l) => l.mats.forEach((m) => (m.opacity = 1))))


  const liftN = coarse ? 200 : 480
  const lift = new Float32Array(liftN * 3)
  const seed = new Float32Array(liftN)
  for (let i = 0; i < liftN; i++) {
    const r = 6 + Math.random() * 16
    const th = Math.random() * Math.PI * 2
    lift.set([Math.cos(th) * r, Math.random() * 30 - 12, Math.sin(th) * r - 4], i * 3)
    seed[i] = Math.random()
  }
  const liftGeo = new THREE.BufferGeometry()
  liftGeo.setAttribute('position', new THREE.BufferAttribute(lift, 3))
  liftGeo.setAttribute('seed', new THREE.BufferAttribute(seed, 1))
  const liftMat = new THREE.ShaderMaterial({
    uniforms: { uTime: time, uA: { value: 0.8 } },
    vertexShader:  `
      uniform float uTime; attribute float seed; varying float vS;
      void main(){
        vec3 p = position; float s = seed; vS = s;
        p.y = mod(p.y + uTime*(.5 + s*.9) + 12., 30.) - 12.;
        p.x += sin(uTime*.4 + s*20.)*.5;
        vec4 mv = modelViewMatrix*vec4(p,1.);
        gl_PointSize = (40. + s*60.) / -mv.z;
        gl_Position = projectionMatrix*mv;
      }`,
    fragmentShader: `uniform float uA; varying float vS; void main(){ float d=length(gl_PointCoord-.5); float a=smoothstep(.5,0.,d)*uA*(.4+.6*vS); gl_FragColor=vec4(vec3(1.,.82,.5)*a,a); }`,
    transparent: true,
    depthWrite: false,
    blending: THREE.CustomBlending,
    blendSrc: THREE.OneFactor,
    blendDst: THREE.OneMinusSrcAlphaFactor,
  })
  scene.add(new THREE.Points(liftGeo, liftMat))


  const starN = coarse ? 800 : 1600
  const starPos = new Float32Array(starN * 3)
  for (let i = 0; i < starN; i++) {
    const v = new THREE.Vector3().randomDirection().multiplyScalar(900)
    starPos.set([v.x, Math.abs(v.y) * 0.8 - 100, v.z], i * 3)
  }
  const starGeo = new THREE.BufferGeometry()
  starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3))
  const starMat = new THREE.PointsMaterial({ color: 0xfff4e0, size: coarse ? 2.2 : 1.8, sizeAttenuation: false, transparent: true, opacity: 0, depthWrite: false })
  const stars = new THREE.Points(starGeo, starMat)
  scene.add(stars)


  const camPos = new THREE.Vector3()
  const look = new THREE.Vector3()
  const tgt = new THREE.Vector3()
  const tgtLook = new THREE.Vector3()
  const proj = new THREE.Vector3()
  let yaw = 0, offset = 0, spread = 1, hover = 0
  let lastGather = store.gatherAt
  let first = true
  let last = performance.now()
  let raf = 0
  let w = 1, h = 1
  let lastTop = '', lastHz = ''
  const root = document.documentElement.style
  const css = (c: number[]) => `${Math.round(c[0] * 255)} ${Math.round(c[1] * 255)} ${Math.round(c[2] * 255)}`

  const resize = () => {
    w = host.clientWidth
    h = host.clientHeight
    renderer.setSize(w, h, false)
    camera.aspect = w / h
    camera.fov = w < 700 ? 58 : 40
    camera.updateProjectionMatrix()
    pMat.uniforms.uScale.value = (h / 900) * renderer.getPixelRatio()
  }
  resize()
  addEventListener('resize', resize)


  let lastRender = 0, lastPhase = -1, lastPX = 0, lastPY = 0, slow = 0
  const frame = (now: number) => {
    raf = requestAnimationFrame(frame)
    const moving = gatherP >= 0 || store.phase !== lastPhase || store.pointerX !== lastPX || store.pointerY !== lastPY ||
      camPos.distanceToSquared(tgt) > 1e-4
    lastPhase = store.phase
    lastPX = store.pointerX
    lastPY = store.pointerY
    if (!moving && now - lastRender < 1000 / (coarse ? 15 : 24)) return
    lastRender = now

    if (moving) {
      slow = slow * 0.95 + (now - last > 22 ? 1 : 0) * 0.05
      if (slow > 0.5 && maxDpr > 0.6) {
        maxDpr = Math.max(0.6, maxDpr - 0.15)
        renderer.setPixelRatio(maxDpr)
        resize()
        slow = 0
      }
    }
    const dt = Math.min((now - last) / 1000, 0.05)
    last = now
    time.value += dt

    if (store.gatherAt !== lastGather) {
      lastGather = store.gatherAt
      startGather(true)
    }

    const s = stateFor(store.phase)
    const k = first ? 1 : 1 - Math.exp(-dt / 0.12)
    first = false
    const narrow = w < 700
    tgt.set(...s.cam)
    if (narrow) tgt.z *= store.phase < 1 ? 1.75 : 1.5
    tgtLook.set(...s.look)
    camPos.lerp(tgt, k)
    look.lerp(tgtLook, k)
    yaw += (s.yaw - yaw) * k
    offset += ((narrow ? 0 : s.offsetX) - offset) * k
    const liftView = narrow && store.phase < 1 ? 0.24 * (1 - store.phase) : 0

    camera.position.copy(camPos)
    camera.lookAt(look)
    camera.setViewOffset(w, h, offset * w, liftView * h, w, h)


    proj.set(0, 2.6, 0).project(camera)
    const dist = Math.hypot(store.pointerX - proj.x, -store.pointerY - proj.y)
    const want = coarse ? 0 : 1 - THREE.MathUtils.smoothstep(dist, 0.15, 0.6)
    hover += (want - hover) * (1 - Math.exp(-dt / 0.25))
    spread += (s.spread + hover * 1.6 - spread) * k

    subject.rotation.y = THREE.MathUtils.clamp(yaw + store.pointerX * 0.15, -0.62, 0.62)
    subject.rotation.x = store.pointerY * 0.1
    subject.position.y = 2.6 + Math.sin(time.value * 0.8) * 0.15
    layerGroups.forEach((l, i) => {
      l.g.position.z = l.z * spread
      if (i === 2) l.g.position.y = hover * 0.35
      if (i === 0) l.g.rotation.z = Math.sin(time.value * 0.5) * 0.02
    })


    let pulse = 0
    if (gatherP >= 0) {
      gatherP += (dt / GATHER_SECS) * END
      pMat.uniforms.uP.value = gatherP

      layerGroups.forEach((l, i) => {
        const land = LAYERS[i].at + JITTER + FLY
        const solid = THREE.MathUtils.smoothstep(gatherP, land - 0.25, land + 0.1)
        const op = bursting && gatherP < 0.15 ? 1 - gatherP / 0.15 : solid
        l.mats.forEach((m) => (m.opacity = op))
      })
      pulse = Math.exp(-(((gatherP - LAST_LAND) / 0.12) ** 2))
      if (gatherP > END) {
        gatherP = -1
        layerGroups.forEach((l) => l.mats.forEach((m) => (m.opacity = 1)))
      }
    }
    particles.visible = gatherP >= 0

    haloMat.uniforms.uGlow.value = s.glow * (1 + pulse * 0.9)
    liftMat.uniforms.uA.value = 0.45 + s.stars * 0.5
    starMat.opacity = s.stars
    stars.rotation.y += dt * 0.004


    const top = css(s.skyTop), hz = css(s.skyHorizon)
    if (top !== lastTop) root.setProperty('--sky-top', (lastTop = top))
    if (hz !== lastHz) root.setProperty('--sky-hz', (lastHz = hz))

    renderer.render(scene, camera)
  }
  raf = requestAnimationFrame(frame)

  return () => {
    cancelAnimationFrame(raf)
    removeEventListener('resize', resize)
    textures.forEach((t) => t.dispose())
    scene.traverse((o) => {
      const m = o as THREE.Mesh
      m.geometry?.dispose()
      ;(m.material as THREE.Material | undefined)?.dispose?.()
    })
    renderer.dispose()
    canvas.remove()
  }
}
