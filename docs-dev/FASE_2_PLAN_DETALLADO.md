# Fase 2 - Plan Detallado de Bootstrap Técnico

## Objetivo de la fase
La Fase 2 tiene como objetivo levantar la base técnica del proyecto real `walo-saas` con el stack correcto y una estructura limpia, sin mezclar todavía base de datos, autenticación ni lógica de negocio.

Esta fase termina cuando:

- la app Next.js corre localmente
- la estructura base del proyecto está definida
- Tailwind funciona
- ESLint y Prettier están configurados
- el proyecto compila sin errores
- `lint` y `build` pasan correctamente

## Alcance de la fase
En esta fase sí:

- se crea la app real
- se define la estructura de carpetas
- se instalan dependencias base de frontend y calidad
- se dejan listos los scripts principales
- se valida el arranque local

En esta fase no:

- no se configura PostgreSQL
- no se instala Prisma todavía
- no se configura Auth.js
- no se crean historias funcionales del negocio
- no se integra Khipu
- no se integra Cloudflare R2

---

## Resultado esperado
Al finalizar esta fase, el proyecto debería verse conceptualmente así:

```text
walo-saas/
  src/
    app/
    components/
    features/
    lib/
    server/
    types/
  public/
  .github/
  package.json
  tsconfig.json
  next.config.ts
  postcss.config.mjs
  eslint.config.mjs
  prettier.config.mjs
  tailwind.config.ts
```

---

## Decisión de stack para la base
La base del proyecto debe quedar alineada con lo definido para WALO:

- Next.js 16
- React 19.2
- TypeScript
- App Router
- Tailwind CSS
- ESLint
- Prettier
- alias `@/*`

## Convenciones obligatorias

- sin punto y coma
- nombres técnicos en inglés
- textos visibles de UI en español
- imports con alias `@/*`

---

## Paso 1 - Crear carpeta del proyecto real

Si aún no existe la carpeta `walo-saas`, créala y entra a ella.

### Comandos
```powershell
mkdir walo-saas
cd walo-saas
```

Si la carpeta ya existe y está vacía:

```powershell
cd walo-saas
```

---

## Paso 2 - Inicializar la app con Create Next App

La forma más simple y ordenada es crear la app con el scaffolding oficial y dejar listas desde el inicio las opciones que de verdad usarán.

### Comando recomendado
```powershell
npx create-next-app@latest . --ts --tailwind --eslint --app --src-dir --use-npm --import-alias "@/*"
```

### Qué hace este comando

- crea una app Next.js en la carpeta actual
- habilita TypeScript
- habilita Tailwind
- habilita ESLint
- usa App Router
- crea estructura bajo `src/`
- deja configurado el alias `@/*`
- usa `npm`

### Qué deberías verificar después

- existe `package.json`
- existe `src/app`
- existe `tsconfig.json`
- existe configuración base de lint
- existe configuración base de Tailwind

---

## Paso 3 - Revisar la versión real instalada

Como el proyecto exige una base concreta, después de crear la app conviene revisar las versiones que dejó instaladas el generador.

### Comandos
```powershell
npm list next
npm list react
npm list react-dom
```

### Qué validar

- que `next` quedó en la línea esperada
- que `react` y `react-dom` estén en la versión objetivo o compatible

Si la versión generada no coincide con la que quieren fijar, después pueden alinear manualmente el `package.json`.

---

## Paso 4 - Instalar dependencias de formato y calidad

Aunque Next.js ya deja ESLint base, conviene cerrar el estándar de formato desde el inicio.

### Dependencias recomendadas

- `prettier`
- `eslint-config-prettier`
- `prettier-plugin-tailwindcss`

### Comando
```powershell
npm install -D prettier eslint-config-prettier prettier-plugin-tailwindcss
```

### Opcionales útiles más adelante
No son obligatorias en esta fase, pero podrían agregarse después:

- `lint-staged`
- `husky`

No recomiendo meterlas todavía si todavía están cerrando el bootstrap.

---

## Paso 5 - Crear archivos de configuración de formato

En esta fase no vas a ejecutarlo ahora, pero estos archivos deberían existir cuando implementes:

- `prettier.config.mjs`
- `.prettierignore`
- `.editorconfig`

### Contenido sugerido de `prettier.config.mjs`
```js
/** @type {import('prettier').Config} */
const config = {
  semi: false,
  singleQuote: true,
  trailingComma: 'es5',
  plugins: ['prettier-plugin-tailwindcss'],
}

export default config
```

### Contenido sugerido de `.prettierignore`
```text
node_modules
.next
dist
coverage
package-lock.json
```

### Contenido sugerido de `.editorconfig`
```ini
root = true

[*]
charset = utf-8
end_of_line = lf
indent_style = space
indent_size = 2
insert_final_newline = true
trim_trailing_whitespace = true
```

---

## Paso 6 - Ajustar ESLint para convivir con Prettier

Dependiendo de la versión de Next instalada, el proyecto puede usar `eslint.config.mjs` o una variante equivalente.

El objetivo aquí no es sobrecargar reglas, sino asegurar compatibilidad y evitar conflictos con Prettier.

### Qué debería quedar resuelto

- ESLint activo
- reglas de Next activas
- Prettier sin conflicto con ESLint
- proyecto preparado para código sin semicolons

