import { useEffect, useState } from 'react';
import { mediationService } from '../services/mediation.service';
import type { InterestExpression } from '../types/mediation';
import './MediationPages.css';

const statusLabels: Record<string, string> = {
  pending: 'Pending',
  cs_reviewing: 'CS Reviewing',
  seller_checking: 'Seller Checking',
  approved: 'Approved',
  rejected: 'Rejected',
  connected: 'Connected',
};

export const BuyerInterestsPage = () => {
  const [items, setItems] = useState<InterestExpression[]>([]);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const resp = await mediationService.getMyInterests({
          connectionStatus: status || undefined,
          page: 1,
          limit: 20,
        });
        setItems(resp.interests || []);
      } catch (err: any) {
        setError(err?.response?.data?.message || 'Failed to load interests.');
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [status]);

  return (
    <div className="mediation-page">
      <div className="mediation-header">
        <div>
          <h1>My Interests</h1>
          <p>Track your interest expressions and CS mediation status.</p>
        </div>
        <div className="mediation-filter">
          <label>Status</label>
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">All</option>
            {Object.keys(statusLabels).map((key) => (
              <option key={key} value={key}>
                {statusLabels[key]}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading && <div className="mediation-state">Loading interests...</div>}
      {!loading && error && <div className="mediation-state error">{error}</div>}
      {!loading && !error && items.length === 0 && (
        <div className="mediation-state empty">No interests yet. Express interest in a property to begin mediation.</div>
      )}

      <div className="mediation-grid">
        {items.map((item) => (
          <div key={item.id} className="mediation-card">
            <div className="mediation-card-header">
              <h3>{item.property?.title || 'Property'}</h3>
              <span className={`status-pill status-${item.connectionStatus}`}>
                {statusLabels[item.connectionStatus] || item.connectionStatus}
              </span>
            </div>
            <p className="mediation-meta">
              {item.property?.location?.city}, {item.property?.location?.state}
            </p>
            <div className="mediation-row">
              <span>Interest Type</span>
              <span>{item.interestType}</span>
            </div>
            <div className="mediation-row">
              <span>Priority</span>
              <span>{item.priority}</span>
            </div>
            {item.message && <p className="mediation-message">“{item.message}”</p>}
            {item.property?.id && (
              <a className="mediation-link" href={`/properties/${item.property.id}`}>
                View Property
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

