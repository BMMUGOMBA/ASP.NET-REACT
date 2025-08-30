import React from 'react'

export default function FilePicker({label, file, onChange}) {
  const pick = async (e) => {
    const f = e.target.files?.[0]; if(!f) return
    const b64 = await fToBase64(f)
    onChange({ name:f.name, size:f.size, type:f.type, data:b64 })
  }
  return (
    <div className="col">
      <label>{label}</label>
      <input className="input" type="file" accept=".pdf,.doc,.docx,.txt" onChange={pick}/>
      {file && <div className="file-pill"><strong>{file.name}</strong><span className="badge">{Math.round(file.size/1024)} KB</span></div>}
      <div className="footer-note">File is stored locally (base64) for this demo.</div>
    </div>
  )
}

const fToBase64 = (file)=> new Promise((res,rej)=>{
  const r=new FileReader(); r.onload=()=>res(r.result); r.onerror=rej; r.readAsDataURL(file);
})
