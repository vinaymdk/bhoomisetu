import { useEffect, useState } from 'react';
import { savedPropertiesService } from '../services/savedProperties.service';
import { propertiesService } from '../services/properties.service';
import { useAuth } from '../context/AuthContext';
import type { Property } from '../types/property';
import './SavedPropertiesPage.css';

export const SavedPropertiesPage = () => {
  const { user } = useAuth();
  const [items, setItems] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    if (!user?.id) return;
    setLoading(true);
    setError(null);
    try {
      const ids = savedPropertiesService.getSavedIds(user.id);
      if (ids.length === 0) {
        setItems([]);
      } else {
        const results = await Promise.all(ids.map((id) => propertiesService.getPropertyById(id)));
        setItems(results);
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to load saved properties.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, [user?.id]);

  return (
    <div className="saved-page">
      <div className="saved-header">
        <h1>Saved Properties</h1>
        <p>Your shortlist of properties to revisit later.</p>
      </div>

      {loading && <div className="saved-state">Loading saved properties...</div>}
      {!loading && error && <div className="saved-state error">{error}</div>}
      {!loading && !error && items.length === 0 && (
        <div className="saved-state empty">No saved properties yet.</div>
      )}

      <div className="saved-grid">
        {items.map((item) => (
          <div key={item.id} className="saved-card">
            <img src={item.images?.[0]?.imageUrl || '/placeholder-property.jpg'} alt={item.title} />
            <div className="saved-card-body">
              <h3>{item.title}</h3>
              <p>
                {item.location.city}, {item.location.state}
              </p>
              <div className="saved-card-actions">
                <a href={`/properties/${item.id}`}>View</a>
                {user?.id && (
                  <button
                    onClick={() => {
                      savedPropertiesService.remove(user.id, item.id);
                      load();
                    }}
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

