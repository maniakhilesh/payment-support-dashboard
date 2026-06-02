import { Link, NavLink } from 'react-router-dom';

function Navbar() {
  return (
    <header className="navbar">
      <div className="navbar__brand">
        <Link className="navbar__title" to="/" aria-label="PaySupport home">
          <span className="navbar__logo-accent">⚡ Pay</span>Support
        </Link>
      </div>

      <nav className="navbar__nav" aria-label="Primary">
        <NavLink to="/" end className={({ isActive }) => (isActive ? 'navlink navlink--active' : 'navlink')}>
          Dashboard
        </NavLink>
      </nav>
    </header>
  );
}

export default Navbar;