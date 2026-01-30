import { useEffect, useMemo, useState } from 'react';
import { adminService } from '../../services/admin.service';
import type { AdminUser, AdminUserListResponse } from '../../types/admin';
import './AdminPages.css';

const statusOptions = ['active', 'suspended', 'pending', 'deleted'];
const roleOptions = ['buyer', 'seller', 'agent', 'customer_service', 'admin'];

export const AdminUsersPage = () => {
  const [data, setData] = useState<AdminUserListResponse | null>(null);
  const [items, setItems] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    role: '',
    minFraudScore: '',
    maxFraudScore: '',
  });

  const totalPages = useMemo(() => Math.max(1, Math.ceil((data?.total || 0) / limit)), [data, limit]);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await adminService.listUsers({
        page,
        limit,
        search: filters.search.trim() || undefined,
        status: filters.status || undefined,
        role: filters.role || undefined,
        minFraudScore: filters.minFraudScore || undefined,
        maxFraudScore: filters.maxFraudScore || undefined,
      });
      setData(response);
      setItems(response.users || []);
    } catch (e: any) {
      setError(e.response?.data?.message || 'Failed to load users.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, [page]);

  const applyFilters = () => {
    setPage(1);
    void load();
  };

  const toggleUserStatus = async (user: AdminUser) => {
    if (!user.id) return;
    try {
      if (user.status === 'suspended') {
        await adminService.activateUser(user.id);
      } else {
        const reason = window.prompt('Suspend reason (optional):') || undefined;
        await adminService.suspendUser(user.id, reason);
      }
      await load();
    } catch (e: any) {
      setError(e.response?.data?.message || 'Failed to update user status.');
    }
  };

  const deleteUser = async (user: AdminUser) => {
    if (!user.id) return;
    if (!window.confirm('Soft delete this user?')) return;
    try {
      await adminService.deleteUser(user.id);
      await load();
    } catch (e: any) {
      setError(e.response?.data?.message || 'Failed to delete user.');
    }
  };

  return (
    <div className="admin-page">
      <div className="admin-container">
        <div className="admin-header">
          <div>
            <h1>User Management</h1>
            <p>Search and manage platform users, roles, and status.</p>
          </div>
          <div className="admin-actions">
            <button className="admin-action-btn" onClick={load} disabled={loading}>
              Refresh
            </button>
          </div>
        </div>

        <div className="admin-filter-grid">
          <label>
            Search
            <input
              value={filters.search}
              onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
              placeholder="Name, email, phone"
            />
          </label>
          <label>
            Status
            <select value={filters.status} onChange={(e) => setFilters((prev) => ({ ...prev, status: e.target.value }))}>
              <option value="">All</option>
              {statusOptions.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </label>
          <label>
            Role
            <select value={filters.role} onChange={(e) => setFilters((prev) => ({ ...prev, role: e.target.value }))}>
              <option value="">All</option>
              {roleOptions.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
          </label>
          <label>
            Min fraud score
            <input
              type="number"
              value={filters.minFraudScore}
              onChange={(e) => setFilters((prev) => ({ ...prev, minFraudScore: e.target.value }))}
            />
          </label>
          <label>
            Max fraud score
            <input
              type="number"
              value={filters.maxFraudScore}
              onChange={(e) => setFilters((prev) => ({ ...prev, maxFraudScore: e.target.value }))}
            />
          </label>
          <div>
            <button className="admin-action-btn primary" onClick={applyFilters} disabled={loading}>
              Apply
            </button>
          </div>
        </div>

        {loading && <div className="admin-state">Loading users...</div>}
        {error && <div className="admin-state admin-error">{error}</div>}

        {!loading && !error && (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Contact</th>
                <th>Status</th>
                <th>Roles</th>
                <th>Fraud Score</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((user) => (
                <tr key={user.id}>
                  <td>{user.fullName || 'Unnamed'}</td>
                  <td>
                    <div>{user.primaryEmail || '-'}</div>
                    <div>{user.primaryPhone || '-'}</div>
                  </td>
                  <td>
                    <span className="admin-pill">{user.status || 'unknown'}</span>
                  </td>
                  <td>
                    {(user.userRoles || []).map((role) => role.role?.code).filter(Boolean).join(', ') || '-'}
                  </td>
                  <td>{user.fraudRiskScore ?? '-'}</td>
                  <td>
                    <div className="admin-actions">
                      <button className="admin-action-btn" onClick={() => toggleUserStatus(user)}>
                        {user.status === 'suspended' ? 'Activate' : 'Suspend'}
                      </button>
                      <button className="admin-action-btn danger" onClick={() => deleteUser(user)}>
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr>
                  <td colSpan={6}>
                    <div className="admin-state">No users found.</div>
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
