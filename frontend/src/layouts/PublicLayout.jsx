import { Outlet, useNavigate } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'
import { useAuth } from '../context/AuthContext'

export default function PublicLayout() {
  const { theme, toggleTheme } = useTheme()
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  return (
    <div className={theme === 'dark' ? 'bg-[#0f0f1a] min-h-screen' : 'bg-gray-50 min-h-screen'}>
      <nav className={`${theme === 'dark' ? 'bg-[#1a1a2e] border-[#2a2a3e]' : 'bg-white border-gray-200'} p-4 flex justify-between items-center border-b sticky top-0 z-50`}>
        <h1 className="text-[#f5a623] text-2xl font-bold cursor-pointer" onClick={() => navigate('/')}>
          BukStay
        </h1>
        <div className="flex gap-3 items-center">
          <button onClick={toggleTheme} className={`${theme === 'dark' ? 'border-gray-700 text-white' : 'border-gray-300 text-black'} border px-3 py-2 rounded-lg`}>
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
          <button onClick={() => navigate('/discover')} className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} px-3 py-2`}>
            Discover
          </button>
          <button onClick={() => navigate('/stays')} className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} px-3 py-2`}>
            Stays
          </button>
          {user ? (
            <>
              <button onClick={() => navigate('/traveler/dashboard')} className="border border-[#f5a623] text-[#f5a623] px-5 py-2 rounded-lg font-bold">
                Dashboard
              </button>
              <button onClick={logout} className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} px-3 py-2`}>
                Logout
              </button>
            </>
          ) : (
            <>
              <button onClick={() => navigate('/login')} className="border border-[#f5a623] text-[#f5a623] px-5 py-2 rounded-lg font-bold">
                Sign In
              </button>
              <button onClick={() => navigate('/register')} className="bg-[#f5a623] text-black px-5 py-2 rounded-lg font-bold">
                Get Started
              </button>
            </>
          )}
        </div>
      </nav>
      <Outlet />
    </div>
  )
}