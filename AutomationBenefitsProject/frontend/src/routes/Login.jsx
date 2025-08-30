// src/routes/Login.jsx
import React, { useState } from 'react'
import { Auth } from '../lib/auth'
import { useNavigate } from 'react-router-dom'

export default function Login(){
  const [email,setEmail]=useState('admin@example.com')
  const [password,setPassword]=useState('Admin123$')
  const [err,setErr]=useState('')
  const nav=useNavigate()

  const submit=(e)=>{ 
    e.preventDefault(); setErr('')
    try{ Auth.login(email,password); nav('/', { replace:true }) }
    catch(ex){ setErr(ex.message || 'Login failed') }
  }

  const resetDemo = () => {
    Auth.resetDemo()
    setEmail('admin@example.com')
    setPassword('Admin123$')
    setErr('')
    alert('Demo users reset. Try logging in again.')
  }

  return (
    <div className="container">
      <div className="panel" style={{maxWidth:480, margin:'80px auto'}}>
        <h1 className="h1">Sign in</h1>
        <form onSubmit={submit} className="row">
          <div className="col">
            <label>Email</label>
            <input className="input" value={email} onChange={e=>setEmail(e.target.value)} type="email" required/>
          </div>
          <div className="col">
            <label>Password</label>
            <input className="input" value={password} onChange={e=>setPassword(e.target.value)} type="password" required/>
          </div>
          {err && <div className="col" style={{color:'crimson'}}>{err}</div>}
          <div className="toolbar"><button className="btn">Login</button></div>
        </form>
        <div className="footer-note" style={{marginTop:10}}>
          Trouble logging in? <button type="button" className="btn secondary" onClick={resetDemo}>Reset demo users</button>
        </div>
      </div>
    </div>
  )
}
