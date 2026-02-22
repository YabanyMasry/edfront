import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import './Students.css'
import StudentForm from './StudentForm.jsx'

export default function StudentDetails() {
  const { id } = useParams()
  const [student, setStudent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const navigate = useNavigate()
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    let mounted = true
    setLoading(true)
    ;(async () => {
      try {
        const res = await fetch(`/api/students/${id}`)
        if (!res.ok) {
          throw new Error(`${res.status} ${res.statusText}`)
        }
        const data = await res.json()
        if (mounted) setStudent(data)
      } catch (err) {
        if (mounted) setError(err.message || 'Failed to load')
      } finally {
        if (mounted) setLoading(false)
      }
    })()

    return () => (mounted = false)
  }, [id])

  if (loading) return <div className="students-root">Loading…</div>
  if (error) return <div className="students-root error">Error: {error}</div>
  if (!student) return <div className="students-root">Student not found</div>

  function handleDelete() {
    if (!confirm('Delete this student?')) return
    fetch(`/api/students/${student.id}`, { method: 'DELETE' })
      .then((r) => {
        if (r.status === 204) navigate('/students')
        else throw new Error('Delete failed')
      })
      .catch((e) => alert(e.message || 'Delete failed'))
  }

  function handleEdit() { setShowForm(true) }

  return (
    <div className="students-root">
      <header className="students-header">
        <h1>{student.firstName} {student.lastName}</h1>
        <p className="muted">{student.email}</p>
      </header>

      <div style={{ display: 'flex', gap: 8 }}>
        <button className="btn primary" onClick={handleEdit}>Edit</button>
        <button className="btn danger" onClick={handleDelete}>Delete</button>
      </div>

      {showForm && (
        <StudentForm initial={student} onClose={(saved) => { setShowForm(false); if (saved) window.location.reload() }} />
      )}

      <section className="detail-section">
        <h3>Courses</h3>
        {Array.isArray(student.courses) && student.courses.filter(Boolean).length > 0 ? (
          <div className="courses-list">
            {student.courses.filter(Boolean).map((c) => {
              const teacher = Array.isArray(student.teachers)
                ? student.teachers.find(t => t?.course && (t.course.id === c.id || t.course.name === c.name))
                : null
              return (
                <div className="course-row" key={c.id}>
                  <div className="course-name">{c.name}</div>
                  <div className="course-teacher">{teacher ? `${teacher.firstName} ${teacher.lastName}` : <span className="muted">TBA</span>}</div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="no-courses">No courses</div>
        )}
      </section>

      <div style={{ marginTop: 16 }}>
        <Link to="/students">← Back to students</Link>
      </div>
    </div>
  )
}
