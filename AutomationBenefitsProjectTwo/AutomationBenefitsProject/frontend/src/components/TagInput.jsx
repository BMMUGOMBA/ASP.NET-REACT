import React, { useState } from 'react'

export default function TagInput({label, value=[], onChange, placeholder='Type and + add'}) {
  const [draft,setDraft]=useState('')
  const add = ()=>{ const t=draft.trim(); if(!t) return; onChange([...(value||[]), t]); setDraft('') }
  const remove = (i)=> onChange(value.filter((_,idx)=>idx!==i))
  return (
    <div className="col">
      <label>{label}</label>
      <div className="row" style={{alignItems:'center'}}>
        <input className="input" placeholder={placeholder} value={draft} onChange={e=>setDraft(e.target.value)} />
        <button type="button" className="btn" onClick={add}>+ Add</button>
      </div>
      <div style={{marginTop:6}}>
        {(value||[]).map((t,i)=>(
          <span key={i} className="tag">{t}<button type="button" onClick={()=>remove(i)}>×</button></span>
        ))}
      </div>
    </div>
  )
}
