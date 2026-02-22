import { useEffect, useState } from 'react'
import './Students.css'

export default function TeacherForm({ initial = null, onClose }) {
  const [firstName, setFirstName] = useState(initial?.firstName || '')
  const [lastName, setLastName] = useState(initial?.lastName || '')
  const [courseId, setCourseId] = useState(initial?.courseId || '')
  const [courses, setCourses] = useState([])
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    let mounted = true
    fetch('/api/courses')
      .then(r => r.ok ? r.json() : Promise.reject(r.statusText))
      .then(data => mounted && setCourses(Array.isArray(data) ? data : []))
      .catch(() => {})
    return () => (mounted = false)
  }, [])

  function close(result) { onClose && onClose(result) }

  function save(e) {
    e.preventDefault(); setSaving(true)
    // coerce courseId to number when present
    const payload = initial ? { id: initial.id, firstName, lastName, courseId: courseId ? Number(courseId) : null } : { firstName, lastName, courseId: courseId ? Number(courseId) : null }
    const url = initial ? `/api/teachers/${initial.id}` : '/api/teachers'
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
        <h2>{initial ? 'Edit Teacher' : 'Add Teacher'}</h2>
        <form onSubmit={save}>
          <label>First name
            <input value={firstName} onChange={e => setFirstName(e.target.value)} required />
          </label>
          <label>Last name
            <input value={lastName} onChange={e => setLastName(e.target.value)} required />
          </label>
          <label>Course
            <select value={courseId} onChange={e => setCourseId(e.target.value)}>
              <option value="">—</option>
              {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
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
