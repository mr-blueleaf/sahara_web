
export type Vec3 = [number, number, number]
export type Rgb = [number, number, number]

export type ActState = {
  cam: Vec3
  look: Vec3
  yaw: number
  offsetX: number
  skyTop: Rgb
  skyHorizon: Rgb
  glow: number
  stars: number
  spread: number
}

const hex = (h: string): Rgb => {
  const n = parseInt(h.slice(1), 16)
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255]
}


export const ACTS: ActState[] = [

  { cam: [0, 2.2, 25], look: [0, 2.6, 0], yaw: -0.25, offsetX: -0.2, skyTop: hex('#2a1a3a'), skyHorizon: hex('#f4a35a'), glow: 1, stars: 0.35, spread: 1 },

  { cam: [0, 1.5, 21], look: [0, 2.4, 0], yaw: -0.5, offsetX: -0.24, skyTop: hex('#5d6fa6'), skyHorizon: hex('#ffd29a'), glow: 0.9, stars: 0, spread: 2.8 },

  { cam: [0, 5, 30], look: [0, 2.5, 0], yaw: 0.35, offsetX: 0.02, skyTop: hex('#4f8fc7'), skyHorizon: hex('#ffe6be'), glow: 0.8, stars: 0, spread: 1.6 },

  { cam: [0, 7, 40], look: [0, 2.5, 0], yaw: -0.35, offsetX: -0.33, skyTop: hex('#3f86c4'), skyHorizon: hex('#fff0d2'), glow: 0.75, stars: 0, spread: 1.2 },

  { cam: [0, 3, 34], look: [0, 2.5, 0], yaw: 0.4, offsetX: 0.2, skyTop: hex('#6b74ad'), skyHorizon: hex('#ffbe73'), glow: 0.9, stars: 0, spread: 2.2 },

  { cam: [0, 2, 28], look: [0, 2.6, 0], yaw: -0.3, offsetX: -0.2, skyTop: hex('#2b2050'), skyHorizon: hex('#ef7b45'), glow: 1.1, stars: 0.3, spread: 1.4 },

  { cam: [0, 1.4, 30], look: [0, -1.2, 0], yaw: 0, offsetX: 0, skyTop: hex('#07081a'), skyHorizon: hex('#2a1838'), glow: 1.4, stars: 1, spread: 1 },
]

const lerp = (a: number, b: number, t: number) => a + (b - a) * t
const smooth = (t: number) => t * t * (3 - 2 * t)
const mix3 = <T extends number[]>(a: T, b: T, t: number) => a.map((v, i) => lerp(v, b[i], t)) as T

export function stateFor(phase: number): ActState {
  const p = Math.min(Math.max(phase, 0), ACTS.length - 1)
  const i = Math.min(Math.floor(p), ACTS.length - 2)
  const a = ACTS[i]
  const b = ACTS[i + 1]
  const t = smooth(p - i)
  return {
    cam: mix3(a.cam, b.cam, t),
    look: mix3(a.look, b.look, t),
    yaw: lerp(a.yaw, b.yaw, t),
    offsetX: lerp(a.offsetX, b.offsetX, t),
    skyTop: mix3(a.skyTop, b.skyTop, t),
    skyHorizon: mix3(a.skyHorizon, b.skyHorizon, t),
    glow: lerp(a.glow, b.glow, t),
    stars: lerp(a.stars, b.stars, t),
    spread: lerp(a.spread, b.spread, t),
  }
}
