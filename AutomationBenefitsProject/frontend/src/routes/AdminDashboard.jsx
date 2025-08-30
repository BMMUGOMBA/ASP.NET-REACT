// src/routes/AdminDashboard.jsx
import React, { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Store } from '../lib/store'
import { Auth } from '../lib/auth'

export default function AdminDashboard(){
  const nav = useNavigate()
  const me = Auth.me() // guard should ensure Admin
  const [q, setQ] = useState('')

  // load once per render. For a reactive list, you can add a simple polling/subscribe later.
  const [rows, setRows] = useState(() => Store.all())

  const filtered = useMemo(() => {
    const x = (q||'').trim().toLowerCase()
    if (!x) return rows.slice().sort(byUpdated)
    return rows
      .filter(p =>
        (p.processName||'').toLowerCase().includes(x) ||
        (p.requesterName||'').toLowerCase().includes(x) ||
        (p.businessUnit||'').toLowerCase().includes(x) ||
        (p.status||'').toLowerCase().includes(x)
      )
      .sort(byUpdated)
  }, [rows, q])

  function refresh(){ setRows(Store.all()) }

  const doApprove = (id) => {
    Store.approve(id, me, 'Approved')
    refresh()
  }
  const doRequest = (id) => {
    const msg = prompt('Comment to the requester:')
    Store.requestChanges(id, me, msg || '')
    refresh()
  }

  return (
    <div className="container">
      <div className="panel">
        <div className="toolbar">
          <h2 style={{margin:0}}>Admin – All Projects</h2>
          <div style={{display:'flex', gap:8}}>
            <input
              className="input"
              placeholder="Search process / requester / BU / status…"
              value={q}
              onChange={e=>setQ(e.target.value)}
              style={{minWidth:280}}
            />
            <button className="btn secondary" onClick={refresh}>Refresh</button>
          </div>
        </div>

        <div className="card" style={{padding:0}}>
          <div className="row" style={{fontWeight:600, color:'#334155', padding:'10px 12px'}}>
            <div className="col">Process</div>
            <div className="col">BU</div>
            <div className="col">Requester</div>
            <div className="col">Status</div>
            <div className="col">% Auto</div>
            <div className="col">Updated</div>
            <div className="col" style={{textAlign:'right'}}>Actions</div>
          </div>

          {filtered.map(p => (
            <div key={p.id} className="row" style={{alignItems:'center', padding:'10px 12px', borderTop:'1px solid #eef2f7'}}>
              <div className="col" style={{fontWeight:600}}>{p.processName}</div>
              <div className="col">{p.businessUnit || '—'}</div>
              <div className="col">{p.requesterName || '—'}</div>
              <div className="col"><span className="badge">{p.status || 'Draft'}</span></div>
              <div className="col">{p.percentAutomated ?? '—'}</div>
              <div className="col">{p.updatedAt ? new Date(p.updatedAt).toLocaleString() : '—'}</div>
              <div className="col" style={{display:'flex', justifyContent:'flex-end', gap:8}}>
                <Link className="btn secondary" to={`/admin/view/${p.id}`}>Open</Link>
                <button className="btn" onClick={()=>doApprove(p.id)}>Approve</button>
                <button className="btn secondary" onClick={()=>doRequest(p.id)}>Request</button>
              </div>
            </div>
          ))}

          {filtered.length === 0 && (
            <div style={{padding:14}} className="footer-note">No projects found.</div>
          )}
        </div>
      </div>
    </div>
  )
}

function byUpdated(a,b){
  const ax = a.updatedAt ? Date.parse(a.updatedAt) : 0
  const bx = b.updatedAt ? Date.parse(b.updatedAt) : 0
  return bx - ax
}
