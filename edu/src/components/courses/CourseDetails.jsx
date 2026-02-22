import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import '../shared/Students.css'
import CourseForm from './CourseForm.jsx'

export default function CourseDetails() {
  const { id } = useParams()
  const [course, setCourse] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    let mounted = true
    setLoading(true)
    ;(async () => {
      try {
        const res = await fetch(`/api/courses/${id}`)
        if (!res.ok) throw new Error(`${res.status} ${res.statusText}`)
        const data = await res.json()
        if (mounted) setCourse(data)
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
  if (!course) return <div className="students-root">Course not found</div>

  function handleDelete() {
    if (!confirm('Delete this course?')) return
    fetch(`/api/courses/${course.id}`, { method: 'DELETE' })
      .then((r) => {
        if (r.status === 204) navigate('/courses')
        else throw new Error('Delete failed')
      })
      .catch((e) => alert(e.message || 'Delete failed'))
  }

  function handleEdit() { setShowForm(true) }

  const teacher = (() => {
    if (course.teacher) return course.teacher
    if (!Array.isArray(course.teachers) || course.teachers.length === 0) return null
    const byCourseId = course.teachers.find(t => t && (t.courseId === course.id || t.course?.id === course.id))
    if (byCourseId) return byCourseId
    return course.teachers.find(Boolean) || null
  })()

  return (
    <div className="students-root">
      <header className="students-header">
        <h1>{course.name}</h1>
        <p className="muted">{teacher ? `${teacher.firstName} ${teacher.lastName}` : 'Teacher: TBA'}</p>
      </header>

      <div style={{ display: 'flex', gap: 8 }}>
        <button className="btn primary" onClick={handleEdit}>Edit</button>
        <button className="btn danger" onClick={handleDelete}>Delete</button>
      </div>

      {showForm && (
        <CourseForm initial={course} onClose={(saved) => { setShowForm(false); if (saved) window.location.reload() }} />
      )}

      <section className="detail-section">
        <h3>Enrolled Students</h3>
        {Array.isArray(course.students) && course.students.filter(Boolean).length > 0 ? (
          <div className="students-list">
            {course.students.filter(Boolean).map((s) => (
              <div className="student-row" key={s.id}>
                <div className="student-row-left">
                  <Link to={`/students/${s.id}`} className="student-name">{s.firstName} {s.lastName}</Link>
                  <div className="student-email muted">{s.email}</div>
                </div>
                <div className="student-row-right">{teacher ? `${teacher.firstName} ${teacher.lastName}` : <span className="muted">TBA</span>}</div>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-courses">No students enrolled</div>
        )}
      </section>

      <div style={{ marginTop: 16 }}>
        <Link to="/courses">← Back to courses</Link>
      </div>
    </div>
  )
}
