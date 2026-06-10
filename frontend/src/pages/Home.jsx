import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import '../styles/Home.css'

const features = [
  { icon: '🏠', title: 'Verified Properties', desc: 'Every listing is verified by our team for safety and quality' },
  { icon: '💳', title: 'Secure Payments', desc: 'Pay safely with Paystack, Flutterwave, or card' },
  { icon: '⭐', title: 'Trusted Reviews', desc: 'Real reviews from real travelers. No fake ratings' },
  { icon: '🌍', title: '50+ Cities', desc: 'From Lagos to Accra to Nairobi. Explore all of Africa' },
]

const popularCities = [
  { name: 'Lagos', country: 'Nigeria', image: 'https://images.unsplash.com/photo-1618828665340-27a86965ad3e?w=400', properties: '2.1k' },
  { name: 'Accra', country: 'Ghana', image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=400', properties: '890' },
  { name: 'Nairobi', country: 'Kenya', image: 'https://images.unsplash.com/photo-1611348586804-61bf6c080437?w=400', properties: '1.3k' },
  { name: 'Cape Town', country: 'South Africa', image: 'https://images.unsplash.com/photo-1580060839134-75a5edca2e99?w=400', properties: '1.8k' },
]

export default function Home() {
  const navigate = useNavigate()
  const [search, setSearch] = useState({ location: '', checkIn: '', checkOut: '' })

  const handleSearch = (e) => {
    e.preventDefault()
    const params = new URLSearchParams(search)
    navigate(`/stays?${params}`)
  }

  return (
    <div className="home-wrap">

      {/* Hero */}
      <div className="home-hero">
        <img
          src="https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1600"
          className="home-hero-img"
          alt="hero"
        />
        <div className="home-hero-overlay" />
        <div className="home-hero-content">
          <h1 className="home-hero-title">Find your perfect stay in Africa</h1>
          <p className="home-hero-sub">Discover unique homes, hotels, and experiences across 50+ cities</p>
          <form onSubmit={handleSearch} className="home-search">
            <input
              type="text"
              placeholder="Where to?"
              value={search.location}
              onChange={e => setSearch({...search, location: e.target.value})}
              className="home-search-input"
            />
            <input
              type="date"
              value={search.checkIn}
              onChange={e => setSearch({...search, checkIn: e.target.value})}
              className="home-search-input"
            />
            <input
              type="date"
              value={search.checkOut}
              onChange={e => setSearch({...search, checkOut: e.target.value})}
              className="home-search-input"
            />
            <button type="submit" className="home-search-btn">Search</button>
          </form>
        </div>
      </div>

      {/* Features */}
      <div className="home-features">
        <h2 className="home-section-title">Why BukStay?</h2>
        <div className="home-features-grid">
          {features.map((f, i) => (
            <div key={i} className="home-feature-card">
              <div className="home-feature-icon">{f.icon}</div>
              <h3 className="home-feature-title">{f.title}</h3>
              <p className="home-feature-desc">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Cities */}
      <div className="home-cities">
        <div className="home-cities-inner">
          <h2 className="home-section-title">Popular Destinations</h2>
          <div className="home-cities-grid">
            {popularCities.map(city => (
              <div
                key={city.name}
                className="home-city-card"
                onClick={() => navigate(`/stays?location=${city.name}`)}
              >
                <img src={city.image} alt={city.name} className="home-city-img" />
                <div className="home-city-overlay" />
                <div className="home-city-info">
                  <p className="home-city-name">{city.name}</p>
                  <p className="home-city-sub">{city.country} · {city.properties} properties</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="home-cta">
        <h2 className="home-cta-title">Ready to become a host?</h2>
        <p className="home-cta-sub">Earn money by sharing your space. Join thousands of hosts across Africa.</p>
        <button className="home-cta-btn" onClick={() => navigate('/register')}>
          Start Hosting
        </button>
      </div>

    </div>
  )
}
