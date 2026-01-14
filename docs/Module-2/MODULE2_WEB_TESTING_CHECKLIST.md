# Module 2: Web Testing Checklist
**Date:** January 13, 2026  
**Platform:** Web (React)

---

## 🧪 Testing Checklist

### 1. Home Page Loading

#### Unauthenticated User:
- [ ] Navigate to `/` (home page)
- [ ] Page loads without errors
- [ ] No console errors
- [ ] All sections render correctly
- [ ] Premium banner does NOT show (correct - only for authenticated users)

#### Authenticated User:
- [ ] Login successfully
- [ ] Navigate to `/` (home page)
- [ ] Page loads without errors
- [ ] No console errors
- [ ] Premium banner shows (if user doesn't have subscription)
- [ ] All sections render correctly

---

### 2. API Integration

#### Public Home Data (`/api/home`):
- [ ] API call succeeds
- [ ] Featured properties load
- [ ] New properties load
- [ ] Empty state handled (if no properties)
- [ ] Error state handled (if API fails)

#### Authenticated Dashboard Data (`/api/home/dashboard`):
- [ ] API call succeeds (with authentication)
- [ ] Featured properties load
- [ ] New properties load
- [ ] Subscription status included
- [ ] Premium features data included
- [ ] Error state handled (if API fails)

---

### 3. Premium Subscription Banner

- [ ] Banner shows for authenticated users (without subscription)
- [ ] Banner does NOT show for unauthenticated users
- [ ] Banner dismisses when X button clicked
- [ ] Banner stays dismissed after page reload (state persistence)
- [ ] "Upgrade Now" button links to `/subscriptions` (route may not exist yet)
- [ ] Banner styling is correct
- [ ] Banner is responsive (mobile/tablet/desktop)

---

### 4. AI Search Bar

- [ ] Search input field displays
- [ ] Placeholder text shows
- [ ] Search button displays
- [ ] Entering text and clicking "Search" navigates to `/search?q=query`
- [ ] Entering text and pressing Enter navigates to `/search?q=query`
- [ ] Empty search navigates to `/search`
- [ ] Search query is URL encoded correctly
- [ ] Styling is correct
- [ ] Responsive design works (mobile/tablet/desktop)
- [ ] Hint text displays below search bar

---

### 5. New Properties Section

- [ ] Section title "New Properties" displays
- [ ] "View All" link displays
- [ ] Properties load from API
- [ ] Properties display in horizontal scroll
- [ ] Horizontal scroll works (mouse drag, touch swipe on mobile)
- [ ] Property cards display correctly
- [ ] Empty state handled (if no new properties)
- [ ] "View All" link navigates to `/properties?sort=createdAt&order=DESC`
- [ ] Section styling is correct
- [ ] Responsive design works

---

### 6. Featured Properties Section

- [ ] Section title "Featured Properties" displays
- [ ] "View All" link displays
- [ ] Properties load from API
- [ ] Properties display in grid layout
- [ ] Featured badges show on property cards
- [ ] Grid layout is responsive (3 columns desktop, 2 tablet, 1 mobile)
- [ ] Property cards display correctly
- [ ] Empty state handled (if no featured properties)
- [ ] "View All" link navigates to `/properties?featured=true`
- [ ] Section styling is correct

---

### 7. Property Cards

- [ ] Property image displays (or placeholder)
- [ ] Featured badge shows (if property is featured)
- [ ] Listing type badge shows (For Rent/Sale)
- [ ] Title displays (max 2 lines)
- [ ] Price displays (formatted correctly - Cr/L/₹)
- [ ] Location displays (City, State)
- [ ] Property details display (BHK, Bath, Area)
- [ ] Property type tag displays
- [ ] Views count displays (if available)
- [ ] Card is clickable (links to `/properties/:id`)
- [ ] Hover effect works (desktop)
- [ ] Card styling is correct
- [ ] Responsive design works

---

### 8. Testimonials Section

- [ ] Section title "What Our Customers Say" displays
- [ ] Testimonial cards display (3 testimonials)
- [ ] Star ratings display (5 stars each)
- [ ] Review text displays
- [ ] Author name displays
- [ ] Author role displays
- [ ] Cards are styled correctly
- [ ] Grid layout is responsive
- [ ] Hover effect works (desktop)

---

### 9. AI Chat Button

- [ ] Floating action button displays (bottom-right)
- [ ] Button is visible on scroll
- [ ] Button icon displays (💬 or chat icon)
- [ ] Button text displays (desktop: "AI Assistant", mobile: icon only)
- [ ] Clicking button navigates to `/ai-chat` (route may not exist yet)
- [ ] Button styling is correct
- [ ] Button position is correct (fixed, bottom-right)
- [ ] Responsive design works (text hides on mobile)

---

### 10. Error Handling

- [ ] API error displays error message
- [ ] Error message is user-friendly
- [ ] Retry button works (reloads page)
- [ ] Loading state displays spinner
- [ ] Loading state shows "Loading properties..." message
- [ ] Network errors handled gracefully
- [ ] 401 errors handled (redirect to login if needed)
- [ ] 400 errors don't redirect (just show error)

---

### 11. Loading States

- [ ] Loading spinner displays while fetching data
- [ ] Loading message displays
- [ ] Loading state clears after data loads
- [ ] Loading state clears after error

---

### 12. Responsive Design

#### Desktop (1920px+):
- [ ] All components display correctly
- [ ] Grid layouts show 3 columns (featured properties)
- [ ] Text sizes are appropriate
- [ ] Spacing is appropriate

#### Tablet (768px - 1024px):
- [ ] All components display correctly
- [ ] Grid layouts show 2 columns (featured properties)
- [ ] Text sizes are appropriate
- [ ] Spacing is appropriate

#### Mobile (< 768px):
- [ ] All components display correctly
- [ ] Grid layouts show 1 column (featured properties)
- [ ] Horizontal scroll works (new properties)
- [ ] Text sizes are appropriate
- [ ] Spacing is appropriate
- [ ] Touch interactions work
- [ ] AI Chat button shows icon only

---

### 13. Browser Compatibility

- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile browsers (Chrome, Safari)

---

### 14. Performance

- [ ] Page loads quickly
- [ ] Images lazy load
- [ ] No unnecessary re-renders
- [ ] API calls are optimized
- [ ] No memory leaks

---

### 15. Accessibility

- [ ] All images have alt text
- [ ] All buttons have aria labels
- [ ] Keyboard navigation works
- [ ] Focus states are visible
- [ ] Color contrast is sufficient
- [ ] Screen reader compatible

---

## 📋 Known Limitations

### Routes Not Yet Created (Future Modules):
- `/properties` - Will be in Module 4
- `/properties/:id` - Will be in Module 4
- `/search` - Will be in Module 3
- `/subscriptions` - Will be in Module 10
- `/ai-chat` - Will be in Module 8

**Note:** Links to these routes will work once those modules are implemented. For now, they may navigate to home page (catch-all route) or show 404.

---

## 🐛 Common Issues to Check

1. **API Errors:**
   - Check browser console for errors
   - Check Network tab for failed requests
   - Verify backend is running
   - Verify API endpoints are correct

2. **Authentication Issues:**
   - Verify token is stored correctly
   - Verify token is sent in requests
   - Check if token is expired

3. **Layout Issues:**
   - Check for overflow issues
   - Check for responsive breakpoints
   - Verify spacing is consistent

4. **Performance Issues:**
   - Check for slow API calls
   - Check for large images
   - Check for unnecessary re-renders

---

## ✅ Test Results

**Tested By:** _______________  
**Date:** _______________  
**Browser:** _______________  
**Status:** _______________

---

**Testing Guide Complete** ✅
