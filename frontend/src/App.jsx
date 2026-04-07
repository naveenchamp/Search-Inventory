import { SearchProvider } from './context/SearchContext'
import Navbar from './components/Navbar'
import SearchForm from './components/SearchForm'
import ResultsTable from './components/ResultsTable'

export default function App() {
  return (
    <SearchProvider>
      <Navbar />
      <main className="container main-content">
        <SearchForm />
        <section className="results-panel">
          <ResultsTable />
        </section>
      </main>
    </SearchProvider>
  )
}
