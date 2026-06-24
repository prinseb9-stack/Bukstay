import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore'
import { db } from '../../lib/firebase'
import { Star, MessageSquare } from 'lucide-react'

export default function HostReviews() {
  const { user } = useAuth()
  const { theme } = useTheme()
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const isDark = theme === 'dark'

  useEffect(() => {
    if (!user) return

    const fetchReviews = async () => {
      try {
        // Get all host properties
        const propsSnap = await getDocs(query(collection(db, 'properties'), where('hostId', '==', user.uid)))
        const propertyIds = propsSnap.docs.map(d => d.id)

        if (!propertyIds.length) {
          setReviews([])
          setLoading(false)
          return
        }

        // Get reviews for those properties
        const reviewsSnap = await getDocs(
          query(collection(db, 'reviews'), where('propertyId', 'in', propertyIds))
        )
        const reviewsData = reviewsSnap.docs.map(d => ({ id: d.id, ...d.data() }))
        reviewsData.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0))

        setReviews(reviewsData)
      } catch (err) {
        console.error('Failed to load reviews:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchReviews()
  }, [user])

  const avgRating = reviews.length
    ? (reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length).toFixed(1)
    : '0.0'

  if (loading) {
    return (
      <div className={`${isDark ? 'bg-[#0f0f1a]' : 'bg-gray-50'} min-h-screen flex items-center justify-center`}>
        <div className="spinner"></div>
      </div>
    )
  }

  return (
    <div className={`${isDark ? 'bg-[#0f0f1a]' : 'bg-gray-50'} min-h-screen p-6`}>
      <div className="max-w-3xl mx-auto">
        <h1 className={`${isDark ? 'text-white' : 'text-black'} text-3xl font-bold mb-8`}>Reviews</h1>

        {/* Rating Summary */}
        <div className={`${isDark ? 'bg-[#1a1a2e]' : 'bg-white'} p-6 rounded-2xl mb-6 flex items-center gap-6`}>
          <div className="text-center">
            <p className="text-5xl font-bold text-[#f5a623]">{avgRating}</p>
            <div className="flex justify-center mt-1">
              {[1, 2, 3, 4, 5].map(i => (
                <Star key={i} size={14} fill={i <= Math.round(avgRating) ? '#f5a623' : 'none'} color="#f5a623" />
              ))}
            </div>
            <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{reviews.length} reviews</p>
          </div>
        </div>

        {/* Reviews List */}
        {reviews.length === 0 ? (
          <div className={`${isDark ? 'bg-[#1a1a2e]' : 'bg-white'} p-12 rounded-2xl text-center`}>
            <MessageSquare size={48} className={`mx-auto mb-4 ${isDark ? 'text-gray-600' : 'text-gray-300'}`} />
            <h2 className={`text-lg font-bold mb-2 ${isDark ? 'text-white' : 'text-black'}`}>No reviews yet</h2>
            <p className={`${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Reviews will appear here once guests review your properties</p>
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map(review => (
              <div key={review.id} className={`${isDark ? 'bg-[#1a1a2e]' : 'bg-white'} p-6 rounded-2xl`}>
                <div className="flex justify-between mb-3">
                  <div>
                    <p className={`font-semibold ${isDark ? 'text-white' : 'text-black'}`}>{review.guestName || 'Guest'}</p>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      {review.propertyName} · {review.createdAt?.toDate?.().toLocaleDateString() || 'Recent'}
                    </p>
                  </div>
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map(i => (
                      <Star key={i} size={16} fill={i <= review.rating ? '#f5a623' : 'none'} color="#f5a623" />
                    ))}
                  </div>
                </div>
                <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{review.text || 'No comment'}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}