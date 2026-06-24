import { useNavigate } from 'react-router-dom'

export default function CTA() {
  const navigate = useNavigate()

  return (
    <section className="cta">
      <h2>Ready to start your journey?</h2>
      <p>Join thousands of travelers discovering unique stays worldwide.</p>
      <button onClick={() => navigate('/register')}>Get Started</button>
    </section>
  )
}