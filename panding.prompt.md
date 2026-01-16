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

You are Cursor AI running with GPT-5.2 Codex.
Act as a senior full-stack + Flutter engineer working inside an existing production codebase.

Your task is to REVIEW, FIX, and HARDEN Module 4 (My Listing / Create Listing)
for both Web (React) and Mobile (Flutter), including environment configuration.

==================================================
RULES (IMPORTANT)
==================================================
• Work with the existing codebase only
• Do NOT redesign UI unless required for fixing bugs
• Identify ROOT CAUSE before changing code
• Make minimal, clean, production-safe changes
• Fix issues permanently (not temporary hacks)
• Ensure fixes work across ALL devices
• Verify changes by tracing real execution paths

==================================================
ENVIRONMENT CONFIGURATION (NEW – REQUIRED)
==================================================
1. Mapbox API Key
   - Verify usage of MAPBOX_API_KEY in backend
   - MAPBOX_API_KEY is already added for testing in:
     /backend/.env
       MAPBOX_API_KEY=*****

2. Required Actions
   - Ensure backend reads MAPBOX_API_KEY correctly from environment
   - Validate Mapbox-related services/controllers use this key
   - Ensure frontend/mobile location picker works via backend API
   - Add safe fallback / error handling if key is missing or invalid
   - Do NOT hardcode API keys anywhere in code

==================================================
WEB – ISSUES TO FIX
==================================================
1. Create Listing Form
   - Add "*" indicator for all mandatory fields
   - State field must be a dropdown containing ALL Indian states
   - Add area unit options:
     • sqft
     • sqm
     • acre
     • sqyrd
   - Fix "Save Listing Draft" button:
     • Enable only when form is valid
     • Disable when required fields are missing
   - Implement proper field-level validation with clear error messages

2. Property Search Page
   - Search bar must remain STICKY in header while scrolling results
   - Must not hide on scroll

3. Authentication / Routing
   - After login as seller1@example.com:
     • Clicking "My Listing" must NOT redirect to login
     • Fix auth guard / token persistence / route protection logic

==================================================
MOBILE (FLUTTER) – ISSUES TO FIX
==================================================
1. Search & AI Extracted Filters
   - Add cancel "X" button for EACH AI extracted filter chip
   - Fix runtime error:
     "type 'Null' is not a subtype of type 'String'"
     • Apply safe parsing
     • Add null checks
     • Avoid forced type casts

2. My Listings Screen
   - Fix 15-second loading issue (TimeoutException)
   - Ensure API response is parsed correctly
   - Display listings when data exists
   - Handle empty and error states properly

3. Create Listing Form
   - Fix location picker (Mapbox-based) not showing
   - Verify Mapbox integration end-to-end (backend → mobile)
   - Fix ALL dropdown fields:
     • Area Unit
     • Bedrooms
     • Bathrooms
     • Any enum-based field
   - Ensure consistent UX and validation

4. App Stability
   - After login, Home/Landing page stuck in loading → FIX
   - Inspect state management, API calls, and lifecycle handling

5. BottomSheet Layout Bugs
   - Fix ALL overflow issues caused by incorrect Flexible / Expanded usage:
     • BOTTOM OVERFLOWED BY 113 PIXELS
     • BOTTOM OVERFLOWED BY 185 PIXELS
     • BOTTOM OVERFLOWED BY 131 PIXELS
   - Use correct layout strategy:
     • mainAxisSize
     • Flexible vs Expanded
     • maxHeight constraints
   - Ensure BottomSheet works across all screen sizes

==================================================
DELIVERABLES
==================================================
• Fixed Web + Mobile code
• Verified Mapbox integration using MAPBOX_API_KEY
• Production-ready, null-safe implementations
• No runtime, console, or layout errors
• Fully tested Module 4 end-to-end

==================================================
EXECUTION STRATEGY
==================================================
1. Validate environment variables
2. Identify root causes
3. Fix logic, layout, and integration issues
4. Verify with real flows (login, listing, search, location)
5. Final regression and stability check

Start with environment verification, then proceed with root-cause fixes.


