import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { collection, query, where, orderBy, limit, startAfter, getDocs } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { useGeoCurrency } from '../hooks/useGeo'
import { Heart, Share2, MapPin, Star, ChevronUp, ChevronDown, Bookmark, MessageCircle } from 'lucide-react'
import '../styles/Discover.css'

const PAGE_SIZE = 5
const DEFAULT_IMAGE = 'https://via.placeholder.com/1080x1920?text=BukStay'

export default function Discover() {
  const navigate = useNavigate()
  const { formatPrice } = useGeoCurrency()

  const [properties, setProperties] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [lastDocument, setLastDocument] = useState(null)
  const [activeIndex, setActiveIndex] = useState(0)
  const [savedIds, setSavedIds] = useState(new Set())
  const [likedIds, setLikedIds] = useState(new Set())
  
  const feedRef = useRef(null)
  const touchStartY = useRef(0)
  const touchEndY = useRef(0)

  // Batch host names
  const getHosts = async (list) => {
    const hostIds = [...new Set(list.map(item => item.hostId).filter(Boolean))]
    if (hostIds.length === 0) return {}

    const hosts = {}
    const batches = []
    for (let i = 0; i < hostIds.length; i += 10) {
      batches.push(hostIds.slice(i, i + 10))
    }

    for (const batch of batches) {
      const snap = await getDocs(query(collection(db, 'users'), where('__name__', 'in', batch)))
      snap.docs.forEach(doc => {
        const data = doc.data()
        hosts[doc.id] = data.fullName || 'BukStay Host'
      })
    }

    return hosts
  }

  // Load properties
  const loadProperties = useCallback(async (firstLoad = false) => {
    try {
      if (firstLoad) setLoading(true)
      else setLoadingMore(true)

      let firebaseQuery = query(
        collection(db, 'properties'),
        where('isActive', '==', true),
        orderBy('createdAt', 'desc'),
        limit(PAGE_SIZE)
      )

      if (!firstLoad && lastDocument) {
        firebaseQuery = query(
          collection(db, 'properties'),
          where('isActive', '==', true),
          orderBy('createdAt', 'desc'),
          startAfter(lastDocument),
          limit(PAGE_SIZE)
        )
      }

      const snapshot = await getDocs(firebaseQuery)
      let data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        images: doc.data().images?.length ? doc.data().images : [DEFAULT_IMAGE]
      }))

      const hosts = await getHosts(data)
      data = data.map(item => ({
        ...item,
        hostName: hosts[item.hostId] || 'BukStay Host',
        hostAvatar: item.hostAvatar || ''
      }))

      if (firstLoad) setProperties(data)
      else setProperties(prev => [...prev, ...data])

      setLastDocument(snapshot.docs[snapshot.docs.length - 1])
      setHasMore(snapshot.docs.length === PAGE_SIZE)
    } catch (error) {
      console.error('Discover loading error:', error)
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }, [lastDocument])

  useEffect(() => {
    loadProperties(true)
  }, [])

  // Touch handlers for swipe
  const handleTouchStart = (e) => {
    touchStartY.current = e.touches[0].clientY
  }

  const handleTouchEnd = (e) => {
    touchEndY.current = e.changedTouches[0].clientY
    const diff = touchStartY.current - touchEndY.current

    // Swipe up = next property
    if (diff > 50 && activeIndex < properties.length - 1) {
      setActiveIndex(prev => prev + 1)
    }
    // Swipe down = previous property
    else if (diff < -50 && activeIndex > 0) {
      setActiveIndex(prev => prev - 1)
    }

    // Load more when near end
    if (activeIndex >= properties.length - 2 && hasMore && !loadingMore) {
      loadProperties(false)
    }
  }

  // Mouse wheel for desktop
  const handleWheel = (e) => {
    if (e.deltaY > 30 && activeIndex < properties.length - 1) {
      setActiveIndex(prev => prev + 1)
    } else if (e.deltaY < -30 && activeIndex > 0) {
      setActiveIndex(prev => prev - 1)
    }

    if (activeIndex >= properties.length - 2 && hasMore && !loadingMore) {
      loadProperties(false)
    }
  }

  const toggleSave = (id) => {
    setSavedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleLike = (id) => {
    setLikedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const handleShare = (property) => {
    if (navigator.share) {
      navigator.share({
        title: property.title,
        text: `Check out ${property.title} on BukStay!`,
        url: `${window.location.origin}/stays/${property.id}`
      })
    }
  }

  // Loading state
  if (loading) {
    return (
      <div className="discover-loader">
        <div className="spinner"></div>
        <p>Finding amazing stays...</p>
      </div>
    )
  }

  if (properties.length === 0) {
    return (
      <div className="discover-empty">
        <h2>No stays yet</h2>
        <p>Check back soon for new properties!</p>
      </div>
    )
  }

  const currentProperty = properties[activeIndex]
  if (!currentProperty) return null

  return (
    <div 
      className="discover-feed"
      ref={feedRef}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onWheel={handleWheel}
    >
      {/* Progress dots */}
      <div className="discover-progress">
        {properties.map((_, i) => (
          <div
            key={i}
            className={`progress-dot ${i === activeIndex ? 'active' : ''} ${i < activeIndex ? 'passed' : ''}`}
          />
        ))}
      </div>

      {/* Navigation arrows */}
      {activeIndex > 0 && (
        <button className="nav-arrow up" onClick={() => setActiveIndex(prev => prev - 1)}>
          <ChevronUp size={28} />
        </button>
      )}
      {activeIndex < properties.length - 1 && (
        <button className="nav-arrow down" onClick={() => setActiveIndex(prev => prev + 1)}>
          <ChevronDown size={28} />
        </button>
      )}

      {/* Main card */}
      <div className="discover-card-full" key={currentProperty.id}>
        {/* Image background */}
        <div className="discover-image-wrapper">
          <img
            src={currentProperty.images[0]}
            alt={currentProperty.title}
            className="discover-hero-image"
          />

          {/* Gradient overlay */}
          <div className="discover-gradient-top" />
          <div className="discover-gradient-bottom" />

          {/* Top info */}
          <div className="discover-top-bar">
            <div className="discover-location">
              <MapPin size={16} />
              <span>{currentProperty.city}, {currentProperty.country}</span>
            </div>
            <div className="discover-type-badge">
              {currentProperty.propertyType || 'Stay'}
            </div>
          </div>

          {/* Side actions */}
          <div className="discover-actions">
            <button 
              className={`action-btn ${likedIds.has(currentProperty.id) ? 'active' : ''}`}
              onClick={() => toggleLike(currentProperty.id)}
            >
              <Heart size={28} fill={likedIds.has(currentProperty.id) ? '#ff385c' : 'none'} color={likedIds.has(currentProperty.id) ? '#ff385c' : 'white'} />
              <span>{likedIds.has(currentProperty.id) ? 'Liked' : 'Like'}</span>
            </button>

            <button 
              className={`action-btn ${savedIds.has(currentProperty.id) ? 'active' : ''}`}
              onClick={() => toggleSave(currentProperty.id)}
            >
              <Bookmark size={28} fill={savedIds.has(currentProperty.id) ? '#f5a623' : 'none'} color={savedIds.has(currentProperty.id) ? '#f5a623' : 'white'} />
              <span>Save</span>
            </button>

            <button className="action-btn" onClick={() => handleShare(currentProperty)}>
              <Share2 size={28} />
              <span>Share</span>
            </button>

            <button className="action-btn">
              <MessageCircle size={28} />
              <span>Chat</span>
            </button>
          </div>

          {/* Bottom info card */}
          <div className="discover-info-card">
            <h2 className="discover-title">{currentProperty.title}</h2>
            
            <div className="discover-host-row">
              <div className="host-avatar">
                {currentProperty.hostAvatar ? (
                  <img src={currentProperty.hostAvatar} alt={currentProperty.hostName} />
                ) : (
                  <span>{currentProperty.hostName?.[0] || 'H'}</span>
                )}
              </div>
              <span className="host-name">Hosted by {currentProperty.hostName}</span>
            </div>

            <div className="discover-meta-row">
              <span className="meta-item">
                <Star size={16} fill="#f5a623" color="#f5a623" />
                {currentProperty.rating || 4.5}
              </span>
              <span className="meta-item">👥 {currentProperty.maxGuests || 2} guests</span>
              <span className="meta-item">🛏️ {currentProperty.bedrooms || 1} bed</span>
            </div>

            <p className="discover-description">
              {currentProperty.description?.slice(0, 120)}
              {currentProperty.description?.length > 120 ? '...' : ''}
            </p>

            <div className="discover-bottom-row">
              <div className="discover-price">
                <span className="price-value">{formatPrice(currentProperty.pricePerNight)}</span>
                <span className="price-unit">/night</span>
              </div>
              <button 
                className="book-now-btn"
                onClick={() => navigate(`/stays/${currentProperty.id}`)}
              >
                View Details
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Loading more indicator */}
      {loadingMore && (
        <div className="discover-loading-more">
          <div className="spinner-small"></div>
        </div>
      )}

      {/* End of feed */}
      {!hasMore && activeIndex === properties.length - 1 && (
        <div className="discover-end-overlay">
          <p>🌍 You've seen all available stays</p>
          <button onClick={() => navigate('/stays')}>Browse All Stays</button>
        </div>
      )}
    </div>
  )
}