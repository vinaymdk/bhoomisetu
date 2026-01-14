import { PropertyCard } from '../property/PropertyCard';
import type { Property } from '../../types/property';
import './PropertiesSection.css';

interface NewPropertiesSectionProps {
  properties: Property[];
}

export const NewPropertiesSection = ({ properties }: NewPropertiesSectionProps) => {
  if (!properties || properties.length === 0) {
    return null;
  }

  return (
    <section className="properties-section">
      <div className="properties-section-header">
        <h2 className="properties-section-title">New Properties</h2>
        <a href="/properties?sort=createdAt&order=DESC" className="properties-section-view-all">
          View All →
        </a>
      </div>
      <div className="properties-section-content properties-section-horizontal">
        {properties.map((property) => (
          <div key={property.id} className="properties-section-item">
            <PropertyCard property={property} />
          </div>
        ))}
      </div>
    </section>
  );
};