My Listing/Create Listing: Errors
- Add "*" for manditory fields 
- State field should be dropdown with India level states
Web:
- Property Search stick on header(don't hide) while scrollig list of searched items/properties 
- Use proper validation
- Create listing -> Add sqyrd (sqft, sqm, acre, "sqyrd") also
- Save-Listing-Draft buttom dissabled mode after fill the form also
- After login seller1@example.com user, when click My Listing -> navigating to login page

Mobile:
- AI Extracted Filters: after cancle "X" selected filter chip new filtered items not adding
- Error: type "Null" is not a subtype of type "String" in type cast - When search properties
- My Listings loading for 15 seconds(Timeout Exception-error) but no data showing
- Location picker not showing 
- Fields are not proper manner dropdowns(Area Unit, Bedroom, Bathroom, check all the form fields) not working

Verify and Fix the all issues, Review and testing the Module 4 completly prodection level

Issues - Mobile: 
- After User login Home/Landing page continues-loading
- AI Extracted Filters: add cance "X" option for each one
- "BOTTOM OVERFLOWED BY 113 PIXELS" Issue is inside BottomSheet Flexible / Expanded misuse fix.
- "BOTTOM OVERFLOWED BY 185 PIXELS" Issue is inside BottomSheet Flexible / Expanded misuse fix.
- "BOTTOM OVERFLOWED BY 131 PIXELS" Issue is inside BottomSheet Flexible / Expanded misuse fix.

Prepare Professional prompting for code assistant(GPT 5.2 Codex)

Next Step:
- Proceed with Module 4 (UI and UX) for both mobile and web 
- Don't wait for my confirmation just doit with following manner
- Plan -> Status/Next-Steps -> Implementation -> Review -> Testing

Start Module 4 in the required format: Plan → Status/Next-Steps → Implementation → Review → Testing.

Note: 
- Create Module wise sample db data(**.sql and .sh files) If any need
- Aplication/Project Name: "BhoomiSetu" "B & S" capital letters for UI

No properties displaying
Error: 
- while input-search-field 'house' -> search -> "type 'Null' is not a subtype of type 'int' in type cast"
 
- "BOTTOM OVERFLOWED BY 113 PIXELS" Issue is inside BottomSheet Flexible / Expanded misuse fix.
- "BOTTOM OVERFLOWED BY 185 PIXELS" Issue is inside BottomSheet Flexible / Expanded misuse fix.
- "BOTTOM OVERFLOWED BY 131 PIXELS" Issue is inside BottomSheet Flexible / Expanded misuse fix.

- Create ***.sh files for db/migrations


"Implementation is complete and ready for testing. All components follow the existing codebase patterns and integrate with the backend API." YES PLEASE Cotinue with bellow requrements as well after complete testing

You are a senior full-stack architect and authentication expert.

### Current Issues (High Priority)
1. **Authentication error after login**
   - User is successfully logged in.
   - On browser refresh / hard refresh, the application redirects back to the login page.
   - Session / token persistence is not working as expected.

2. **Access control issue**
   - Once a user is logged in, the login page should NOT be accessible.
   - Only after explicit logout, the login page should be accessible again.
   - Proper route guards / middleware must be enforced for both authenticated and unauthenticated routes.

---

### Requirements
1. **Fix Authentication Flow**
   - Implement correct session handling (JWT / refresh token / cookies / local storage as applicable).
   - Ensure authentication state is restored on page refresh.
   - Prevent unauthorized redirects.
   - Handle token expiration and refresh correctly.
   - Mobile pull-to-refresh (drag down) functionality.


2. **Route Protection**
   - Block authenticated users from accessing login/register pages.
   - Block unauthenticated users from accessing protected routes.
   - Follow best practices for frontend and backend authorization.

3. **Roadmap & Progress Tracking**
   - Maintain and update a clear **development roadmap**.
   - After each development or implementation step:
     - Update what is completed
     - What is pending
     - What is next
   - Roadmap should be module-wise and easy to track.

4. **Database & Testing Support**
   - For each module, prepare **required sample / dummy / reference data**.
   - Provide these data inserts as **module-wise `.sql` files**.
   - The SQL should be realistic enough to test real-time application behavior.
   - I will manually update the database using these SQL files to validate functionality.

---

### Expectations
- Follow clean architecture and production-ready practices.
- Explain authentication fixes clearly (frontend + backend).
- Ensure scalability and security best practices.
- Keep communication concise, technical, and professional.

Implement standard mobile UX features:
- Pull-to-refresh
- Loading, empty, and error states
- Offline handling with retry
- Session persistence and route protection
- Pagination / infinite scroll
Ensure features follow production-level mobile UX practices.

Act like you are building this system for a real production environment.



# =====================================
Reference smart prompting
# =====================================
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

# =====================================