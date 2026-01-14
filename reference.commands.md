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
