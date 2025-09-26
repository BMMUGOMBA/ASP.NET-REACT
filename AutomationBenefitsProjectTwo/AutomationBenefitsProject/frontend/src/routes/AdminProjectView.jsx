// src/routes/AdminProjectView.jsx
import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { projects } from "../services/projects";
import { isAdmin, getToken } from "../lib/auth";

export default function AdminProjectView() {
  const { id } = useParams();
  const nav = useNavigate();
  const [p, setP] = useState(null);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAdmin()) {
      nav("/");
      return;
    }
    (async () => {
      try {
        setErr(""); setLoading(true);
        const data = await projects.getById(id); // API (not local store)
        setP(data || null);
      } catch (e) {
        setErr(e.message || "Failed to load project");
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleDownloadBrd = useCallback(async () => {
    try {
      const token = getToken();
      const res = await fetch(`${import.meta.env.VITE_API_URL}/projects/${id}/brd`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error("BRD download failed or file not found.");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = p?.brd?.fileName || `BRD-${id}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e) {
      alert(e.message || "Download failed");
    }
  }, [id, p]);

  const approve = async () => {
    try {
      await projects.approve(p.id);
      nav("/admin");
    } catch (e) {
      alert(e.message || "Approve failed");
    }
  };

  const requestChanges = async () => {
    const msg = prompt("Comments to user:") || "";
    try {
      await projects.requestChanges(p.id, msg);
      nav("/admin");
    } catch (e) {
      alert(e.message || "Request changes failed");
    }
  };

  if (loading) return <div className="container">Loading…</div>;
  if (err) return <div className="container"><div className="panel">{err}</div></div>;
  if (!p) return <div className="container"><div className="panel">Not found</div></div>;

  const roles = p.rolesImpacted || [];
  const systems = p.systemsImpacted || [];

  // ---- benefits: support flattened and legacy nested shapes ----
  const b = p.benefits || {};
  const pickMetric = (key) => (b?.[key]) ?? (b?.metrics?.[key]) ?? {};
  const cyc = pickMetric("timeToCompleteCycle");
  const mon = pickMetric("totalTimePerMonth");
  const stf = pickMetric("staffRequired");

  const cxImpact =
    b?.cxImpact ??
    b?.customer?.cxImpact ??
    "—";

  const staffImpact =
    b?.staffSatisfactionImpact ??
    b?.staff?.staffSatisfactionImpact ??
    "—";

  const brd = p.brd || {};
  const fileName = brd?.fileName || "file";
  const fileUrl = brd?.url || null;
  const hasFile = !!fileName || !!fileUrl;

  const sizeLabel = typeof p.sizeRating === "number"
    ? (["Small", "Medium", "Large"][p.sizeRating] ?? String(p.sizeRating))
    : (p.sizeRating || "—");

  const statusLabel = mapStatus(p.status);

  return (
    <div className="container">
      <div className="panel">
        {/* Header */}
        <div className="row" style={{ alignItems: "center" }}>
          <h1 className="h1" style={{ flex: 1 }}>{p.processName}</h1>
          <span className="badge">{statusLabel}</span>
        </div>

        {/* Overview */}
        <Section title="Overview">
          <KV label="Business Unit" value={p.businessUnit} />
          <KV label="Requester" value={`${p.requesterName || "—"} (${p.requesterEmail || "—"})`} />
          <KV label="Size Rating" value={sizeLabel} />
          <KV label="% Automated" value={fmtPct(p.percentAutomated)} />
          <KV label="Staff Impacted" value={p.staffImpacted} />
          {p.updatedAt && <KV label="Last Updated" value={new Date(p.updatedAt).toLocaleString()} />}
        </Section>

        {/* Process Sizing */}
        <Section title="Process Sizing">
          <KV label="How Often (free text)" value={p.howOftenText} />
          <KV label="Breadth (# people)" value={p.breadth} />
          <KV label="Cycle Time (min)" value={p.cycleTimeMinutes} />
          <KV label="Complexity (# systems)" value={p.complexitySystems} />
          <KV label="Man-hours per month" value={p.manHoursPerMonth} />
          <Chips label="Roles impacted" items={roles} />
          <Chips label="Systems impacted" items={systems} />
        </Section>

        {/* Benefits Realization */}
        <Section title="Benefits Realization">
          <TableHeader />
          <MetricRow label="Time to complete 1 cycle (min)" v={cyc} />
          <MetricRow label="Total time per month (hours)" v={mon} />
          <MetricRow label="Number of staff required" v={stf} />

          <div className="h3" style={{ marginTop: 12 }}>Customer & Staff</div>
          <TextCard label="CX impact" text={cxImpact} />
          <TextCard label="Staff Satisfaction Impact" text={staffImpact} />
        </Section>

        {/* BRD */}
        <Section title="BRD">
          <KV label="Objective" value={brd.objective} />
          <KV label="Scope" value={brd.scope} />
          <KV label="Key Assumptions" value={brd.assumptions} />
          <KV label="Acceptance Criteria" value={brd.acceptanceCriteria} />
          <div style={{ marginTop: 8 }}>
            <label>Uploaded file</label>
            <div className="card" style={{ display: "flex", gap: 12, alignItems: "center", marginTop: 6 }}>
              {hasFile ? (
                <>
                  <span><strong>{fileName}</strong></span>
                  {fileUrl ? (
                    <a className="btn secondary" href={fileUrl} target="_blank" rel="noreferrer">Open</a>
                  ) : (
                    <button type="button" className="btn secondary" onClick={handleDownloadBrd}>
                      Download
                    </button>
                  )}
                </>
              ) : (
                <i>No file uploaded</i>
              )}
            </div>
          </div>
        </Section>

        {/* Admin actions */}
        <div className="toolbar">
          <button className="btn" onClick={approve}>Approve</button>
          <button className="btn secondary" onClick={requestChanges}>Request Changes</button>
          <button className="btn secondary" onClick={() => nav("/admin")}>Close</button>
        </div>
      </div>
    </div>
  );
}

/* ----- helpers ----- */
function mapStatus(s) {
  const map = { 0: "Draft", 1: "Submitted", 2: "Approved", 3: "Changes Requested" };
  return map?.[s] ?? (typeof s === "string" ? s : "Unknown");
}
function Section({ title, children }) {
  return (
    <div className="panel" style={{ marginTop: 12 }}>
      <div className="h2">{title}</div>
      {children}
    </div>
  );
}
function KV({ label, value }) {
  return (
    <div style={{ margin: "6px 0" }}>
      <span style={{ color: "#64748b" }}>{label}:</span>{" "}
      <span style={{ fontWeight: 600 }}>{fmt(value)}</span>
    </div>
  );
}
function TextCard({ label, text }) {
  return (
    <div style={{ margin: "6px 0" }}>
      <span style={{ color: "#64748b" }}>{label}:</span>
      <div className="card" style={{ marginTop: 6 }}>{fmt(text)}</div>
    </div>
  );
}
function Chips({ label, items }) {
  return (
    <div style={{ margin: "6px 0" }}>
      <span style={{ color: "#64748b" }}>{label}:</span>
      <div className="card" style={{ marginTop: 6, display: "flex", gap: 6, flexWrap: "wrap" }}>
        {(items && items.length) ? items.map((t, i) => <span key={i} className="badge">{t}</span>) : <i> None</i>}
      </div>
    </div>
  );
}
function TableHeader() {
  return (
    <div className="row" style={{ fontWeight: 600, color: "#334155", marginTop: 6 }}>
      <div className="col" />
      <div className="col">Before</div>
      <div className="col">After</div>
      <div className="col">Savings</div>
      <div className="col">% Gain</div>
    </div>
  );
}
function MetricRow({ label, v }) {
  const val = v || {};
  const show = (n) => (n || n === 0) ? n : "—";
  const percent = val.percentGain ?? val.gain;
  return (
    <div className="row" style={{ alignItems: "center" }}>
      <div className="col"><div className="footer-note" style={{ fontWeight: 600 }}>{label}</div></div>
      <div className="col"><div className="card">{show(val.before)}</div></div>
      <div className="col"><div className="card">{show(val.after)}</div></div>
      <div className="col"><div className="card">{show(val.savings)}</div></div>
      <div className="col"><div className="card">{show(percent)}</div></div>
    </div>
  );
}
function fmt(v) { return (v || v === 0) ? String(v) : "—"; }
function fmtPct(v) { return (v || v === 0) ? `${v}%` : "—"; }
