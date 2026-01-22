# Verify everything
bash verify_google_signin.sh

# Start backend
cd backend && npm run start:dev

# Run mobile app
cd mobile && flutter clean && flutter pub get && flutter run

<!-- Network Testing -->
http://192.168.0.108:3000/api/config/firebase

sudo systemctl daemon-reload
sudo systemctl status postgresql
sudo systemctl restart postgresql

sudo -i -u postgres
psql

psql -h 127.0.0.1 -U postgres -d bhoomisetu_db

CREATE DATABASE bhoomisetu_db;

Restart ADB
adb kill-server
adb start-server
adb devices

Restart Flutter
flutter clean
flutter pub get
flutter run

ip addr show | grep "inet " | grep -v 127.0.0.1

sudo ufw allow 3000/tcp
sudo ufw enable
sudo ufw status
sudo ufw allow 3000

sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw allow 3000/tcp  # Backend API

<!-- Git Restore Commands -->
git restore --staged backend/.env <!-- Specific file restore -->

git reset --soft HEAD~1 <!-- Latest commited branch restore-->

git fetch origin dev <!-- New branch fetch from remote repo-->
git checkout -b dev origin/dev <!-- New branch checkout from remote repo>




cp /home/kaivalya/vinay/Flutter/bhoomisetu/db/migrations/20260109_initial_auth_schema.sql /tmp/
sudo -i -u postgres
psql -d bhoomisetu_db -f /tmp/20260109_initial_auth_schema.sql
psql -U postgres -d bhoomisetu_db -f /tmp/20260109_initial_auth_schema.sql

cp /home/kaivalya/vinay/Flutter/bhoomisetu/db/migrations/20260109_mediation_schema.sql /tmp/
sudo -i -u postgres
psql -d bhoomisetu_db -f /tmp/20260109_buyer_requirements_schema.sql

psql -h 127.0.0.1 -p 5432 -U postgres -d bhoomisetu_db -f /tmp/20260109_buyer_requirements_schema.sql

psql -U postgres -d bhoomisetu_db -f db/migrations/20260109_buyer_requirements_schema.sql

psql -U postgres -d bhoomisetu_db -f db/migrations/20260109_initial_auth_schema.sql
psql -U postgres -d bhoomisetu_db -f db/migrations/20260109_properties_schema.sql
psql -U postgres -d bhoomisetu_db -f db/migrations/20260109_buyer_requirements_schema.sql
psql -U postgres -d bhoomisetu_db -f db/migrations/20260109_mediation_schema.sql


psql -U postgres -d bhoomisetu_db -f db/migrations/20260109_properties_schema.sql


DROP DATABASE bhoomisetu_db;
\c bhoomisetu_db
\du
CREATE USER vinay WITH PASSWORD 'password123';
CREATE USER admin WITH PASSWORD 'admin123' SUPERUSER;
\dt
\d users

psql -d bhoomisetu_db -f db/migrations/20260109_initial_auth_schema.sql


Do it A, B, and C one by one let me know one it is completed and what can i do from my side


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
log and cache clean
sudo apt clean
sudo apt autoclean
sudo apt autoremove -y

sudo journalctl --vacuum-time=7d

rm -rf ~/.cache/*
rm -rf ~/.pub-cache
rm -rf ~/.gradle/caches
rm -rf ~/.gradle/daemon
rm -rf ~/.android/build-cache
rm -rf ~/.local/share/Trash/*

sudo rm -rf /tmp/*
sudo rm -rf /var/tmp/*
