# Tests para el Sistema de Evaluación de Evidencia Médica

Este directorio contiene pruebas unitarias para el sistema de evaluación de evidencia médica, un componente crítico para garantizar la credibilidad científica de las recomendaciones médicas generadas por la IA.

## Componentes Probados

### 1. EvidenceEvaluationService

Las pruebas para este servicio cubren:

- Evaluación de recomendaciones médicas
- Verificación de fuentes científicas
- Clasificación de niveles de evidencia (A, B, C, D)
- Cálculo de confiabilidad basado en fuentes verificadas
- Manejo de errores durante el proceso de evaluación

El archivo `EvidenceEvaluationService.test.ts` incluye pruebas para métodos públicos y privados, asegurando el correcto funcionamiento de cada parte del servicio.

### 2. MedicalSourceVerifier

Las pruebas para este componente validan:

- Verificación de fuentes individuales
- Verificación de múltiples fuentes en paralelo
- Cálculo de confiabilidad según metadatos científicos
- Manejo de errores durante la verificación

El archivo `MedicalSourceVerifier.test.ts` asegura que las fuentes médicas sean correctamente verificadas contra bases de datos médicas reconocidas.

### 3. DatabaseConnector

Las pruebas para los conectores de bases de datos validan:

- Conexión a bases de datos médicas
- Búsqueda de información médica
- Verificación de fuentes contra bases de datos
- Recuperación después de fallos de conexión
- Funcionamiento independiente de múltiples conectores

## Estrategia de Mockeo

En estas pruebas utilizamos:

1. Mocks para servicios externos (Pub Med, Cochrane, etc.)
2. Stubs para simular respuestas de APIs
3. Spies para verificar que los métodos internos se llaman correctamente
4. Fake implementaciones para pruebas aisladas

## Cobertura de Pruebas

Estos tests aseguran una cobertura del sistema de evaluación de evidencia que incluye:

- 100% de los métodos públicos
- Casos de éxito y error para cada funcionalidad
- Validación de integración entre componentes
- Verificación de comportamiento con datos reales simulados

## Cómo Ejecutar

Para ejecutar estas pruebas específicas:

```
npm test -- --testPathPattern=src/services/ai/evidence
```

## Próximos Pasos

- Agregar pruebas de integración con servicios externos reales
- Ampliar cobertura de pruebas para conectores específicos
- Validar el comportamiento con conjuntos de datos más grandes
