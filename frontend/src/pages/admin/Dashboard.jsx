import { useNavigate } from 'react-router-dom'
import '../../styles/AdminDashboard.css'

const stats = [
  { label: 'Total Users', value: '12,450', change: '+8.2%', color: 'blue' },
  { label: 'Active Properties', value: '3,280', change: '+5.1%', color: 'green' },
  { label: 'Total Bookings', value: '8,921', change: '+12.4%', color: 'orange' },
  { label: 'Revenue (MTD)', value: '₦45.2M', change: '+18.3%', color: 'purple' },
]

const recentActivity = [
  { type: 'user', action: 'New host registered', name: 'Tunde Adebayo', time: '2 mins ago' },
  { type: 'booking', action: 'Booking confirmed', name: '₦135,000 - Lekki Apartment', time: '15 mins ago' },
  { type: 'property', action: 'Property approved', name: 'Beach Villa Victoria Island', time: '1 hour ago' },
  { type: 'payout', action: 'Payout processed', name: '₦450,000 to host #4821', time: '3 hours ago' },
]

export default function AdminDashboard() {
  const navigate = useNavigate()

  return (
    <div className="admin-container">
      <div className="admin-wrapper">
        <h1 className="admin-title">Admin Dashboard</h1>
        <p className="admin-subtitle">Platform overview and management</p>

        <div className="stats-grid">
          {stats.map(stat => (
            <div key={stat.label} className="stat-card">
              <p className="stat-label">{stat.label}</p>
              <p className="stat-value">{stat.value}</p>
              <p className={`stat-change ${stat.color}`}>{stat.change} vs last month</p>
            </div>
          ))}
        </div>

        <div className="admin-content-grid">
          <div className="content-card activity-card">
            <h2>Recent Activity</h2>
            <div className="activity-list">
              {recentActivity.map((activity, idx) => (
                <div key={idx} className="activity-item">
                  <div className="activity-info">
                    <p className="activity-action">{activity.action}</p>
                    <p className="activity-name">{activity.name}</p>
                  </div>
                  <span className="activity-time">{activity.time}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="content-card">
            <h2>Quick Actions</h2>
            <div className="actions-list">
              <button 
                onClick={() => navigate('/admin/users')}
                className="action-btn primary"
              >
                Manage Users
              </button>
              <button 
                onClick={() => navigate('/admin/properties')}
                className="action-btn"
              >
                Review Properties
              </button>
              <button 
                onClick={() => navigate('/admin/payouts')}
                className="action-btn"
              >
                Payout Requests
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}