import { createContext, useContext, useEffect, useState } from 'react'

const ThemeContext = createContext()

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    // Get theme on initial load to prevent flash
    const saved = localStorage.getItem('bukstay-theme')
    if (saved) return saved
    
    // Check system preference if no saved theme
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark'
    }
    return 'light'
  })

  useEffect(() => {
    // Apply theme to document root
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('bukstay-theme', theme)
  }, [theme])

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    
    const handleChange = (e) => {
      // Only auto-switch if user hasn't manually set a preference
      const saved = localStorage.getItem('bukstay-theme-manual')
      if (!saved) {
        setTheme(e.matches? 'dark' : 'light')
      }
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  const toggleTheme = () => {
    setTheme(prev => {
      const newTheme = prev === 'dark'? 'light' : 'dark'
      // Mark as manual so we don't override with system changes
      localStorage.setItem('bukstay-theme-manual', 'true')
      return newTheme
    })
  }

  const resetToSystem = () => {
    localStorage.removeItem('bukstay-theme-manual')
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches? 'dark' : 'light'
    setTheme(systemTheme)
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, resetToSystem, isDark: theme === 'dark' }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider')
  }
  return context
}