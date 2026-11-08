import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { PURPOSES } from '../data'
import './admin.css'



type Submission = {
  id: string
  created_at: string
  name: string
  email: string
  identity: string
  purpose: string
  message: string
  status: 'new' | 'read' | 'replied'
}
type Filter = 'all' | Submission['status']

const KEY = 'sahara-admin-token'
const getToken = () => { try { return sessionStorage.getItem(KEY) || '' } catch { return '' } }
const setToken = (t: string) => { try { t ? sessionStorage.setItem(KEY, t) : sessionStorage.removeItem(KEY) } catch {  } }

async function api(token: string, method = 'GET', body?: object) {
  const r = await fetch('/api/admin', {
    method,
    headers: { Authorization: `Bearer ${token}`, ...(body && { 'Content-Type': 'application/json' }) },
    body: body && JSON.stringify(body),
  })
  if (r.status === 401) throw new Error('401')
  if (!r.ok) throw new Error((await r.json().catch(() => ({}))).error || `Error ${r.status}`)
  return r.json()
}

export default function Admin() {
  const [token, setTok] = useState(getToken)
  const login = (t: string) => { setToken(t); setTok(t) }

  useEffect(() => {
    document.title = 'Admin · SAHARA'
    const robots = document.createElement('meta')
    robots.name = 'robots'
    robots.content = 'noindex, nofollow'
    document.head.appendChild(robots)
    return () => robots.remove()
  }, [])

  return (
    <div className="ad">
      <header className="ad-top">
        <a href="/" className="ad-brand"><img src="/img/logo.jpeg" alt="" width="34" height="34" /><span>SAHARA <small>Admin</small></span></a>
        {token && <button className="ad-btn ghost" onClick={() => login('')}>Sign out</button>}
      </header>
      <main className="ad-main">{token ? <Dashboard token={token} onAuthFail={() => login('')} /> : <Login onLogin={login} />}</main>
    </div>
  )
}

function Login({ onLogin }: { onLogin: (t: string) => void }) {
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)
  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const f = new FormData(e.currentTarget)
    const pw = btoa(unescape(encodeURIComponent(`${String(f.get('email')).trim().toLowerCase()}:${f.get('password')}`)))
    setBusy(true)
    setErr('')
    try {
      await api(pw)
      onLogin(pw)
    } catch (x) {
      setErr((x as Error).message === '401' ? 'Wrong email or password.' : (x as Error).message)
    }
    setBusy(false)
  }
  return (
    <form className="ad-card ad-login" onSubmit={submit}>
      <img src="/img/logo.jpeg" alt="SAHARA" width="64" height="64" />
      <h1>Admin sign in</h1>
      <p className="ad-muted">Contact-form submissions for the SAHARA team.</p>
      <label>Email<input name="email" type="email" autoComplete="username" required /></label>
      <label>Password<input name="password" type="password" autoComplete="current-password" required /></label>
      {err && <p className="ad-err" role="alert">{err}</p>}
      <button className="ad-btn" disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</button>
    </form>
  )
}

