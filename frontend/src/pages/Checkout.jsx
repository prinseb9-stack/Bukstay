import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../services/api'
import '../styles/Checkout.css'

export default function Checkout() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [property, setProperty] = useState(null)
  const [dates, setDates] = useState({ check_in: '', check_out: '', guests: 1 })
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    api.get(`/api/properties/${id}`)
     .then(res => setProperty(res.data))
     .catch(() => navigate('/stays'))
     .finally(() => setLoading(false))
  }, [id, navigate])

  const handleBooking = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const res = await api.post('/api/bookings', {
        property_id: id,
       ...dates
      })
      navigate(`/traveller?booking=${res.data.id}`)
    } catch (err) {
      alert(err.response?.data?.error || 'Booking failed')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading ||!property) return <div className="checkout-loader">Loading...</div>

  const nights = dates.check_in && dates.check_out
   ? Math.ceil((new Date(dates.check_out) - new Date(dates.check_in)) / 86400000)
    : 0
  const total = nights * property.price

  return (
    <div className="checkout-container">
      <div className="checkout-grid">
        <div className="checkout-form">
          <h1>Confirm booking</h1>
          <form onSubmit={handleBooking}>
            <div className="form-group">
              <label>Check-in</label>
              <input
                type="date"
                required
                value={dates.check_in}
                onChange={(e) => setDates({...dates, check_in: e.target.value})}
              />
            </div>
            <div className="form-group">
              <label>Check-out</label>
              <input
                type="date"
                required
                value={dates.check_out}
                onChange={(e) => setDates({...dates, check_out: e.target.value})}
              />
            </div>
            <div className="form-group">
              <label>Guests</label>
              <input
                type="number"
                min="1"
                max={property.guests}
                required
                value={dates.guests}
                onChange={(e) => setDates({...dates, guests: e.target.value})}
              />
            </div>
            <button type="submit" className="checkout-btn" disabled={submitting}>
              {submitting? 'Booking...' : `Confirm $${total}`}
            </button>
          </form>
        </div>

        <div className="checkout-summary">
          <img src={property.images?.[0]} alt={property.title} />
          <h3>{property.title}</h3>
          <p>{property.city}, {property.country}</p>
          <div className="price-breakdown">
            <div className="price-row">
              <span>${property.price} × {nights} nights</span>
              <span>${total}</span>
            </div>
            <div className="price-row total">
              <span>Total</span>
              <span>${total}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}