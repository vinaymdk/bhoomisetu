# Module 2: Landing / Home - Implementation Plan
**Date:** January 13, 2026  
**Status:** Planning → Implementation → Testing

---

## 📋 Module 2 Requirements

### Components Required:
1. ✅ Premium Subscription Banner
2. ✅ AI Search Bar
3. ✅ New Properties (horizontal scroll)
4. ✅ Featured Properties
5. ✅ Testimonials
6. ✅ AI Chat Entry Point

### UI Rules:
- **Mobile**: Sticky Bottom Navigation
- **Web**: Header + Footer (already implemented)

---

## 🔍 Backend Status Review

### ✅ Backend APIs Available:
- `GET /api/home` - Public home page data (featured + new properties)
- `GET /api/home/dashboard` - Authenticated dashboard (includes subscription status)
- `GET /api/properties/featured?limit=10` - Featured properties
- `GET /api/properties/new?limit=10` - New properties
- `GET /api/subscriptions/status` - Subscription status

### ✅ Backend Data Structure:
- PropertyResponseDto includes: id, title, price, location, images, isFeatured, etc.
- Home endpoint returns: `{ featuredProperties, newProperties, timestamp }`
- Dashboard endpoint returns: `{ featuredProperties, newProperties, subscriptionStatus, premiumFeatures, timestamp }`

---

## 📱 Web Implementation Plan

### Current Status:
- ✅ Basic HomePage exists but lacks Module 2 components
- ✅ Header and Footer components exist
- ✅ Layout structure in place
- ❌ Missing: All Module 2 specific components

### Components to Build:

1. **Premium Subscription Banner**
   - Conditional rendering (only show if user not subscribed)
   - Link to subscription page
   - Dismissible option

2. **AI Search Bar**
   - Search input field
   - Link to search page (Module 3)
   - Placeholder text

3. **New Properties Section**
   - Horizontal scroll container
   - Property cards with image, title, price, location
   - Link to property details

4. **Featured Properties Section**
   - Grid layout (2-3 columns on desktop, 1 on mobile)
   - Property cards with featured badge
   - Link to property details

5. **Testimonials Section**
   - Carousel or grid of testimonial cards
   - Customer name, rating, review text
   - (Can be static for now, backend API pending)

6. **AI Chat Entry Point**
   - Floating button or section
   - Link to AI chat interface (Module 8)

### Implementation Steps:
1. Create property card component
2. Create services for home/properties API
3. Update HomePage with all sections
4. Add responsive styling
5. Integrate with backend APIs
6. Test all components

---

## 📱 Mobile Implementation Plan

### Current Status:
- ✅ Flutter project structure exists
- ✅ Auth screen exists
- ❌ No home screen yet
- ❌ No bottom navigation

### Components to Build:

1. **Home Screen** (`lib/screens/home/home_screen.dart`)
   - Premium Subscription Banner (if not subscribed)
   - AI Search Bar
   - New Properties (horizontal ListView)
   - Featured Properties (GridView)
   - Testimonials section
   - AI Chat floating button

2. **Bottom Navigation Bar**
   - Home (active)
   - Search
   - Favorites/Saved (future)
   - Profile
   - Sticky at bottom

3. **Property Card Widget** (`lib/widgets/property_card.dart`)
   - Image, title, price, location
   - Featured badge
   - Tap to navigate to details

4. **Services**
   - Home service for API calls
   - Properties service (if not exists)

### Implementation Steps:
1. Create home screen structure
2. Create bottom navigation widget
3. Create property card widget
4. Create home service for API calls
5. Update main.dart routing
6. Implement all sections
7. Add styling and animations
8. Test on device/emulator

---

## 🧪 Testing Plan

### Web Testing:
- [ ] Home page loads correctly
- [ ] Premium banner shows/hides based on subscription
- [ ] AI search bar is clickable
- [ ] New properties horizontal scroll works
- [ ] Featured properties display correctly
- [ ] Property cards are clickable
- [ ] Testimonials section displays
- [ ] AI chat entry point works
- [ ] Responsive design (mobile, tablet, desktop)
- [ ] API integration works
- [ ] Error handling (no properties, API errors)

### Mobile Testing:
- [ ] Home screen loads
- [ ] Bottom navigation works
- [ ] Premium banner displays correctly
- [ ] AI search bar works
- [ ] New properties scroll horizontally
- [ ] Featured properties display in grid
- [ ] Property cards are tappable
- [ ] Testimonials display
- [ ] AI chat button works
- [ ] API integration works
- [ ] Error handling
- [ ] Loading states
- [ ] Network error handling

---

## 📝 Next Steps

1. **Review current implementation** ✅
2. **Implement Web Module 2** (Priority 1)
3. **Implement Mobile Module 2** (Priority 2)
4. **Test both implementations**
5. **Document findings**

---

**Status:** Planning Complete → Ready for Implementation
