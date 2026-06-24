import './Hero.css'
import SearchBar from './SearchBar'

export default function Hero() {
  return (
    <section className="hero">
      <div className="hero-overlay"></div>

      <div className="hero-content">
        <h1>
          Stay anywhere.<br />
          Explore everywhere.
        </h1>

        <p>
          Discover unique homes, hotels, and experiences
          across the world with BukStay.
        </p>

        <SearchBar />
      </div>
    </section>
  )
}