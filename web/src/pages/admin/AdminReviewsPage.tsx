import { useEffect, useMemo, useState } from 'react';
import { adminService } from '../../services/admin.service';
import type { AdminFlaggedReviewsResponse } from '../../types/admin';
import './AdminPages.css';

export const AdminReviewsPage = () => {
  const [data, setData] = useState<AdminFlaggedReviewsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  const totalPages = useMemo(() => Math.max(1, Math.ceil((data?.total || 0) / limit)), [data, limit]);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await adminService.getFlaggedReviews({ page, limit });
      setData(response);
    } catch (e: any) {
      setError(e.response?.data?.message || 'Failed to load flagged reviews.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, [page]);

  const approve = async (reviewId: string) => {
    const notes = window.prompt('Approval notes (optional):') || undefined;
    try {
      await adminService.approveReview(reviewId, notes);
      await load();
    } catch (e: any) {
      setError(e.response?.data?.message || 'Failed to approve review.');
    }
  };

  const reject = async (reviewId: string) => {
    const reason = window.prompt('Rejection reason (required):');
    if (!reason) return;
    try {
      await adminService.rejectReview(reviewId, reason);
      await load();
    } catch (e: any) {
      setError(e.response?.data?.message || 'Failed to reject review.');
    }
  };

  const hide = async (reviewId: string) => {
    const reason = window.prompt('Hide reason (required):');
    if (!reason) return;
    try {
      await adminService.hideReview(reviewId, reason);
      await load();
    } catch (e: any) {
      setError(e.response?.data?.message || 'Failed to hide review.');
    }
  };

  return (
    <div className="admin-page">
      <div className="admin-container">
        <div className="admin-header">
          <div>
            <h1>Review Moderation</h1>
            <p>Moderate flagged reviews and protect platform trust.</p>
          </div>
          <div className="admin-actions">
            <button className="admin-action-btn" onClick={load} disabled={loading}>
              Refresh
            </button>
          </div>
        </div>

        {loading && <div className="admin-state">Loading flagged reviews...</div>}
        {error && <div className="admin-state admin-error">{error}</div>}

        {!loading && !error && (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Review</th>
                <th>Reviewer</th>
                <th>Property</th>
                <th>Rating</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {(data?.reviews || []).map((review: any) => (
                <tr key={review.id}>
                  <td>{review.title || review.comment?.slice(0, 80) || 'Review'}</td>
                  <td>{review.reviewer?.fullName || review.reviewerId}</td>
                  <td>{review.property?.title || review.propertyId || '-'}</td>
                  <td>{review.overallRating ?? '-'}</td>
                  <td>
                    <div className="admin-actions">
                      <button className="admin-action-btn primary" onClick={() => approve(review.id)}>
                        Approve
                      </button>
                      <button className="admin-action-btn warning" onClick={() => hide(review.id)}>
                        Hide
                      </button>
                      <button className="admin-action-btn danger" onClick={() => reject(review.id)}>
                        Reject
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {(data?.reviews || []).length === 0 && (
                <tr>
                  <td colSpan={5}>
                    <div className="admin-state">No flagged reviews.</div>
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
