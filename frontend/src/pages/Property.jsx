import { useParams, useNavigate } from 'react-router-dom'
import '../styles/Property.css'

export default function Property() {
const { id } = useParams()
const navigate = useNavigate()

const property = {
id,
title: "Luxury Apartment",
city: "Abuja",
country: "Nigeria",
price: 45000,
rating: 4.9,
image: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2"
}

return (
<div className="property-page">
<button onClick={() => navigate(-1)}>
← Back
</button>

  <img 
    src={property.image}
    alt={property.title}
    className="property-image"
  />

  <h1>{property.title}</h1>

  <p>
    📍 {property.city}, {property.country}
  </p>

  <p>
    ⭐ {property.rating}
  </p>

  <h2>
    ₦{property.price}/night
  </h2>

  <button onClick={() => navigate(`/checkout/${id}`)}>
    Book Now
  </button>
</div>

)
}