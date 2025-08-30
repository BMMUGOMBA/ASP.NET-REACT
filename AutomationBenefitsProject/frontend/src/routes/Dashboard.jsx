/*import { Link, useNavigate } from 'react-router-dom'
import { Auth } from '../lib/auth'
import { Store } from '../lib/store'

export default function Dashboard(){
  const me = Auth.me()
  const nav = useNavigate()
  if(!me) { nav('/login'); return null }

  const my = me.role==='Admin' ? Store.listAll() : Store.listMine(me.userId)
  return (
    <div className="container">
      <div className="panel">
        <div className="row" style={{alignItems:'center'}}>
          <h1 className="h1" style={{flex:'1'}}>Welcome, {me.name}</h1>
          {me.role==='User' && <Link className="btn" to="/new">Start New Project</Link>}
          {me.role==='Admin' && <Link className="btn" to="/admin">Go to Admin Dashboard</Link>}
        </div>
      </div>

      <div className="panel">
        <div className="h2">{me.role==='Admin' ? 'All Projects' : 'My Projects'}</div>
        <ProjectsTable items={my} isAdmin={me.role==='Admin'} />
      </div>
    </div>
  )
}

function ProjectsTable({items,isAdmin}){
  const nav = useNavigate()
  return (
    <table className="table">
      <thead><tr>
        <th>Process</th><th>BU</th><th>Requester</th><th>Status</th><th>Updated</th><th></th>
      </tr></thead>
      <tbody>
        {items.map(p=>(
          <tr key={p.id}>
            <td>{p.processName}</td>
            <td>{p.businessUnit}</td>
            <td>{p.requesterName}</td>
            <td><span className="badge">{p.status}</span></td>
            <td>{new Date(p.updatedAt).toLocaleString()}</td>
            <td><button className="btn secondary" onClick={()=>nav(isAdmin?`/admin/view/${p.id}`:`/view/${p.id}`)}>View</button></td>
          </tr>
        ))}
        {items.length===0 && <tr><td colSpan="6">No projects yet.</td></tr>}
      </tbody>
    </table>
  )
}
*/

import { Link, useNavigate } from 'react-router-dom'
import { Auth } from '../lib/auth'
import { Store } from '../lib/store'

export default function Dashboard(){
  const me = Auth.me() // route Guard guarantees this exists
  const my = me.role==='Admin' ? Store.listAll() : Store.listMine(me.userId)

  return (
    <div className="container">
      <div className="panel">
        <div className="row" style={{alignItems:'center'}}>
          <h1 className="h1" style={{flex:'1'}}>Welcome, {me.name}</h1>
          {me.role==='User' && <Link className="btn" to="/new">Start New Project</Link>}
          {me.role==='Admin' && <Link className="btn" to="/admin">Go to Admin Dashboard</Link>}
        </div>
      </div>

      <div className="panel">
        <div className="h2">{me.role==='Admin' ? 'All Projects' : 'My Projects'}</div>
        <ProjectsTable items={my} isAdmin={me.role==='Admin'} />
      </div>
    </div>
  )
}

function ProjectsTable({items,isAdmin}){
  const nav = useNavigate()
  return (
    <table className="table">
      <thead><tr>
        <th>Process</th><th>BU</th><th>Requester</th><th>Status</th><th>Updated</th><th></th>
      </tr></thead>
      <tbody>
        {items.map(p=>(
          <tr key={p.id}>
            <td>{p.processName}</td>
            <td>{p.businessUnit}</td>
            <td>{p.requesterName}</td>
            <td><span className="badge">{p.status}</span></td>
            <td>{new Date(p.updatedAt).toLocaleString()}</td>
            <td><button className="btn secondary" onClick={()=>nav(isAdmin?`/admin/view/${p.id}`:`/view/${p.id}`)}>View</button></td>
          </tr>
        ))}
        {items.length===0 && <tr><td colSpan="6">No projects yet.</td></tr>}
      </tbody>
    </table>
  )
}
