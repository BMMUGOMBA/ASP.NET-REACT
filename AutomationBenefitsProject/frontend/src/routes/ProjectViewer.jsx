import { useParams, useNavigate } from 'react-router-dom'
import { Store } from '../lib/store'
import { Auth } from '../lib/auth'

export default function ProjectViewer(){
  const { id } = useParams()
  const me = Auth.me(); const nav = useNavigate()
  const p = Store.get(id)
  if(!p) return <div className="container"><div className="panel">Not found</div></div>

  return (
    <div className="container">
      <div className="panel">
        <div className="row" style={{alignItems:'center'}}>
          <h1 className="h1" style={{flex:1}}>{p.processName}</h1>
          <span className="badge">{p.status}</span>
        </div>

        <Section title="Overview">
          <KV label="Business Unit" value={p.businessUnit}/>
          <KV label="Requester" value={`${p.requesterName} (${p.requesterEmail})`}/>
          <KV label="% Automated" value={`${p.percentAutomated}%`}/>
          <KV label="Staff Impacted" value={p.staffImpacted}/>
        </Section>

        <Section title="Process Sizing">
          <KV label="How Often (free text)" value={p.howOftenText}/>
          <KV label="Breadth (#people)" value={p.breadth}/>
          <KV label="Cycle Time (min)" value={p.cycleTimeMinutes}/>
          <KV label="Complexity (systems)" value={p.complexitySystems}/>
          <KV label="Man-hours per month" value={p.manHoursPerMonth}/>
          <KV label="Roles" value={p.rolesImpacted?.join(', ')}/>
          <KV label="Systems" value={p.systemsImpacted?.join(', ')}/>
        </Section>

        <Section title="BRD">
          <KV label="Objective" value={p.brd?.objective}/>
          <KV label="Scope" value={p.brd?.scope}/>
          <KV label="Assumptions" value={p.brd?.assumptions}/>
          <KV label="Acceptance Criteria" value={p.brd?.acceptanceCriteria}/>
          {p.brd?.file && <a className="btn secondary" href={p.brd.file.data} download={p.brd.file.name}>Download {p.brd.file.name}</a>}
        </Section>

        <Section title="Review">
          {(p.review?.comments||[]).map((c,i)=>(<div key={i} className="card" style={{marginBottom:8}}>
            <div style={{fontWeight:600}}>{c.by}</div>
            <div className="footer-note">{new Date(c.at).toLocaleString()}</div>
            <div>{c.text}</div>
          </div>))}
          {(!p.review?.comments || p.review.comments.length===0) && <div className="footer-note">No comments yet.</div>}
        </Section>

        <div className="toolbar">
          <button className="btn secondary" onClick={()=>nav('/')}>Back</button>
        </div>
      </div>
    </div>
  )
}

function Section({title, children}){
  return <div className="panel"><div className="h2">{title}</div>{children}</div>
}
function KV({label,value}){ return <div style={{margin:'6px 0'}}><span style={{color:'#64748b'}}>{label}:</span> <span style={{fontWeight:600}}>{String(value??'—')}</span></div> }
