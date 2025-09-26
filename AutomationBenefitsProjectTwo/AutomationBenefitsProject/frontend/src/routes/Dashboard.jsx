// src/routes/Dashboard.jsx
import { Link, useNavigate } from "react-router-dom";
import { getUser, isAdmin } from "../lib/auth";
import { useEffect, useState } from "react";
import { projects } from "../services/projects";

export default function Dashboard() {
  const me = getUser();
  const nav = useNavigate();
  const [items, setItems] = useState([]);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!me) {
      nav("/login");
      return;
    }
    (async () => {
      try {
        setErr("");
        setLoading(true);
        const data = isAdmin() ? await projects.adminList() : await projects.listMine();
        setItems(Array.isArray(data) ? data : []);
      } catch (e) {
        setErr(e.message || "Failed to load projects");
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) return <div className="container">Loading…</div>;
  if (err)
    return (
      <div className="container">
        <div className="panel" style={{ color: "crimson" }}>{err}</div>
      </div>
    );

  return (
    <div className="container">
      <div className="panel">
        <div className="row" style={{ alignItems: "center" }}>
          <h1 className="h1" style={{ flex: "1" }}>
            Welcome, {me?.name}
          </h1>
          {me?.role === "User" && <Link className="btn" to="/new">Start New Project</Link>}
          {me?.role === "Admin" && <Link className="btn" to="/admin">Go to Admin Dashboard</Link>}
        </div>
      </div>

      <div className="panel">
        <div className="h2">{me?.role === "Admin" ? "All Projects" : "My Projects"}</div>
        <ProjectsTable items={items} isAdmin={me?.role === "Admin"} />
      </div>
    </div>
  );
}

function ProjectsTable({ items, isAdmin }) {
  const nav = useNavigate();
  return (
    <table className="table">
      <thead>
        <tr>
          <th>Process</th>
          <th>BU</th>
          <th>Requester</th>
          <th>Status</th>
          <th>Updated</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        {items.map((p) => (
          <tr key={p.id}>
            <td>{p.processName}</td>
            <td>{p.businessUnit}</td>
            <td>{p.requesterName}</td>
            <td>
              <span className="badge">{p.status}</span>
            </td>
            <td>{p.updatedAt ? new Date(p.updatedAt).toLocaleString() : "—"}</td>
            <td>
              <button
                className="btn secondary"
                onClick={() => nav(isAdmin ? `/admin/view/${p.id}` : `/view/${p.id}`)}
              >
                View
              </button>
            </td>
          </tr>
        ))}
        {items.length === 0 && (
          <tr>
            <td colSpan="6">No projects yet.</td>
          </tr>
        )}
      </tbody>
    </table>
  );
}
