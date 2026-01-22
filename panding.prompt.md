- **Buyer**: buyer1@example.com / +919876543210
- **Seller**: seller1@example.com / +919876543211
- **Agent**: agent1@example.com / +919876543212
- **Multi-role**: multiuser@example.com / +919876543213
- **CS**: cs1@example.com / +919876543214
- **Admin**: admin@example.com / +919876543215
=================================================
Login with "**Buyer**: buyer1@example.com / +919876543210"
.env file: Check the following MAPBOX_API_KEY and execute to the project
- Added MAPBOX_API_KEY=***** in /backent/.env file (For testing)



Your responsibility is to REVIEW, RESTRUCTURE (if required), FIX, and PRODUCTION-HARDEN
Module 4 (My Listing / Create Listing) using ADVANCED UI ARCHITECTURE
for both Web (React) and Mobile (Flutter).

==================================================
ARCHITECTURAL PRINCIPLES (MANDATORY)
==================================================
• Follow clean architecture and separation of concerns
• UI must be modular, reusable, and scalable
• Business logic must NOT live inside UI widgets/components
• Follow platform best practices:
  - Web: container/presenter pattern, hooks, memoization
  - Mobile: MVVM / Clean Architecture (UI → ViewModel → Service)
• Fix root causes, not surface symptoms
• Minimize rework and avoid breaking changes
• Ensure performance, accessibility, and maintainability

==================================================
GLOBAL RULES
==================================================
• Work strictly within the existing codebase
• Do NOT redesign visuals unless required for correctness or UX
• Identify ROOT CAUSES before coding
• Use clean, scalable, production-ready patterns
• No hardcoded values, no temporary hacks
• Ensure behavior is consistent across ALL devices
• Verify fixes through real execution flows

==================================================
ADVANCED UI / ARCHITECTURE EXTENSIONS (NEW)
==================================================
1. Map Picker (Web + Mobile)
   - Replace text-only location search with a proper MAP VIEW picker
   - Allow user to select location directly from the map
   - Sync selected coordinates + address with form state

2. Mapbox Autocomplete
   - Integrate Mapbox autocomplete suggestions
   - Show selectable suggestion list
   - On selection:
     • Update map marker
     • Update address fields
   - Ensure graceful handling if MAPBOX_API_KEY is missing or invalid

3. Extend Module 4 Features
   - Add Edit Listing functionality
   - Enable image reordering (drag & drop / reorder controls)
   - Ensure edit flow reuses Create Listing logic safely

==================================================
MANDATORY FIELD & FORM RULES (WEB + MOBILE)
==================================================
• Add "*" indicator for all mandatory fields
• State field MUST be a dropdown with ONLY these India states:

  Andhra Pradesh,
  Arunachal Pradesh,
  Assam,
  Bihar,
  Chandigarh,
  Chhattisgarh,
  Goa,
  Gujarat,
  Haryana,
  Himachal Pradesh,
  Jammu and Kashmir,
  Jharkhand,
  Karnataka,
  Kerala,
  Madhya Pradesh,
  Maharashtra,
  Manipur,
  Meghalaya,
  Mizoram,
  Nagaland,
  Odisha,
  Punjab,
  Rajasthan,
  Sikkim,
  Tamil Nadu,
  Telangana,
  Tripura,
  Uttar Pradesh,
  Uttarakhand,
  West Bengal

==================================================
WEB – REVIEW & FIX
==================================================
1. Create Listing
   - Use professional form validation (field-level + submit-level)
   - Add area unit options:
     • sqft
     • sqm
     • acre
     • sqyrd
   - Fix "Save Listing Draft" button:
     • Should ENABLE only when valid
     • Currently stays disabled even after form completion → FIX

2. Authentication
   - After login as seller1@example.com:
     • Navigating to My Listing
     • Reloading any page
     • Direct URL access
     MUST NOT redirect to login
   - Fix token/session persistence and auth guards

==================================================
MOBILE (FLUTTER) – REVIEW & FIX
==================================================
1. AI Extracted Filters
   - When "X" is tapped:
     • Chip should be removed
     • NEW filtered results must be fetched and displayed
   - Fix state update logic (currently broken)

2. My Listings
   - Fix 15-second loading / TimeoutException
   - Ensure data renders if API returns results
   - Proper empty + error states

3. Create Listing
   - Fix Mapbox-based location picker not showing
   - Fix ALL dropdowns:
     • Area Unit
     • Bedrooms
     • Bathrooms
     • Any enum-based field
   - Ensure consistent validation and UX

4. BottomSheet Layout Issues
   - Fix ALL overflow errors:
     • "BOTTOM OVERFLOWED BY ***** PIXELS"
   - Correct misuse of Flexible / Expanded
   - Apply:
     • mainAxisSize: MainAxisSize.min
     • maxHeight constraints
     • Safe scrolling strategy
   - Must work on all screen sizes

