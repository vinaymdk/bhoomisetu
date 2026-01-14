# Mobile Module 2: Home Screen & Bottom Navigation - Design Specifications
**Date:** January 13, 2026  
**Status:** Design Complete (Implementation pending)

---

## 📱 Mobile Home Screen Design

### Screen Structure

```
┌─────────────────────────────────┐
│         Status Bar              │
├─────────────────────────────────┤
│         App Bar/Header          │
│    (Logo + User Icon/Search)    │
├─────────────────────────────────┤
│                                 │
│   Premium Subscription Banner   │
│   (If authenticated & not       │
│    subscribed - dismissible)    │
│                                 │
├─────────────────────────────────┤
│                                 │
│      AI Search Bar              │
│   (Search input + Search btn)   │
│                                 │
├─────────────────────────────────┤
│                                 │
│   New Properties Section        │
│   ┌───┐ ┌───┐ ┌───┐ ┌───┐     │
│   │ P │ │ P │ │ P │ │ P │ →   │
│   └───┘ └───┘ └───┘ └───┘     │
│   (Horizontal scrollable)       │
│                                 │
├─────────────────────────────────┤
│                                 │
│   Featured Properties Section   │
│   ┌──────┐  ┌──────┐          │
│   │  P1  │  │  P2  │          │
│   └──────┘  └──────┘          │
│   ┌──────┐  ┌──────┐          │
│   │  P3  │  │  P4  │          │
│   └──────┘  └──────┘          │
│   (Grid layout - 2 columns)    │
│                                 │
├─────────────────────────────────┤
│                                 │
│   Testimonials Section          │
│   (Carousel or vertical list)   │
│                                 │
├─────────────────────────────────┤
│                                 │
│         (Scrollable)            │
│                                 │
├─────────────────────────────────┤
│    Sticky Bottom Navigation     │
│  [Home] [Search] [Saved] [Profile]│
└─────────────────────────────────┘
```

---

## 🎨 Component Specifications

### 1. Premium Subscription Banner

**Location:** Below AppBar (if authenticated & not subscribed)

**Design:**
- Full width card with gradient background (Primary color)
- Dismissible (X button in top-right)
- Content:
  - Title: "✨ Unlock Premium Features"
  - Description: "Get featured listings, priority support, and more"
  - CTA Button: "Upgrade Now"
- Height: ~100-120dp
- Padding: 16dp
- Border radius: 12dp
- Margin: 8dp top/bottom, 16dp left/right

**Behavior:**
- Show only if user is authenticated
- Hide if user has active subscription
- Dismissible (store dismissal state in local storage/shared preferences)
- Tap "Upgrade Now" → Navigate to subscriptions page

---

### 2. AI Search Bar

**Location:** Below Premium Banner

**Design:**
- Full width search input field
- Search icon on left
- Placeholder: "Search properties using natural language..."
- Search button on right (or submit on keyboard)
- Hint text below: "💡 Powered by AI"
- Height: ~56dp
- Padding: 16dp horizontal, 8dp vertical
- Border: 2dp solid (Primary color on focus)
- Border radius: 12dp

**Behavior:**
- Tap input → Focus and show keyboard
- Submit → Navigate to search page with query
- Empty submit → Navigate to search page

---

### 3. New Properties Section

**Location:** Below AI Search Bar

**Design:**
- Section title: "New Properties" (left) + "View All →" (right)
- Horizontal scrollable ListView
- Property cards: 280dp width, 350dp height
- Scroll indicator (dots or scrollbar)
- Spacing: 16dp between cards
- Padding: 16dp horizontal

**Property Card Design:**
- Image: 280dp × 210dp (4:3 ratio)
- Featured badge (if applicable) - top-left
- Listing type badge - top-right
- Title: 2 lines max, 16sp, bold
- Price: Large, bold, primary color
- Location: Icon + text, 14sp
- Details: BHK, Bath, Area (horizontal)
- Property type tag
- Views count
- Card padding: 16dp
- Border radius: 12dp
- Elevation: 2dp (shadow)

**Behavior:**
- Horizontal scroll
- Tap card → Navigate to property details
- Tap "View All" → Navigate to properties list (newest first)

---

### 4. Featured Properties Section

**Location:** Below New Properties

**Design:**
- Section title: "Featured Properties" (left) + "View All →" (right)
- Grid layout: 2 columns
- Property cards: Full width (width = screen width / 2 - 24dp)
- Spacing: 16dp between cards
- Padding: 16dp horizontal
- Minimum 2 cards per row

**Property Card Design:**
- Same as New Properties cards but adapted for grid
- Image: Full width, 4:3 ratio
- All other elements same as New Properties cards

**Behavior:**
- Scroll vertically to see more
- Tap card → Navigate to property details
- Tap "View All" → Navigate to properties list (featured filter)

---

### 5. Testimonials Section

