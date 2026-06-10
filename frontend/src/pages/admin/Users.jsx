import { useState, useEffect } from 'react'
import api from '../../services/api'
import '../../styles/AdminUsers.css'

export default function AdminUsers() {
  const [users, setUsers] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchUsers()
  }, [search])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      setError(null)
      const params = search? `?search=${encodeURIComponent(search)}` : ''
      const res = await api.get(`/api/admin/users${params}`)
      setUsers(res.data)
    } catch (err) {
      setError('Failed to load users')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusToggle = async (id, currentStatus) => {
    try {
      const newStatus = currentStatus === 'active'? 'suspended' : 'active'
      await api.patch(`/api/admin/users/${id}`, { status: newStatus })
      fetchUsers() // Refresh list
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update user status')
    }
  }

  return (
    <div className="admin-container">
      <div className="admin-wrapper">
        <div className="page-header">
          <h1 className="admin-title">Users Management</h1>
          <input
            type="text"
            placeholder="Search users..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="table-card">
          {loading? (
            <div className="table-loader">Loading users...</div>
          ) : error? (
            <div className="table-error">
              <p>{error}</p>
              <button onClick={fetchUsers}>Retry</button>
            </div>
          ) : users.length === 0? (
            <div className="table-empty">
              <p>No users found</p>
            </div>
          ) : (
            <div className="table-scroll">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Joined</th>
                    <th>Activity</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(user => (
                    <tr key={user.id}>
                      <td>
                        <div className="cell-stack">
                          <p className="cell-primary">{user.full_name || user.name}</p>
                          <p className="cell-secondary">{user.email}</p>
                        </div>
                      </td>
                      <td>
                        <span className={`role-badge ${user.role}`}>
                          {user.role}
                        </span>
                      </td>
                      <td>
                        <span className={`status-badge ${user.status}`}>
                          {user.status}
                        </span>
                      </td>
                      <td className="cell-text">
                        {new Date(user.created_at || user.joined).toLocaleDateString()}
                      </td>
                      <td className="cell-text">
                        {user.booking_count!== undefined
                         ? `${user.booking_count} bookings`
                          : user.property_count!== undefined
                         ? `${user.property_count} properties`
                          : '-'
                        }
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button
                            className={`action-link ${user.status === 'active'? 'suspend' : 'activate'}`}
                            onClick={() => handleStatusToggle(user.id, user.status)}
                          >
                            {user.status === 'active'? 'Suspend' : 'Activate'}
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