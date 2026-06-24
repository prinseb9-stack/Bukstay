import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'https://bukstay-api.onrender.com/api'

const api = axios.create({ 
  baseURL: API_URL, 
  timeout: 30000, 
  headers: { 
    'Content-Type': 'application/json', 
  }, 
})

// Add JWT token to every request
api.interceptors.request.use(
  (config) => { 
    const token = localStorage.getItem('bukstay-token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  }, 
  (error) => Promise.reject(error)
)

// Handle API errors
api.interceptors.response.use(
  (response) => response, 
  (error) => { 
    const message = 
      error.response?.data?.error || 
      error.response?.data?.message || 
      error.message || 
      'Something went wrong'

    // If token is invalid or expired
    if (error.response?.status === 401) {
      localStorage.removeItem('bukstay-token')
      localStorage.removeItem('bukstay-user')
      window.location.href = '/login'
    }

    return Promise.reject(new Error(message))
  }
)

export default api