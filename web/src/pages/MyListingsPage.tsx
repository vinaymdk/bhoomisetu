import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import type { Property } from '../types/property';
import { propertiesService } from '../services/properties.service';
import { PropertyCard } from '../components/property/PropertyCard';
import './MyListingsPage.css';

export const MyListingsPage = () => {
  const [items, setItems] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const formatError = (message: string) => {
    if (message.toLowerCase().includes('request timed out') || message.toLowerCase().includes('timeout')) {
      return 'Unable to load listings. Please try again later.';
    }
    if (message.toLowerCase().includes('econnrefused') || message.toLowerCase().includes('network')) {
      return 'Connection error. Please check your internet connection.';
    }
    return message;
  };

  const filtered = useMemo(() => {
    if (statusFilter === 'all') return items;
    return items.filter((p) => p.status === statusFilter);
  }, [items, statusFilter]);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await propertiesService.getMyProperties();
      setItems(data);
    } catch (e: any) {
      setError(e.response?.data?.message || 'Failed to load your listings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const submit = async (propertyId: string) => {
    try {
      await propertiesService.submitForVerification(propertyId);
      await load();
    } catch (e: any) {
      alert(e.response?.data?.message || 'Failed to submit for verification.');
    }
  };

  return (
    <div className="my-listings-page">
      <div className="my-listings-container">
        <div className="my-listings-header">
          <div>
            <h1>My Listings</h1>
            <p>Manage your draft and submitted properties.</p>
          </div>
          <Link to="/list-property" className="my-listings-primary-btn">
            + Create Listing
          </Link>
        </div>

        <div className="my-listings-toolbar">
          <div className="my-listings-filter">
            <label>Status</label>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="all">All</option>
              <option value="draft">Draft</option>
              <option value="pending_verification">Pending Verification</option>
              <option value="verified">Verified</option>
              <option value="live">Live</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
          <button className="my-listings-secondary-btn" onClick={load} disabled={loading}>
            Refresh
          </button>
        </div>

        {loading && <div className="my-listings-state">Loading...</div>}
        {error && <div className="my-listings-state my-listings-error">❌ {formatError(error)}</div>}

        {!loading && !error && filtered.length === 0 && (
          <div className="my-listings-state">
            <h3>No listings yet</h3>
            <p>Create your first listing to submit for verification.</p>
            <Link to="/list-property" className="my-listings-primary-btn">
              Create Listing
            </Link>
          </div>
        )}

        {!loading && !error && filtered.length > 0 && (
          <div className="my-listings-grid">
            {filtered.map((p) => (
              <div key={p.id} className="my-listings-item">
                <div className="my-listings-status-row">
                  <span className={`status-badge status-${p.status}`}>{p.status.replaceAll('_', ' ')}</span>
                  <div className="listing-actions">
                    <Link to={`/my-listings/${p.id}/edit`} className="submit-btn">
                      Edit
                    </Link>
                    {p.status === 'draft' && (
                      <button className="submit-btn" onClick={() => submit(p.id)}>
                        Submit for verification
                      </button>
                    )}
                  </div>
                </div>
                <PropertyCard property={p} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};


