import { useEffect, useState } from 'react'
import './Students.css'

export default function CourseForm({ initial = null, onClose }) {
  const [name, setName] = useState(initial?.name || '')
  const [saving, setSaving] = useState(false)

  function close(result) { onClose && onClose(result) }

  function save(e) {
    e.preventDefault(); setSaving(true)
    const payload = initial ? { id: initial.id, name } : { name }
    const url = initial ? `/api/courses/${initial.id}` : '/api/courses'
    const method = initial ? 'PUT' : 'POST'
    fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      .then(r => {
        if (r.ok) return r.json().catch(() => null)
        return r.text().then(t => Promise.reject(t || 'Save failed'))
      })
      .then(() => close(true))
      .catch(e => alert(e || 'Save failed'))
      .finally(() => setSaving(false))
  }

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>{initial ? 'Edit Course' : 'Add Course'}</h2>
        <form onSubmit={save}>
          <label>Course name
            <input value={name} onChange={e => setName(e.target.value)} required />
          </label>
          <div className="modal-actions">
            <button type="button" className="btn ghost" onClick={() => close(false)}>Cancel</button>
            <button type="submit" className="btn primary" disabled={saving}>{saving ? 'Saving…' : 'Save'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}
