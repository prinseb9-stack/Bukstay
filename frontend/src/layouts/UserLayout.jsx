import { Outlet, NavLink, useNavigate, Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { LayoutDashboard, Calendar, Heart, User, LogOut, CreditCard } from 'lucide-react'
import '../styles/DashboardLayout.css'

export default function UserLayout() {
  const { userProfile, loading, logout } = useAuth()
  const { theme } = useTheme()
  const navigate = useNavigate()

  if (loading) return <div className="dashboard-loader">Loading...</div>
  if (!userProfile) return <Navigate to="/login" />
  if (userProfile.role !== 'user' && userProfile.role !== 'host') return <Navigate to="/" />

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  const navItems = [
    { path: '/User/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { path: '/User/bookings', label: 'My Bookings', icon: <Calendar size={20} /> },
    { path: '/User/saved', label: 'Saved Places', icon: <Heart size={20} /> },
    { path: '/User/credits', label: 'Credits', icon: <CreditCard size={20} /> },
    { path: '/User/profile', label: 'Profile', icon: <User size={20} /> },
  ]

  return (
    <div className="dashboard-layout">
      <aside className="dashboard-sidebar">
        <div className="sidebar-header">
          <h2>My Trips</h2>
          <p>{userProfile?.fullName || userProfile?.email}</p>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path.endsWith('dashboard')}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              {item.icon}
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <button className="logout-btn" onClick={handleLogout}>
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </aside>

      <main className="dashboard-main">
        <Outlet />
      </main>
    </div>
  )
}