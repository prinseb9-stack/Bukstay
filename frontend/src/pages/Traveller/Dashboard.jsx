import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { Calendar, Bookmark, Wallet, MapPin } from 'lucide-react'
import api from '../../services/api'
import '../../styles/TravellerDashboard.css'

export default function TravellerDashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [data, setData] = useState({
    stats: {
      upcoming_trips: 0,
      saved_places: 0,
      wallet_balance: 0,
      total_trips: 0
    },
    next_trip: null
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboard()
  }, [])

  const fetchDashboard = async () => {
    try {
      setLoading(true)
      const res = await api.get('/api/traveller/dashboard')
      setData(res.data)
    } catch (err) {
      console.error('Failed to load dashboard:', err)
    } finally {
      setLoading(false)
    }
  }

  const statsCards = [
    {
      label: 'Upcoming Trips',
      value: data.stats.upcoming_trips,
      icon: <Calendar size={20} />,
      path: '/traveller/bookings'
    },
    {
      label: 'Saved Places',
      value: data.stats.saved_places,
      icon: <Bookmark size={20} />,
      path: '/traveller/saved'
    },
    {
      label: 'Wallet Balance',
      value: `₦${data.stats.wallet_balance?.toLocaleString() || 0}`,
      icon: <Wallet size={20} />,
      path: '/traveller/wallet'
    },
    {
      label: 'Total Trips',
      value: data.stats.total_trips,
      icon: <MapPin size={20} />,
      path: '/traveller/bookings'
    }
  ]

  if (loading) {
    return (
      <div className="traveller-dashboard-container">
        <div className="dashboard-loader">
          <div className="spinner"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="traveller-dashboard-container">
      <div className="dashboard-wrapper">
        <div className="dashboard-header">
          <h1 className="dashboard-title">
            Welcome back, {user?.full_name || 'Traveller'}
          </h1>
          <p className="dashboard-subtitle">Here's your travel overview</p>
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

        <div className="content-card">
          <h2 className="section-title">Upcoming Trip</h2>
          {!data.next_trip ? (
            <div className="empty-trip">
              <div className="empty-icon">✈️</div>
              <h3>No upcoming trips</h3>
              <p>Start exploring and book your next adventure</p>
              <button 
                className="explore-btn"
                onClick={() => navigate('/discover')}
              >
                Explore Stays
              </button>
            </div>
          ) : (
            <div className="trip-card">
              <img 
                src={data.next_trip.property_image || 'https://placehold.co/400x300'} 
                alt={data.next_trip.property_title}
                className="trip-image"
              />
              <div className="trip-details">
                <h3 className="trip-title">{data.next_trip.property_title}</h3>
                <p className="trip-location">
                  <MapPin size={14} />
                  {data.next_trip.city}, {data.next_trip.country}
                </p>
                <p className="trip-dates">
                  {new Date(data.next_trip.check_in).toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric', 
                    year: 'numeric' 
                  })}
                  {' - '}
                  {new Date(data.next_trip.check_out).toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric', 
                    year: 'numeric' 
                  })}
                </p>
              </div>
              <button 
                className="view-trip-btn"
                onClick={() => navigate('/traveller/bookings')}
              >
                View Details
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}