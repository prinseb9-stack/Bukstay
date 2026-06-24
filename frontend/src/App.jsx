import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import SplashScreen from './components/SplashScreen'
import BottomNav from './components/BottomNav'

// Layouts
import MainLayout from './layouts/MainLayout'
import UserLayout from './layouts/UserLayout'
import HostLayout from './layouts/HostLayout'
import AdminLayout from './layouts/AdminLayout'

// Public pages
import Home from './pages/Home'
import Discover from './pages/Discover'
import Stays from './pages/Stays'
import Property from './pages/Property'
import About from './pages/About'
import Help from './pages/Help'
import FoodMenu from './pages/FoodMenu'

// Authentication
import Login from './pages/Login'
import Register from './pages/Register'
import Onboarding from './pages/Onboarding'
import HostOnboard from './pages/HostOnboard'
import ClaimAccount from './pages/ClaimAccount'
import HostLogin from './pages/host/Login'
import AdminLogin from './pages/admin/Login'
import AdminRegister from './pages/admin/Register'
import HostRegister from './pages/host/Register'

// User
import UserDashboard from './pages/User/Dashboard'
import UserProfile from './pages/User/Profile'
import UserBookings from './pages/User/Bookings'
import Saved from './pages/User/Saved'
import Credits from './pages/User/Credits'
import UserMessages from './pages/User/Messages'
import UserChat from './pages/User/Chat'

// Host
import HostDashboard from './pages/host/Dashboard'
import HostProperties from './pages/host/Properties'
import HostBookings from './pages/host/Bookings'
import HostEarnings from './pages/host/Earnings'
import HostPropertyForm from './pages/host/PropertyForm'
import HostReviews from './pages/host/Reviews'
import HostMessages from './pages/host/Messages'
import HostSettings from './pages/host/Settings'
import HostMenus from './pages/host/Menus'
import HostChat from './pages/host/Chat'

// Booking
import Checkout from './pages/Checkout'
import PaymentVerify from './pages/payment/Verify'

// Admin
import AdminDashboard from './pages/admin/Dashboard'
import AdminUsers from './pages/admin/Users'
import AdminProperties from './pages/admin/Properties'
import AdminBookings from './pages/admin/Bookings'
import AdminPayouts from './pages/admin/Payouts'
import AdminFoodMenus from './pages/admin/FoodMenus'

function ProtectedRoute({ children, role }) {
  const { user, userProfile, loading } = useAuth()

  if (loading) {
    return <div className="loading">Loading...</div>
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (role && userProfile?.role !== role) {
    return <Navigate to="/" replace />
  }

  return children
}

function AppRoutes() {
  const [showSplash, setShowSplash] = useState(true)
  const { userProfile } = useAuth()
  const location = useLocation()

  useEffect(() => {
    const seen = sessionStorage.getItem('bukstay-splash')
    if (seen) setShowSplash(false)
  }, [])

  const finishSplash = () => {
    sessionStorage.setItem('bukstay-splash', 'true')
    setShowSplash(false)
  }

  if (showSplash) {
    return <SplashScreen onFinish={finishSplash} />
  }

  return (
    <>
      <Routes>
        {/* Public - MainLayout */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/discover" element={<Discover />} />
          <Route path="/stays" element={<Stays />} />
          <Route path="/stays/:id" element={<Property />} />
          <Route path="/about" element={<About />} />
          <Route path="/help" element={<Help />} />
          <Route path="/food" element={<FoodMenu />} />
        </Route>

        {/* Auth - standalone, no layout */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/claim-account" element={<ClaimAccount />} />
        <Route path="/host-onboard-9x7k2p" element={<HostOnboard />} />
        <Route path="/host/login" element={<HostLogin />} />
        <Route path="/host/register" element={<HostRegister />} />
        <Route path="/admin-panel-2025/login" element={<AdminLogin />} />
        <Route path="/admin-panel-2025/register" element={<AdminRegister />} />

        {/* User Dashboard - protected */}
        <Route
          path="/User"
          element={
            <ProtectedRoute role="user">
              <UserLayout />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<UserDashboard />} />
          <Route path="profile" element={<UserProfile />} />
          <Route path="bookings" element={<UserBookings />} />
          <Route path="saved" element={<Saved />} />
          <Route path="credits" element={<Credits />} />
          <Route path="messages" element={<UserMessages />} />
          <Route path="messages/:chatId" element={<UserChat />} />
        </Route>

        {/* Host Portal - COMPLETELY SEPARATE */}
        <Route
          path="/host"
          element={
            <ProtectedRoute role="host">
              <HostLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<HostDashboard />} />
          <Route path="properties" element={<HostProperties />} />
          <Route path="properties/new" element={<HostPropertyForm />} />
          <Route path="properties/edit/:id" element={<HostPropertyForm />} />
          <Route path="bookings" element={<HostBookings />} />
          <Route path="earnings" element={<HostEarnings />} />
          <Route path="reviews" element={<HostReviews />} />
          <Route path="messages" element={<HostMessages />} />
          <Route path="messages/:chatId" element={<HostChat />} />
          <Route path="settings" element={<HostSettings />} />
          <Route path="menus" element={<HostMenus />} />
        </Route>

        {/* Admin Portal - COMPLETELY SEPARATE */}
        <Route
          path="/admin-panel-2025"
          element={
            <ProtectedRoute role="admin">
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="properties" element={<AdminProperties />} />
          <Route path="bookings" element={<AdminBookings />} />
          <Route path="payouts" element={<AdminPayouts />} />
          <Route path="food-menus" element={<AdminFoodMenus />} />
        </Route>

        {/* Booking - PUBLIC */}
        <Route path="/checkout/:propertyId" element={<Checkout />} />
        <Route path="/payment/verify" element={<PaymentVerify />} />

        {/* 404 */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>

      {/* BottomNav ONLY on public pages */}
      {!location.pathname.startsWith('/host') &&
        !location.pathname.startsWith('/admin-panel') &&
        !location.pathname.startsWith('/User') &&
        <BottomNav />}
    </>
  )
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  )
}