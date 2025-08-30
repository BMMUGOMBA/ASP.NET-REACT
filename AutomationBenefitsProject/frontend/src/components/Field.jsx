/*export default function Field({label, children}) {
    return (
        <div className = "col">
            <label>{label}</label>
        </div>
    )
}*/
// src/components/Field.jsx
export default function Field({ label, description, error, children }) {
  return (
    <div className="col">
      <label>{label}</label>
      {description && <div className="footer-note">{description}</div>}
      {children} {/* <-- critical */}
      {error && (
        <div className="footer-note" style={{ color: 'crimson' }}>
          {error.message || error}
        </div>
      )}
    </div>
  );
}
