import { useState, useEffect } from 'react'
import { Outlet, NavLink, useNavigate, Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { collection, query, where, onSnapshot } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { LayoutDashboard, Users, Home, Calendar, DollarSign, LogOut, UtensilsCrossed } from 'lucide-react'
import '../styles/DashboardLayout.css'

export default function AdminLayout() {
  const { userProfile, loading, logout } = useAuth()
  const navigate = useNavigate()
  const [pendingCount, setPendingCount] = useState(0)

  if (loading) return <div className="dashboard-loader">Loading...</div>
  if (!userProfile || userProfile.role !== 'admin') return <Navigate to="/login" />

  useEffect(() => {
    const propsQuery = query(collection(db, 'properties'), where('status', '==', 'pending'))
    
    const unsubProps = onSnapshot(propsQuery, (snap) => {
      setPendingCount(snap.size)
    }, (err) => {
      console.error('Admin pending listener error:', err)
    })

    return () => unsubProps()
  }, [])

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  const navItems = [
    { 
      path: '/admin-panel-2025/dashboard', 
      label: 'Dashboard', 
      icon: <LayoutDashboard size={20} />,
      badge: pendingCount > 0 ? pendingCount : null 
    },
    { path: '/admin-panel-2025/users', label: 'Users', icon: <Users size={20} /> },
    { path: '/admin-panel-2025/properties', label: 'Properties', icon: <Home size={20} /> },
    { path: '/admin-panel-2025/bookings', label: 'Bookings', icon: <Calendar size={20} /> },
    { path: '/admin-panel-2025/payouts', label: 'Payouts', icon: <DollarSign size={20} /> },
    { path: '/admin-panel-2025/food-menus', label: 'Food Menus', icon: <UtensilsCrossed size={20} /> },
  ]

  return (
    <div className="dashboard-layout">
      <aside className="dashboard-sidebar">
        <div className="sidebar-header">
          <h2>BukStay Admin</h2>
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
              {item.badge && <span className="nav-badge">{item.badge}</span>}
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