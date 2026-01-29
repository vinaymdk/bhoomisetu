import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { reviewsService } from '../../services/reviews.service';
import type { Review, ReviewFilter, ReportReason } from '../../types/review';
import { ReviewCard } from './ReviewCard';
import { useAuth } from '../../context/AuthContext';
import './Reviews.css';

interface ReviewListProps {
  title?: string;
  propertyId?: string;
  revieweeId?: string;
  limit?: number;
  showCreate?: boolean;
}

export const ReviewList = ({ title = 'Reviews', propertyId, revieweeId, limit = 5, showCreate = false }: ReviewListProps) => {
  const navigate = useNavigate();
  const { user, roles } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async (targetPage: number, reset = false) => {
    setLoading(true);
    setError(null);
    try {
      const filter: ReviewFilter = {
        propertyId,
        revieweeId,
        page: targetPage,
        limit,
        sortBy: 'createdAt',
        sortOrder: 'DESC',
      };
      const response = propertyId
        ? await reviewsService.getByProperty(propertyId, filter)
        : revieweeId
          ? await reviewsService.getBySeller(revieweeId, filter)
          : await reviewsService.list(filter);
      setReviews((prev) => (reset ? response.reviews : [...prev, ...response.reviews]));
      setTotal(response.total);
      setPage(response.page);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to load reviews.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load(1, true);
  }, [propertyId, revieweeId, limit]);

  const handleVoteHelpful = async (reviewId: string, isHelpful: boolean) => {
    await reviewsService.voteHelpful(reviewId, isHelpful);
    await load(1, true);
  };

  const handleReport = async (reviewId: string, reason: ReportReason, details?: string) => {
    await reviewsService.report(reviewId, { reportReason: reason, reportDetails: details });
    await load(1, true);
  };

  const handleReply = async (reviewId: string, replyText: string) => {
    await reviewsService.reply(reviewId, replyText);
    await load(1, true);
  };

  const canBuyerCreate = showCreate && roles.includes('buyer') && Boolean(propertyId);

  return (
    <section className="reviews-section">
      <div className="reviews-header">
        <h3>{title}</h3>
        {canBuyerCreate && (
          <div className="reviews-actions">
            <button
              className="reviews-btn primary"
              onClick={() => {
                const search = new URLSearchParams();
                if (propertyId) search.set('propertyId', propertyId);
                if (revieweeId) search.set('revieweeId', revieweeId);
                const suffix = search.toString();
                navigate(`/reviews/new${suffix ? `?${suffix}` : ''}`);
              }}
            >
              Write a Review
            </button>
          </div>
        )}
      </div>
      {loading && <div className="reviews-empty">Loading reviews...</div>}
      {error && <div className="reviews-error">{error}</div>}
      {!loading && !error && reviews.length === 0 && <div className="reviews-empty">No reviews yet.</div>}
      {reviews.map((review) => {
        const isReviewer = user?.id === review.reviewerId;
        const isReviewee = user?.id === review.revieweeId;
        const canVote = Boolean(user?.id) && !isReviewer;
        const canReport = Boolean(user?.id) && !isReviewer;
        const canReply = Boolean(user?.id) && isReviewee && (roles.includes('seller') || roles.includes('agent'));
        return (
          <ReviewCard
            key={review.id}
            review={review}
            canVote={canVote}
            canReport={canReport}
            canReply={canReply}
            onVoteHelpful={handleVoteHelpful}
            onReport={handleReport}
            onReply={handleReply}
          />
        );
      })}
      {reviews.length < total && (
        <button className="reviews-btn" onClick={() => load(page + 1)} disabled={loading}>
          Load more
        </button>
      )}
    </section>
  );
};
