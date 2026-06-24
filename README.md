# WALO — Plataforma SaaS para microemprendedores

Plataforma SaaS multitenant para la digitalización de microemprendedores chilenos. Permite crear una vitrina digital con catálogo de productos, integración de pedidos por WhatsApp y pagos en línea con Khipu, todo optimizado para SEO desde el servidor.

Proyecto de Título — Duoc UC, Viña del Mar.

---

## Contexto del proyecto

| | |
|---|---|
| **Rubro** | Retail digital — comercio electrónico |
| **Segmento** | Microemprendedores y pequeños negocios |
| **Modelo** | SaaS multitenant B2B2C |
| **Mercado objetivo** | Chile |

---

## Descripción

WALO permite a cualquier emprendedor tener su tienda online en minutos, sin conocimientos técnicos. Cada tienda obtiene una URL pública (`walo.app/mi-tienda`), catálogo de productos con imágenes, carrito de compras, integración con WhatsApp y opción de pago con Khipu. Los dueños de tienda gestionan todo desde un panel de administración con métricas de ventas y clics a WhatsApp.

### Funcionalidades principales

- Registro y autenticación de emprendedores
- Vitrina pública por tienda con catálogo y carrito
- Pedidos por WhatsApp con mensaje estructurado
- Pago en línea con Khipu (con webhook de confirmación)
- Panel de administración: productos, categorías, métricas, plan
- Sistema de planes y suscripciones (Inicial, Pro, Business)
- Panel de analíticas con filtro de período
- Moderación de tiendas por administrador
- Página pública de precios

---

## Tecnologías

| Capa | Tecnología |
|------|-----------|
| Framework | Next.js 16 (App Router, React Server Components) |
| Lenguaje | TypeScript |
| Base de datos | PostgreSQL (DigitalOcean Managed DB en producción) |
| ORM | Prisma v7 con driver adapter `@prisma/adapter-pg` |
| Autenticación | Auth.js (NextAuth) |
| Estilos | Tailwind CSS |
| Validación | Zod |
| Storage de imágenes | Cloudflare R2 (S3-compatible) |
| Pagos | Khipu |
| Testing | Vitest + MSW |
| Infraestructura | Docker + DigitalOcean Droplet |
| CI/CD | GitHub Actions |

---

## Estructura del proyecto

```
src/
├── app/                        # Rutas Next.js (App Router)
│   ├── [slug]/                 # Vitrina pública de cada tienda
│   ├── dashboard/              # Panel del emprendedor (autenticado)
│   │   ├── analytics/          # Métricas y estadísticas
│   │   ├── billing/            # Plan y suscripción
│   │   ├── categories/         # Gestión de categorías
│   │   └── products/           # Gestión de productos
│   ├── admin/                  # Panel de moderación
│   ├── pago/[id]/              # Estado de pago post-Khipu
│   ├── pricing/                # Página pública de precios
│   ├── login/ register/        # Autenticación
│   └── api/                    # API Routes (webhooks, store, auth)
├── features/                   # Módulos por dominio
│   ├── auth/                   # Registro, login, sesión
│   ├── billing/                # Planes, suscripciones, límites
│   ├── dashboard/              # Métricas, filtro de período
│   ├── store/                  # Catálogo, carrito, pagos, tracking
│   └── admin/                  # Moderación de tiendas
├── lib/                        # Clientes globales (prisma, logger, khipu)
└── server/                     # Utilidades de servidor (auth, store)
prisma/
├── schema.prisma               # Modelo de datos
├── migrations/                 # Migraciones de BD
└── seed.ts                     # Datos iniciales (planes)
```

---

## Desarrollo local

### Requisitos

- Node.js 20+
- Docker y Docker Compose
- Cuenta Cloudflare R2 (para imágenes)

### Setup

```bash
# 1. Instalar dependencias
npm install

# 2. Copiar variables de entorno
cp .env.example .env
# Completar DATABASE_URL, NEXTAUTH_SECRET, R2_*, KHIPU_*

# 3. Levantar base de datos
docker compose up -d

# 4. Aplicar migraciones y seed
npx prisma migrate dev
npx tsx prisma/seed.ts

# 5. Iniciar servidor de desarrollo
npm run dev
```

### Comandos útiles

```bash
npm run dev          # Servidor de desarrollo
npm run build        # Build de producción
npm run test         # Tests con Vitest
npx prisma studio    # Explorador visual de BD
npx prisma migrate dev --name <nombre>   # Nueva migración
```

---

## Infraestructura

La aplicación corre en un **DigitalOcean Droplet** con Docker. La base de datos es un **DigitalOcean Managed PostgreSQL**. Las imágenes se almacenan en **Cloudflare R2**.

```bash
# Deploy en el droplet
git pull origin dev
docker compose -f docker-compose.prod.yml up -d --build
```

El entrypoint del contenedor ejecuta `prisma migrate deploy` automáticamente al iniciar.

---

## Equipo

Portafolio de Título — Analista Programador, Duoc UC

| Nombre | Rol |
|--------|-----|
| Constanza Contador Moraga | Development Team · Scrum Master |
| César Mongez Durán | Development Team  Tech Lead|
| Paulina Zúñiga Alarcón | Development Team · Full Stack |
