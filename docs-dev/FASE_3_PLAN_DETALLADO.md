# Fase 3 - Plan Detallado de Datos y Base Local

## Objetivo de la fase
La Fase 3 tiene como objetivo dejar lista la base de datos local, la persistencia real y el modelo mínimo multitenant para que el Sprint 1 pueda pasar de bootstrap técnico a funcionalidades reales.

Al terminar esta fase, el proyecto debería tener:

- PostgreSQL local levantado con Docker
- archivo `.env` funcional
- `.env.example` actualizado
- Prisma instalado y configurado
- `schema.prisma` con el modelo mínimo
- primera migración aplicada
- cliente Prisma reutilizable
- conexión validada desde la app

## Alcance de la fase
En esta fase sí:

- se instala Prisma
- se configura PostgreSQL local con Docker
- se definen variables de entorno
- se crea el modelo inicial
- se genera la primera migración
- se valida la persistencia real

En esta fase no:

- no se configura Auth.js todavía
- no se implementa login completo
- no se desarrolla CRUD funcional final
- no se integra Khipu
- no se integra R2

---

## Dependencias funcionales antes de empezar
Antes de ejecutar esta fase, debería estar razonablemente resuelto esto:

- la app Next.js ya existe
- el proyecto compila al menos en desarrollo
- ESLint está configurado
- estructura base del proyecto definida

## Estado esperado del proyecto al entrar a Fase 3
Se asume que `walo-saas` ya existe y que desde esta fase se le agrega persistencia real.

---

## Resultado esperado

Al finalizar, la estructura relevante debería verse así:

```text
walo-saas/
  prisma/
    schema.prisma
    migrations/
  src/
    lib/
      prisma.ts
  docker/
  docker-compose.yml
  .env
  .env.example
```

---

## Paso 1 - Instalar Prisma y cliente de base de datos

### Objetivo
Agregar la base técnica para trabajar con PostgreSQL desde la app.

### Comandos
```powershell
cd walo-saas
npm install prisma @prisma/client
```

### Resultado esperado

- Prisma CLI instalada
- cliente Prisma instalado
- dependencias registradas en `package.json`

---

## Paso 2 - Inicializar Prisma en el proyecto

### Comando
```powershell
npx prisma init
```

### Qué genera normalmente

- carpeta `prisma/`
- archivo `prisma/schema.prisma`
- referencia inicial de `DATABASE_URL`

### Qué revisar después

- que exista `prisma/schema.prisma`
- que la configuración apunte a PostgreSQL

---

## Paso 3 - Crear Docker Compose para PostgreSQL local

### Objetivo
Estandarizar el entorno local para César, Constanza y Paulina.

### Archivo a crear
`docker-compose.yml`

### Ejemplo recomendado
```yaml
version: '3.9'

services:
  postgres:
    image: postgres:16
    container_name: walo-postgres
    restart: unless-stopped
    environment:
      POSTGRES_USER: walo
      POSTGRES_PASSWORD: walo123
      POSTGRES_DB: walo_dev
    ports:
      - '5432:5432'
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

### Criterio
No es una configuración productiva. Es una configuración simple y estable para desarrollo local.

---

## Paso 4 - Levantar PostgreSQL local

### Comando
```powershell
docker compose up -d
```

### Validación
```powershell
docker compose ps
```

### Resultado esperado

- contenedor `postgres` levantado
- puerto `5432` disponible
- base `walo_dev` creada

---

## Paso 5 - Configurar variables de entorno

### Archivo local
`.env`

### Archivo compartido
`.env.example`

### Valor recomendado para desarrollo local
```env
DATABASE_URL="postgresql://walo:walo123@localhost:5432/walo_dev?schema=public"
```

### Qué debe tener `.env.example`
```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DB_NAME?schema=public"
```

### Criterio

- `.env` se usa localmente
- `.env.example` documenta la estructura
- nunca se suben secretos reales del futuro entorno productivo

---

## Paso 6 - Definir el provider de Prisma

Abre `prisma/schema.prisma` y asegúrate de que use PostgreSQL.

### Base esperada
```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

---

## Paso 7 - Diseñar el modelo mínimo del Sprint 1

## Decisión recomendada
No modelar todavía todo el sistema. Modelar solo lo mínimo correcto.

### Tablas mínimas

- `User`
- `Store`
- `StoreMember`
- `Product`

### Motivo
Eso permite cubrir:

- emprendedor autenticado
- tienda propia
- relación segura entre usuario y tienda
- productos aislados por tenant

