// src/routes/ProjectEditor.jsx
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Auth } from '../lib/auth'
import { Store } from '../lib/store'
import Field from '../components/Field'
import TagInput from '../components/TagInput'
import FilePicker from '../components/FilePicker'
import { validateProject, hasError, firstError } from '../lib/validate'

export default function ProjectEditor(){
  const me = Auth.me(); const nav = useNavigate()
  if(!me) { nav('/login'); return null }

  // ----- form state -----
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
  const [howOften,setHowOften]=useState('Performed daily during onboarding peaks.')

  // BRD section
  const [brdFile,setBrdFile]=useState(null)
  const [brdObjective,setBrdObjective]=useState('')
  const [brdScope,setBrdScope]=useState('')
  const [brdAssumptions,setBrdAssumptions]=useState('')
  const [brdAcceptance,setBrdAcceptance]=useState('')

  // validation
  const [errors, setErrors] = useState({})

  const submit=(e)=>{ 
    e.preventDefault()

    const payload = {
      processName, businessUnit,
      rolesImpacted: roles, systemsImpacted: systems,
      percentAutomated: Number(percent), staffImpacted: Number(staff),
      breadth: Number(breadth), cycleTimeMinutes: Number(cycle),
      complexitySystems: Number(complexity), manHoursPerMonth: Number(hours),
      howOftenText: howOften,
      brd: { file: brdFile, objective: brdObjective, scope: brdScope, assumptions: brdAssumptions, acceptanceCriteria: brdAcceptance }
    }

    const { valid, errors: errs } = validateProject(payload)
    if (!valid) {
      setErrors(errs)
      // focus first error
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }

    // save locally (later this will call the API)
    const p = Store.create(payload, me)
    nav(`/view/${p.id}`)
  }

  return (
    <div className="container">
      <div className="panel">
        <h1 className="h1">Automation Benefits Realization – New Project</h1>

        {/* Error summary */}
        {Object.keys(errors).length > 0 && (
          <div className="card" style={{borderColor:'#fecaca', background:'#fef2f2', marginBottom:16}}>
            <div style={{color:'#b91c1c', fontWeight:700, marginBottom:6}}>Please fix the highlighted fields</div>
            <div style={{color:'#991b1b', fontSize:13}}>
              {Object.entries(errors).slice(0,4).map(([k, arr]) => (
                <div key={k}>• {k}: {arr[0]}</div>
              ))}
              {Object.keys(errors).length > 4 && <div>…and more</div>}
            </div>
          </div>
        )}

        <form onSubmit={submit}>
          <div className="h2">Process Sizing</div>

          <div className="row">
            <Field label="Process Name">
              <input
                className="input"
                style={errStyle(hasError(errors,'processName'))}
                value={processName}
                onChange={e=>setProcessName(e.target.value)}
              />
              <ErrorText show={hasError(errors,'processName')} text={firstError(errors,'processName')} />
            </Field>

            <Field label="Business Unit">
              <input
                className="input"
                style={errStyle(hasError(errors,'businessUnit'))}
                value={businessUnit}
                onChange={e=>setBusinessUnit(e.target.value)}
              />
              <ErrorText show={hasError(errors,'businessUnit')} text={firstError(errors,'businessUnit')} />
            </Field>

            <Field label="% of process automated">
              <input
                className="input"
                type="number" min="0" max="100"
                style={errStyle(hasError(errors,'percentAutomated'))}
                value={percent}
                onChange={e=>setPercent(e.target.value)}
              />
              <ErrorText show={hasError(errors,'percentAutomated')} text={firstError(errors,'percentAutomated')} />
            </Field>

            <Field label="Number of staff impacted">
              <input
                className="input"
                type="number" min="0"
                style={errStyle(hasError(errors,'staffImpacted'))}
                value={staff}
                onChange={e=>setStaff(e.target.value)}
              />
              <ErrorText show={hasError(errors,'staffImpacted')} text={firstError(errors,'staffImpacted')} />
            </Field>
          </div>

          <div className="row">
            <TagInput label="Roles impacted" value={roles} onChange={setRoles}/>
            <TagInput label="Systems impacted" value={systems} onChange={setSystems}/>
          </div>
          <InlineError name="rolesImpacted" errors={errors}/>
          <InlineError name="systemsImpacted" errors={errors}/>

          <div className="h2">Process Sizing (details)</div>
          <div className="row">
            <Field label="How often is this process performed? (free text)">
              <textarea
                rows="3"
                style={errStyle(hasError(errors,'howOftenText'))}
                value={howOften}
                onChange={e=>setHowOften(e.target.value)}
              />
              <ErrorText show={hasError(errors,'howOftenText')} text={firstError(errors,'howOftenText')} />
            </Field>

            <Field label="How many staff members are performing this process (Breadth)">
              <input
                className="input" type="number" min="0"
                style={errStyle(hasError(errors,'breadth'))}
                value={breadth}
                onChange={e=>setBreadth(e.target.value)}
              />
              <ErrorText show={hasError(errors,'breadth')} text={firstError(errors,'breadth')} />
            </Field>

            <Field label="How long for one cycle (minutes)">
              <input
                className="input" type="number" min="0"
                style={errStyle(hasError(errors,'cycleTimeMinutes'))}
                value={cycle}
                onChange={e=>setCycle(e.target.value)}
              />
              <ErrorText show={hasError(errors,'cycleTimeMinutes')} text={firstError(errors,'cycleTimeMinutes')} />
            </Field>

            <Field label="How many systems involved (Complexity)">
              <input
                className="input" type="number" min="0"
                style={errStyle(hasError(errors,'complexitySystems'))}
                value={complexity}
                onChange={e=>setComplexity(e.target.value)}
              />
              <ErrorText show={hasError(errors,'complexitySystems')} text={firstError(errors,'complexitySystems')} />
            </Field>

            <Field label="Man-hours dedicated per month">
              <input
                className="input" type="number" min="0"
                style={errStyle(hasError(errors,'manHoursPerMonth'))}
                value={hours}
                onChange={e=>setHours(e.target.value)}
              />
              <ErrorText show={hasError(errors,'manHoursPerMonth')} text={firstError(errors,'manHoursPerMonth')} />
            </Field>
          </div>

          <div className="h2">BRD Section</div>
          <div className="row">
            <FilePicker label="Upload BRD" file={brdFile} onChange={setBrdFile}/>
            {/* file-level error */}
            <InlineError name="brd.file" errors={errors} />

            <Field label="BRD Objective">
              <input
                className="input"
                style={errStyle(hasError(errors,'brd.objective'))}
                value={brdObjective}
                onChange={e=>setBrdObjective(e.target.value)}
              />
              <ErrorText show={hasError(errors,'brd.objective')} text={firstError(errors,'brd.objective')} />
            </Field>

            <Field label="BRD Scope">
              <input
                className="input"
                style={errStyle(hasError(errors,'brd.scope'))}
                value={brdScope}
                onChange={e=>setBrdScope(e.target.value)}
              />
              <ErrorText show={hasError(errors,'brd.scope')} text={firstError(errors,'brd.scope')} />
            </Field>

            <Field label="Key Assumptions">
              <input
                className="input"
                style={errStyle(hasError(errors,'brd.assumptions'))}
                value={brdAssumptions}
                onChange={e=>setBrdAssumptions(e.target.value)}
              />
              <ErrorText show={hasError(errors,'brd.assumptions')} text={firstError(errors,'brd.assumptions')} />
            </Field>

            <Field label="Acceptance Criteria">
              <input
                className="input"
                style={errStyle(hasError(errors,'brd.acceptanceCriteria'))}
                value={brdAcceptance}
                onChange={e=>setBrdAcceptance(e.target.value)}
              />
              <ErrorText show={hasError(errors,'brd.acceptanceCriteria')} text={firstError(errors,'brd.acceptanceCriteria')} />
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

/* ---------- tiny helpers for inline error UI ---------- */

function ErrorText({show, text}) {
  if (!show) return null
  return <div className="footer-note" style={{color:'crimson'}}>{text}</div>
}
function InlineError({name, errors}) {
  if (!hasError(errors, name)) return null
  return <div className="footer-note" style={{color:'crimson', margin:'6px 0'}}>{firstError(errors, name)}</div>
}
function errStyle(isErr){
  return isErr ? { borderColor:'#ef4444', outlineColor:'#ef4444' } : {}
}
