import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import logo from '../../assets/logo-and-fav/bhoomisetu-logo.png';
import './Header.css';
import { savedPropertiesService } from '../../services/savedProperties.service';
import { badgePreferencesService } from '../../services/badgePreferences.service';
import { propertiesService } from '../../services/properties.service';
import { buyerRequirementsService } from '../../services/buyerRequirements.service';
import { notificationsService } from '../../services/notifications.service';
import { supportChatService } from '../../services/supportChat.service';
import { createSupportChatSocket } from '../../services/supportChatSocket';

export const Header = () => {
  const { isAuthenticated, user, logout, roles } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const canList = roles.includes('seller') || roles.includes('agent');
  const canVerify = roles.includes('customer_service') || roles.includes('admin');
  const canBuy = roles.includes('buyer') || roles.includes('admin');
  const isSeller = roles.includes('seller') || roles.includes('agent');
  const isAdmin = roles.includes('admin');
  const [savedCount, setSavedCount] = useState(0);
  const [listCount, setListCount] = useState(0);
  const [reqsCount, setReqsCount] = useState(0);
  const [showSavedBadge, setShowSavedBadge] = useState(true);
  const [showListBadge, setShowListBadge] = useState(true);
  const [showReqsBadge, setShowReqsBadge] = useState(true);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [unreadChats, setUnreadChats] = useState(0);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!user?.id) return;
    const loadBadges = () => {
      setShowSavedBadge(badgePreferencesService.get(user.id, 'saved'));
      setShowListBadge(badgePreferencesService.get(user.id, 'list'));
      setShowReqsBadge(badgePreferencesService.get(user.id, 'reqs'));
      setSavedCount(savedPropertiesService.getSavedIds(user.id).length);
      if (canList) {
        propertiesService.getMyProperties().then((items) => setListCount(items.length)).catch(() => {});
      }
      if (canBuy) {
        buyerRequirementsService.list({ page: 1, limit: 1 }).then((resp) => setReqsCount(resp.total)).catch(() => {});
      }
    };
    loadBadges();
    const handler = () => loadBadges();
    window.addEventListener('badgePrefsChanged', handler);
    window.addEventListener('storage', handler);
    return () => {
      window.removeEventListener('badgePrefsChanged', handler);
      window.removeEventListener('storage', handler);
    };
  }, [user?.id, canList, canBuy]);

  useEffect(() => {
    if (!isAuthenticated) return;
    notificationsService
      .list({ page: 1, limit: 1 })
      .then((response) => setUnreadNotifications(response.unreadCount))
      .catch(() => {});
  }, [isAuthenticated]);

  useEffect(() => {
    const handler = (event: Event) => {
      const detail = (event as CustomEvent<number>).detail;
      if (typeof detail === 'number') {
        setUnreadNotifications(detail);
      }
    };
    window.addEventListener('notificationsBadgeUpdated', handler);
    return () => window.removeEventListener('notificationsBadgeUpdated', handler);
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;
    const refresh = () => {
      supportChatService.getUnreadCount().then(setUnreadChats).catch(() => {});
    };
    refresh();
    const socket = createSupportChatSocket();
    socket.on('message', refresh);
    return () => {
      socket.disconnect();
    };
  }, [isAuthenticated]);

  useEffect(() => {
    const handler = (event: Event) => {
      const detail = (event as CustomEvent<number>).detail;
      if (typeof detail === 'number') {
        setUnreadChats(detail);
      }
    };
    window.addEventListener('chatBadgeUpdated', handler);
    return () => window.removeEventListener('chatBadgeUpdated', handler);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  useEffect(() => {
    if (!userMenuOpen) return;
    const handleClick = (event: MouseEvent) => {
      if (!userMenuRef.current) return;
      if (!userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [userMenuOpen]);

  const isChatPage = location.pathname.startsWith('/notifications');

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
              <Link to="/buyer-requirements" className="header-nav-link header-nav-link-badge">
                Buyer Requirements
                {showReqsBadge && reqsCount > 0 && <span className="nav-badge">{reqsCount}</span>}
              </Link>
              <Link to="/mediation/my-interests" className="header-nav-link">
                My Interests
              </Link>
              {canVerify && (
                <Link to="/cs/dashboard" className="header-nav-link">
                  CS Dashboard
                </Link>
              )}
              {isAdmin && (
                <Link to="/admin" className="header-nav-link">
                  Admin Panel
                </Link>
              )}
              {canVerify && (
                <Link to="/cs/support-chat" className="header-nav-link">
                  Support Chat
                </Link>
              )}
              {canVerify && (
                <Link to="/mediation/pending" className="header-nav-link">
                  Mediation
                </Link>
              )}
              <>
                <Link to="/my-listings" className="header-nav-link">
                  My Listings
                </Link>
                {showListBadge && listCount > 0 && (
                  <span className="nav-badge-inline">{listCount}</span>
                )}
                {isSeller && (
                  <Link to="/mediation/property-interests" className="header-nav-link">
                    Interests
                  </Link>
                )}
                <Link to="/list-property" className="header-nav-link header-nav-link-primary">
                  List Property
                </Link>
              </>
              <button
                type="button"
                className="header-notifications"
                onClick={() => navigate('/search')}
                aria-label="Search"
                title="Search"
              >
                <i className="fas fa-search header-notifications-icon" aria-hidden="true" />
              </button>
              <button
                type="button"
                className="header-notifications"
                onClick={() => navigate('/saved')}
                aria-label="Saved"
                title="Saved"
              >
                <i className="far fa-bookmark header-notifications-icon" aria-hidden="true" />
                {showSavedBadge && savedCount > 0 && <span className="header-notifications-badge">{savedCount}</span>}
              </button>
              <button
                className="header-notifications"
                onClick={() => navigate('/notifications')}
                aria-label="View notifications"
              >
                <i className="far fa-bell header-notifications-icon" aria-hidden="true" />
                {unreadNotifications > 0 && <span className="header-notifications-badge">{unreadNotifications}</span>}
              </button>
              {!isChatPage && (
                <button
                  className="header-notifications"
                  onClick={() => navigate('/notifications')}
                  aria-label="Open support chat"
                >
                  <i className="far fa-comments header-notifications-icon" aria-hidden="true" />
                  {unreadChats > 0 && <span className="header-notifications-badge">{unreadChats}</span>}
                </button>
              )}
              <div className="header-user" ref={userMenuRef}>
                <button
                  className="header-user-button"
                  onClick={() => setUserMenuOpen((prev) => !prev)}
                  aria-haspopup="menu"
                  aria-expanded={userMenuOpen}
                >
                  <span className="header-user-avatar" aria-hidden="true">
                    {user?.avatarUrl ? (
                      <img src={user.avatarUrl} alt="" />
                    ) : (
                      <i className="far fa-user header-user-avatar-fallback" />
                    )}
                  </span>
                  <span className="header-user-caret">▾</span>
                </button>
                {userMenuOpen && (
                  <div className="header-user-menu" role="menu">
                    <button
                      className="header-user-menu-item"
                      onClick={() => {
                        setUserMenuOpen(false);
                        navigate('/profile');
                      }}
                    >
                      Profile
                    </button>
                    <button
                      className="header-user-menu-item"
                      onClick={() => {
                        setUserMenuOpen(false);
                        navigate('/settings');
                      }}
                    >
                      Settings
                    </button>
                    <button className="header-user-menu-item danger" onClick={handleLogout}>
                      Logout
                    </button>
                  </div>
                )}
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
