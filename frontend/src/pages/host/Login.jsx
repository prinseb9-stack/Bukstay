import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import '../../styles/Auth.css'
import { useTheme } from '../../context/ThemeContext'
import { Eye, EyeOff, Mail, Lock, Loader2, ArrowLeft } from 'lucide-react'

export default function HostLogin() {
  const [formData, setFormData] = useState({ email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const { loginHost } = useAuth()
  const { theme } = useTheme()
  const navigate = useNavigate()
  const isDark = theme === 'dark'

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    if (!formData.email || !formData.password) {
      setError('Please fill in all fields')
      setLoading(false)
      return
    }

    const result = await loginHost(formData.email, formData.password)

    if (!result.success) {
      setError(result.error)
      setLoading(false)
      return
    }

    if (result.role === 'admin') {
      navigate('/admin-panel-2025/dashboard')
    } else {
      navigate('/host/dashboard')
    }

    setLoading(false)
  }

  return (
    <div className={`min-h-screen flex items-center justify-center px-4 py-12 transition-colors ${isDark ? 'bg-[#0a0a14]' : 'bg-gray-50'}`}>
      <div className={`w-full max-w-md p-8 rounded-2xl shadow-xl transition-colors ${isDark ? 'bg-[#1a1a2e] border border-[#2a2a3e]' : 'bg-white'}`}>
        <Link to="/" className={`inline-flex items-center gap-1 text-sm mb-6 ${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-black'}`}>
          <ArrowLeft size={16} />
          Back to BukStay
        </Link>

        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-[#f5a623] flex items-center justify-center text-white font-bold text-xl mx-auto mb-4">
            🏠
          </div>
          <h1 className={`text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Host Login
          </h1>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Manage your properties and bookings
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Email address</label>
            <div className="relative">
              <Mail className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
              <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="host@example.com"
                className={`w-full pl-11 pr-4 py-3 rounded-lg border outline-none transition-colors ${isDark ? 'bg-[#0a0a14] border-[#2a2a3e] text-white placeholder-gray-500 focus:border-[#f5a623]' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-[#f5a623]'}`} disabled={loading} />
            </div>
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Password</label>
            <div className="relative">
              <Lock className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
              <input type={showPassword ? 'text' : 'password'} name="password" value={formData.password} onChange={handleChange} placeholder="Enter your password"
                className={`w-full pl-11 pr-11 py-3 rounded-lg border outline-none transition-colors ${isDark ? 'bg-[#0a0a14] border-[#2a2a3e] text-white placeholder-gray-500 focus:border-[#f5a623]' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-[#f5a623]'}`} disabled={loading} />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                className={`absolute right-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-gray-500 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'}`}>
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <button type="submit" disabled={loading}
            className="w-full bg-[#f5a623] text-white py-3 rounded-lg font-semibold hover:bg-[#e09413] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
            {loading ? <><Loader2 className="w-5 h-5 animate-spin" />Logging in...</> : 'Log in to Host Portal'}
          </button>
        </form>

        <div className={`text-center text-sm mt-6 space-y-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          <p>
            New to hosting?{' '}
            <Link to="/host-onboard-9x7k2p" className="text-[#f5a623] font-semibold hover:underline">Become a Host</Link>
          </p>
          <p>
            <Link to="/login" className="hover:underline">Traveller login instead</Link>
          </p>
        </div>
      </div>
    </div>
  )
}