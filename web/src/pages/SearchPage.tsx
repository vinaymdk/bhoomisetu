import { useSearchParams } from 'react-router-dom';
import './SearchPage.css';

export const SearchPage = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q');

  return (
    <div className="search-page">
      <div className="search-page-container">
        <div className="search-page-header">
          <h1 className="search-page-title">Property Search</h1>
          {query && (
            <p className="search-page-query">
              Search results for: <strong>{query}</strong>
            </p>
          )}
        </div>
        
        <div className="search-page-content">
          <div className="search-page-coming-soon">
            <div className="coming-soon-icon">🔍</div>
            <h2>Advanced Search Coming Soon</h2>
            <p>We're building an AI-powered property search system.</p>
            <p>This feature will be available in Module 3.</p>
            <div className="coming-soon-features">
              <h3>Coming Features:</h3>
              <ul>
                <li>Natural language property search</li>
                <li>AI-powered search suggestions</li>
                <li>Advanced filters and sorting</li>
                <li>Map-based property search</li>
                <li>Saved searches and alerts</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
