# Tests

Este directorio contiene todas las pruebas unitarias y de extremo a extremo (e2e) del proyecto.

## Estructura

```
__tests__/
├── unit/          # Pruebas unitarias
│   └── application/
│       └── errors/
│           └── app-error.test.ts
└── e2e/           # Pruebas de extremo a extremo
```

## Convenciones

### Pruebas Unitarias (`unit/`)
- Prueban componentes individuales de forma aislada
- Estructura de carpetas refleja la estructura de `src/`
- Ejemplo: `unit/application/errors/app-error.test.ts` prueba `src/application/errors/app-error.ts`

### Pruebas E2E (`e2e/`)
- Prueban flujos completos de extremo a extremo
- Pueden usar servicios externos (BD, Redis, etc.)
- Ejemplo: `e2e/api/corn.test.ts` prueba el endpoint completo `/api/v001/corn`

## Ejecutar Tests

```bash
# Ejecutar todos los tests
npm test

# Ejecutar tests en modo watch
npm run test:watch

# Ejecutar tests con coverage
npm run test:coverage

# Ejecutar solo tests unitarios
npm test -- __tests__/unit

# Ejecutar solo tests e2e
npm test -- __tests__/e2e
```

## Nomenclatura

- Archivos de test: `*.test.ts` o `*.spec.ts`
- Los archivos deben estar en `__tests__/unit/` o `__tests__/e2e/`
- Mantener la estructura de carpetas similar a `src/` para facilitar la navegación

