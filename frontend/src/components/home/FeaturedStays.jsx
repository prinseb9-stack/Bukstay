export default function FeaturedStays({ properties, loading }) {
  if (loading) {
    return (
      <section className="featured-stays">
        <h2>Featured Stays</h2>
        <p>Loading...</p>
      </section>
    )
  }

  if (!properties || properties.length === 0) {
    return (
      <section className="featured-stays">
        <h2>Featured Stays</h2>
        <p>No featured stays available right now.</p>
      </section>
    )
  }

  return (
    <section className="featured-stays">
      <h2>Featured Stays</h2>
      <div className="featured-grid">
        {properties.slice(0, 4).map(property => (
          <div key={property.id} className="featured-card">
            <img 
              src={property.images?.[0] || 'https://via.placeholder.com/400x300'} 
              alt={property.title} 
            />
            <h3>{property.title}</h3>
            <p>{property.city}, {property.country}</p>
          </div>
        ))}
      </div>
    </section>
  )
}