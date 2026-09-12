import StarBorderRoundedIcon from '@mui/icons-material/StarBorderRounded'

export default function Header({ onLogoClick, onStatsClick }) {
  return (
    <header className="site-header">
      <button className="brand" type="button" onClick={onLogoClick}>
        Juno Short<StarBorderRoundedIcon className="brand-star" aria-hidden="true" />
      </button>
      <button className="nav-link" type="button" onClick={onStatsClick}>
        Check Total Press
      </button>
    </header>
  )
}
