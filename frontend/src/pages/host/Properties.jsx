import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'
import { useGeoCurrency } from '../../hooks/useGeo'
import { collection, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore'
import { db } from '../../lib/firebase'
import { Plus, MoreVertical, Edit, Trash2, Eye } from 'lucide-react'
import '../../styles/HostProperties.css'

export default function HostProperties() {
  const { user } = useAuth()
  const { theme } = useTheme()
  const { formatPrice } = useGeoCurrency()
  const navigate = useNavigate()
  
  const [properties, setProperties] = useState([])
  const [loading, setLoading] = useState(true)
  const [actionMenu, setActionMenu] = useState(null)
  const menuRef = useRef(null)

  useEffect(() => {
    const fetchProperties = async () => {
      if (!user) return
      
      try {
        setLoading(true)
        
        const propsQuery = query(
          collection(db, 'properties'),
          where('hostId', '==', user.uid)
        )
        const propsSnap = await getDocs(propsQuery)
        const props = propsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }))

        const bookingsQuery = query(
          collection(db, 'bookings'),
          where('hostId', '==', user.uid)
        )
        const bookingsSnap = await getDocs(bookingsQuery)
        const bookings = bookingsSnap.docs.map(doc => doc.data())

        const propsWithStats = props.map(prop => {
          const propBookings = bookings.filter(b => b.propertyId === prop.id)
          const total_earnings = propBookings
            .filter(b => b.status === 'completed' || b.status === 'confirmed')
            .reduce((sum, b) => sum + (b.totalPrice || 0), 0)
          
          return {
            ...prop,
            bookings_count: propBookings.length,
            total_earnings
          }
        })

        setProperties(propsWithStats)
      } catch (err) {
        console.error('Failed to load properties:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchProperties()
  }, [user])

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setActionMenu(null)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleDelete = async (id, title) => {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return
    
    try {
      await deleteDoc(doc(db, 'properties', id))
      setProperties(properties.filter(p => p.id !== id))
      setActionMenu(null)
    } catch (err) {
      alert('Failed to delete property. Make sure it has no active bookings.')
    }
  }

  const toggleActionMenu = (id) => {
    setActionMenu(actionMenu === id ? null : id)
  }

  const getStatusColor = (status) => {
    const colors = { active: 'bg-green-500', pending: 'bg-yellow-500', paused: 'bg-gray-500', draft: 'bg-blue-500' }
    return colors[status] || 'bg-gray-500'
  }

  if (loading) {
    return (
      <div className="host-properties-container">
        <div className="host-properties-loader">
          <div className="spinner"></div>
          <p>Loading properties...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="host-properties-container">
      <div className="host-properties-wrapper">
        <div className="properties-header">
          <h1 className="properties-title">Your Properties</h1>
          <button className="add-property-btn" onClick={() => navigate('/host/properties/new')}>
            <Plus size={18} />
            <span>Add Property</span>
          </button>
        </div>

        {properties.length === 0 ? (
          <div className="properties-empty">
            <div className="empty-icon">🏠</div>
            <h2>No properties yet</h2>
            <p>Start earning by listing your first property on BukStay</p>
            <button className="empty-cta" onClick={() => navigate('/host/properties/new')}>
              Create your first listing
            </button>
          </div>
        ) : (
          <div className="properties-grid">
            {properties.map((property) => (
              <div key={property.id} className="property-card">
                <div className="property-image-wrapper">
                  <img 
                    src={property.images?.[0] || 'https://placehold.co/400x300'} 
                    alt={property.title}
                    className="property-image"
                  />
                  <span className={`property-status ${getStatusColor(property.status)}`}>
                    {property.status || 'active'}
                  </span>
                  
                  <div ref={actionMenu === property.id ? menuRef : null}>
                    <button className="property-menu-btn" onClick={() => toggleActionMenu(property.id)}>
                      <MoreVertical size={18} />
                    </button>
                    
                    {actionMenu === property.id && (
                      <div className="property-menu">
                        <button onClick={() => navigate(`/stays/${property.id}`)}>
                          <Eye size={16} />
                          <span>View</span>
                        </button>
                        <button onClick={() => navigate(`/host/properties/edit/${property.id}`)}>
                          <Edit size={16} />
                          <span>Edit</span>
                        </button>
                        <button className="delete" onClick={() => handleDelete(property.id, property.title)}>
                          <Trash2 size={16} />
                          <span>Delete</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="property-content">
                  <div className="property-info">
                    <h3 className="property-name">{property.title}</h3>
                    <p className="property-location">{property.city}, {property.country}</p>
                  </div>

                  <div className="property-stats">
                    <div className="stat-box">
                      <p className="stat-label">Bookings</p>
                      <p className="stat-value">{property.bookings_count || 0}</p>
                    </div>
                    <div className="stat-box">
                      <p className="stat-label">Earned</p>
                      <p className="stat-value">{formatPrice(property.total_earnings || 0)}</p>
                    </div>
                    <div className="stat-box">
                      <p className="stat-label">Rating</p>
                      <p className="stat-value">{property.rating ? property.rating.toFixed(1) : '-'}</p>
                    </div>
                  </div>

                  <button className="manage-btn" onClick={() => navigate(`/host/properties/edit/${property.id}`)}>
                    Manage Listing
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