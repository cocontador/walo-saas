# Testing Guide - WALO

## 1. Convención de estructura
- Los tests deben ir co-localizados por feature en `src/features/**/__tests__`.
- Convención de nombre:
  - Componentes/UI: `*.test.tsx`
  - Lógica sin JSX: `*.test.ts`
- Ejemplo:
  - `src/features/auth/components/LoginForm.tsx`
  - `src/features/auth/__tests__/LoginForm.test.tsx`

## 2. Cuándo usar unitarias/componentes vs integración
- Unitarias/Componentes (Vitest + React Testing Library):
  - Validar renderizado, interacción de formularios, estados visuales y reglas de UI.
  - Validar funciones de transformación/validación aisladas.
  - Deben ser rápidas y deterministas.
- Integración:
  - Validar flujos entre UI + capa de datos simulada (MSW) + manejo de errores.
  - Usar cuando exista interacción con endpoints, sesión o comportamiento de red.
  - No depender de servicios externos reales.

## 3. Reglas de uso de MSW
- Objetivo: evitar llamadas reales a APIs externas o endpoints inestables.
- Regla base:
  - Si un test dispara `fetch`/HTTP, debe usar handler MSW.
- Ubicación de mocks:
  - `src/test/mocks/handlers.ts` para handlers.
  - `src/test/mocks/server.ts` para `setupServer`.
- Buenas prácticas:
  - Simular al menos caso exitoso y caso de error por endpoint crítico.
  - No usar MSW para ocultar errores de validación local; primero validar UI/lógica.
  - Mantener respuestas de mock consistentes con contratos esperados por frontend.

## 4. Criterio mínimo por historia de usuario
- Cada historia de usuario debe incluir al menos **un test de su renderizado principal**.
- Si la historia incluye formulario o acción de red, se recomienda sumar:
  - 1 caso feliz
  - 1 caso de error relevante
