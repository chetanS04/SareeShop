#!/usr/bin/env bash
# Import saree-app.sql into local / server MySQL.
# Usage (WSL/Git Bash/Linux):
#   ./scripts/import-sql.sh
#   DB_NAME=saree_app DB_USER=root DB_PASS=root1234 ./scripts/import-sql.sh
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SQL_FILE="${SQL_FILE:-$ROOT/saree-app.sql}"
DB_HOST="${DB_HOST:-127.0.0.1}"
DB_PORT="${DB_PORT:-3306}"
DB_NAME="${DB_NAME:-saree_app}"
DB_USER="${DB_USER:-root}"
DB_PASS="${DB_PASS:-root1234}"

if [[ ! -f "$SQL_FILE" ]]; then
  echo "ERROR: SQL dump not found: $SQL_FILE"
  exit 1
fi

echo "==> Creating database \`$DB_NAME\` (if missing)..."
mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -p"$DB_PASS" -e \
  "CREATE DATABASE IF NOT EXISTS \`$DB_NAME\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

echo "==> Importing $SQL_FILE into \`$DB_NAME\`..."
mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -p"$DB_PASS" "$DB_NAME" < "$SQL_FILE"

echo "==> Verifying counts..."
mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -p"$DB_PASS" -N "$DB_NAME" -e "
SELECT 'products', COUNT(*) FROM products;
SELECT 'categories', COUNT(*) FROM categories;
SELECT 'brands', COUNT(*) FROM brands;
SELECT 'variants', COUNT(*) FROM variants;
SELECT 'users', COUNT(*) FROM users;
"

echo "==> Done. Restart API if it was already running."
