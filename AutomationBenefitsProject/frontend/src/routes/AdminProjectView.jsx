// src/routes/AdminProjectView.jsx
import React from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Store } from '../lib/store'
import { Auth } from '../lib/auth'

export default function AdminProjectView(){
  const { id } = useParams()
  const nav = useNavigate()
  const me = Auth.me()
  const p = Store.get(id)

  if (!p) {
    return <div className="container"><div className="panel">Not found</div></div>
  }

  // unpack safely (same shape the editor saves)
  const roles   = p.rolesImpacted || []
  const systems = p.systemsImpacted || []

  const b   = p.benefits || {}
  const met = b.metrics || {}
  const cyc = met.timeToCompleteCycle || {}
  const mon = met.totalTimePerMonth   || {}
  const stf = met.staffRequired       || {}

  const cost = b.cost || {}
  const eff  = b.efficiency || {}
  const cust = b.customer || {}
  const staff = b.staff || {}

  const brd = p.brd || {}
  const hasFile = !!brd?.file?.data
  const isImage = brd?.file?.type?.startsWith('image/')

  // optional actions (only render if your Store exposes them)
  const canApprove = typeof Store.approve === 'function'
  const canRequest = typeof Store.requestChanges === 'function'

  const approve = () => {
    if (canApprove) {
      Store.approve(p.id, me, 'Approved')
      nav('/admin')
    } else {
      alert('Store.approve not implemented. Action disabled.')
    }
  }

  const requestChanges = () => {
    if (canRequest) {
      const msg = prompt('Comments to user:') || ''
      Store.requestChanges(p.id, me, msg)
      nav('/admin')
    } else {
      alert('Store.requestChanges not implemented. Action disabled.')
    }
  }

  return (
    <div className="container">
      <div className="panel">
        {/* Header */}
        <div className="row" style={{alignItems:'center'}}>
          <h1 className="h1" style={{flex:1}}>{p.processName}</h1>
          <span className="badge">{p.status || 'Draft'}</span>
        </div>

        {/* Overview */}
        <Section title="Overview">
          <KV label="Business Unit" value={p.businessUnit}/>
          <KV label="Requester" value={`${p.requesterName || '—'} (${p.requesterEmail || '—'})`}/>
          <KV label="Size Rating" value={p.sizeRating || '—'}/>
          <KV label="% Automated" value={fmtPct(p.percentAutomated)}/>
          <KV label="Staff Impacted" value={p.staffImpacted}/>
        </Section>

        {/* Process Sizing */}
        <Section title="Process Sizing">
          <KV label="How Often (free text)" value={p.howOftenText}/>
          <KV label="Breadth (# people)" value={p.breadth}/>
          <KV label="Cycle Time (min)" value={p.cycleTimeMinutes}/>
          <KV label="Complexity (# systems)" value={p.complexitySystems}/>
          <KV label="Man-hours per month" value={p.manHoursPerMonth}/>
          <Chips label="Roles impacted" items={roles}/>
          <Chips label="Systems impacted" items={systems}/>
        </Section>

        {/* Benefits Realization */}
        <Section title="Benefits Realization">
          <TableHeader />
          <MetricRow label="Time to complete 1 cycle (min)" v={cyc}/>
          <MetricRow label="Total time per month (hours)"   v={mon}/>
          <MetricRow label="Number of staff required"       v={stf}/>

          <div className="h3" style={{marginTop:12}}>Cost</div>
          <KV label="Man-hours saved per cycle"            value={cost.manHoursSavedPerCycle}/>
          <KV label="Man-hours saved per person"           value={cost.manHoursSavedPerPerson}/>
          <KV label="Total man-hours saved per month"      value={cost.totalManHoursSavedPerMonth}/>

          <div className="h3" style={{marginTop:12}}>Efficiency</div>
          <KV label="Efficiency gain per cycle (%)" value={eff.gainPerCycle}/>
          <KV label="Total efficiency gain (%)"    value={eff.totalEfficiencyGain}/>

          <div className="h3" style={{marginTop:12}}>Customer & Staff</div>
          <TextCard label="CX impact"                  text={cust.cxImpact}/>
          <TextCard label="Staff Satisfaction Impact"  text={staff.staffSatisfactionImpact}/>
        </Section>

        {/* BRD */}
        <Section title="BRD">
          <KV label="Objective"           value={brd.objective}/>
          <KV label="Scope"               value={brd.scope}/>
          <KV label="Key Assumptions"     value={brd.assumptions}/>
          <KV label="Acceptance Criteria" value={brd.acceptanceCriteria}/>
          <div style={{marginTop:8}}>
            <label>Uploaded file</label>
            <div className="card" style={{display:'flex', gap:12, alignItems:'center', marginTop:6}}>
              {hasFile ? (
                <>
                  <span><strong>{brd.file.name}</strong> <span className="footer-note">({brd.file.type || 'file'})</span></span>
                  {isImage && <img src={brd.file.data} alt="preview" style={{height:60, border:'1px solid #e5e7eb', borderRadius:6}}/>}
                  <a className="btn secondary" href={brd.file.data} download={brd.file.name}>Download</a>
                </>
              ) : <i>No file uploaded</i>}
            </div>
          </div>
        </Section>

        {/* Review comments */}
        <Section title="Review">
          {(p.review?.comments||[]).map((c,i)=>(
            <div key={i} className="card" style={{marginBottom:8}}>
              <div style={{fontWeight:600}}>{c.by}</div>
              <div className="footer-note">{new Date(c.at).toLocaleString()}</div>
              <div>{c.text}</div>
            </div>
          ))}
          {(!p.review?.comments || p.review.comments.length===0) && (
            <div className="footer-note">No comments yet.</div>
          )}
        </Section>

        {/* Admin actions */}
        <div className="toolbar">
          {canApprove && <button className="btn" onClick={approve}>Approve</button>}
          {canRequest && <button className="btn secondary" onClick={requestChanges}>Request Changes</button>}
          <button className="btn secondary" onClick={()=>nav('/admin')}>Close</button>
        </div>
      </div>
    </div>
  )
}

