import { Outlet, NavLink, useNavigate, Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { LayoutDashboard, Home, Calendar, Wallet, LogOut, Settings, Star, MessageSquare } from 'lucide-react'
import '../styles/DashboardLayout.css'

export default function HostLayout() {
  const { userProfile, loading, isHost, logout } = useAuth()
  const navigate = useNavigate()

  if (loading) return <div className="dashboard-loader">Loading...</div>
  if (!userProfile || !isHost) return <Navigate to="/login" />

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  const navItems = [
    { path: '/host/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { path: '/host/properties', label: 'Properties', icon: <Home size={20} /> },
    { path: '/host/bookings', label: 'Bookings', icon: <Calendar size={20} /> },
    { path: '/host/earnings', label: 'Earnings', icon: <Wallet size={20} /> },
    { path: '/host/reviews', label: 'Reviews', icon: <Star size={20} /> },
    { path: '/host/messages', label: 'Messages', icon: <MessageSquare size={20} /> },
    { path: '/host/settings', label: 'Settings', icon: <Settings size={20} /> },
  ]

  return (
    <div className="host-layout dashboard-layout">
      <aside className="dashboard-sidebar host-sidebar">
        <div className="sidebar-header">
          <h2>BukStay Host</h2>
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

      <main className="dashboard-main host-main">
        <Outlet />
      </main>
    </div>
  )
}