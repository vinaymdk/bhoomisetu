import { useSearchParams } from 'react-router-dom';
import './PropertiesPage.css';

export const PropertiesPage = () => {
  const [searchParams] = useSearchParams();
  const featured = searchParams.get('featured') === 'true';

  return (
    <div className="properties-page">
      <div className="properties-page-container">
        <div className="properties-page-header">
          <h1 className="properties-page-title">
            {featured ? 'Featured Properties' : 'All Properties'}
          </h1>
          <p className="properties-page-description">
            Browse our collection of properties
          </p>
        </div>
        
        <div className="properties-page-content">
          <div className="properties-page-coming-soon">
            <div className="coming-soon-icon">🏗️</div>
            <h2>Properties Search Coming Soon</h2>
            <p>We're building an advanced property search and filtering system.</p>
            <p>This feature will be available in Module 3.</p>
            <div className="coming-soon-features">
              <h3>Coming Features:</h3>
              <ul>
                <li>Advanced search and filtering</li>
                <li>Property listings with detailed views</li>
                <li>Save and compare properties</li>
                <li>AI-powered property recommendations</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
