import './Reviews.css';

interface RatingDisplayProps {
  rating: number;
  max?: number;
  showValue?: boolean;
}

export const RatingDisplay = ({ rating, max = 5, showValue = true }: RatingDisplayProps) => {
  const safeRating = Number.isFinite(rating) ? Math.max(0, Math.min(rating, max)) : 0;
  const stars = Array.from({ length: max }, (_, index) => {
    const filled = index + 1 <= Math.round(safeRating);
    return filled ? '★' : '☆';
  });

  return (
    <span className="rating-display" aria-label={`Rating ${safeRating} out of ${max}`}>
      <span className="rating-stars">{stars.join(' ')}</span>
      {showValue && <span className="rating-value">{safeRating.toFixed(1)}</span>}
    </span>
  );
};
