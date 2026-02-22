import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import StudentForm from './StudentForm.jsx'
import '../shared/Students.css'

export default function Students() {
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)

  useEffect(() => {
    let mounted = true
    setLoading(true)
    fetch('/api/students')
      .then((res) => {
        if (!res.ok) throw new Error(`${res.status} ${res.statusText}`)
        return res.json()
      })
      .then((data) => {
        if (!mounted) return
        setStudents(Array.isArray(data) ? data : [])
      })
      .catch((err) => {
        if (!mounted) return
        setError(err.message || 'Failed to load')
      })
      .finally(() => mounted && setLoading(false))

    return () => {
      mounted = false
    }
  }, [])

  if (loading) return <div className="students-root">Loading students…</div>
  if (error) return <div className="students-root error">Error: {error}</div>

  return (
    <div className="students-root">
      <header className="students-header">
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'baseline'}}>
          <div>
            <h1>Students</h1>
            <p className="muted">List of students and their enrolled courses</p>
          </div>
          <div>
            <button className="btn primary" onClick={() => { setEditing(null); setShowForm(true) }}>Add Student</button>
          </div>
        </div>
      </header>

      <div className="students-grid">
        {students.map((s) => (
          <article className="student-card" key={s.id}>
            <Link to={`/students/${s.id}`} className="student-card-link">
              <div className="student-main">
                <div className="student-name">{s.firstName} {s.lastName}</div>
                <div className="student-email">{s.email}</div>

                <div className="student-courses">
                  <strong>Courses</strong>
                  {Array.isArray(s.courses) && s.courses.filter(Boolean).length > 0 ? (
                    <div className="course-list">
                      {s.courses.filter(Boolean).map((c) => (
                        <span className="course-pill" key={c.id}>{c.name}</span>
                      ))}
                    </div>
                  ) : (
                    <div className="no-courses">No courses</div>
                  )}
                </div>
              </div>
            </Link>

            <div className="student-actions">
              <button className="btn ghost" title="Edit student" onClick={() => { setEditing(s); setShowForm(true) }}>Edit</button>
              <button className="btn danger" title="Delete student" onClick={() => handleDelete(s.id)}>Delete</button>
            </div>
          </article>
        ))}
      </div>

      {showForm && (
        <StudentForm initial={editing} onClose={(saved) => { setShowForm(false); if (saved) window.location.reload() }} />
      )}
    </div>
  )
}

function handleDelete(id) {
  if (!confirm('Delete this student?')) return
  fetch(`/api/students/${id}`, { method: 'DELETE' })
    .then((r) => {
      if (r.status === 204) {
        window.location.reload()
      } else {
        throw new Error('Failed to delete')
      }
    })
    .catch((err) => alert(err.message || 'Delete failed'))
}

function handleEdit(id) {
  const firstName = prompt('First name')
  if (firstName === null) return
  const lastName = prompt('Last name')
  if (lastName === null) return
  const email = prompt('Email')
  if (email === null) return

  const body = { id, firstName, lastName, email }
  fetch(`/api/students/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
    .then((r) => {
      if (r.status === 204) {
        window.location.reload()
      } else {
        return r.text().then((t) => { throw new Error(t || 'Update failed') })
      }
    })
    .catch((err) => alert(err.message || 'Update failed'))
}
