/*import { useNavigate, useParams } from 'react-router-dom'
import { Store } from '../lib/store'
import { Auth } from '../lib/auth'
import React, { useState } from 'react'

export default function AdminDashboard(){
  const me = Auth.me(); const nav = useNavigate()
  if(!me || me.role!=='Admin'){ nav('/'); return null }
  const items = Store.listAll()
  return (
    <div className="container">
      <div className="panel"><h1 className="h1">Admin Dashboard</h1></div>
      <div className="panel">
        <table className="table">
          <thead><tr><th>Process</th><th>BU</th><th>Requester</th><th>Status</th><th>Updated</th><th></th></tr></thead>
          <tbody>
            {items.map(p=>(
              <tr key={p.id}>
                <td>{p.processName}</td><td>{p.businessUnit}</td><td>{p.requesterName}</td>
                <td><span className="badge">{p.status}</span></td>
                <td>{new Date(p.updatedAt).toLocaleString()}</td>
                <td><button className="btn secondary" onClick={()=>nav(`/admin/view/${p.id}`)}>Open</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export function AdminProjectView(){
  const { id } = useParams(); const nav = useNavigate()
  const me = Auth.me(); if(!me || me.role!=='Admin'){ nav('/'); return null }
  const p = Store.get(id); const [note,setNote]=useState('')
  if(!p) return <div className="container"><div className="panel">Not found</div></div>

  const approve = ()=>{ Store.approve(p.id, me, note); nav('/admin') }
  const changes = ()=>{ if(!note.trim()) return alert('Please enter comment'); Store.requestChanges(p.id, me, note); nav('/admin') }

  return (
    <div className="container">
      <div className="panel"><div className="row" style={{alignItems:'center'}}><h1 className="h1" style={{flex:1}}>{p.processName}</h1><span className="badge">{p.status}</span></div></div>

      <div className="panel">
        <div className="h2">User Submission</div>
        <pre className="card" style={{whiteSpace:'pre-wrap'}}>{JSON.stringify(p, null, 2)}</pre>
      </div>

      <div className="panel">
        <div className="h2">Admin Decision</div>
        <textarea rows="3" className="input" placeholder="Enter approval note or requested changes…" value={note} onChange={e=>setNote(e.target.value)} />
        <div className="toolbar" style={{marginTop:10}}>
          <button className="btn ok" onClick={approve}>Approve</button>
          <button className="btn warn" onClick={changes}>Request Changes</button>
          <button className="btn secondary" onClick={()=>nav('/admin')}>Back</button>
        </div>
      </div>
    </div>
  )
}
*/
import { useNavigate, useParams } from 'react-router-dom'
import { Store } from '../lib/store'
import { Auth } from '../lib/auth'
import React, { useState } from 'react'

export default function AdminDashboard(){
  const me = Auth.me() // Guard ensures Admin
  const items = Store.listAll()
  return (
    <div className="container">
      <div className="panel"><h1 className="h1">Admin Dashboard</h1></div>
      <div className="panel">
        <table className="table">
          <thead><tr><th>Process</th><th>BU</th><th>Requester</th><th>Status</th><th>Updated</th><th></th></tr></thead>
          <tbody>
            {items.map(p=>(
              <tr key={p.id}>
                <td>{p.processName}</td><td>{p.businessUnit}</td><td>{p.requesterName}</td>
                <td><span className="badge">{p.status}</span></td>
                <td>{new Date(p.updatedAt).toLocaleString()}</td>
                <td><OpenBtn id={p.id}/></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
function OpenBtn({id}){ const nav=useNavigate(); return <button className="btn secondary" onClick={()=>nav(`/admin/view/${id}`)}>Open</button> }

export function AdminProjectView(){
  const { id } = useParams(); const nav = useNavigate()
  const me = Auth.me() // Guard ensures Admin
  const p = Store.get(id); const [note,setNote]=useState('')
  if(!p) return <div className="container"><div className="panel">Not found</div></div>

  const approve = ()=>{ Store.approve(p.id, me, note); nav('/admin') }
  const changes = ()=>{ if(!note.trim()) return alert('Please enter comment'); Store.requestChanges(p.id, me, note); nav('/admin') }

  return (
    <div className="container">
      <div className="panel"><div className="row" style={{alignItems:'center'}}><h1 className="h1" style={{flex:1}}>{p.processName}</h1><span className="badge">{p.status}</span></div></div>
      <div className="panel">
        <div className="h2">User Submission</div>
        <pre className="card" style={{whiteSpace:'pre-wrap'}}>{JSON.stringify(p, null, 2)}</pre>
      </div>
      <div className="panel">
        <div className="h2">Admin Decision</div>
        <textarea rows="3" className="input" placeholder="Enter approval note or requested changes…" value={note} onChange={e=>setNote(e.target.value)} />
        <div className="toolbar" style={{marginTop:10}}>
          <button className="btn ok" onClick={approve}>Approve</button>
          <button className="btn warn" onClick={changes}>Request Changes</button>
          <button className="btn secondary" onClick={()=>nav('/admin')}>Back</button>
        </div>
      </div>
    </div>
  )
}
