import { NavLink } from 'react-router-dom'
import { Home, Search, Heart, User } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import '../styles/BottomNav.css'

const BottomNav = () => {
  const { userProfile } = useAuth()
  const { theme } = useTheme()

  return (
    <nav className={`bottom-nav ${theme}`}>
      <NavLink to="/" className="nav-item" end>
        <Home size={24} />
        <span>Home</span>
      </NavLink>
      <NavLink to="/stays" className="nav-item">
        <Search size={24} />
        <span>Explore</span>
      </NavLink>
      <NavLink to={userProfile ? "/User/saved" : "/login"} className="nav-item">
        <Heart size={24} />
        <span>Saved</span>
      </NavLink>
      <NavLink to={userProfile ? "/User/profile" : "/login"} className="nav-item">
        <User size={24} />
        <span>Profile</span>
      </NavLink>
    </nav>
  )
}

export default BottomNav