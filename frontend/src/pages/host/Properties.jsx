import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, MoreVertical, Edit, Trash2, Eye } from 'lucide-react'
import api from '../../services/api'
import '../../styles/HostProperties.css'

export default function HostProperties() {
  const [properties, setProperties] = useState([])
  const [loading, setLoading] = useState(true)
  const [actionMenu, setActionMenu] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    fetchProperties()
  }, [])

  const fetchProperties = async () => {
    try {
      setLoading(true)
      const res = await api.get('/api/host/properties')
      setProperties(res.data)
    } catch (err) {
      console.error('Failed to load properties:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this property? This cannot be undone.')) return
    try {
      await api.delete(`/api/host/properties/${id}`)
      setProperties(properties.filter(p => p.id !== id))
      setActionMenu(null)
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete property')
    }
  }

  const toggleActionMenu = (id) => {
    setActionMenu(actionMenu === id ? null : id)
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
          <button 
            className="add-property-btn"
            onClick={() => navigate('/host/properties/new')}
          >
            <Plus size={18} />
            <span>Add Property</span>
          </button>
        </div>

        {properties.length === 0 ? (
          <div className="properties-empty">
            <div className="empty-icon">🏠</div>
            <h2>No properties yet</h2>
            <p>Start earning by listing your first property on BukStay</p>
            <button 
              className="empty-cta"
              onClick={() => navigate('/host/properties/new')}
            >
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
                  <span className={`property-status status-${property.status}`}>
                    {property.status}
                  </span>
                  <button 
                    className="property-menu-btn"
                    onClick={() => toggleActionMenu(property.id)}
                  >
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
                      <button 
                        className="delete"
                        onClick={() => handleDelete(property.id)}
                      >
                        <Trash2 size={16} />
                        <span>Delete</span>
                      </button>
                    </div>
                  )}
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
                      <p className="stat-value">₦{((property.total_earnings || 0) / 1000).toFixed(0)}k</p>
                    </div>
                    <div className="stat-box">
                      <p className="stat-label">Rating</p>
                      <p className="stat-value">{property.rating ? property.rating.toFixed(1) : '-'}</p>
                    </div>
                  </div>

                  <button 
                    className="manage-btn"
                    onClick={() => navigate(`/host/properties/edit/${property.id}`)}
                  >
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