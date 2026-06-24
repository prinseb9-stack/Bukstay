import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useGeoCurrency } from '../hooks/useGeo'
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../lib/firebase'
import '../styles/Onboarding.css'

export default function Onboarding() {
  const navigate = useNavigate()
  const { user, userProfile } = useAuth()

  const {
    country,
    city,
    currency,
    latitude,
    longitude,
    loading: geoLoading
  } = useGeoCurrency()

  const [loading, setLoading] = useState(false)

  const [data, setData] = useState({
    bio: '',
    travelStyle: 'adventure'
  })

  const handleComplete = async () => {
    if (!user) return

    setLoading(true)

    try {
      await updateDoc(doc(db, 'users', user.uid), {
        bio: data.bio,
        travelStyle: data.travelStyle,
        country: country || '',
        city: city || '',
        currencyCode: currency?.code || '',
        currencySymbol: currency?.symbol || '',
        currencyLocale: currency?.locale || '',
        latitude: latitude || null,
        longitude: longitude || null,
        onboarded: true,
        updatedAt: serverTimestamp()
      })

      if (userProfile?.role === 'host') {
        navigate('/host/dashboard')
      } else if (userProfile?.role === 'admin') {
        navigate('/admin-panel-2025/dashboard')
      } else {
        navigate('/User/dashboard')
      }
    } catch (error) {
      console.error(error)
      alert('Failed to complete onboarding')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="onboarding-container">
      <div className="onboarding-card">
        <h1>Welcome to BukStay 🎉</h1>
        <p>Let's personalize your experience</p>

        <div className="form-group">
          <label>Tell us about yourself</label>
          <textarea
            value={data.bio}
            onChange={(e) => setData({ ...data, bio: e.target.value })}
            placeholder="I love travelling, discovering new places..."
            maxLength={200}
          />
          <small>{data.bio.length}/200</small>
        </div>

        <div className="form-group">
          <label>Your travel style</label>
          <select
            value={data.travelStyle}
            onChange={(e) => setData({ ...data, travelStyle: e.target.value })}
          >
            <option value="adventure">Adventure</option>
            <option value="business">Business</option>
            <option value="family">Family</option>
            <option value="luxury">Luxury</option>
          </select>
        </div>

        <div className="location-preview">
          <h3>Your Location</h3>
          {geoLoading ? (
            <p>Detecting location...</p>
          ) : (
            <>
              <p>Country: {country}</p>
              <p>City: {city}</p>
              <p>Currency: {currency?.symbol} {currency?.code}</p>
            </>
          )}
        </div>

        <button
          onClick={handleComplete}
          disabled={loading || geoLoading}
          className="onboarding-btn"
        >
          {loading ? 'Saving...' : 'Complete Setup'}
        </button>
      </div>
    </div>
  )
}