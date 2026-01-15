# Comprehensive Testing Guide

## Overview
This guide covers testing procedures for Module 3 (Search) and Authentication fixes on both Web and Mobile platforms.

---

## Prerequisites

### Database Setup
1. Ensure PostgreSQL is running
2. Run database migrations
3. Load sample data (see `db/sample-data/README.md`)

### Environment Setup
- **Web**: Backend API running on `http://localhost:3000` (or configured URL)
- **Mobile**: Backend API accessible from mobile device/emulator
- **Backend**: All modules (1-3) backend APIs should be running

---

## Part 1: Authentication Flow Testing

### Web Authentication Testing

#### Test 1: Login Flow
1. **Navigate to** `/login`
2. **Enter credentials**:
   - Phone: `+91 9876543210` (or email: `buyer1@example.com`)
   - Request OTP
3. **Verify OTP** and complete login
4. **Expected**: Redirected to `/dashboard`
5. **Verify**: User data displayed correctly

#### Test 2: Session Persistence (Page Refresh)
1. **After login**, refresh the page (F5 or Ctrl+R)
2. **Expected**: User remains logged in
3. **Verify**: User data still displayed
4. **Check**: No redirect to login page

#### Test 3: Token Refresh
1. **Wait for access token to expire** (or manually expire it)
2. **Make an API call** (e.g., navigate to dashboard)
3. **Expected**: Token automatically refreshed
4. **Verify**: Request succeeds without re-login

#### Test 4: Route Protection - Authenticated User
1. **While logged in**, try to access `/login`
2. **Expected**: Redirected to `/dashboard`
3. **Verify**: Cannot access login page

#### Test 5: Route Protection - Unauthenticated User
1. **Logout** (if logged in)
2. **Try to access** `/dashboard`
3. **Expected**: Redirected to `/login`
4. **Verify**: Protected route is blocked

#### Test 6: Token Refresh Failure
1. **Manually delete refresh token** from localStorage
2. **Wait for access token to expire**
3. **Make an API call**
4. **Expected**: Logged out and redirected to login

### Mobile Authentication Testing

#### Test 1: Login Flow
1. **Open app** (should show LoginScreen if not authenticated)
2. **Enter credentials**:
   - Phone: `+91 9876543210` (or email: `buyer1@example.com`)
   - Request OTP
3. **Verify OTP** and complete login
4. **Expected**: Navigated to HomeScreen
5. **Verify**: User data displayed correctly

#### Test 2: Session Persistence (App Restart)
1. **After login**, close the app completely
2. **Reopen the app**
3. **Expected**: User remains logged in
4. **Verify**: HomeScreen shown (not LoginScreen)
5. **Check**: User data still available

#### Test 3: Token Refresh
1. **Wait for access token to expire** (or manually expire it)
2. **Make an API call** (e.g., pull to refresh on home)
3. **Expected**: Token automatically refreshed
4. **Verify**: Request succeeds without re-login

#### Test 4: Route Protection
1. **While logged in**, app should show HomeScreen
2. **Logout** (if available)
3. **Expected**: App shows LoginScreen
4. **Verify**: Cannot access protected screens

---

## Part 2: Module 3 Search Testing

### Web Search Testing

#### Test 1: Natural Language Search
1. **Navigate to** `/search`
2. **Enter query**: "2BHK apartment in Hyderabad under 50L"
3. **Click Search**
4. **Expected**: Results displayed with matching properties
5. **Verify**: AI extracted filters shown
6. **Verify**: Match reasons displayed for each property

#### Test 2: Advanced Filters
1. **Open filters sidebar**
2. **Set filters**:
   - Listing Type: For Sale
   - Property Type: Apartment
   - City: Hyderabad
   - Min Price: 3000000
   - Max Price: 7000000
   - Bedrooms: 2
3. **Click Search**
4. **Expected**: Filtered results displayed
5. **Verify**: Only matching properties shown

#### Test 3: Sorting
1. **Perform a search**
2. **Change sort option** to "Price"
3. **Expected**: Results sorted by price
4. **Try other sorts**: Popularity, Urgency, Newest
5. **Verify**: Results sorted correctly

#### Test 4: Pagination
1. **Perform a search** that returns many results
2. **Navigate to page 2**
3. **Expected**: Next page of results displayed
4. **Verify**: Page number updates
5. **Test**: Previous/Next buttons work

#### Test 5: AI Rankings Display
1. **Perform a search**
2. **Check results** for:
   - Relevance scores
   - Urgency scores
   - Popularity scores
   - Match reasons
3. **Expected**: All AI data displayed correctly

#### Test 6: Similar Properties
1. **Perform a search**
2. **Scroll to bottom**
3. **Expected**: Similar Properties section visible
4. **Verify**: Similar properties within ±10% price range

#### Test 7: Empty State
1. **Search for**: "10BHK mansion in Antarctica"
2. **Expected**: Empty state message displayed
3. **Verify**: "No properties found" message
4. **Verify**: Clear filters button available

#### Test 8: Error Handling
1. **Stop backend server**
2. **Perform a search**
3. **Expected**: Error message displayed
4. **Verify**: Retry button available
5. **Start backend** and retry
6. **Expected**: Search works after retry

### Mobile Search Testing

