import { useEffect, useState } from 'react'
import '../shared/Students.css'

export default function StudentForm({ initial = null, onClose }) {
  const [firstName, setFirstName] = useState(initial?.firstName || '')
  const [lastName, setLastName] = useState(initial?.lastName || '')
  const [email, setEmail] = useState(initial?.email || '')
  const [courses, setCourses] = useState([])
  const [selected, setSelected] = useState((initial?.courses || []).filter(Boolean).map(c => c.id))
  const [addingCourseId, setAddingCourseId] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    let mounted = true
    fetch('/api/courses')
      .then(r => r.ok ? r.json() : Promise.reject(r.statusText))
      .then(data => mounted && setCourses(Array.isArray(data) ? data : []))
      .catch(() => {})
    return () => (mounted = false)
  }, [])

  function removeCourse(id) {
    setSelected(s => s.filter(x => x !== id))
  }

  function addSelectedCourse() {
    if (!addingCourseId) return
    const id = Number(addingCourseId)
    if (!selected.includes(id)) setSelected(s => [...s, id])
    setAddingCourseId('')
  }

  function close(result) {
    onClose && onClose(result)
  }

  async function save(e) {
    e.preventDefault()
    setSaving(true)
    const payload = { firstName, lastName, email, courses: selected }
    const url = initial ? `/api/students/${initial.id}` : '/api/students'
    const method = initial ? 'PUT' : 'POST'

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(initial ? { ...payload, id: initial.id } : payload),
      })
      if (!res.ok) throw new Error((await res.text()) || 'Save failed')
      close(true)
    } catch (err) {
      alert(err.message || 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  const availableToAdd = courses.filter(c => !selected.includes(c.id))

  return (
    <div className="modal-overlay">
      <div className="modal simple-modal">
        <h2>{initial ? 'Edit Student' : 'Add Student'}</h2>
        <form onSubmit={save}>
          <label className="form-row">First name
            <input value={firstName} onChange={e => setFirstName(e.target.value)} required />
          </label>
          <label className="form-row">Last name
            <input value={lastName} onChange={e => setLastName(e.target.value)} required />
          </label>
          <label className="form-row">Email
            <input value={email} onChange={e => setEmail(e.target.value)} type="email" required />
          </label>

          <div style={{ marginTop: 8 }}>
            <strong>Courses</strong>
            <div className="chip-row">
              {selected.length === 0 && <div className="no-courses">No courses selected</div>}
              {selected.map(id => {
                const c = courses.find(x => x.id === id)
                return (
                  <div key={id} className="chip">
                    <span>{c?.name ?? `#${id}`}</span>
                    <button type="button" className="chip-remove" onClick={() => removeCourse(id)}>×</button>
                  </div>
                )
              })}
            </div>

            <div style={{ display: 'flex', gap: 8, marginTop: 8, alignItems: 'center' }}>
              <select value={addingCourseId} onChange={e => setAddingCourseId(e.target.value)}>
                <option value="">Add a course…</option>
                {availableToAdd.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <button type="button" className="btn ghost" onClick={addSelectedCourse}>Add</button>
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn ghost" onClick={() => close(false)}>Cancel</button>
            <button type="submit" className="btn primary" disabled={saving}>{saving ? 'Saving…' : 'Save'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}
