import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import '../styles/Onboarding.css'

export default function Onboarding() {
  const navigate = useNavigate()
  const { user, updateUser } = useAuth()
  const [step, setStep] = useState(1)
  const [data, setData] = useState({
    bio: '',
    country: 'Nigeria',
    travel_style: 'adventure'
  })

  const handleComplete = () => {
  // updateUser(data) // ← comment this
  if (user?.role === 'host' || user?.role === 'both') {
    navigate('/host/dashboard')
  } else {
    navigate('/traveler/dashboard')
  }
}

  return (
    <div className="onboarding-container">
      <div className="onboarding-card">
        <div className="onboarding-header">
          <div className="progress-bar">
            {[1,2,3].map(i => (
              <div key={i} className={`progress-step ${i <= step ? 'active' : ''}`} />
            ))}
          </div>
          <h1 className="onboarding-title">
            {step === 1 && "Welcome to BukStay!"}
            {step === 2 && "Tell us about yourself"}
            {step === 3 && "You're all set!"}
          </h1>
          <p className="onboarding-subtitle">
            {step === 1 && "Let's set up your profile"}
            {step === 2 && "Help us personalize your experience"}
            {step === 3 && "Ready to explore amazing stays"}
          </p>
        </div>

        {step === 1 && (
          <div className="onboarding-step">
            <div className="form-group">
              <label>Bio</label>
              <textarea 
                value={data.bio}
                onChange={e => setData({...data, bio: e.target.value})}
                placeholder="I love traveling and..."
              />
            </div>
            <button 
              onClick={() => setStep(2)}
              className="onboarding-btn"
            >
              Continue
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="onboarding-step">
            <div className="form-group">
              <label>Country</label>
              <select 
                value={data.country}
                onChange={e => setData({...data, country: e.target.value})}
              >
                <option>Nigeria</option>
                <option>Ghana</option>
                <option>Kenya</option>
                <option>South Africa</option>
                <option>Egypt</option>
              </select>
            </div>
            <div className="form-group">
              <label>Travel Style</label>
              <div className="travel-style-grid">
                {[
                  { value: 'adventure', label: 'Adventure' },
                  { value: 'business', label: 'Business' },
                  { value: 'family', label: 'Family' },
                  { value: 'luxury', label: 'Luxury' },
                ].map(style => (
                  <button
                    key={style.value}
                    type="button"
                    onClick={() => setData({...data, travel_style: style.value})}
                    className={`style-option ${data.travel_style === style.value ? 'selected' : ''}`}
                  >
                    <p>{style.label}</p>
                  </button>
                ))}
              </div>
            </div>
            <button 
              onClick={() => setStep(3)}
              className="onboarding-btn"
            >
              Continue
            </button>
          </div>
        )}

        {step === 3 && (
          <div className="onboarding-complete">
            <div className="complete-icon">🎉</div>
            <p className="complete-text">
              Your profile is ready! Time to discover amazing stays across Africa.
            </p>
            <button 
              onClick={handleComplete}
              className="onboarding-btn"
            >
              Go to Dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  )
}