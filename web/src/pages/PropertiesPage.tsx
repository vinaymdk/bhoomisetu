import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { PropertyCard } from '../components/property/PropertyCard';
import { propertiesService } from '../services/properties.service';
import type { Property } from '../types/property';
import './PropertiesPage.css';

export const PropertiesPage = () => {
  const [searchParams] = useSearchParams();
  const featured = searchParams.get('featured') === 'true';
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<Property[]>([]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        if (featured) {
          const resp = await propertiesService.getAllProperties({ isFeatured: true, limit: 20 });
          setItems(resp.properties || []);
        } else {
          const resp = await propertiesService.getAllProperties({ limit: 20 });
          setItems(resp.properties || []);
        }
      } catch (e: any) {
        setError(e.response?.data?.message || 'Failed to load properties.');
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [featured]);

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
          {loading && <div className="properties-page-coming-soon"><div className="coming-soon-icon">⏳</div><h2>Loading...</h2></div>}
          {error && <div className="properties-page-coming-soon"><div className="coming-soon-icon">❌</div><h2>{error}</h2></div>}
          {!loading && !error && items.length === 0 && (
            <div className="properties-page-coming-soon">
              <div className="coming-soon-icon">🔍</div>
              <h2>No properties found</h2>
              <p>Try again later.</p>
            </div>
          )}
          {!loading && !error && items.length > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
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
