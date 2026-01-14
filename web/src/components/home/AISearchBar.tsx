import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import './AISearchBar.css';

export const AISearchBar = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/search');
    }
  };

  return (
    <div className="ai-search-bar-container">
      <form onSubmit={handleSubmit} className="ai-search-bar">
        <div className="ai-search-bar-input-container">
          <span className="ai-search-bar-icon">🔍</span>
          <input
            type="text"
            className="ai-search-bar-input"
            placeholder="Search properties using natural language... e.g., '2BHK apartment in Hyderabad under 50L'"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button type="submit" className="ai-search-bar-button">
            Search
          </button>
        </div>
        <p className="ai-search-bar-hint">
          💡 Powered by AI - Describe what you're looking for in your own words
        </p>
      </form>
    </div>
  );
};