### Schema sugerido
```prisma
model User {
  id           String        @id @default(cuid())
  email        String        @unique
  name         String?
  passwordHash String
  createdAt    DateTime      @default(now())
  updatedAt    DateTime      @updatedAt

  memberships  StoreMember[]
}

model Store {
  id            String        @id @default(cuid())
  slug          String        @unique
  name          String
  description   String?
  whatsappPhone String?
  isActive      Boolean       @default(true)
  createdAt     DateTime      @default(now())
  updatedAt     DateTime      @updatedAt

  memberships   StoreMember[]
  products      Product[]

  @@index([slug])
}

model StoreMember {
  id        String     @id @default(cuid())
  userId    String
  storeId   String
  role      StoreRole  @default(OWNER)
  createdAt DateTime   @default(now())

  user      User       @relation(fields: [userId], references: [id], onDelete: Cascade)
  store     Store      @relation(fields: [storeId], references: [id], onDelete: Cascade)

  @@unique([userId, storeId])
  @@index([userId])
  @@index([storeId])
}

model Product {
  id          String    @id @default(cuid())
  storeId     String
  name        String
  description String?
  price       Int
  visible     Boolean   @default(true)
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  store       Store     @relation(fields: [storeId], references: [id], onDelete: Cascade)

  @@index([storeId])
  @@index([storeId, visible])
}

enum StoreRole {
  OWNER
  EDITOR
}
```

### Decisiones importantes

- `price` como `Int`, no `Float`
- `slug` único por tienda
- `StoreMember` desde el inicio para no acoplar `Store` a un solo usuario
- `visible` para soportar ocultar producto sin borrarlo

---

## Paso 8 - Generar la primera migración

### Comando
```powershell
npx prisma migrate dev --name init
```

### Resultado esperado

- se crea carpeta `prisma/migrations`
- la base local se actualiza
- Prisma genera cliente

### Qué validar

- no hay errores de conexión
- no hay errores de schema
- la base queda alineada con el modelo

---

## Paso 9 - Regenerar cliente Prisma manualmente si hace falta

Aunque `migrate dev` normalmente ya lo hace, puedes ejecutar esto explícitamente:

### Comando
```powershell
npx prisma generate
```

---

## Paso 10 - Crear cliente Prisma reutilizable

### Archivo sugerido
`src/lib/prisma.ts`

### Implementación recomendada
```ts
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ['error', 'warn'],
  })

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}
```

### Motivo
Evita múltiples instancias durante desarrollo con hot reload.

---

## Paso 11 - Validar conexión con Prisma Studio

### Comando
```powershell
npx prisma studio
```

### Qué validar

- Studio abre correctamente
- se ven las tablas del modelo
- la conexión a PostgreSQL funciona

---

## Paso 12 - Probar un acceso real desde la app

Antes de pasar a Auth.js, conviene validar al menos un uso real del cliente Prisma.

### Opciones simples

- crear una ruta temporal de prueba
- crear una consulta de salud del sistema
- consultar un conteo básico desde servidor

### Ejemplo conceptual
No es necesario mantener esto para siempre. Es una validación breve para confirmar que:

- la app lee la DB
- Prisma funciona dentro de Next.js

---

## Paso 13 - Actualizar documentación

### Archivos a actualizar

- `README.md`
- `.env.example`

### Qué debería agregarse

- cómo levantar Docker
- cómo bajar Docker
- cómo correr migraciones
- cómo abrir Prisma Studio

### Comandos que deberían quedar documentados
```powershell
docker compose up -d
docker compose down
npx prisma migrate dev --name init
npx prisma generate
npx prisma studio
```

---

## Paso 14 - Validaciones finales de la fase

### Comandos
```powershell
npm run lint
npm run build
```

### Importante
Si el build aún falla por un tema arrastrado de Fase 2, hay que resolverlo antes de dar la Fase 3 por terminada.

En el estado actual del proyecto, lo primero a corregir antes de cerrar Fase 3 sería cualquier dependencia externa que rompa el build, por ejemplo fuentes remotas.

---

## Secuencia lineal recomendada

```powershell
cd walo-saas
npm install prisma @prisma/client
npx prisma init
docker compose up -d
npx prisma migrate dev --name init
npx prisma generate
npx prisma studio
npm run lint
npm run build
```

---

## Checklist de cierre de Fase 3

- [ ] Prisma instalada
- [ ] `schema.prisma` creado y válido
- [ ] PostgreSQL local levantado con Docker
- [ ] `.env` configurado
- [ ] `.env.example` actualizado
- [ ] modelo mínimo definido
- [ ] migración inicial creada
- [ ] cliente Prisma reutilizable creado
- [ ] Prisma Studio abre correctamente
- [ ] app puede conectarse a la base
- [ ] lint pasa
- [ ] build pasa

---

## Qué sigue después

La siguiente fase ya sería:

1. Auth.js v5
2. registro e inicio de sesión
3. `requireAuth`
4. `tenantGuard`
5. onboarding de tienda

No conviene avanzar ahí si la base de datos y Prisma todavía no están firmes.
