import { useEffect, useState } from 'react'
import './Students.css'
import TeacherForm from './TeacherForm.jsx'

export default function Teachers() {
  const [teachers, setTeachers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)

  useEffect(() => {
    let mounted = true
    fetch('/api/teachers')
      .then((r) => {
        if (!r.ok) throw new Error(`${r.status} ${r.statusText}`)
        return r.json()
      })
      .then((data) => mounted && setTeachers(Array.isArray(data) ? data : []))
      .catch((err) => mounted && setError(err.message || 'Failed'))
      .finally(() => mounted && setLoading(false))
    return () => (mounted = false)
  }, [])

  if (loading) return <div className="students-root">Loading teachers…</div>
  if (error) return <div className="students-root error">Error: {error}</div>

  return (
    <div className="students-root">
      <header className="students-header">
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'baseline'}}>
          <div>
            <h1>Teachers</h1>
            <p className="muted">All teachers</p>
          </div>
          <div>
            <button className="btn primary" onClick={() => { setEditing(null); setShowForm(true) }}>Add Teacher</button>
          </div>
        </div>
      </header>

      <div className="students-grid">
        {teachers.map((t) => (
          <article className="student-card" key={t.id}>
            <div className="student-avatar">{(t.firstName?.[0] || '') + (t.lastName?.[0] || '')}</div>
            <div className="student-main">
              <div className="student-name">{t.firstName} {t.lastName}</div>
              <div className="student-email">Course: {t.course?.name ?? '—'}</div>
            </div>
            <div className="student-actions">
              <button className="btn ghost" onClick={() => { setEditing(t); setShowForm(true) }}>Edit</button>
              <button className="btn danger" onClick={() => deleteTeacher(t.id)}>Delete</button>
            </div>
          </article>
        ))}
      </div>

      {showForm && (
        <TeacherForm initial={editing} onClose={(saved) => { setShowForm(false); if (saved) window.location.reload() }} />
      )}
    </div>
  )
}

function deleteTeacher(id) {
  if (!confirm('Delete this teacher?')) return
  fetch(`/api/teachers/${id}`, { method: 'DELETE' })
    .then((r) => {
      if (r.status === 204) window.location.reload()
      else throw new Error('Delete failed')
    })
    .catch((e) => alert(e.message || 'Delete failed'))
}

function editTeacher(id, firstName, lastName) {
  const fn = prompt('First name', firstName)
  if (fn === null) return
  const ln = prompt('Last name', lastName)
  if (ln === null) return
  const body = { id, firstName: fn, lastName: ln }
  fetch(`/api/teachers/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
    .then((r) => {
      if (r.status === 204) window.location.reload()
      else return r.text().then((t) => { throw new Error(t || 'Update failed') })
    })
    .catch((e) => alert(e.message || 'Update failed'))
}
