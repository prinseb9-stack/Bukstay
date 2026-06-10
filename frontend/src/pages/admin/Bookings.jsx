import { useState, useEffect } from 'react'
import api from '../../services/api'
import '../../styles/AdminBookings.css'

export default function AdminBookings() {
  const [bookings, setBookings] = useState([])
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchBookings()
  }, [filter])

  const fetchBookings = async () => {
    try {
      setLoading(true)
      setError(null)
      const params = filter!== 'all'? `?status=${filter}` : ''
      const res = await api.get(`/api/admin/bookings${params}`)
      setBookings(res.data)
    } catch (err) {
      setError('Failed to load bookings')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async (id, status) => {
    try {
      await api.patch(`/api/admin/bookings/${id}`, { status })
      fetchBookings()
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update booking')
    }
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  return (
    <div className="admin-container">
      <div className="admin-wrapper">
        <div className="page-header">
          <h1 className="admin-title">Bookings Management</h1>
          <div className="filter-tabs">
            {['all', 'pending', 'confirmed', 'completed', 'cancelled'].map(s => (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={`filter-tab ${filter === s? 'active' : ''}`}
              >
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="table-card">
          {loading? (
            <div className="table-loader">Loading bookings...</div>
          ) : error? (
            <div className="table-error">
              <p>{error}</p>
              <button onClick={fetchBookings}>Retry</button>
            </div>
          ) : bookings.length === 0? (
            <div className="table-empty">
              <p>No bookings found</p>
            </div>
          ) : (
            <div className="table-scroll">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Booking ID</th>
                    <th>Property</th>
                    <th>Guest</th>
                    <th>Dates</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map(booking => (
                    <tr key={booking.id}>
                      <td className="cell-text">#{booking.id}</td>
                      <td>
                        <div className="cell-stack">
                          <p className="cell-primary">{booking.property_title}</p>
                          <p className="cell-secondary">{booking.property_city}</p>
                        </div>
                      </td>
                      <td>
                        <div className="cell-stack">
                          <p className="cell-primary">{booking.guest_name}</p>
                          <p className="cell-secondary">{booking.guest_email}</p>
                        </div>
                      </td>
                      <td className="cell-text">
                        {formatDate(booking.check_in)} - {formatDate(booking.check_out)}
                      </td>
                      <td className="cell-primary cell-bold">₦{booking.total_price?.toLocaleString()}</td>
                      <td>
                        <span className={`status-badge ${booking.status}`}>
                          {booking.status}
                        </span>
                      </td>
                      <td>
                        <div className="action-buttons">
                          {booking.status === 'pending' && (
                            <>
                              <button
                                className="action-link approve"
                                onClick={() => handleStatusUpdate(booking.id, 'confirmed')}
                              >
                                Confirm
                              </button>
                              <button
                                className="action-link reject"
                                onClick={() => handleStatusUpdate(booking.id, 'cancelled')}
                              >
                                Cancel
                              </button>
                            </>
                          )}
                          {booking.status === 'confirmed' && (
                            <button
                              className="action-link complete"
                              onClick={() => handleStatusUpdate(booking.id, 'completed')}
                            >
                              Complete
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}