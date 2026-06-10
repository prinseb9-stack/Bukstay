import { useState, useEffect } from 'react'
import api from '../../services/api'
import '../../styles/AdminProperties.css'

export default function AdminProperties() {
  const [properties, setProperties] = useState([])
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchProperties()
  }, [filter])

  const fetchProperties = async () => {
    try {
      setLoading(true)
      setError(null)
      const params = filter!== 'all'? `?status=${filter}` : ''
      const res = await api.get(`/api/admin/properties${params}`)
      setProperties(res.data)
    } catch (err) {
      setError('Failed to load properties')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async (id, status) => {
    try {
      await api.patch(`/api/admin/properties/${id}`, { status })
      fetchProperties() // Refresh list
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update status')
    }
  }

  const filtered = properties

  return (
    <div className="admin-container">
      <div className="admin-wrapper">
        <div className="page-header">
          <h1 className="admin-title">Properties Management</h1>
          <div className="filter-tabs">
            {['all', 'pending', 'approved', 'rejected'].map(s => (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={`filter-tab ${filter === s? 'active' : ''}`}
              >
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="table-card">
          {loading? (
            <div className="table-loader">Loading properties...</div>
          ) : error? (
            <div className="table-error">
              <p>{error}</p>
              <button onClick={fetchProperties}>Retry</button>
            </div>
          ) : filtered.length === 0? (
            <div className="table-empty">
              <p>No properties found</p>
            </div>
          ) : (
            <div className="table-scroll">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Property</th>
                    <th>Host</th>
                    <th>Price/Night</th>
                    <th>Status</th>
                    <th>Bookings</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(prop => (
                    <tr key={prop.id}>
                      <td>
                        <div className="cell-stack">
                          <p className="cell-primary">{prop.title}</p>
                          <p className="cell-secondary">{prop.city}</p>
                        </div>
                      </td>
                      <td className="cell-text">{prop.host_name || prop.host}</td>
                      <td className="cell-primary cell-bold">₦{prop.price?.toLocaleString()}</td>
                      <td>
                        <span className={`status-badge ${prop.status}`}>
                          {prop.status}
                        </span>
                      </td>
                      <td className="cell-text">{prop.booking_count || prop.bookings || 0}</td>
                      <td>
                        <div className="action-buttons">
                          {prop.status!== 'approved' && (
                            <button
                              className="action-link approve"
                              onClick={() => handleStatusUpdate(prop.id, 'approved')}
                            >
                              Approve
                            </button>
                          )}
                          {prop.status!== 'rejected' && (
                            <button
                              className="action-link reject"
                              onClick={() => handleStatusUpdate(prop.id, 'rejected')}
                            >
                              Reject
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}