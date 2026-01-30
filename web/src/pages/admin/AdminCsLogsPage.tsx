import { useEffect, useState } from 'react';
import { adminService } from '../../services/admin.service';
import type { AdminCsLogsResponse } from '../../types/admin';
import './AdminPages.css';

export const AdminCsLogsPage = () => {
  const [activityLogs, setActivityLogs] = useState<AdminCsLogsResponse | null>(null);
  const [verificationLogs, setVerificationLogs] = useState<AdminCsLogsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const [activity, verification] = await Promise.all([
        adminService.getCsActivityLogs({ page: 1, limit: 20 }),
        adminService.getCsVerificationLogs({ page: 1, limit: 20 }),
      ]);
      setActivityLogs(activity);
      setVerificationLogs(verification);
    } catch (e: any) {
      setError(e.response?.data?.message || 'Failed to load CS logs.');
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
            <h1>CS Activity Logs</h1>
            <p>Audit mediation and verification activity performed by CS agents.</p>
          </div>
          <div className="admin-actions">
            <button className="admin-action-btn" onClick={load} disabled={loading}>
              Refresh
            </button>
          </div>
        </div>

        {loading && <div className="admin-state">Loading CS logs...</div>}
        {error && <div className="admin-state admin-error">{error}</div>}

        {!loading && !error && (
          <>
            <div>
              <h2>Mediation Activity</h2>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Action</th>
                    <th>CS Agent</th>
                    <th>Created</th>
                  </tr>
                </thead>
                <tbody>
                  {(activityLogs?.logs || []).map((log: any) => (
                    <tr key={log.id}>
                      <td>{log.actionType || log.type || 'action'}</td>
                      <td>{log.csAgent?.fullName || log.csAgentId || '-'}</td>
                      <td>{log.createdAt ? new Date(log.createdAt).toLocaleString() : '-'}</td>
                    </tr>
                  ))}
                  {(activityLogs?.logs || []).length === 0 && (
                    <tr>
                      <td colSpan={3}>
                        <div className="admin-state">No activity logs found.</div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div>
              <h2>Verification Logs</h2>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Status</th>
                    <th>Property</th>
                    <th>CS Agent</th>
                    <th>Created</th>
                  </tr>
                </thead>
                <tbody>
                  {(verificationLogs?.logs || []).map((log: any) => (
                    <tr key={log.id}>
                      <td>{log.status || '-'}</td>
                      <td>{log.property?.title || log.propertyId || '-'}</td>
                      <td>{log.verifiedByUser?.fullName || log.csAgentId || '-'}</td>
                      <td>{log.createdAt ? new Date(log.createdAt).toLocaleString() : '-'}</td>
                    </tr>
                  ))}
                  {(verificationLogs?.logs || []).length === 0 && (
                    <tr>
                      <td colSpan={4}>
                        <div className="admin-state">No verification logs found.</div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
