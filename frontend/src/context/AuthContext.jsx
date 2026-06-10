import { createContext, useContext, useEffect, useState } from 'react'
import axios from 'axios'

const AuthContext = createContext()

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const storedUser = localStorage.getItem('bukstay-user')
    const storedToken = localStorage.getItem('bukstay-token')
    
    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser))
      setToken(storedToken)
      axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`
    }
    setLoading(false)
  }, [])

  const login = async (email, password) => {
    try {
      const { data } = await axios.post(`${API_URL}/api/auth/login`, { email, password })
      setUser(data.user)
      setToken(data.token)
      localStorage.setItem('bukstay-user', JSON.stringify(data.user))
      localStorage.setItem('bukstay-token', data.token)
      axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`
      return { success: true }
    } catch (error) {
      return { success: false, error: error.response?.data?.error || 'Login failed' }
    }
  }

  const register = async (name, email, password, role = 'traveler') => {
    try {
      const { data } = await axios.post(`${API_URL}/api/auth/register`, { name, email, password, role })
      setUser(data.user)
      setToken(data.token)
      localStorage.setItem('bukstay-user', JSON.stringify(data.user))
      localStorage.setItem('bukstay-token', data.token)
      axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`
      return { success: true }
    } catch (error) {
      return { success: false, error: error.response?.data?.error || 'Registration failed' }
    }
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('bukstay-user')
    localStorage.removeItem('bukstay-token')
    delete axios.defaults.headers.common['Authorization']
  }

  const updateUser = (newData) => {
    const updated = { ...user, ...newData }
    setUser(updated)
    localStorage.setItem('bukstay-user', JSON.stringify(updated))
  }

  return (
    <AuthContext.Provider value={{ 
      user, 
      token, 
      loading, 
      login, 
      register, 
      logout, 
      updateUser,
      isAuthenticated: !!user,
      isHost: user?.role === 'host' || user?.role === 'both',
      isAdmin: user?.role === 'admin'
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}