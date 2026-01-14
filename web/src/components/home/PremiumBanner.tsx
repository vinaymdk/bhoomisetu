import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './PremiumBanner.css';

interface PremiumBannerProps {
  onDismiss?: () => void;
}

export const PremiumBanner = ({ onDismiss }: PremiumBannerProps) => {
  const { isAuthenticated } = useAuth();
  const [dismissed, setDismissed] = useState(false);

  const handleDismiss = () => {
    setDismissed(true);
    onDismiss?.();
  };

  // Don't show if dismissed or not authenticated
  if (dismissed || !isAuthenticated) {
    return null;
  }

  return (
    <div className="premium-banner">
      <div className="premium-banner-content">
        <div className="premium-banner-text">
          <h3 className="premium-banner-title">✨ Unlock Premium Features</h3>
          <p className="premium-banner-description">
            Get featured listings, priority support, and advanced search capabilities
          </p>
        </div>
        <div className="premium-banner-actions">
          <Link to="/subscriptions" className="premium-banner-button">
            Upgrade Now
          </Link>
          <button 
            className="premium-banner-dismiss"
            onClick={handleDismiss}
            aria-label="Dismiss banner"
          >
            ×
          </button>
        </div>
      </div>
    </div>
  );
};
