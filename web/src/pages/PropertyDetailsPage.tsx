import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { propertiesService } from '../services/properties.service';
import type { Property } from '../types/property';
import { useAuth } from '../context/AuthContext';
import { savedPropertiesService } from '../services/savedProperties.service';
import { mediationService } from '../services/mediation.service';
import './PropertyDetailsPage.css';

export const PropertyDetailsPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { roles } = useAuth();
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [interestMessage, setInterestMessage] = useState('');
  const [interestType, setInterestType] = useState('viewing');
  const [priority, setPriority] = useState('normal');
  const [interestStatus, setInterestStatus] = useState<string | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState<number | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!id) return;
      setLoading(true);
      setError(null);
      try {
        const data = await propertiesService.getPropertyById(id);
        setProperty(data);
        if (user?.id) {
          setIsSaved(savedPropertiesService.isSaved(user.id, data.id));
        }
      } catch (e: any) {
        setError(e.response?.data?.message || 'Failed to load property.');
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [id, user?.id]);

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
          <h1>{property.title}</h1>
          <span className={`status-badge status-${property.status}`}>{property.status.replaceAll('_', ' ')}</span>
        </div>
        {user?.id && (
          <button
            className={`property-save-btn ${isSaved ? 'saved' : ''}`}
            onClick={() => {
              const next = savedPropertiesService.toggle(user.id, property.id);
              setIsSaved(next);
            }}
          >
            {isSaved ? '★ Saved' : '☆ Save'}
          </button>
        )}
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

        {roles.includes('buyer') && (
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
                  setInterestStatus('Interest submitted. CS will contact you shortly.');
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
      </div>
    </div>
  );
};