==================================================
ENVIRONMENT CONFIGURATION
==================================================
• MAPBOX_API_KEY is already added for testing in:
  /backend/.env

• Verify backend reads it correctly
• Do NOT hardcode API keys
• Ensure Web & Mobile Mapbox features work via backend

==================================================
DELIVERABLES
==================================================
• Fully fixed & extended Module 4
• Map-based picker + autocomplete working
• Edit listing + image reordering implemented
• Production-grade validation & auth handling
• No runtime, layout, or console errors
• Tested end-to-end (login → listing → edit → search)

==================================================
EXECUTION ORDER
==================================================
1. Validate environment & Mapbox integration
2. Fix authentication persistence
3. Fix existing bugs (Web + Mobile)
4. Implement map picker & autocomplete
5. Extend edit listing & image reorder
6. Final regression & production verification

Begin with root-cause analysis, then apply verified fixes.
=====================================================================
Lock at these are also REVIEW and FIX everything in production level...
My Listing/Create Listing: Errors
- Add "*" for manditory fields 
- State field should be dropdown with India level states are 
"Andhra Pradesh, Arunachal Pradesh, Assam, Bihar, Chandigarh, Chhattisgarh, Goa, Gujarat, Haryana, Himachal Pradesh, Jammu and Kashmir, Jharkhand, Karnataka, Kerala, Madhya Pradesh, Maharashtra, Manipur, Meghalaya, Mizoram, Nagaland, Odisha, Punjab, Rajasthan, Sikkim, Tamil Nadu, Telangana, Tripura, Uttar Pradesh, Uttarakhand, West Bengal"

Web:
- Use proper validation in profesional form fields
- Create listing -> Add sqyrd (sqft, sqm, acre, "sqyrd") also
- Save-Listing-Draft buttom dissabled mode after fill the form also
- After login seller1@example.com user, when click My Listing/any-page/reload -> navigating to login page(Authentication-problem)

Mobile:
- AI Extracted Filters: after cancle "X" selected-filter-chip deleted but new filtered items not adding
- My Listings loading for 15 seconds(Timeout Exception-error) but no data showing
- Location picker not showing 
- Fields dropdowns(Area Unit, Bedroom, Bathroom, check all the form fields) not working
- "BOTTOM OVERFLOWED BY ***** PIXELS" Issue is inside BottomSheet Flexible / Expanded misuse fix.



Next Step:
- Proceed with Module 4 (UI and UX) for both mobile and web 
- Don't wait for my confirmation just doit with following manner
- Plan -> Status/Next-Steps -> Implementation -> Review -> Testing

Start Module 4 in the required format: Plan → Status/Next-Steps → Implementation → Review → Testing.


# ==========================================================================
Reference smart prompting
# ==========================================================================

Your responsibility is to REVIEW, RESTRUCTURE (if required), FIX, and PRODUCTION-HARDEN
Module 4 (My Listing / Create Listing) using ADVANCED UI ARCHITECTURE
for both Web (React) and Mobile (Flutter).

==================================================
ARCHITECTURAL PRINCIPLES (MANDATORY)
==================================================
• Follow clean architecture and separation of concerns
• UI must be modular, reusable, and scalable
• Business logic must NOT live inside UI widgets/components
• Follow platform best practices:
  - Web: container/presenter pattern, hooks, memoization
  - Mobile: MVVM / Clean Architecture (UI → ViewModel → Service)
• Fix root causes, not surface symptoms
• Minimize rework and avoid breaking changes
• Ensure performance, accessibility, and maintainability

==================================================
GLOBAL RULES
==================================================
• Work strictly within the existing codebase
• Do NOT redesign visuals unless required for correctness or UX
• Identify ROOT CAUSES before coding
• Use clean, scalable, production-ready patterns
• No hardcoded values, no temporary hacks
• Ensure behavior is consistent across ALL devices
• Verify fixes through real execution flows

- Proceed with Module 3 (UI and UX) for both mobile and web 
- Don't wait for my confirmation just doit with following manner
- Plan -> Status/Next-Steps -> Implementation -> Review -> Testing

Note:
- Update Roadmap for every development / implementaion

**Database & Testing Support**
   - For each module, prepare **required sample / dummy / reference data**.
   - Provide these data inserts as **module-wise `.sql` files**.
   - The SQL should be realistic enough to test real-time application behavior.
   - I will manually update the database using these SQL files to validate functionality.

Implement standard mobile UX features:
- Pull-to-refresh
- Loading, empty, and error states
- Offline handling with retry
- Session persistence and route protection
- Pagination / infinite scroll
Ensure features follow production-level mobile UX practices.

Begin with root-cause analysis, then apply verified fixes.
# =====================================