import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ReviewForm } from '../components/reviews/ReviewForm';
import { reviewsService } from '../services/reviews.service';
import { useAuth } from '../context/AuthContext';
import { mediationService } from '../services/mediation.service';
import type { InterestExpression } from '../types/mediation';
import type { Review } from '../types/review';
import './CreateReviewPage.css';

export const CreateReviewPage = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { roles } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [interestOptions, setInterestOptions] = useState<Array<{ id: string; label: string }>>([]);
  const [chatOptions, setChatOptions] = useState<Array<{ id: string; label: string }>>([]);
  const [existingReview, setExistingReview] = useState<Review | null>(null);

  const propertyId = useMemo(() => params.get('propertyId') || undefined, [params]);
  const revieweeId = useMemo(() => params.get('revieweeId') || undefined, [params]);
  const propertyIdMissing = !propertyId || !revieweeId;
  const canEditReview = useMemo(
    () => !existingReview || ['pending', 'flagged'].includes(existingReview.status),
    [existingReview],
  );

  useEffect(() => {
    const loadHistory = async () => {
      if (!propertyId) {
        setLoading(false);
        return;
      }
      try {
        const interestResponse = await mediationService.getMyInterests({
          propertyId,
          limit: 5,
          page: 1,
        });
        const interests = (interestResponse.interests ?? []).filter((interest: InterestExpression) =>
          ['approved', 'connected'].includes(interest.connectionStatus),
        );
        const nextInterestOptions = interests.map((interest: InterestExpression) => ({
          id: interest.id,
          label: `${interest.interestType} • ${interest.connectionStatus}`,
        }));
        const nextChatOptions = interests
          .filter((interest: InterestExpression) => Boolean(interest.chatSessionId))
          .map((interest: InterestExpression) => ({
            id: interest.chatSessionId as string,
            label: `${interest.interestType} chat • ${interest.connectionStatus}`,
          }));
        setInterestOptions(nextInterestOptions);
        setChatOptions(nextChatOptions);
        if (!existingReview) {
          const mine = await reviewsService.listMine({ propertyId, limit: 1, page: 1 });
          setExistingReview(mine.reviews?.[0] ?? null);
        }
      } catch {
        // Best effort: fall back to manual entry.
      } finally {
        setLoading(false);
      }
    };
    void loadHistory();
  }, [propertyId, existingReview]);

  const handleSubmit = async (payload: Parameters<typeof reviewsService.create>[0]) => {
    setSubmitting(true);
    setError(null);
    try {
      if (existingReview) {
        await reviewsService.update(existingReview.id, payload);
      } else {
        await reviewsService.create(payload);
      }
      if (payload.propertyId) {
        navigate(`/properties/${payload.propertyId}`);
      } else {
        navigate('/reviews');
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to submit review.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!roles.includes('buyer')) {
    return (
      <div className="create-review-page">
        <h1>Create Review</h1>
        <div className="create-review-card">Only buyers can submit reviews.</div>
      </div>
    );
  }

  if (propertyIdMissing) {
    return (
      <div className="create-review-page">
        <div className="create-review-header">
          <div>
            <h1>Create Review</h1>
            <p>Reviews can only be created from a property details page.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="create-review-page">
      <div className="create-review-header">
        <div>
          <h1>{existingReview ? 'Edit Review' : 'Create Review'}</h1>
          <p>Share your experience after verified viewing or a deal.</p>
        </div>
        <div className="create-review-actions">
          <button
            type="button"
            className="reviews-btn"
            onClick={() => {
              if (propertyId) {
                navigate(`/properties/${propertyId}`);
              } else {
                navigate(-1);
              }
            }}
          >
            Back to property
          </button>
        </div>
      </div>
      {error && <div className="create-review-error">{error}</div>}
      {!canEditReview && (
        <div className="create-review-error">
          This review was already moderated and cannot be edited.
        </div>
      )}
      <div className="create-review-card">
        {loading ? (
          <div className="reviews-empty">Loading review details...</div>
        ) : (
          <ReviewForm
            initialRevieweeId={revieweeId}
            initialPropertyId={propertyId}
            initialInterestExpressionId={existingReview?.interestExpressionId ?? interestOptions[0]?.id}
            initialChatSessionId={existingReview?.chatSessionId ?? chatOptions[0]?.id}
            initialReviewType={existingReview?.reviewType}
            initialReviewContext={existingReview?.reviewContext ?? undefined}
            initialOverallRating={existingReview?.overallRating}
            initialTitle={existingReview?.title ?? undefined}
            initialComment={existingReview?.comment ?? undefined}
            initialPros={existingReview?.pros ?? undefined}
            initialCons={existingReview?.cons ?? undefined}
            initialIsAnonymous={existingReview?.isAnonymous}
            interestOptions={interestOptions}
            chatSessionOptions={chatOptions}
            submitLabel={existingReview ? 'Update Review' : 'Submit Review'}
            onSubmit={handleSubmit}
            submitting={submitting || !canEditReview}
          />
        )}
      </div>
    </div>
  );
};
