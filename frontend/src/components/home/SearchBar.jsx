import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './SearchBar.css'

export default function SearchBar() {
  const navigate = useNavigate()

  const [search, setSearch] = useState({
    city: '',
    checkIn: '',
    checkOut: '',
    guests: 1
  })

  const handleChange = (e) => {
    setSearch({
      ...search,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    const params = new URLSearchParams()

    Object.entries(search).forEach(([key, value]) => {
      if (value) {
        params.append(key, value)
      }
    })

    navigate(`/stays?${params.toString()}`)
  }

  return (
    <form className="search-box" onSubmit={handleSubmit}>

      <input
        type="text"
        name="city"
        placeholder="Where are you going?"
        value={search.city}
        onChange={handleChange}
      />

      <input
        type="date"
        name="checkIn"
        value={search.checkIn}
        onChange={handleChange}
      />

      <input
        type="date"
        name="checkOut"
        value={search.checkOut}
        onChange={handleChange}
      />

      <select
        name="guests"
        value={search.guests}
        onChange={handleChange}
      >
        <option value="1">1 Guest</option>
        <option value="2">2 Guests</option>
        <option value="3">3 Guests</option>
        <option value="4">4+ Guests</option>
      </select>

      <button type="submit">
        Search
      </button>

    </form>
  )
}