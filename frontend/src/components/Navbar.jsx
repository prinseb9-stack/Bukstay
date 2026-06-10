import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import '../styles/Navbar.css'

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false)
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    setMenuOpen(false)
    navigate('/')
  }

  const closeMenu = () => setMenuOpen(false)

  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/" className="nav-logo" onClick={closeMenu}>
          BukStay
        </Link>

        <button 
          className={`hamburger ${menuOpen ? 'active' : ''}`}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        <div className={`nav-menu ${menuOpen ? 'active' : ''}`}>
          <Link to="/discover" className="nav-link" onClick={closeMenu}>
            Discover
          </Link>
          <Link to="/stays" className="nav-link" onClick={closeMenu}>
            Stays
          </Link>

          {user ? (
            <>
              {user.role === 'host' && (
                <Link to="/host/dashboard" className="nav-link" onClick={closeMenu}>
                  Host Dashboard
                </Link>
              )}
              {user.role === 'admin' && (
                <Link to="/admin/dashboard" className="nav-link" onClick={closeMenu}>
                  Admin
                </Link>
              )}
              {user.role === 'traveller' && (
                <Link to="/traveller" className="nav-link" onClick={closeMenu}>
                  My Trips
                </Link>
              )}
              <Link to="/profile" className="nav-link" onClick={closeMenu}>
                Profile
              </Link>
              <button className="nav-link nav-logout" onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-link" onClick={closeMenu}>
                Login
              </Link>
              <Link to="/register" className="nav-link nav-register" onClick={closeMenu}>
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}

export default Navbar