import StarBorderRoundedIcon from '@mui/icons-material/StarBorderRounded'
import { Link } from 'react-router-dom'

export default function Header({ onLogoClick }) {
  return (
    <header className="site-header">
      <Link className="brand" to="/" onClick={onLogoClick}>
        Juno Short<StarBorderRoundedIcon className="brand-star" aria-hidden="true" />
      </Link>
      <Link className="nav-link" to="/stats">
        Check Total Press
      </Link>
    </header>
  )
}
