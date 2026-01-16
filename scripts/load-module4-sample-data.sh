#!/bin/bash
set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

DB_NAME="${DB_NAME:-bhoomisetu_db}"
DB_USER="${DB_USER:-postgres}"
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
DB_PASSWORD="${DB_PASSWORD:-vinaymdk}"

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
FILE="$ROOT_DIR/db/sample-data/module4_listing_features_sample_data.sql"

echo -e "${GREEN}=== BhoomiSetu Module 4 Sample Data Loader ===${NC}"

if ! command -v psql &> /dev/null; then
  echo -e "${RED}Error: psql not installed${NC}"
  exit 1
fi

echo -e "${YELLOW}Loading: Module 4 listing features sample data...${NC}"
PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -f "$FILE"

echo -e "${GREEN}✓ Module 4 sample data loaded.${NC}"

