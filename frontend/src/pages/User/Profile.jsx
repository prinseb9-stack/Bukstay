import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'
import { useGeoCurrency } from '../../hooks/useGeo'
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { db, storage } from '../../lib/firebase'
import { Camera, Wallet, ExternalLink } from 'lucide-react'

const COUNTRIES = [
  { name: 'United States', code: 'US', currency: 'USD' },
  { name: 'United Kingdom', code: 'GB', currency: 'GBP' },
  { name: 'Nigeria', code: 'NG', currency: 'NGN' },
  { name: 'Ghana', code: 'GH', currency: 'GHS' },
  { name: 'Kenya', code: 'KE', currency: 'KES' },
  { name: 'South Africa', code: 'ZA', currency: 'ZAR' },
  { name: 'Canada', code: 'CA', currency: 'CAD' },
  { name: 'Australia', code: 'AU', currency: 'AUD' },
  { name: 'Germany', code: 'DE', currency: 'EUR' },
  { name: 'France', code: 'FR', currency: 'EUR' },
  { name: 'India', code: 'IN', currency: 'INR' },
  { name: 'UAE', code: 'AE', currency: 'AED' },
  { name: 'Mexico', code: 'MX', currency: 'MXN' },
  { name: 'Brazil', code: 'BR', currency: 'BRL' },
]

