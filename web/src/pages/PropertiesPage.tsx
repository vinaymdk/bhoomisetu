import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { PropertyCard } from '../components/property/PropertyCard';
import { propertiesService } from '../services/properties.service';
import type { Property } from '../types/property';
import { useAuth } from '../context/AuthContext';
import './PropertiesPage.css';

export const PropertiesPage = () => {
  const [searchParams] = useSearchParams();
  const featured = searchParams.get('featured') === 'true';

  const { isAuthenticated, isLoading: authLoading } = useAuth();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<Property[]>([]);

  const formatError = (message: string) => {
    if (message.toLowerCase().includes('timeout')) {
      return 'Unable to load properties. Please try again later.';
    }
    if (message.toLowerCase().includes('network')) {
      return 'Connection error. Please check your internet connection.';
    }
    return message;
  };

  useEffect(() => {
    // 🚫 Do not load until auth state is ready
    if (authLoading || !isAuthenticated) return;

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const resp = featured
          ? await propertiesService.getAllProperties({ isFeatured: true, limit: 20 })
          : await propertiesService.getAllProperties({ limit: 20 });

        setItems(resp.properties || []);
      } catch (e: any) {
        setError(e.response?.data?.message || 'Failed to load properties.');
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [featured, authLoading, isAuthenticated]);

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
          {(loading || authLoading) && (
            <div className="properties-page-coming-soon">
              <div className="coming-soon-icon">⏳</div>
              <h2>Loading...</h2>
            </div>
          )}

          {error && (
            <div className="properties-page-coming-soon">
              <div className="coming-soon-icon">❌</div>
              <h2>{formatError(error)}</h2>
            </div>
          )}

          {!loading && !error && items.length === 0 && (
            <div className="properties-page-coming-soon">
              <div className="coming-soon-icon">🔍</div>
              <h2>No properties found</h2>
              <p>Try again later.</p>
            </div>
          )}

          {!loading && !error && items.length > 0 && (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: 16,
              }}
            >
              {items.map((p) => (
                <PropertyCard key={p.id} property={p} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
