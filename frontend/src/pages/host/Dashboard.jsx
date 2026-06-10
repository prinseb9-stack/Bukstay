import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import api from '../../services/api'
import { TrendingUp, Calendar, Home, Star, Plus } from 'lucide-react'
import '../../styles/HostDashboard.css'

export default function HostDashboard() {
  const { user } = useAuth()
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
      try {
        const res = await api.get('/api/host/dashboard')
        setData(res.data)
      } catch (err) {
        console.error('Failed to load dashboard:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchDashboard()
  }, [])

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
      label: 'Total Earnings',
      value: `₦${data.stats.total_earnings?.toLocaleString() || 0}`,
      icon: <TrendingUp size={20} />,
      path: '/host/earnings'
    },
    {
      label: 'Active Bookings',
      value: data.stats.active_bookings || 0,
      icon: <Calendar size={20} />,
      path: '/host/bookings'
    },
    {
      label: 'Properties',
      value: data.stats.total_properties || 0,
      icon: <Home size={20} />,
      path: '/host/properties'
    },
    {
      label: 'Avg Rating',
      value: data.stats.avg_rating?.toFixed(1) || '0.0',
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
            <p className="dashboard-welcome">Welcome back, {user?.full_name}</p>
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
              <button 
                className="view-all-btn"
                onClick={() => navigate('/host/bookings')}
              >
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
                      <p className="booking-guest">{booking.guest_name}</p>
                      <p className="booking-property">{booking.property_title}</p>
                      <p className="booking-dates">
                        {new Date(booking.check_in).toLocaleDateString()} - {new Date(booking.check_out).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="booking-meta">
                      <p className="booking-amount">₦{booking.total_price?.toLocaleString()}</p>
                      <span className={`booking-status status-${booking.status}`}>
                        {booking.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="content-card">
            <h2>Quick Actions</h2>
            <div className="actions-list">
              <button
                className="action-btn primary"
                onClick={() => navigate('/host/properties/new')}
              >
                Add New Property
              </button>
              <button
                className="action-btn"
                onClick={() => navigate('/host/bookings')}
              >
                Manage Bookings
              </button>
              <button
                className="action-btn"
                onClick={() => navigate('/host/earnings')}
              >
                View Earnings
              </button>
              <button
                className="action-btn"
                onClick={() => navigate('/host/properties')}
              >
                Edit Listings
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}