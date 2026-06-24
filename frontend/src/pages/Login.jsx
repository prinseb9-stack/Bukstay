import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import '../styles/Auth.css'
import { useTheme } from '../context/ThemeContext'
import { Eye, EyeOff, Mail, Lock, Loader2 } from 'lucide-react'

export default function Login() {
  const [formData, setFormData] = useState({ email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const { login, loginWithGoogle, loginWithApple } = useAuth()
  const { theme } = useTheme()
  const navigate = useNavigate()
  const isDark = theme === 'dark'

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
    setError('')
  }

  const handleRedirect = (result) => {
    if (result.role === 'admin') {
      navigate('/admin-panel-2025/dashboard')
    } else if (result.role === 'host') {
      // Host goes STRAIGHT to host dashboard — no public pages
      navigate('/host/dashboard')
    } else if (result.user?.onboarded === false) {
      navigate('/onboarding')
    } else {
      navigate('/')
    }
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

    const result = await login(formData.email, formData.password)

    if (result.success) {
      handleRedirect(result)
    } else {
      setError(result.error)
    }

    setLoading(false)
  }

  const handleSocialLogin = async (method) => {
    setError('')
    setLoading(true)
    const result = await method()
    if (result.success) {
      handleRedirect(result)
    } else {
      setError(result.error)
    }
    setLoading(false)
  }

  return (
    <div className={`min-h-screen flex items-center justify-center px-4 py-12 transition-colors ${isDark ? 'bg-[#0a0a14]' : 'bg-gray-50'}`}>
      <div className={`w-full max-w-md p-8 rounded-2xl shadow-xl transition-colors ${isDark ? 'bg-[#1a1a2e] border border-[#2a2a3e]' : 'bg-white'}`}>
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-xl bg-[#f5a623] flex items-center justify-center text-white font-bold text-xl">B</div>
            <span className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>BukStay</span>
          </Link>
          <h1 className={`text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>Welcome back</h1>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Log in to your account to continue</p>
        </div>

        {error && (
          <div className="mb-6 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm">{error}</div>
        )}

        <div className="space-y-3 mb-6">
          <button onClick={() => handleSocialLogin(loginWithGoogle)} disabled={loading}
            className={`w-full flex items-center justify-center gap-3 px-4 py-3 rounded-lg border font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed ${isDark ? 'bg-[#0a0a14] border-[#2a2a3e] text-white hover:bg-[#1a1a2e]' : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'}`}>
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>

          <button onClick={() => handleSocialLogin(loginWithApple)} disabled={loading}
            className={`w-full flex items-center justify-center gap-3 px-4 py-3 rounded-lg border font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed ${isDark ? 'bg-[#0a0a14] border-[#2a2a3e] text-white hover:bg-[#1a1a2e]' : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'}`}>
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
            </svg>
            Continue with Apple
          </button>
        </div>

        <div className="relative mb-6">
          <div className={`absolute inset-0 flex items-center ${isDark ? 'border-[#2a2a3e]' : 'border-gray-300'}`}>
            <div className="w-full border-t"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className={`px-2 ${isDark ? 'bg-[#1a1a2e] text-gray-400' : 'bg-white text-gray-500'}`}>Or continue with email</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Email address</label>
            <div className="relative">
              <Mail className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
              <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="you@example.com"
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
            {loading ? <><Loader2 className="w-5 h-5 animate-spin" />Logging in...</> : 'Log in'}
          </button>
        </form>

        <p className={`text-center text-sm mt-6 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          Don't have an account? <Link to="/register" className="text-[#f5a623] font-semibold hover:underline">Sign up</Link>
        </p>
      </div>
    </div>
  )
}