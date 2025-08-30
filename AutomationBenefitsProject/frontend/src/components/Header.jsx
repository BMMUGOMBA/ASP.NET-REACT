import { Link, useNavigate } from 'react-router-dom'
import { Auth } from '../lib/auth'

export default function Header(){
  const me = Auth.me()
  const nav = useNavigate()
  const logout = ()=>{ Auth.logout(); nav('/login') }
  return (
    <header className="header">
      <div className="container">
        <div style={{fontWeight:700}}>Automation Benefits</div>
        <nav className="nav">
          {me && me.role==='Admin' && <Link to="/admin">Admin</Link>}
          {me && <Link to="/">Dashboard</Link>}
          {!me ? <Link to="/login" className="btn secondary">Login</Link> :
            <button className="btn secondary" onClick={logout}>Logout</button>}
        </nav>
      </div>
    </header>
  )
}
