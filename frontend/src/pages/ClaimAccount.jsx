import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { signInWithPhoneNumber, RecaptchaVerifier, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth'
import { doc, setDoc, collection, query, where, getDocs, updateDoc, serverTimestamp } from 'firebase/firestore'
import { auth, db } from '../lib/firebase'
import '../styles/ClaimAccount.css'

export default function ClaimAccount() {
  const navigate = useNavigate()
  const { user } = useAuth()
  
  const [step, setStep] = useState('phone')
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [confirmationResult, setConfirmationResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [bookings, setBookings] = useState([])
  const [guestUid, setGuestUid] = useState(null)

  useEffect(() => {
    if (user && user.email) {
      navigate('/User/dashboard')
    }
  }, [user, navigate])

  const setupRecaptcha = () => {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container-claim', {
        'size': 'invisible'
      })
    }
  }

  const handleSendOTP = async (e) => {
    e.preventDefault()
    setError('')
    
    if (!phone) {
      setError('Please enter your phone number')
      return
    }

    setLoading(true)
    try {
      const usersRef = collection(db, 'users')
      const q = query(usersRef, where('phone', '==', phone), where('role', '==', 'guest'))
      const snap = await getDocs(q)
      
      if (snap.empty) {
        setError('No guest bookings found with this phone number')
        setLoading(false)
        return
      }

      const guestDoc = snap.docs[0]
      setGuestUid(guestDoc.id)

      // Only fetch booking count, not full details (privacy)
      const bookingsRef = collection(db, 'bookings')
      const bookingsQuery = query(bookingsRef, where('travellerId', '==', guestDoc.id))
      const bookingsSnap = await getDocs(bookingsQuery)
      const bookingsData = bookingsSnap.docs.map(d => ({ id: d.id, ...d.data() }))
      setBookings(bookingsData)

      setupRecaptcha()
      const phoneNumber = phone.startsWith('+') ? phone : `+${phone}`
      const confirmation = await signInWithPhoneNumber(auth, phoneNumber, window.recaptchaVerifier)
      setConfirmationResult(confirmation)
      setStep('otp')
    } catch (err) {
      console.error(err)
      setError('Failed to send OTP. Check phone format: +2348012345678')
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear()
        window.recaptchaVerifier = null
      }
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOTP = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await confirmationResult.confirm(otp)
      setStep('details')
    } catch (err) {
      console.error(err)
      setError('Invalid OTP. Try again')
    } finally {
      setLoading(false)
    }
  }

  const handleClaimAccount = async (e) => {
    e.preventDefault()
    setError('')

    if (!email || !password) {
      setError('Email and password required')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setLoading(true)
    try {
      // Create actual Firebase Auth user so they can log in later
      const userCred = await createUserWithEmailAndPassword(auth, email, password)
      
      // Update display name from guest profile
      const guestSnap = await getDocs(query(
        collection(db, 'users'),
        where('__name__', '==', guestUid)
      ))
      
      let displayName = ''
      if (!guestSnap.empty) {
        displayName = guestSnap.docs[0].data().fullName || ''
      }

      await updateProfile(userCred.user, { displayName })

      // Update the guest user doc to traveller
      await updateDoc(doc(db, 'users', guestUid), {
        email: email,
        role: 'user',
        emailVerified: false,
        onboardingComplete: false,
        claimedAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      })

      setStep('success')
      setTimeout(() => navigate('/User/dashboard'), 2000)
    } catch (err) {
      console.error(err)
      if (err.code === 'auth/email-already-in-use') {
        setError('This email is already registered. Try logging in instead.')
      } else {
        setError('Failed to claim account. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="claim-wrap">
      <div className="claim-card">
        <div className="claim-header">
          <h1>🔓 Claim Your Account</h1>
          <p>Access your bookings and become a Traveller</p>
        </div>

        {error && <div className="claim-error">{error}</div>}

        {step === 'phone' && (
          <form onSubmit={handleSendOTP} className="claim-form">
            <div className="claim-info">
              <p>Enter the phone number you used to book</p>
            </div>

            <div className="form-group">
              <label>Phone Number *</label>
              <input
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="+2348012345678"
                required
              />
              <small>We'll send OTP to verify</small>
            </div>

            <button type="submit" className="claim-btn-primary" disabled={loading}>
              {loading ? 'Sending...' : 'Send OTP'}
            </button>
          </form>
        )}

        {step === 'otp' && (
          <form onSubmit={handleVerifyOTP} className="claim-form">
            <div className="claim-info">
              <p>Code sent to <strong>{phone}</strong></p>
              {bookings.length > 0 && (
                <p style={{ marginTop: '8px', fontSize: '13px', color: '#059669' }}>
                  Found {bookings.length} booking{bookings.length !== 1 ? 's' : ''}
                </p>
              )}
            </div>

            <div className="form-group">
              <label>Enter OTP *</label>
              <input
                type="text"
                value={otp}
                onChange={e => setOtp(e.target.value)}
                placeholder="123456"
                maxLength="6"
                required
              />
            </div>

            <button type="submit" className="claim-btn-primary" disabled={loading}>
              {loading ? 'Verifying...' : 'Verify OTP'}
            </button>
            
            <button 
              type="button" 
              className="claim-btn-secondary" 
              onClick={() => setStep('phone')}
            >
              Back
            </button>
          </form>
        )}

        {step === 'details' && (
          <form onSubmit={handleClaimAccount} className="claim-form">
            <div className="claim-info">
              <p>✅ Phone verified! Complete your Traveller profile</p>
            </div>

            {bookings.length > 0 && (
              <div className="claim-bookings">
                <p style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>Your Bookings:</p>
                {bookings.map(b => (
                  <div key={b.id} className="claim-booking-item">
                    <span>{b.propertyName}</span>
                    <span>{new Date(b.checkIn).toLocaleDateString()}</span>
                  </div>
                ))}
              </div>
            )}

            <div className="form-group">
              <label>Email *</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="john@example.com"
                required
              />
            </div>

            <div className="form-group">
              <label>Create Password *</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Min 6 characters"
                required
              />
            </div>

            <div className="form-group">
              <label>Confirm Password *</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="Re-enter password"
                required
              />
            </div>

            <button type="submit" className="claim-btn-primary" disabled={loading}>
              {loading ? 'Creating Account...' : 'Claim Account & View Bookings'}
            </button>
          </form>
        )}

        {step === 'success' && (
          <div className="claim-success">
            <div className="claim-success-icon">🎉</div>
            <h2>Welcome, Traveller!</h2>
            <p>Your account is ready. Redirecting to dashboard...</p>
          </div>
        )}

        <div id="recaptcha-container-claim"></div>
      </div>
    </div>
  )
}