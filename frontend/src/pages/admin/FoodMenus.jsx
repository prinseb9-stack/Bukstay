import { useState, useEffect } from 'react'
import { collection, getDocs, query, updateDoc, doc, serverTimestamp } from 'firebase/firestore'
import { db } from '../../lib/firebase'
import { useGeoCurrency } from '../../hooks/useGeo'

export default function AdminFoodMenus() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const { formatPrice } = useGeoCurrency()

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const snap = await getDocs(collection(db, 'foodMenus'))
        const data = snap.docs.map(d => ({ id: d.id, ...d.data() }))
        data.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0))
        setItems(data)
      } catch (err) {
        console.error('Admin food fetch error:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchItems()
  }, [])

  const toggleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'paused' : 'active'
    await updateDoc(doc(db, 'foodMenus', id), { status: newStatus, updatedAt: serverTimestamp() })
    setItems(prev => prev.map(i => i.id === id ? { ...i, status: newStatus } : i))
  }

  return (
    <div style={{ padding: 30 }}>
      <h1 style={{ fontSize: 28, fontWeight: 'bold', marginBottom: 20 }}>Food & Menus</h1>
      
      {loading ? (
        <p>Loading...</p>
      ) : items.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 60, background: '#1a1a2e', borderRadius: 16 }}>
          <h2 style={{ marginBottom: 8 }}>No food items yet</h2>
          <p style={{ color: '#888' }}>Hosts haven't added any menu items.</p>
        </div>
      ) : (
        <div className="table-card">
          <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th>Item</th>
                <th>Host</th>
                <th>Category</th>
                <th>Price</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map(item => (
                <tr key={item.id}>
                  <td>
                    <div>
                      <p style={{ fontWeight: 'bold' }}>{item.name}</p>
                      <p style={{ fontSize: 13, color: '#888' }}>{item.description?.slice(0, 40)}</p>
                    </div>
                  </td>
                  <td>{item.hostId?.slice(0, 8)}</td>
                  <td>{item.category}</td>
                  <td style={{ fontWeight: 'bold' }}>{formatPrice(item.price)}</td>
                  <td>
                    <span style={{
                      padding: '4px 12px',
                      borderRadius: 20,
                      fontSize: 12,
                      background: item.status === 'active' ? '#10b98120' : '#f59e0b20',
                      color: item.status === 'active' ? '#10b981' : '#f59e0b'
                    }}>
                      {item.status}
                    </span>
                  </td>
                  <td>
                    <button
                      onClick={() => toggleStatus(item.id, item.status)}
                      style={{
                        padding: '6px 14px',
                        borderRadius: 8,
                        border: 'none',
                        cursor: 'pointer',
                        background: item.status === 'active' ? '#ef444420' : '#10b98120',
                        color: item.status === 'active' ? '#ef4444' : '#10b981'
                      }}
                    >
                      {item.status === 'active' ? 'Pause' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}