import { useState, useEffect } from 'react'
import { useNavigate, useParams, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useGeoCurrency } from '../hooks/useGeo'
import { doc, getDoc, addDoc, collection, serverTimestamp, updateDoc, setDoc } from 'firebase/firestore'
import { signInWithPhoneNumber, RecaptchaVerifier } from 'firebase/auth'
import { auth, db } from '../lib/firebase'
import '../styles/Payment.css'

const paymentMethods = [
  {
    id: 'bukpay',
    name: 'BukPay',
    sub: 'Cards, Bank Transfer, Wallet, USSD',
    icon: '💳',
    badge: 'Recommended'
  },
  {
    id: 'card',
    name: 'Credit/Debit Card',
    sub: 'Visa, Mastercard, Amex',
    icon: '💳'
  }
]

export default function Checkout() {
  const { user, userProfile } = useAuth()
  const navigate = useNavigate()
  const { propertyId } = useParams()
  const location = useLocation()
  const { formatPrice } = useGeoCurrency()

  const bookingData = location.state || {}
  const { checkIn, checkOut, guests = 1, nights = 1 } = bookingData

  const [property, setProperty] = useState(null)
  const [method, setMethod] = useState('bukpay')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [step, setStep] = useState(user ? 'payment' : 'details')
  const [guestPhone, setGuestPhone] = useState('')
  const [guestName, setGuestName] = useState('')
  const [otp, setOtp] = useState('')
  const [confirmationResult, setConfirmationResult] = useState(null)
  const [totalPrice, setTotalPrice] = useState(0)

  useEffect(() => {
    if (!propertyId) {
      navigate('/stays')
      return
    }

    const fetchProperty = async () => {  
      try {  
        const propSnap = await getDoc(doc(db, 'properties', propertyId))  
        if (propSnap.exists()) {  
          const prop = { id: propSnap.id, ...propSnap.data() }  
          setProperty(prop)  
          setTotalPrice(prop.pricePerNight * nights)  
        } else {  
          navigate('/stays')  
        }  
      } catch (err) {  
        console.error(err)  
        navigate('/stays')  
      }  
    }  
    fetchProperty()
  }, [propertyId, navigate, nights])

  useEffect(() => {
    if (user && step === 'details') {
      setStep('payment')
    }
  }, [user, step])

  const setupRecaptcha = () => {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        'size': 'invisible'
      })
    }
  }

  const handleSendOTP = async () => {
    setError('')

    if (!guestPhone || !guestName) {  
      setError('Please enter name and phone number')  
      return  
    }  

    if (!checkIn || !checkOut) {  
      setError('Missing booking dates. Go back and select dates.')  
      return  
    }  

    setLoading(true)  
    try {  
      setupRecaptcha()  
      const phoneNumber = guestPhone.startsWith('+') ? guestPhone : `+${guestPhone}`  
      const confirmation = await signInWithPhoneNumber(auth, phoneNumber, window.recaptchaVerifier)  
      setConfirmationResult(confirmation)  
      setStep('otp')  
    } catch (err) {  
      console.error(err)  
      setError('Failed to send OTP. Use format: +2348012345678')  
      if (window.recaptchaVerifier) {  
        window.recaptchaVerifier.clear()  
        window.recaptchaVerifier = null  
      }  
    } finally {  
      setLoading(false)  
    }
  }

  const handleVerifyOTP = async () => {
    setError('')
    setLoading(true)

    try {  
      const result = await confirmationResult.confirm(otp)  
      const guestUid = result.user.uid  

      await setDoc(doc(db, 'users', guestUid), {  
        uid: guestUid,  
        fullName: guestName,  
        phone: guestPhone,  
        role: 'user',  
        status: 'active',  
        createdAt: serverTimestamp(), 
        updatedAt: serverTimestamp(),
        phoneVerified: true  
      }, { merge: true })  

      await handlePayment(guestUid, guestName, guestPhone)  
    } catch (err) {  
      console.error(err)  
      setError('Invalid OTP. Try again')  
      setLoading(false)  
    }
  }

  const handlePayment = async (userId = null, name = null, phone = null) => {
    if (!property) return

    setLoading(true)  
    setError('')  

    const travellerId = userId || user?.uid  
    const travellerName = name || userProfile?.fullName || user?.email  
    const travellerPhone = phone || userProfile?.phone || ''  
    const travellerEmail = user?.email || ''  

    if (!travellerId) {  
      setError('Authentication error')  
      setLoading(false)  
      return  
    }  

    try {  
      const bookingRef = await addDoc(collection(db, 'bookings'), {  
        propertyId: property.id,  
        propertyName: property.title,  
        propertyCity: property.city,  
        propertyImage: property.images?.[0] || '',  
        travellerId: travellerId,  
        travellerName: travellerName,  
        travellerEmail: travellerEmail,  
        guestPhone: travellerPhone,  
        hostId: property.hostId,  
        checkIn,  
        checkOut,  
        guests,  
        nights,  
        pricePerNight: property.pricePerNight,  
        totalPrice,  
        currency: property.currency || 'USD',  
        status: 'pending_payment',  
        paymentMethod: method,  
        createdAt: serverTimestamp(),  
        updatedAt: serverTimestamp()  
      })  

      const bukpayRes = await fetch('https://api.bukpay.com/v1/payments/initialize', {  
        method: 'POST',  
        headers: {  
          'Content-Type': 'application/json',  
          'Authorization': `Bearer ${import.meta.env.VITE_BUKPAY_SECRET_KEY}`  
        },  
        body: JSON.stringify({  
          amount: totalPrice,  
          currency: property.currency || 'USD',  
          email: travellerEmail || `${travellerPhone}@bukstay.guest`,  
          phone: travellerPhone,  
          name: travellerName,  
          booking_id: bookingRef.id,  
          property_id: property.id,  
          metadata: { check_in: checkIn, check_out: checkOut, guests, nights },  
          callback_url: `${window.location.origin}/payment/verify?booking_id=${bookingRef.id}`,  
          cancel_url: `${window.location.origin}/stays/${propertyId}`  
        })  
      })  

      const bukpayData = await bukpayRes.json()  

      if (bukpayData.status === 'success' && bukpayData.data?.checkout_url) {  
        await updateDoc(doc(db, 'bookings', bookingRef.id), {  
          paymentReference: bukpayData.data.reference,  
          paymentUrl: bukpayData.data.checkout_url  
        })  
        window.location.href = bukpayData.data.checkout_url  
      } else {  
        setError(bukpayData.message || 'Payment initialization failed')  
        await updateDoc(doc(db, 'bookings', bookingRef.id), {  
          status: 'payment_failed'  
        })  
        setLoading(false)  
      }  

    } catch (err) {  
      console.error('Payment error:', err)  
      setError('Network error. Please try again.')  
      setLoading(false)  
    }
  }

  const handlePayLoggedIn = () => {
    handlePayment()
  }

  if (!property) {
    return (
      <div className="payment-wrap">
        <div className="payment-loader">Loading checkout...</div>
      </div>
    )
  }

  return (
    <div className="payment-wrap">
      <div className="payment-card">
        <h2 className="payment-title">Complete Booking</h2>
        <p className="payment-sub">
          {user ? `Logged in as ${userProfile?.fullName || user.email}` : 'No account needed - just phone verification'}
        </p>

        <div className="payment-summary">  
          <div className="payment-property">  
            <img src={property.images?.[0]} alt={property.title} />  
            <div>  
              <p className="payment-prop-title">{property.title}</p>  
              <p className="payment-prop-loc">📍 {property.city}, {property.country}</p>  
            </div>  
          </div>  

          <hr className="payment-divider" />  

          <div className="payment-row">  
            <span className="payment-label">Check In</span>  
            <span className="payment-value">{new Date(checkIn).toLocaleDateString()}</span>  
          </div>  
          <div className="payment-row">  
            <span className="payment-label">Check Out</span>  
            <span className="payment-value">{new Date(checkOut).toLocaleDateString()}</span>  
          </div>  
          <div className="payment-row">  
            <span className="payment-label">Guests</span>  
            <span className="payment-value">{guests} {guests === 1 ? 'guest' : 'guests'}</span>  
          </div>  
          <div className="payment-row">  
            <span className="payment-label">Nights</span>  
            <span className="payment-value">{nights} {nights === 1 ? 'night' : 'nights'}</span>  
          </div>  
            
          <hr className="payment-divider" />  
            
          <div className="payment-row">  
            <span className="payment-label">Total</span>  
            <span className="payment-total">{formatPrice(totalPrice)}</span>  
          </div>  
        </div>  

        {error && <p style={{ color: '#ff6b6b', marginBottom: '12px', fontSize: '14px' }}>{error}</p>}  

        {/* GUEST FLOW */}  
        {!user && step === 'details' && (  
          <>  
            <div className="form-group" style={{ marginBottom: '16px' }}>  
              <label>Full Name *</label>  
              <input  
                type="text"  
                value={guestName}  
                onChange={e => setGuestName(e.target.value)}  
                placeholder="John Doe"  
                style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '8px' }}  
              />  
            </div>  

            <div className="form-group" style={{ marginBottom: '16px' }}>  
              <label>Phone Number *</label>  
              <input  
                type="tel"  
                value={guestPhone}  
                onChange={e => setGuestPhone(e.target.value)}  
                placeholder="+2348012345678"  
                style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '8px' }}  
              />  
              <small style={{ color: '#666', fontSize: '12px' }}>We'll send OTP to verify</small>  
            </div>  

            <p style={{ color: '#aaa', fontSize: '13px', marginBottom: '12px' }}>  
              Select payment method:  
            </p>  
              
            <div className="payment-methods">  
              {paymentMethods.map(m => (  
                <div  
                  key={m.id}  
                  className={`payment-method ${method === m.id ? 'selected' : ''}`}  
                  onClick={() => setMethod(m.id)}  
                >  
                  <span className="payment-method-icon">{m.icon}</span>  
                  <div>  
                    <p className="payment-method-name">  
                      {m.name}  
                      {m.badge && <span className="method-badge">{m.badge}</span>}  
                    </p>  
                    <p className="payment-method-sub">{m.sub}</p>  
                  </div>  
                  {method === m.id && <span style={{ marginLeft: 'auto', color: '#f5a623' }}>✓</span>}  
                </div>  
              ))}  
            </div>  

            <button   
              className="payment-btn"   
              onClick={handleSendOTP}   
              disabled={loading}  
            >  
              {loading ? 'Sending OTP...' : 'Continue to Payment'}  
            </button>  
          </>  
        )}  

        {/* GUEST OTP */}  
        {!user && step === 'otp' && (  
          <>  
            <div style={{ background: '#f0fdf4', padding: '16px', borderRadius: '8px', marginBottom: '20px', textAlign: 'center' }}>  
              <p style={{ margin: 0, color: '#166534' }}>  
                Code sent to <strong>{guestPhone}</strong>  
              </p>  
            </div>  

            <div className="form-group" style={{ marginBottom: '16px' }}>  
              <label>Enter OTP *</label>  
              <input  
                type="text"  
                value={otp}  
                onChange={e => setOtp(e.target.value)}  
                placeholder="123456"  
                maxLength="6"  
                style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '8px' }}  
              />  
            </div>  

            <button   
              className="payment-btn"   
              onClick={handleVerifyOTP}   
              disabled={loading}  
            >  
              {loading ? 'Verifying...' : `Pay ${formatPrice(totalPrice)}`}  
            </button>  
              
            <button   
              type="button"   
              onClick={() => setStep('details')}  
              style={{ width: '100%', padding: '12px', marginTop: '8px', background: 'transparent', border: '1px solid #ddd', borderRadius: '8px', cursor: 'pointer' }}  
            >  
              Back  
            </button>  
          </>  
        )}  

        {/* LOGGED IN USER */}  
        {user && step === 'payment' && (  
          <>  
            <p style={{ color: '#aaa', fontSize: '13px', marginBottom: '12px' }}>  
              Select payment method:  
            </p>  
              
            <div className="payment-methods">  
              {paymentMethods.map(m => (  
                <div  
                  key={m.id}  
                  className={`payment-method ${method === m.id ? 'selected' : ''}`}  
                  onClick={() => setMethod(m.id)}  
                >  
                  <span className="payment-method-icon">{m.icon}</span>  
                  <div>  
                    <p className="payment-method-name">  
                      {m.name}  
                      {m.badge && <span className="method-badge">{m.badge}</span>}  
                    </p>  
                    <p className="payment-method-sub">{m.sub}</p>  
                  </div>  
                  {method === m.id && <span style={{ marginLeft: 'auto', color: '#f5a623' }}>✓</span>}  
                </div>  
              ))}  
            </div>  

            <button   
              className="payment-btn"   
              onClick={handlePayLoggedIn}   
              disabled={loading}  
            >  
              {loading ? 'Processing...' : `Pay ${formatPrice(totalPrice)}`}  
            </button>  
          </>  
        )}  
          
        <p className="payment-secure">  
          🔒 Secured by BukPay · {user ? 'Account logged in' : 'No account required'}  
        </p>  
          
        <div id="recaptcha-container"></div>  
      </div>  
    </div>
  )
}