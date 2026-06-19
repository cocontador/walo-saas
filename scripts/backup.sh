#!/bin/bash
set -e

if [ -z "$DATABASE_URL" ] && [ -f .env ]; then
  RAW=$(grep -v '^#' .env | grep '^DATABASE_URL=' | cut -d '=' -f2-)
  DATABASE_URL="${RAW//\"/}"
  DATABASE_URL="${DATABASE_URL//\'/}"
  export DATABASE_URL
fi

if [ -z "$DATABASE_URL" ]; then
  echo "Error: DATABASE_URL no definida"
  exit 1
fi

# Parsear URL manualmente para evitar que pg_dump rechace parámetros desconocidos
STRIPPED="${DATABASE_URL#*://}"
USERINFO="${STRIPPED%%@*}"
DB_USER="${USERINFO%%:*}"
DB_PASSWORD="${USERINFO#*:}"
HOSTPART="${STRIPPED#*@}"
DB_HOST="${HOSTPART%%:*}"
PORTDB="${HOSTPART#*:}"
DB_PORT="${PORTDB%%/*}"
DBPATH="${PORTDB#*/}"
DB_NAME="${DBPATH%%\?*}"

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="backups"
BACKUP_FILE="${BACKUP_DIR}/walo_${TIMESTAMP}.sql"

mkdir -p "$BACKUP_DIR"

echo "▶ Creando backup: $BACKUP_FILE"
docker run --rm \
  -e PGPASSWORD="$DB_PASSWORD" \
  -e PGSSLMODE=require \
  postgres:18-alpine \
  pg_dump \
    -h "$DB_HOST" \
    -p "$DB_PORT" \
    -U "$DB_USER" \
    -d "$DB_NAME" \
    --no-password \
  > "$BACKUP_FILE"
echo "✅ Backup guardado en $BACKUP_FILE"
