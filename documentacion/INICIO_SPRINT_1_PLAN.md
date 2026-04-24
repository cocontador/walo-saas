# Inicio Sprint 1 - Plan de Implementación

## Objetivo
Este documento define cómo iniciar el Sprint 1 de WALO considerando que el proyecto real parte vacío y que el objetivo no es solo "levantar una app", sino dejar una base técnica seria para que el equipo pueda implementar historias funcionales sin desorden ni retrabajo.

La lógica de arranque correcta es:

1. estabilizar la base técnica
2. asegurar entorno, convenciones y calidad
3. dejar datos y seguridad inicial resueltos
4. recién después delegar historias funcionales del Sprint 1

## Resultado esperado del arranque
Al terminar esta etapa inicial, el equipo debería tener:

- un repositorio real y ordenado
- una app Next.js funcionando
- PostgreSQL local levantado con Docker
- Prisma configurado con migración inicial
- autenticación base operativa
- modelo multitenant mínimo definido
- CI básica funcionando en Pull Request
- rama `main` protegida

Eso significa que el Sprint 1 empieza de verdad cuando el proyecto ya puede sostener desarrollo colaborativo.

---

## Fase 1 - Base de repositorio y forma de trabajo

### Objetivo de la fase
Definir las reglas del proyecto antes de que empiece la implementación funcional.

Esta fase parece administrativa, pero en la práctica es crítica. Si se omite, el equipo empieza a producir código sin una estructura común, aparecen diferencias de estilo, ramas mal nombradas, PR desordenados, conflictos evitables y cambios directos a `main`.

### Qué debe quedar resuelto

- repositorio base del proyecto real creado
- convención de ramas definida
- política de Pull Request acordada
- protección de `main` configurada
- plantilla de PR creada
- README técnico inicial creado
- acuerdo explícito sobre estilo y convenciones

### Decisiones que deben quedar cerradas

#### 1. Nombre y alcance del repositorio
El proyecto real debería vivir en un repositorio limpio, idealmente `walo-saas`, separado mentalmente del prototipo.

Si se decide reutilizar la carpeta existente, igual hay que tratar esta etapa como si fuera un bootstrap nuevo. Lo importante no es el nombre, sino que el equipo tenga claro qué código es prototipo y qué código pertenece al MVP real.

#### 2. Estrategia de ramas
No recomiendo un Git Flow pesado para ustedes. Lo correcto es una versión simple:

- `main` como rama estable
- ramas cortas por trabajo puntual
- merge solo vía Pull Request

Convención sugerida:

- `feature/registro-emprendedor`
- `feature/onboarding-tienda`
- `feature/crud-productos`
- `fix/login-error`
- `chore/bootstrap-sprint-1`

Esto es suficientemente profesional para aprendizaje real y suficientemente simple para un equipo pequeño.

#### 3. Reglas de colaboración
Estas reglas deberían ser obligatorias desde el primer día:

- nadie hace push directo a `main`
- todo cambio entra por Pull Request
- toda PR debe explicar qué cambia y cómo probarlo
- toda PR debe pasar `lint` y `build`
- las piezas sensibles solo las modifica César al inicio:
  - `prisma/schema.prisma`
  - auth
  - tenant guard
  - workflow CI
  - Dockerfile

#### 4. Estándares de código
Queda fijo desde el inicio:

- cero punto y coma
- variables, funciones y nombres técnicos en inglés
- UI y textos visibles al usuario en español
- nombres de branches y commits claros

Ejemplos correctos:

```ts
const currentStore = await getCurrentStore()
const isVisible = product.visible
```

Ejemplos incorrectos:

```ts
const tiendaActual = await obtenerTiendaActual()
const esVisible = producto.visible;
```

### Archivos que se deberían crear o dejar listos

- `README.md`
- `.gitignore`
- `.editorconfig`
- `.nvmrc`
- `.env.example`
- `.github/pull_request_template.md`

### Qué debe incluir el README inicial
No tiene que ser largo. Debe ser útil.

Contenido mínimo:

- qué es WALO
- stack técnico
- requisitos locales
- cómo instalar dependencias
- cómo levantar la DB local
- cómo correr la app
- cómo ejecutar lint y build
- cómo crear una rama
- cómo abrir una PR

### Qué debe incluir la plantilla de PR

