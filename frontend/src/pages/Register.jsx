import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import '../styles/Register.css'

export default function Register() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'user'
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const { register, loginWithGoogle, loginWithApple } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    if (form.password.length < 6) {
      setError('Password must be at least 6 characters')
      setLoading(false)
      return
    }

    const result = await register(form.name, form.email, form.password, form.role)

    if (result.success) {
      if (form.role === 'host') {
        navigate('/host/dashboard')
      } else {
        navigate('/onboarding')
      }
    } else {
      setError(result.error)
    }
    setLoading(false)
  }

  const handleSocialSignup = async (method) => {
    setError('')
    setLoading(true)
    const result = await method()
    if (result.success) {
      navigate('/onboarding')
    } else {
      setError(result.error)
    }
    setLoading(false)
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1 className="auth-title">Join BukStay</h1>
        <p className="auth-subtitle">Create your account and discover stays worldwide</p>

        {error && <div className="auth-error">{error}</div>}

        <div className="social-auth">
          <button onClick={() => handleSocialSignup(loginWithGoogle)} disabled={loading} className="social-btn google-btn">
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>

          <button onClick={() => handleSocialSignup(loginWithApple)} disabled={loading} className="social-btn apple-btn">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.2 0-1.42.62-2.2.44-3.08-.4-4.11-4.23-3.53-10.45 1.12-10.67.99.05 1.69.54 2.54.56.88-.02 1.67-.56 2.76-.51 1.47.2 2.58.85 3.3 2.1-3.06 1.85-2.57 6.28.52 7.97-.38.93-.85 1.83-1.46 2.55zm-5.26-16.12c.08-2.73 2.28-5.16 5.06-5.16.18 2.9-2.6 5.31-5.06 5.16z"/>
            </svg>
            Continue with Apple
          </button>
        </div>

        <div className="divider"><span>or</span></div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Full Name</label>
            <input type="text" name="name" value={form.name} onChange={handleChange} required disabled={loading} placeholder="John Doe" />
          </div>

          <div className="form-group">
            <label>Email Address</label>
            <input type="email" name="email" value={form.email} onChange={handleChange} required disabled={loading} placeholder="you@example.com" />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input type="password" name="password" value={form.password} onChange={handleChange} required minLength="6" disabled={loading} placeholder="Minimum 6 characters" />
          </div>

          <div className="form-group">
            <label>I want to</label>
            <select name="role" value={form.role} onChange={handleChange} disabled={loading}>
              <option value="user">Book stays</option>
              <option value="host">Host my property</option>
            </select>
          </div>

          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p className="auth-footer">
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </div>
    </div>
  )
}