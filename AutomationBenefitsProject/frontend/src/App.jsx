// src/App.jsx
import { Routes, Route, Navigate } from "react-router-dom";
import Header from "./components/Header";
import Login from "./routes/Login";
import Dashboard from "./routes/Dashboard";
import ProjectEditor from "./routes/ProjectEditor";
import ProjectViewer from "./routes/ProjectViewer";
import AdminDashboard from "./routes/AdminDashboard";
import AdminProjectView from "./routes/AdminProjectView";
import { Auth } from "./lib/auth";

export default function App() {
  return (
    <>
      <Header />
      <Routes>
        {/* public */}
        <Route path="/login" element={<RequireAnon><Login /></RequireAnon>} />

        {/* authenticated */}
        <Route path="/" element={<RequireAuth><Dashboard /></RequireAuth>} />
        <Route path="/view/:id" element={<RequireAuth><ProjectViewer /></RequireAuth>} />
        <Route path="/new" element={<RequireRole role="User"><ProjectEditor /></RequireRole>} />

        {/* admin */}
        <Route path="/admin" element={<RequireRole role="Admin"><AdminDashboard /></RequireRole>} />
        <Route path="/admin/view/:id" element={<RequireRole role="Admin"><AdminProjectView /></RequireRole>} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

function RequireAuth({ children }) {
  const me = Auth.me();
  if (!me) return <Navigate to="/login" replace />;
  return children;
}
function RequireAnon({ children }) {
  const me = Auth.me();
  if (me) return <Navigate to="/" replace />;
  return children;
}
function RequireRole({ children, role }) {
  const me = Auth.me();
  if (!me) return <Navigate to="/login" replace />;
  if (role && me.role !== role) return <Navigate to="/" replace />;
  return children;
}
