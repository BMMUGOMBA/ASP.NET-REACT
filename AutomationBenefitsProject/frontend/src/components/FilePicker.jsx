import React from 'react'

export default function FilePicker({label, file, onChange}) {
  const pick = async (e) => {
    const f = e.target.files?.[0]; if(!f) return
    const b64 = await toBase64(f)
    onChange({ name:f.name, size:f.size, type:f.type, data:b64 })
  }
  const clear = ()=> onChange(null)
  const isImage = file && /^image\//.test(file.type)

  return (
    <div className="col">
      <label>{label}</label>
      <input
        className="input"
        type="file"
        accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg"
        onChange={pick}
      />
      {file && (
        <div style={{marginTop:8, display:'flex', gap:12, alignItems:'center', flexWrap:'wrap'}}>
          <div className="file-pill">
            <strong>{file.name}</strong>
            <span className="badge">{Math.round(file.size/1024)} KB</span>
            <span style={{color:'#64748b'}}>{file.type}</span>
          </div>
          {isImage && <img src={file.data} alt="preview" style={{height:60, borderRadius:6, border:'1px solid #e5e7eb'}}/>}
          <button type="button" className="btn secondary" onClick={clear}>Remove</button>
        </div>
      )}
      <div className="footer-note">File is stored locally (base64) for this demo.</div>
    </div>
  )
}

const toBase64 = (file)=> new Promise((res,rej)=>{
  const r=new FileReader(); r.onload=()=>res(r.result); r.onerror=rej; r.readAsDataURL(file);
})
