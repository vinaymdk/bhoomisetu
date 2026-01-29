import { Link } from 'react-router-dom';
import type { Property } from '../../types/property';
import './PropertyCard.css';

interface PropertyCardProps {
  property: Property;
  showFeaturedBadge?: boolean;
}

export const PropertyCard = ({ property, showFeaturedBadge = true }: PropertyCardProps) => {
  const primaryImage = property.images?.find(img => img.isPrimary) || property.images?.[0];
  const imageUrl = primaryImage?.imageUrl || '/placeholder-property.jpg';
  
  const formatPrice = (price: number) => {
    if (price >= 10000000) {
      return `₹${(price / 10000000).toFixed(2)}Cr`;
    } else if (price >= 100000) {
      return `₹${(price / 100000).toFixed(2)}L`;
    }
    return `₹${price.toLocaleString('en-IN')}`;
  };

  const formatCount = (count: number) => {
    if (count >= 1_000_000) {
      return `${(count / 1_000_000).toFixed(1)}M`;
    }
    if (count >= 1_000) {
      return `${(count / 1_000).toFixed(1)}k`;
    }
    return `${count}`;
  };

  const location = `${property.location.city}, ${property.location.state}`;

  return (
    <Link to={`/properties/${property.id}`} className="property-card">
      <div className="property-card-image-container">
        <img 
          src={imageUrl} 
          alt={property.title}
          className="property-card-image"
          loading="lazy"
        />
        {showFeaturedBadge && property.isFeatured && (
          <span className="property-card-featured-badge">Featured</span>
        )}
        {property.listingType === 'rent' && (
          <span className="property-card-listing-type">For Rent</span>
        )}
      </div>
      
      <div className="property-card-content">
        <div className="property-card-header">
          <h3 className="property-card-title">{property.title}</h3>
          <div className="property-card-price">{formatPrice(property.price)}</div>
        </div>
        
        <div className="property-card-location">
          <span className="property-card-location-icon">📍</span>
          <span>{location}</span>
        </div>
        
        <div className="property-card-details">
          {property.bedrooms && (
            <span className="property-card-detail-item">
              <span className="property-card-detail-icon">🛏️</span>
              {property.bedrooms} BHK
            </span>
          )}
          {property.bathrooms && (
            <span className="property-card-detail-item">
              <span className="property-card-detail-icon">🚿</span>
              {property.bathrooms} Bath
            </span>
          )}
          <span className="property-card-detail-item">
            <span className="property-card-detail-icon">📐</span>
            {property.area} {property.areaUnit}
          </span>
        </div>
        
        <div className="property-card-footer">
          <span className="property-card-type">{property.propertyType}</span>
          <div className="property-card-metrics">
            <span className="property-card-likes">♥ {formatCount(property.interestedCount)} likes</span>
            {property.viewsCount > 0 && (
              <span className="property-card-views">{formatCount(property.viewsCount)} views</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
};
