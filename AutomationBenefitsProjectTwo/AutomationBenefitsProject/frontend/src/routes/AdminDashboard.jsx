// src/routes/AdminDashboard.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { projects } from "../services/projects";
import { isAdmin } from "../lib/auth";

export default function AdminDashboard() {
  const nav = useNavigate();
  const [q, setQ] = useState("");
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    if (!isAdmin()) {
      nav("/"); // or /login
      return;
    }
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function refresh() {
    try {
      setErr("");
      setLoading(true);
      const data = await projects.adminList();
      setRows(Array.isArray(data) ? data : []);
    } catch (e) {
      setErr(e.message || "Failed to load projects");
    } finally {
      setLoading(false);
    }
  }

  const filtered = useMemo(() => {
    const x = (q || "").trim().toLowerCase();
    const list = rows.slice().sort(byUpdated);
    if (!x) return list;
    return list.filter((p) =>
      [
        p.processName,
        p.requesterName,
        p.businessUnit,
        p.status,
      ]
        .map((v) => (v || "").toString().toLowerCase())
        .some((v) => v.includes(x))
    );
  }, [rows, q]);

  async function doApprove(id) {
    try {
      await projects.approve(id);
      await refresh();
    } catch (e) {
      alert(e.message || "Approve failed");
    }
  }

  async function doRequest(id) {
    const msg = prompt("Comment to the requester:") || "";
    try {
      await projects.requestChanges(id, msg);
      await refresh();
    } catch (e) {
      alert(e.message || "Request changes failed");
    }
  }

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
        <div className="toolbar">
          <h2 style={{ margin: 0 }}>Admin – All Projects</h2>
          <div style={{ display: "flex", gap: 8 }}>
            <input
              className="input"
              placeholder="Search process / requester / BU / status…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              style={{ minWidth: 280 }}
            />
            <button className="btn secondary" onClick={refresh}>
              Refresh
            </button>
          </div>
        </div>

        <div className="card" style={{ padding: 0 }}>
          <div
            className="row"
            style={{ fontWeight: 600, color: "#334155", padding: "10px 12px" }}
          >
            <div className="col">Process</div>
            <div className="col">BU</div>
            <div className="col">Requester</div>
            <div className="col">Status</div>
            <div className="col">% Auto</div>
            <div className="col">Updated</div>
            <div className="col" style={{ textAlign: "right" }}>
              Actions
            </div>
          </div>

          {filtered.map((p) => (
            <div
              key={p.id}
              className="row"
              style={{
                alignItems: "center",
                padding: "10px 12px",
                borderTop: "1px solid #eef2f7",
              }}
            >
              <div className="col" style={{ fontWeight: 600 }}>
                {p.processName}
              </div>
              <div className="col">{p.businessUnit || "—"}</div>
              <div className="col">{p.requesterName || "—"}</div>
              <div className="col">
                <span className="badge">{p.status || "Draft"}</span>
              </div>
              <div className="col">{p.percentAutomated ?? "—"}</div>
              <div className="col">
                {p.updatedAt ? new Date(p.updatedAt).toLocaleString() : "—"}
              </div>
              <div
                className="col"
                style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}
              >
                <Link className="btn secondary" to={`/admin/view/${p.id}`}>
                  Open
                </Link>
                <button className="btn" onClick={() => doApprove(p.id)}>
                  Approve
                </button>
                <button className="btn secondary" onClick={() => doRequest(p.id)}>
                  Request
                </button>
              </div>
            </div>
          ))}

          {filtered.length === 0 && (
            <div style={{ padding: 14 }} className="footer-note">
              No projects found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function byUpdated(a, b) {
  const ax = a?.updatedAt ? Date.parse(a.updatedAt) : 0;
  const bx = b?.updatedAt ? Date.parse(b.updatedAt) : 0;
  return bx - ax;
}
