import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import '../styles/BecomeHost.css'

export default function BecomeHost() {
  const { user, updateUser } = useAuth()
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState({
    business_name: '',
    phone: '',
    id_type: 'national_id',
    id_number: '',
    bank_name: '',
    account_number: '',
    account_name: ''
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await api.post('/api/host/apply', data)
      await updateUser({ role: 'both', host_status: 'approved' })
      navigate('/host/dashboard')
    } catch (err) {
      alert(err.response?.data?.error || 'Application failed')
    } finally {
      setLoading(false)
    }
  }

  if (user?.role === 'host' || user?.role === 'both') {
    navigate('/host/dashboard')
    return null
  }

  return (
    <div className="become-host-container">
      <div className="become-host-card">
        <div className="become-host-header">
          <h1>Start hosting on BukStay</h1>
          <p>Earn money sharing your space with travelers across Africa</p>
        </div>

        {step === 1 && (
          <div className="become-host-step">
            <h2>Why host with us?</h2>
            <div className="benefits-list">
              <div className="benefit-item">
                <div className="benefit-icon">💰</div>
                <div>
                  <h3>Earn extra income</h3>
                  <p>Hosts in Lagos earn ₦150k+ monthly on average</p>
                </div>
              <div className="benefit-item">
                <div className="benefit-icon">🛡️</div>
                <div>
                  <h3>You're protected</h3>
                  <p>Free Host Guarantee and 24/7 support</p>
                </div>
              <div className="benefit-item">
                <div className="benefit-icon">⚡</div>
                <div>
                  <h3>Easy setup</h3>
                  <p>List your space in under 10 minutes</p>
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
                placeholder="Your name or business"
                value={data.business_name}
                onChange={(e) => setData({...data, business_name: e.target.value})}
              />
            </div>

            <div className="form-group">
              <label>Phone Number</label>
              <input
                type="tel"
                required
                placeholder="+234..."
                value={data.phone}
                onChange={(e) => setData({...data, phone: e.target.value})}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>ID Type</label>
                <select
                  value={data.id_type}
                  onChange={(e) => setData({...data, id_type: e.target.value})}
                >
                  <option value="national_id">National ID</option>
                  <option value="passport">Passport</option>
                  <option value="drivers_license">Driver's License</option>
                </select>
              </div>
              <div className="form-group">
                <label>ID Number</label>
                <input
                  type="text"
                  required
                  value={data.id_number}
                  onChange={(e) => setData({...data, id_number: e.target.value})}
                />
              </div>
            </div>

            <h2>Payout details</h2>

            <div className="form-group">
              <label>Bank Name</label>
              <input
                type="text"
                required
                placeholder="GTBank, Access Bank..."
                value={data.bank_name}
                onChange={(e) => setData({...data, bank_name: e.target.value})}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Account Number</label>
                <input
                  type="text"
                  required
                  value={data.account_number}
                  onChange={(e) => setData({...data, account_number: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Account Name</label>
                <input
                  type="text"
                  required
                  value={data.account_name}
                  onChange={(e) => setData({...data, account_name: e.target.value})}
                />
              </div>
            </div>

            <button type="submit" className="host-btn" disabled={loading}>
              {loading? 'Submitting...' : 'Submit Application'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}