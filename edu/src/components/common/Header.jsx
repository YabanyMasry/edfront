import { Link, NavLink } from 'react-router-dom'
import './Header.css'

export default function Header() {
  return (
    <header className="app-header">
      <div className="brand">
        <Link to="/" className="brand-link">EduFront</Link>
      </div>
      <nav className="main-nav">
        <NavLink to="/students" className={({isActive}) => isActive ? 'nav-item active' : 'nav-item'}>Students</NavLink>
        <NavLink to="/courses" className={({isActive}) => isActive ? 'nav-item active' : 'nav-item'}>Courses</NavLink>
        <NavLink to="/teachers" className={({isActive}) => isActive ? 'nav-item active' : 'nav-item'}>Teachers</NavLink>
      </nav>
    </header>
  )
}
