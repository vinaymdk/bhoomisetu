#!/bin/bash
set -e

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

bash "$DIR/01_initial_auth.sh"
bash "$DIR/02_properties.sh"
bash "$DIR/03_buyer_requirements.sh"
bash "$DIR/04_mediation.sh"
bash "$DIR/05_ai_chat.sh"
bash "$DIR/06_notifications.sh"
bash "$DIR/07_payments_subscriptions.sh"
bash "$DIR/08_reviews_feedback.sh"