### Validación posterior
```powershell
npm run lint
```

---

## Paso 7 - Revisar y limpiar la app generada

El proyecto inicial de Next trae contenido demo. Esa demo no debería quedarse, porque confunde el arranque real.

### Qué limpiar

- contenido demo de `src/app/page.tsx`
- estilos demo innecesarios
- assets demo que no aporten

### Qué dejar

- layout base funcional
- una landing mínima
- `globals.css` limpia

### Criterio
La app base debe quedar simple, no decorativa.

Ejemplo de intención:

- título inicial del proyecto
- texto breve de estado
- estructura mínima que confirme que el proyecto corre

---

## Paso 8 - Definir la estructura de carpetas

Aunque al inicio algunas carpetas queden vacías, conviene dejarlas explícitas para evitar que cada persona invente una organización distinta.

### Carpetas sugeridas
```powershell
mkdir src\\components
mkdir src\\features
mkdir src\\lib
mkdir src\\server
mkdir src\\types
```

### Propósito de cada carpeta

#### `src/components`
Componentes reutilizables de UI.

#### `src/features`
Código agrupado por dominio funcional.

Ejemplos futuros:

- `auth`
- `store`
- `product`
- `catalog`

#### `src/lib`
Helpers y utilidades compartidas.

#### `src/server`
Lógica orientada a servidor y servicios.

#### `src/types`
Tipos compartidos cuando tenga sentido centralizarlos.

---

## Paso 9 - Revisar `package.json`

El proyecto debería quedar con scripts mínimos claros.

### Scripts base esperados

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  }
}
```

### Posibles scripts que pueden agregarse después

```json
{
  "scripts": {
    "format": "prettier . --write",
    "format:check": "prettier . --check"
  }
}
```

No es obligatorio dejarlos desde el primer minuto, pero sí es recomendable antes de empezar a trabajar en equipo.

---

## Paso 10 - Configurar Node y versión local recomendada

Para evitar diferencias entre equipos, conviene fijar la versión de Node.

### Archivo recomendado
`.nvmrc`

### Contenido sugerido
```text
22
```

Si prefieren fijar una versión menor concreta, usen una que sea compatible con Next 16 y consistente en todo el equipo.

---

## Paso 11 - Instalar dependencias del proyecto

Después de ajustar configuraciones, conviene reinstalar o verificar dependencias.

### Comando
```powershell
npm install
```

### Qué validar

- que no existan errores de peer dependencies
- que `node_modules` quede consistente
- que el lockfile quede generado correctamente

---

## Paso 12 - Ejecutar la app en local

### Comando
```powershell
npm run dev
```

### Qué deberías verificar manualmente

- que el servidor levanta sin errores
- que el navegador muestra la app
- que no hay errores de compilación inicial
- que la estructura base carga correctamente

---

## Paso 13 - Validar lint

### Comando
```powershell
npm run lint
```

### Resultado esperado

- ningún error
- si hay advertencias, resolverlas antes de seguir

La idea es que cualquier archivo que creen después ya herede la disciplina correcta.

---

## Paso 14 - Validar build de producción

### Comando
```powershell
npm run build
```

### Resultado esperado

- build exitosa
- sin errores de TypeScript
- sin fallas estructurales del proyecto

Esto es importante porque una app que corre en `dev` pero no compila en `build` todavía no está lista para colaboración real.

---

## Paso 15 - Crear rama técnica para esta fase

Una vez que el bootstrap esté listo, el trabajo debería subir en una rama técnica clara.

### Comando sugerido
```powershell
git checkout -b chore/bootstrap-nextjs
```

### Después
```powershell
git add .
git commit -m "chore: bootstrap nextjs foundation"
```

Todavía no es necesario empujar si primero quieren revisar internamente, pero ese sería el cierre natural de la fase.

---

## Secuencia recomendada completa

Si quieres verla linealmente, el orden sería este:

```powershell
mkdir walo-saas
cd walo-saas
npx create-next-app@latest . --ts --tailwind --eslint --app --src-dir --use-npm --import-alias "@/*"
npm list next
npm list react
npm list react-dom
npm install -D prettier eslint-config-prettier prettier-plugin-tailwindcss
mkdir src\\components
mkdir src\\features
mkdir src\\lib
mkdir src\\server
mkdir src\\types
npm install
npm run dev
npm run lint
npm run build
git checkout -b chore/bootstrap-nextjs
git add .
git commit -m "chore: bootstrap nextjs foundation"
```

---

## Checklist de cierre de Fase 2

- [ ] la app `walo-saas` existe y corre
- [ ] el proyecto usa App Router
- [ ] Tailwind está activo
- [ ] TypeScript está activo
- [ ] Prettier está configurado
- [ ] el estándar sin semicolons está definido
- [ ] existe estructura base de carpetas
- [ ] `npm run lint` pasa
- [ ] `npm run build` pasa
- [ ] existe una rama de bootstrap técnico

---

## Qué sigue después de esta fase

La fase siguiente ya es de datos y persistencia:

1. Docker Compose con PostgreSQL
2. `.env.example`
3. Prisma
4. primera migración
5. modelo `User`, `Store`, `StoreMember`, `Product`

No conviene empezar Auth.js antes de cerrar correctamente esa base.