export default function UserProfile() {
  const { user, userProfile, updateUserProfile } = useAuth()
  const { theme } = useTheme()
  const { formatPrice } = useGeoCurrency()
  const fileInputRef = useRef(null)
  
  const [form, setForm] = useState({
    name: '',
    email: '',
    bio: '',
    phone: '',
    country: 'United States',
    currency: 'USD',
    travel_style: 'adventure'
  })
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState('')
  const [walletBalance, setWalletBalance] = useState(0)

  useEffect(() => {
    if (userProfile) {
      setForm({
        name: userProfile.fullName || '',
        email: userProfile.email || '',
        bio: userProfile.bio || '',
        phone: userProfile.phone || '',
        country: userProfile.country || 'United States',
        currency: userProfile.currency || 'USD',
        travel_style: userProfile.travelStyle || 'adventure'
      })
    }
  }, [userProfile])

  useEffect(() => {
    const fetchWalletBalance = async () => {
      if (!userProfile?.bukpayWalletId) return
      try {
        const res = await fetch(
          `https://api.bukpay.com/v1/wallets/${userProfile.bukpayWalletId}/balance`,
          {
            headers: { 
              'Authorization': `Bearer ${import.meta.env.VITE_BUKPAY_SECRET_KEY}` 
            }
          }
        )
        const data = await res.json()
        if (res.ok) setWalletBalance(data.data?.balance || 0)
      } catch (err) {
        console.error('BukPay fetch error:', err)
      }
    }
    fetchWalletBalance()
  }, [userProfile?.bukpayWalletId])

  const handleCountryChange = (countryName) => {
    const country = COUNTRIES.find(c => c.name === countryName)
    setForm({
      ...form, 
      country: countryName,
      currency: country?.currency || 'USD'
    })
  }

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0]
    if (!file || !user) return
    
    setUploading(true)
    try {
      const storageRef = ref(storage, `avatars/${user.uid}`)
      await uploadBytes(storageRef, file)
      const url = await getDownloadURL(storageRef)
      
      await updateDoc(doc(db, 'users', user.uid), {
        avatar: url,
        updatedAt: serverTimestamp()
      })
      
      await updateUserProfile({ avatar: url })
      setMessage('Photo updated successfully')
    } catch (err) {
      console.error('Upload error:', err)
      setMessage('Failed to upload photo')
    } finally {
      setUploading(false)
      setTimeout(() => setMessage(''), 3000)
    }
  }

  const handleSave = async (e) => {
    e.preventDefault()
    if (!user) return
    
    setLoading(true)
    setMessage('')
    
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        fullName: form.name,
        bio: form.bio,
        phone: form.phone,
        country: form.country,
        currency: form.currency,
        travelStyle: form.travel_style,
        updatedAt: serverTimestamp()
      })
      
      await updateUserProfile({
        fullName: form.name,
        bio: form.bio,
        phone: form.phone,
        country: form.country,
        currency: form.currency,
        travelStyle: form.travel_style
      })
      setMessage('Profile updated successfully')
    } catch (err) {
      console.error('Update error:', err)
      setMessage('Failed to update profile')
    } finally {
      setLoading(false)
      setTimeout(() => setMessage(''), 3000)
    }
  }

  return (
    <div className={`${theme === 'dark' ? 'bg-[#0f0f1a]' : 'bg-gray-50'} min-h-screen p-6`}>
      <div className="max-w-2xl mx-auto">
        <h1 className={`${theme === 'dark' ? 'text-white' : 'text-black'} text-3xl font-bold mb-8`}>
          Your Profile
        </h1>
        
        {userProfile?.bukpayWalletId && (
          <div className={`${theme === 'dark' ? 'bg-[#1a1a2e]' : 'bg-white'} p-6 rounded-2xl mb-6`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Wallet size={24} className="text-[#f5a623]" />
                <h3 className={`${theme === 'dark' ? 'text-white' : 'text-black'} text-xl font-bold`}>
                  BukPay Wallet
                </h3>
              </div>
              <button
                onClick={() => window.open('https://app.bukpay.com/wallet', '_blank')}
                className="text-[#f5a623] font-semibold flex items-center gap-1 hover:gap-2 transition-all"
              >
                Open <ExternalLink size={16} />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} text-sm`}>
                  Wallet ID
                </p>
                <p className={`${theme === 'dark' ? 'text-white' : 'text-black'} font-mono text-sm`}>
                  {userProfile.bukpayWalletId}
                </p>
              </div>
              <div>
                <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} text-sm`}>
                  Balance
                </p>
                <p className={`${theme === 'dark' ? 'text-white' : 'text-black'} text-xl font-bold`}>
                  {formatPrice(walletBalance)}
                </p>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSave} className={`${theme === 'dark' ? 'bg-[#1a1a2e]' : 'bg-white'} p-6 rounded-2xl`}>
          <div className="flex items-center gap-4 mb-6">
            <div className="relative">
              <img 
                src={userProfile?.avatar || 'https://i.pravatar.cc/100'} 
                className="w-20 h-20 rounded-full object-cover"
                alt="Avatar"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="absolute bottom-0 right-0 bg-[#f5a623] text-black p-2 rounded-full hover:bg-[#e0941a] transition-colors disabled:opacity-50"
              >
                <Camera size={16} />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
              />
            </div>
            <div>
              <p className={`${theme === 'dark' ? 'text-white' : 'text-black'} font-semibold`}>
                {form.name || 'Add your name'}
              </p>
              <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} text-sm`}>
                {uploading ? 'Uploading...' : 'Click camera to change'}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} block mb-2`}>
                Full Name
              </label>
              <input 
                type="text" 
                value={form.name} 
                onChange={e => setForm({...form, name: e.target.value})}
                required
                className={`${theme === 'dark' ? 'bg-[#0f0f1a] text-white border-gray-700' : 'bg-gray-50 text-black border-gray-300'} w-full p-3 rounded-lg border outline-none focus:border-[#f5a623]`}
              />
            </div>
            
            <div>
              <label className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} block mb-2`}>
                Email
              </label>
              <input 
                type="email" 
                value={form.email} 
                disabled
                className={`${theme === 'dark' ? 'bg-[#0f0f1a] text-gray-500 border-gray-700' : 'bg-gray-100 text-gray-500 border-gray-300'} w-full p-3 rounded-lg border cursor-not-allowed`}
              />
            </div>

            <div>
              <label className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} block mb-2`}>
                Phone Number
              </label>
              <input 
                type="tel" 
                value={form.phone} 
                onChange={e => setForm({...form, phone: e.target.value})}
                placeholder="+1 234 567 8900"
                className={`${theme === 'dark' ? 'bg-[#0f0f1a] text-white border-gray-700' : 'bg-gray-50 text-black border-gray-300'} w-full p-3 rounded-lg border outline-none focus:border-[#f5a623]`}
              />
            </div>

            <div>
              <label className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} block mb-2`}>
                Bio
              </label>
              <textarea 
                value={form.bio} 
                onChange={e => setForm({...form, bio: e.target.value})}
                placeholder="Tell us about yourself"
                maxLength={200}
                className={`${theme === 'dark' ? 'bg-[#0f0f1a] text-white border-gray-700' : 'bg-gray-50 text-black border-gray-300'} w-full p-3 rounded-lg border outline-none h-24 focus:border-[#f5a623]`}
              />
              <p className={`${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'} text-xs mt-1`}>
                {form.bio.length}/200
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} block mb-2`}>
                  Country
                </label>
                <select 
                  value={form.country} 
                  onChange={e => handleCountryChange(e.target.value)}
                  className={`${theme === 'dark' ? 'bg-[#0f0f1a] text-white border-gray-700' : 'bg-gray-50 text-black border-gray-300'} w-full p-3 rounded-lg border outline-none focus:border-[#f5a623]`}
                >
                  {COUNTRIES.map(c => (
                    <option key={c.code} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} block mb-2`}>
                  Travel Style
                </label>
                <select 
                  value={form.travel_style} 
                  onChange={e => setForm({...form, travel_style: e.target.value})}
                  className={`${theme === 'dark' ? 'bg-[#0f0f1a] text-white border-gray-700' : 'bg-gray-50 text-black border-gray-300'} w-full p-3 rounded-lg border outline-none focus:border-[#f5a623]`}
                >
                  <option value="adventure">Adventure</option>
                  <option value="business">Business</option>
                  <option value="family">Family</option>
                  <option value="luxury">Luxury</option>
                  <option value="budget">Budget</option>
                  <option value="solo">Solo</option>
                </select>
              </div>
            </div>
          </div>

          {message && (
            <p className={`${message.includes('Failed') ? 'text-red-500' : 'text-green-500'} text-sm mt-4 text-center`}>
              {message}
            </p>
          )}

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-[#f5a623] text-black py-3 rounded-lg font-bold mt-6 hover:bg-[#e0941a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  )
}