import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'
import { useGeoCurrency } from '../../hooks/useGeo'
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore'
import { db } from '../../lib/firebase'
import '../../styles/HostBookings.css'

const tabs = ['All', 'Upcoming', 'Completed', 'Cancelled']

export default function HostBookings() {
  const { user } = useAuth()
  const { theme } = useTheme()
  const { formatPrice } = useGeoCurrency()
  
  const [activeTab, setActiveTab] = useState('All')
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [filteredBookings, setFilteredBookings] = useState([])

  useEffect(() => {
    const fetchBookings = async () => {
      if (!user) return
      
      try {
        setLoading(true)
        const bookingsQuery = query(
          collection(db, 'bookings'),
          where('hostId', '==', user.uid),
          orderBy('createdAt', 'desc')
        )
        const snap = await getDocs(bookingsQuery)
        const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }))
        setBookings(data)
      } catch (err) {
        console.error('Failed to load bookings:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchBookings()
  }, [user])

  useEffect(() => {
    if (activeTab === 'All') {
      setFilteredBookings(bookings)
      return
    }

    const now = new Date()
    const filtered = bookings.filter((booking) => {
      const checkOut = new Date(booking.checkOut)
      const checkIn = new Date(booking.checkIn)
      if (activeTab === 'Upcoming') return checkIn >= now && booking.status === 'confirmed'
      if (activeTab === 'Completed') return checkOut < now && (booking.status === 'completed' || booking.status === 'confirmed')
      if (activeTab === 'Cancelled') return booking.status === 'cancelled'
      return true
    })
    setFilteredBookings(filtered)
  }, [activeTab, bookings])

  const getStatusBadge = (status) => {
    const statusMap = { confirmed: 'confirmed', completed: 'completed', cancelled: 'cancelled', pending: 'pending' }
    return statusMap[status] || 'default'
  }

  const getTabCount = (tab) => {
    const now = new Date()
    return bookings.filter(b => {
      const checkOut = new Date(b.checkOut)
      const checkIn = new Date(b.checkIn)
      if (tab === 'Upcoming') return checkIn >= now && b.status === 'confirmed'
      if (tab === 'Completed') return checkOut < now && (b.status === 'completed' || b.status === 'confirmed')
      if (tab === 'Cancelled') return b.status === 'cancelled'
      return false
    }).length
  }

  if (loading) {
    return (
      <div className="host-bookings-container">
        <div className="bookings-loader">
          <div className="spinner"></div>
          <p>Loading bookings...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="host-bookings-container">
      <div className="bookings-wrapper">
        <h1 className="bookings-title">Bookings</h1>

        <div className="bookings-tabs">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
            >
              {tab}
              {tab !== 'All' && <span className="tab-count">{getTabCount(tab)}</span>}
            </button>
          ))}
        </div>

        {filteredBookings.length === 0 ? (
          <div className="bookings-empty">
            <div className="empty-icon">📅</div>
            <h2>No {activeTab.toLowerCase()} bookings</h2>
            <p>
              {activeTab === 'All'
                ? 'Bookings will appear here once guests book your properties'
                : `You don't have any ${activeTab.toLowerCase()} bookings yet`}
            </p>
          </div>
        ) : (
          <>
            <div className="bookings-table-wrapper desktop-only">
              <table className="bookings-table">
                <thead>
                  <tr>
                    <th>Guest</th>
                    <th>Property</th>
                    <th>Dates</th>
                    <th>Guests</th>
                    <th>Amount</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBookings.map((booking) => (
                    <tr key={booking.id}>
                      <td>
                        <div className="guest-cell">
                          <img
                            src={booking.guestAvatar || 'https://i.pravatar.cc/100'}
                            alt={booking.travellerName}
                            className="guest-avatar"
                          />
                          <span className="guest-name">{booking.travellerName || 'Guest'}</span>
                        </div>
                      </td>
                      <td className="property-cell">{booking.propertyName}</td>
                      <td className="dates-cell">
                        {new Date(booking.checkIn).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        {' → '}
                        {new Date(booking.checkOut).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                      <td className="guests-cell">{booking.guests}</td>
                      <td className="amount-cell">{formatPrice(booking.totalPrice)}</td>
                      <td>
                        <span className={`status-badge status-${getStatusBadge(booking.status)}`}>
                          {booking.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="bookings-cards mobile-only">
              {filteredBookings.map((booking) => (
                <div key={booking.id} className="booking-card">
                  <div className="booking-card-header">
                    <div className="guest-info">
                      <img
                        src={booking.guestAvatar || 'https://i.pravatar.cc/100'}
                        alt={booking.travellerName}
                        className="guest-avatar"
                      />
                      <div>
                        <p className="guest-name">{booking.travellerName || 'Guest'}</p>
                        <p className="property-name">{booking.propertyName}</p>
                      </div>
                    </div>
                    <span className={`status-badge status-${getStatusBadge(booking.status)}`}>
                      {booking.status}
                    </span>
                  </div>
                  <div className="booking-card-body">
                    <div className="booking-detail">
                      <span className="detail-label">Check-in</span>
                      <span className="detail-value">
                        {new Date(booking.checkIn).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>
                    <div className="booking-detail">
                      <span className="detail-label">Check-out</span>
                      <span className="detail-value">
                        {new Date(booking.checkOut).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>
                    <div className="booking-detail">
                      <span className="detail-label">Guests</span>
                      <span className="detail-value">{booking.guests}</span>
                    </div>
                    <div className="booking-detail">
                      <span className="detail-label">Total</span>
                      <span className="detail-value amount">{formatPrice(booking.totalPrice)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}