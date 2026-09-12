import { useState } from 'react'
import Header from './components/Header'
import InfoCard from './components/InfoCard'
import ResultView from './components/ResultView'
import ShortenView from './components/ShortenView'
import StatsView from './components/StatsView'

export default function App() {
  const [view, setView] = useState('shorten')
  const [result, setResult] = useState(null)

  function showResult(nextResult) {
    setResult(nextResult)
    setView('result')
  }

  function restart() {
    setResult(null)
    setView('shorten')
  }

  return (
    <div className="app-shell">
      <Header
        onLogoClick={restart}
        onStatsClick={() => setView('stats')}
      />
      <main className="page-content">
        {view === 'shorten' && <ShortenView onShorten={showResult} />}
        {view === 'result' && <ResultView result={result} onRestart={restart} />}
        {view === 'stats' && <StatsView />}
      </main>
      {(view === 'shorten' || view === 'result') && <InfoCard />}
    </div>
  )
}
