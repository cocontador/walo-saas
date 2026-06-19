#!/bin/sh
set -e

echo "▶ Ejecutando migraciones de Prisma..."
npx prisma migrate deploy
echo "✅ Migraciones aplicadas"

echo "▶ Iniciando aplicación..."
exec npm run start
