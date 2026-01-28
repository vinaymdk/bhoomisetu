import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { customerService } from '../services/customerService.service';
import type { PendingVerificationProperty, UrgencyLevel } from '../types/customer-service';
import './CustomerServiceDashboardPage.css';

const statusOptions = [
  { value: 'pending_verification', label: 'Pending Verification' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'live', label: 'Live' },
];

const urgencyOptions: { value: UrgencyLevel; label: string }[] = [
  { value: 'low', label: 'Low' },
  { value: 'normal', label: 'Normal' },
  { value: 'high', label: 'High' },
  { value: 'urgent', label: 'Urgent' },
];

export const CustomerServiceDashboardPage = () => {
  const [items, setItems] = useState<PendingVerificationProperty[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);
  const [stats, setStats] = useState<{ pending: number; verified: number; rejected: number; total: number } | null>(null);

  const [filters, setFilters] = useState({
    status: 'pending_verification',
    city: '',
    propertyType: '',
    urgencyLevel: '',
    search: '',
  });

  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / limit)), [total, limit]);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const [pending, csStats] = await Promise.all([
        customerService.getPending({
          ...filters,
          page,
          limit,
          ...(filters.city ? { city: filters.city.trim() } : {}),
          ...(filters.propertyType ? { propertyType: filters.propertyType } : {}),
          ...(filters.urgencyLevel ? { urgencyLevel: filters.urgencyLevel } : {}),
          ...(filters.search ? { search: filters.search.trim() } : {}),
        }),
        customerService.getStats(),
      ]);
      setItems(pending.properties || []);
      setTotal(pending.total || 0);
      setStats(csStats);
    } catch (e: any) {
      setError(e.response?.data?.message || 'Failed to load verification queue.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const applyFilters = () => {
    setPage(1);
    void load();
  };

  const clearFilters = () => {
    setFilters({
      status: 'pending_verification',
      city: '',
      propertyType: '',
      urgencyLevel: '',
      search: '',
    });
    setPage(1);
    void load();
  };

  return (
    <div className="cs-dashboard-page">
      <div className="cs-dashboard-container">
        <div className="cs-dashboard-header">
          <div>
            <h1>Customer Service Dashboard</h1>
            <p>Review and verify property listings submitted by sellers.</p>
          </div>
          <div className="cs-dashboard-actions">
            <Link className="cs-refresh-btn" to="/cs/support-chat">
              Support Chat
            </Link>
            <button className="cs-refresh-btn" onClick={load} disabled={loading}>
              Refresh
            </button>
          </div>
        </div>

        {stats && (
          <div className="cs-stats">
            <div>
              <span className="cs-stat-label">Pending</span>
              <strong>{stats.pending}</strong>
            </div>
            <div>
              <span className="cs-stat-label">Verified</span>
              <strong>{stats.verified}</strong>
            </div>
            <div>
              <span className="cs-stat-label">Rejected</span>
              <strong>{stats.rejected}</strong>
            </div>
            <div>
              <span className="cs-stat-label">Total</span>
              <strong>{stats.total}</strong>
            </div>
          </div>
        )}

        <div className="cs-filters">
          <label>
            Status
            <select value={filters.status} onChange={(e) => setFilters((prev) => ({ ...prev, status: e.target.value }))}>
              {statusOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </label>
          <label>
            City
            <input
              value={filters.city}
              onChange={(e) => setFilters((prev) => ({ ...prev, city: e.target.value }))}
              placeholder="e.g., Hyderabad"
            />
          </label>
          <label>
            Property Type
            <select
              value={filters.propertyType}
              onChange={(e) => setFilters((prev) => ({ ...prev, propertyType: e.target.value }))}
            >
              <option value="">All</option>
              <option value="apartment">Apartment</option>
              <option value="house">House</option>
              <option value="villa">Villa</option>
              <option value="plot">Plot</option>
              <option value="commercial">Commercial</option>
              <option value="industrial">Industrial</option>
              <option value="agricultural">Agricultural</option>
              <option value="other">Other</option>
            </select>
          </label>
          <label>
            Urgency
            <select
              value={filters.urgencyLevel}
              onChange={(e) => setFilters((prev) => ({ ...prev, urgencyLevel: e.target.value }))}
            >
              <option value="">All</option>
              {urgencyOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </label>
          <label className="cs-filter-search">
            Search
            <input
              value={filters.search}
              onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
              placeholder="Title, address, description..."
            />
          </label>
          <div className="cs-filter-actions">
            <button className="primary" onClick={applyFilters} disabled={loading}>
              Apply
            </button>
            <button className="secondary" onClick={clearFilters} disabled={loading}>
              Clear
            </button>
          </div>
        </div>

        {loading && <div className="cs-state">Loading verification queue...</div>}
        {error && <div className="cs-state cs-error">❌ {error}</div>}

        {!loading && !error && items.length === 0 && (
          <div className="cs-state">No properties found for the selected filters.</div>
        )}

        {!loading && !error && items.length > 0 && (
          <div className="cs-list">
            {items.map((item) => (
              <div key={item.property.id} className="cs-card">
                <div className="cs-card-header">
                  <div>
                    <h3>{item.property.title}</h3>
                    <p>{item.property.location?.address}</p>
                    <p>
                      {item.property.location?.city}, {item.property.location?.state}
                    </p>
                  </div>
                  <span className={`cs-status cs-status-${item.property.status}`}>{item.property.status.replaceAll('_', ' ')}</span>
                </div>
                <div className="cs-card-body">
                  <div>
                    <span className="label">Seller</span>
                    <span>{item.seller.fullName || 'Unknown'}</span>
                  </div>
                  <div>
                    <span className="label">Contact</span>
                    <span>{item.seller.primaryPhone || item.seller.primaryEmail || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="label">Price</span>
                    <span>₹{item.property.price.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="label">Area</span>
                    <span>
                      {item.property.area} {item.property.areaUnit}
                    </span>
                  </div>
                </div>
                <div className="cs-card-actions">
                  <Link to={`/cs/properties/${item.property.id}`} className="primary">
                    Review & Verify
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="cs-pagination">
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1 || loading}>
            Prev
          </button>
          <span>
            Page {page} of {totalPages}
          </span>
          <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages || loading}>
            Next
          </button>
        </div>
      </div>
    </div>
  );
};
