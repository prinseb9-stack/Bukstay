import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import '../styles/Login.css'

export default function Login() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const result = await login(email, password)
    if (result.success) {
      navigate('/discover')
    } else {
      setError(result.error)
    }
    setLoading(false)
  }

  return (
    <div className="login-wrap">
      <div className="login-card">
        <h1 className="login-logo">BukStay</h1>
        <p className="login-sub">Welcome back</p>
        {error && <p className="login-err">{error}</p>}
        <form onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="login-input"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="login-input"
            required
          />
          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        <p className="login-foot">
          No account? <Link to="/register">Register</Link>
        </p>
      </div>
    </div>
  )
}
