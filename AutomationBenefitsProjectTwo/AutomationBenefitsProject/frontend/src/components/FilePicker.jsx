// src/components/FilePicker.jsx
import React, { useEffect, useMemo, useState } from "react";

export default function FilePicker({ label, file, onChange }) {
  const [previewUrl, setPreviewUrl] = useState(null);
  const isImage = useMemo(
    () => file && file.type && /^image\//.test(file.type),
    [file]
  );

  useEffect(() => {
    if (file && isImage) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setPreviewUrl(null);
    }
  }, [file, isImage]);

  const pick = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    onChange(f); // <-- pass RAW File (not base64)
  };

  const clear = () => onChange(null);

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
        <div
          style={{
            marginTop: 8,
            display: "flex",
            gap: 12,
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <div className="file-pill">
            <strong>{file.name}</strong>
            <span className="badge">{Math.round(file.size / 1024)} KB</span>
            <span style={{ color: "#64748b" }}>{file.type || "file"}</span>
          </div>
          {isImage && previewUrl && (
            <img
              src={previewUrl}
              alt="preview"
              style={{ height: 60, borderRadius: 6, border: "1px solid #e5e7eb" }}
            />
          )}
          <button type="button" className="btn secondary" onClick={clear}>
            Remove
          </button>
        </div>
      )}
      <div className="footer-note">
        File will be uploaded to the server (multipart/form-data).
      </div>
    </div>
  );
}
