import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'
import { useGeoCurrency } from '../../hooks/useGeo'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { db } from '../../lib/firebase'
import { DollarSign, TrendingUp, Wallet, ExternalLink } from 'lucide-react'
import '../../styles/HostEarnings.css'

export default function HostEarnings() {
  const { user, userProfile } = useAuth()
  const { theme } = useTheme()
  const { formatPrice } = useGeoCurrency()
  
  const [data, setData] = useState({
    available_balance: 0,
    this_month: 0,
    total_earned: 0,
    earnings_by_property: [],
    payout_history: []
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchEarnings = async () => {
      if (!user) return
      
      try {
        setLoading(true)
        
        const bookingsQuery = query(
          collection(db, 'bookings'),
          where('hostId', '==', user.uid),
          where('status', 'in', ['completed', 'confirmed'])
        )
        const bookingsSnap = await getDocs(bookingsQuery)
        const bookings = bookingsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }))

        const total_earned = bookings.reduce((sum, b) => sum + (b.totalPrice || 0), 0)

        // This month — use checkIn date (when the booking started)
        const now = new Date()
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
        const this_month = bookings
          .filter(b => {
            const checkIn = new Date(b.checkIn)
            return checkIn >= startOfMonth && checkIn <= now
          })
          .reduce((sum, b) => sum + (b.totalPrice || 0), 0)

        // Earnings by property
        const propertyMap = {}
        bookings.forEach(b => {
          if (!propertyMap[b.propertyId]) {
            propertyMap[b.propertyId] = {
              property_id: b.propertyId,
              property_title: b.propertyName,
              bookings_count: 0,
              revenue: 0
            }
          }
          propertyMap[b.propertyId].bookings_count++
          propertyMap[b.propertyId].revenue += b.totalPrice || 0
        })
        const earnings_by_property = Object.values(propertyMap).sort((a, b) => b.revenue - a.revenue)

        // BukPay balance
        let available_balance = 0
        let payout_history = []
        
        if (userProfile?.bukpayWalletId) {
          const bukpayRes = await fetch(
            `https://api.bukpay.com/v1/wallets/${userProfile.bukpayWalletId}`,
            {
              headers: {
                'Authorization': `Bearer ${import.meta.env.VITE_BUKPAY_SECRET_KEY}`
              }
            }
          )
          
          if (bukpayRes.ok) {
            const bukpayData = await bukpayRes.json()
            available_balance = bukpayData.data?.balance || 0
            payout_history = bukpayData.data?.payouts || []
          }
        }

        setData({ available_balance, this_month, total_earned, earnings_by_property, payout_history })

      } catch (err) {
        console.error('Failed to load earnings:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchEarnings()
  }, [user, userProfile?.bukpayWalletId])

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
            <div className="card-icon"><Wallet size={24} /></div>
            <div className="card-content">
              <p className="card-label">Available in BukPay</p>
              <p className="card-value">{formatPrice(data.available_balance)}</p>
              <button className="withdraw-btn" onClick={() => window.open('https://app.bukpay.com/wallet', '_blank')}>
                <span>Manage in BukPay</span>
                <ExternalLink size={16} />
              </button>
            </div>
          </div>

          <div className="earnings-card">
            <div className="card-icon"><TrendingUp size={24} /></div>
            <div className="card-content">
              <p className="card-label">This Month</p>
              <p className="card-value">{formatPrice(data.this_month)}</p>
              <p className="card-change">Gross revenue from check-ins</p>
            </div>
          </div>

          <div className="earnings-card">
            <div className="card-icon"><DollarSign size={24} /></div>
            <div className="card-content">
              <p className="card-label">Total Earned</p>
              <p className="card-value">{formatPrice(data.total_earned)}</p>
              <p className="card-change">All time gross</p>
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
                    <p className="earning-amount">{formatPrice(item.revenue)}</p>
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
                <span>Your BukPay withdrawal history will appear here</span>
              </div>
            ) : (
              <div className="payout-list">
                {data.payout_history.map((payout) => (
                  <div key={payout.id} className="payout-item">
                    <div className="payout-info">
                      <p className="payout-amount">{formatPrice(payout.amount)}</p>
                      <p className="payout-meta">
                        {new Date(payout.created_at).toLocaleDateString()} · {payout.method || 'Bank Transfer'}
                      </p>
                    </div>
                    <span className={`payout-status status-${payout.status}`}>{payout.status}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className={`${theme === 'dark' ? 'bg-[#1a1a2e]' : 'bg-white'} p-4 rounded-lg mt-6 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
          <p>
            <strong>Note:</strong> "Total Earned" shows gross booking revenue from BukStay. 
            "Available in BukPay" shows your actual withdrawable balance after BukPay fees. 
            All payouts are processed via your BukPay account.
          </p>
        </div>
      </div>
    </div>
  )
}