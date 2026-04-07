import { createContext, useContext, useState, useCallback } from 'react'

const SearchContext = createContext(null)

/**
 * SearchProvider — wraps the app and provides search state globally.
 * State: filters, results, loading, error.
 * Action: runSearch(filters) fetches from GET /search and updates all state.
 */
export function SearchProvider({ children }) {
  const [results, setResults]   = useState([])
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState(null)
  const [searched, setSearched] = useState(false)

  const runSearch = useCallback(async (filters) => {
    setLoading(true)
    setError(null)
    setSearched(true)

    // Build query string from non-empty filter values
    const params = new URLSearchParams()
    if (filters.q)         params.append('q', filters.q)
    if (filters.category)  params.append('category', filters.category)
    if (filters.minPrice)  params.append('minPrice', filters.minPrice)
    if (filters.maxPrice)  params.append('maxPrice', filters.maxPrice)

    const qs = params.toString() ? `?${params}` : ''

    try {
      const res  = await fetch(`/search${qs}`)
      const data = await res.json()

      if (!res.ok) {
        // API returned a structured error (e.g. invalid price range)
        setError(data.message || 'An error occurred.')
        setResults([])
      } else {
        setResults(data)
      }
    } catch {
      setError('Could not reach the server. Make sure the backend is running.')
      setResults([])
    } finally {
      setLoading(false)
    }
  }, [])

  return (
    <SearchContext.Provider value={{ results, loading, error, searched, runSearch }}>
      {children}
    </SearchContext.Provider>
  )
}

// Custom hook — throws if used outside SearchProvider
export function useSearch() {
  const ctx = useContext(SearchContext)
  if (!ctx) throw new Error('useSearch must be used inside <SearchProvider>')
  return ctx
}
