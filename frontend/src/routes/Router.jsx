import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

// Layouts
import MainLayout from '../layouts/MainLayout'
import HostLayout from '../layouts/HostLayout'
import TravellerLayout from '../layouts/TravellerLayout'
import AdminLayout from '../layouts/AdminLayout'

// Public pages
import Home from '../pages/Home'
import Discover from '../pages/Discover'
import Stays from '../pages/Stays'
import Property from '../pages/Property'

// Auth pages
import Login from '../pages/auth/Login'
import Register from '../pages/auth/Register'

// Traveller pages
import TravellerDashboard from '../pages/Traveller/Dashboard'
import TravellerBookings from '../pages/Traveller/Bookings'
import TravellerSaved from '../pages/Traveller/Saved'
import TravellerWallet from '../pages/Traveller/Wallet'
import Checkout from '../pages/Traveller/Checkout'

// Host pages
import HostDashboard from '../pages/host/Dashboard'
import HostProperties from '../pages/host/Properties'
import HostPropertyForm from '../pages/host/PropertyForm'
import HostBookings from '../pages/host/Bookings'
import HostEarnings from '../pages/host/Earnings'

// Admin pages
import AdminDashboard from '../pages/admin/Dashboard'
import AdminUsers from '../pages/admin/Users'
import AdminProperties from '../pages/admin/Properties'
import AdminBookings from '../pages/admin/Bookings'
import AdminPayouts from '../pages/admin/Payouts'

// Protected route wrapper
function ProtectedRoute({ children, requireHost = false, requireAdmin = false }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="route-loader">
        <div className="spinner"></div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (requireHost && user.role !== 'host') {
    return <Navigate to="/traveller/dashboard" replace />
  }

  if (requireAdmin && user.role !== 'admin') {
    return <Navigate to="/" replace />
  }

  return children
}

export default function Router() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Auth routes - no layout */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Public routes - MainLayout with Navbar + Footer */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/discover" element={<Discover />} />
          <Route path="/stays" element={<Stays />} />
          <Route path="/stays/:id" element={<Property />} />
        </Route>

        {/* Traveller routes - protected */}
        <Route
          path="/traveller"
          element={
            <ProtectedRoute>
              <TravellerLayout />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<TravellerDashboard />} />
          <Route path="bookings" element={<TravellerBookings />} />
          <Route path="saved" element={<TravellerSaved />} />
          <Route path="wallet" element={<TravellerWallet />} />
          <Route path="checkout/:id" element={<Checkout />} />
        </Route>

        {/* Host routes - protected + require host role */}
        <Route
          path="/host"
          element={
            <ProtectedRoute requireHost>
              <HostLayout />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<HostDashboard />} />
          <Route path="properties" element={<HostProperties />} />
          <Route path="properties/new" element={<HostPropertyForm />} />
          <Route path="properties/edit/:id" element={<HostPropertyForm />} />
          <Route path="bookings" element={<HostBookings />} />
          <Route path="earnings" element={<HostEarnings />} />
        </Route>

        {/* Admin routes - protected + require admin role */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute requireAdmin>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="properties" element={<AdminProperties />} />
          <Route path="bookings" element={<AdminBookings />} />
          <Route path="payouts" element={<AdminPayouts />} />
        </Route>

        {/* 404 - redirect to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}