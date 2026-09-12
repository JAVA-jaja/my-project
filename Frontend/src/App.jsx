import { useState } from 'react'
import Header from './components/Header'
import InfoCard from './components/InfoCard'
import ShortenView from './components/ShortenView'

export default function App() {
  const [view, setView] = useState('shorten')

  return (
    <div className="app-shell">
      <Header
        onLogoClick={() => setView('shorten')}
        onStatsClick={() => setView('stats')}
      />
      <main className="page-content">
        {view === 'shorten' && <ShortenView onShorten={() => {}} />}
      </main>
      {view === 'shorten' && <InfoCard />}
    </div>
  )
}
