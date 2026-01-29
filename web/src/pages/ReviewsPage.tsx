import { useSearchParams } from 'react-router-dom';
import { ReviewList } from '../components/reviews/ReviewList';
import './ReviewsPage.css';

export const ReviewsPage = () => {
  const [params] = useSearchParams();
  const propertyId = params.get('propertyId') || undefined;
  const revieweeId = params.get('revieweeId') || undefined;

  const title = propertyId ? 'Property Reviews' : revieweeId ? 'Seller Reviews' : 'All Reviews';

  return (
    <div className="reviews-page">
      <div className="reviews-page-header">
        <h1>{title}</h1>
        <p>Verified feedback to help you make confident property decisions.</p>
      </div>
      {propertyId ? (
        <ReviewList title="Latest reviews" propertyId={propertyId} revieweeId={revieweeId} limit={8} showCreate />
      ) : (
        <div className="reviews-empty">Open reviews from a property details page to see property-specific feedback.</div>
      )}
    </div>
  );
};
