
sudo systemctl status postgresql
sudo systemctl restart postgresql

CREATE DATABASE bhoomisetu_db;

sudo -i -u postgres
psql

Authentication Module:
cp /home/kaivalya/vinay/Flutter/bhoomisetu/db/migrations/20260109_initial_auth_schema.sql /tmp/
psql -d bhoomisetu_db -f /tmp/20260109_initial_auth_schema.sql

Requirements Module:
cp /home/kaivalya/vinay/Flutter/bhoomisetu/db/migrations/20260109_buyer_requirements_schema.sql /tmp/
psql -d bhoomisetu_db -f /tmp/20260109_buyer_requirements_schema.sql

Mediation Module:
cp /home/kaivalya/vinay/Flutter/bhoomisetu/db/migrations/20260109_mediation_schema.sql /tmp/
psql -d bhoomisetu_db -f /tmp/20260109_mediation_schema.sql

Properties Module:
cp /home/kaivalya/vinay/Flutter/bhoomisetu/db/migrations/20260109_properties_schema.sql /tmp/
psql -d bhoomisetu_db -f /tmp/20260109_properties_schema.sql

Ai Chat Module:
cp /home/kaivalya/vinay/Flutter/bhoomisetu/db/migrations/20260109_ai_chat_schema.sql /tmp/
psql -d bhoomisetu_db -f /tmp/20260109_ai_chat_schema.sql

Notifications Module:
cp /home/kaivalya/vinay/Flutter/bhoomisetu/db/migrations/20260109_notifications_schema.sql /tmp/
psql -d bhoomisetu_db -f /tmp/20260109_notifications_schema.sql

Payments-Subscriptions Module:
cp /home/kaivalya/vinay/Flutter/bhoomisetu/db/migrations/20260109_payments_subscriptions_schema.sql /tmp/
psql -d bhoomisetu_db -f /tmp/20260109_payments_subscriptions_schema.sql

Reviews-Feedback Module:
cp /home/kaivalya/vinay/Flutter/bhoomisetu/db/migrations/20260109_reviews_feedback_schema.sql /tmp/
psql -d bhoomisetu_db -f /tmp/20260109_reviews_feedback_schema.sql

