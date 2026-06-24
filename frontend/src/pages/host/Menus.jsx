import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'
import { useGeoCurrency } from '../../hooks/useGeo'
import { collection, query, where, getDocs, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore'
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage'
import { db, storage } from '../../lib/firebase'
import { Plus, Edit, Trash2, Upload, Loader2, UtensilsCrossed } from 'lucide-react'

const CATEGORIES = ['Main Course', 'Appetizer', 'Dessert', 'Drinks', 'Snacks', 'Breakfast']
const SPICE_LEVELS = [
  { value: 0, label: 'None' },
  { value: 1, label: 'Mild 🌶️' },
  { value: 2, label: 'Medium 🌶️🌶️' },
  { value: 3, label: 'Hot 🌶️🌶️🌶️' },
  { value: 4, label: 'Extra Hot 🌶️🌶️🌶️🌶️' }
]

export default function HostMenus() {
  const { user } = useAuth()
  const { theme } = useTheme()
  const { formatPrice } = useGeoCurrency()
  const isDark = theme === 'dark'

  const [menus, setMenus] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  const [form, setForm] = useState({
    name: '',
    description: '',
    category: 'Main Course',
    price: 0,
    currency: 'USD',
    spiceLevel: 0,
    preparationTime: 20,
    isVegetarian: false,
    isAvailable: true,
    images: []
  })

  useEffect(() => {
    if (!user) return
    fetchMenus()
  }, [user])

  const fetchMenus = async () => {
    try {
      const snap = await getDocs(query(collection(db, 'foodMenus'), where('hostId', '==', user.uid)))
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }))
      setMenus(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setForm({
      name: '', description: '', category: 'Main Course', price: 0,
      currency: 'USD', spiceLevel: 0, preparationTime: 20,
      isVegetarian: false, isAvailable: true, images: []
    })
    setEditing(null)
    setShowForm(false)
  }

  const handleEdit = (item) => {
    setForm({
      name: item.name || '',
      description: item.description || '',
      category: item.category || 'Main Course',
      price: item.price || 0,
      currency: item.currency || 'USD',
      spiceLevel: item.spiceLevel || 0,
      preparationTime: item.preparationTime || 20,
      isVegetarian: item.isVegetarian || false,
      isAvailable: item.isAvailable !== false,
      images: item.images || []
    })
    setEditing(item.id)
    setShowForm(true)
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : type === 'number' ? Number(value) : value
    }))
  }

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files)
    if (!files.length || !user) return

    for (const file of files) {
      const storageRef = ref(storage, `foodMenus/${user.uid}/${Date.now()}-${file.name}`)
      const uploadTask = uploadBytesResumable(storageRef, file)
      
      uploadTask.on('state_changed', null, console.error, async () => {
        const url = await getDownloadURL(uploadTask.snapshot.ref)
        setForm(prev => ({ ...prev, images: [...prev.images, url] }))
      })
    }
  }

  const removeImage = (index) => {
    setForm(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== index) }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name || form.price <= 0) {
      setMessage('Name and price are required')
      return
    }

    setSaving(true)
    setMessage('')

    try {
      const data = {
        ...form,
        hostId: user.uid,
        status: 'active',
        updatedAt: serverTimestamp()
      }

      if (editing) {
        await updateDoc(doc(db, 'foodMenus', editing), data)
        setMessage('Menu item updated!')
      } else {
        await addDoc(collection(db, 'foodMenus'), {
          ...data,
          createdAt: serverTimestamp()
        })
        setMessage('Menu item added!')
      }

      await fetchMenus()
      resetForm()
    } catch (err) {
      console.error(err)
      setMessage('Failed to save')
    } finally {
      setSaving(false)
      setTimeout(() => setMessage(''), 3000)
    }
  }

  const handleDelete = async (id, name) => {
    if (!confirm(`Delete "${name}"?`)) return
    try {
      await deleteDoc(doc(db, 'foodMenus', id))
      setMenus(prev => prev.filter(m => m.id !== id))
    } catch (err) {
      console.error(err)
    }
  }

  if (loading) {
    return (
      <div className={`${isDark ? 'bg-[#0f0f1a]' : 'bg-gray-50'} min-h-screen flex items-center justify-center`}>
        <Loader2 className="animate-spin text-[#f5a623]" size={32} />
      </div>
    )
  }

  return (
    <div className={`${isDark ? 'bg-[#0f0f1a]' : 'bg-gray-50'} min-h-screen p-6`}>
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className={`${isDark ? 'text-white' : 'text-black'} text-3xl font-bold`}>Food Menus</h1>
            <p className={`${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Manage your food and drink offerings</p>
          </div>
          <button
            onClick={() => { resetForm(); setShowForm(!showForm) }}
            className="flex items-center gap-2 bg-[#f5a623] text-black px-4 py-3 rounded-xl font-bold hover:bg-[#e0941a]"
          >
            <Plus size={18} />
            {showForm ? 'Cancel' : 'Add Item'}
          </button>
        </div>

        {message && (
          <div className={`mb-4 p-3 rounded-lg text-sm ${message.includes('Failed') ? 'bg-red-500/10 text-red-500' : 'bg-green-500/10 text-green-500'}`}>
            {message}
          </div>
        )}

        {/* Add/Edit Form */}
        {showForm && (
          <div className={`${isDark ? 'bg-[#1a1a2e]' : 'bg-white'} p-6 rounded-2xl mb-6 space-y-4`}>
            <h2 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-black'}`}>
              {editing ? 'Edit Item' : 'Add New Item'}
            </h2>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm mb-1 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Name *</label>
                <input type="text" name="name" value={form.name} onChange={handleChange}
                  className={`w-full p-3 rounded-lg border ${isDark ? 'bg-[#0f0f1a] border-gray-700 text-white' : 'bg-gray-50 border-gray-300'} focus:border-[#f5a623] outline-none`} />
              </div>
              <div>
                <label className={`block text-sm mb-1 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Category</label>
                <select name="category" value={form.category} onChange={handleChange}
                  className={`w-full p-3 rounded-lg border ${isDark ? 'bg-[#0f0f1a] border-gray-700 text-white' : 'bg-gray-50 border-gray-300'} focus:border-[#f5a623] outline-none`}>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className={`block text-sm mb-1 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Description</label>
              <textarea name="description" value={form.description} onChange={handleChange} rows={2}
                className={`w-full p-3 rounded-lg border resize-none ${isDark ? 'bg-[#0f0f1a] border-gray-700 text-white' : 'bg-gray-50 border-gray-300'} focus:border-[#f5a623] outline-none`} />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className={`block text-sm mb-1 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Price *</label>
                <input type="number" name="price" value={form.price} onChange={handleChange} min={0}
                  className={`w-full p-3 rounded-lg border ${isDark ? 'bg-[#0f0f1a] border-gray-700 text-white' : 'bg-gray-50 border-gray-300'} focus:border-[#f5a623] outline-none`} />
              </div>
              <div>
                <label className={`block text-sm mb-1 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Prep Time (min)</label>
                <input type="number" name="preparationTime" value={form.preparationTime} onChange={handleChange} min={5}
                  className={`w-full p-3 rounded-lg border ${isDark ? 'bg-[#0f0f1a] border-gray-700 text-white' : 'bg-gray-50 border-gray-300'} focus:border-[#f5a623] outline-none`} />
              </div>
              <div>
                <label className={`block text-sm mb-1 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Spice Level</label>
                <select name="spiceLevel" value={form.spiceLevel} onChange={handleChange}
                  className={`w-full p-3 rounded-lg border ${isDark ? 'bg-[#0f0f1a] border-gray-700 text-white' : 'bg-gray-50 border-gray-300'} focus:border-[#f5a623] outline-none`}>
                  {SPICE_LEVELS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              </div>
            </div>

            <div className="flex gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" name="isVegetarian" checked={form.isVegetarian} onChange={handleChange} className="accent-[#f5a623]" />
                <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Vegetarian</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" name="isAvailable" checked={form.isAvailable} onChange={handleChange} className="accent-[#f5a623]" />
                <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Available</span>
              </label>
            </div>

            {/* Images */}
            <div>
              <label className={`block text-sm mb-1 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Images</label>
              {form.images.length > 0 && (
                <div className="flex gap-2 mb-2 flex-wrap">
                  {form.images.map((img, i) => (
                    <div key={i} className="relative">
                      <img src={img} alt="" className="w-16 h-16 object-cover rounded-lg" />
                      <button onClick={() => removeImage(i)} className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 text-xs">x</button>
                    </div>
                  ))}
                </div>
              )}
              <label className={`flex items-center gap-2 p-3 border-2 border-dashed rounded-lg cursor-pointer ${isDark ? 'border-gray-700 text-gray-400' : 'border-gray-300 text-gray-500'}`}>
                <Upload size={16} /> Upload
                <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
              </label>
            </div>

            <button onClick={handleSubmit} disabled={saving}
              className="w-full bg-[#f5a623] text-black py-3 rounded-xl font-bold hover:bg-[#e0941a] disabled:opacity-50">
              {saving ? 'Saving...' : editing ? 'Update Item' : 'Add Item'}
            </button>
          </div>
        )}

        {/* Menu List */}
        {menus.length === 0 && !showForm ? (
          <div className={`${isDark ? 'bg-[#1a1a2e]' : 'bg-white'} p-12 rounded-2xl text-center`}>
            <UtensilsCrossed size={48} className={`mx-auto mb-4 ${isDark ? 'text-gray-600' : 'text-gray-300'}`} />
            <h2 className={`text-lg font-bold mb-2 ${isDark ? 'text-white' : 'text-black'}`}>No menu items yet</h2>
            <p className={`${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Add your first food or drink item</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {menus.map(item => (
              <div key={item.id} className={`${isDark ? 'bg-[#1a1a2e]' : 'bg-white'} p-4 rounded-2xl`}>
                <div className="flex gap-3">
                  <img src={item.images?.[0] || 'https://via.placeholder.com/80'} alt={item.name} className="w-20 h-20 object-cover rounded-xl" />
                  <div className="flex-1">
                    <h3 className={`font-bold ${isDark ? 'text-white' : 'text-black'}`}>{item.name}</h3>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{item.category}</p>
                    <p className="text-[#f5a623] font-bold mt-1">{formatPrice(item.price)}</p>
                  </div>
                </div>
                <div className="flex gap-2 mt-3">
                  <button onClick={() => handleEdit(item)}
                    className={`flex-1 py-2 rounded-lg text-sm ${isDark ? 'bg-[#0f0f1a] text-gray-300' : 'bg-gray-100'}`}>
                    <Edit size={14} className="inline mr-1" /> Edit
                  </button>
                  <button onClick={() => handleDelete(item.id, item.name)}
                    className={`flex-1 py-2 rounded-lg text-sm text-red-500 ${isDark ? 'bg-[#0f0f1a]' : 'bg-gray-100'}`}>
                    <Trash2 size={14} className="inline mr-1" /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}