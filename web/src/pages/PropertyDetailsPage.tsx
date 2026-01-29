import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { propertiesService } from '../services/properties.service';
import type { Property } from '../types/property';
import { useAuth } from '../context/AuthContext';
import { savedPropertiesService } from '../services/savedProperties.service';
import { mediationService } from '../services/mediation.service';
import { ReviewList } from '../components/reviews/ReviewList';
import { reviewsService } from '../services/reviews.service';
import type { Review } from '../types/review';
import './PropertyDetailsPage.css';

export const PropertyDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, roles } = useAuth();
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [interestMessage, setInterestMessage] = useState('');
  const [interestType, setInterestType] = useState('viewing');
  const [priority, setPriority] = useState('normal');
  const [interestStatus, setInterestStatus] = useState<string | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState<number | null>(null);
  const [interestSubmitted, setInterestSubmitted] = useState(false);
  const [existingReview, setExistingReview] = useState<Review | null>(null);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [likeLoading, setLikeLoading] = useState(false);

  const isBuyer = useMemo(() => roles.includes('buyer'), [roles]);
  const canEditReview = useMemo(
    () => Boolean(existingReview && ['pending', 'flagged'].includes(existingReview.status)),
    [existingReview],
  );
  const formatCount = (count: number) => {
    if (count >= 1_000_000) {
      return `${(count / 1_000_000).toFixed(1)}M`;
    }
    if (count >= 1_000) {
      return `${(count / 1_000).toFixed(1)}k`;
    }
    return `${count}`;
  };

  useEffect(() => {
    const load = async () => {
      if (!id) return;
      setLoading(true);
      setError(null);
      try {
        const data = await propertiesService.getPropertyById(id);
        setProperty(data);
        setIsLiked(Boolean(data.isLiked));
        setLikeCount(data.interestedCount);
        if (user?.id) {
          setIsSaved(savedPropertiesService.isSaved(user.id, data.id));
        }
        if (user?.id && isBuyer) {
          try {
            const interestResponse = await mediationService.getMyInterests({
              propertyId: data.id,
              limit: 1,
              page: 1,
            });
            setInterestSubmitted((interestResponse.interests ?? []).length > 0);
          } catch {
            setInterestSubmitted(false);
          }
          try {
            const myReviews = await reviewsService.listMine({ propertyId: data.id, limit: 1, page: 1 });
            setExistingReview(myReviews.reviews?.[0] ?? null);
          } catch {
            setExistingReview(null);
          }
        }
      } catch (e: any) {
        setError(e.response?.data?.message || 'Failed to load property.');
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [id, user?.id, isBuyer]);

  if (loading) {
    return <div className="property-details-page">Loading property...</div>;
  }

  if (error || !property) {
    return <div className="property-details-page">❌ {error || 'Property not found.'}</div>;
  }

  return (
    <div className="property-details-page">
      <div className="property-details-container">
        <div className="property-details-header">
          <div className="property-details-title">
            <h1>{property.title}</h1>
            <button className="property-back-btn" type="button" onClick={() => navigate('/properties')}>
              Back to properties
            </button>
          </div>
          <span className={`status-badge status-${property.status}`}>{property.status.replaceAll('_', ' ')}</span>
        </div>
        <div className="property-actions-row">
          {user?.id && (
            <button
              className={`property-save-btn ${isSaved ? 'saved' : ''}`}
              onClick={() => {
                const next = savedPropertiesService.toggle(user.id, property.id);
                setIsSaved(next);
              }}
            >
              {isSaved ? '🔖 Saved' : '🔖 Save'}
            </button>
          )}
          <div className="property-like-group">
            <button
              type="button"
              className={`property-like-btn ${isLiked ? 'active' : ''}`}
              disabled={!user?.id || likeLoading}
              onClick={async () => {
                if (!user?.id || likeLoading) return;
                setLikeLoading(true);
                try {
                  const response = await propertiesService.toggleLike(property.id);
                  setIsLiked(response.isLiked);
                  setLikeCount(response.interestedCount);
                } finally {
                  setLikeLoading(false);
                }
              }}
            >
              {isLiked ? '♥' : '♡'} Like
            </button>
                                  <span className="property-like-count">♥ {formatCount(likeCount)} likes</span>
          </div>
        </div>
        <p className="property-details-address">
          {property.location.address}, {property.location.city}, {property.location.state}
        </p>

        {property.images && property.images.length > 0 && (
          <div className="property-details-images">
            {property.images.map((img, index) => (
              <button
                key={img.id}
                className="property-image-btn"
                onClick={() => setActiveImageIndex(index)}
                aria-label="Open image"
              >
                <img src={img.imageUrl} alt={property.title} />
              </button>
            ))}
          </div>
        )}
        {activeImageIndex !== null && property.images && (
          <div
            className="property-image-modal"
            role="dialog"
            aria-modal="true"
            onClick={() => setActiveImageIndex(null)}
          >
            <button className="property-image-close" onClick={() => setActiveImageIndex(null)}>
              ✕
            </button>
            <div className="property-image-viewer" onClick={(e) => e.stopPropagation()}>
              <button
                className="property-image-nav"
                onClick={() =>
                  setActiveImageIndex((prev) =>
                    prev === null ? 0 : (prev - 1 + property.images!.length) % property.images!.length,
                  )
                }
              >
                ‹
              </button>
              <img src={property.images[activeImageIndex].imageUrl} alt="Property" />
              <button
                className="property-image-nav"
                onClick={() =>
                  setActiveImageIndex((prev) =>
                    prev === null ? 0 : (prev + 1) % property.images!.length,
                  )
                }
              >
                ›
              </button>
            </div>
            <div className="property-image-thumbs" onClick={(e) => e.stopPropagation()}>
              {property.images.map((img, index) => (
                <button
                  key={img.id}
                  className={`property-thumb ${index === activeImageIndex ? 'active' : ''}`}
                  onClick={() => setActiveImageIndex(index)}
                >
                  <img src={img.imageUrl} alt="Thumbnail" />
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="property-details-grid">
          <div>
            <span className="label">Price</span>
            <span>₹{property.price.toLocaleString()}</span>
          </div>
          <div>
            <span className="label">Area</span>
            <span>
              {property.area} {property.areaUnit}
            </span>
          </div>
          <div>
            <span className="label">Listing Type</span>
            <span>{property.listingType}</span>
          </div>
          <div>
            <span className="label">Property Type</span>
            <span>{property.propertyType}</span>
          </div>
          {property.bedrooms != null && (
            <div>
              <span className="label">Bedrooms</span>
              <span>{property.bedrooms}</span>
            </div>
          )}
          {property.bathrooms != null && (
            <div>
              <span className="label">Bathrooms</span>
              <span>{property.bathrooms}</span>
            </div>
          )}
        </div>

        {property.description && (
          <div className="property-details-description">
            <h3>Description</h3>
            <p>{property.description}</p>
          </div>
        )}

        <div className="property-reviews">
          <div className="property-reviews-header">
            <div>
              <h3>Reviews & Feedback</h3>
              <p>Verified feedback to help you evaluate this listing.</p>
            </div>
            <div className="property-reviews-actions">
              <button
                type="button"
                className="reviews-btn"
                onClick={() => navigate(`/reviews?propertyId=${property.id}`)}
              >
                View all reviews
              </button>
              {isBuyer && (
                <button
                  type="button"
                  className="reviews-btn primary"
                  onClick={() => navigate(`/reviews/new?propertyId=${property.id}&revieweeId=${property.sellerId}`)}
                  disabled={Boolean(existingReview)}
                >
                  {existingReview ? 'Review submitted' : 'Write a review'}
                </button>
              )}
              {isBuyer && existingReview && canEditReview && (
                <button
                  type="button"
                  className="reviews-btn"
                  onClick={() => navigate(`/reviews/new?propertyId=${property.id}&revieweeId=${property.sellerId}`)}
                >
                  Edit review
                </button>
              )}
              {isBuyer && existingReview && !canEditReview && (
                <span className="property-review-badge">Review submitted</span>
              )}
            </div>
          </div>
          <ReviewList
            title="Latest reviews"
            propertyId={property.id}
            revieweeId={property.sellerId}
            limit={3}
            showCreate={false}
          />
        </div>

        {isBuyer && !interestSubmitted && (
          <div className="property-interest-card">
            <h3>Express Interest</h3>
            <p>Customer service will review and connect you after mediation.</p>
            <div className="property-interest-grid">
              <div>
                <label>Interest Type</label>
                <select value={interestType} onChange={(e) => setInterestType(e.target.value)}>
                  <option value="viewing">Viewing</option>
                  <option value="offer">Offer</option>
                  <option value="negotiation">Negotiation</option>
                  <option value="serious_intent">Serious Intent</option>
                </select>
              </div>
              <div>
                <label>Priority</label>
                <select value={priority} onChange={(e) => setPriority(e.target.value)}>
                  <option value="low">Low</option>
                  <option value="normal">Normal</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
            </div>
            <textarea
              placeholder="Add a note for CS (optional)"
              value={interestMessage}
              onChange={(e) => setInterestMessage(e.target.value)}
            />
            <button
              className="property-interest-btn"
              onClick={async () => {
                try {
                  await mediationService.expressInterest({
                    propertyId: property.id,
                    message: interestMessage.trim() || undefined,
                    interestType,
                    priority,
                  });
                  setInterestStatus('Your interest request was submitted. CS will contact you shortly.');
                  setInterestSubmitted(true);
                } catch (err: any) {
                  setInterestStatus(err?.response?.data?.message || 'Failed to submit interest.');
                }
              }}
            >
              Submit Interest
            </button>
            {interestStatus && <div className="property-interest-status">{interestStatus}</div>}
          </div>
        )}
        {isBuyer && interestSubmitted && (
          <div className="property-interest-confirmation">
            Your interest request was submitted. Customer Service will contact you shortly.
          </div>
        )}
      </div>
    </div>
  );
};