**Location:** Below Featured Properties

**Design:**
- Section title: "What Our Customers Say" (centered)
- Vertical ListView or Carousel
- Testimonial cards:
  - Rating stars (5 stars)
  - Review text (3-4 lines)
  - Author name (bold)
  - Author role (smaller, gray)
  - Card padding: 24dp
  - Border radius: 12dp
  - Elevation: 2dp

**Behavior:**
- Scroll vertically or swipe horizontally (carousel)
- Show 2-3 testimonials initially
- "View All" button to see more (optional)

---

### 6. AI Chat Button (Floating Action Button)

**Location:** Fixed position, bottom-right

**Design:**
- Circular FAB
- Size: 56dp × 56dp
- Icon: 💬 or chat icon
- Background: Primary color
- Elevation: 6dp (shadow)
- Position: 16dp from bottom, 16dp from right

**Behavior:**
- Tap → Navigate to AI Chat screen
- Always visible (except when keyboard is open - optional)

---

## 📐 Bottom Navigation Bar Design

### Structure

```
┌─────────────────────────────────┐
│  [🏠 Home]  [🔍 Search]        │
│  [⭐ Saved] [👤 Profile]       │
└─────────────────────────────────┘
```

### Specifications

**Layout:**
- Sticky at bottom of screen
- Height: 64dp (including safe area)
- Background: White
- Border: 1dp top border (light gray)
- Elevation: 8dp (shadow above)

**Navigation Items (4 items):**
1. **Home** (Active on Home screen)
   - Icon: Home icon (filled when active)
   - Label: "Home"
   - Route: `/home`

2. **Search**
   - Icon: Search icon
   - Label: "Search"
   - Route: `/search`

3. **Saved/Favorites** (Future)
   - Icon: Star/Heart icon
   - Label: "Saved"
   - Route: `/saved`

4. **Profile**
   - Icon: User/Profile icon
   - Label: "Profile"
   - Route: `/profile`

**Item Design:**
- Icon size: 24dp
- Label size: 12sp
- Active state:
  - Icon: Primary color
  - Label: Primary color, bold
- Inactive state:
  - Icon: Gray (#666)
  - Label: Gray (#666), normal weight
- Spacing: Equal distribution across width
- Tap area: Full width of item
- Padding: 8dp vertical, 4dp horizontal

**Behavior:**
- Tapping item → Navigate to route
- Active item highlighted
- Safe area handling (notch/gesture area)

---

## 🎨 Design System

### Colors
- Primary: `#2196F3` (Blue)
- Primary Dark: `#1976D2`
- Background: `#FFFFFF`
- Background Secondary: `#F5F5F5`
- Text Primary: `#212121`
- Text Secondary: `#757575`
- Border: `#E0E0E0`
- Error: `#F44336`
- Success: `#4CAF50`

### Typography
- Title: 20sp, Bold
- Subtitle: 16sp, Medium
- Body: 14sp, Regular
- Caption: 12sp, Regular

### Spacing
- Extra Small: 4dp
- Small: 8dp
- Medium: 16dp
- Large: 24dp
- Extra Large: 32dp

### Border Radius
- Small: 4dp
- Medium: 8dp
- Large: 12dp
- Extra Large: 16dp

### Elevations
- Card: 2dp
- FAB: 6dp
- Bottom Nav: 8dp

---

## 📋 Implementation Files Needed

### Screens
- `lib/screens/home/home_screen.dart` - Main home screen

### Widgets
- `lib/widgets/premium_banner.dart` - Premium subscription banner
- `lib/widgets/ai_search_bar.dart` - AI search input
- `lib/widgets/property_card.dart` - Property card widget
- `lib/widgets/bottom_navigation.dart` - Bottom navigation bar
- `lib/widgets/testimonial_card.dart` - Testimonial card widget

### Services
- `lib/services/home_service.dart` - Home API service (already exists pattern from auth)

### Models
- `lib/models/property.dart` - Property data model
- `lib/models/home_data.dart` - Home data model

### Routes
- Update `lib/main.dart` to include home route and bottom navigation

---

## ✅ Design Checklist

- [x] Home screen layout structure
- [x] Premium Banner design
- [x] AI Search Bar design
- [x] New Properties section (horizontal scroll)
- [x] Featured Properties section (grid)
- [x] Testimonials section
- [x] AI Chat FAB design
- [x] Bottom Navigation design
- [x] Design system (colors, typography, spacing)
- [x] Component specifications
- [x] File structure

---

## 🚀 Next Steps (After Web Implementation)

1. Create home screen structure
2. Implement bottom navigation
3. Create property card widget
4. Create all section widgets
5. Integrate with backend APIs
6. Add navigation routing
7. Test on device/emulator

---

**Status:** Design Complete ✅  
**Implementation:** Pending (After Web Module 2 completion)
