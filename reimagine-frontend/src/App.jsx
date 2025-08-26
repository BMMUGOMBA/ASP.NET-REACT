import React from 'react'
import { Routes, Route, Navigate, Link } from 'react-router-dom'
import TopBar from './components/TopBar.jsx'
import LoginPage from './pages/LoginPage.jsx'
import UserRequestPage from './pages/UserRequestPage.jsx'
import AdminDashboard from './pages/AdminDashboard.jsx'
import AdminAssessmentPage from './pages/AdminAssessmentPage.jsx'
import ProtectedRoute from './router/ProtectedRoute.jsx'
import { useAuth } from './context/AuthContext.jsx'

function Home() {
  const { user } = useAuth()
  return (
    <div className="container">
      <div className="card">
        <h2>Automation Benefits Realization Assessment</h2>
        <p style={{color:'#9ca3af'}}>
          This is a front-end-only demo. Data is stored in <b>localStorage</b>.
          Use the buttons below to jump in.
        </p>
        <div style={{display:'flex', gap:10}}>
          {!user && <Link to="/login"><button>Login</button></Link>}
          {user?.role === 'user' && <Link to="/request"><button>Create Request</button></Link>}
          {user?.role === 'admin' && <Link to="/admin"><button>Open Admin Dashboard</button></Link>}
        </div>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <>
      <TopBar/>
      <Routes>
        <Route path="/" element={<Home/>} />
        <Route path="/login" element={<LoginPage/>} />
        <Route element={<ProtectedRoute roles={['user','admin']} />}>
          <Route path="/request" element={<UserRequestPage/>} />
        </Route>
        <Route element={<ProtectedRoute roles={['admin']} />}>
          <Route path="/admin" element={<AdminDashboard/>} />
          <Route path="/admin/assessment/:id" element={<AdminAssessmentPage/>} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace/>} />
      </Routes>
    </>
  )
}
