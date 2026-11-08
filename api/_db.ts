import type { IncomingMessage, ServerResponse } from 'node:http'
import { timingSafeEqual } from 'node:crypto'
import { MongoClient } from 'mongodb'


const g = globalThis as unknown as { _mongo?: Promise<MongoClient> }

export async function submissions() {
  const uri = process.env.MONGODB_URI
  if (!uri) throw new Error('MONGODB_URI is not set')
  g._mongo ??= new MongoClient(uri).connect()
  const col = (await g._mongo).db(process.env.MONGODB_DB || 'sahara').collection('submissions')
  return col
}

export type Req = IncomingMessage & { body?: unknown }


export async function readBody(req: Req): Promise<Record<string, unknown>> {
  if (req.body && typeof req.body === 'object') return req.body as Record<string, unknown>
  let raw = typeof req.body === 'string' ? req.body : ''
  if (!raw) for await (const c of req) { raw += c; if (raw.length > 20_000) break }
  try { return JSON.parse(raw || '{}') } catch { return {} }
}

export function send(res: ServerResponse, status: number, data: unknown) {
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json')
  res.setHeader('Cache-Control', 'no-store')
  res.end(JSON.stringify(data))
}


export function isAdmin(req: Req) {
  const { ADMIN_EMAIL: email, ADMIN_PASSWORD: pw } = process.env
  if (!email || !pw || pw.length < 12) return false
  const want = Buffer.from(`${email.toLowerCase()}:${pw}`).toString('base64')
  const got = (req.headers.authorization || '').replace(/^Bearer /, '')
  const a = Buffer.from(got), b = Buffer.from(want)
  return a.length === b.length && timingSafeEqual(a, b)
}
