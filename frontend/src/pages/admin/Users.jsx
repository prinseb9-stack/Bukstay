import { useState, useEffect } from 'react'
import { collection, getDocs, query, updateDoc, doc, serverTimestamp } from 'firebase/firestore'
import { db } from '../../lib/firebase'
import '../../styles/AdminUsers.css'

export default function AdminUsers() {
  const [users, setUsers] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const q = query(collection(db, 'users'))
        const snap = await getDocs(q)
        let usersData = snap.docs.map(d => ({ id: d.id, ...d.data() }))

        usersData.sort((a, b) => {
          const aTime = a.createdAt?.seconds || new Date(a.createdAt).getTime() || 0
          const bTime = b.createdAt?.seconds || new Date(b.createdAt).getTime() || 0
          return bTime - aTime
        })

        if (search) {
          const searchLower = search.toLowerCase()
          usersData = usersData.filter(u => 
            u.fullName?.toLowerCase().includes(searchLower) ||
            u.name?.toLowerCase().includes(searchLower) ||
            u.email?.toLowerCase().includes(searchLower) ||
            u.phone?.includes(search)
          )
        }

        setUsers(usersData)
      } catch (err) {
        setError('Failed to load users')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchUsers()
  }, [search])

  const handleStatusToggle = async (id, currentStatus) => {
    try {
      const newStatus = currentStatus === 'active' ? 'suspended' : 'active'
      await updateDoc(doc(db, 'users', id), { 
        status: newStatus,
        updatedAt: serverTimestamp()
      })
      // Refresh
      const snap = await getDocs(query(collection(db, 'users')))
      let usersData = snap.docs.map(d => ({ id: d.id, ...d.data() }))
      usersData.sort((a, b) => {
        const aTime = a.createdAt?.seconds || new Date(a.createdAt).getTime() || 0
        const bTime = b.createdAt?.seconds || new Date(b.createdAt).getTime() || 0
        return bTime - aTime
      })
      setUsers(usersData)
    } catch (err) {
      alert('Failed to update user status')
      console.error(err)
    }
  }

  const formatDate = (timestamp) => {
    if (!timestamp) return '-'
    const d = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
    return d.toLocaleDateString()
  }

  return (
    <div className="admin-container">
      <div className="admin-wrapper">
        <div className="page-header">
          <h1 className="admin-title">Users Management</h1>
          <input
            type="text"
            placeholder="Search by name, email, phone..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="table-card">
          {loading ? (
            <div className="table-loader">Loading users...</div>
          ) : error ? (
            <div className="table-error">
              <p>{error}</p>
              <button onClick={() => setSearch(search)}>Retry</button>
            </div>
          ) : users.length === 0 ? (
            <div className="table-empty"><p>No users found</p></div>
          ) : (
            <div className="table-scroll">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Joined</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(user => (
                    <tr key={user.id}>
                      <td>
                        <div className="cell-stack">
                          <p className="cell-primary">{user.fullName || user.name || 'No name'}</p>
                          <p className="cell-secondary">{user.email || user.phone}</p>
                        </div>
                      </td>
                      <td>
                        <span className={`role-badge ${user.role}`}>{user.role || 'guest'}</span>
                      </td>
                      <td>
                        <span className={`status-badge ${user.status || 'active'}`}>{user.status || 'active'}</span>
                      </td>
                      <td className="cell-text">{formatDate(user.createdAt || user.created_at)}</td>
                      <td>
                        <div className="action-buttons">
                          <button
                            className={`action-link ${(user.status || 'active') === 'active' ? 'suspend' : 'activate'}`}
                            onClick={() => handleStatusToggle(user.id, user.status || 'active')}
                          >
                            {(user.status || 'active') === 'active' ? 'Suspend' : 'Activate'}
                          </button>
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