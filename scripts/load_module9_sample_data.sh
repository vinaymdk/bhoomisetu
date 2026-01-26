#!/bin/bash
set -e

# ---------- Colors ----------
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# ---------- DB Config (env override allowed) ----------
DB_NAME="${DB_NAME:-bhoomisetu_db}"
DB_USER="${DB_USER:-postgres}"
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
DB_PASSWORD="${DB_PASSWORD:-vinaymdk}"

# ---------- Resolve Project Root ----------
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

# ---------- SQL File Path ----------
SQL_FILE="$ROOT_DIR/db/sample-data/module9_notifications_sample_data.sql"

echo -e "${GREEN}=== BhoomiSetu Module 9 Sample Data Loader ===${NC}"

# ---------- Validate psql ----------
if ! command -v psql &> /dev/null; then
  echo -e "${RED}Error: psql is not installed or not in PATH${NC}"
  exit 1
fi

# ---------- Validate SQL File ----------
if [ ! -f "$SQL_FILE" ]; then
  echo -e "${RED}Error: SQL file not found${NC}"
  echo -e "${YELLOW}Expected path:${NC} $SQL_FILE"
  exit 1
fi

# ---------- Load Data ----------
echo -e "${YELLOW}Loading Module 9 sample data...${NC}"

PGPASSWORD="$DB_PASSWORD" \
psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -f "$SQL_FILE"

echo -e "${GREEN}✓ Module 9 sample data loaded successfully.${NC}"
