import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { auth } from '../lib/firebase'
import { useAuth } from '../context/AuthContext'
import { doc, setDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../lib/firebase'
import '../styles/HostOnboard.css'

export default function HostOnboard() {
  const navigate = useNavigate()
  const { register } = useAuth()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
    phone: '',
    country: '',
    city: ''
  })

  const handleInputChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    
    if (!form.fullName || !form.email || !form.password || !form.country) {
      setError('Please fill all required fields')
      return
    }

    if (form.password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setLoading(true)
    try {
      // Use AuthContext register — no phone OTP needed
      const result = await register(form.fullName, form.email, form.password, 'host')
      
      if (!result.success) {
        setError(result.error)
        setLoading(false)
        return
      }

      // Add host-specific fields
      await setDoc(doc(db, 'users', result.user.uid || auth.currentUser?.uid), {
        phone: form.phone,
        country: form.country,
        city: form.city || '',
        onboardingComplete: true,
        updatedAt: serverTimestamp()
      }, { merge: true })

      setStep(3)
      setTimeout(() => navigate('/host/dashboard'), 2000)
    } catch (err) {
      console.error(err)
      setError('Failed to create account. Email may already be in use.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="host-onboard-wrap">
      <div className="host-onboard-card">
        <div className="host-onboard-header">
          <h1>🏠 Become a BukStay Host</h1>
          <p>List your property and earn worldwide</p>
        </div>

        {error && <div className="host-error">{error}</div>}

        {step === 1 && (
          <form onSubmit={handleSubmit} className="host-form">
            <div className="form-group">
              <label>Full Name *</label>
              <input
                type="text"
                name="fullName"
                value={form.fullName}
                onChange={handleInputChange}
                placeholder="John Doe"
                required
              />
            </div>

            <div className="form-group">
              <label>Email *</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleInputChange}
                placeholder="john@example.com"
                required
              />
            </div>

            <div className="form-group">
              <label>Password *</label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleInputChange}
                placeholder="Min 6 characters"
                required
              />
            </div>

            <div className="form-group">
              <label>Phone Number</label>
              <input
                type="tel"
                name="phone"
                value={form.phone}
                onChange={handleInputChange}
                placeholder="+2348012345678"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Country *</label>
                <input
                  type="text"
                  name="country"
                  value={form.country}
                  onChange={handleInputChange}
                  placeholder="Nigeria"
                  required
                />
              </div>

              <div className="form-group">
                <label>City</label>
                <input
                  type="text"
                  name="city"
                  value={form.city}
                  onChange={handleInputChange}
                  placeholder="Lagos"
                />
              </div>
            </div>

            <button type="submit" className="host-btn-primary" disabled={loading}>
              {loading ? 'Creating Account...' : 'Become a Host'}
            </button>
          </form>
        )}

        {step === 3 && (
          <div className="host-success">
            <div className="host-success-icon">✅</div>
            <h2>Welcome, Host!</h2>
            <p>Your account is ready. Redirecting to dashboard...</p>
          </div>
        )}
      </div>
    </div>
  )
}