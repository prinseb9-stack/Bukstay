import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../../lib/firebase'
import { CheckCircle, XCircle, Loader2 } from 'lucide-react'

export default function PaymentVerify() {
  const [status, setStatus] = useState('verifying')
  const [bookingId, setBookingId] = useState(null)
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const { user } = useAuth()
  const { theme } = useTheme()
  const [params] = useSearchParams()

  useEffect(() => {
    const verifyPayment = async () => {
      const reference = params.get('reference')
      const bookingIdParam = params.get('booking_id')
      
      if (!reference || !bookingIdParam) {
        navigate('/discover')
        return
      }

      try {
        const res = await fetch(
          `https://api.bukpay.com/v1/payments/verify/${reference}`,
          {
            headers: {
              'Authorization': `Bearer ${import.meta.env.VITE_BUKPAY_SECRET_KEY}`
            }
          }
        )
        
        const data = await res.json()

        if (!res.ok || data.data?.status !== 'success') {
          setStatus('failed')
          setError(data.message || 'Payment verification failed')
          return
        }

        const bookingRef = doc(db, 'bookings', bookingIdParam)
        const bookingSnap = await getDoc(bookingRef)

        if (!bookingSnap.exists()) {
          setStatus('failed')
          setError('Booking not found')
          return
        }

        await updateDoc(bookingRef, {
          status: 'confirmed',
          paymentStatus: 'paid',
          bukpayReference: reference,
          paidAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        })

        setStatus('success')
        setBookingId(bookingIdParam)

        setTimeout(() => {
          navigate('/User/bookings')
        }, 3000)

      } catch (err) {
        console.error('Verification error:', err)
        setStatus('failed')
        setError('Something went wrong')
      }
    }

    verifyPayment()
  }, [params, navigate])

  return (
    <div className={`${theme === 'dark' ? 'bg-[#0f0f1a]' : 'bg-gray-50'} min-h-screen flex items-center justify-center p-5`}>
      <div className={`${theme === 'dark' ? 'bg-[#1a1a2e]' : 'bg-white'} rounded-2xl p-10 max-w-md w-full text-center`}>
        
        {status === 'verifying' && (
          <>
            <Loader2 size={48} className="animate-spin text-[#f5a623] mx-auto mb-4" />
            <p className={`${theme === 'dark' ? 'text-white' : 'text-black'} text-lg font-semibold`}>
              Verifying payment...
            </p>
            <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} text-sm mt-2`}>
              Please wait, confirming with BukPay
            </p>
          </>
        )}

        {status === 'success' && (
          <>
            <CheckCircle size={48} className="text-green-500 mx-auto mb-4" />
            <h2 className={`${theme === 'dark' ? 'text-white' : 'text-black'} text-2xl font-bold mb-2`}>
              Payment Successful!
            </h2>
            <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} mb-6`}>
              Your booking is confirmed. Redirecting...
            </p>
            <button
              onClick={() => navigate('/User/bookings')}
              className="w-full py-3 bg-[#f5a623] text-black rounded-xl font-bold hover:bg-[#e0941a] transition-colors"
            >
              View My Bookings
            </button>
          </>
        )}

        {status === 'failed' && (
          <>
            <XCircle size={48} className="text-red-500 mx-auto mb-4" />
            <h2 className={`${theme === 'dark' ? 'text-white' : 'text-black'} text-2xl font-bold mb-2`}>
              Payment Failed
            </h2>
            <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} mb-6`}>
              {error || 'Something went wrong with your payment.'}
            </p>
            <div className="space-y-3">
              <button
                onClick={() => navigate('/discover')}
                className="w-full py-3 bg-[#f5a623] text-black rounded-xl font-bold hover:bg-[#e0941a] transition-colors"
              >
                Try Again
              </button>
              <button
                onClick={() => navigate('/User/bookings')}
                className={`w-full py-3 ${theme === 'dark' ? 'bg-[#0f0f1a] text-white' : 'bg-gray-100 text-black'} rounded-xl font-semibold hover:opacity-80 transition-opacity`}
              >
                View Bookings
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}