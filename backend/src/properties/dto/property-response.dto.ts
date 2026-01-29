import { Property, PropertyType, ListingType, PropertyStatus } from '../entities/property.entity';
import { PropertyImage } from '../entities/property-image.entity';
import { PropertyFeature } from '../entities/property-feature.entity';

export class PropertyResponseDto {
  id: string;
  sellerId: string;
  propertyType: PropertyType;
  listingType: ListingType;
  status: PropertyStatus;
  location: {
    address: string;
    city: string;
    state: string;
    pincode?: string;
    locality?: string;
    landmark?: string;
    latitude?: number;
    longitude?: number;
  };
  title: string;
  description?: string;
  price: number;
  area: number;
  areaUnit: string;
  bedrooms?: number;
  bathrooms?: number;
  balconies?: number;
  floors?: number;
  floorNumber?: number;
  furnishingStatus?: string;
  ageOfConstruction?: number;
  features?: Record<string, any>;
  propertyFeatures?: PropertyFeature[];
  images?: PropertyImage[];
  isFeatured: boolean;
  isPremium: boolean;
  featuredUntil?: Date;
  viewsCount: number;
  interestedCount: number;
  isLiked?: boolean;
  createdAt: Date;
  updatedAt: Date;

  static fromEntity(property: Property, options?: { isLiked?: boolean }): PropertyResponseDto {
    return {
      id: property.id,
      sellerId: property.sellerId,
      propertyType: property.propertyType,
      listingType: property.listingType,
      status: property.status,
      location: {
        address: property.address,
        city: property.city,
        state: property.state,
        pincode: property.pincode || undefined,
        locality: property.locality || undefined,
        landmark: property.landmark || undefined,
        latitude: property.latitude ? Number(property.latitude) : undefined,
        longitude: property.longitude ? Number(property.longitude) : undefined,
      },
      title: property.title,
      description: property.description || undefined,
      price: Number(property.price),
      area: Number(property.area),
      areaUnit: property.areaUnit,
      bedrooms: property.bedrooms || undefined,
      bathrooms: property.bathrooms || undefined,
      balconies: property.balconies || undefined,
      floors: property.floors || undefined,
      floorNumber: property.floorNumber || undefined,
      furnishingStatus: property.furnishingStatus || undefined,
      ageOfConstruction: property.ageOfConstruction || undefined,
      features: property.features || undefined,
      propertyFeatures: property.propertyFeatures,
      images: property.images,
      isFeatured: property.isFeatured,
      isPremium: property.isPremium,
      featuredUntil: property.featuredUntil || undefined,
      viewsCount: property.viewsCount,
      interestedCount: property.interestedCount,
      isLiked: options?.isLiked,
      createdAt: property.createdAt,
      updatedAt: property.updatedAt,
    };
  }
}
