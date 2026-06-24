import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import '../../styles/Auth.css'
import { useTheme } from '../../context/ThemeContext'
import { Eye, EyeOff, Mail, Lock, User, Loader2, Shield } from 'lucide-react'

export default function AdminRegister() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    secretKey: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const { register } = useAuth()
  const { theme } = useTheme()
  const navigate = useNavigate()
  const isDark = theme === 'dark'

  // Change this to your own secret key
  const ADMIN_SECRET_KEY = 'bukstay-admin-2025-secret'

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!formData.fullName || !formData.email || !formData.password) {
      setError('Please fill in all required fields')
      return
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (formData.secretKey !== ADMIN_SECRET_KEY) {
      setError('Invalid admin secret key')
      return
    }

    setLoading(true)

    const result = await register(formData.fullName, formData.email, formData.password, 'admin')

    if (!result.success) {
      setError(result.error)
      setLoading(false)
      return
    }

    setSuccess(true)
    setTimeout(() => navigate('/admin-panel-2025/dashboard'), 2000)
  }

  if (success) {
    return (
      <div className={`min-h-screen flex items-center justify-center px-4 py-12 ${isDark ? 'bg-[#0a0a14]' : 'bg-gray-50'}`}>
        <div className={`${isDark ? 'bg-[#1a1a2e]' : 'bg-white'} p-8 rounded-2xl text-center`}>
          <div className="w-16 h-16 rounded-full bg-green-500 flex items-center justify-center mx-auto mb-4">
            <Shield size={32} className="text-white" />
          </div>
          <h2 className={`text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-black'}`}>Admin Created</h2>
          <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Redirecting to admin panel...</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen flex items-center justify-center px-4 py-12 transition-colors ${isDark ? 'bg-[#0a0a14]' : 'bg-gray-50'}`}>
      <div className={`w-full max-w-md p-8 rounded-2xl shadow-xl transition-colors ${isDark ? 'bg-[#1a1a2e] border border-[#2a2a3e]' : 'bg-white'}`}>
        
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-red-500 flex items-center justify-center mx-auto mb-4">
            <Shield size={28} className="text-white" />
          </div>
          <h1 className={`text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Register Admin
          </h1>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Secret admin account creation
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Full Name
            </label>
            <div className="relative">
              <User className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Admin Name"
                className={`w-full pl-11 pr-4 py-3 rounded-lg border outline-none transition-colors ${isDark ? 'bg-[#0a0a14] border-[#2a2a3e] text-white placeholder-gray-500 focus:border-red-500' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-red-500'}`}
                disabled={loading}
                required
              />
            </div>
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Email
            </label>
            <div className="relative">
              <Mail className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="admin@bukstay.com"
                className={`w-full pl-11 pr-4 py-3 rounded-lg border outline-none transition-colors ${isDark ? 'bg-[#0a0a14] border-[#2a2a3e] text-white placeholder-gray-500 focus:border-red-500' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-red-500'}`}
                disabled={loading}
                required
              />
            </div>
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Password (min 8 characters)
            </label>
            <div className="relative">
              <Lock className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Min 8 characters"
                className={`w-full pl-11 pr-11 py-3 rounded-lg border outline-none transition-colors ${isDark ? 'bg-[#0a0a14] border-[#2a2a3e] text-white placeholder-gray-500 focus:border-red-500' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-red-500'}`}
                disabled={loading}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className={`absolute right-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-gray-500 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'}`}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Confirm Password
            </label>
            <div className="relative">
              <Lock className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Re-enter password"
                className={`w-full pl-11 pr-4 py-3 rounded-lg border outline-none transition-colors ${isDark ? 'bg-[#0a0a14] border-[#2a2a3e] text-white placeholder-gray-500 focus:border-red-500' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-red-500'}`}
                disabled={loading}
                required
              />
            </div>
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Admin Secret Key
            </label>
            <input
              type="text"
              name="secretKey"
              value={formData.secretKey}
              onChange={handleChange}
              placeholder="Enter admin secret key"
              className={`w-full px-4 py-3 rounded-lg border outline-none transition-colors ${isDark ? 'bg-[#0a0a14] border-[#2a2a3e] text-white placeholder-gray-500 focus:border-red-500' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-red-500'}`}
              disabled={loading}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-red-500 text-white py-3 rounded-lg font-semibold hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <><Loader2 className="w-5 h-5 animate-spin" />Creating Admin...</>
            ) : (
              'Create Admin Account'
            )}
          </button>
        </form>
      </div>
    </div>
  )
}