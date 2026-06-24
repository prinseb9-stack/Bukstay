import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { useAuth } from '../context/AuthContext'
import { useGeoCurrency } from '../hooks/useGeo'
import '../styles/Property.css'

export default function Property() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { formatPrice } = useGeoCurrency()

  const [property, setProperty] = useState(null)
  const [host, setHost] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const propertyRef = doc(db, 'properties', id)
        const propertySnap = await getDoc(propertyRef)

        if (!propertySnap.exists()) {
          setError('Property not found')
          return
        }

        const propertyData = {
          id: propertySnap.id,
          ...propertySnap.data()
        }

        setProperty(propertyData)

        if (propertyData.hostId) {
          const hostRef = doc(db, 'users', propertyData.hostId)
          const hostSnap = await getDoc(hostRef)

          if (hostSnap.exists()) {
            const hostData = hostSnap.data()
            // Only expose safe fields
            setHost({
              id: hostSnap.id,
              fullName: hostData.fullName || 'BukStay Host',
              avatar: hostData.avatar || '',
              bio: hostData.bio || '',
              rating: hostData.rating || 4.5
            })
          }
        }
      } catch (error) {
        console.error(error)
        setError('Failed to load property')
      } finally {
        setLoading(false)
      }
    }

    fetchProperty()
  }, [id])

  const handleBookNow = () => {
    if (!user) {
      navigate('/login', { state: { from: `/stays/${id}` } })
      return
    }
    navigate(`/checkout/${id}`)
  }

  if (loading) {
    return (
      <div className="property-page">
        <div className="property-loader">Loading property...</div>
      </div>
    )
  }

  if (error || !property) {
    return (
      <div className="property-page">
        <button onClick={() => navigate('/stays')} className="back-btn">← Back</button>
        <div className="error-state">
          <h2>{error || 'Property not found'}</h2>
          <button onClick={() => navigate('/stays')} className="cta-btn">Browse Stays</button>
        </div>
      </div>
    )
  }

  return (
    <div className="property-page">
      <button onClick={() => navigate(-1)} className="back-btn">← Back</button>

      <div className="property-hero">
        <img
          src={property.images?.[0] || 'https://via.placeholder.com/800x400'}
          alt={property.title}
          className="property-main-image"
        />
      </div>

      <div className="property-details">
        <div className="property-header">
          <div>
            <h1>{property.title}</h1>
            <p className="property-location">📍 {property.city}, {property.country}</p>
          </div>
          <div className="property-price">
            <span className="price-amount">{formatPrice(property.pricePerNight)}</span>
            <span className="price-night">/night</span>
          </div>
        </div>

        <div className="property-meta">
          <span>👥 {property.maxGuests || 0} guests</span>
          <span>🛏️ {property.bedrooms || 0} bedrooms</span>
          <span>🛁 {property.bathrooms || 0} bathrooms</span>
          <span>⭐ {property.rating || 4.5}</span>
        </div>

        {host && (
          <div className="property-host">
            <h2>Hosted by {host.fullName}</h2>
            <div className="host-info">
              {host.avatar && <img src={host.avatar} alt={host.fullName} className="host-avatar" />}
              <p>{host.bio || 'Welcome to my property!'}</p>
            </div>
          </div>
        )}

        <div className="property-description">
          <h2>About this place</h2>
          <p>{property.description || 'No description provided.'}</p>
        </div>

        {property.amenities?.length > 0 && (
          <div className="property-amenities">
            <h2>Amenities</h2>
            <div className="amenities-grid">
              {property.amenities.map((amenity, index) => (
                <span key={index} className="amenity-tag">{amenity}</span>
              ))}
            </div>
          </div>
        )}

        <button onClick={handleBookNow} className="book-now-btn">
          Book Now - {formatPrice(property.pricePerNight)}/night
        </button>
      </div>
    </div>
  )
}