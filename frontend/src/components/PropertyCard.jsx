import '../styles/PropertyCard.css'

export default function PropertyCard({ property, onClick }) {
  return (
    <div className="property-card" onClick={onClick}>
      <div className="property-image">
        <img 
          src={property.images?.[0] || 'https://placehold.co/400x300'} 
          alt={property.title}
          loading="lazy"
        />
        {property.rating && (
          <div className="property-badge">
            ⭐ {property.rating}
          </div>
        )}
      </div>
      
      <div className="property-details">
        <div className="property-location">
          {property.city}, {property.country}
        </div>
        <h3 className="property-title">{property.title}</h3>
        <div className="property-meta">
          <span>{property.bedrooms} beds</span>
          <span>•</span>
          <span>{property.guests} guests</span>
        </div>
        <div className="property-price">
          <span className="price-amount">${property.price}</span>
          <span className="price-night"> / night</span>
        </div>
      </div>
    </div>
  )
}