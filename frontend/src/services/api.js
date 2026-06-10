import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

const api = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor - add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor - handle token refresh + errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    // If 401 and not already retrying, try refresh token
    if (error.response?.status === 401 &&!originalRequest._retry) {
      originalRequest._retry = true
      try {
        const refreshToken = localStorage.getItem('refresh_token')
        if (!refreshToken) throw new Error('No refresh token')
        
        const res = await axios.post(`${API_URL}/api/auth/refresh`, {
          refresh_token: refreshToken
        })
        
        const { token, refresh_token } = res.data
        localStorage.setItem('token', token)
        localStorage.setItem('refresh_token', refresh_token)
        
        // Retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${token}`
        return api(originalRequest)
      } catch (refreshError) {
        // Refresh failed - logout user
        localStorage.removeItem('token')
        localStorage.removeItem('refresh_token')
        localStorage.removeItem('user')
        window.location.href = '/login'
        return Promise.reject(refreshError)
      }
    }

    // Format error message
    const message = 
      error.response?.data?.error ||
      error.response?.data?.message ||
      error.message ||
     'Network error. Please try again.'
    
    return Promise.reject(new Error(message))
  }
)

// File upload helper
export const uploadFile = async (file, onProgress) => {
  const formData = new FormData()
  formData.append('file', file)

  const res = await api.post('/api/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress: (progressEvent) => {
      if (onProgress) {
        const percent = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        )
        onProgress(percent)
      }
    },
  })
  return res.data // { url, filename }
}

// Multiple file upload
export const uploadFiles = async (files, onProgress) => {
  const formData = new FormData()
  files.forEach(file => formData.append('files', file))

  const res = await api.post('/api/upload/multiple', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress: (progressEvent) => {
      if (onProgress) {
        const percent = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        )
        onProgress(percent)
      }
    },
  })
  return res.data // { urls: [], filenames: [] }
}

export default api