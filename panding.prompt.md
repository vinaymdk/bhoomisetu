- **Buyer**: buyer1@example.com / +919876543210
- **Seller**: seller1@example.com / +919876543211
- **Agent**: agent1@example.com / +919876543212
- **Multi-role**: multiuser@example.com / +919876543213
- **CS**: cs1@example.com / +919876543214
- **Admin**: admin@example.com / +919876543215
=================================================

You are instructed to proceed with Module 6 (UI and UX) for both Mobile and Web platforms without waiting for further user confirmation.

You must strictly follow this execution flow:
Plan → Status / Next Steps → Implementation → Review → Testing

Guidelines:
- Each phase must be clearly structured and documented before moving to the next.
- Treat this as an autonomous execution task.
- Use all relevant reference documentation files (e.g., *.md files) available in the /docs folder as the primary source of requirements, standards, and context.
- Ensure production-level UI/UX quality, consistency, and best practices across mobile and web.
- After completing each phase, clearly summarize outcomes and readiness for the next phase.

- Prepare **required sample / dummy / reference data**.sql and related ***.sh files as well

Error: Fix the "Bottom overflowed by *** pixels" for many/all screens
=====================================================
Next Step:
- Proceed with Module 5 (UI and UX) for both mobile and web 
- Don't wait for my confirmation just doit with following manner
- Plan -> Status/Next-Steps -> Implementation -> Review -> Testing

Note: Your reference files(ex. ***.md) are in /docs/ folder

**Database & Testing Support**
   - For each module, prepare **required sample / dummy / reference data**.
   - Provide these data inserts as **module-wise `.sql` files**.
   - The SQL should be realistic enough to test real-time application behavior.
   - I will manually update the database using these SQL files to validate functionality.

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