import { Link } from 'react-router-dom';
import './Footer.css';

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-content">
          <div className="footer-section">
            <h3 className="footer-title">Bhoomisetu</h3>
            <p className="footer-description">
              Real Estate Mediation Platform connecting buyers and sellers with AI-powered assistance.
            </p>
          </div>

          <div className="footer-section">
            <h4 className="footer-section-title">Quick Links</h4>
            <ul className="footer-links">
              <li><Link to="/">Home</Link></li>
              <li><Link to="/properties">Properties</Link></li>
              <li><Link to="/search">Search</Link></li>
              <li><Link to="/about">About</Link></li>
            </ul>
          </div>

          <div className="footer-section">
            <h4 className="footer-section-title">Support</h4>
            <ul className="footer-links">
              <li><Link to="/help">Help Center</Link></li>
              <li><Link to="/contact">Contact Us</Link></li>
              <li><Link to="/faq">FAQ</Link></li>
              <li><Link to="/terms">Terms of Service</Link></li>
            </ul>
          </div>

          <div className="footer-section">
            <h4 className="footer-section-title">Connect</h4>
            <ul className="footer-links">
              <li><Link to="/privacy">Privacy Policy</Link></li>
              <li><Link to="/blog">Blog</Link></li>
              <li><a href="mailto:support@bhoomisetu.com">support@bhoomisetu.com</a></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p className="footer-copyright">
            © {currentYear} Bhoomisetu. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};
