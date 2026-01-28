- **Buyer**: buyer1@example.com / +919876543210
- **Seller**: seller1@example.com / +919876543211
- **Agent**: agent1@example.com / +919876543212
- **Multi-role**: multiuser@example.com / +919876543213
- **CS**: cs1@example.com / +919876543214
- **Admin**: admin@example.com / +919876543215
=================================================
"If you want, I can spin up the web dev server and do the UI smoke checks next." Yes please

Error Log:
   [Nest] 15893  - 01/28/2026, 10:52:40 AM   ERROR [ExceptionsHandler] invalid input syntax for type uuid: "customer_service"
   QueryFailedError: invalid input syntax for type uuid: "customer_service"
    at PostgresQueryRunner.query (/home/vinaymdk/assistDev/flutter/bhoomisetu/backend/src/driver/postgres/PostgresQueryRunner.ts:325:19)
    at processTicksAndRejections (node:internal/process/task_queues:103:5)
    at SelectQueryBuilder.loadRawResults (/home/vinaymdk/assistDev/flutter/bhoomisetu/backend/src/query-builder/SelectQueryBuilder.ts:3868:25)
    at SelectQueryBuilder.executeEntitiesAndRawResults (/home/vinaymdk/assistDev/flutter/bhoomisetu/backend/src/query-builder/SelectQueryBuilder.ts:3614:26)
    at SelectQueryBuilder.getRawAndEntities (/home/vinaymdk/assistDev/flutter/bhoomisetu/backend/src/query-builder/SelectQueryBuilder.ts:1671:29)
    at SelectQueryBuilder.getOne (/home/vinaymdk/assistDev/flutter/bhoomisetu/backend/src/query-builder/SelectQueryBuilder.ts:1698:25)
    at SupportChatService.listMessages (/home/vinaymdk/assistDev/flutter/bhoomisetu/backend/src/support-chat/support-chat.service.ts:281:21)
    at /home/vinaymdk/assistDev/flutter/bhoomisetu/backend/node_modules/@nestjs/core/router/router-execution-context.js:46:28
    at /home/vinaymdk/assistDev/flutter/bhoomisetu/backend/node_modules/@nestjs/core/router/router-proxy.js:9:17

API Error:
   - NotificationsPage.tsx:347 WebSocket connection to 'ws://192.168.0.11:3000/socket.io/?EIO=4&transport=websocket' failed: WebSocket is closed before the connection is established

AI Assistant: Repeated results happend 
   Issue: 
      Ai-result: Hi! I can help with property suggestions, FAQs, and booking. Ask your questions like: Find 2BHK under 50L, Show verified plots near metro.
      Input: HI
      Ai-result: Thanks for reaching out. Please share your requirement, location, and budget so I can help with the next steps.
      Input: I want to buy a house near Chirala bellow 30 laks
      Ai-result: I can connect you with Customer Support for further assistance. Please share your preferred location, budget, and property type so I can brief the team.
      Input: Location: Chirala, Budget: 30laks
      Ai-result: Got it. Please confirm your city, budget range, and property type (plot/flat/villa). I will suggest matching properties and share in-app links.
      Input: flat
      Ai-result: Got it. Please confirm your city, budget range, and property type (plot/flat/villa). I will suggest matching properties and share in-app links.
      Input: Chirala/any-city
      Ai-result: Thanks for reaching out. Please share your requirement, location, and budget so I can help with the next steps.

      Ai-result: Got it. Please confirm your city, budget range, and property type (plot/flat/villa). I will suggest matching properties and share in-app links.
      Input: please send app link
      Ai-result: Thanks for reaching out. Please share your requirement, location, and budget so I can help with the next steps.
      Input: I want to know about the complete application details
      Ai-result: Thanks for reaching out. Please share your requirement, location, and budget so I can help with the next steps.

Web:
   Profile: 
      - Add proper buttons for "Settings, Saved, Requirements, Subscriptions, and Payment History" Make it UI Professional (follw compleate application flow)


