# Module 4: Seller Property Listing - UI/UX Status

## Implementation

### Web (React)
- ✅ `CreateListingPage` (`/list-property`): create listing + multi-image upload + choose primary
- ✅ Required fields, validation, state dropdown (all Indian states), area unit options (sqft/sqm/acre/sqyrd)
- ✅ Mapbox location lookup via backend (`/locations/geocode`)
- ✅ Mapbox map picker + autocomplete suggestions
- ✅ `MyListingsPage` (`/my-listings`): list drafts/submitted + submit for verification
- ✅ `EditListingPage` (`/my-listings/:id/edit`): edit listing + image reorder
- ✅ `PropertiesPage`: now lists properties from backend (not placeholder)
- ✅ Role guard: `RoleProtectedRoute` (seller/agent only)

### Mobile (Flutter)
- ✅ `CreatePropertyScreen`: create listing + multi-image picker + upload + primary selection
- ✅ Dropdowns for area unit / bedrooms / bathrooms
- ✅ Mapbox location lookup via backend (`/locations/geocode`)
- ✅ Mapbox map picker + autocomplete suggestions
- ✅ `MyListingsScreen`: list drafts/submitted + submit for verification + create FAB
- ✅ `EditPropertyScreen`: edit listing + image reorder
- ✅ Bottom nav: added **List** tab with role check (seller/agent)

### Backend Integration (Used)
- `POST /api/properties/images/upload` (multipart: `images[]`)
- `POST /api/properties` (CreatePropertyDto)
- `GET /api/properties/my`
- `POST /api/properties/:id/submit`

---

## Review Notes
- Draft-first workflow is enforced by UI (save draft first, submit separately).
- Primary image selection is supported on both platforms.
- Web supports “Use my location” via browser geolocation (optional lat/long).
- Mobile supports optional lat/long manual entry (map picker can be added next).


