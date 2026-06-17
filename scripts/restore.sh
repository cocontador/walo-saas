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

# Carga DATABASE_URL desde .env si no está en el entorno
if [ -z "$DATABASE_URL" ] && [ -f .env ]; then
  DATABASE_URL=$(grep -v '^#' .env | grep '^DATABASE_URL=' | cut -d '=' -f2-)
  export DATABASE_URL
fi

if [ -z "$DATABASE_URL" ]; then
  echo "Error: DATABASE_URL no definida"
  exit 1
fi

echo "▶ Restaurando desde $BACKUP_FILE..."
psql "$DATABASE_URL" < "$BACKUP_FILE"
echo "✅ Restauración completada"
