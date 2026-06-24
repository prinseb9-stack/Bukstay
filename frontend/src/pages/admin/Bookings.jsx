import { useState, useEffect } from 'react'
import { collection, getDocs, query, where, updateDoc, doc, serverTimestamp } from 'firebase/firestore'
import { db } from '../../lib/firebase'
import { useGeoCurrency } from '../../hooks/useGeo'
import '../../styles/AdminBookings.css'

export default function AdminBookings() {
  const [bookings, setBookings] = useState([])
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { formatPrice } = useGeoCurrency()

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true)
        setError(null)
        
        let q = query(collection(db, 'bookings'))
        
        if (filter !== 'all') {
          q = query(collection(db, 'bookings'), where('status', '==', filter))
        }

        const snap = await getDocs(q)
        let bookingsData = snap.docs.map(d => ({ id: d.id, ...d.data() }))
        
        bookingsData.sort((a, b) => {
          const aTime = a.createdAt?.seconds || new Date(a.createdAt).getTime() || 0
          const bTime = b.createdAt?.seconds || new Date(b.createdAt).getTime() || 0
          return bTime - aTime
        })
        
        setBookings(bookingsData)
      } catch (err) {
        setError('Failed to load bookings')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchBookings()
  }, [filter])

  const handleStatusUpdate = async (id, status) => {
    try {
      await updateDoc(doc(db, 'bookings', id), { 
        status,
        updatedAt: serverTimestamp()
      })
      // Refresh
      const snap = await getDocs(query(collection(db, 'bookings')))
      let bookingsData = snap.docs.map(d => ({ id: d.id, ...d.data() }))
      bookingsData.sort((a, b) => {
        const aTime = a.createdAt?.seconds || new Date(a.createdAt).getTime() || 0
        const bTime = b.createdAt?.seconds || new Date(b.createdAt).getTime() || 0
        return bTime - aTime
      })
      setBookings(bookingsData)
    } catch (err) {
      alert('Failed to update booking')
      console.error(err)
    }
  }

  const formatDate = (date) => {
    if (!date) return ''
    const d = date.toDate ? date.toDate() : new Date(date)
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
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
                className={`filter-tab ${filter === s ? 'active' : ''}`}
              >
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="table-card">
          {loading ? (
            <div className="table-loader">Loading bookings...</div>
          ) : error ? (
            <div className="table-error">
              <p>{error}</p>
              <button onClick={() => setFilter(filter)}>Retry</button>
            </div>
          ) : bookings.length === 0 ? (
            <div className="table-empty"><p>No bookings found</p></div>
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
                      <td className="cell-text">#{booking.id.slice(0, 6)}</td>
                      <td>
                        <div className="cell-stack">
                          <p className="cell-primary">{booking.propertyName || booking.property_title}</p>
                          <p className="cell-secondary">{booking.propertyCity || booking.property_city}</p>
                        </div>
                      </td>
                      <td>
                        <div className="cell-stack">
                          <p className="cell-primary">{booking.travellerName || booking.guestName || booking.guest_name}</p>
                          <p className="cell-secondary">{booking.travellerEmail || booking.guestEmail || booking.guest_email || booking.guestPhone}</p>
                        </div>
                      </td>
                      <td className="cell-text">
                        {formatDate(booking.checkIn || booking.check_in)} - {formatDate(booking.checkOut || booking.check_out)}
                      </td>
                      <td className="cell-primary cell-bold">
                        {formatPrice(booking.totalPrice || booking.total_price || 0)}
                      </td>
                      <td>
                        <span className={`status-badge ${booking.status}`}>{booking.status}</span>
                      </td>
                      <td>
                        <div className="action-buttons">
                          {booking.status === 'pending' && (
                            <>
                              <button className="action-link approve" onClick={() => handleStatusUpdate(booking.id, 'confirmed')}>
                                Confirm
                              </button>
                              <button className="action-link reject" onClick={() => handleStatusUpdate(booking.id, 'cancelled')}>
                                Cancel
                              </button>
                            </>
                          )}
                          {booking.status === 'confirmed' && (
                            <button className="action-link complete" onClick={() => handleStatusUpdate(booking.id, 'completed')}>
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