/* ----- small presentational helpers ----- */

function Section({title, children}){
  return <div className="panel" style={{marginTop:12}}><div className="h2">{title}</div>{children}</div>
}
function KV({label,value}){
  return (
    <div style={{margin:'6px 0'}}>
      <span style={{color:'#64748b'}}>{label}:</span>{' '}
      <span style={{fontWeight:600}}>{fmt(value)}</span>
    </div>
  )
}
function TextCard({label, text}){
  return (
    <div style={{margin:'6px 0'}}>
      <span style={{color:'#64748b'}}>{label}:</span>
      <div className="card" style={{marginTop:6}}>{fmt(text)}</div>
    </div>
  )
}
function Chips({label, items}){
  return (
    <div style={{margin:'6px 0'}}>
      <span style={{color:'#64748b'}}>{label}:</span>
      <div className="card" style={{marginTop:6, display:'flex', gap:6, flexWrap:'wrap'}}>
        {(items && items.length) ? items.map((t,i)=><span key={i} className="badge">{t}</span>) : <i> None</i>}
      </div>
    </div>
  )
}
function TableHeader(){
  return (
    <div className="row" style={{fontWeight:600, color:'#334155', marginTop:6}}>
      <div className="col" />
      <div className="col">Before</div>
      <div className="col">After</div>
      <div className="col">Savings</div>
      <div className="col">% Gain</div>
    </div>
  )
}
function MetricRow({label, v}){
  const fmtn = n => (n || n===0) ? n : '—'
  return (
    <div className="row" style={{alignItems:'center'}}>
      <div className="col"><div className="footer-note" style={{fontWeight:600}}>{label}</div></div>
      <div className="col"><div className="card">{fmtn(v.before)}</div></div>
      <div className="col"><div className="card">{fmtn(v.after)}</div></div>
      <div className="col"><div className="card">{fmtn(v.savings)}</div></div>
      <div className="col"><div className="card">{fmtn(v.percentGain)}</div></div>
    </div>
  )
}
function fmt(v){ return (v || v===0) ? String(v) : '—' }
function fmtPct(v){ return (v || v===0) ? `${v}%` : '—' }
