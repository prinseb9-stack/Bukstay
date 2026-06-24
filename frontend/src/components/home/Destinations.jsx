import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { collection, getDocs, query, where, limit } from 'firebase/firestore'
import { db } from '../../lib/firebase'
import './Destinations.css'

export default function Destinations() {
  const navigate = useNavigate()

  const [destinations, setDestinations] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadDestinations = async () => {
      try {
        const q = query(
          collection(db, 'properties'),
          where('isActive', '==', true),
          limit(50)
        )

        const snapshot = await getDocs(q)

        const properties = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))

        const cities = {}

        properties.forEach(property => {
          const key = `${property.city}-${property.country}`

          if (!cities[key]) {
            cities[key] = {
              city: property.city,
              country: property.country,
              image:
                property.images?.[0] ||
                'https://images.unsplash.com/photo-1507525428034-b723cf961d3e',
              stays: 0
            }
          }

          cities[key].stays += 1
        })

        const result = Object.values(cities)
          .sort((a, b) => b.stays - a.stays)
          .slice(0, 8)

        setDestinations(result)

      } catch (error) {
        console.error('Failed to load destinations:', error)
      } finally {
        setLoading(false)
      }
    }

    loadDestinations()
  }, [])

  if (loading) {
    return (
      <section className="destinations">
        <h2>Popular Destinations</h2>
        <p>Loading destinations...</p>
      </section>
    )
  }

  return (
    <section className="destinations">
      <h2>Explore the world's favorite places</h2>
      <div className="destination-grid">
        {destinations.map(place => (
          <div
            key={`${place.city}-${place.country}`}
            className="destination-card"
            onClick={() => navigate(`/stays?city=${place.city}`)}
          >
            <img src={place.image} alt={place.city} />
            <div className="destination-info">
              <h3>{place.city}</h3>
              <p>{place.country} • {place.stays} stays</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}