#### Test 1: Natural Language Search
1. **Navigate to Search screen** (from bottom nav)
2. **Enter query**: "3BHK villa near beach"
3. **Tap Search**
4. **Expected**: Results displayed in list
5. **Verify**: AI extracted filters shown
6. **Verify**: Match reasons displayed

#### Test 2: Filter Bottom Sheet
1. **Tap filter icon** in app bar
2. **Set filters**:
   - Listing Type: For Rent
   - Property Type: House
   - City: Bangalore
   - Price Range: 20000 - 50000
   - Bedrooms: 2
3. **Expected**: Filters applied automatically
4. **Verify**: Filter badge shows count
5. **Verify**: Results updated

#### Test 3: Pull-to-Refresh
1. **On search results screen**
2. **Pull down** to refresh
3. **Expected**: Refresh indicator shown
4. **Expected**: Results refreshed
5. **Verify**: Loading state during refresh

#### Test 4: Infinite Scroll
1. **Perform a search** with many results
2. **Scroll down** to bottom
3. **Expected**: More results load automatically
4. **Verify**: Loading indicator at bottom
5. **Verify**: All results eventually loaded

#### Test 5: Sorting
1. **Open filter bottom sheet**
2. **Change Sort By** to "Price"
3. **Expected**: Results sorted by price
4. **Try other sorts**
5. **Verify**: Results sorted correctly

#### Test 6: AI Rankings
1. **Perform a search**
2. **Check property cards** for:
   - Relevance badges
   - Urgency badges
   - Popularity badges
   - Match reasons
3. **Expected**: All AI data displayed

#### Test 7: Empty State
1. **Search for**: "castle in the sky"
2. **Expected**: Empty state with message
3. **Verify**: Example searches shown
4. **Tap example search**
5. **Expected**: Search performed

#### Test 8: Offline Handling
1. **Enable airplane mode** (or disconnect network)
2. **Try to search**
3. **Expected**: Error message about connectivity
4. **Disable airplane mode**
5. **Retry search**
6. **Expected**: Search works

---

## Part 3: Integration Testing

### Test 1: Search from Home Page
1. **On home page**, use AI Search Bar
2. **Enter query** and search
3. **Expected**: Navigate to search page with results

### Test 2: Search to Property Details
1. **Perform search**
2. **Click on a property card**
3. **Expected**: Navigate to property details (if implemented)
4. **Or**: Verify property data displayed

### Test 3: Filter Persistence
1. **Set filters** on search page
2. **Navigate away** and come back
3. **Expected**: Filters preserved (Web: in URL, Mobile: in state)

### Test 4: Cross-Platform Consistency
1. **Perform same search** on Web and Mobile
2. **Compare results**
3. **Expected**: Similar results (may differ due to pagination)
4. **Verify**: Same AI rankings and match reasons

---

## Part 4: Performance Testing

### Test 1: Search Response Time
1. **Perform search**
2. **Measure time** from click to results display
3. **Expected**: < 2 seconds for typical search
4. **Note**: AI ranking may take longer

### Test 2: Large Result Sets
1. **Search with broad criteria** (e.g., "apartment")
2. **Expected**: Pagination works correctly
3. **Verify**: No performance degradation

### Test 3: Multiple Rapid Searches
1. **Perform 5 searches** in quick succession
2. **Expected**: All searches complete
3. **Verify**: No race conditions or errors

---

## Part 5: Edge Cases

### Test 1: Special Characters in Search
1. **Search for**: "apartment @#$%"
2. **Expected**: Handled gracefully
3. **Verify**: No errors

### Test 2: Very Long Search Query
1. **Search for**: Very long query (500+ characters)
2. **Expected**: Handled or truncated
3. **Verify**: No errors

### Test 3: Empty Search
1. **Submit empty search**
2. **Expected**: Appropriate message or initial state

### Test 4: Invalid Filters
1. **Set min price > max price**
2. **Expected**: Handled gracefully
3. **Verify**: Appropriate validation

---

## Test Checklist

### Authentication
- [ ] Web: Login flow works
- [ ] Web: Session persists on refresh
- [ ] Web: Token refresh works
- [ ] Web: Route protection works
- [ ] Mobile: Login flow works
- [ ] Mobile: Session persists on app restart
- [ ] Mobile: Token refresh works
- [ ] Mobile: Route protection works

### Search - Web
- [ ] Natural language search works
- [ ] Filters work correctly
- [ ] Sorting works
- [ ] Pagination works
- [ ] AI rankings displayed
- [ ] Similar properties shown
- [ ] Empty state works
- [ ] Error handling works

### Search - Mobile
- [ ] Natural language search works
- [ ] Filter bottom sheet works
- [ ] Pull-to-refresh works
- [ ] Infinite scroll works
- [ ] Sorting works
- [ ] AI rankings displayed
- [ ] Empty state works
- [ ] Offline handling works

### Integration
- [ ] Search from home page works
- [ ] Filter persistence works
- [ ] Cross-platform consistency

---

## Reporting Issues

When reporting issues, include:
1. **Platform**: Web or Mobile
2. **Test Case**: Which test failed
3. **Steps to Reproduce**: Detailed steps
4. **Expected Behavior**: What should happen
5. **Actual Behavior**: What actually happened
6. **Screenshots/Logs**: If available
7. **Environment**: Browser/Device, OS version

---

**Last Updated**: 2024-01-14

