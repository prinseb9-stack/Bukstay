import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { collection, getDocs, query, where } from 'firebase/firestore'
import { db } from '../../lib/firebase'
import { useGeoCurrency } from '../../hooks/useGeo'
import '../../styles/AdminDashboard.css'

export default function AdminDashboard() {
  const navigate = useNavigate()
  const { formatPrice } = useGeoCurrency()
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalHosts: 0,
    totalProperties: 0,
    totalBookings: 0,
    totalRevenue: 0,
    pendingProperties: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const usersSnap = await getDocs(collection(db, 'users'))
        const users = usersSnap.docs.map(doc => doc.data())
        const hosts = users.filter(u => u.role === 'host')

        const propsSnap = await getDocs(collection(db, 'properties'))
        const properties = propsSnap.docs.map(doc => doc.data())
        const pending = properties.filter(p => p.status === 'pending')

        const bookingsSnap = await getDocs(collection(db, 'bookings'))
        const bookings = bookingsSnap.docs.map(doc => doc.data())
        
        const revenue = bookings
          .filter(b => b.status === 'completed')
          .reduce((sum, b) => sum + (b.totalPrice || 0), 0)

        setStats({
          totalUsers: users.length,
          totalHosts: hosts.length,
          totalProperties: properties.length,
          totalBookings: bookings.length,
          totalRevenue: revenue,
          pendingProperties: pending.length
        })
      } catch (err) {
        console.error('Fetch stats error:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  const adminCards = [
    {
      icon: '👥',
      title: 'Users',
      count: stats.totalUsers,
      subtext: `${stats.totalHosts} hosts`,
      color: '#3b82f6',
      path: '/admin-panel-2025/users'
    },
    {
      icon: '🏠',
      title: 'Properties',
      count: stats.totalProperties,
      subtext: `${stats.pendingProperties} pending approval`,
      color: '#10b981',
      path: '/admin-panel-2025/properties'
    },
    {
      icon: '📅',
      title: 'Bookings',
      count: stats.totalBookings,
      subtext: 'All reservations',
      color: '#f59e0b',
      path: '/admin-panel-2025/bookings'
    },
    {
      icon: '💰',
      title: 'Revenue',
      count: formatPrice(stats.totalRevenue),
      subtext: 'Total earned',
      color: '#8b5cf6',
      path: '/admin-panel-2025/payouts'
    },
    {
      icon: '💸',
      title: 'Payouts',
      count: 'Manage',
      subtext: 'Pay hosts',
      color: '#ec4899',
      path: '/admin-panel-2025/payouts'
    },
    {
      icon: '⚠️',
      title: 'Reports',
      count: 'View',
      subtext: 'Disputes & issues',
      color: '#ef4444',
      path: '/admin-panel-2025/payouts'
    }
  ]

  if (loading) {
    return <div className="admin-loading">Loading dashboard...</div>
  }

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <h1>Admin Control Panel</h1>
        <p>Manage BukStay platform</p>
      </div>

      <div className="admin-cards-grid">
        {adminCards.map((card, i) => (
          <div
            key={i}
            className="admin-card"
            onClick={() => navigate(card.path)}
            style={{ borderLeft: `4px solid ${card.color}` }}
          >
            <div className="admin-card-icon" style={{ background: `${card.color}20` }}>
              {card.icon}
            </div>
            <div className="admin-card-content">
              <h3 className="admin-card-title">{card.title}</h3>
              <p className="admin-card-count">{card.count}</p>
              <p className="admin-card-subtext">{card.subtext}</p>
            </div>
            <div className="admin-card-arrow">→</div>
          </div>
        ))}
      </div>

      <div className="admin-quick-actions">
        <h2>Quick Actions</h2>
        <div className="quick-action-buttons">
          <button onClick={() => navigate('/admin-panel-2025/properties')}>
            Approve Properties ({stats.pendingProperties})
          </button>
          <button onClick={() => navigate('/admin-panel-2025/payouts')}>
            Process Payouts
          </button>
        </div>
      </div>
    </div>
  )
}