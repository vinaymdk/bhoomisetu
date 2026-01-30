import { useEffect, useMemo, useState } from 'react';
import { adminService } from '../../services/admin.service';
import type { AdminPaymentReportResponse } from '../../types/admin';
import './AdminPages.css';

export const AdminPaymentsPage = () => {
  const [data, setData] = useState<AdminPaymentReportResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);

  const totalPages = useMemo(() => Math.max(1, Math.ceil((data?.total || 0) / limit)), [data, limit]);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await adminService.getPaymentReports({ page, limit });
      setData(response);
    } catch (e: any) {
      setError(e.response?.data?.message || 'Failed to load payment reports.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, [page]);

  return (
    <div className="admin-page">
      <div className="admin-container">
        <div className="admin-header">
          <div>
            <h1>Payment Reports</h1>
            <p>Review payment activity, revenue, and fraud signals.</p>
          </div>
          <div className="admin-actions">
            <button className="admin-action-btn" onClick={load} disabled={loading}>
              Refresh
            </button>
          </div>
        </div>

        {data?.summary && (
          <div className="admin-card-grid">
            <div className="admin-card">
              <span className="admin-card-label">Total Amount</span>
              <strong>₹{Number(data.summary.totalAmount || 0).toLocaleString('en-IN')}</strong>
            </div>
            <div className="admin-card">
              <span className="admin-card-label">Completed</span>
              <strong>{data.summary.completedCount ?? 0}</strong>
            </div>
            <div className="admin-card">
              <span className="admin-card-label">Failed</span>
              <strong>{data.summary.failedCount ?? 0}</strong>
            </div>
            <div className="admin-card">
              <span className="admin-card-label">Total Records</span>
              <strong>{data.summary.totalCount ?? 0}</strong>
            </div>
          </div>
        )}

        {loading && <div className="admin-state">Loading payment reports...</div>}
        {error && <div className="admin-state admin-error">{error}</div>}

        {!loading && !error && (
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Status</th>
                <th>Gateway</th>
                <th>Amount</th>
                <th>User</th>
              </tr>
            </thead>
            <tbody>
              {(data?.payments || []).map((payment: any) => (
                <tr key={payment.id}>
                  <td>{payment.id}</td>
                  <td>
                    <span className="admin-pill">{payment.status}</span>
                  </td>
                  <td>{payment.gateway || '-'}</td>
                  <td>₹{Number(payment.amount || 0).toLocaleString('en-IN')}</td>
                  <td>{payment.user?.fullName || payment.userId || '-'}</td>
                </tr>
              ))}
              {(data?.payments || []).length === 0 && (
                <tr>
                  <td colSpan={5}>
                    <div className="admin-state">No payments found.</div>
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
