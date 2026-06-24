import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { db } from '../../lib/firebase'
import { useGeoCurrency } from '../../hooks/useGeo'
import { Calendar, Bookmark, Wallet, MapPin } from 'lucide-react'
import '../../styles/UserDashboard.css'

export default function UserDashboard() {
  const { user, userProfile } = useAuth()
  const navigate = useNavigate()
  const { formatPrice } = useGeoCurrency()
  
  const [stats, setStats] = useState({
    upcoming_trips: 0,
    saved_places: 0,
    bukpay_balance: 0,
    total_trips: 0
  })
  const [nextTrip, setNextTrip] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDashboard = async () => {
      if (!user || !userProfile) return
      
      try {
        setLoading(true)

        const bookingsQuery = query(
          collection(db, 'bookings'),
          where('travellerId', '==', user.uid)
        )
        const bookingsSnap = await getDocs(bookingsQuery)
        const bookings = bookingsSnap.docs.map(doc => ({ 
          id: doc.id, 
          ...doc.data() 
        }))

        const now = new Date()
        const upcoming = bookings.filter(b => 
          new Date(b.checkIn) > now && 
          b.status === 'confirmed'
        )
        const completed = bookings.filter(b => b.status === 'completed')
        
        const sortedUpcoming = upcoming.sort((a, b) => 
          new Date(a.checkIn) - new Date(b.checkIn)
        )
        setNextTrip(sortedUpcoming[0] || null)

        const savedQuery = query(
          collection(db, 'savedProperties'),
          where('userId', '==', user.uid)
        )
        const savedSnap = await getDocs(savedQuery)

        let bukpayBalance = 0
        if (userProfile?.bukpayWalletId) {
          try {
            const bukpayRes = await fetch(
              `https://api.bukpay.com/v1/wallets/${userProfile.bukpayWalletId}/balance`,
              {
                headers: { 
                  'Authorization': `Bearer ${import.meta.env.VITE_BUKPAY_SECRET_KEY}` 
                }
              }
            )
            const bukpayData = await bukpayRes.json()
            if (bukpayRes.ok) {
              bukpayBalance = bukpayData.data?.balance || 0
            }
          } catch (err) {
            console.error('BukPay fetch error:', err)
          }
        }

        setStats({
          upcoming_trips: upcoming.length,
          saved_places: savedSnap.size,
          bukpay_balance: bukpayBalance,
          total_trips: completed.length
        })

      } catch (err) {
        console.error('Failed to load dashboard:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboard()
  }, [user, userProfile])

  const statsCards = [
    {
      label: 'Upcoming Trips',
      value: stats.upcoming_trips,
      icon: <Calendar size={20} />,
      path: '/User/bookings'
    },
    {
      label: 'Saved Places',
      value: stats.saved_places,
      icon: <Bookmark size={20} />,
      path: '/User/saved'
    },
    {
      label: 'BukPay Balance',
      value: formatPrice(stats.bukpay_balance),
      icon: <Wallet size={20} />,
      path: 'bukpay',
      badge: 'Cash out anytime'
    },
    {
      label: 'Total Trips',
      value: stats.total_trips,
      icon: <MapPin size={20} />,
      path: '/User/bookings'
    }
  ]

  const handleCardClick = (path) => {
    if (path === 'bukpay') {
      window.open('https://app.bukpay.com/wallet', '_blank')
    } else {
      navigate(path)
    }
  }

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
            Welcome back, {userProfile?.fullName || 'Traveller'}
          </h1>
          <p className="dashboard-subtitle">Here's your travel overview</p>
        </div>

        <div className="stats-grid">
          {statsCards.map((stat) => (
            <div
              key={stat.label}
              className="stat-card"
              onClick={() => handleCardClick(stat.path)}
            >
              <div className="stat-icon">{stat.icon}</div>
              <div className="stat-content">
                <p className="stat-label">
                  {stat.label}
                  {stat.badge && <span className="stat-badge">{stat.badge}</span>}
                </p>
                <p className="stat-value">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="content-card">
          <h2 className="section-title">Upcoming Trip</h2>
          {!nextTrip ? (
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
                src={nextTrip.propertyImage || 'https://via.placeholder.com/400x300'} 
                alt={nextTrip.propertyName}
                className="trip-image"
              />
              <div className="trip-details">
                <h3 className="trip-title">{nextTrip.propertyName}</h3>
                <p className="trip-location">
                  <MapPin size={14} />
                  {nextTrip.city || 'City'}, {nextTrip.country || 'Country'}
                </p>
                <p className="trip-dates">
                  {new Date(nextTrip.checkIn).toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric', 
                    year: 'numeric' 
                  })}
                  {' - '}
                  {new Date(nextTrip.checkOut).toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric', 
                    year: 'numeric' 
                  })}
                </p>
              </div>
              <button 
                className="view-trip-btn"
                onClick={() => navigate('/User/bookings')}
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