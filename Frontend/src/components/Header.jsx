export default function Header({ onLogoClick, onStatsClick }) {
  return (
    <header className="site-header">
      <button className="brand" type="button" onClick={onLogoClick}>
        Juno Short<span className="brand-star" aria-hidden="true">☆</span>
      </button>
      <button className="nav-link" type="button" onClick={onStatsClick}>
        Check Total Press
      </button>
    </header>
  )
}