- objetivo del cambio
- historias o tareas relacionadas
- pasos para probar
- capturas si aplica UI
- checklist:
  - lint OK
  - build OK
  - sin cambios fuera de alcance

### Qué debería hacer César en esta fase

- crear el repo o estandarizar el actual
- cerrar la convención de ramas
- configurar protección de `main`
- crear PR template
- redactar README técnico inicial
- dejar explícito el ownership técnico inicial

### Qué pueden hacer Constanza y Paulina en esta fase

- revisar el README y detectar vacíos
- validar si entienden el flujo de ramas y PR
- confirmar que el estándar del equipo quedó claro

### Criterio de salida de la Fase 1
La fase termina cuando:

- `main` ya no acepta cambios directos
- existe una rama técnica inicial para bootstrap
- el equipo sabe cómo nombrar ramas y abrir PR
- existe README técnico mínimo
- todos entienden que no deben improvisar la arquitectura base

---

## Fase 2 - Bootstrap técnico del proyecto real

### Objetivo de la fase
Levantar la app real con el stack final y una estructura que soporte crecimiento ordenado.

Aquí todavía no se busca cerrar historias funcionales completas. Se busca dejar la plataforma lista para que esas historias puedan implementarse correctamente.

### Resultado esperado

- proyecto Next.js funcionando
- App Router operativo
- Tailwind configurado
- TypeScript activo
- estructura de carpetas definida
- scripts base funcionando

### Decisión clave
El error más común en esta fase sería copiar el prototipo entero y empezar a modificarlo encima.

La mejor decisión es:

- crear una base limpia
- estabilizar dependencias, estructura y configuración
- luego portar solo lo que sirva del prototipo

Eso reduce deuda técnica y permite explicar mejor la arquitectura en defensa o presentación.

### Stack objetivo de arranque

- Next.js 16
- React 19.2
- TypeScript
- Tailwind CSS
- ESLint
- Prettier
- alias `@/*`

### Estructura sugerida

```text
walo-saas/
  src/
    app/
    components/
    features/
    lib/
    server/
    types/
  prisma/
  .github/
  docker/
```

### Explicación de la estructura

#### `src/app`
Contiene App Router, layouts, páginas y segmentos de ruta.

Ejemplos futuros:

- `src/app/page.tsx`
- `src/app/login/page.tsx`
- `src/app/dashboard/page.tsx`
- `src/app/tienda/[slug]/page.tsx`

#### `src/components`
Componentes reutilizables de UI.

Ejemplos:

- botones
- inputs
- cards
- layout blocks

No debería contener lógica de dominio pesada.

#### `src/features`
Agrupación por dominio funcional.

Ejemplos:

- `features/auth`
- `features/store`
- `features/product`
- `features/catalog`

Esto les va a servir mucho cuando el proyecto crezca, porque evita que todo termine mezclado en `components` o `lib`.

#### `src/lib`
Utilidades transversales y helpers del sistema.

Ejemplos:

- cliente Prisma
- helpers de auth
- utilidades de slug
- validadores compartidos

#### `src/server`
Lógica del servidor y casos que no deben vivir mezclados con UI.

Más adelante puede contener:

- servicios
- acciones protegidas
- integraciones

#### `src/types`
Tipos globales o compartidos cuando de verdad tenga sentido centralizarlos.

### Qué debe hacerse en esta fase

#### 1. Crear el proyecto base
Inicializar la aplicación con el stack correcto y estructura `src/`.

El objetivo no es personalizarla aún, sino confirmar que parte bien.

#### 2. Revisar scripts del proyecto
`package.json` debe quedar con scripts mínimos claros:

- `dev`
- `build`
- `start`
- `lint`

Más adelante pueden agregar:

- `typecheck`
- `prisma:generate`
- `prisma:migrate`

#### 3. Configurar ESLint y Prettier
Esto debe quedar listo al principio para que cada archivo nuevo ya nazca con el estándar correcto.

Objetivos:

- `semi: false`
- compatibilidad con Next.js
- formato consistente
- integración con Tailwind si usan plugin

#### 4. Configurar `.editorconfig`
Esto evita diferencias de fin de línea, indentación o formato entre máquinas.

#### 5. Definir alias y resolución de imports
Usar `@/*` desde el inicio evita imports relativos largos y hace el código más mantenible.

Ejemplo deseado:

```ts
import { prisma } from '@/lib/prisma'
import { LoginForm } from '@/features/auth/components/login-form'
```

