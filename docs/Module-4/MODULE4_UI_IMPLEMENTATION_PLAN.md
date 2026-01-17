# Module 4: Seller Property Listing - UI/UX (Web + Mobile)

## Plan

### Goal
Implement **Seller/Agent property listing UI/UX** for both **Web (React)** and **Mobile (Flutter)**, using existing backend endpoints:
- `POST /api/properties` (create listing)
- `POST /api/properties/images/upload` (upload images)
- `GET /api/properties/my` (my listings)
- `POST /api/properties/:id/submit` (submit for verification)

### UX Requirements
- Draft-first workflow (Save → Submit for verification)
- Image upload + primary image selection
- Location fields + optional lat/long (web uses browser location)
- Mapbox location lookup via backend API (`/locations/geocode`)
- Mapbox map picker + autocomplete suggestions
- Loading / error / empty states
- Role-based access: only **seller/agent** can create/manage listings

---

## Status/Next-Steps

### Status
- **Backend**: ✅ already complete
- **Web UI**: ✅ implemented
- **Mobile UI**: ✅ implemented
- **Sample DB data**: ✅ module4 SQL + loader script added

### Next Steps
- Add GPS “pick on map” (optional) using maps integration
- Add “Edit listing” screen and image reordering
- Add “Submit” flow confirmation and status timeline
- Add role switching UI (buyer ↔ seller) if needed


