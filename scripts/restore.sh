#!/bin/bash
set -e

BACKUP_FILE=$1

if [ -z "$BACKUP_FILE" ]; then
  echo "Uso: ./scripts/restore.sh <archivo_backup.sql>"
  echo "Ejemplo: ./scripts/restore.sh backups/walo_20260616_143000.sql"
  exit 1
fi

if [ ! -f "$BACKUP_FILE" ]; then
  echo "Error: archivo '$BACKUP_FILE' no encontrado"
  exit 1
fi

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

echo "▶ Limpiando schema existente..."
docker run --rm \
  -e PGPASSWORD="$DB_PASSWORD" \
  -e PGSSLMODE=require \
  postgres:18-alpine \
  psql \
    -h "$DB_HOST" \
    -p "$DB_PORT" \
    -U "$DB_USER" \
    -d "$DB_NAME" \
    --no-password \
    -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public; GRANT ALL ON SCHEMA public TO $DB_USER; GRANT ALL ON SCHEMA public TO public;"

echo "▶ Restaurando desde $BACKUP_FILE..."
docker run --rm -i \
  -e PGPASSWORD="$DB_PASSWORD" \
  -e PGSSLMODE=require \
  postgres:18-alpine \
  psql \
    -h "$DB_HOST" \
    -p "$DB_PORT" \
    -U "$DB_USER" \
    -d "$DB_NAME" \
    --no-password \
  < "$BACKUP_FILE"
echo "✅ Restauración completada"
