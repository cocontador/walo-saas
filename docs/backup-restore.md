# Guía de Backup y Restauración — WALO

## Requisito previo

El droplet necesita `postgresql-client` instalado. Si no lo tenés:

```bash
sudo apt install postgresql-client -y
```

---

## Crear un backup

Desde el directorio raíz del proyecto en el droplet:

```bash
./scripts/backup.sh
```

Esto genera un archivo en `backups/walo_YYYYMMDD_HHMMSS.sql`.

> El script lee `DATABASE_URL` del `.env` automáticamente.

---

## Restaurar un backup

```bash
./scripts/restore.sh backups/walo_YYYYMMDD_HHMMSS.sql
```

Reemplazá el nombre del archivo por el que querés restaurar.

> La restauración sobreescribe los datos actuales. Hacé un backup antes si necesitás conservar el estado actual.

---

## Demo para la defensa (paso a paso)

1. **Mostrar el dato actual** en la app (ej: nombre de un producto)

2. **Crear el backup**
   ```bash
   ./scripts/backup.sh
   ```

3. **Modificar el dato** desde la app (ej: cambiar el nombre del producto)

4. **Restaurar el backup**
   ```bash
   ./scripts/restore.sh backups/walo_YYYYMMDD_HHMMSS.sql
   ```

5. **Verificar** que el dato original está de vuelta en la app

---

## Dónde se guardan los backups

La carpeta `backups/` está en el directorio del proyecto en el droplet.  
Está en `.gitignore`, por lo que nunca se sube al repositorio.

---

## Sobre las migraciones de Prisma

Las migraciones **no son backups** — son cambios de estructura (tablas, columnas).

Prisma registra cada migración aplicada en la tabla `_prisma_migrations` de la base de datos. Al iniciar el servidor, `entrypoint.sh` corre `prisma migrate deploy` que solo aplica las migraciones nuevas. Si todo está al día, no hace nada.

Para ver el estado de las migraciones:

```bash
npx prisma migrate status
```
