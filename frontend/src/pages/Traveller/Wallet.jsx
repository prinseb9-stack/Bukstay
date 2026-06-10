import { useState, useEffect } from 'react'
import { ArrowUpRight, ArrowDownLeft, Plus } from 'lucide-react'
import api from '../../services/api'
import '../../styles/TravellerWallet.css'

export default function Wallet() {
  const [data, setData] = useState({
    balance: 0,
    transactions: []
  })
  const [loading, setLoading] = useState(true)
  const [showTopUp, setShowTopUp] = useState(false)
  const [topUpAmount, setTopUpAmount] = useState('')
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    fetchWallet()
  }, [])

  const fetchWallet = async () => {
    try {
      setLoading(true)
      const res = await api.get('/api/traveller/wallet')
      setData(res.data)
    } catch (err) {
      console.error('Failed to load wallet:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleTopUp = async () => {
    if (!topUpAmount || parseFloat(topUpAmount) <= 0) {
      alert('Enter a valid amount')
      return
    }

    setProcessing(true)
    try {
      await api.post('/api/traveller/wallet/topup', {
        amount: parseFloat(topUpAmount)
      })
      alert('Top-up successful')
      setShowTopUp(false)
      setTopUpAmount('')
      fetchWallet()
    } catch (err) {
      alert(err.response?.data?.error || 'Top-up failed')
    } finally {
      setProcessing(false)
    }
  }

  const getTransactionIcon = (type) => {
    return type === 'credit' ? (
      <ArrowDownLeft size={20} className="tx-icon credit" />
    ) : (
      <ArrowUpRight size={20} className="tx-icon debit" />
    )
  }

  if (loading) {
    return (
      <div className="traveller-wallet-container">
        <div className="wallet-loader">
          <div className="spinner"></div>
          <p>Loading wallet...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="traveller-wallet-container">
      <div className="wallet-wrapper">
        <h1 className="wallet-title">Wallet</h1>

        <div className="balance-card">
          <p className="balance-label">Available Balance</p>
          <p className="balance-amount">₦{data.balance?.toLocaleString() || 0}</p>
          <button 
            className="topup-btn"
            onClick={() => setShowTopUp(true)}
          >
            <Plus size={18} />
            <span>Top Up Wallet</span>
          </button>
        </div>

        <div className="transactions-card">
          <h2 className="section-title">Recent Transactions</h2>
          
          {data.transactions.length === 0 ? (
            <div className="transactions-empty">
              <p>No transactions yet</p>
              <span>Your wallet activity will appear here</span>
            </div>
          ) : (
            <div className="transactions-list">
              {data.transactions.map((tx) => (
                <div key={tx.id} className="transaction-item">
                  <div className="transaction-icon-wrapper">
                    {getTransactionIcon(tx.type)}
                  </div>
                  <div className="transaction-details">
                    <p className="transaction-desc">{tx.description}</p>
                    <p className="transaction-date">
                      {new Date(tx.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                  <p className={`transaction-amount ${tx.type}`}>
                    {tx.type === 'credit' ? '+' : '-'}₦{Math.abs(tx.amount).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {showTopUp && (
          <div className="modal-overlay" onClick={() => setShowTopUp(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>Top Up Wallet</h3>
                <button 
                  className="modal-close"
                  onClick={() => setShowTopUp(false)}
                >
                  ✕
                </button>
              </div>
              
              <p className="modal-description">
                Add funds to your wallet for faster bookings
              </p>

              <div className="form-group">
                <label>Amount (₦)</label>
                <input 
                  type="number" 
                  placeholder="Enter amount"
                  value={topUpAmount}
                  onChange={(e) => setTopUpAmount(e.target.value)}
                  disabled={processing}
                  min="1000"
                />
              </div>

              <div className="quick-amounts">
                {[10000, 25000, 50000, 100000].map((amt) => (
                  <button
                    key={amt}
                    className="quick-amount-btn"
                    onClick={() => setTopUpAmount(amt.toString())}
                    disabled={processing}
                  >
                    ₦{amt.toLocaleString()}
                  </button>
                ))}
              </div>

              <div className="modal-actions">
                <button 
                  className="btn-secondary"
                  onClick={() => setShowTopUp(false)}
                  disabled={processing}
                >
                  Cancel
                </button>
                <button 
                  className="btn-primary"
                  onClick={handleTopUp}
                  disabled={processing || !topUpAmount}
                >
                  {processing ? 'Processing...' : 'Confirm Top Up'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}