import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import PropertyCard from '../components/PropertyCard'
import api from '../services/api'
import '../styles/Stays.css'

export default function Stays() {
  const [properties, setProperties] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()

  const [filters, setFilters] = useState({
    location: searchParams.get('location') || '',
    min_price: searchParams.get('min_price') || '',
    max_price: searchParams.get('max_price') || '',
    guests: searchParams.get('guests') || ''
  })

  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    const fetchStays = async () => {
      try {
        setLoading(true)
        const params = new URLSearchParams()
        Object.entries(filters).forEach(([key, value]) => {
          if (value) params.append(key, value)
        })

        const res = await api.get(`/api/properties?${params.toString()}`)
        setProperties(res.data)
      } catch (err) {
        setError('Failed to load stays')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchStays()
  }, [searchParams])

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({...prev, [key]: value }))
  }

  const applyFilters = () => {
    const params = new URLSearchParams()
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.append(key, value)
    })
    setSearchParams(params)
    setShowFilters(false)
  }

  const clearFilters = () => {
    setFilters({ location: '', min_price: '', max_price: '', guests: '' })
    setSearchParams({})
    setShowFilters(false)
  }

  if (loading) {
    return (
      <div className="stays-container">
        <div className="stays-loader">
          <div className="spinner"></div>
          <p>Loading stays...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="stays-container">
      <div className="stays-header">
        <div className="stays-header-top">
          <h1>Stays</h1>
          <button
            className="filter-toggle"
            onClick={() => setShowFilters(!showFilters)}
          >
            Filters {Object.values(filters).filter(Boolean).length > 0 &&
              <span className="filter-badge">{Object.values(filters).filter(Boolean).length}</span>
            }
          </button>
        </div>

        {showFilters && (
          <div className="filters-panel">
            <div className="filter-group">
              <label>Location</label>
              <input
                type="text"
                placeholder="Where to?"
                value={filters.location}
                onChange={(e) => handleFilterChange('location', e.target.value)}
              />
            </div>

            <div className="filter-row">
              <div className="filter-group">
                <label>Min Price</label>
                <input
                  type="number"
                  placeholder="$0"
                  value={filters.min_price}
                  onChange={(e) => handleFilterChange('min_price', e.target.value)}
                />
              </div>
              <div className="filter-group">
                <label>Max Price</label>
                <input
                  type="number"
                  placeholder="Any"
                  value={filters.max_price}
                  onChange={(e) => handleFilterChange('max_price', e.target.value)}
                />
              </div>
            </div>

            <div className="filter-group">
              <label>Guests</label>
              <select
                value={filters.guests}
                onChange={(e) => handleFilterChange('guests', e.target.value)}
              >
                <option value="">Any</option>
                <option value="1">1 guest</option>
                <option value="2">2 guests</option>
                <option value="3">3 guests</option>
                <option value="4">4+ guests</option>
              </select>
            </div>

            <div className="filter-actions">
              <button className="filter-clear" onClick={clearFilters}>
                Clear all
              </button>
              <button className="filter-apply" onClick={applyFilters}>
                Show results
              </button>
            </div>
          </div>
        )}

        <p className="stays-count">
          {properties.length} {properties.length === 1? 'stay' : 'stays'} found
        </p>
      </div>

      {error? (
        <div className="stays-error">
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>Retry</button>
        </div>
      ) : properties.length === 0? (
        <div className="stays-empty">
          <h2>No stays found</h2>
          <p>Try adjusting your filters or search in a different location</p>
          <button onClick={clearFilters}>Clear filters</button>
        </div>
      ) : (
        <div className="stays-grid">
          {properties.map((property) => (
            <PropertyCard
              key={property.id}
              property={property}
              onClick={() => navigate(`/stays/${property.id}`)}
            />
          ))}
        </div>
      )}
    </div>
  )
}