import { PropertyCard } from '../property/PropertyCard';
import type { Property } from '../../types/property';
import './PropertiesSection.css';

interface FeaturedPropertiesSectionProps {
  properties: Property[];
}

export const FeaturedPropertiesSection = ({ properties }: FeaturedPropertiesSectionProps) => {
  if (!properties || properties.length === 0) {
    return null;
  }

  return (
    <section className="properties-section">
      <div className="properties-section-header">
        <h2 className="properties-section-title">Featured Properties</h2>
        <a href="/properties?featured=true" className="properties-section-view-all">
          View All →
        </a>
      </div>
      <div className="properties-section-content properties-section-grid">
        {properties.map((property) => (
          <div key={property.id} className="properties-section-item">
            <PropertyCard property={property} showFeaturedBadge={true} />
          </div>
        ))}
      </div>
    </section>
  );
};
