import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'
import { useState } from 'react'

export default function TravelerProfile() {
  const { user, updateUser } = useAuth()
  const { theme } = useTheme()
  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    bio: user?.bio || '',
    country: user?.country || 'Nigeria',
    travel_style: user?.travel_style || 'adventure'
  })

  const handleSave = (e) => {
    e.preventDefault()
    updateUser(form)
    alert('Profile updated')
  }

  return (
    <div className={`${theme === 'dark'? 'bg-[#0f0f1a]' : 'bg-gray-50'} min-h-screen p-6`}>
      <div className="max-w-2xl mx-auto">
        <h1 className={`${theme === 'dark'? 'text-white' : 'text-black'} text-3xl font-bold mb-8`}>Your Profile</h1>
        
        <form onSubmit={handleSave} className={`${theme === 'dark'? 'bg-[#1a1a2e]' : 'bg-white'} p-6 rounded-2xl`}>
          <div className="flex items-center gap-4 mb-6">
            <img src={user?.avatar || 'https://i.pravatar.cc/100'} className="w-20 h-20 rounded-full" />
            <button type="button" className="text-[#f5a623] font-bold">Change Photo</button>
          </div>

          <div className="space-y-4">
            <div>
              <label className={`${theme === 'dark'? 'text-gray-300' : 'text-gray-700'} block mb-2`}>Full Name</label>
              <input 
                type="text" 
                value={form.name} 
                onChange={e => setForm({...form, name: e.target.value})}
                className={`${theme === 'dark'? 'bg-[#0f0f1a] text-white border-gray-700' : 'bg-gray-50 text-black border-gray-300'} w-full p-3 rounded-lg border outline-none`}
              />
            </div>
            
            <div>
              <label className={`${theme === 'dark'? 'text-gray-300' : 'text-gray-700'} block mb-2`}>Email</label>
              <input 
                type="email" 
                value={form.email} 
                disabled
                className={`${theme === 'dark'? 'bg-[#0f0f1a] text-gray-500 border-gray-700' : 'bg-gray-100 text-gray-500 border-gray-300'} w-full p-3 rounded-lg border`}
              />
            </div>

            <div>
              <label className={`${theme === 'dark'? 'text-gray-300' : 'text-gray-700'} block mb-2`}>Bio</label>
              <textarea 
                value={form.bio} 
                onChange={e => setForm({...form, bio: e.target.value})}
                placeholder="Tell us about yourself"
                className={`${theme === 'dark'? 'bg-[#0f0f1a] text-white border-gray-700' : 'bg-gray-50 text-black border-gray-300'} w-full p-3 rounded-lg border outline-none h-24`}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={`${theme === 'dark'? 'text-gray-300' : 'text-gray-700'} block mb-2`}>Country</label>
                <select 
                  value={form.country} 
                  onChange={e => setForm({...form, country: e.target.value})}
                  className={`${theme === 'dark'? 'bg-[#0f0f1a] text-white border-gray-700' : 'bg-gray-50 text-black border-gray-300'} w-full p-3 rounded-lg border outline-none`}
                >
                  <option>Nigeria</option>
                  <option>Ghana</option>
                  <option>Kenya</option>
                  <option>South Africa</option>
                </select>
              </div>
              
              <div>
                <label className={`${theme === 'dark'? 'text-gray-300' : 'text-gray-700'} block mb-2`}>Travel Style</label>
                <select 
                  value={form.travel_style} 
                  onChange={e => setForm({...form, travel_style: e.target.value})}
                  className={`${theme === 'dark'? 'bg-[#0f0f1a] text-white border-gray-700' : 'bg-gray-50 text-black border-gray-300'} w-full p-3 rounded-lg border outline-none`}
                >
                  <option value="adventure">Adventure</option>
                  <option value="business">Business</option>
                  <option value="family">Family</option>
                  <option value="luxury">Luxury</option>
                </select>
              </div>
            </div>
          </div>

          <button type="submit" className="w-full bg-[#f5a623] text-black py-3 rounded-lg font-bold mt-6">
            Save Changes
          </button>
        </form>
      </div>
    </div>
  )
}