Mobile:
   Error Log:
      flutter run
      Launching lib/main.dart on CPH2553 in debug mode...
      lib/screens/search/search_screen.dart:1085:13: Error: The type 'BottomNavItem' is not exhaustively matched by the switch cases since it doesn't match 'BottomNavItem.subscriptions'.
      - 'BottomNavItem' is from 'package:bhoomisetu_mobile/widgets/bottom_navigation.dart' ('lib/widgets/bottom_navigation.dart').
      Try adding a default case or cases that match 'BottomNavItem.subscriptions'.
         switch (item) {
                  ^
      lib/screens/profile/settings_screen.dart:55:13: Error: The type 'BottomNavItem' is not exhaustively matched by the switch cases since it doesn't match 'BottomNavItem.subscriptions'.
      - 'BottomNavItem' is from 'package:bhoomisetu_mobile/widgets/bottom_navigation.dart' ('lib/widgets/bottom_navigation.dart').
      Try adding a default case or cases that match 'BottomNavItem.subscriptions'.
         switch (item) {
                  ^
      lib/screens/customer_service/cs_dashboard_screen.dart:363:13: Error: The type 'BottomNavItem' is not exhaustively matched by the switch cases since it doesn't match 'BottomNavItem.subscriptions'.
      - 'BottomNavItem' is from 'package:bhoomisetu_mobile/widgets/bottom_navigation.dart' ('lib/widgets/bottom_navigation.dart').
      Try adding a default case or cases that match 'BottomNavItem.subscriptions'.
         switch (item) {
                  ^
      lib/screens/customer_service/cs_property_screen.dart:274:13: Error: The type 'BottomNavItem' is not exhaustively matched by the switch cases since it doesn't match 'BottomNavItem.subscriptions'.
      - 'BottomNavItem' is from 'package:bhoomisetu_mobile/widgets/bottom_navigation.dart' ('lib/widgets/bottom_navigation.dart').
      Try adding a default case or cases that match 'BottomNavItem.subscriptions'.
         switch (item) {
                  ^
      lib/screens/properties/saved_properties_screen.dart:69:13: Error: The type 'BottomNavItem' is not exhaustively matched by the switch cases since it doesn't match 'BottomNavItem.subscriptions'.
      - 'BottomNavItem' is from 'package:bhoomisetu_mobile/widgets/bottom_navigation.dart' ('lib/widgets/bottom_navigation.dart').
      Try adding a default case or cases that match 'BottomNavItem.subscriptions'.
         switch (item) {
                  ^
      lib/screens/properties/property_details_screen.dart:396:13: Error: The type 'BottomNavItem' is not exhaustively matched by the switch cases since it doesn't match 'BottomNavItem.subscriptions'.
      - 'BottomNavItem' is from 'package:bhoomisetu_mobile/widgets/bottom_navigation.dart' ('lib/widgets/bottom_navigation.dart').
      Try adding a default case or cases that match 'BottomNavItem.subscriptions'.
         switch (item) {
                  ^
      lib/screens/buyer_requirements/buyer_requirements_screen.dart:81:13: Error: The type 'BottomNavItem' is not exhaustively matched by the switch cases since it doesn't match 'BottomNavItem.subscriptions'.
      - 'BottomNavItem' is from 'package:bhoomisetu_mobile/widgets/bottom_navigation.dart' ('lib/widgets/bottom_navigation.dart').
      Try adding a default case or cases that match 'BottomNavItem.subscriptions'.
         switch (item) {
                  ^
      lib/screens/mediation/buyer_interests_screen.dart:58:13: Error: The type 'BottomNavItem' is not exhaustively matched by the switch cases since it doesn't match 'BottomNavItem.subscriptions'.
      - 'BottomNavItem' is from 'package:bhoomisetu_mobile/widgets/bottom_navigation.dart' ('lib/widgets/bottom_navigation.dart').
      Try adding a default case or cases that match 'BottomNavItem.subscriptions'.
         switch (item) {
                  ^
      lib/screens/properties/my_listings_screen.dart:270:13: Error: The type 'BottomNavItem' is not exhaustively matched by the switch cases since it doesn't match 'BottomNavItem.subscriptions'.
      - 'BottomNavItem' is from 'package:bhoomisetu_mobile/widgets/bottom_navigation.dart' ('lib/widgets/bottom_navigation.dart').
      Try adding a default case or cases that match 'BottomNavItem.subscriptions'.
         switch (item) {
                  ^
      lib/screens/mediation/seller_interests_screen.dart:56:13: Error: The type 'BottomNavItem' is not exhaustively matched by the switch cases since it doesn't match 'BottomNavItem.subscriptions'.
      - 'BottomNavItem' is from 'package:bhoomisetu_mobile/widgets/bottom_navigation.dart' ('lib/widgets/bottom_navigation.dart').
      Try adding a default case or cases that match 'BottomNavItem.subscriptions'.
         switch (item) {
                  ^
      lib/screens/notifications/notifications_screen.dart:186:13: Error: The type 'BottomNavItem' is not exhaustively matched by the switch cases since it doesn't match 'BottomNavItem.subscriptions'.
      - 'BottomNavItem' is from 'package:bhoomisetu_mobile/widgets/bottom_navigation.dart' ('lib/widgets/bottom_navigation.dart').
      Try adding a default case or cases that match 'BottomNavItem.subscriptions'.
         switch (item) {
                  ^
      lib/screens/notifications/notification_settings_screen.dart:51:13: Error: The type 'BottomNavItem' is not exhaustively matched by the switch cases since it doesn't match 'BottomNavItem.subscriptions'.
      - 'BottomNavItem' is from 'package:bhoomisetu_mobile/widgets/bottom_navigation.dart' ('lib/widgets/bottom_navigation.dart').
      Try adding a default case or cases that match 'BottomNavItem.subscriptions'.
         switch (item) {
                  ^
      lib/screens/ai/ai_chat_screen.dart:169:13: Error: The type 'BottomNavItem' is not exhaustively matched by the switch cases since it doesn't match 'BottomNavItem.subscriptions'.
      - 'BottomNavItem' is from 'package:bhoomisetu_mobile/widgets/bottom_navigation.dart' ('lib/widgets/bottom_navigation.dart').
      Try adding a default case or cases that match 'BottomNavItem.subscriptions'.
         switch (item) {
                  ^
      lib/screens/profile/profile_screen.dart:219:13: Error: The type 'BottomNavItem' is not exhaustively matched by the switch cases since it doesn't match 'BottomNavItem.subscriptions'.
      - 'BottomNavItem' is from 'package:bhoomisetu_mobile/widgets/bottom_navigation.dart' ('lib/widgets/bottom_navigation.dart').
      Try adding a default case or cases that match 'BottomNavItem.subscriptions'.
         switch (item) {
                  ^
      lib/screens/properties/edit_property_screen.dart:471:13: Error: The type 'BottomNavItem' is not exhaustively matched by the switch cases since it doesn't match 'BottomNavItem.subscriptions'.
      - 'BottomNavItem' is from 'package:bhoomisetu_mobile/widgets/bottom_navigation.dart' ('lib/widgets/bottom_navigation.dart').
      Try adding a default case or cases that match 'BottomNavItem.subscriptions'.
         switch (item) {
                  ^
      lib/screens/properties/create_property_screen.dart:561:13: Error: The type 'BottomNavItem' is not exhaustively matched by the switch cases since it doesn't match 'BottomNavItem.subscriptions'.
      - 'BottomNavItem' is from 'package:bhoomisetu_mobile/widgets/bottom_navigation.dart' ('lib/widgets/bottom_navigation.dart').
      Try adding a default case or cases that match 'BottomNavItem.subscriptions'.
         switch (item) {
                  ^
      lib/screens/buyer_requirements/buyer_requirement_details_screen.dart:91:13: Error: The type 'BottomNavItem' is not exhaustively matched by the switch cases since it doesn't match 'BottomNavItem.subscriptions'.
      - 'BottomNavItem' is from 'package:bhoomisetu_mobile/widgets/bottom_navigation.dart' ('lib/widgets/bottom_navigation.dart').
      Try adding a default case or cases that match 'BottomNavItem.subscriptions'.
         switch (item) {
                  ^
      lib/screens/buyer_requirements/buyer_requirement_create_screen.dart:366:13: Error: The type 'BottomNavItem' is not exhaustively matched by the switch cases since it doesn't match 'BottomNavItem.subscriptions'.
      - 'BottomNavItem' is from 'package:bhoomisetu_mobile/widgets/bottom_navigation.dart' ('lib/widgets/bottom_navigation.dart').
      Try adding a default case or cases that match 'BottomNavItem.subscriptions'.
         switch (item) {
                  ^
      lib/screens/mediation/cs_mediation_screen.dart:71:13: Error: The type 'BottomNavItem' is not exhaustively matched by the switch cases since it doesn't match 'BottomNavItem.subscriptions'.
      - 'BottomNavItem' is from 'package:bhoomisetu_mobile/widgets/bottom_navigation.dart' ('lib/widgets/bottom_navigation.dart').
      Try adding a default case or cases that match 'BottomNavItem.subscriptions'.
         switch (item) {
                  ^
      Target kernel_snapshot_program failed: Exception


      FAILURE: Build failed with an exception.

      * What went wrong:
      Execution failed for task ':app:compileFlutterBuildDebug'.
      > Process 'command '/home/vinaymdk/flutter/bin/flutter'' finished with non-zero exit value 1

      * Try:
      > Run with --stacktrace option to get the stack trace.
      > Run with --info or --debug option to get more log output.
      > Run with --scan to get full insights.
      > Get more help at https://help.gradle.org.

      BUILD FAILED in 19s
      Running Gradle task 'assembleDebug'...                             20.5s
      Error: Gradle task assembleDebug failed with exit code 1

Completed: "npm --prefix backend run test" at terminal-bash "/bhoomisetu/npm --prefix backend run test"
Results:
✔ stores webhook and flags failed payment (5.798047ms)
✔ processes webhook success with stub verification record (5.881009ms)

"If you want, I can also run the web/mobile smoke checks noted in the updated runbook." Yes please

Mobile:
   Hamburger Menu:
      - Avatar/Profile, Name, Phone, and Email are place at blue-background-center-position
      - Abb Bottom-Nav to Subscriptions, and Payment History screens

Web:
   - Add Subscriptions, and Payment History for profile section -> bellow-profile-image

Footer Section:
   - Add Android-play-store and iOS-store links with images


"Module 10: I updated the prompt and roadmap per your instruction. If you want me to begin a new code pass for Module 10 (UI + webhook verification + smoke tests), say the word and I’ll proceed immediately." Yes please

- Add Profile-image(round-shape) at top of the Hamburger menu bellow the profile image Name, Phone and Email should be displayed

Notifications:
   Mobile:
      - Always showing notificatations at top nav after i read all the notifications
   Chat with Support:
      Mobile: 
         - After user sent message count is incresing fix this issue
         - Remove email at chat-box-header before the hambergur menu

      Web:
         - Chat users Name/Email overlaping fix with overlaping text with "support@bhomise..."


Note: 
   - After complete Module 10
   - Review the complete code/feature
   - Test the complete module 10 from your side
   - Let me know what can i do from my side

CS Login:
   Support Chart:
      - Duplicate names are visibling (ex.Anjali Mehta showing 4 times) to chat with them (It is confusion to Customer-service)
      - Double message sending while send message

      Mobile:
         - Check with mobile: list of users who have sent messages for their doubts/enquires/etc they are not showing only "Chat Support" available 
         - If messages read of respective user still messages count showing
         - Access panel not showing for CS Login

Notificatoins:
   Chat with Support:
      - Chat-User:
         - If user open respective user chat messages count should be empty but here when i send message count is increasing fix it
         - Display Name and Email insted of Seller-support/Buyer-support

      Mobile:
         - Send(latest) message not showing without scrolling need to fix it 
      
Note:
   - Online / Offline issue need to work (efficient) for both mobile and Web
   - Add Hamburger menu for mobile (toggle-button) for more options at the top-nav(Prefix - Bhoomisetu)
   - List the list of all menus at the hamburger menu

   Update Documentation and Roadmap and **.md files as per my requirements


Parallelly Start Module 10 Development

<!-- Module 10 Errors Prompt Start -->
Next-Step: 
   -Module 10 Development

   Prompt-Guidelines:
      - Follow the ai_microservice prompt as per "./docs/Prompts/Payments-and-Subscriptions.md" and start development
   - Suggest me if any better-plan then "./docs/Prompts/Payments-and-Subscriptions.md" just follow that as your plan 
   - Prepare the project structure as per best practices

   - If required Prepare **required sample / dummy / reference data**.sql in /db/sample-data/ and related ***.sh in /scripts/ files as well

   - Update Documentation and Roadmap

   - Suggest me what can i do from my side
<!-- Module 10 Errors Prompt end -->

         

AI Microservice:
- Can you create(Latest-verssion) "AI_MICROSERVICE_REPO" and connect/setup with quick guide for this project 

<!-- Module 9 Errors Prompt Start -->
Next-Step: 
AI Microservice:
- Can you create(Latest-verssion) "AI_MICROSERVICE_REPO" and connect/setup with quick guide for this project 

Prompt-Guidelines:
   - Follow the ai_microservice prompt as per "./docs/Prompts/ai.microservice.repo.md" and start development
- Suggest me if any better-plan then "./docs/Prompts/ai.microservice.repo.md" just follow that as your plan 
- Prepare the project structure as per best practices
- Setup CI/CD for this repo

- If required Prepare **required sample / dummy / reference data**.sql in /db/sample-data/ and related ***.sh in /scripts/ files as well

- Update Documentation 
   - Update ./docs/Prompts/ai.microservice.repo.md with all the changes you made
   - Create README.md for this repo with all the necessary details

- Suggest me what can i do from my side
<!-- Module 9 Errors Prompt end -->

==============================================================
Parallelly Start with Module 8 Developmet
<!-- Module 8 Errors Prompt Start -->
Next-Step: (Module 8 Development)
You are instructed to proceed with Module 8 (UI and UX) for both Mobile and Web platforms without waiting for further user confirmation.

You must strictly follow this execution flow:
Plan → Status / Next Steps → Implementation → Review → Testing

Guidelines:
- Each phase must be clearly structured and documented before moving to the next.
- Treat this as an autonomous execution task.
- Use all relevant reference documentation files (e.g., *.md files) available in the /docs folder as the primary source of requirements, standards, and context.
- Ensure production-level UI/UX quality, consistency, and best practices across mobile and web.
- Use proper card sections and data good visualization 
- After completing each phase, clearly summarize outcomes and readiness for the next phase.

- If required Prepare **required sample / dummy / reference data**.sql in /db/sample-data/ and related ***.sh in /scripts/ files as well

Note: Maintain production level development
   - Maintain and use reuasable functionality/scripts at gobal level
   - Maintain existing tap-nav, bottom-nav, buttons-styles
   - Explain what can i do from my side stem-wise
<!-- Module 8 Errors Prompt end -->

Bottom-Nav: (Maintain minimum 4 menus for every user-role)
   - CS-Login:
      - Add CS Dashboard icon/menu insted of top-nav(remove cs dashboard at top-nav)

Common: (Web + Mobile)   
   - Use "floating buttons (FABs)" buttons for existing/new(screens) forms which is Add/New records (Mobile ONLY)


Need to test ...

"If you want, I can add a full Saved management section on web (saved list + badge toggle) to match mobile." Yes Please

Parallelly complete the bellow profile related development
<!-- Profile prompt start -->
Profile: (Suggest me any other profile content)

You must strictly follow this execution flow: (Profile)
Plan → Status / Next Steps → Implementation → Review → Testing
- Ensure production-level UI/UX quality, consistency, and best practices across mobile and web.
- Use proper card sections and data good visualization 
- After completing each phase, clearly summarize outcomes and readiness for the next phase.

- Add profile image (camera/gallery)
- Update personal information like full-name, phone-number, email and address
- Toggles To control show counts of Saved, List and Reqs like (Notifications-count)
   Ex.Saved Count - On/Off, List Count - On/Off Reqs Count - On/Off
- Share / Promote App from social media(WhatsApp, Facebook, etc.)
- Logout

**Database & Testing Support**
   - If requires create db-migrations
   - If requires prepare **required sample / dummy / reference data**.
   - Provide these data inserts as **module-wise `.sql` files**.
   - Prepare **.sh files to easy migrate/upload data
<!-- Profile prompt end -->

Let me know, what can i do for next-step/quick-guide for mediation module 7
cs1@example.com: No records showing (No pending mediation tasks.)
buyer1@example.com: No records showing (No pending mediation tasks.)


<!-- Module 8 Errors Prompt Start -->
Next-Step: (Module 8 Development)
You are instructed to proceed with Module 8 (UI and UX) for both Mobile and Web platforms without waiting for further user confirmation.

You must strictly follow this execution flow:
Plan → Status / Next Steps → Implementation → Review → Testing

Guidelines:
- Each phase must be clearly structured and documented before moving to the next.
- Treat this as an autonomous execution task.
- Use all relevant reference documentation files (e.g., *.md files) available in the /docs folder as the primary source of requirements, standards, and context.
- Ensure production-level UI/UX quality, consistency, and best practices across mobile and web.
- Use proper card sections and data good visualization 
- After completing each phase, clearly summarize outcomes and readiness for the next phase.

- If required Prepare **required sample / dummy / reference data**.sql in /db/sample-data/ and related ***.sh in /scripts/ files as well

Note: Maintain production level development
   - Maintain and use reuasable functionality/scripts at gobal level
   - Maintain existing tap-nav, bottom-nav, buttons-styles
   - Explain what can i do from my side stem-wise
<!-- Module 8 Errors Prompt end -->
Mobile:
- Post Requirement screen should be bottom-nav check with all screens till now designed wether bottom-nav or not

- Botton-nav want to show count of Saved-items like (Notifications-count) each user can control with visible-or-not-from-profile -> toggle buttons

Error:
- One user(buyer1@example.com) Seved items/properties are showing another user(CS1@example.com)

Note:
- Saved item/property should be different for every user

Next-Step: (Module 7 Development)
You are instructed to proceed with Module 7 (UI and UX) for both Mobile and Web platforms without waiting for further user confirmation.

You must strictly follow this execution flow:
Plan → Status / Next Steps → Implementation → Review → Testing

Guidelines:
- Each phase must be clearly structured and documented before moving to the next.
- Treat this as an autonomous execution task.
- Use all relevant reference documentation files (e.g., *.md files) available in the /docs folder as the primary source of requirements, standards, and context.
- Ensure production-level UI/UX quality, consistency, and best practices across mobile and web.
- Use proper card sections and data good visualization 
- After completing each phase, clearly summarize outcomes and readiness for the next phase.

- If required Prepare **required sample / dummy / reference data**.sql in /db/sample-data/ and related ***.sh in /scripts/ files as well

- Guide me what can i do from my side

========================================================
<!-- Module 8 Errors Prompt Start -->
Next-Step: (Module 8 Development)
You are instructed to proceed with Module 8 (UI and UX) for both Mobile and Web platforms without waiting for further user confirmation.

You must strictly follow this execution flow:
Plan → Status / Next Steps → Implementation → Review → Testing

Guidelines:
- Each phase must be clearly structured and documented before moving to the next.
- Treat this as an autonomous execution task.
- Use all relevant reference documentation files (e.g., *.md files) available in the /docs folder as the primary source of requirements, standards, and context.
- Ensure production-level UI/UX quality, consistency, and best practices across mobile and web.
- Use proper card sections and data good visualization 
- After completing each phase, clearly summarize outcomes and readiness for the next phase.

- If required Prepare **required sample / dummy / reference data**.sql in /db/sample-data/ and related ***.sh in /scripts/ files as well

Note: Maintain production level development
   - Maintain and use reuasable functionality/scripts at gobal level
   - Maintain existing tap-nav, bottom-nav, buttons-styles
   - Explain what can i do from my side stem-wise
<!-- Module 8 Errors Prompt end -->

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
Profile: (Suggest me any other profile content)

You must strictly follow this execution flow: (Profile)
Plan → Status / Next Steps → Implementation → Review → Testing
- Ensure production-level UI/UX quality, consistency, and best practices across mobile and web.
- Use proper card sections and data good visualization 
- After completing each phase, clearly summarize outcomes and readiness for the next phase.

- Add profile image (camera/gallery)
- Update personal information like full-name, phone-number, email and address
- Toggles To control show counts of Saved, List and Reqs like (Notifications-count)
   Ex.Saved Count - On/Off, List Count - On/Off Reqs Count - On/Off
- Share / Promote App from social media(WhatsApp, Facebook, etc.)
- Logout

**Database & Testing Support**
   - If requires create db-migrations
   - If requires prepare **required sample / dummy / reference data**.
   - Provide these data inserts as **module-wise `.sql` files**.
   - Prepare **.sh files to easy migrate/upload data
===========================================
