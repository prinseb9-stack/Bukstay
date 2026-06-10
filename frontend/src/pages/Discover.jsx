import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import '../styles/Discover.css'

export default function Discover() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchDiscover = async () => {
      try {
        setLoading(true)
        const res = await api.get('/api/discover')
        setItems(res.data)
      } catch (err) {
        setError('Failed to load experiences')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchDiscover()
  }, [])

  const handleItemClick = (id) => {
    navigate(`/stays/${id}`)
  }

  if (loading) {
    return (
      <div className="discover-container">
        <div className="discover-loader">
          <div className="spinner"></div>
          <p>Finding amazing stays...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="discover-container">
        <div className="discover-error">
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>Retry</button>
        </div>
      </div>
    )
  }

  if (!items.length) {
    return (
      <div className="discover-container">
        <div className="discover-empty">
          <h2>No experiences yet</h2>
          <p>Check back soon for amazing stays across Africa</p>
        </div>
      </div>
    )
  }

  return (
    <div className="discover-container">
      <div className="discover-feed">
        {items.map((item) => (
          <div 
            key={item.id} 
            className="discover-card"
            onClick={() => handleItemClick(item.id)}
          >
            <div className="discover-image">
              <img 
                src={item.images?.[0] || 'https://placehold.co/400x600'} 
                alt={item.title}
                loading="lazy"
              />
              <div className="discover-overlay">
                <div className="discover-location">
                  📍 {item.city}, {item.country}
                </div>
              </div>
            </div>
            
            <div className="discover-content">
              <h3 className="discover-title">{item.title}</h3>
              <p className="discover-host">Hosted by {item.host_name}</p>
              <div className="discover-footer">
                <span className="discover-price">
                  ${item.price}<span>/night</span>
                </span>
                {item.rating && (
                  <span className="discover-rating">
                    ⭐ {item.rating}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}