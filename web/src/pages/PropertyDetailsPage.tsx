import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { propertiesService } from '../services/properties.service';
import type { Property } from '../types/property';
import './PropertyDetailsPage.css';

export const PropertyDetailsPage = () => {
  const { id } = useParams();
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!id) return;
      setLoading(true);
      setError(null);
      try {
        const data = await propertiesService.getPropertyById(id);
        setProperty(data);
      } catch (e: any) {
        setError(e.response?.data?.message || 'Failed to load property.');
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [id]);

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
        <p className="property-details-address">
          {property.location.address}, {property.location.city}, {property.location.state}
        </p>

        {property.images && property.images.length > 0 && (
          <div className="property-details-images">
            {property.images.map((img) => (
              <img key={img.id} src={img.imageUrl} alt={property.title} />
            ))}
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
      </div>
    </div>
  );
};
