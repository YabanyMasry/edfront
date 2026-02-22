import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import './Students.css'
import CourseForm from './CourseForm.jsx'

export default function Courses() {
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)

  useEffect(() => {
    let mounted = true
    fetch('/api/courses')
      .then((r) => {
        if (!r.ok) throw new Error(`${r.status} ${r.statusText}`)
        return r.json()
      })
      .then((data) => mounted && setCourses(Array.isArray(data) ? data : []))
      .catch((err) => mounted && setError(err.message || 'Failed'))
      .finally(() => mounted && setLoading(false))
    return () => (mounted = false)
  }, [])

  if (loading) return <div className="students-root">Loading courses…</div>
  if (error) return <div className="students-root error">Error: {error}</div>

  return (
    <div className="students-root">
      <header className="students-header">
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'baseline'}}>
          <div>
            <h1>Courses</h1>
            <p className="muted">All available courses</p>
          </div>
          <div>
            <button className="btn primary" onClick={() => { setEditing(null); setShowForm(true) }}>Add Course</button>
          </div>
        </div>
      </header>

      <div className="students-grid">
        {courses.map((c) => (
          <article className="student-card" key={c.id}>
            <Link to={`/courses/${c.id}`} className="student-card-link">
              <div className="student-main">
                <div className="student-name">{c.name}</div>
                <div className="student-email">{Array.isArray(c.students) ? c.students.filter(Boolean).length : 0} students</div>
              </div>
            </Link>
            <div className="student-actions">
              <button className="btn ghost" onClick={() => { setEditing(c); setShowForm(true) }}>Edit</button>
              <button className="btn danger" onClick={() => deleteCourse(c.id)}>Delete</button>
            </div>
          </article>
        ))}
      </div>

      {showForm && (
        <CourseForm initial={editing} onClose={(saved) => { setShowForm(false); if (saved) window.location.reload() }} />
      )}
    </div>
  )
}

function deleteCourse(id) {
  if (!confirm('Delete this course?')) return
  fetch(`/api/courses/${id}`, { method: 'DELETE' })
    .then((r) => {
      if (r.status === 204) window.location.reload()
      else throw new Error('Delete failed')
    })
    .catch((e) => alert(e.message || 'Delete failed'))
}

function editCourse(id, currentName) {
  const name = prompt('Course name', currentName)
  if (name === null) return
  const body = { id, name }
  fetch(`/api/courses/${id}`, {
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
