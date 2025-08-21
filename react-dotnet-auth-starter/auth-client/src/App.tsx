import { BrowserRouter, Routes, Route, Navigate, Link } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import VerifyEmail from "./pages/VerifyEmail";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import ProtectedRoute from "./routes/ProtectedRoute";
import { useAuth } from "./store/auth";

function Nav() {
  const { user, clear, accessToken } = useAuth();
  return (
    <nav style={{ display: "flex", gap: 12 }}>
      <Link to="/">Home</Link>
      {user && <>
        <Link to="/dashboard">Dashboard</Link>
        <Link to="/profile">Profile</Link>
        <button onClick={async () => {
          await fetch(import.meta.env.VITE_API_URL + "/auth/logout", {
            method: "POST",
            credentials: "include",
            headers: accessToken ? { "Authorization": `Bearer ${accessToken}` } : {}
          });
          clear();
          window.location.href = "/login";
        }}>Logout</button>
      </>}
      {!user && <>
        <Link to="/login">Login</Link>
        <Link to="/register">Register</Link>
      </>}
    </nav>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Nav />
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<Profile />} />
        </Route>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
      </Routes>
    </BrowserRouter>
  );
}
