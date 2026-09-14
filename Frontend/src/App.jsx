import { useState } from 'react'
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import Header from './components/Header'
import InfoCard from './components/InfoCard'
import ResultView from './components/ResultView'
import ShortenView from './components/ShortenView'
import StatsView from './components/StatsView'

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  )
}

function AppRoutes() {
  const [result, setResult] = useState(null)
  const location = useLocation()

  function showResult(nextResult) {
    setResult(nextResult)
  }

  function restart() {
    setResult(null)
  }

  return (
    <div className="app-shell">
      <Header onLogoClick={restart} />
      <main className="page-content">
        <Routes>
          <Route
            path="/"
            element={result
              ? <ResultView result={result} onRestart={restart} />
              : <ShortenView onShorten={showResult} />}
          />
          <Route path="/stats" element={<StatsView />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      {location.pathname === '/' && <InfoCard />}
    </div>
  )
}
