import { useState, useEffect } from 'react'
import { collection, getDocs, query, where, updateDoc, doc } from 'firebase/firestore'
import { db } from '../../lib/firebase'
import { useGeoCurrency } from '../../hooks/useGeo'
import '../../styles/AdminProperties.css'

export default function AdminProperties() {
  const [properties, setProperties] = useState([])
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { formatPrice } = useGeoCurrency()

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        setLoading(true)
        setError(null)
        
        let q = query(collection(db, 'properties'))
        
        if (filter !== 'all') {
          const statusFilter = filter === 'approved' ? 'active' : filter
          q = query(collection(db, 'properties'), where('status', '==', statusFilter))
        }

        const snap = await getDocs(q)
        let propsData = snap.docs.map(d => ({ id: d.id, ...d.data() }))
        
        propsData.sort((a, b) => {
          const aTime = a.createdAt?.seconds || new Date(a.createdAt).getTime() || 0
          const bTime = b.createdAt?.seconds || new Date(b.createdAt).getTime() || 0
          return bTime - aTime
        })
        
        setProperties(propsData)
      } catch (err) {
        setError('Failed to load properties')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchProperties()
  }, [filter])

  const handleStatusUpdate = async (id, status) => {
    try {
      const newStatus = status === 'approved' ? 'active' : status
      
      await updateDoc(doc(db, 'properties', id), { 
        status: newStatus,
        updatedAt: new Date(),
        ...(newStatus === 'active' && { approvedAt: new Date() }),
        ...(newStatus === 'rejected' && { rejectedAt: new Date() })
      })
      // Refresh
      const snap = await getDocs(query(collection(db, 'properties')))
      let propsData = snap.docs.map(d => ({ id: d.id, ...d.data() }))
      propsData.sort((a, b) => {
        const aTime = a.createdAt?.seconds || new Date(a.createdAt).getTime() || 0
        const bTime = b.createdAt?.seconds || new Date(b.createdAt).getTime() || 0
        return bTime - aTime
      })
      setProperties(propsData)
    } catch (err) {
      alert('Failed to update status')
      console.error(err)
    }
  }

  const displayStatus = (status) => status === 'active' ? 'approved' : status

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
                className={`filter-tab ${filter === s ? 'active' : ''}`}
              >
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="table-card">
          {loading ? (
            <div className="table-loader">Loading properties...</div>
          ) : error ? (
            <div className="table-error">
              <p>{error}</p>
              <button onClick={() => setFilter(filter)}>Retry</button>
            </div>
          ) : properties.length === 0 ? (
            <div className="table-empty"><p>No properties found</p></div>
          ) : (
            <div className="table-scroll">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Property</th>
                    <th>Host</th>
                    <th>Price/Night</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {properties.map(prop => (
                    <tr key={prop.id}>
                      <td>
                        <div className="cell-stack">
                          <p className="cell-primary">{prop.title || prop.name}</p>
                          <p className="cell-secondary">{prop.city || prop.location}</p>
                        </div>
                      </td>
                      <td className="cell-text">{prop.hostName || prop.host_name || prop.hostId}</td>
                      <td className="cell-primary cell-bold">
                        {formatPrice(prop.pricePerNight || prop.price || 0)}
                      </td>
                      <td>
                        <span className={`status-badge ${prop.status}`}>
                          {displayStatus(prop.status)}
                        </span>
                      </td>
                      <td>
                        <div className="action-buttons">
                          {prop.status !== 'active' && (
                            <button className="action-link approve" onClick={() => handleStatusUpdate(prop.id, 'approved')}>
                              Approve
                            </button>
                          )}
                          {prop.status !== 'rejected' && (
                            <button className="action-link reject" onClick={() => handleStatusUpdate(prop.id, 'rejected')}>
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