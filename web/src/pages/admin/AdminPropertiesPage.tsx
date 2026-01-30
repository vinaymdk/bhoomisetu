import { useEffect, useMemo, useState } from 'react';
import { adminService } from '../../services/admin.service';
import type { AdminPendingPropertiesResponse } from '../../types/admin';
import './AdminPages.css';

export const AdminPropertiesPage = () => {
  const [data, setData] = useState<AdminPendingPropertiesResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  const totalPages = useMemo(() => Math.max(1, Math.ceil((data?.total || 0) / limit)), [data, limit]);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await adminService.listPendingProperties(page, limit);
      setData(response);
    } catch (e: any) {
      setError(e.response?.data?.message || 'Failed to load pending properties.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, [page]);

  const approve = async (propertyId: string) => {
    const notes = window.prompt('Approval notes (optional):') || undefined;
    try {
      await adminService.approveProperty(propertyId, notes);
      await load();
    } catch (e: any) {
      setError(e.response?.data?.message || 'Failed to approve property.');
    }
  };

  const reject = async (propertyId: string) => {
    const reason = window.prompt('Rejection reason (required):');
    if (!reason) return;
    try {
      await adminService.rejectProperty(propertyId, reason);
      await load();
    } catch (e: any) {
      setError(e.response?.data?.message || 'Failed to reject property.');
    }
  };

  return (
    <div className="admin-page">
      <div className="admin-container">
        <div className="admin-header">
          <div>
            <h1>Property Approvals</h1>
            <p>Review and approve pending property listings.</p>
          </div>
          <div className="admin-actions">
            <button className="admin-action-btn" onClick={load} disabled={loading}>
              Refresh
            </button>
          </div>
        </div>

        {loading && <div className="admin-state">Loading pending properties...</div>}
        {error && <div className="admin-state admin-error">{error}</div>}

        {!loading && !error && (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Location</th>
                <th>Seller</th>
                <th>Price</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {(data?.properties || []).map((property: any) => (
                <tr key={property.id}>
                  <td>{property.title}</td>
                  <td>{[property.city, property.state].filter(Boolean).join(', ')}</td>
                  <td>{property.seller?.fullName || property.sellerId}</td>
                  <td>₹{Number(property.price || 0).toLocaleString('en-IN')}</td>
                  <td>
                    <div className="admin-actions">
                      <button className="admin-action-btn primary" onClick={() => approve(property.id)}>
                        Approve
                      </button>
                      <button className="admin-action-btn danger" onClick={() => reject(property.id)}>
                        Reject
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {(data?.properties || []).length === 0 && (
                <tr>
                  <td colSpan={5}>
                    <div className="admin-state">No pending properties.</div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}

        <div className="admin-actions">
          <button className="admin-action-btn" onClick={() => setPage((prev) => Math.max(1, prev - 1))} disabled={page <= 1}>
            Previous
          </button>
          <span>
            Page {page} / {totalPages}
          </span>
          <button
            className="admin-action-btn"
            onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
            disabled={page >= totalPages}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};
