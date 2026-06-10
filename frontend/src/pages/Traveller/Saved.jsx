import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Heart, Star } from 'lucide-react'
import api from '../../services/api'
import '../../styles/TravellerSaved.css'

export default function Saved() {
  const navigate = useNavigate()
  const [savedPlaces, setSavedPlaces] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSavedPlaces()
  }, [])

  const fetchSavedPlaces = async () => {
    try {
      setLoading(true)
      const res = await api.get('/api/traveller/saved')
      setSavedPlaces(res.data)
    } catch (err) {
      console.error('Failed to load saved places:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleUnsave = async (e, propertyId) => {
    e.stopPropagation()
    try {
      await api.delete(`/api/traveller/saved/${propertyId}`)
      setSavedPlaces(savedPlaces.filter(p => p.id!== propertyId))
    } catch (err) {
      alert('Failed to remove from saved')
    }
  }

  if (loading) {
    return (
      <div className="traveller-saved-container">
        <div className="saved-loader">
          <div className="spinner"></div>
          <p>Loading saved places...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="traveller-saved-container">
      <div className="saved-wrapper">
        <div className="saved-header">
          <h1 className="saved-title">Saved Places</h1>
          <p className="saved-count">{savedPlaces.length} {savedPlaces.length === 1? 'place' : 'places'}</p>
        </div>

        {savedPlaces.length === 0? (
          <div className="saved-empty">
            <div className="empty-icon">
              <Heart size={64} />
            </div>
            <h2>No saved places yet</h2>
            <p>Tap the heart icon on any property to save it for later</p>
            <button
              className="explore-btn"
              onClick={() => navigate('/discover')}
            >
              Explore Stays
            </button>
          </div>
        ) : (
          <div className="saved-grid">
            {savedPlaces.map((place) => (
              <div
                key={place.id}
                className="saved-card"
                onClick={() => navigate(`/stays/${place.id}`)}
              >
                <div className="saved-image-wrapper">
                  <img
                    src={place.images?.[0] || 'https://placehold.co/400x300'}
                    alt={place.title}
                    className="saved-image"
                  />
                  <button
                    className="unsave-btn"
                    onClick={(e) => handleUnsave(e, place.id)}
                    aria-label="Remove from saved"
                  >
                    <Heart size={20} fill="#ff385c" color="#ff385c" />
                  </button>
                </div>

                <div className="saved-content">
                  <div className="saved-info">
                    <h3 className="saved-name">{place.title}</h3>
                    <p className="saved-city">{place.city}, {place.country}</p>
                  </div>

                  <div className="saved-meta">
                    <p className="saved-price">
                      <span className="price-amount">₦{place.price?.toLocaleString()}</span>
                      <span className="price-night">/night</span>
                    </p>
                    <div className="saved-rating">
                      <Star size={14} fill="#f5a623" color="#f5a623" />
                      <span>{place.rating?.toFixed(1) || 'New'}</span>
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