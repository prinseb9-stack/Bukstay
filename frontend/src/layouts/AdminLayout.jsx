import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { LayoutDashboard, Users, Home, Calendar, DollarSign, LogOut } from 'lucide-react'
import '../styles/DashboardLayout.css'

export default function AdminLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const navItems = [
    { path: '/admin/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { path: '/admin/users', label: 'Users', icon: <Users size={20} /> },
    { path: '/admin/properties', label: 'Properties', icon: <Home size={20} /> },
    { path: '/admin/bookings', label: 'Bookings', icon: <Calendar size={20} /> },
    { path: '/admin/payouts', label: 'Payouts', icon: <DollarSign size={20} /> },
  ]

  return (
    <div className="dashboard-layout">
      <aside className="dashboard-sidebar">
        <div className="sidebar-header">
          <h2>BukStay Admin</h2>
          <p>{user?.full_name}</p>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
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