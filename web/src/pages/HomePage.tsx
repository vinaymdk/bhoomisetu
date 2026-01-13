import { Link } from 'react-router-dom';
import './HomePage.css';

export const HomePage = () => {
  return (
    <div className="home-page">
      <section className="home-hero">
        <div className="home-hero-content">
          <h1 className="home-hero-title">Find Your Dream Property</h1>
          <p className="home-hero-subtitle">
            AI-powered real estate platform connecting buyers and sellers
          </p>
          <div className="home-hero-actions">
            <Link to="/search" className="home-hero-button home-hero-button-primary">
              Search Properties
            </Link>
            <Link to="/login" className="home-hero-button home-hero-button-secondary">
              List Your Property
            </Link>
          </div>
        </div>
      </section>

      <section className="home-features">
        <div className="home-features-container">
          <h2 className="home-section-title">Why Choose Bhoomisetu?</h2>
          <div className="home-features-grid">
            <div className="home-feature-card">
              <div className="home-feature-icon">🤖</div>
              <h3 className="home-feature-title">AI-Powered Search</h3>
              <p className="home-feature-description">
                Find properties using natural language queries with AI assistance
              </p>
            </div>
            <div className="home-feature-card">
              <div className="home-feature-icon">🔒</div>
              <h3 className="home-feature-title">Verified Listings</h3>
              <p className="home-feature-description">
                All properties are verified by our customer service team
              </p>
            </div>
            <div className="home-feature-card">
              <div className="home-feature-icon">💬</div>
              <h3 className="home-feature-title">24/7 Support</h3>
              <p className="home-feature-description">
                Get help anytime with our AI chat support
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
