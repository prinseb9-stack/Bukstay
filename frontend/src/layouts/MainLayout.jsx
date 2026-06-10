import { Outlet } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { useAuth } from '../context/AuthContext'
import './MainLayout.css'

export default function MainLayout() {
  const { loading } = useAuth()

  if (loading) {
    return (
      <div className="layout-loader">
        <div className="spinner"></div>
      </div>
    )
  }

  return (
    <div className="main-layout">
      <Navbar />
      <main className="main-content">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}