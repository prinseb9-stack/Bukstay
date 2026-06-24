import { useState, useEffect } from 'react'
import { collection, getDocs, query, where, updateDoc, doc, serverTimestamp } from 'firebase/firestore'
import { db } from '../../lib/firebase'
import { useGeoCurrency } from '../../hooks/useGeo'
import '../../styles/AdminPayouts.css'

export default function AdminPayouts() {
  const [payouts, setPayouts] = useState([])
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [processing, setProcessing] = useState(null)
  const { formatPrice } = useGeoCurrency()

  useEffect(() => {
    const fetchPayouts = async () => {
      try {
        setLoading(true)
        setError(null)
        
        let q = query(collection(db, 'payouts'))
        
        if (filter !== 'all') {
          q = query(collection(db, 'payouts'), where('status', '==', filter))
        }

        const snap = await getDocs(q)
        let payoutsData = snap.docs.map(d => ({ id: d.id, ...d.data() }))
        
        payoutsData.sort((a, b) => {
          const aTime = a.createdAt?.seconds || new Date(a.createdAt).getTime() || 0
          const bTime = b.createdAt?.seconds || new Date(b.createdAt).getTime() || 0
          return bTime - aTime
        })
        
        setPayouts(payoutsData)
      } catch (err) {
        setError('Failed to load payouts')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchPayouts()
  }, [filter])

  const handleProcessPayout = async (id) => {
    try {
      setProcessing(id)
      await updateDoc(doc(db, 'payouts', id), { 
        status: 'paid',
        paidAt: serverTimestamp(),
        processedBy: 'admin'
      })
      // Refresh
      const snap = await getDocs(query(collection(db, 'payouts')))
      let payoutsData = snap.docs.map(d => ({ id: d.id, ...d.data() }))
      payoutsData.sort((a, b) => {
        const aTime = a.createdAt?.seconds || new Date(a.createdAt).getTime() || 0
        const bTime = b.createdAt?.seconds || new Date(b.createdAt).getTime() || 0
        return bTime - aTime
      })
      setPayouts(payoutsData)
    } catch (err) {
      alert('Failed to process payout')
      console.error(err)
    } finally {
      setProcessing(null)
    }
  }

  const handleRejectPayout = async (id) => {
    if (!confirm('Reject this payout request?')) return
    try {
      await updateDoc(doc(db, 'payouts', id), { 
        status: 'rejected',
        rejectedAt: serverTimestamp()
      })
      const snap = await getDocs(query(collection(db, 'payouts')))
      let payoutsData = snap.docs.map(d => ({ id: d.id, ...d.data() }))
      payoutsData.sort((a, b) => {
        const aTime = a.createdAt?.seconds || new Date(a.createdAt).getTime() || 0
        const bTime = b.createdAt?.seconds || new Date(b.createdAt).getTime() || 0
        return bTime - aTime
      })
      setPayouts(payoutsData)
    } catch (err) {
      alert('Failed to reject payout')
      console.error(err)
    }
  }

  const formatDate = (timestamp) => {
    if (!timestamp) return ''
    const d = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  return (
    <div className="admin-container">
      <div className="admin-wrapper">
        <div className="page-header">
          <h1 className="admin-title">Payout Requests</h1>
          <div className="filter-tabs">
            {['all', 'pending', 'paid', 'rejected'].map(s => (
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
            <div className="table-loader">Loading payouts...</div>
          ) : error ? (
            <div className="table-error">
              <p>{error}</p>
              <button onClick={() => setFilter(filter)}>Retry</button>
            </div>
          ) : payouts.length === 0 ? (
            <div className="table-empty"><p>No payout requests found</p></div>
          ) : (
            <div className="table-scroll">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Payout ID</th>
                    <th>Host</th>
                    <th>Property</th>
                    <th>Amount</th>
                    <th>Bank Details</th>
                    <th>Requested</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {payouts.map(payout => (
                    <tr key={payout.id}>
                      <td className="cell-text">#{payout.id.slice(0, 6)}</td>
                      <td>
                        <div className="cell-stack">
                          <p className="cell-primary">{payout.hostName || payout.host_name}</p>
                          <p className="cell-secondary">{payout.hostEmail || payout.host_email}</p>
                        </div>
                      </td>
                      <td className="cell-text">{payout.propertyName || payout.property_title}</td>
                      <td className="cell-primary cell-bold">
                        {formatPrice(payout.amount || 0)}
                      </td>
                      <td>
                        <div className="cell-stack">
                          <p className="cell-primary">{payout.bankName || payout.bank_name}</p>
                          <p className="cell-secondary">{payout.accountNumber || payout.account_number}</p>
                        </div>
                      </td>
                      <td className="cell-text">{formatDate(payout.createdAt)}</td>
                      <td>
                        <span className={`status-badge ${payout.status}`}>{payout.status}</span>
                      </td>
                      <td>
                        <div className="action-buttons">
                          {payout.status === 'pending' && (
                            <>
                              <button
                                className="action-link approve"
                                onClick={() => handleProcessPayout(payout.id)}
                                disabled={processing === payout.id}
                              >
                                {processing === payout.id ? 'Processing...' : 'Mark Paid'}
                              </button>
                              <button className="action-link reject" onClick={() => handleRejectPayout(payout.id)}>
                                Reject
                              </button>
                            </>
                          )}
                          {payout.status === 'paid' && (
                            <span className="text-muted">Paid {formatDate(payout.paidAt)}</span>
                          )}
                          {payout.status === 'rejected' && (
                            <span className="text-muted">Rejected</span>
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