#!/bin/bash
set -e

echo "▶ Actualizando código desde main..."
git pull origin main

echo "▶ Construyendo imagen Docker..."
docker compose -f docker-compose.prod.yml build

echo "▶ Reiniciando contenedor..."
docker compose -f docker-compose.prod.yml up -d

echo "✅ Deploy completado"
