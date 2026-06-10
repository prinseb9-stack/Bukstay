import { useState, useEffect } from 'react'
import { DollarSign, TrendingUp, Wallet, X } from 'lucide-react'
import api from '../../services/api'
import '../../styles/HostEarnings.css'

export default function HostEarnings() {
  const [data, setData] = useState({
    available_balance: 0,
    this_month: 0,
    total_earned: 0,
    earnings_by_property: [],
    payout_history: []
  })
  const [loading, setLoading] = useState(true)
  const [showWithdraw, setShowWithdraw] = useState(false)
  const [withdrawAmount, setWithdrawAmount] = useState('')
  const [withdrawing, setWithdrawing] = useState(false)

  useEffect(() => {
    fetchEarnings()
  }, [])

  const fetchEarnings = async () => {
    try {
      setLoading(true)
      const res = await api.get('/api/host/earnings')
      setData(res.data)
    } catch (err) {
      console.error('Failed to load earnings:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleWithdraw = async () => {
    if (!withdrawAmount || parseFloat(withdrawAmount) <= 0) {
      alert('Enter a valid amount')
      return
    }
    if (parseFloat(withdrawAmount) > data.available_balance) {
      alert('Insufficient balance')
      return
    }

    setWithdrawing(true)
    try {
      await api.post('/api/host/earnings/withdraw', { 
        amount: parseFloat(withdrawAmount) 
      })
      alert('Withdrawal request submitted successfully')
      setShowWithdraw(false)
      setWithdrawAmount('')
      fetchEarnings()
    } catch (err) {
      alert(err.response?.data?.error || 'Withdrawal failed')
    } finally {
      setWithdrawing(false)
    }
  }

  if (loading) {
    return (
      <div className="host-earnings-container">
        <div className="earnings-loader">
          <div className="spinner"></div>
          <p>Loading earnings...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="host-earnings-container">
      <div className="earnings-wrapper">
        <h1 className="earnings-title">Earnings</h1>

        <div className="earnings-stats-grid">
          <div className="earnings-card primary">
            <div className="card-icon">
              <Wallet size={24} />
            </div>
            <div className="card-content">
              <p className="card-label">Available to Withdraw</p>
              <p className="card-value">₦{data.available_balance?.toLocaleString() || 0}</p>
              <button 
                className="withdraw-btn"
                onClick={() => setShowWithdraw(true)}
              >
                Withdraw
              </button>
            </div>
          </div>

          <div className="earnings-card">
            <div className="card-icon">
              <TrendingUp size={24} />
            </div>
            <div className="card-content">
              <p className="card-label">This Month</p>
              <p className="card-value">₦{data.this_month?.toLocaleString() || 0}</p>
              <p className="card-change positive">+12% from last month</p>
            </div>
          </div>

          <div className="earnings-card">
            <div className="card-icon">
              <DollarSign size={24} />
            </div>
            <div className="card-content">
              <p className="card-label">Total Earned</p>
              <p className="card-value">₦{data.total_earned?.toLocaleString() || 0}</p>
              <p className="card-change">All time</p>
            </div>
          </div>
        </div>

        <div className="earnings-content-grid">
          <div className="earnings-section">
            <h2 className="section-title">Earnings by Property</h2>
            {data.earnings_by_property.length === 0 ? (
              <div className="empty-state">
                <p>No earnings yet</p>
                <span>Start hosting to see earnings per property</span>
              </div>
            ) : (
              <div className="property-earnings-list">
                {data.earnings_by_property.map((item) => (
                  <div key={item.property_id} className="property-earning-item">
                    <div className="earning-info">
                      <p className="earning-property">{item.property_title}</p>
                      <p className="earning-bookings">{item.bookings_count} bookings</p>
                    </div>
                    <p className="earning-amount">₦{item.revenue?.toLocaleString()}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="earnings-section">
            <h2 className="section-title">Payout History</h2>
            {data.payout_history.length === 0 ? (
              <div className="empty-state">
                <p>No payouts yet</p>
                <span>Your withdrawal history will appear here</span>
              </div>
            ) : (
              <div className="payout-list">
                {data.payout_history.map((payout) => (
                  <div key={payout.id} className="payout-item">
                    <div className="payout-info">
                      <p className="payout-amount">₦{payout.amount?.toLocaleString()}</p>
                      <p className="payout-meta">
                        {new Date(payout.created_at).toLocaleDateString()} · {payout.method}
                      </p>
                    </div>
                    <span className={`payout-status status-${payout.status}`}>
                      {payout.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {showWithdraw && (
          <div className="modal-overlay" onClick={() => setShowWithdraw(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>Withdraw Earnings</h3>
                <button 
                  className="modal-close"
                  onClick={() => setShowWithdraw(false)}
                >
                  <X size={20} />
                </button>
              </div>
              
              <p className="modal-description">
                Amount will be sent to your registered bank account within 1-3 business days
              </p>

              <div className="available-balance">
                Available: ₦{data.available_balance?.toLocaleString()}
              </div>

              <div className="form-group">
                <label>Amount to withdraw</label>
                <input 
                  type="number" 
                  placeholder="Enter amount"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  max={data.available_balance}
                  disabled={withdrawing}
                />
              </div>

              <div className="modal-actions">
                <button 
                  className="btn-secondary"
                  onClick={() => setShowWithdraw(false)}
                  disabled={withdrawing}
                >
                  Cancel
                </button>
                <button 
                  className="btn-primary"
                  onClick={handleWithdraw}
                  disabled={withdrawing || !withdrawAmount}
                >
                  {withdrawing ? 'Processing...' : 'Confirm'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}