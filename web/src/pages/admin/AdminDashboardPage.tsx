import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminService } from '../../services/admin.service';
import type { AdminDashboardStats } from '../../types/admin';
import './AdminPages.css';

const statSections = [
  { key: 'totalUsers', label: 'Total Users' },
  { key: 'activeUsers', label: 'Active Users' },
  { key: 'suspendedUsers', label: 'Suspended Users' },
  { key: 'pendingVerificationProperties', label: 'Pending Properties' },
  { key: 'liveProperties', label: 'Live Properties' },
  { key: 'totalRevenue', label: 'Total Revenue' },
  { key: 'failedPayments', label: 'Failed Payments' },
  { key: 'flaggedReviews', label: 'Flagged Reviews' },
  { key: 'aiFraudChecksToday', label: 'Fraud Checks Today' },
  { key: 'aiFakeReviewDetectionsToday', label: 'Fake Reviews Today' },
];

export const AdminDashboardPage = () => {
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await adminService.getDashboardStats();
      setStats(response);
    } catch (e: any) {
      setError(e.response?.data?.message || 'Failed to load admin dashboard stats.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  return (
    <div className="admin-page">
      <div className="admin-container">
        <div className="admin-header">
          <div>
            <h1>Admin Dashboard</h1>
            <p>Overview of platform activity and administrative workflows.</p>
          </div>
          <div className="admin-actions">
            <button className="admin-action-btn" onClick={load} disabled={loading}>
              Refresh
            </button>
          </div>
        </div>

        {loading && <div className="admin-state">Loading admin stats...</div>}
        {error && <div className="admin-state admin-error">{error}</div>}

        {stats && (
          <div className="admin-card-grid">
            {statSections.map((item) => (
              <div className="admin-card" key={item.key}>
                <span className="admin-card-label">{item.label}</span>
                <strong>{(stats as Record<string, number>)[item.key] ?? 0}</strong>
              </div>
            ))}
          </div>
        )}

        <div>
          <h2>Admin Sections</h2>
          <div className="admin-link-grid">
            <Link className="admin-link-card" to="/admin/users">
              <strong>User Management</strong>
              <span>Manage roles, suspensions, and fraud scores.</span>
            </Link>
            <Link className="admin-link-card" to="/admin/properties">
              <strong>Property Approvals</strong>
              <span>Review pending property submissions.</span>
            </Link>
            <Link className="admin-link-card" to="/admin/reviews">
              <strong>Review Moderation</strong>
              <span>Approve, reject, or hide flagged reviews.</span>
            </Link>
            <Link className="admin-link-card" to="/admin/payments">
              <strong>Payment Reports</strong>
              <span>Revenue, fraud, and payment status reporting.</span>
            </Link>
            <Link className="admin-link-card" to="/admin/ai-metrics">
              <strong>AI Metrics</strong>
              <span>Fraud, sentiment, and fake review metrics.</span>
            </Link>
            <Link className="admin-link-card" to="/admin/cs-logs">
              <strong>CS Activity Logs</strong>
              <span>Mediation and verification activity logs.</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
