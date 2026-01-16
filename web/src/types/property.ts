export interface PropertyLocation {
  address: string;
  city: string;
  state: string;
  pincode?: string;
  locality?: string;
  landmark?: string;
  latitude?: number;
  longitude?: number;
}

export interface PropertyImage {
  id: string;
  imageUrl: string;
  isPrimary: boolean;
  /** Backend uses `displayOrder`; keep `order` for backward compatibility. */
  displayOrder?: number;
  order?: number;
}

export interface PropertyFeature {
  id: string;
  name: string;
  value?: string;
}

export type PropertyType = 
  | 'apartment'
  | 'house'
  | 'villa'
  | 'plot'
  | 'commercial'
  | 'industrial'
  | 'agricultural'
  | 'other';

export type ListingType = 'sale' | 'rent';

export interface CreatePropertyImageInput {
  imageUrl: string;
  imageType?: string;
  displayOrder?: number;
  isPrimary?: boolean;
}

export interface CreatePropertyRequest {
  propertyType: PropertyType;
  listingType: ListingType;
  location: PropertyLocation;
  title: string;
  description?: string;
  price: number;
  area: number;
  areaUnit?: string;
  bedrooms?: number;
  bathrooms?: number;
  balconies?: number;
  floors?: number;
  floorNumber?: number;
  furnishingStatus?: string;
  ageOfConstruction?: number;
  features?: Record<string, any>;
  featureKeys?: string[];
  images?: CreatePropertyImageInput[];
}

export type PropertyStatus = 
  | 'draft'
  | 'pending_verification'
  | 'verified'
  | 'live'
  | 'sold'
  | 'rented'
  | 'expired'
  | 'rejected';

export interface Property {
  id: string;
  sellerId: string;
  propertyType: PropertyType;
  listingType: ListingType;
  status: PropertyStatus;
  location: PropertyLocation;
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
  featuredUntil?: string;
  viewsCount: number;
  interestedCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface HomeData {
  featuredProperties: Property[];
  newProperties: Property[];
  timestamp: string;
}

export interface DashboardData extends HomeData {
  subscriptionStatus?: {
    hasActiveSubscription: boolean;
    hasPremiumSeller: boolean;
    hasPremiumBuyer: boolean;
    hasActiveFeaturedListing: boolean;
    subscriptionEndsAt?: string;
  };
  premiumFeatures?: {
    priorityListing: boolean;
    fasterMediation: boolean;
    featuredBadge: boolean;
    advancedSearch: boolean;
    propertyAlerts: boolean;
  };
}
