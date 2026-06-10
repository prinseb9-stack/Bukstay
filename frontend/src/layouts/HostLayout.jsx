import { Outlet, Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'

export default function HostLayout() {
  const { user, loading, isHost } = useAuth()
  const { theme } = useTheme()

  if (loading) return <div className={`${theme === 'dark'? 'bg-[#0f0f1a] text-white' : 'bg-gray-50 text-black'} min-h-screen flex items-center justify-center`}>Loading...</div>
  if (!user || !isHost) return <Navigate to="/login" />

  return (
    <div className={theme === 'dark' ? 'bg-[#0f0f1a] min-h-screen' : 'bg-gray-50 min-h-screen'}>
      <Outlet />
    </div>
  )
}