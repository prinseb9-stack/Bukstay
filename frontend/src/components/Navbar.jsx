import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import '../styles/Navbar.css'

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false)
  const { userProfile, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    setMenuOpen(false)
    navigate('/')
  }

  const closeMenu = () => setMenuOpen(false)

  return (
    <nav className={`navbar ${theme}`}>
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

          <button 
            onClick={toggleTheme} 
            className="nav-link theme-toggle"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? '☀️ Light' : '🌙 Dark'}
          </button>

          {userProfile ? (
            <>
              {userProfile.role === 'admin' && (
                <Link to="/admin-panel-2025/dashboard" className="nav-link nav-admin" onClick={closeMenu}>
                  Admin
                </Link>
              )}
              {userProfile.role === 'user' && (
                <Link to="/User/dashboard" className="nav-link nav-dashboard" onClick={closeMenu}>
                  My Trips
                </Link>
              )}
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