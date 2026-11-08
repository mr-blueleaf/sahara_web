import type { ServerResponse } from 'node:http'
import { ObjectId } from 'mongodb'
import { isAdmin, readBody, send, submissions, type Req } from './_db.js'


const STATUSES = ['new', 'read', 'replied']

export default async function handler(req: Req, res: ServerResponse) {
  if (!isAdmin(req)) return send(res, 401, { error: 'Unauthorized' })
  try {
    const col = await submissions()
    if (req.method === 'GET') {
      const rows = await col.find().sort({ created_at: -1 }).limit(1000).toArray()
      return send(res, 200, rows.map(({ _id, ...r }) => ({ ...r, id: String(_id) })))
    }
    const b = await readBody(req)
    if (typeof b.id !== 'string' || !ObjectId.isValid(b.id)) return send(res, 400, { error: 'Bad id' })
    const _id = new ObjectId(b.id)
    if (req.method === 'PATCH') {
      if (!STATUSES.includes(b.status as string)) return send(res, 400, { error: 'Bad status' })
      await col.updateOne({ _id }, { $set: { status: b.status as string } })
      return send(res, 200, { ok: true })
    }
    if (req.method === 'DELETE') {
      await col.deleteOne({ _id })
      return send(res, 200, { ok: true })
    }
    send(res, 405, { error: 'Method not allowed' })
  } catch (e) {
    console.error(e)
    send(res, 500, { error: 'Server error' })
  }
}
