import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import '../styles/Profile.css'

export default function Profile() {
  const { user } = useAuth()
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const res = await api.get('/api/bookings/my-bookings')
        setBookings(res.data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    if (user) fetchBookings()
  }, [user])

  if (!user) return null

  return (
    <div className="profile-container">
      <div className="profile-header">
        <div className="profile-avatar">
          {user.full_name?.[0]?.toUpperCase()}
        </div>
        <h1>{user.full_name}</h1>
        <p className="profile-email">{user.email}</p>
        <span className="profile-badge">{user.role}</span>
      </div>

      <div className="profile-section">
        <h2>Your Bookings</h2>
        {loading? (
          <div className="profile-loader">Loading bookings...</div>
        ) : bookings.length === 0? (
          <div className="profile-empty">
            <p>No bookings yet</p>
          </div>
        ) : (
          <div className="bookings-list">
            {bookings.map((booking) => (
              <div key={booking.id} className="booking-card">
                <img src={booking.property_image} alt={booking.property_title} />
                <div className="booking-info">
                  <h3>{booking.property_title}</h3>
                  <p>{booking.check_in} - {booking.check_out}</p>
                  <span className={`booking-status status-${booking.status}`}>
                    {booking.status}
                  </span>
                </div>
                <div className="booking-price">${booking.total_price}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}