import type { ServerResponse } from 'node:http'
import { IDENTITIES, PURPOSES } from '../src/data.js'
import { readBody, send, submissions, type Req } from './_db.js'

export default async function handler(req: Req, res: ServerResponse) {
  if (req.method !== 'POST') return send(res, 405, { error: 'POST only' })
  const b = await readBody(req)
  const s = (k: string, max: number) => (typeof b[k] === 'string' ? (b[k] as string).trim().slice(0, max) : '')

  if (s('website', 200)) return send(res, 200, { ok: true })
  const doc = {
    name: s('name', 120),
    email: s('email', 160),
    identity: IDENTITIES.includes(s('identity', 40)) ? s('identity', 40) : 'Student',
    purpose: s('purpose', 60),
    message: s('message', 3000),
    status: 'new' as const,
    created_at: new Date(),
  }
  if (doc.name.length < 2 || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(doc.email) || !PURPOSES.includes(doc.purpose) || doc.message.length < 10)
    return send(res, 400, { error: 'Invalid submission' })

  try {
    await (await submissions()).insertOne(doc)
    send(res, 201, { ok: true })
  } catch (e) {
    console.error(e)
    send(res, 500, { error: 'Could not save' })
  }
}
