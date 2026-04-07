import { useState } from 'react'
import { useSearch } from '../context/SearchContext'

const CATEGORIES = [
  'Furniture',
  'Electronics',
  'Stationery',
  'Office Accessories',
  'Breakroom',
]

export default function SearchForm() {
  const { runSearch, loading } = useSearch()

  const [filters, setFilters] = useState({
    q: '',
    category: '',
    minPrice: '',
    maxPrice: '',
  })

  const handleChange = (e) => {
    setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    runSearch(filters)
  }

  const handleReset = () => {
    const cleared = { q: '', category: '', minPrice: '', maxPrice: '' }
    setFilters(cleared)
    runSearch(cleared)
  }

  return (
    <section className="search-panel">
      <h2>Search Inventory</h2>
      <form className="search-form" onSubmit={handleSubmit}>

        {/* Product name */}
        <div className="input-group">
          <label htmlFor="q">Product Name</label>
          <input
            type="text"
            id="q"
            name="q"
            placeholder="e.g., Chair, Desk..."
            value={filters.q}
            onChange={handleChange}
          />
        </div>

        {/* Category dropdown */}
        <div className="input-group">
          <label htmlFor="category">Category</label>
          <select
            id="category"
            name="category"
            value={filters.category}
            onChange={handleChange}
          >
            <option value="">All Categories</option>
            {CATEGORIES.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        {/* Price range */}
        <div className="input-group price-row">
          <div className="price-input">
            <label htmlFor="minPrice">Min Price ($)</label>
            <input
              type="number"
              id="minPrice"
              name="minPrice"
              placeholder="0"
              min="0"
              value={filters.minPrice}
              onChange={handleChange}
            />
          </div>
          <span className="separator">—</span>
          <div className="price-input">
            <label htmlFor="maxPrice">Max Price ($)</label>
            <input
              type="number"
              id="maxPrice"
              name="maxPrice"
              placeholder="Any"
              min="0"
              value={filters.maxPrice}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="form-actions">
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Searching...' : 'Search'}
          </button>
          <button type="button" className="btn-secondary" onClick={handleReset}>
            Reset
          </button>
        </div>
      </form>
    </section>
  )
}