function Dashboard({ token, onAuthFail }: { token: string; onAuthFail: () => void }) {
  const [rows, setRows] = useState<Submission[]>([])
  const [filter, setFilter] = useState<Filter>('all')
  const [purpose, setPurpose] = useState('')
  const [q, setQ] = useState('')
  const [open, setOpen] = useState<string | null>(null)
  const [err, setErr] = useState('')

  const fail = (x: unknown) => ((x as Error).message === '401' ? onAuthFail() : setErr((x as Error).message))

  useEffect(() => {
    let live = true
    const load = () => api(token).then((d) => live && setRows(d), (x) => live && fail(x))
    load()

    const t = setInterval(load, 20_000)
    return () => { live = false; clearInterval(t) }

  }, [token])

  const shown = useMemo(() => {
    const needle = q.trim().toLowerCase()
    return rows.filter((r) =>
      (filter === 'all' || r.status === filter) &&
      (!purpose || r.purpose === purpose) &&
      (!needle || `${r.name} ${r.email} ${r.message}`.toLowerCase().includes(needle)),
    )
  }, [rows, filter, purpose, q])

  const count = (s: Filter) => (s === 'all' ? rows.length : rows.filter((r) => r.status === s).length)

  const setStatus = async (r: Submission, status: Submission['status']) => {
    const prev = r.status
    setRows((all) => all.map((x) => (x.id === r.id ? { ...x, status } : x)))
    try {
      await api(token, 'PATCH', { id: r.id, status })
    } catch (x) {
      setRows((all) => all.map((y) => (y.id === r.id ? { ...y, status: prev } : y)))
      fail(x)
    }
  }
  const remove = async (r: Submission) => {
    if (!confirm(`Delete the message from ${r.name}? This can't be undone.`)) return
    try {
      await api(token, 'DELETE', { id: r.id })
      setRows((all) => all.filter((x) => x.id !== r.id))
    } catch (x) { fail(x) }
  }
  const toggle = (r: Submission) => {
    setOpen(open === r.id ? null : r.id)
    if (r.status === 'new') setStatus(r, 'read')
  }

  return (
    <>
      <div className="ad-head">
        <div>
          <h1>Inbox</h1>
          <p className="ad-muted">Refreshes every 20 seconds</p>
        </div>
        <button className="ad-btn ghost" onClick={() => exportCsv(shown)} disabled={!shown.length}>Export CSV ({shown.length})</button>
      </div>

      <div className="ad-stats">
        {(['all', 'new', 'read', 'replied'] as Filter[]).map((s) => (
          <button key={s} className={`ad-stat ${filter === s ? 'on' : ''}`} onClick={() => setFilter(s)}>
            <strong>{count(s)}</strong><span>{s === 'all' ? 'Total' : s[0].toUpperCase() + s.slice(1)}</span>
          </button>
        ))}
      </div>

      <div className="ad-tools">
        <input type="search" placeholder="Search name, email or message…" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search" />
        <select value={purpose} onChange={(e) => setPurpose(e.target.value)} aria-label="Filter by purpose">
          <option value="">All purposes</option>
          {PURPOSES.map((p) => <option key={p}>{p}</option>)}
        </select>
      </div>

      {err && <p className="ad-err" role="alert">{err}</p>}

      <ul className="ad-list">
        {shown.map((r) => (
          <li key={r.id} className={`ad-row ${r.status} ${open === r.id ? 'open' : ''}`}>
            <button className="ad-row-head" onClick={() => toggle(r)} aria-expanded={open === r.id}>
              <span className={`ad-dot ${r.status}`} title={r.status} />
              <span className="ad-who"><strong>{r.name}</strong><small>{r.email}</small></span>
              <span className="ad-tag">{r.purpose}</span>
              <span className="ad-tag soft">{r.identity}</span>
              <span className="ad-when">{fmt(r.created_at)}</span>
            </button>
            {open === r.id && (
              <div className="ad-body">
                <p className="ad-msg">{r.message}</p>
                <div className="ad-actions">
                  <a className="ad-btn" href={`mailto:${r.email}?subject=${encodeURIComponent(`Re: your message to SAHARA (${r.purpose})`)}`} onClick={() => setStatus(r, 'replied')}>Reply by email</a>
                  {r.status !== 'replied' && <button className="ad-btn ghost" onClick={() => setStatus(r, 'replied')}>Mark replied</button>}
                  {r.status !== 'new' && <button className="ad-btn ghost" onClick={() => setStatus(r, 'new')}>Mark unread</button>}
                  <button className="ad-btn danger" onClick={() => remove(r)}>Delete</button>
                </div>
              </div>
            )}
          </li>
        ))}
        {!shown.length && <li className="ad-empty">{rows.length ? 'Nothing matches these filters.' : 'No submissions yet. They’ll appear here shortly after someone writes in.'}</li>}
      </ul>
    </>
  )
}

const fmt = (iso: string) => new Date(iso).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })

function exportCsv(rows: Submission[]) {

  const cell = (v: string | number) => {
    let t = String(v)
    if (/^[=+\-@\t\r]/.test(t)) t = `'${t}`
    return `"${t.replace(/"/g, '""')}"`
  }
  const head = ['id', 'created_at', 'name', 'email', 'identity', 'purpose', 'status', 'message']
  const csv = [head.join(','), ...rows.map((r) => head.map((h) => cell(r[h as keyof Submission])).join(','))].join('\r\n')
  const a = document.createElement('a')
  a.href = URL.createObjectURL(new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' }))
  a.download = `sahara-submissions-${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(a.href)
}
