import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { collection, getDocs, query, where, limit, startAfter } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { useGeoCurrency } from '../hooks/useGeo'
import FoodCard from '../components/FoodCard'
import { Search, Filter } from 'lucide-react'

const PAGE_SIZE = 12

const CATEGORIES = ['All', 'Main Course', 'Appetizer', 'Dessert', 'Drinks', 'Snacks', 'Breakfast']
const SPICE_LEVELS = ['All', 'Mild', 'Medium', 'Hot', 'Extra Hot']

export default function FoodMenu() {
  const navigate = useNavigate()
  const { formatPrice } = useGeoCurrency()

  const [foods, setFoods] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')
  const [spice, setSpice] = useState('All')
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    const fetchFoods = async () => {
      try {
        setLoading(true)
        setError(null)

        const q = query(
          collection(db, 'foodMenus'),
          where('status', '==', 'active'),
          limit(50)
        )

        const snapshot = await getDocs(q)
        const data = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))

        data.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0))
        setFoods(data)
      } catch (err) {
        console.error('Food menu error:', err)
        setError('Unable to load food menu')
      } finally {
        setLoading(false)
      }
    }

    fetchFoods()
  }, [])

  const filteredFoods = foods.filter(item => {
    if (search && !item.name?.toLowerCase().includes(search.toLowerCase()) && 
        !item.description?.toLowerCase().includes(search.toLowerCase())) {
      return false
    }
    if (category !== 'All' && item.category !== category) return false
    return true
  })

  return (
    <div className="food-menu-page">
      <div className="food-menu-header">
        <h1>Food & Drinks</h1>
        <p>Order delicious meals from hosts worldwide</p>

        <div className="food-search-row">
          <div className="food-search-input">
            <Search size={18} />
            <input
              type="text"
              placeholder="Search food, drinks..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <button 
            className={`filter-btn ${showFilters ? 'active' : ''}`}
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter size={18} />
            Filters
          </button>
        </div>

        {showFilters && (
          <div className="food-filters">
            <div className="filter-group">
              <label>Category</label>
              <div className="filter-chips">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat}
                    className={`chip ${category === cat ? 'active' : ''}`}
                    onClick={() => setCategory(cat)}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {loading ? (
        <div className="food-loading">
          <div className="spinner"></div>
          <p>Loading menu...</p>
        </div>
      ) : error ? (
        <div className="food-error">{error}</div>
      ) : filteredFoods.length === 0 ? (
        <div className="food-empty">
          <h2>No items found</h2>
          <p>Try changing your filters</p>
        </div>
      ) : (
        <div className="food-grid">
          {filteredFoods.map(item => (
            <FoodCard
              key={item.id}
              item={item}
              onClick={() => navigate(`/food/${item.id}`)}
            />
          ))}
        </div>
      )}
    </div>
  )
}