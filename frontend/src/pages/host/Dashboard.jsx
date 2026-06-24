import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'
import { useGeoCurrency } from '../../hooks/useGeo'
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore'
import { db } from '../../lib/firebase'
import { TrendingUp, Calendar, Home, Star, Plus } from 'lucide-react'
import '../../styles/HostDashboard.css'

export default function HostDashboard() {
  const { user, userProfile } = useAuth()
  const { theme } = useTheme()
  const { formatPrice } = useGeoCurrency()
  const navigate = useNavigate()
  
  const [data, setData] = useState({
    stats: {
      total_earnings: 0,
      active_bookings: 0,
      total_properties: 0,
      avg_rating: 0
    },
    recent_bookings: []
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDashboard = async () => {
      if (!user) return
      
      try {
        setLoading(true)
        const now = new Date()

        const propsQuery = query(
          collection(db, 'properties'),
          where('hostId', '==', user.uid)
        )
        const propsSnap = await getDocs(propsQuery)
        const properties = propsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }))

        const bookingsQuery = query(
          collection(db, 'bookings'),
          where('hostId', '==', user.uid)
        )
        const bookingsSnap = await getDocs(bookingsQuery)
        const allBookings = bookingsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }))

        const completedBookings = allBookings.filter(b => b.status === 'completed')
        const total_earnings = completedBookings.reduce((sum, b) => sum + (b.totalPrice || 0), 0)

        const active_bookings = allBookings.filter(b => {
          const checkIn = new Date(b.checkIn)
          const checkOut = new Date(b.checkOut)
          return b.status === 'confirmed' && checkIn <= now && now <= checkOut
        }).length

        const total_properties = properties.length

        const avg_rating = properties.length > 0
          ? properties.reduce((sum, p) => sum + (p.rating || 0), 0) / properties.length
          : 0

        const recent_bookings = allBookings
          .sort((a, b) => (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0))
          .slice(0, 5)

        setData({
          stats: { total_earnings, active_bookings, total_properties, avg_rating },
          recent_bookings
        })

      } catch (err) {
        console.error('Failed to load dashboard:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboard()
  }, [user])

  if (loading) {
    return (
      <div className="host-dashboard-container">
        <div className="host-loader">
          <div className="spinner"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    )
  }

  const statsCards = [
    {
      label: 'Total Revenue',
      value: formatPrice(data.stats.total_earnings),
      icon: <TrendingUp size={20} />,
      path: '/host/earnings'
    },
    {
      label: 'Active Bookings',
      value: data.stats.active_bookings,
      icon: <Calendar size={20} />,
      path: '/host/bookings'
    },
    {
      label: 'Properties',
      value: data.stats.total_properties,
      icon: <Home size={20} />,
      path: '/host/properties'
    },
    {
      label: 'Avg Rating',
      value: data.stats.avg_rating.toFixed(1),
      icon: <Star size={20} />,
      path: '/host/properties'
    }
  ]

  return (
    <div className="host-dashboard-container">
      <div className="host-dashboard-wrapper">
        <div className="dashboard-header">
          <div>
            <h1 className="dashboard-title">Host Dashboard</h1>
            <p className="dashboard-welcome">Welcome back, {userProfile?.fullName}</p>
          </div>
          <button 
            className="add-property-btn"
            onClick={() => navigate('/host/properties/new')}
          >
            <Plus size={18} />
            <span>Add Property</span>
          </button>
        </div>

        <div className="stats-grid">
          {statsCards.map((stat) => (
            <div
              key={stat.label}
              className="stat-card"
              onClick={() => navigate(stat.path)}
            >
              <div className="stat-icon">{stat.icon}</div>
              <div className="stat-content">
                <p className="stat-label">{stat.label}</p>
                <p className="stat-value">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="dashboard-content">
          <div className="content-card">
            <div className="card-header">
              <h2>Recent Bookings</h2>
              <button className="view-all-btn" onClick={() => navigate('/host/bookings')}>
                View all
              </button>
            </div>
            
            {data.recent_bookings.length === 0 ? (
              <div className="empty-state">
                <p>No bookings yet</p>
                <span>Your bookings will appear here once guests book your properties</span>
              </div>
            ) : (
              <div className="bookings-list">
                {data.recent_bookings.map((booking) => (
                  <div key={booking.id} className="booking-item">
                    <div className="booking-info">
                      <p className="booking-guest">{booking.travellerName || 'Guest'}</p>
                      <p className="booking-property">{booking.propertyName}</p>
                      <p className="booking-dates">
                        {new Date(booking.checkIn).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        {' - '}
                        {new Date(booking.checkOut).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </p>
                    </div>
                    <div className="booking-meta">
                      <p className="booking-amount">{formatPrice(booking.totalPrice)}</p>
                      <span className={`booking-status status-${booking.status}`}>{booking.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="content-card">
            <h2>Quick Actions</h2>
            <div className="actions-list">
              <button className="action-btn primary" onClick={() => navigate('/host/properties/new')}>
                Add New Property
              </button>
              <button className="action-btn" onClick={() => navigate('/host/bookings')}>
                Manage Bookings
              </button>
              <button className="action-btn" onClick={() => navigate('/host/earnings')}>
                View Earnings
              </button>
              <button className="action-btn" onClick={() => navigate('/host/properties')}>
                Edit Listings
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}