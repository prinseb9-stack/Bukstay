import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { doc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../lib/firebase'
import '../styles/BecomeHost.css'

export default function BecomeHost() {
  const { user, userProfile, updateUserProfile } = useAuth()
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  const [data, setData] = useState({
    business_name: '',
    phone: userProfile?.phone || '',
    id_type: 'passport',
    id_number: '',
    accept_bukpay_terms: false
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!data.accept_bukpay_terms) {
      setError('Please accept BukPay Wallet terms')
      return
    }
    
    setLoading(true)
    setError('')
    
    try {
      const bukpayRes = await fetch('https://api.bukpay.com/v1/wallets/create', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_BUKPAY_SECRET_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          user_id: user.uid,
          email: user.email,
          name: data.business_name || userProfile?.fullName,
          phone: data.phone,
          country: userProfile?.country,
          type: 'host',
          currency: userProfile?.currency || 'USD'
        })
      })

      const bukpayData = await bukpayRes.json()
      
      if (!bukpayRes.ok || bukpayData.status !== 'success') {
        throw new Error(bukpayData.message || 'BukPay wallet creation failed')
      }

      await setDoc(doc(db, 'hostApplications', user.uid), {
        businessName: data.business_name || userProfile?.fullName,
        phone: data.phone,
        country: userProfile?.country,
        currency: userProfile?.currency || 'USD',
        idType: data.id_type,
        idNumber: data.id_number,
        bukpayWalletId: bukpayData.data.wallet_id,
        bukpayWalletAddress: bukpayData.data.wallet_address,
        payoutMethod: 'bukpay_wallet',
        status: 'approved', // TODO: change to 'pending' for production
        submittedAt: serverTimestamp(),
        approvedAt: serverTimestamp()
      })

      await updateDoc(doc(db, 'users', user.uid), {
        role: 'host',
        hostStatus: 'approved',
        bukpayWalletId: bukpayData.data.wallet_id,
        businessName: data.business_name || userProfile?.fullName,
        phone: data.phone
      })

      await updateUserProfile({ 
        role: 'host', 
        hostStatus: 'approved',
        bukpayWalletId: bukpayData.data.wallet_id 
      })
      
      navigate('/host/dashboard')
      
    } catch (err) {
      console.error('Host application error:', err)
      setError(err.message || 'Application failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (userProfile?.role === 'host') {
    return <Navigate to="/host/dashboard" />
  }

  const avgEarnings = userProfile?.country === 'Nigeria' ? '$200' : '$2,000'

  return (
    <div className="become-host-container">
      <div className="become-host-card">
        <div className="become-host-header">
          <h1>Start hosting on BukStay</h1>
          <p>Earn money sharing your space with travelers worldwide</p>
        </div>

        {step === 1 && (
          <div className="become-host-step">
            <h2>Why host with us?</h2>
            <div className="benefits-list">
              <div className="benefit-item">
                <div className="benefit-icon">💰</div>
                <div>
                  <h3>Earn extra income</h3>
                  <p>Hosts earn {avgEarnings}+ monthly on average</p>
                </div>
              </div>
              <div className="benefit-item">
                <div className="benefit-icon">⚡</div>
                <div>
                  <h3>Instant payouts</h3>
                  <p>Get paid to your BukPay wallet immediately after checkout</p>
                </div>
              </div>
              <div className="benefit-item">
                <div className="benefit-icon">🛡️</div>
                <div>
                  <h3>You're protected</h3>
                  <p>Host protection + 24/7 support worldwide</p>
                </div>
              </div>
              <div className="benefit-item">
                <div className="benefit-icon">🌍</div>
                <div>
                  <h3>Global reach</h3>
                  <p>List your space to travelers from 100+ countries</p>
                </div>
              </div>
            </div>
            <button 
              onClick={() => setStep(2)}
              className="host-btn"
            >
              Get Started
            </button>
          </div>
        )}

        {step === 2 && (
          <form onSubmit={handleSubmit} className="become-host-form">
            <h2>Host details</h2>
            
            <div className="form-group">
              <label>Business/Host Name</label>
              <input
                type="text"
                required
                placeholder="Your name or business name"
                value={data.business_name}
                onChange={(e) => setData({...data, business_name: e.target.value})}
              />
              <small>Shown to guests. Use your legal name or registered business.</small>
            </div>

            <div className="form-group">
              <label>Phone Number</label>
              <input
                type="tel"
                required
                placeholder="+1 234 567 8900"
                value={data.phone}
                onChange={(e) => setData({...data, phone: e.target.value})}
              />
              <small>For booking notifications and support</small>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>ID Type</label>
                <select
                  value={data.id_type}
                  onChange={(e) => setData({...data, id_type: e.target.value})}
                >
                  <option value="passport">Passport</option>
                  <option value="national_id">National ID</option>
                  <option value="drivers_license">Driver's License</option>
                </select>
              </div>
              <div className="form-group">
                <label>ID Number</label>
                <input
                  type="text"
                  required
                  placeholder="Enter ID number"
                  value={data.id_number}
                  onChange={(e) => setData({...data, id_number: e.target.value})}
                />
              </div>
            </div>

            <h2>Payout details</h2>

            <div className="payout-info-card">
              <div className="payout-icon">👛</div>
              <div className="payout-content">
                <h3>BukPay Wallet</h3>
                <p>All earnings are paid instantly to your BukPay wallet. Zero fees.</p>
                <ul>
                  <li>✓ Instant payouts after guest checkout</li>
                  <li>✓ Use balance to book stays worldwide</li>
                  <li>✓ Withdraw to any bank or mobile money</li>
                  <li>✓ No monthly fees or minimum balance</li>
                </ul>
                <p className="payout-note">
                  Withdraw to {userProfile?.country || 'your'} banks, mobile money, or cards directly from BukPay app
                </p>
              </div>
            </div>

            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  required
                  checked={data.accept_bukpay_terms}
                  onChange={(e) => setData({...data, accept_bukpay_terms: e.target.checked})}
                />
                <span>I agree to receive all payouts via BukPay Wallet and accept the BukPay Terms</span>
              </label>
            </div>

            {error && <p className="error-text">{error}</p>}

            <button type="submit" className="host-btn" disabled={loading}>
              {loading ? 'Creating your host account...' : 'Become a Host'}
            </button>
            
            <p className="form-disclaimer">
              By continuing, you agree to BukStay Host Terms and BukPay Terms of Service
            </p>
          </form>
        )}
      </div>
    </div>
  )
}