import { useState } from 'react';
import type { Review, ReportReason } from '../../types/review';
import { RatingDisplay } from './RatingDisplay';
import './Reviews.css';

interface ReviewCardProps {
  review: Review;
  canVote: boolean;
  canReport: boolean;
  canReply: boolean;
  onVoteHelpful: (reviewId: string, isHelpful: boolean) => Promise<void>;
  onReport: (reviewId: string, reason: ReportReason, details?: string) => Promise<void>;
  onReply: (reviewId: string, replyText: string) => Promise<void>;
}

export const ReviewCard = ({
  review,
  canVote,
  canReport,
  canReply,
  onVoteHelpful,
  onReport,
  onReply,
}: ReviewCardProps) => {
  const [replyText, setReplyText] = useState('');
  const [reportReason, setReportReason] = useState<ReportReason>('spam');
  const [reportDetails, setReportDetails] = useState('');
  const [busy, setBusy] = useState(false);

  const handleVote = async (isHelpful: boolean) => {
    if (busy) return;
    setBusy(true);
    try {
      await onVoteHelpful(review.id, isHelpful);
    } finally {
      setBusy(false);
    }
  };

  const handleReport = async () => {
    if (busy) return;
    setBusy(true);
    try {
      await onReport(review.id, reportReason, reportDetails.trim() || undefined);
      setReportDetails('');
    } finally {
      setBusy(false);
    }
  };

  const handleReply = async () => {
    const text = replyText.trim();
    if (!text || busy) return;
    setBusy(true);
    try {
      await onReply(review.id, text);
      setReplyText('');
    } finally {
      setBusy(false);
    }
  };

  const reviewerLabel = review.isAnonymous ? 'Anonymous' : review.reviewerName || 'Reviewer';
  const tagClass = review.status === 'flagged' ? 'flagged' : review.status === 'pending' ? 'pending' : '';

  return (
    <div className="reviews-card">
      <div className="reviews-card-header">
        <div>
          <strong>{review.title || 'Review'}</strong>
          <div className="reviews-meta">
            {reviewerLabel} • {new Date(review.createdAt).toLocaleDateString()}
          </div>
        </div>
        <RatingDisplay rating={review.overallRating} />
      </div>
      <div className="reviews-tags">
        {review.isVerifiedPurchase && <span className="reviews-tag verified">Verified</span>}
        {review.sentimentLabel && <span className="reviews-tag">{review.sentimentLabel}</span>}
        {review.status !== 'approved' && <span className={`reviews-tag ${tagClass}`}>{review.status}</span>}
      </div>
      <div className="reviews-content">{review.comment}</div>
      {(review.pros || review.cons) && (
        <div className="reviews-pros-cons">
          {review.pros && (
            <div>
              <strong>Pros:</strong> {review.pros}
            </div>
          )}
          {review.cons && (
            <div>
              <strong>Cons:</strong> {review.cons}
            </div>
          )}
        </div>
      )}
      <div className="reviews-footer">
        <div className="reviews-helpful">
          <span className="reviews-meta">
            Helpful {review.helpfulCount} • Not Helpful {review.notHelpfulCount}
          </span>
          {canVote && (
            <>
              <button
                type="button"
                className={review.userVoteIsHelpful ? 'active' : ''}
                onClick={() => handleVote(true)}
                disabled={busy}
              >
                Helpful
              </button>
              <button
                type="button"
                className={review.userVoteIsHelpful === false && review.hasUserVoted ? 'active' : ''}
                onClick={() => handleVote(false)}
                disabled={busy}
              >
                Not Helpful
              </button>
            </>
          )}
        </div>
        {review.repliesCount ? <span className="reviews-meta">{review.repliesCount} replies</span> : null}
      </div>
      {canReport && (
        <div className="reviews-form-grid">
          <div>
            <label>Report reason</label>
            <select value={reportReason} onChange={(e) => setReportReason(e.target.value as ReportReason)}>
              <option value="fake">Fake</option>
              <option value="spam">Spam</option>
              <option value="inappropriate">Inappropriate</option>
              <option value="offensive">Offensive</option>
              <option value="misleading">Misleading</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label>Details (optional)</label>
            <input
              type="text"
              value={reportDetails}
              onChange={(e) => setReportDetails(e.target.value)}
              placeholder="Share more context"
            />
          </div>
          <button type="button" className="reviews-btn" onClick={handleReport} disabled={busy}>
            Report Review
          </button>
        </div>
      )}
      {canReply && (
        <div className="reviews-reply">
          <label>Reply as seller/agent</label>
          <textarea
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder="Write a response"
          />
          <button type="button" className="reviews-btn primary" onClick={handleReply} disabled={busy}>
            Send Reply
          </button>
        </div>
      )}
    </div>
  );
};
