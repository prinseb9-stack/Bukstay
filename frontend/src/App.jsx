import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import SplashScreen from './components/SplashScreen' // Add this
import PublicLayout from './layouts/PublicLayout'
import TravelerLayout from './layouts/TravellerLayout'
import HostLayout from './layouts/HostLayout'
import AdminLayout from './layouts/AdminLayout'

// Public
import Home from './pages/Home'
import Discover from './pages/Discover'
import Stays from './pages/Stays'
import Property from './pages/Property'
import About from './pages/About'
import Help from './pages/Help'

// Auth
import Login from './pages/Login'
import Register from './pages/Register'
import Onboarding from './pages/Onboarding'

// Traveler
import TravelerDashboard from './pages/Traveller/Dashboard'
import TravelerProfile from './pages/Traveller/Profile'
import Bookings from './pages/Traveller/Bookings'
import Saved from './pages/Traveller/Saved'
import Wallet from './pages/Traveller/Wallet'

// Host
import HostDashboard from './pages/host/Dashboard'
import HostProperties from './pages/host/Properties'
import HostBookings from './pages/host/Bookings'
import HostEarnings from './pages/host/Earnings'

// Booking
import Checkout from './pages/Checkout'

// Admin
import AdminDashboard from './pages/admin/Dashboard'
import AdminUsers from './pages/admin/Users'
import AdminProperties from './pages/admin/Properties'

function App() {
  const [showSplash, setShowSplash] = useState(true)

  useEffect(() => {
    // Only show once per session
    const hasSeenSplash = sessionStorage.getItem('bukstay_splash')
    if (hasSeenSplash) {
      setShowSplash(false)
    }
  }, [])

  const handleSplashFinish = () => {
    sessionStorage.setItem('bukstay_splash', 'true')
    setShowSplash(false)
  }

  if (showSplash) {
    return (
      <ThemeProvider>
        <SplashScreen onFinish={handleSplashFinish} />
      </ThemeProvider>
    )
  }

  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public */}
            <Route element={<PublicLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/discover" element={<Discover />} />
              <Route path="/stays" element={<Stays />} />
              <Route path="/stays/:id" element={<Property />} />
              <Route path="/about" element={<About />} />
              <Route path="/help" element={<Help />} />
            </Route>

            {/* Auth */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/onboarding" element={<Onboarding />} />

            {/* Traveler */}
            <Route path="/traveler" element={<TravelerLayout />}>
              <Route path="dashboard" element={<TravelerDashboard />} />
              <Route path="profile" element={<TravelerProfile />} />
              <Route path="bookings" element={<Bookings />} />
              <Route path="saved" element={<Saved />} />
              <Route path="wallet" element={<Wallet />} />
            </Route>

            {/* Host */}
            <Route path="/host" element={<HostLayout />}>
              <Route path="dashboard" element={<HostDashboard />} />
              <Route path="properties" element={<HostProperties />} />
              <Route path="bookings" element={<HostBookings />} />
              <Route path="earnings" element={<HostEarnings />} />
            </Route>

            {/* Booking */}
            <Route path="/checkout/:propertyId" element={<Checkout />} />

            {/* Admin */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="properties" element={<AdminProperties />} />
            </Route>

            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App