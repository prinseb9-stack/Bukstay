import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage'
import { db, storage } from '../../lib/firebase'
import { Plus, Trash2, Upload, ArrowLeft, Loader2 } from 'lucide-react'

const AMENITIES_LIST = [
  'WiFi', 'Kitchen', 'Air Conditioning', 'Pool', 'Parking',
  'TV', 'Washer', 'Dryer', 'Heating', 'Workspace',
  'Gym', 'Hot Tub', 'Pet Friendly', 'Smoke Alarm', 'First Aid Kit'
]

const PROPERTY_TYPES = ['Apartment', 'House', 'Villa', 'Condo', 'Cabin', 'Hotel Room', 'Guesthouse']

export default function HostPropertyForm() {
  const { user } = useAuth()
  const { theme } = useTheme()
  const navigate = useNavigate()
  const { id } = useParams()
  const isEditing = Boolean(id)

  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(isEditing)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [uploadProgress, setUploadProgress] = useState({})

  const [form, setForm] = useState({
    title: '',
    description: '',
    propertyType: 'Apartment',
    bedrooms: 1,
    bathrooms: 1,
    maxGuests: 2,
    pricePerNight: 0,
    currency: 'USD',
    country: '',
    city: '',
    address: '',
    amenities: [],
    images: [],
    status: 'pending'
  })

  // Fetch existing property for editing
  useEffect(() => {
    if (!id || !user) return

    const fetchProperty = async () => {
      try {
        const snap = await getDoc(doc(db, 'properties', id))
        if (snap.exists() && snap.data().hostId === user.uid) {
          setForm({ ...form, ...snap.data() })
        } else {
          navigate('/host/properties')
        }
      } catch (err) {
        console.error(err)
      } finally {
        setFetching(false)
      }
    }

    fetchProperty()
  }, [id, user])

  const handleChange = (e) => {
    const { name, value, type } = e.target
    setForm(prev => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value
    }))
  }

  const handleAmenityToggle = (amenity) => {
    setForm(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }))
  }

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files)
    if (!files.length || !user) return

    const newImages = [...form.images]

    for (const file of files) {
      const storageRef = ref(storage, `properties/${user.uid}/${Date.now()}-${file.name}`)
      const uploadTask = uploadBytesResumable(storageRef, file)

      uploadTask.on('state_changed',
        (snapshot) => {
          setUploadProgress(prev => ({
            ...prev,
            [file.name]: (snapshot.bytesTransferred / snapshot.totalBytes) * 100
          }))
        },
        (err) => console.error(err),
        async () => {
          const url = await getDownloadURL(uploadTask.snapshot.ref)
          newImages.push(url)
          setForm(prev => ({ ...prev, images: newImages }))
          setUploadProgress(prev => {
            const updated = { ...prev }
            delete updated[file.name]
            return updated
          })
        }
      )
    }
  }

  const removeImage = (index) => {
    setForm(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!form.title || !form.city || !form.country || form.pricePerNight <= 0) {
      setError('Please fill in all required fields: Title, City, Country, and Price')
      return
    }

    setLoading(true)

    try {
      const propertyData = {
        ...form,
        hostId: user.uid,
        isActive: form.status === 'active',
        updatedAt: serverTimestamp(),
        ...(isEditing ? {} : { createdAt: serverTimestamp() })
      }

      if (isEditing) {
        await updateDoc(doc(db, 'properties', id), propertyData)
        setSuccess('Property updated successfully!')
      } else {
        await setDoc(doc(db, 'properties', `${user.uid}_${Date.now()}`), propertyData)
        setSuccess('Property listed successfully! Awaiting approval.')
      }

      setTimeout(() => navigate('/host/properties'), 1500)

    } catch (err) {
      console.error(err)
      setError('Failed to save property. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const isDark = theme === 'dark'

  if (fetching) {
    return (
      <div className={`${isDark ? 'bg-[#0f0f1a]' : 'bg-gray-50'} min-h-screen flex items-center justify-center`}>
        <Loader2 className="animate-spin text-[#f5a623]" size={32} />
      </div>
    )
  }

  return (
    <div className={`${isDark ? 'bg-[#0f0f1a]' : 'bg-gray-50'} min-h-screen p-6`}>
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => navigate('/host/properties')} className={`${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-black'}`}>
            <ArrowLeft size={24} />
          </button>
          <h1 className={`${isDark ? 'text-white' : 'text-black'} text-3xl font-bold`}>
            {isEditing ? 'Edit Property' : 'Add New Property'}
          </h1>
        </div>

        {error && (
          <div className="mb-6 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm">{error}</div>
        )}

        {success && (
          <div className="mb-6 p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-green-500 text-sm">{success}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className={`${isDark ? 'bg-[#1a1a2e]' : 'bg-white'} p-6 rounded-2xl space-y-4`}>
            <h2 className={`${isDark ? 'text-white' : 'text-black'} text-lg font-bold`}>Basic Information</h2>

            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Property Title *</label>
              <input type="text" name="title" value={form.title} onChange={handleChange} placeholder="Cozy Apartment with Ocean View"
                className={`w-full p-3 rounded-lg border outline-none ${isDark ? 'bg-[#0f0f1a] border-gray-700 text-white' : 'bg-gray-50 border-gray-300 text-black'} focus:border-[#f5a623]`} required />
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Description</label>
              <textarea name="description" value={form.description} onChange={handleChange} rows={4} placeholder="Describe your property..."
                className={`w-full p-3 rounded-lg border outline-none resize-none ${isDark ? 'bg-[#0f0f1a] border-gray-700 text-white' : 'bg-gray-50 border-gray-300 text-black'} focus:border-[#f5a623]`} />
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Property Type</label>
              <select name="propertyType" value={form.propertyType} onChange={handleChange}
                className={`w-full p-3 rounded-lg border outline-none ${isDark ? 'bg-[#0f0f1a] border-gray-700 text-white' : 'bg-gray-50 border-gray-300 text-black'} focus:border-[#f5a623]`}>
                {PROPERTY_TYPES.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Bedrooms</label>
                <input type="number" name="bedrooms" value={form.bedrooms} onChange={handleChange} min={0}
                  className={`w-full p-3 rounded-lg border outline-none ${isDark ? 'bg-[#0f0f1a] border-gray-700 text-white' : 'bg-gray-50 border-gray-300 text-black'} focus:border-[#f5a623]`} />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Bathrooms</label>
                <input type="number" name="bathrooms" value={form.bathrooms} onChange={handleChange} min={0}
                  className={`w-full p-3 rounded-lg border outline-none ${isDark ? 'bg-[#0f0f1a] border-gray-700 text-white' : 'bg-gray-50 border-gray-300 text-black'} focus:border-[#f5a623]`} />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Max Guests</label>
                <input type="number" name="maxGuests" value={form.maxGuests} onChange={handleChange} min={1}
                  className={`w-full p-3 rounded-lg border outline-none ${isDark ? 'bg-[#0f0f1a] border-gray-700 text-white' : 'bg-gray-50 border-gray-300 text-black'} focus:border-[#f5a623]`} />
              </div>
            </div>
          </div>

          {/* Location */}
          <div className={`${isDark ? 'bg-[#1a1a2e]' : 'bg-white'} p-6 rounded-2xl space-y-4`}>
            <h2 className={`${isDark ? 'text-white' : 'text-black'} text-lg font-bold`}>Location</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Country *</label>
                <input type="text" name="country" value={form.country} onChange={handleChange} placeholder="Nigeria"
                  className={`w-full p-3 rounded-lg border outline-none ${isDark ? 'bg-[#0f0f1a] border-gray-700 text-white' : 'bg-gray-50 border-gray-300 text-black'} focus:border-[#f5a623]`} required />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>City *</label>
                <input type="text" name="city" value={form.city} onChange={handleChange} placeholder="Lagos"
                  className={`w-full p-3 rounded-lg border outline-none ${isDark ? 'bg-[#0f0f1a] border-gray-700 text-white' : 'bg-gray-50 border-gray-300 text-black'} focus:border-[#f5a623]`} required />
              </div>
            </div>
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Address</label>
              <input type="text" name="address" value={form.address} onChange={handleChange} placeholder="123 Main Street"
                className={`w-full p-3 rounded-lg border outline-none ${isDark ? 'bg-[#0f0f1a] border-gray-700 text-white' : 'bg-gray-50 border-gray-300 text-black'} focus:border-[#f5a623]`} />
            </div>
          </div>

          {/* Pricing */}
          <div className={`${isDark ? 'bg-[#1a1a2e]' : 'bg-white'} p-6 rounded-2xl space-y-4`}>
            <h2 className={`${isDark ? 'text-white' : 'text-black'} text-lg font-bold`}>Pricing</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Price per Night *</label>
                <input type="number" name="pricePerNight" value={form.pricePerNight} onChange={handleChange} min={0} placeholder="50"
                  className={`w-full p-3 rounded-lg border outline-none ${isDark ? 'bg-[#0f0f1a] border-gray-700 text-white' : 'bg-gray-50 border-gray-300 text-black'} focus:border-[#f5a623]`} required />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Currency</label>
                <select name="currency" value={form.currency} onChange={handleChange}
                  className={`w-full p-3 rounded-lg border outline-none ${isDark ? 'bg-[#0f0f1a] border-gray-700 text-white' : 'bg-gray-50 border-gray-300 text-black'} focus:border-[#f5a623]`}>
                  <option value="USD">USD ($)</option>
                  <option value="NGN">NGN (₦)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="GHS">GHS (₵)</option>
                  <option value="KES">KES (KSh)</option>
                  <option value="ZAR">ZAR (R)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Amenities */}
          <div className={`${isDark ? 'bg-[#1a1a2e]' : 'bg-white'} p-6 rounded-2xl space-y-4`}>
            <h2 className={`${isDark ? 'text-white' : 'text-black'} text-lg font-bold`}>Amenities</h2>
            <div className="flex flex-wrap gap-2">
              {AMENITIES_LIST.map(amenity => (
                <button
                  key={amenity}
                  type="button"
                  onClick={() => handleAmenityToggle(amenity)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    form.amenities.includes(amenity)
                      ? 'bg-[#f5a623] text-black'
                      : isDark
                      ? 'bg-[#0f0f1a] text-gray-300 border border-gray-700'
                      : 'bg-gray-100 text-gray-700 border border-gray-200'
                  }`}
                >
                  {amenity}
                </button>
              ))}
            </div>
          </div>

          {/* Images */}
          <div className={`${isDark ? 'bg-[#1a1a2e]' : 'bg-white'} p-6 rounded-2xl space-y-4`}>
            <h2 className={`${isDark ? 'text-white' : 'text-black'} text-lg font-bold`}>Images</h2>

            {form.images.length > 0 && (
              <div className="grid grid-cols-3 gap-3">
                {form.images.map((img, index) => (
                  <div key={index} className="relative group">
                    <img src={img} alt={`Property ${index + 1}`} className="w-full h-24 object-cover rounded-lg" />
                    <button type="button" onClick={() => removeImage(index)}
                      className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <label className={`flex items-center justify-center gap-2 p-6 border-2 border-dashed rounded-xl cursor-pointer transition-colors ${isDark ? 'border-gray-700 text-gray-400 hover:border-gray-500' : 'border-gray-300 text-gray-500 hover:border-gray-400'}`}>
              <Upload size={20} />
              <span>Upload Images</span>
              <input type="file" multiple accept="image/*" onChange={handleImageUpload} className="hidden" />
            </label>

            {Object.keys(uploadProgress).length > 0 && (
              <div className="space-y-2">
                {Object.entries(uploadProgress).map(([name, progress]) => (
                  <div key={name} className="flex items-center gap-3">
                    <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'} w-32 truncate`}>{name}</span>
                    <div className="flex-1 h-2 bg-gray-700 rounded-full">
                      <div className="h-2 bg-[#f5a623] rounded-full transition-all" style={{ width: `${progress}%` }} />
                    </div>
                    <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{Math.round(progress)}%</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submit */}
          <button type="submit" disabled={loading}
            className="w-full bg-[#f5a623] text-black py-4 rounded-xl font-bold text-lg hover:bg-[#e0941a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
            {loading ? (
              <><Loader2 className="animate-spin" size={20} />Saving...</>
            ) : isEditing ? (
              'Update Property'
            ) : (
              <><Plus size={20} />List Property</>
            )}
          </button>
        </form>
      </div>
    </div>
  )
}