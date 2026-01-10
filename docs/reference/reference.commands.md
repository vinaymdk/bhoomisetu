
sudo systemctl status postgresql
sudo systemctl restart postgresql

sudo -i -u postgres
psql

psql -h 127.0.0.1 -U postgres -d bhoomisetu_db

CREATE DATABASE bhoomisetu_db;

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

