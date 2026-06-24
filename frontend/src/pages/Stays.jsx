import { useState, useEffect, useMemo } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { collection, getDocs, query, where, limit, startAfter } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { useAuth } from '../context/AuthContext'
import { useGeoCurrency } from '../hooks/useGeo'
import PropertyCard from '../components/PropertyCard'
import '../styles/Stays.css'

const PAGE_SIZE = 20

export default function Stays() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const { userProfile } = useAuth()
  const { formatPrice } = useGeoCurrency()

  const [allProperties, setAllProperties] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState(null)
  const [showFilters, setShowFilters] = useState(false)
  const [lastDoc, setLastDoc] = useState(null)
  const [hasMore, setHasMore] = useState(true)

  const [filters, setFilters] = useState({
    city: searchParams.get('city') || '',
    country: searchParams.get('country') || '',
    guests: searchParams.get('guests') || '',
    min_price: searchParams.get('min_price') || '',
    max_price: searchParams.get('max_price') || ''
  })

  const fetchProperties = async (isFirst = false) => {
    try {
      if (isFirst) {
        setLoading(true)
      } else {
        setLoadingMore(true)
      }
      setError(null)

      let q = query(
        collection(db, 'properties'),
        where('isActive', '==', true),
        limit(PAGE_SIZE)
      )

      if (!isFirst && lastDoc) {
        q = query(
          collection(db, 'properties'),
          where('isActive', '==', true),
          startAfter(lastDoc),
          limit(PAGE_SIZE)
        )
      }

      const snapshot = await getDocs(q)

      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        image: doc.data().images?.[0] || 'https://via.placeholder.com/400x300',
        price: doc.data().pricePerNight || 0,
        rating: doc.data().rating || 4.5
      }))

      data.sort((a, b) => {
        const aTime = a.createdAt?.seconds || 0
        const bTime = b.createdAt?.seconds || 0
        return bTime - aTime
      })

      if (isFirst) {
        setAllProperties(data)
      } else {
        setAllProperties(prev => [...prev, ...data])
      }

      setLastDoc(snapshot.docs[snapshot.docs.length - 1] || null)
      setHasMore(snapshot.docs.length === PAGE_SIZE)

    } catch (err) {
      console.error('Stays fetch error:', err)
      setError('Unable to load stays. Please try again.')
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }

  useEffect(() => {
    fetchProperties(true)
  }, [])

  const countries = useMemo(() => {
    const list = allProperties.map(item => item.country).filter(Boolean)
    return [...new Set(list)].sort()
  }, [allProperties])

  const properties = useMemo(() => {
    return allProperties.filter(property => {
      if (filters.city && !property.city?.toLowerCase().includes(filters.city.toLowerCase())) {
        return false
      }
      if (filters.country && property.country !== filters.country) {
        return false
      }
      if (filters.guests && (property.maxGuests || 0) < Number(filters.guests)) {
        return false
      }
      if (filters.min_price && (property.price || 0) < Number(filters.min_price)) {
        return false
      }
      if (filters.max_price && (property.price || 0) > Number(filters.max_price)) {
        return false
      }
      return true
    })
  }, [allProperties, filters])

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const applyFilters = () => {
    const params = new URLSearchParams()
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.set(key, value)
    })
    setSearchParams(params)
    setShowFilters(false)
  }

  const clearFilters = () => {
    const emptyFilters = { city: '', country: '', guests: '', min_price: '', max_price: '' }
    setFilters(emptyFilters)
    setSearchParams({})
    setShowFilters(false)
  }

  const suggestLocalStays = () => {
    if (userProfile?.country) {
      setFilters(prev => ({ ...prev, country: userProfile.country }))
    }
  }

  return (
    <div className="stays-container">
      <div className="stays-header">
        <div className="stays-header-top">
          <h1>Explore Stays</h1>
          <button
            className="filter-toggle"
            onClick={() => setShowFilters(!showFilters)}
          >
            Filters
            {Object.values(filters).filter(Boolean).length > 0 && (
              <span className="filter-badge">
                {Object.values(filters).filter(Boolean).length}
              </span>
            )}
          </button>
        </div>

        <p className="stays-count">
          {properties.length} stay{properties.length !== 1 && "s"} found
        </p>

        {showFilters && (
          <div className="filters-panel">
            <div className="filter-group">
              <label>Country</label>
              <select
                value={filters.country}
                onChange={(e) => handleFilterChange("country", e.target.value)}
              >
                <option value="">All Countries</option>
                {countries.map(country => (
                  <option key={country} value={country}>{country}</option>
                ))}
              </select>
              {userProfile?.country && (
                <button type="button" className="suggest-btn" onClick={suggestLocalStays}>
                  Use my location ({userProfile.country})
                </button>
              )}
            </div>

            <div className="filter-group">
              <label>City</label>
              <input
                type="text"
                placeholder="Lagos, London, Dubai..."
                value={filters.city}
                onChange={(e) => handleFilterChange("city", e.target.value)}
              />
            </div>

            <div className="filter-row">
              <div className="filter-group">
                <label>Min Price</label>
                <input
                  type="number"
                  placeholder="0"
                  value={filters.min_price}
                  onChange={(e) => handleFilterChange("min_price", e.target.value)}
                />
              </div>
              <div className="filter-group">
                <label>Max Price</label>
                <input
                  type="number"
                  placeholder="Any"
                  value={filters.max_price}
                  onChange={(e) => handleFilterChange("max_price", e.target.value)}
                />
              </div>
            </div>

            <div className="filter-group">
              <label>Guests</label>
              <select
                value={filters.guests}
                onChange={(e) => handleFilterChange("guests", e.target.value)}
              >
                <option value="">Any guests</option>
                <option value="1">1 Guest</option>
                <option value="2">2 Guests</option>
                <option value="3">3 Guests</option>
                <option value="4">4+ Guests</option>
              </select>
            </div>

            <div className="filter-actions">
              <button className="filter-clear" onClick={clearFilters}>Clear</button>
              <button className="filter-apply" onClick={applyFilters}>Apply</button>
            </div>
          </div>
        )}
      </div>

      {loading ? (
        <div className="stays-loading">
          <div className="spinner"></div>
          <p>Loading stays...</p>
        </div>
      ) : error ? (
        <div className="stays-empty">
          <h2>Something went wrong</h2>
          <p>{error}</p>
          <button onClick={() => fetchProperties(true)}>Try Again</button>
        </div>
      ) : properties.length === 0 ? (
        <div className="stays-empty">
          <h2>No stays found</h2>
          <p>Try changing your search filters.</p>
          <button onClick={clearFilters}>Clear Filters</button>
        </div>
      ) : (
        <>
          <div className="stays-grid">
            {properties.map(property => (
              <PropertyCard
                key={property.id}
                property={{
                  ...property,
                  price: formatPrice(property.price)
                }}
                onClick={() => navigate(`/stays/${property.id}`)}
              />
            ))}
          </div>

          {hasMore && (
            <div className="stays-load-more">
              <button
                onClick={() => fetchProperties(false)}
                disabled={loadingMore}
                className="load-more-btn"
              >
                {loadingMore ? 'Loading...' : 'Load More'}
              </button>
            </div>
          )}

          {!hasMore && allProperties.length > 0 && (
            <p className="stays-end">You've seen all available stays</p>
          )}
        </>
      )}
    </div>
  )
}