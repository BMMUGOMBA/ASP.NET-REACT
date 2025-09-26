// src/routes/Login.jsx
import React, { useState } from "react";
import { login } from "../lib/auth";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("admin@example.com");
  const [password, setPassword] = useState("Password1!");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    setLoading(true);

    try {
      await login(email, password);
      nav("/", { replace: true });
    } catch (ex) {
      setErr(ex.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="panel" style={{ maxWidth: 480, margin: "80px auto" }}>
        <h1 className="h1">Sign in</h1>
        <form onSubmit={submit} className="row">
          <div className="col">
            <label>Email</label>
            <input
              className="input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              required
            />
          </div>
          <div className="col">
            <label>Password</label>
            <input
              className="input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              required
            />
          </div>
          {err && (
            <div className="col" style={{ color: "crimson" }}>
              {err}
            </div>
          )}
          <div className="toolbar">
            <button className="btn" disabled={loading}>
              {loading ? "Signing in..." : "Login"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
