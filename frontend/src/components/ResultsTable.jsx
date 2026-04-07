import { useSearch } from '../context/SearchContext'

const toUSD = (n) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n)

export default function ResultsTable() {
  const { results, loading, error, searched } = useSearch()

  // Loading state
  if (loading) {
    return (
      <div className="loading-indicator">
        <div className="spinner" />
        <p>Searching...</p>
      </div>
    )
  }

  // API error (e.g. invalid price range)
  if (error) {
    return <div className="error-message">{error}</div>
  }

  // No results found after a search was made
  if (searched && results.length === 0) {
    return (
      <div className="no-results">
        <svg xmlns="http://www.w3.org/2000/svg" width="56" height="56" viewBox="0 0 24 24"
          fill="none" stroke="currentColor" strokeWidth="1.5"
          strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <h3>No results found</h3>
        <p>Try adjusting your search filters.</p>
      </div>
    )
  }

  // Initial state — nothing searched yet
  if (!searched) {
    return null
  }

  // Results table
  return (
    <div className="results-container">
      <div className="results-header">
        <h2>Results</h2>
        <span className="results-count">
          {results.length} item{results.length !== 1 ? 's' : ''} found
        </span>
      </div>

      <table className="results-table">
        <thead>
          <tr>
            <th>Product Name</th>
            <th>Category</th>
            <th>Price</th>
            <th>Supplier</th>
          </tr>
        </thead>
        <tbody>
          {results.map(item => (
            <tr key={item.id}>
              <td className="col-name">{item.productName}</td>
              <td><span className="badge">{item.category}</span></td>
              <td className="col-price">{toUSD(item.price)}</td>
              <td className="col-supplier">{item.supplier?.name || 'Unknown'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
