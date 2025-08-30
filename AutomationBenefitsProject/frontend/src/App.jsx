import { Routes, Route, Navigate } from 'react-router-dom'
import Header from './components/Header'
import Login from './routes/Login'
import Dashboard from './routes/Dashboard'
import ProjectEditor from './routes/ProjectEditor'
import ProjectViewer from './routes/ProjectViewer'
import AdminDashboard, { AdminProjectView } from './routes/AdminDashboard'
import { Auth } from './lib/auth'

export default function App(){
  const me = Auth.me()
  return (
    <>
      <Header/>
      <Routes>
        <Route path="/" element={me ? <Dashboard/> : <Navigate to="/login" />} />
        <Route path="/login" element={<Login/>} />
        <Route path="/new" element={<Guard role="User"><ProjectEditor/></Guard>} />
        <Route path="/view/:id" element={<Guard><ProjectViewer/></Guard>} />
        <Route path="/admin" element={<Guard role="Admin"><AdminDashboard/></Guard>} />
        <Route path="/admin/view/:id" element={<Guard role="Admin"><AdminProjectView/></Guard>} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </>
  )
}

function Guard({children, role}){
  const me = Auth.me()
  if(!me) return <Navigate to="/login"/>
  if(role && me.role!==role) return <Navigate to="/" />
  return children
}
