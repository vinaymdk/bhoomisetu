import { useState } from 'react';
import type { CreateReviewPayload, ReviewContext, ReviewType } from '../../types/review';
import './Reviews.css';

interface ReviewFormProps {
  initialRevieweeId?: string;
  initialPropertyId?: string;
  initialInterestExpressionId?: string;
  initialChatSessionId?: string;
  initialReviewType?: ReviewType;
  initialReviewContext?: ReviewContext;
  initialOverallRating?: number;
  initialTitle?: string;
  initialComment?: string;
  initialPros?: string;
  initialCons?: string;
  initialIsAnonymous?: boolean;
  interestOptions?: Array<{ id: string; label: string }>;
  chatSessionOptions?: Array<{ id: string; label: string }>;
  submitLabel?: string;
  onSubmit: (payload: CreateReviewPayload) => Promise<void>;
  submitting?: boolean;
}

export const ReviewForm = ({
  initialRevieweeId,
  initialPropertyId,
  initialInterestExpressionId,
  initialChatSessionId,
  initialReviewType,
  initialReviewContext,
  initialOverallRating,
  initialTitle,
  initialComment,
  initialPros,
  initialCons,
  initialIsAnonymous,
  interestOptions = [],
  chatSessionOptions = [],
  submitLabel = 'Submit Review',
  onSubmit,
  submitting,
}: ReviewFormProps) => {
  const [revieweeId, setRevieweeId] = useState(initialRevieweeId ?? '');
  const [propertyId, setPropertyId] = useState(initialPropertyId ?? '');
  const [reviewType, setReviewType] = useState<ReviewType>(initialReviewType ?? 'property');
  const [reviewContext, setReviewContext] = useState<ReviewContext>(initialReviewContext ?? 'after_viewing');
  const [interestExpressionId, setInterestExpressionId] = useState(initialInterestExpressionId ?? '');
  const [chatSessionId, setChatSessionId] = useState(initialChatSessionId ?? '');
  const [overallRating, setOverallRating] = useState(initialOverallRating ?? 5);
  const [title, setTitle] = useState(initialTitle ?? '');
  const [comment, setComment] = useState(initialComment ?? '');
  const [pros, setPros] = useState(initialPros ?? '');
  const [cons, setCons] = useState(initialCons ?? '');
  const [isAnonymous, setIsAnonymous] = useState(initialIsAnonymous ?? false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const rating = Math.min(5, Math.max(1, Math.round(Number(overallRating))));
    const payload: CreateReviewPayload = {
      revieweeId: revieweeId.trim(),
      propertyId: propertyId.trim() || undefined,
      interestExpressionId: interestExpressionId.trim() || undefined,
      chatSessionId: chatSessionId.trim() || undefined,
      reviewType,
      reviewContext,
      overallRating: rating,
      title: title.trim() || undefined,
      comment: comment.trim(),
      pros: pros.trim() || undefined,
      cons: cons.trim() || undefined,
      isAnonymous,
    };
    await onSubmit(payload);
  };

  return (
    <form className="reviews-form" onSubmit={handleSubmit}>
      <div className="reviews-form-grid">
        <div>
          <label>Reviewee ID</label>
          <input
            value={revieweeId}
            onChange={(e) => setRevieweeId(e.target.value)}
            placeholder="Seller/agent user id"
            readOnly={Boolean(initialRevieweeId)}
            required
          />
          {initialRevieweeId && <div className="reviews-helper">Auto-filled from the property.</div>}
        </div>
        <div>
          <label>Property ID (optional)</label>
          <input value={propertyId} onChange={(e) => setPropertyId(e.target.value)} readOnly={Boolean(initialPropertyId)} />
          {initialPropertyId && <div className="reviews-helper">Auto-filled from the property.</div>}
        </div>
        <div>
          <label>Review Type</label>
          <select value={reviewType} onChange={(e) => setReviewType(e.target.value as ReviewType)}>
            <option value="property">Property</option>
            <option value="seller">Seller</option>
            <option value="experience">Experience</option>
            <option value="deal">Deal</option>
          </select>
        </div>
        <div>
          <label>Context</label>
          <select value={reviewContext} onChange={(e) => setReviewContext(e.target.value as ReviewContext)}>
            <option value="after_viewing">After Viewing</option>
            <option value="after_deal">After Deal</option>
            <option value="after_interaction">After Interaction</option>
          </select>
        </div>
        <div>
          <label>Overall Rating (1-5)</label>
          <input
            type="number"
            min={1}
            max={5}
            step={1}
            value={overallRating}
            onChange={(e) => setOverallRating(Number(e.target.value))}
            required
          />
          <div className="reviews-helper">Use whole numbers from 1 to 5.</div>
        </div>
        <div>
          <label>Interest Expression ID (optional)</label>
          {interestOptions.length > 0 ? (
            <select value={interestExpressionId} onChange={(e) => setInterestExpressionId(e.target.value)}>
              <option value="">Select from history</option>
              {interestOptions.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          ) : (
            <input value={interestExpressionId} onChange={(e) => setInterestExpressionId(e.target.value)} />
          )}
          <div className="reviews-helper">Format: UUID (e.g. 550e8400-e29b-41d4-a716-446655440001).</div>
        </div>
        <div>
          <label>Chat Session ID (optional)</label>
          {chatSessionOptions.length > 0 ? (
            <select value={chatSessionId} onChange={(e) => setChatSessionId(e.target.value)}>
              <option value="">Select from history</option>
              {chatSessionOptions.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          ) : (
            <input value={chatSessionId} onChange={(e) => setChatSessionId(e.target.value)} />
          )}
          <div className="reviews-helper">Format: UUID (e.g. 650e8400-e29b-41d4-a716-446655440002).</div>
        </div>
      </div>
      <div>
        <label>Title (optional)</label>
        <input value={title} onChange={(e) => setTitle(e.target.value)} />
      </div>
      <div>
        <label>Review</label>
        <textarea value={comment} onChange={(e) => setComment(e.target.value)} required />
      </div>
      <div className="reviews-form-grid">
        <div>
          <label>Pros (optional)</label>
          <textarea value={pros} onChange={(e) => setPros(e.target.value)} />
        </div>
        <div>
          <label>Cons (optional)</label>
          <textarea value={cons} onChange={(e) => setCons(e.target.value)} />
        </div>
      </div>
      <label>
        <input
          type="checkbox"
          checked={isAnonymous}
          onChange={(e) => setIsAnonymous(e.target.checked)}
        />{' '}
        Post anonymously
      </label>
      <p className="reviews-disclaimer">
        Tip: Add the interest expression or chat session ID to mark the review as verified.
      </p>
      <button className="reviews-btn primary" type="submit" disabled={submitting}>
        {submitLabel}
      </button>
    </form>
  );
};
