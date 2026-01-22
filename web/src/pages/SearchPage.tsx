import { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { searchService, type SearchFilters, type AiSearchResponse } from '../services/search.service';
import { PropertyCard } from '../components/property/PropertyCard';
import './SearchPage.css';

type RankBy = 'relevance' | 'price' | 'popularity' | 'urgency' | 'newest';
type ListingType = 'sale' | 'rent';
type PropertyType = 'apartment' | 'house' | 'villa' | 'plot' | 'commercial' | 'industrial' | 'agricultural' | 'other';

export const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);
  
  // Search state
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [results, setResults] = useState<AiSearchResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [dismissedExtracted, setDismissedExtracted] = useState<string[]>([]);

  // Filter state
  const [filters, setFilters] = useState<SearchFilters>({
    query: searchParams.get('q') || undefined,
    listingType: (searchParams.get('listingType') as ListingType) || undefined,
    propertyType: (searchParams.get('propertyType') as PropertyType) || undefined,
    city: searchParams.get('city') || undefined,
    locality: searchParams.get('locality') || undefined,
    minPrice: searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : undefined,
    maxPrice: searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : undefined,
    bedrooms: searchParams.get('bedrooms') ? Number(searchParams.get('bedrooms')) : undefined,
    bathrooms: searchParams.get('bathrooms') ? Number(searchParams.get('bathrooms')) : undefined,
    rankBy: (searchParams.get('rankBy') as RankBy) || 'relevance',
    page: searchParams.get('page') ? Number(searchParams.get('page')) : 1,
    limit: 20,
  });

  // Perform search
  const performSearch = useCallback(async (searchFilters: SearchFilters) => {
    setLoading(true);
    setError(null);
    // Clear dismissed extracted filters when performing new search
    setDismissedExtracted([]);
    
    try {
      const response = await searchService.search(searchFilters);
      setResults(response);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to search properties. Please try again.');
      setResults(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // Update URL params when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    
    if (filters.query) params.set('q', filters.query);
    if (filters.listingType) params.set('listingType', filters.listingType);
    if (filters.propertyType) params.set('propertyType', filters.propertyType);
    if (filters.city) params.set('city', filters.city);
    if (filters.locality) params.set('locality', filters.locality);
    if (filters.minPrice) params.set('minPrice', filters.minPrice.toString());
    if (filters.maxPrice) params.set('maxPrice', filters.maxPrice.toString());
    if (filters.bedrooms) params.set('bedrooms', filters.bedrooms.toString());
    if (filters.bathrooms) params.set('bathrooms', filters.bathrooms.toString());
    if (filters.rankBy && filters.rankBy !== 'relevance') params.set('rankBy', filters.rankBy);
    if (filters.page && filters.page > 1) params.set('page', filters.page.toString());

    setSearchParams(params, { replace: true });
  }, [filters, setSearchParams]);

  // Perform search when filters change
  useEffect(() => {
    if (filters.query || filters.city || filters.propertyType || filters.listingType) {
      performSearch(filters);
    }
  }, [filters, performSearch]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters(prev => ({ ...prev, query: query.trim() || undefined, page: 1 }));
  };

  const handleFilterChange = (key: keyof SearchFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
  };

  // Debounced filter change for text inputs to preserve cursor position
  const handleFilterChangeDebounced = (key: keyof SearchFilters, value: any) => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
    debounceTimer.current = setTimeout(() => {
      handleFilterChange(key, value);
    }, 500);
  };

  const dismissExtracted = (key: string) => {
    setDismissedExtracted(prev => (prev.includes(key) ? prev : [...prev, key]));
  };

  const handleRemoveAiTag = (tag: string) => {
    dismissExtracted(`aiTag:${tag}`);
    const currentTags = filters.aiTags ?? results?.extractedFilters.aiTags ?? [];
    const nextTags = currentTags.filter((t) => t !== tag);
    handleFilterChange('aiTags', nextTags.length ? nextTags : undefined);
  };

  const clearFilters = () => {
    setQuery('');
    setFilters({
      rankBy: 'relevance',
      page: 1,
      limit: 20,
    });
  };

  const handlePageChange = (newPage: number) => {
    setFilters(prev => ({ ...prev, page: newPage }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const activeFiltersCount = [
    filters.listingType,
    filters.propertyType,
    filters.city,
    filters.locality,
    filters.minPrice,
    filters.maxPrice,
    filters.bedrooms,
    filters.bathrooms,
  ].filter(Boolean).length;

  return (
    <div className="search-page">
      <div className="search-page-container">
        {/* Search Header */}
        <div className="search-page-header">
          <h1 className="search-page-title">Property Search</h1>
          <p className="search-page-subtitle">AI-powered property search with natural language</p>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="search-page-search-bar">
          <div className="search-input-container">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              className="search-input"
              placeholder="Search properties using natural language... e.g., '2BHK apartment in Hyderabad under 50L'"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <button type="submit" className="search-button" disabled={loading}>
              {loading ? 'Searching...' : 'Search'}
            </button>
          </div>
        </form>

        {/* Filters and Results Container */}
        <div className="search-page-content">
          {/* Filters Sidebar */}
          <aside className={`search-filters ${showFilters ? 'show' : ''}`}>
            <div className="filters-header">
              <h2>Filters</h2>
              <button className="close-filters" onClick={() => setShowFilters(false)}>×</button>
            </div>

            <div className="filters-content">
              {/* Listing Type */}
              <div className="filter-group">
                <label className="filter-label">Listing Type</label>
                <div className="filter-options">
                  <button
                    type="button"
                    className={`filter-chip ${filters.listingType === 'sale' ? 'active' : ''}`}
                    onClick={() => handleFilterChange('listingType', filters.listingType === 'sale' ? undefined : 'sale')}
                  >
                    For Sale
                  </button>
                  <button
                    type="button"
                    className={`filter-chip ${filters.listingType === 'rent' ? 'active' : ''}`}
                    onClick={() => handleFilterChange('listingType', filters.listingType === 'rent' ? undefined : 'rent')}
                  >
                    For Rent
                  </button>
                </div>
              </div>

              {/* Property Type */}
              <div className="filter-group">
                <label className="filter-label">Property Type</label>
                <select
                  className="filter-select"
                  value={filters.propertyType || ''}
                  onChange={(e) => handleFilterChange('propertyType', e.target.value || undefined)}
                >
                  <option value="">All Types</option>
                  <option value="apartment">Apartment</option>
                  <option value="house">House</option>
                  <option value="villa">Villa</option>
                  <option value="plot">Plot</option>
                  <option value="commercial">Commercial</option>
                  <option value="industrial">Industrial</option>
                  <option value="agricultural">Agricultural</option>
                  <option value="other">Other</option>
                </select>
              </div>

              {/* Location */}
              <div className="filter-group">
                <label className="filter-label">City</label>
                <input
                  type="text"
                  className="filter-input"
                  placeholder="Enter city"
                  value={filters.city || ''}
                  onChange={(e) => handleFilterChangeDebounced('city', e.target.value || undefined)}
                />
              </div>

              <div className="filter-group">
                <label className="filter-label">Locality/Area</label>
                <input
                  type="text"
                  className="filter-input"
                  placeholder="Enter locality"
                  value={filters.locality || ''}
                  onChange={(e) => handleFilterChangeDebounced('locality', e.target.value || undefined)}
                />
              </div>

              {/* Price Range */}
              <div className="filter-group">
                <label className="filter-label">Price Range (₹)</label>
                <div className="price-range-inputs">
                  <input
                    type="number"
                    className="filter-input"
                    placeholder="Min Price"
                    value={filters.minPrice || ''}
                    onChange={(e) => handleFilterChangeDebounced('minPrice', e.target.value ? Number(e.target.value) : undefined)}
                  />
                  <span className="price-separator">to</span>
                  <input
                    type="number"
                    className="filter-input"
                    placeholder="Max Price"
                    value={filters.maxPrice || ''}
                    onChange={(e) => handleFilterChangeDebounced('maxPrice', e.target.value ? Number(e.target.value) : undefined)}
                  />
                </div>
              </div>

              {/* Bedrooms & Bathrooms */}
              <div className="filter-group">
                <label className="filter-label">Bedrooms</label>
                <select
                  className="filter-select"
                  value={filters.bedrooms || ''}
                  onChange={(e) => handleFilterChange('bedrooms', e.target.value ? Number(e.target.value) : undefined)}
                >
                  <option value="">Any</option>
                  <option value="1">1 BHK</option>
                  <option value="2">2 BHK</option>
                  <option value="3">3 BHK</option>
                  <option value="4">4 BHK</option>
                  <option value="5">5+ BHK</option>
                </select>
              </div>

              <div className="filter-group">
                <label className="filter-label">Bathrooms</label>
                <select
                  className="filter-select"
                  value={filters.bathrooms || ''}
                  onChange={(e) => handleFilterChange('bathrooms', e.target.value ? Number(e.target.value) : undefined)}
                >
                  <option value="">Any</option>
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                  <option value="4">4+</option>
                </select>
              </div>

              {/* Clear Filters */}
              {activeFiltersCount > 0 && (
                <button className="clear-filters-button" onClick={clearFilters}>
                  Clear All Filters
                </button>
              )}
            </div>
          </aside>

          {/* Results Section */}
          <main className="search-results">
            {/* Toolbar */}
            <div className="results-toolbar">
              <div className="results-info">
                {results && (
                  <span className="results-count">
                    {results.total} {results.total === 1 ? 'property' : 'properties'} found
                  </span>
                )}
                {results?.searchMetadata && (
                  <span className="search-meta">
                    {results.searchMetadata.aiRankingUsed && '🤖 AI Ranked'} • 
                    Processed in {results.searchMetadata.processingTimeMs}ms
                  </span>
                )}
              </div>
              
              <div className="results-actions">
                <button
                  className="filter-toggle-button"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  {showFilters ? 'Hide' : 'Show'} Filters {activeFiltersCount > 0 && `(${activeFiltersCount})`}
                </button>
                
                <select
                  className="sort-select"
                  value={filters.rankBy || 'relevance'}
                  onChange={(e) => handleFilterChange('rankBy', e.target.value as RankBy)}
                >
                  <option value="relevance">Sort by Relevance</option>
                  <option value="price">Sort by Price</option>
                  <option value="popularity">Sort by Popularity</option>
                  <option value="urgency">Sort by Urgency</option>
                  <option value="newest">Sort by Newest</option>
                </select>
              </div>
            </div>

            {/* Extracted Filters Display */}
            {results?.extractedFilters && Object.keys(results.extractedFilters).length > 0 && (
              <div className="extracted-filters">
                <div className="extracted-filters-header">
                  <h3>AI Extracted Filters:</h3>
                  <button 
                    type="button" 
                    className="reset-extracted-button"
                    title="Clear all extracted filters"
                    onClick={() => {
                      setDismissedExtracted([]);
                      setFilters({
                        ...filters,
                        city: undefined,
                        propertyType: undefined,
                        bedrooms: undefined,
                        aiTags: undefined,
                        page: 1,
                      });
                    }}
                  >
                    ↻ Reset
                  </button>
                </div>
                <div className="extracted-filters-tags">
                  {results.extractedFilters.location?.city && !dismissedExtracted.includes('city') && (
                    <button
                      type="button"
                      className="extracted-tag"
                      onClick={() => {
                        dismissExtracted('city');
                        handleFilterChange('city', undefined);
                      }}
                    >
                      📍 {results.extractedFilters.location.city}
                      <span className="tag-close">×</span>
                    </button>
                  )}
                  {results.extractedFilters.propertyType && !dismissedExtracted.includes('propertyType') && (
                    <button
                      type="button"
                      className="extracted-tag"
                      onClick={() => {
                        dismissExtracted('propertyType');
                        handleFilterChange('propertyType', undefined);
                      }}
                    >
                      🏠 {results.extractedFilters.propertyType}
                      <span className="tag-close">×</span>
                    </button>
                  )}
                  {results.extractedFilters.bedrooms && !dismissedExtracted.includes('bedrooms') && (
                    <button
                      type="button"
                      className="extracted-tag"
                      onClick={() => {
                        dismissExtracted('bedrooms');
                        handleFilterChange('bedrooms', undefined);
                      }}
                    >
                      🛏️ {results.extractedFilters.bedrooms} BHK
                      <span className="tag-close">×</span>
                    </button>
                  )}
                  {results.extractedFilters.aiTags && results.extractedFilters.aiTags.length > 0 && (
                    results.extractedFilters.aiTags
                      .filter((tag) => !dismissedExtracted.includes(`aiTag:${tag}`))
                      .map((tag) => (
                        <button key={tag} type="button" className="extracted-tag ai-tag" onClick={() => handleRemoveAiTag(tag)}>
                          ✨ {tag}
                          <span className="tag-close">×</span>
                        </button>
                      ))
                  )}
                </div>
              </div>
            )}

            {/* Loading State */}
            {loading && (
              <div className="search-loading">
                <div className="loading-spinner"></div>
                <p>Searching properties...</p>
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="search-error">
                <p>❌ {error}</p>
                <button onClick={() => performSearch(filters)}>Try Again</button>
              </div>
            )}

            {/* Results Grid */}
            {!loading && !error && results && (
              <>
                {results.properties.length > 0 ? (
                  <>
                    <div className="properties-grid">
                      {results.properties.map((property) => (
                        <div key={property.id} className="property-result-item">
                          <PropertyCard property={property} />
                          {/* AI Match Reasons */}
                          {property.matchReasons && property.matchReasons.length > 0 && (
                            <div className="match-reasons">
                              <strong>Why this matches:</strong>
                              <ul>
                                {property.matchReasons.map((reason, idx) => (
                                  <li key={idx}>{reason}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                          {/* AI Scores */}
                          {(property.relevanceScore || property.urgencyScore || property.popularityScore) && (
                            <div className="ai-scores">
                              {property.relevanceScore && (
                                <span className="score-badge relevance">
                                  Relevance: {(property.relevanceScore * 100).toFixed(0)}%
                                </span>
                              )}
                              {property.urgencyScore && (
                                <span className="score-badge urgency">
                                  Urgency: {(property.urgencyScore * 100).toFixed(0)}%
                                </span>
                              )}
                              {property.popularityScore && (
                                <span className="score-badge popularity">
                                  Popularity: {(property.popularityScore * 100).toFixed(0)}%
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Pagination */}
                    {results.total > results.limit && (
                      <div className="pagination">
                        <button
                          className="pagination-button"
                          disabled={results.page === 1}
                          onClick={() => handlePageChange(results.page - 1)}
                        >
                          Previous
                        </button>
                        <span className="pagination-info">
                          Page {results.page} of {Math.ceil(results.total / results.limit)}
                        </span>
                        <button
                          className="pagination-button"
                          disabled={results.page >= Math.ceil(results.total / results.limit)}
                          onClick={() => handlePageChange(results.page + 1)}
                        >
                          Next
                        </button>
                      </div>
                    )}

                    {/* Similar Properties */}
                    {results.similarProperties && results.similarProperties.length > 0 && (
                      <div className="similar-properties-section">
                        <h2>Similar Properties</h2>
                        <div className="properties-grid">
                          {results.similarProperties.map((property) => (
                            <PropertyCard key={property.id} property={property} />
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="search-empty">
                    <div className="empty-icon">🔍</div>
                    <h2>No properties found</h2>
                    <p>Try adjusting your search criteria or filters</p>
                    <button onClick={clearFilters}>Clear Filters</button>
                  </div>
                )}
              </>
            )}

            {/* Initial State */}
            {!loading && !error && !results && (
              <div className="search-initial">
                <div className="initial-icon">🏠</div>
                <h2>Start Your Property Search</h2>
                <p>Enter a natural language query or use filters to find your perfect property</p>
                <div className="search-examples">
                  <h3>Example Searches:</h3>
                  <ul>
                    <li onClick={() => setQuery("2BHK apartment in Hyderabad under 50L")}>
                      "2BHK apartment in Hyderabad under 50L"
                    </li>
                    <li onClick={() => setQuery("3BHK villa near beach in Mumbai")}>
                      "3BHK villa near beach in Mumbai"
                    </li>
                    <li onClick={() => setQuery("commercial space in Bangalore")}>
                      "commercial space in Bangalore"
                    </li>
                  </ul>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};
