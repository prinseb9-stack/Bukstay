import { useGeoCurrency } from '../hooks/useGeo'
import { Clock, Star } from 'lucide-react'

export default function FoodCard({ item, onClick }) {
  const { formatPrice } = useGeoCurrency()

  return (
    <div className="food-card" onClick={onClick}>
      <div className="food-image-wrapper">
        <img 
          src={item.images?.[0] || 'https://via.placeholder.com/400x300?text=Food'} 
          alt={item.name}
          loading="lazy"
        />
        {item.preparationTime && (
          <span className="food-time-badge">
            <Clock size={12} /> {item.preparationTime} min
          </span>
        )}
        {item.rating && (
          <div className="food-rating-badge">
            <Star size={12} fill="#f5a623" color="#f5a623" /> {item.rating.toFixed(1)}
          </div>
        )}
      </div>
      
      <div className="food-details">
        <h3 className="food-name">{item.name}</h3>
        <p className="food-category">{item.category || 'Food'}</p>
        <p className="food-description">{item.description?.slice(0, 60)}{item.description?.length > 60 ? '...' : ''}</p>
        <div className="food-footer">
          <span className="food-price">{formatPrice(item.price)}</span>
          {item.spiceLevel && (
            <span className="food-spice">
              {'🌶️'.repeat(item.spiceLevel)}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}