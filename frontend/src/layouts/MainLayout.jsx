import { Outlet, useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import Footer from '../components/Footer'
import '../styles/MainLayout.css'

export default function MainLayout() {
  const { userProfile, loading, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  if (loading) {
    return (
      <div className={`layout-loader ${theme}`}>
        <div className="spinner"></div>
      </div>
    )
  }

  const isDark = theme === 'dark'

  return (
    <div className={`main-layout ${isDark ? 'dark' : 'light'}`}>
      <nav className="navbar">
        <div className="nav-container">
          <Link to="/" className="nav-logo">
            BukStay
          </Link>

          <div className="nav-menu">
            <Link to="/discover" className="nav-link">
              Discover
            </Link>
            <Link to="/stays" className="nav-link">
              Stays
            </Link>
            <Link to="/food" className="nav-link">
              Food
             </Link>

            <button 
              onClick={toggleTheme} 
              className="nav-link theme-toggle"
              aria-label="Toggle theme"
            >
              {isDark ? '☀️' : '🌙'}
            </button>

            {userProfile ? (
              <>
                {/* Admin only — hosts never see this layout */}
                {userProfile.role === 'admin' && (
                  <button 
                    onClick={() => navigate('/admin-panel-2025/dashboard')} 
                    className="btn-outline-danger"
                  >
                    Admin
                  </button>
                )}
                {/* Regular users — "My Trips" */}
                {userProfile.role === 'user' && (
                  <button 
                    onClick={() => navigate('/User/dashboard')} 
                    className="btn-outline-primary"
                  >
                    My Trips
                  </button>
                )}
                <button onClick={handleLogout} className="btn-text">
                  Logout
                </button>
              </>
            ) : (
              <>
                <button 
                  onClick={() => navigate('/login')} 
                  className="btn-outline-primary"
                >
                  Sign In
                </button>
                <button 
                  onClick={() => navigate('/register')} 
                  className="btn-primary"
                >
                  Get Started
                </button>
              </>
            )}
          </div>
        </div>
      </nav>

      <main className="main-content">
        <Outlet />
      </main>
      
      <Footer />
    </div>
  )
}