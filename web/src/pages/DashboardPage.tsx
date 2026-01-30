import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { adminService } from '../services/admin.service';
import { useEffect, useMemo, useState } from 'react';
import './DashboardPage.css';

export const DashboardPage = () => {
  const { user, roles } = useAuth();
  const isAdmin = roles.includes('admin');
  const isBuyer = roles.includes('buyer');
  const isSeller = roles.includes('seller') || roles.includes('agent');
  const isCs = roles.includes('customer_service');
  const [adminStats, setAdminStats] = useState<Record<string, number> | null>(null);

  const adminHighlights = useMemo(
    () => [
      { label: 'Total Users', key: 'totalUsers' },
      { label: 'Pending Properties', key: 'pendingVerificationProperties' },
      { label: 'Flagged Reviews', key: 'flaggedReviews' },
      { label: 'Total Revenue', key: 'totalRevenue' },
    ],
    [],
  );

  useEffect(() => {
    if (!isAdmin) return;
    adminService
      .getDashboardStats()
      .then((stats) => {
        const next = adminHighlights.reduce<Record<string, number>>((acc, item) => {
          acc[item.key] = (stats as Record<string, number>)[item.key] ?? 0;
          return acc;
        }, {});
        setAdminStats(next);
      })
      .catch(() => {});
  }, [isAdmin, adminHighlights]);

  return (
    <div className="dashboard-page">
      <div className="dashboard-container">
        <h1 className="dashboard-title">Dashboard</h1>
        <div className="dashboard-welcome">
          <p>Welcome back, <strong>{user?.fullName}</strong>!</p>
          <p>Your roles: {roles.join(', ')}</p>
        </div>
        <div className="dashboard-content">
          {isAdmin && (
            <section className="dashboard-section">
              <h2>Admin Overview</h2>
              <div className="dashboard-card-grid">
                {adminHighlights.map((item) => (
                  <div className="dashboard-card" key={item.key}>
                    <span className="dashboard-card-label">{item.label}</span>
                    <strong>{adminStats?.[item.key] ?? '—'}</strong>
                  </div>
                ))}
              </div>
              <div className="dashboard-links">
                <Link to="/admin" className="dashboard-link-card">
                  <strong>Admin Panel</strong>
                  <span>Manage users, approvals, reviews, and reports.</span>
                </Link>
              </div>
            </section>
          )}

          {isBuyer && (
            <section className="dashboard-section">
              <h2>Buyer Workspace</h2>
              <div className="dashboard-links">
                <Link to="/properties" className="dashboard-link-card">
                  <strong>Browse Properties</strong>
                  <span>View listings and save your favorites.</span>
                </Link>
                <Link to="/buyer-requirements" className="dashboard-link-card">
                  <strong>Buyer Requirements</strong>
                  <span>Manage your property requirements.</span>
                </Link>
                <Link to="/mediation/my-interests" className="dashboard-link-card">
                  <strong>My Interests</strong>
                  <span>Track your mediation and interest requests.</span>
                </Link>
              </div>
            </section>
          )}

          {isSeller && (
            <section className="dashboard-section">
              <h2>Seller Workspace</h2>
              <div className="dashboard-links">
                <Link to="/my-listings" className="dashboard-link-card">
                  <strong>My Listings</strong>
                  <span>Manage your properties and status.</span>
                </Link>
                <Link to="/list-property" className="dashboard-link-card">
                  <strong>Create Listing</strong>
                  <span>Submit a new property for verification.</span>
                </Link>
                <Link to="/mediation/property-interests" className="dashboard-link-card">
                  <strong>Buyer Interests</strong>
                  <span>Review active interest expressions.</span>
                </Link>
              </div>
            </section>
          )}

          {isCs && (
            <section className="dashboard-section">
              <h2>Customer Service Workspace</h2>
              <div className="dashboard-links">
                <Link to="/cs/dashboard" className="dashboard-link-card">
                  <strong>Verification Queue</strong>
                  <span>Approve or reject property submissions.</span>
                </Link>
                <Link to="/mediation/pending" className="dashboard-link-card">
                  <strong>Mediation Tasks</strong>
                  <span>Handle pending mediation assignments.</span>
                </Link>
                <Link to="/cs/support-chat" className="dashboard-link-card">
                  <strong>Support Chat</strong>
                  <span>Respond to user support chats.</span>
                </Link>
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
};
