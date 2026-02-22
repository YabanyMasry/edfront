import './App.css'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Header from './components/Header.jsx'
import Students from './components/Students.jsx'
import StudentDetails from './components/StudentDetails.jsx'
import Courses from './components/Courses.jsx'
import CourseDetails from './components/CourseDetails.jsx'
import Teachers from './components/Teachers.jsx'

function App() {
  return (
    <BrowserRouter>
      <div>
        <Header />
        <main>
          <Routes>
            <Route path="/" element={<Navigate to="/students" replace />} />
            <Route path="/students" element={<Students />} />
            <Route path="/students/:id" element={<StudentDetails />} />
            <Route path="/courses" element={<Courses />} />
            <Route path="/courses/:id" element={<CourseDetails />} />
            <Route path="/teachers" element={<Teachers />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}

export default App
