import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

// Layouts
import MainLayout from '../layouts/MainLayout'
import HostLayout from '../layouts/HostLayout'
import TravelerLayout from '../layouts/TravelerLayout'
import AdminLayout from '../layouts/AdminLayout'

// Public pages
import Home from '../pages/Home'
import Discover from '../pages/Discover'
import Stays from '../pages/Stays'
import Property from '../pages/Property'

// Auth pages
import Login from '../pages/auth/Login'
import Register from '../pages/auth/Register'
import Onboarding from '../pages/auth/Onboarding'
import ClaimAccount from '../pages/auth/ClaimAccount'

// Secret pages
import SecretAdminAccess from '../pages/admin/SecretAdminAccess'
import SecretHostOnboard from '../pages/host/SecretHostOnboard'

// Traveler pages
import TravelerDashboard from '../pages/traveler/Dashboard'
import TravelerBookings from '../pages/traveler/Bookings'
import TravelerSaved from '../pages/traveler/Saved'
import TravelerWallet from '../pages/traveler/Wallet'
import Checkout from '../pages/traveler/Checkout'
import TravelerProfile from '../pages/traveler/Profile'

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
function ProtectedRoute({ children, requireRole }) {
  const { userProfile, loading } = useAuth()

  if (loading) {
    return (
      <div className="route-loader">
        <div className="spinner"></div>
      </div>
    )
  }

  if (!userProfile) {
    return <Navigate to="/login" replace />
  }

  if (requireRole && userProfile.role !== requireRole) {
    const roleRedirects = {
      admin: '/admin/dashboard',
      host: '/host/dashboard',
      traveller: '/traveller/dashboard',
      guest: '/'
    }
    return <Navigate to={roleRedirects[userProfile.role] || '/'} replace />
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
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/claim-account" element={<ClaimAccount />} />

        {/* SECRET ROUTES - No links anywhere */}
        <Route path="/admin-panel-2025" element={<SecretAdminAccess />} />
        <Route path="/host-onboard-9x7k2p" element={<SecretHostOnboard />} />

        {/* Public routes - MainLayout */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/discover" element={<Discover />} />
          <Route path="/stays" element={<Stays />} />
          <Route path="/stays/:id" element={<Property />} />
          {/* GUEST CHECKOUT - PUBLIC */}
          <Route path="/checkout/:id" element={<Checkout />} />
        </Route>

        {/* Traveller routes - protected */}
        <Route
          path="/traveller"
          element={
            <ProtectedRoute requireRole="traveller">
              <TravelerLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<TravelerDashboard />} />
          <Route path="bookings" element={<TravelerBookings />} />
          <Route path="saved" element={<TravelerSaved />} />
          <Route path="wallet" element={<TravelerWallet />} />
          <Route path="profile" element={<TravelerProfile />} />
        </Route>

        {/* Host routes - protected + require host role */}
        <Route
          path="/host"
          element={
            <ProtectedRoute requireRole="host">
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
        </Route>

        {/* Admin routes - protected + require admin role */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute requireRole="admin">
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
        </Route>

        {/* 404 - redirect to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}