#!/bin/bash

# Run Database Migrations Script
# This script runs all database migration files in order

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Configuration
DB_NAME="${DB_NAME:-bhoomisetu_db}"
DB_USER="${DB_USER:-postgres}"
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
DB_PASSWORD="${DB_PASSWORD:-vinaymdk}"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
MIGRATIONS_DIR="$PROJECT_ROOT/db/migrations"

echo -e "${GREEN}=== Bhoomisetu Database Migrations ===${NC}\n"

# Check psql
if ! command -v psql &> /dev/null; then
    echo -e "${RED}Error: psql not installed${NC}"
    exit 1
fi

# Check DB connection
echo -e "${YELLOW}Checking database connection...${NC}"
if ! PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c '\q' 2>/dev/null; then
    echo -e "${RED}Error: Cannot connect to database${NC}"
    exit 1
fi

echo -e "${GREEN}Database connection successful!${NC}\n"

# Migration files in order
MIGRATIONS=(
    "20260109_initial_auth_schema.sql"
    "20260109_properties_schema.sql"
    "20260109_buyer_requirements_schema.sql"
    "20260109_mediation_schema.sql"
    "20260109_ai_chat_schema.sql"
    "20260109_notifications_schema.sql"
    "20260109_payments_subscriptions_schema.sql"
    "20260109_reviews_feedback_schema.sql"
    "2026_01_24_add_profile_fields.sql"
)

# Run migration function
run_migration() {
    local file=$1
    local description=$2

    echo -e "${YELLOW}Running: $description${NC}"
    if PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -f "$file" > /dev/null; then
        echo -e "${GREEN}✓ Successfully ran: $description${NC}\n"
        return 0
    else
        echo -e "${RED}✗ Failed to run: $description${NC}\n"
        return 1
    fi
}

# Run migrations
echo -e "${YELLOW}Running database migrations...${NC}\n"

for migration in "${MIGRATIONS[@]}"; do
    file_path="$MIGRATIONS_DIR/$migration"
    if [ ! -f "$file_path" ]; then
        echo -e "${YELLOW}⚠ Warning: Migration file not found: $migration${NC}\n"
        continue
    fi
    
    description=$(echo "$migration" | sed 's/20260109_//' | sed 's/_schema.sql//' | sed 's/_/ /g' | sed 's/\b\(.\)/\u\1/g')
    run_migration "$file_path" "$description"
done

echo -e "${GREEN}=== Migrations Complete ===${NC}\n"

# Verify tables
echo -e "${YELLOW}Verifying tables...${NC}"

TABLES=("users" "roles" "properties" "property_images")
for table in "${TABLES[@]}"; do
    COUNT=$(PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_name = '$table';" | tr -d ' ')
    if [ "$COUNT" = "1" ]; then
        echo -e "${GREEN}✓ Table '$table' exists${NC}"
    else
        echo -e "${YELLOW}⚠ Table '$table' not found${NC}"
    fi
done

echo ""
echo -e "${GREEN}Database migrations completed!${NC}"

