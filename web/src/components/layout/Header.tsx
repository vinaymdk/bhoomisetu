import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import logo from '../../assets/logo-and-fav/bhoomisetu-logo.png';
import './Header.css';

export const Header = () => {
  const { isAuthenticated, user, logout, roles } = useAuth();
  const navigate = useNavigate();
  const canList = roles.includes('seller') || roles.includes('agent');

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="header">
      <div className="header-container">
        <Link to="/" className="header-logo">
          <img src={logo} alt="BhoomiSetu" className="header-logo-img" />
          <span className="header-logo-text">BhoomiSetu</span>
        </Link>

        <nav className="header-nav">
          {isAuthenticated ? (
            <>
              <Link to="/dashboard" className="header-nav-link">
                Dashboard
              </Link>
              <Link to="/properties" className="header-nav-link">
                Properties
              </Link>
              <Link to="/search" className="header-nav-link">
                Search
              </Link>
              {canList && (
                <>
                  <Link to="/my-listings" className="header-nav-link">
                    My Listings
                  </Link>
                  <Link to="/list-property" className="header-nav-link header-nav-link-primary">
                    List Property
                  </Link>
                </>
              )}
              <div className="header-user">
                <span className="header-user-name">{user?.fullName}</span>
                <button onClick={handleLogout} className="header-logout-btn">
                  Logout
                </button>
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="header-nav-link">
                Login
              </Link>
              <Link to="/login?purpose=signup" className="header-nav-link header-nav-link-primary">
                Sign Up
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};
