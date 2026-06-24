import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import '../../styles/Auth.css'
import { useTheme } from '../../context/ThemeContext'
import { Eye, EyeOff, Mail, Lock, User, Loader2, ArrowLeft } from 'lucide-react'

export default function HostRegister() {
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const { register } = useAuth()
  const { theme } = useTheme()
  const navigate = useNavigate()
  const isDark = theme === 'dark'

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    if (!form.fullName || !form.email || !form.password) {
      setError('Please fill in all required fields')
      setLoading(false)
      return
    }

    if (form.password.length < 6) {
      setError('Password must be at least 6 characters')
      setLoading(false)
      return
    }

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }

    // Force role to host
    const result = await register(form.fullName, form.email, form.password, 'host')

    if (result.success) {
      navigate('/host/dashboard')
    } else {
      setError(result.error)
    }
    setLoading(false)
  }

  return (
    <div className={`min-h-screen flex items-center justify-center px-4 py-12 transition-colors ${isDark ? 'bg-[#0a0a14]' : 'bg-gray-50'}`}>
      <div className={`w-full max-w-md p-8 rounded-2xl shadow-xl transition-colors ${isDark ? 'bg-[#1a1a2e] border border-[#2a2a3e]' : 'bg-white'}`}>
        <Link to="/host/login" className={`inline-flex items-center gap-1 text-sm mb-6 ${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-black'}`}>
          <ArrowLeft size={16} />
          Back to host login
        </Link>

        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-[#f5a623] flex items-center justify-center text-white font-bold text-xl mx-auto mb-4">
            🏠
          </div>
          <h1 className={`text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Become a Host
          </h1>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Start earning by listing your property
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Full Name</label>
            <div className="relative">
              <User className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
              <input type="text" name="fullName" value={form.fullName} onChange={handleChange} placeholder="John Doe" required
                className={`w-full pl-11 pr-4 py-3 rounded-lg border outline-none transition-colors ${isDark ? 'bg-[#0a0a14] border-[#2a2a3e] text-white placeholder-gray-500 focus:border-[#f5a623]' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-[#f5a623]'}`} disabled={loading} />
            </div>
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Email Address</label>
            <div className="relative">
              <Mail className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
              <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="host@example.com" required
                className={`w-full pl-11 pr-4 py-3 rounded-lg border outline-none transition-colors ${isDark ? 'bg-[#0a0a14] border-[#2a2a3e] text-white placeholder-gray-500 focus:border-[#f5a623]' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-[#f5a623]'}`} disabled={loading} />
            </div>
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Password</label>
            <div className="relative">
              <Lock className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
              <input type={showPassword ? 'text' : 'password'} name="password" value={form.password} onChange={handleChange} placeholder="Min 6 characters" required
                className={`w-full pl-11 pr-11 py-3 rounded-lg border outline-none transition-colors ${isDark ? 'bg-[#0a0a14] border-[#2a2a3e] text-white placeholder-gray-500 focus:border-[#f5a623]' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-[#f5a623]'}`} disabled={loading} />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                className={`absolute right-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-gray-500 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'}`}>
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Confirm Password</label>
            <div className="relative">
              <Lock className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
              <input type="password" name="confirmPassword" value={form.confirmPassword} onChange={handleChange} placeholder="Re-enter password" required
                className={`w-full pl-11 pr-4 py-3 rounded-lg border outline-none transition-colors ${isDark ? 'bg-[#0a0a14] border-[#2a2a3e] text-white placeholder-gray-500 focus:border-[#f5a623]' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-[#f5a623]'}`} disabled={loading} />
            </div>
          </div>

          <button type="submit" disabled={loading}
            className="w-full bg-[#f5a623] text-white py-3 rounded-lg font-semibold hover:bg-[#e09413] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
            {loading ? <><Loader2 className="w-5 h-5 animate-spin" />Creating Account...</> : 'Become a Host'}
          </button>
        </form>

        <p className={`text-center text-sm mt-6 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          Already a host? <Link to="/host/login" className="text-[#f5a623] font-semibold hover:underline">Log in</Link>
        </p>
      </div>
    </div>
  )
}