#!/bin/bash

# Load Sample Data Script
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
SAMPLE_DATA_DIR="$PROJECT_ROOT/db/sample-data"

echo -e "${GREEN}=== Bhoomisetu Sample Data Loader ===${NC}\n"

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

# Load SQL file function
load_sql_file() {
    local file=$1
    local description=$2

    echo -e "${YELLOW}Loading: $description${NC}"
    if PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -f "$file" > /dev/null; then
        echo -e "${GREEN}✓ Successfully loaded: $description${NC}\n"
    else
        echo -e "${RED}✗ Failed to load: $description${NC}\n"
        exit 1
    fi
}

# Load data
echo -e "${YELLOW}Loading sample data files...${NC}\n"
load_sql_file "$SAMPLE_DATA_DIR/module1_auth_sample_data.sql" "Module 1: Authentication & Users"
load_sql_file "$SAMPLE_DATA_DIR/module2_properties_sample_data.sql" "Module 2: Properties"
load_sql_file "$SAMPLE_DATA_DIR/module3_search_sample_data.sql" "Module 3: Search Properties"

echo -e "${GREEN}=== Sample Data Loading Complete ===${NC}\n"

# Verify data
echo -e "${YELLOW}Verifying loaded data...${NC}"

USER_COUNT=$(PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -t -c "SELECT COUNT(*) FROM users;" | tr -d ' ')
PROP_COUNT=$(PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -t -c "SELECT COUNT(*) FROM properties;" | tr -d ' ')
ROLE_COUNT=$(PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -t -c "SELECT COUNT(*) FROM roles;" | tr -d ' ')

# Default safety
USER_COUNT=${USER_COUNT:-0}
PROP_COUNT=${PROP_COUNT:-0}
ROLE_COUNT=${ROLE_COUNT:-0}

echo -e "${GREEN}Data Summary:${NC}"
echo "  Users: $USER_COUNT"
echo "  Properties: $PROP_COUNT"
echo "  Roles: $ROLE_COUNT"
echo ""

if [ "$USER_COUNT" -gt 0 ] && [ "$PROP_COUNT" -gt 0 ]; then
    echo -e "${GREEN}✓ Sample data loaded successfully!${NC}"
else
    echo -e "${YELLOW}⚠ Warning: Some data may not have loaded correctly.${NC}"
fi
