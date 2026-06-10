import { useState, useEffect } from 'react'
import { Calendar, MapPin } from 'lucide-react'
import api from '../../services/api'
import '../../styles/TravellerBookings.css'

const tabs = ['Upcoming', 'Past', 'Cancelled']

export default function Bookings() {
  const [activeTab, setActiveTab] = useState('Upcoming')
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [filteredBookings, setFilteredBookings] = useState([])

  useEffect(() => {
    fetchBookings()
  }, [])

  useEffect(() => {
    filterBookings()
  }, [activeTab, bookings])

  const fetchBookings = async () => {
    try {
      setLoading(true)
      const res = await api.get('/api/traveller/bookings')
      setBookings(res.data)
    } catch (err) {
      console.error('Failed to load bookings:', err)
    } finally {
      setLoading(false)
    }
  }

  const filterBookings = () => {
    const now = new Date()
    const filtered = bookings.filter((booking) => {
      const checkOut = new Date(booking.check_out)
      const checkIn = new Date(booking.check_in)

      if (activeTab === 'Upcoming') {
        return checkIn >= now && booking.status !== 'cancelled'
      }
      if (activeTab === 'Past') {
        return checkOut < now && booking.status === 'completed'
      }
      if (activeTab === 'Cancelled') {
        return booking.status === 'cancelled'
      }
      return true
    })
    setFilteredBookings(filtered)
  }

  const getTabCount = (tab) => {
    const now = new Date()
    return bookings.filter(b => {
      const checkOut = new Date(b.check_out)
      const checkIn = new Date(b.check_in)
      if (tab === 'Upcoming') return checkIn >= now && b.status !== 'cancelled'
      if (tab === 'Past') return checkOut < now && b.status === 'completed'
      if (tab === 'Cancelled') return b.status === 'cancelled'
      return false
    }).length
  }

  if (loading) {
    return (
      <div className="traveller-bookings-container">
        <div className="bookings-loader">
          <div className="spinner"></div>
          <p>Loading bookings...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="traveller-bookings-container">
      <div className="bookings-wrapper">
        <h1 className="bookings-title">Your Bookings</h1>

        <div className="bookings-tabs">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
            >
              {tab}
              <span className="tab-count">{getTabCount(tab)}</span>
            </button>
          ))}
        </div>

        {filteredBookings.length === 0 ? (
          <div className="bookings-empty">
            <div className="empty-icon">
              <Calendar size={64} />
            </div>
            <h2>No {activeTab.toLowerCase()} bookings</h2>
            <p>
              {activeTab === 'Upcoming'
                ? 'You have no upcoming trips. Start exploring!'
                : activeTab === 'Past'
                ? 'Your completed trips will appear here'
                : 'You have no cancelled bookings'}
            </p>
            {activeTab === 'Upcoming' && (
              <button 
                className="explore-btn"
                onClick={() => window.location.href = '/discover'}
              >
                Explore Stays
              </button>
            )}
          </div>
        ) : (
          <div className="bookings-list">
            {filteredBookings.map((booking) => (
              <div key={booking.id} className="booking-card">
                <img 
                  src={booking.property_image || 'https://placehold.co/200x200'} 
                  alt={booking.property_title}
                  className="booking-image"
                />
                <div className="booking-content">
                  <div className="booking-header">
                    <div className="booking-info">
                      <h3 className="booking-property">{booking.property_title}</h3>
                      <p className="booking-location">
                        <MapPin size={14} />
                        {booking.city}, {booking.country}
                      </p>
                    </div>
                    <span className={`booking-status status-${booking.status}`}>
                      {booking.status}
                    </span>
                  </div>

                  <div className="booking-dates">
                    <Calendar size={16} />
                    <span>
                      {new Date(booking.check_in).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric', 
                        year: 'numeric' 
                      })}
                      {' → '}
                      {new Date(booking.check_out).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric', 
                        year: 'numeric' 
                      })}
                    </span>
                  </div>

                  <div className="booking-footer">
                    <div className="booking-price">
                      <span className="price-label">Total</span>
                      <span className="price-amount">₦{booking.total_price?.toLocaleString()}</span>
                    </div>
                    <div className="booking-guests">
                      {booking.guests} {booking.guests === 1 ? 'guest' : 'guests'}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}