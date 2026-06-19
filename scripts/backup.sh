#!/bin/bash
set -e

# Carga DATABASE_URL desde .env si no está en el entorno
if [ -z "$DATABASE_URL" ] && [ -f .env ]; then
  DATABASE_URL=$(grep -v '^#' .env | grep '^DATABASE_URL=' | cut -d '=' -f2-)
  export DATABASE_URL
fi

if [ -z "$DATABASE_URL" ]; then
  echo "Error: DATABASE_URL no definida"
  exit 1
fi

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="backups"
BACKUP_FILE="${BACKUP_DIR}/walo_${TIMESTAMP}.sql"

mkdir -p "$BACKUP_DIR"

echo "▶ Creando backup: $BACKUP_FILE"
docker run --rm postgres:16-alpine pg_dump "$DATABASE_URL" > "$BACKUP_FILE"
echo "✅ Backup guardado en $BACKUP_FILE"
