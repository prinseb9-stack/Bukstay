import './Features.css'

const features = [
  {
    icon: '📱',
    title: 'Book Instantly',
    description: 'Reserve your stay in minutes with a simple and smooth experience.'
  },
  {
    icon: '💳',
    title: 'Secure Payments',
    description: 'Pay safely using trusted global payment methods.'
  },
  {
    icon: '⭐',
    title: 'Verified Stays',
    description: 'Find quality homes and hotels reviewed by real travellers.'
  },
  {
    icon: '🌍',
    title: 'Worldwide Travel',
    description: 'Explore destinations across Africa and the entire world.'
  }
]

export default function Features() {
  return (
    <section className="features">
      <div className="features-container">

        <h2 className="features-title">
          Why choose BukStay?
        </h2>

        <p className="features-subtitle">
          Everything you need to travel comfortably, safely and confidently.
        </p>

        <div className="features-grid">
          {features.map((feature, index) => (
            <div key={index} className="feature-card">

              <div className="feature-icon">
                {feature.icon}
              </div>

              <h3 className="feature-heading">
                {feature.title}
              </h3>

              <p className="feature-description">
                {feature.description}
              </p>

            </div>
          ))}
        </div>

      </div>
    </section>
  )
}