### Qué todavía NO se debería hacer en esta fase

- no construir aún el catálogo público completo
- no portar todas las pantallas del prototipo
- no integrar Khipu
- no integrar R2
- no crear dashboard analítico
- no meter lógica avanzada de negocio

Esta fase es de base técnica, no de cierre funcional.

### Qué debería hacer César en esta fase

- inicializar la app base
- dejar estructura de carpetas estable
- configurar ESLint y Prettier
- validar que `npm run lint` y `npm run build` funcionen
- decidir qué partes del prototipo podrían migrarse después

### Qué pueden hacer Constanza y Paulina en esta fase

Mientras César estabiliza la base, ellas pueden:

- clonar el repo
- instalar dependencias
- ejecutar el proyecto
- comprobar que entienden la estructura
- reportar fricciones del setup

Eso es útil porque permite detectar problemas de onboarding antes de entrar a historias reales.

### Criterio de salida de la Fase 2
La fase termina cuando:

- la app arranca sin errores
- el layout base funciona
- el proyecto compila
- lint pasa
- build pasa
- la estructura de carpetas ya está cerrada
- el equipo puede abrir el proyecto localmente sin improvisar configuración

---

## Fase 3 - Datos y base local con Docker

### Objetivo
Estandarizar el entorno de base de datos y dejar Prisma operativo.

### Qué debe quedar listo

- `docker-compose.yml` con PostgreSQL
- `.env.example`
- conexión local a la DB
- `prisma/schema.prisma`
- cliente Prisma
- migración inicial

### Modelo mínimo recomendado

- `User`
- `Store`
- `StoreMember`
- `Product`

### Resultado esperado
Cada integrante debe poder levantar la base localmente con Docker y correr migraciones sin ayuda.

---

## Fase 4 - Autenticación y seguridad base

### Objetivo
Dejar operativa la autenticación del emprendedor y la base de protección multitenant.

### Qué debe quedar listo

- Auth.js v5
- provider de credenciales
- sesión persistente
- helper `requireAuth`
- helper `tenantGuard`

### Resultado esperado
Las futuras historias privadas ya pueden construirse sobre una base segura.

---

## Fase 5 - Primer bloque funcional del Sprint 1

### Orden recomendado

1. registro de emprendedor
2. inicio de sesión
3. creación de tienda en onboarding
4. configuración de WhatsApp
5. crear producto
6. listar productos
7. editar producto
8. ocultar producto
9. catálogo público por slug

### Razonamiento
No tiene sentido empezar por el catálogo público si todavía no existen:

- autenticación
- tienda
- producto
- aislamiento por tenant

---

## Fase 6 - Automatización mínima

### Objetivo
Evitar que el proyecto se rompa al empezar a colaborar.

### Qué debe quedar listo

- workflow de GitHub Actions
- validación de `lint`
- validación de `build`
- protección efectiva de `main`

---

## Distribución recomendada del trabajo

### César

- bootstrap técnico completo
- Prisma y modelo inicial
- Auth.js
- tenant guard
- CI
- revisión de PR

### Constanza

- validación de setup local
- flujo de registro y login una vez cerrada la base
- formularios de tienda

### Paulina

- validación de setup local
- CRUD de producto una vez cerrada la base
- listado admin y primeros componentes del catálogo

---

## Plan de la primera semana

## Día 1

- crear y ordenar el repositorio
- definir reglas de ramas y PR
- proteger `main`
- crear README técnico inicial

## Día 2

- crear app Next.js base
- configurar estructura de carpetas
- configurar ESLint, Prettier y `.editorconfig`
- validar `lint` y `build`

## Día 3

- crear `docker-compose.yml`
- configurar PostgreSQL local
- crear `.env.example`
- instalar Prisma

## Día 4

- definir `schema.prisma`
- generar migración inicial
- crear cliente Prisma
- validar conexión real a la base

## Día 5

- integrar Auth.js
- crear `requireAuth`
- crear `tenantGuard`
- dejar lista la base para empezar historias funcionales

---

## Señal de que ya pueden implementar historias del Sprint 1

Solo cuando esto esté listo:

- la app levanta
- la DB levanta
- Prisma migra sin errores
- el login base existe
- `main` está protegida
- hay CI mínima funcionando

Si eso no está cerrado, empezar historias funcionales probablemente solo moverá problemas hacia adelante.
