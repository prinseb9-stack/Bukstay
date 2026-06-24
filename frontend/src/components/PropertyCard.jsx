import { Heart } from 'lucide-react'
import { useGeoCurrency } from '../hooks/useGeo'
import '../styles/PropertyCard.css'

export default function PropertyCard({ property, onClick, onSave, isSaved = false, showStatus = false }) {
  const { formatPrice } = useGeoCurrency()

  const handleSave = (e) => {
    e.stopPropagation()
    onSave?.(property.id)
  }

  return (
    <div className="property-card" onClick={onClick}>
      <div className="property-image">
        <img 
          src={property.images?.[0] || property.imageUrl || 'https://placehold.co/400x300?text=No+Image'} 
          alt={property.title || property.name}
          loading="lazy"
        />
        
        {onSave && (
          <button 
            className={`save-btn ${isSaved? 'saved' : ''}`}
            onClick={handleSave}
            aria-label={isSaved? 'Unsave' : 'Save'}
          >
            <Heart size={20} fill={isSaved? 'currentColor' : 'none'} />
          </button>
        )}

        {property.rating && property.reviewCount > 0 && (
          <div className="property-badge rating">
            ⭐ {property.rating.toFixed(1)}
          </div>
        )}

        {showStatus && property.status && property.status!== 'active' && (
          <div className={`property-badge status ${property.status}`}>
            {property.status === 'pending'? 'Pending' : 'Rejected'}
          </div>
        )}
      </div>
      
      <div className="property-details">
        <div className="property-location">
          {property.city || property.location}{property.country && `, ${property.country}`}
        </div>
        <h3 className="property-title">{property.title || property.name}</h3>
        <div className="property-meta">
          {property.bedrooms && <span>{property.bedrooms} bed{property.bedrooms!== 1? 's' : ''}</span>}
          {property.bedrooms && property.maxGuests && <span>•</span>}
          {property.maxGuests && <span>{property.maxGuests} guests</span>}
        </div>
        <div className="property-price">
          <span className="price-amount">{formatPrice(property.price)}</span>
          <span className="price-night"> / night</span>
        </div>
      </div>
    </div>
  )
}