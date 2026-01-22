# Pending Issues & Fixes - January 19, 2026

## Overview
This document details all pending issues and their fixes for the BhoomSetu real estate application.

---

## 1. ❌ Unauthorized Error (401) - IMAGE UPLOAD

### Status: ✅ ALREADY FIXED (Backend & Web)
See: [401_UNAUTHORIZED_FIX.md](401_UNAUTHORIZED_FIX.md)

### Issue Summary
- Image upload endpoint (`POST /api/properties/images/upload`) returning 401 Unauthorized
- Home, My-Listings, Properties screens showing Unauthorized error (both web & mobile)
- Root cause: Inconsistent token refresh response format and incorrect response parsing

### Fix Applied
1. **Backend**: [backend/src/auth/auth.service.ts](backend/src/auth/auth.service.ts#L477-L526)
   - Wrapped `refreshTokens()` response in `{ tokens }` format for consistency
   
2. **Web**: [web/src/config/api.ts](web/src/config/api.ts#L20-L71)
   - Added protection against infinite refresh loops
   - Fixed token extraction from response
   - Proper error handling on refresh failure
   
3. **Mobile**: [mobile/lib/config/api_client.dart](mobile/lib/config/api_client.dart#L73-L139)
   - Direct HTTP call for token refresh (avoid circular dependency)
   - Queue-based request retry mechanism
   - Proper null safety and error handling

### Verification Steps
```bash
# 1. Create a property listing and fill all required fields
# 2. Click "Save listing (Draft)"
# 3. Upload images - should NOT return 401
# 4. Go to My Listings - should show the listing
# 5. Go to Home page - should NOT show Unauthorized error
```

### Note on Local File Storage
For testing image upload without Cloudinary:
- Update [backend/src/storage/storage.service.ts](backend/src/storage/storage.service.ts)
- Implement local file storage instead of Cloudinary
- Store files in `uploads/` directory with proper public serving

---

## 2. 🔍 Search Properties - City Name Filter Issue

### Issue
City search filter reloads with each letter typed instead of waiting for full name entry.

### Root Cause
- No debouncing on city filter input
- Search triggered immediately on each keystroke
- Creates poor UX with constant page reloads

### Fix Required
Apply debouncing to city filter input in SearchPage.

**File**: [web/src/pages/SearchPage.tsx](web/src/pages/SearchPage.tsx)

**Change**: Use `handleFilterChangeDebounced` (already implemented) for city input

```tsx
// BEFORE:
onChange={(value) => handleFilterChange('city', value)}

// AFTER:
onChange={(value) => handleFilterChangeDebounced('city', value)}
```

### Mobile Fix
**File**: [mobile/lib/screens/search_screen.dart](mobile/lib/screens/search_screen.dart)

Add debounce logic similar to web:
```dart
Timer? _debounceTimer;

void _onCityChanged(String city) {
  _debounceTimer?.cancel();
  _debounceTimer = Timer(const Duration(milliseconds: 500), () {
    setState(() {
      filters = filters.copyWith(city: city.isNotEmpty ? city : null);
    });
    _performSearch();
  });
}
```

---

## 3. 🖱️ Cursor Position in Filter Input Fields

### Issue
When manually entering filter values, cursor auto-refreshes to first position instead of staying at end.

### Root Cause
- Form re-renders on every keystroke (full component rebuild)
- Input field loses focus/cursor position
- Filter state update causes re-render

### Fix Required
Use `handleFilterChangeDebounced` for all text input filters to prevent immediate state updates.

**File**: [web/src/pages/SearchPage.tsx](web/src/pages/SearchPage.tsx)

Update filter inputs to use debounced handler:
- Price inputs (min/max)
- City input
- Locality input
- Any other text-based filters

**Implementation**:
```tsx
<input
  type="number"
  value={filters.minPrice || ''}
  onChange={(e) => handleFilterChangeDebounced('minPrice', e.target.value ? Number(e.target.value) : undefined)}
  placeholder="Min price"
/>
```

---

## 4. 🖼️ Drag-and-Drop Image Reordering

### Issue
Drag and drop not working for re-ordering images in Create-Listing form.

### Root Cause
- Incomplete drag-and-drop implementation
- Missing drag handle visual indicators
- Insufficient feedback to user

### Fix Required

**File**: [web/src/components/listing/ListingForm.tsx](web/src/components/listing/ListingForm.tsx)

Enhance drag-and-drop with:

1. **Add visual drag handle**:
```tsx
<div className="image-drag-handle">
  ⋮⋮
</div>
```

2. **Add draggable attribute properly**:
```tsx
<div
  draggable
  onDragStart={() => setDragIndex(idx)}
  onDragOver={(e) => e.preventDefault()}
  onDrop={() => handleDrop(idx)}
  onDragLeave={() => {}}
  className={`image-preview ${dragIndex === idx ? 'dragging' : ''}`}
>
```

3. **Add CSS for drag state**:
```css
.image-preview.dragging {
  opacity: 0.5;
  border: 2px dashed #4CAF50;
  transform: scale(0.98);
}

.image-drag-handle {
  cursor: grab;
  padding: 4px;
  font-size: 12px;
  color: #666;
}

.image-drag-handle:hover {
  color: #333;
}
```

4. **Add image size reduction** for buttons:
- Primary button: Reduce from current size to 28px
- Up/Down buttons: Reduce from current size to 24px  
- Delete button: Reduce from current size to 24px
- See: [web/src/components/listing/ListingForm.css](web/src/components/listing/ListingForm.css)

---

## 5. 🗺️ Mapbox Autocomplete - Suggestion Removal

### Issue
After selecting a location from Mapbox suggestions:
1. Remaining suggestions should be removed/hidden
2. Selected location latitude/longitude should update
3. Other address fields should be auto-filled via reverse-geocoding
4. Suggestion list should not reappear

### Root Cause
- `clearSuggestions()` not called consistently
- Reverse geocoding not updating all related fields
- Location query not being cleared after selection

### Fix Required

**File**: [web/src/hooks/useListingForm.ts](web/src/hooks/useListingForm.ts)

Update `applySuggestion` function:

```typescript
const applySuggestion = (suggestion: LocationSuggestion) => {
  const [lng, lat] = suggestion.center;
  
  // 1. Update location query with selected place
  setLocationQuery(suggestion.placeName);
  
  // 2. Immediately clear suggestions
  setSuggestions([]);
  
  // 3. Update latitude and longitude
  setField('latitude', lat);
  setField('longitude', lng);
  
  // 4. Perform reverse geocoding to fill address fields
  reverseGeocode(lat, lng);
};
```

**File**: [web/src/components/listing/ListingForm.tsx](web/src/components/listing/ListingForm.tsx)

Ensure suggestion selection callback clears suggestions:

```tsx
onSuggestionSelect={(s) => {
  applySuggestion(s);
  // clearSuggestions() is now called inside applySuggestion
}}
```

**Reverse Geocoding Enhancement**:

**File**: [web/src/services/location.service.ts](web/src/services/location.service.ts)

Ensure reverse geocoding returns all address components:
- address (full formatted address)
- city
- state
- country
- pincode

---

## 6. Filter Items Persistence Issue

### Issue
After removing filtered items, selected items are not showing for mobile and web.

### Root Cause
- Filter state not properly persisting after removal
- Dismissed items not being properly tracked
- URL params might not sync with actual filter state

### Fix Required

**File**: [web/src/pages/SearchPage.tsx](web/src/pages/SearchPage.tsx)

Update `clearFilters()` and dismissed items tracking:

```tsx
const clearFilters = () => {
  setQuery('');
  setDismissedExtracted([]); // Reset dismissed items
  setFilters({
    rankBy: 'relevance',
    page: 1,
    limit: 20,
    // Keep other filters if needed
  });
};

// Improve filter restoration
const restoreFilter = (key: string) => {
  const updatedDismissed = dismissedExtracted.filter(k => k !== key);
  setDismissedExtracted(updatedDismissed);
  // Re-trigger search with restored filter
  performSearch(filters);
};
```

---

## 7. Filter UI/UX Improvements

### Drag Handle Enhancement
- Make drag handle more obvious with icon + tooltip
- Add hover effect

```tsx
<div 
  className="image-drag-handle"
  title="Drag to reorder"
>
  <svg>...</svg> {/* Drag icon */}
</div>
```

### Reset Filters Action
Add prominent "Reset Filters" button in extracted filters row:

```tsx
<div className="extracted-filters-row">
  {/* Filters display */}
  <button 
    type="button" 
    onClick={clearFilters}
    className="reset-filters-btn"
  >
    🔄 Reset All
  </button>
</div>
```

---

## 8. Mobile-Specific Fixes

### Search City Filter Debounce
See section #2 above

### Properties Page Timeout
**File**: [mobile/lib/screens/home_screen.dart](mobile/lib/screens/home_screen.dart)

Issue: "TimeoutException after 0:00:15,000000: Future not completed"

**Fix**: Increase timeout or implement pagination:

```dart
Future<void> _fetchProperties() async {
  try {
    final response = await propertiesService.getProperties().timeout(
      const Duration(seconds: 30), // Increase timeout
      onTimeout: () => throw TimeoutException('Properties fetch timeout'),
    );
    setState(() {
      _properties = response;
    });
  } catch (e) {
    // Show friendly error message
  }
}
```

### Filter Suggestion Removal (Mobile)
See section #5 above

---

## Implementation Priority

### High Priority (Critical)
1. ✅ 401 Unauthorized fix verification
2. Search city filter debounce (web) - affecting user experience
3. Cursor position in filters - affecting user experience

### Medium Priority
4. Drag-and-drop image reordering
5. Mapbox autocomplete suggestion removal
6. Filter items persistence

### Low Priority (UX Enhancement)
7. Button size reduction (professional look)
8. Drag handle UI improvements
9. Reset filters button

---

## Testing Checklist

- [ ] Create property listing and upload images (no 401 error)
- [ ] Search properties by city name (no page reload per letter)
- [ ] Filter inputs maintain cursor position
- [ ] Drag and drop images to reorder
- [ ] Select Mapbox location and verify suggestions clear
- [ ] Remove filters and restore them
- [ ] All features work on both web and mobile

---

## Files to Modify

### Web (React + TypeScript)
1. [web/src/pages/SearchPage.tsx](web/src/pages/SearchPage.tsx)
2. [web/src/components/listing/ListingForm.tsx](web/src/components/listing/ListingForm.tsx)
3. [web/src/components/listing/ListingForm.css](web/src/components/listing/ListingForm.css)
4. [web/src/hooks/useListingForm.ts](web/src/hooks/useListingForm.ts)
5. [web/src/services/location.service.ts](web/src/services/location.service.ts)
6. [web/src/pages/SearchPage.css](web/src/pages/SearchPage.css) - for filter UI

### Mobile (Flutter)
1. [mobile/lib/screens/search_screen.dart](mobile/lib/screens/search_screen.dart)
2. [mobile/lib/screens/home_screen.dart](mobile/lib/screens/home_screen.dart)
3. [mobile/lib/widgets/property_list_widget.dart](mobile/lib/widgets/property_list_widget.dart)

### Backend (Already Fixed)
- ✅ [backend/src/auth/auth.service.ts](backend/src/auth/auth.service.ts)
- ⚠️ [backend/src/storage/storage.service.ts](backend/src/storage/storage.service.ts) - (Optional: Local storage for testing)

---

## Configuration Notes

### Environment Setup
- Ensure MAPBOX_API_KEY is set in `.env`
- Configure file storage (Cloudinary or local)
- Set appropriate timeout values for API calls

### API Endpoints Used
- `POST /api/properties/images/upload` - Image upload
- `GET /auth/refresh` - Token refresh
- `GET /locations/geocode` - Geocoding
- `GET /locations/reverse` - Reverse geocoding
- `POST /search` - AI-powered search
- `GET /properties/my` - User's listings

---

## Additional Notes

### Token Refresh Flow (Web)
1. Request returns 401
2. Interceptor detects 401 and refreshes token
3. Retries original request with new token
4. If refresh also fails, redirects to login

### Image Upload Flow
1. User selects images
2. Uploads to temporary storage
3. On property creation, includes uploaded image URLs
4. API stores image references in database

### Search with Debounce
1. User types in search field
2. Debounce timer resets with each keystroke
3. After 500ms inactivity, performs search
4. Cursor position preserved in input

---

## References
- [401 Unauthorized Fix Documentation](401_UNAUTHORIZED_FIX.md)
- [API Configuration Guide](web/API_CONFIGURATION_GUIDE.md)
- [Testing Guide](docs/TESTING_GUIDE.md)
- [Module 4 Summary](docs/summary/MODULE4_SUMMARY.md)
