# Auditoría Final - `feature/auth-consolidacion`

## Resumen Ejecutivo
- Estado general para merge: **funcional con deuda técnica relevante**.
- Riesgo crítico previo (pérdida de CI): **mitigado**. El archivo [ci.yml](C:/Users/cmongez/Documents/trabajo/proyectos_personales/WALO/walo-saas/.github/workflows/ci.yml) está presente.
- Flujo Registro/Login: **operativo** en términos básicos.
- Cumplimiento de estándar Sprint 1: **parcial**. Falta capa de validación formal y completar criterios de redirección/QA.

Clasificación por historia:
- `WALO-001` Registro: **[FUNCIONAL PERO CON DEUDA]**
- `WALO-002` Validación de email: **[FUNCIONAL PERO CON DEUDA]**
- `WALO-004` Login: **[FUNCIONAL PERO CON DEUDA]**

---

## Verificación de Trabajo Perdido (Zod Check)

Revisión sobre ramas consolidadas de Constanza:
- `origin/feature/login`
- `origin/feature/registro`
- `origin/feature/PipelineCI`

Hallazgo:
- No se encontraron implementaciones Zod (`zod`, `safeParse`, `parse`) en esas ramas para auth.
- En la rama actual tampoco hay schemas en `src/features/auth/schemas`.

Conclusión:
- **No se borró trabajo valioso de Zod** porque ese trabajo no estaba implementado previamente en las ramas consolidadas.
- La deuda de Zod sigue pendiente y debe planificarse como siguiente incremento, no como recuperación de pérdida.

---

## Matriz de Tareas Jira (WALO-001, WALO-002, WALO-004)

Referencia usada:
- [SPRINT1_TAREAS_DETALLADAS.md](C:/Users/cmongez/Documents/trabajo/proyectos_personales/WALO/SPRINT1_TAREAS_DETALLADAS.md)
- [JIRA_SPRINT1_SUBTASKS_CSV_DETALLADO.csv](C:/Users/cmongez/Documents/trabajo/proyectos_personales/WALO/JIRA_SPRINT1_SUBTASKS_CSV_DETALLADO.csv)

## WALO-001 Registro (`Parent WALO-9`)
- [x] Formulario de registro (`/register`) implementado.
- [ ] Schema de registro en `src/features/auth/schemas`.
- [x] Hash de contraseña antes de persistir.
- [x] Acción de registro en servidor (vía `route.ts`).
- [ ] Redirección a onboarding tras registro (actualmente va a `/login`).
- [ ] Pruebas de registro (schema/caso feliz/duplicado).

Estado: **[FUNCIONAL PERO CON DEUDA]**

## WALO-002 Validación de email (`Parent WALO-10`)
- [x] Validación cliente mínima (`type=email`, `required`).
- [ ] Validación cliente robusta con reglas centralizadas.
- [x] Revalidación servidor básica (campos requeridos + normalización email).
- [ ] Validación de formato de email robusta en backend.
- [x] Manejo de error visible en UI.
- [x] Bloqueo de submit para casos inválidos básicos.
- [ ] Pruebas de validación de email.

Estado: **[FUNCIONAL PERO CON DEUDA]**

## WALO-004 Login (`Parent WALO-12`)
- [x] Página de login implementada.
- [x] `CredentialsProvider` configurado.
- [x] Búsqueda de usuario por email en Prisma.
- [x] Comparación con `bcrypt` contra `passwordHash`.
- [ ] Redirección por estado (dashboard/onboarding); hoy redirige a `/dashboard`.
- [ ] Pruebas de login (válido/inválido/sesión).

Estado: **[FUNCIONAL PERO CON DEUDA]**

---

## Validación de Infraestructura y Estándares

## Pipeline CI restaurado
- `ci.yml` presente en rama actual: **sí**.
- Comparación contra `origin/feature/PipelineCI`: **equivalente funcionalmente**.
- Diferencia menor: se omitió un comentario de documentación; no afecta ejecución.

## Duplicados / código muerto en `src/app`
- Estado actual:
  - [src/app/login/page.tsx](C:/Users/cmongez/Documents/trabajo/proyectos_personales/WALO/walo-saas/src/app/login/page.tsx) actúa como contenedor limpio.
  - [src/app/register/page.tsx](C:/Users/cmongez/Documents/trabajo/proyectos_personales/WALO/walo-saas/src/app/register/page.tsx) actúa como contenedor limpio.
  - UI real movida a:
    - [LoginForm.tsx](C:/Users/cmongez/Documents/trabajo/proyectos_personales/WALO/walo-saas/src/features/auth/components/LoginForm.tsx)
    - [RegisterForm.tsx](C:/Users/cmongez/Documents/trabajo/proyectos_personales/WALO/walo-saas/src/features/auth/components/RegisterForm.tsx)
- No se observa ya el registro duplicado dentro de `/login`.

## Consistencia `passwordHash`
- Modelo Prisma: `User.passwordHash` existe.
- Login: compara contra `user.passwordHash`.
- Registro: persiste `passwordHash`.
- Seed: crea usuario con `passwordHash`.

Conclusión: uso de hash **consistente** con el modelo vigente.

---

## Hallazgos sobre el trabajo de Constanza

Lo que se preservó:
- Lógica central de login con `CredentialsProvider`.
- Lógica de registro en ruta API (`/api/auth/register`) con:
  - unicidad de email
  - hash de contraseña
  - creación de `User`, `Store` y `StoreMember`
- Pipeline CI original de su rama de infraestructura volvió a estar disponible.

Lo que falta integrar/completar de su parte (y del equipo):
- Validaciones formalizadas con Zod (cliente y servidor).
- Redirección post-registro al flujo de onboarding (según criterios Sprint 1).
- Redirección de login según estado de tienda.
- Cobertura de pruebas para historias WALO-001/002/004.
- Limpieza de textos con encoding corrupto en componentes UI (se observan cadenas mojibake en formularios).

---

## Próximos Pasos Sugeridos
1. Implementar `src/features/auth/schemas/register.ts` y `login.ts` con Zod, y usar los schemas en UI + server.
2. Extraer la lógica de `src/app/api/auth/register/route.ts` a `src/features/auth/actions/registerUser.ts` para alinear arquitectura por feature.
3. Ajustar redirecciones:
   - registro exitoso -> onboarding
   - login exitoso -> onboarding/dashboard según existencia de tienda.
4. Agregar pruebas mínimas:
   - unitarias de schema
   - integración básica de route/register
   - componente login con estado error/carga.
5. Ejecutar pipeline completo y cerrar deuda de encoding en textos UI.

