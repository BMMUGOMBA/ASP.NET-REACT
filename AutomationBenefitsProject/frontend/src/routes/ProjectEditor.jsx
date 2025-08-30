// src/routes/ProjectEditor.jsx
import React, { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Auth } from '../lib/auth'
import { Store } from '../lib/store'
import Field from '../components/Field'
import TagInput from '../components/TagInput'
import FilePicker from '../components/FilePicker'
import { validateProject, hasError, firstError } from '../lib/validate'

export default function ProjectEditor(){
  const me = Auth.me()
  const nav = useNavigate()

  // ---------- core process sizing ----------
  const [processName,setProcessName]=useState('')
  const [businessUnit,setBusinessUnit]=useState('PPB')
  const [roles,setRoles]=useState([])
  const [systems,setSystems]=useState([])
  const [percent,setPercent]=useState(0)
  const [staff,setStaff]=useState(0)
  const [breadth,setBreadth]=useState(0)
  const [cycle,setCycle]=useState(0)
  const [complexity,setComplexity]=useState(0)
  const [hours,setHours]=useState(0)
  const [howOften,setHowOften]=useState('')

  // ---------- size rating ----------
  const [sizeRating, setSizeRating] = useState('Medium') // Small | Medium | Large

  // ---------- Benefits Realization (inputs) ----------
  // Before/After metrics
  const [cycBefore, setCycBefore] = useState(0)
  const [cycAfter,  setCycAfter]  = useState(0)

  const [monBefore, setMonBefore] = useState(0)
  const [monAfter,  setMonAfter]  = useState(0)

  const [stfBefore, setStfBefore] = useState(0)
  const [stfAfter,  setStfAfter]  = useState(0)

  // Cost
  const [mhPerCycle, setMhPerCycle] = useState(0)
  const [mhPerPerson,setMhPerPerson]= useState(0)
  const [mhPerMonth, setMhPerMonth] = useState(0)

  // Efficiency
  const [effPerCycle, setEffPerCycle] = useState(0)
  const [effTotal,    setEffTotal]    = useState(0)

  // Customer / Staff notes
  const [cxImpact, setCxImpact] = useState('')
  const [staffImpact, setStaffImpact] = useState('')

  // BRD
  const [brdFile,setBrdFile]=useState(null)
  const [brdObjective,setBrdObjective]=useState('')
  const [brdScope,setBrdScope]=useState('')
  const [brdAssumptions,setBrdAssumptions]=useState('')
  const [brdAcceptance,setBrdAcceptance]=useState('')

  // validation summary for required core fields
  const [errors, setErrors] = useState({})

  // ---------- derived (Savings / %Gain) ----------
  const m = (b,a) => {
    const before = Number(b)||0, after = Number(a)||0
    const savings = Math.max(0, before - after)
    const gain = before > 0 ? (savings / before) * 100 : 0
    return { savings, gain: Math.round(gain) }
  }
  const cyc = useMemo(()=>m(cycBefore, cycAfter), [cycBefore,cycAfter])
  const mon = useMemo(()=>m(monBefore, monAfter), [monBefore,monAfter])
  const stf = useMemo(()=>m(stfBefore, stfAfter), [stfBefore,stfAfter])

  // ---------- submit ----------
  const submit=(e)=>{ 
    e.preventDefault()

    const payload = {
      processName, businessUnit,
      rolesImpacted: roles, systemsImpacted: systems,
      percentAutomated: Number(percent), staffImpacted: Number(staff),
      breadth: Number(breadth), cycleTimeMinutes: Number(cycle),
      complexitySystems: Number(complexity), manHoursPerMonth: Number(hours),
      howOftenText: howOften,
      sizeRating,
      benefits: {
        metrics: {
          timeToCompleteCycle: { before: Number(cycBefore), after: Number(cycAfter), savings: cyc.savings, percentGain: cyc.gain },
          totalTimePerMonth:   { before: Number(monBefore), after: Number(monAfter), savings: mon.savings, percentGain: mon.gain },
          staffRequired:       { before: Number(stfBefore), after: Number(stfAfter), savings: stf.savings, percentGain: stf.gain },
        },
        cost: {
          manHoursSavedPerCycle: Number(mhPerCycle),
          manHoursSavedPerPerson: Number(mhPerPerson),
          totalManHoursSavedPerMonth: Number(mhPerMonth),
        },
        efficiency: {
          gainPerCycle: Number(effPerCycle),
          totalEfficiencyGain: Number(effTotal),
        },
        customer: { cxImpact },
        staff: { staffSatisfactionImpact: staffImpact }
      },
      brd: { file: brdFile, objective: brdObjective, scope: brdScope, assumptions: brdAssumptions, acceptanceCriteria: brdAcceptance }
    }

    const { valid, errors: errs } = validateProject(payload)
    if (!valid) { setErrors(errs); window.scrollTo({ top: 0, behavior:'smooth' }); return }

    const p = Store.create(payload, me)
    nav(`/view/${p.id}`)
  }

  return (
    <div className="container">
      <div className="panel">
        <h1 className="h1">Automation Benefits Realization – New Project</h1>

        {/* error summary */}
        {Object.keys(errors).length > 0 && (
          <div className="card" style={{borderColor:'#fecaca', background:'#fef2f2', marginBottom:16}}>
            <div style={{color:'#b91c1c', fontWeight:700, marginBottom:6}}>Please fix the highlighted fields</div>
            <div style={{color:'#991b1b', fontSize:13}}>
              {Object.entries(errors).slice(0,6).map(([k, arr]) => (
                <div key={k}>• {k}: {arr[0]}</div>
              ))}
              {Object.keys(errors).length > 6 && <div>…and more</div>}
            </div>
          </div>
        )}

        <form onSubmit={submit}>
          {/* Process Sizing */}
          <div className="h2">Process Sizing</div>
          <div className="row">
            <Field label="Process Name">
              <input className="input"
                placeholder="e.g., Customer Onboarding"
                style={errStyle(hasError(errors,'processName'))}
                value={processName} onChange={e=>setProcessName(e.target.value)} />
            </Field>

            <Field label="Business Unit">
              <input className="input"
                placeholder="e.g., PPB"
                style={errStyle(hasError(errors,'businessUnit'))}
                value={businessUnit} onChange={e=>setBusinessUnit(e.target.value)} />
            </Field>

            <Field label="% of process automated">
              <input className="input" type="number" min="0" max="100"
                value={percent} onChange={e=>setPercent(e.target.value)} />
            </Field>

            <Field label="Number of staff impacted">
              <input className="input" type="number" min="0"
                value={staff} onChange={e=>setStaff(e.target.value)} />
            </Field>
          </div>

          <div className="row">
            <TagInput label="Roles impacted" value={roles} onChange={setRoles}/>
            <TagInput label="Systems impacted" value={systems} onChange={setSystems}/>
          </div>

          <div className="h2">Process Sizing (details)</div>
          <div className="row">
            <Field label="How often is this process performed? (free text)">
              <textarea rows="3"
                placeholder="Describe the frequency and context…"
                value={howOften} onChange={e=>setHowOften(e.target.value)} />
            </Field>

            <Field label="How many staff members are performing this process (Breadth)">
              <input className="input" type="number" min="0"
                value={breadth} onChange={e=>setBreadth(e.target.value)} />
            </Field>

            <Field label="How long for one cycle (minutes)">
              <input className="input" type="number" min="0"
                value={cycle} onChange={e=>setCycle(e.target.value)} />
            </Field>

            <Field label="How many systems involved (Complexity)">
              <input className="input" type="number" min="0"
                value={complexity} onChange={e=>setComplexity(e.target.value)} />
            </Field>

            <Field label="Man-hours dedicated per month">
              <input className="input" type="number" min="0"
                value={hours} onChange={e=>setHours(e.target.value)} />
            </Field>
          </div>

          {/* Size Rating */}
          <div className="h2">Size Rating</div>
          <div className="row">
            <div className="col">
              <label>Choose rating</label>
              <div style={{display:'flex', gap:8, marginTop:8}}>
                {['Small','Medium','Large'].map(s => (
                  <label key={s} className={`badge ${sizeRating===s?'ok':''}`} style={{cursor:'pointer'}}>
                    <input type="radio" name="sizeRating" value={s}
                      checked={sizeRating===s}
                      onChange={()=>setSizeRating(s)}
                      style={{display:'none'}} />
                    {s}
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Benefits Realization */}
          <div className="h2">Benefits Realization</div>

          {/* Metrics table */}
          <div className="card" style={{marginBottom:12}}>
            <div className="row" style={{fontWeight:600, color:'#334155'}}>
              <div className="col" />
              <div className="col">Before</div>
              <div className="col">After</div>
              <div className="col">Savings</div>
              <div className="col">% Gain</div>
            </div>

            <MetricRow
              label="Time taken to complete 1 cycle (minutes)"
              before={cycBefore} setBefore={setCycBefore}
              after={cycAfter} setAfter={setCycAfter}
              savings={cyc.savings} gain={cyc.gain}
            />

            <MetricRow
              label="Total time taken per month (hours)"
              before={monBefore} setBefore={setMonBefore}
              after={monAfter} setAfter={setMonAfter}
              savings={mon.savings} gain={mon.gain}
            />

            <MetricRow
              label="Number of staff required"
              before={stfBefore} setBefore={setStfBefore}
              after={stfAfter} setAfter={setStfAfter}
              savings={stf.savings} gain={stf.gain}
            />
          </div>

          {/* Cost / Efficiency / Notes */}
          <div className="row">
            <Field label="Man-hours saved per cycle">
              <input className="input" type="number" min="0" value={mhPerCycle} onChange={e=>setMhPerCycle(e.target.value)} />
            </Field>
            <Field label="Man-hours saved per person">
              <input className="input" type="number" min="0" value={mhPerPerson} onChange={e=>setMhPerPerson(e.target.value)} />
            </Field>
            <Field label="Total man hours saved per month">
              <input className="input" type="number" min="0" value={mhPerMonth} onChange={e=>setMhPerMonth(e.target.value)} />
            </Field>
          </div>

          <div className="row">
            <Field label="Efficiency gain per cycle (%)">
              <input className="input" type="number" min="0" max="100" value={effPerCycle} onChange={e=>setEffPerCycle(e.target.value)} />
            </Field>
            <Field label="Total efficiency gain (%)">
              <input className="input" type="number" min="0" max="100" value={effTotal} onChange={e=>setEffTotal(e.target.value)} />
            </Field>
          </div>

          <div className="row">
            <Field label="CX impact">
              <input className="input" placeholder="Customer experience impact…" value={cxImpact} onChange={e=>setCxImpact(e.target.value)} />
            </Field>
            <Field label="Staff Satisfaction Impact">
              <input className="input" placeholder="How staff experience changes…" value={staffImpact} onChange={e=>setStaffImpact(e.target.value)} />
            </Field>
          </div>

          {/* BRD */}
          <div className="h2">BRD Section</div>
          <div className="row">
            <FilePicker label="Upload BRD (PDF/DOC/DOCX/TXT/PNG/JPG)" file={brdFile} onChange={setBrdFile}/>
            <Field label="BRD Objective">
              <input className="input" value={brdObjective} onChange={e=>setBrdObjective(e.target.value)} />
            </Field>
            <Field label="BRD Scope">
              <input className="input" value={brdScope} onChange={e=>setBrdScope(e.target.value)} />
            </Field>
            <Field label="Key Assumptions">
              <input className="input" value={brdAssumptions} onChange={e=>setBrdAssumptions(e.target.value)} />
            </Field>
            <Field label="Acceptance Criteria">
              <input className="input" value={brdAcceptance} onChange={e=>setBrdAcceptance(e.target.value)} />
            </Field>
          </div>

          <div className="toolbar" style={{marginTop:12}}>
            <button className="btn">Submit Project</button>
          </div>
        </form>
      </div>
    </div>
  )
}

// small row component for the Before/After table
function MetricRow({label, before, setBefore, after, setAfter, savings, gain}) {
  return (
    <div className="row" style={{alignItems:'center'}}>
      <div className="col"><div className="footer-note" style={{fontWeight:600}}>{label}</div></div>
      <div className="col">
        <input className="input" type="number" min="0" value={before} onChange={e=>setBefore(e.target.value)} />
      </div>
      <div className="col">
        <input className="input" type="number" min="0" value={after} onChange={e=>setAfter(e.target.value)} />
      </div>
      <div className="col">
        <input className="input" type="number" value={savings} readOnly />
      </div>
      <div className="col">
        <input className="input" type="number" value={gain} readOnly />
      </div>
    </div>
  )
}

function errStyle(isErr){ return isErr ? { borderColor:'#ef4444', outlineColor:'#ef4444' } : {} }
