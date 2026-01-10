# Next Steps - Module 2: Landing / Home

## Overview

Module 2 focuses on creating the landing/home page backend APIs. This includes property listings, featured properties, and premium subscription features.

## Immediate Tasks

### 1. Database Schema for Properties

Create migration file: `db/migrations/YYYYMMDD_properties_schema.sql`

**Tables to create:**
- `properties` - Main property listings
- `property_images` - Property image references
- `property_features` - Property amenities/features
- `subscriptions` - Premium subscription tracking

### 2. Backend APIs Needed

**Property Endpoints:**
- `GET /api/properties` - List all properties (paginated, filtered)
- `GET /api/properties/featured` - Featured properties
- `GET /api/properties/new` - Recently added properties
- `GET /api/properties/:id` - Property details
- `POST /api/properties` - Create property (seller only, goes to verification)

**Subscription Endpoints:**
- `GET /api/subscriptions/status` - Check user subscription status
- `GET /api/subscriptions/features` - List premium features

**Home/Landing Endpoints:**
- `GET /api/home` - Home page data aggregation
  - Featured properties
  - New properties
  - User subscription status
  - Statistics

### 3. TypeORM Entities

**Create:**
- `src/properties/entities/property.entity.ts`
- `src/properties/entities/property-image.entity.ts`
- `src/properties/entities/property-feature.entity.ts`
- `src/subscriptions/entities/subscription.entity.ts`

### 4. Services & Modules

**Create:**
- `src/properties/properties.module.ts`
- `src/properties/properties.service.ts`
- `src/properties/properties.controller.ts`
- `src/subscriptions/subscriptions.module.ts`
- `src/subscriptions/subscriptions.service.ts`
- `src/subscriptions/subscriptions.controller.ts`

## Property Schema Design

```typescript
Property {
  id: UUID
  sellerId: UUID (FK to users)
  propertyType: enum (apartment, house, plot, commercial, etc.)
  listingType: enum (sale, rent)
  status: enum (draft, pending_verification, verified, live, sold, rented, expired)
  
  // Location
  address: string
  city: string
  state: string
  pincode: string
  latitude: decimal
  longitude: decimal
  
  // Details
  title: string
  description: text
  price: decimal
  area: decimal (sqft)
  bedrooms: int
  bathrooms: int
  
  // Verification
  verifiedAt: timestamp (nullable)
  verifiedBy: UUID (FK to users - CS agent)
  
  // Metadata
  createdAt: timestamp
  updatedAt: timestamp
  deletedAt: timestamp (soft delete)
}
```

## Implementation Order

1. **Create database migration** for properties tables
2. **Create TypeORM entities** for properties
3. **Create Properties module** (service, controller)
4. **Implement basic CRUD** operations
5. **Add featured/new properties** logic
6. **Create subscription module** (if needed now)
7. **Create home aggregation endpoint**

## Testing Checklist

- [ ] Property creation by seller
- [ ] Property listing with filters
- [ ] Featured properties query
- [ ] New properties query
- [ ] Property details retrieval
- [ ] Subscription status check
- [ ] Role-based access (seller can create, buyer can view)

## Integration Points

- **Module 1**: Use authenticated user from JWT
- **Module 5**: Property verification workflow (save as pending)
- **Module 3**: Prepare for AI search integration
- **Module 10**: Premium subscription features

## Files to Create

```
backend/src/
├── properties/
│   ├── entities/
│   │   ├── property.entity.ts
│   │   ├── property-image.entity.ts
│   │   └── property-feature.entity.ts
│   ├── dto/
│   │   ├── create-property.dto.ts
│   │   ├── update-property.dto.ts
│   │   └── property-filter.dto.ts
│   ├── properties.service.ts
│   ├── properties.controller.ts
│   └── properties.module.ts
└── subscriptions/
    ├── entities/
    │   └── subscription.entity.ts
    ├── subscriptions.service.ts
    ├── subscriptions.controller.ts
    └── subscriptions.module.ts
```

## Dependencies Needed

- Image upload service (S3/Cloudinary) - for property images
- Geo-coding service - for location coordinates
- File upload handling in NestJS

---

**Ready to start?** Begin with the database migration, then create the entities and module structure.
