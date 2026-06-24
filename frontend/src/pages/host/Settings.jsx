import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../../lib/firebase'
import { Loader2 } from 'lucide-react'

export default function HostSettings() {
  const { user, userProfile, updateUserProfile } = useAuth()
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    businessName: '',
    country: '',
    notifyBookings: true,
    notifyMessages: true,
    notifyPayouts: true
  })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (userProfile) {
      setForm({
        fullName: userProfile.fullName || '',
        email: userProfile.email || '',
        phone: userProfile.phone || '',
        businessName: userProfile.businessName || '',
        country: userProfile.country || '',
        notifyBookings: userProfile.notifyBookings !== false,
        notifyMessages: userProfile.notifyMessages !== false,
        notifyPayouts: userProfile.notifyPayouts !== false
      })
    }
  }, [userProfile])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleSave = async (e) => {
    e.preventDefault()
    if (!user) return

    setLoading(true)
    setMessage('')

    try {
      await updateDoc(doc(db, 'users', user.uid), {
        fullName: form.fullName,
        phone: form.phone,
        businessName: form.businessName,
        notifyBookings: form.notifyBookings,
        notifyMessages: form.notifyMessages,
        notifyPayouts: form.notifyPayouts,
        updatedAt: serverTimestamp()
      })

      await updateUserProfile({
        fullName: form.fullName,
        phone: form.phone,
        businessName: form.businessName
      })

      setMessage('Settings saved successfully')
    } catch (err) {
      console.error(err)
      setMessage('Failed to save settings')
    } finally {
      setLoading(false)
      setTimeout(() => setMessage(''), 3000)
    }
  }

  return (
    <div className={`${isDark ? 'bg-[#0f0f1a]' : 'bg-gray-50'} min-h-screen p-6`}>
      <div className="max-w-2xl mx-auto">
        <h1 className={`${isDark ? 'text-white' : 'text-black'} text-3xl font-bold mb-8`}>Settings</h1>

        <form onSubmit={handleSave} className="space-y-6">
          {/* Profile */}
          <div className={`${isDark ? 'bg-[#1a1a2e]' : 'bg-white'} p-6 rounded-2xl space-y-4`}>
            <h2 className={`${isDark ? 'text-white' : 'text-black'} text-lg font-bold`}>Profile</h2>
            
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Full Name</label>
              <input type="text" name="fullName" value={form.fullName} onChange={handleChange}
                className={`w-full p-3 rounded-lg border outline-none ${isDark ? 'bg-[#0f0f1a] border-gray-700 text-white' : 'bg-gray-50 border-gray-300 text-black'} focus:border-[#f5a623]`} />
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Email</label>
              <input type="email" name="email" value={form.email} disabled
                className={`w-full p-3 rounded-lg border cursor-not-allowed ${isDark ? 'bg-[#0f0f1a] border-gray-700 text-gray-500' : 'bg-gray-100 border-gray-300 text-gray-500'}`} />
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Phone Number</label>
              <input type="tel" name="phone" value={form.phone} onChange={handleChange}
                className={`w-full p-3 rounded-lg border outline-none ${isDark ? 'bg-[#0f0f1a] border-gray-700 text-white' : 'bg-gray-50 border-gray-300 text-black'} focus:border-[#f5a623]`} />
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Business Name</label>
              <input type="text" name="businessName" value={form.businessName} onChange={handleChange}
                className={`w-full p-3 rounded-lg border outline-none ${isDark ? 'bg-[#0f0f1a] border-gray-700 text-white' : 'bg-gray-50 border-gray-300 text-black'} focus:border-[#f5a623]`} />
            </div>
          </div>

          {/* Notifications */}
          <div className={`${isDark ? 'bg-[#1a1a2e]' : 'bg-white'} p-6 rounded-2xl space-y-4`}>
            <h2 className={`${isDark ? 'text-white' : 'text-black'} text-lg font-bold`}>Notifications</h2>
            
            {[
              { name: 'notifyBookings', label: 'New bookings' },
              { name: 'notifyMessages', label: 'Guest messages' },
              { name: 'notifyPayouts', label: 'Payout updates' }
            ].map(item => (
              <label key={item.name} className="flex items-center justify-between cursor-pointer">
                <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>{item.label}</span>
                <input type="checkbox" name={item.name} checked={form[item.name]} onChange={handleChange}
                  className="w-5 h-5 accent-[#f5a623]" />
              </label>
            ))}
          </div>

          {message && (
            <p className={`text-sm text-center ${message.includes('Failed') ? 'text-red-500' : 'text-green-500'}`}>
              {message}
            </p>
          )}

          <button type="submit" disabled={loading}
            className="w-full bg-[#f5a623] text-black py-4 rounded-xl font-bold text-lg hover:bg-[#e0941a] transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
            {loading ? <><Loader2 className="animate-spin" size={20} />Saving...</> : 'Save Settings'}
          </button>
        </form>
      </div>
    </div>
  )
}