import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { buyerRequirementsService } from '../services/buyerRequirements.service';
import type { BuyerRequirement } from '../types/buyerRequirement';
import './BuyerRequirementsPage.css';

const statusLabels: Record<string, string> = {
  active: 'Active',
  fulfilled: 'Fulfilled',
  cancelled: 'Cancelled',
  expired: 'Expired',
};

const formatBudget = (minBudget?: number | null, maxBudget?: number | null, budgetType?: string) => {
  const typeLabel = budgetType === 'rent' ? '/month' : '';
  if (minBudget && maxBudget) return `₹${minBudget.toLocaleString()} - ₹${maxBudget.toLocaleString()}${typeLabel}`;
  if (maxBudget) return `Up to ₹${maxBudget.toLocaleString()}${typeLabel}`;
  return 'Budget not set';
};

const getRemainingDays = (expiresAt?: string | null) => {
  if (!expiresAt) return null;
  const diffMs = new Date(expiresAt).getTime() - Date.now();
  const days = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  return days;
};

export const BuyerRequirementsPage = () => {
  const [items, setItems] = useState<BuyerRequirement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState('active');
  const [search, setSearch] = useState('');

  const totalMatches = useMemo(() => items.reduce((sum, item) => sum + (item.matchCount || 0), 0), [items]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await buyerRequirementsService.list({
          status: statusFilter,
          search: search.trim() || undefined,
          page: 1,
          limit: 20,
        });
        setItems(response.requirements || []);
      } catch (err: any) {
        setError(err?.response?.data?.message || 'Failed to load requirements.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [statusFilter, search]);

  return (
    <div className="buyer-req-page">
      <div className="buyer-req-header">
        <div>
          <h1>Buyer Requirements</h1>
          <p className="buyer-req-subtitle">
            Post what you need and track matching listings curated for you.
          </p>
        </div>
        <Link to="/buyer-requirements/new" className="buyer-req-primary-btn">
          Post Requirement
        </Link>
      </div>

      <div className="buyer-req-summary">
        <div className="summary-card">
          <span className="summary-label">Total Requirements</span>
          <span className="summary-value">{items.length}</span>
        </div>
        <div className="summary-card">
          <span className="summary-label">Total Matches</span>
          <span className="summary-value">{totalMatches}</span>
        </div>
      </div>

      <div className="buyer-req-filters">
        <div className="filter-group">
          <label>Status</label>
          <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
            {Object.keys(statusLabels).map((status) => (
              <option key={status} value={status}>
                {statusLabels[status]}
              </option>
            ))}
          </select>
        </div>
        <div className="filter-group">
          <label>Search</label>
          <input
            type="text"
            placeholder="Search by title or description"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>
      </div>

      {loading && <div className="buyer-req-state">Loading requirements...</div>}
      {!loading && error && <div className="buyer-req-state error">{error}</div>}
      {!loading && !error && items.length === 0 && (
        <div className="buyer-req-state empty">
          No requirements found. Create your first requirement to start matching.
        </div>
      )}

      <div className="buyer-req-grid">
        {items.map((req) => (
          <Link key={req.id} to={`/buyer-requirements/${req.id}`} className="buyer-req-card">
            <div className="buyer-req-card-header">
              <h3>{req.title || `${req.propertyDetails.propertyType || 'Property'} in ${req.location.city}`}</h3>
              <span className={`status-pill status-${req.status}`}>{statusLabels[req.status] || req.status}</span>
            </div>
            <p className="buyer-req-card-meta">
              {req.location.locality ? `${req.location.locality}, ` : ''}
              {req.location.city}, {req.location.state}
            </p>
            <div className="buyer-req-card-row">
              <div>
                <span className="label">Budget</span>
                <span className="value">{formatBudget(req.budget.minBudget, req.budget.maxBudget, req.budget.budgetType)}</span>
              </div>
              <div>
                <span className="label">Area</span>
                <span className="value">
                  {req.propertyDetails.minArea || req.propertyDetails.maxArea
                    ? `${req.propertyDetails.minArea || 0} - ${req.propertyDetails.maxArea || 'Any'} ${req.propertyDetails.areaUnit}`
                    : 'Flexible'}
                </span>
              </div>
            </div>
            <div className="buyer-req-card-row">
              <div>
                <span className="label">Matches</span>
                <span className="value">{req.matchCount}</span>
              </div>
              <div>
                <span className="label">Updated</span>
                <span className="value">{new Date(req.updatedAt).toLocaleDateString()}</span>
              </div>
            </div>
            {req.expiresAt && (
              <div className="buyer-req-card-row">
                <div>
                  <span className="label">Expiry</span>
                  <span className="value">
                    {getRemainingDays(req.expiresAt) && getRemainingDays(req.expiresAt)! > 0
                      ? `${getRemainingDays(req.expiresAt)} days left`
                      : 'Expired'}
                  </span>
                </div>
              </div>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
};

