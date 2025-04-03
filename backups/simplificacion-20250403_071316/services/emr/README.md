# Sistema de Adaptadores EMR para MapleHealth AI

Este directorio contiene la implementación de adaptadores para diferentes sistemas de Registros Médicos Electrónicos (EMR) que se integran con MapleHealth AI.

## Propósito

Los adaptadores EMR permiten a MapleHealth AI funcionar como una capa inteligente sobre distintos sistemas EMR, estandarizando la forma en que se accede a los datos médicos independientemente del sistema subyacente. Esto proporciona:

1. **Independencia de plataforma** - MapleHealth AI puede funcionar con múltiples sistemas EMR sin cambios en su lógica principal.
2. **Consistencia de datos** - Todos los datos se normalizan a un formato estándar, independientemente de su origen.
3. **Escalabilidad** - Fácil adición de soporte para nuevos sistemas EMR mediante la implementación de nuevos adaptadores.

## Arquitectura

Todos los adaptadores implementan la interfaz base `EMRAdapter` que define operaciones comunes:

- Obtención de datos de pacientes
- Búsqueda de pacientes
- Acceso al historial médico
- Almacenamiento de consultas y tratamientos
- Obtención de métricas y datos clínicos

## Adaptadores Disponibles

| Adaptador | Sistema EMR | Estado |
|-----------|-------------|--------|
| `GenericEMRAdapter` | Implementación de demostración genérica | Disponible |
| `EPICAdapter` | EPIC | Planificado |
| `CernerAdapter` | Cerner | Planificado |
| `OpenEMRAdapter` | OpenEMR | Planificado |
| `OSCARAdapter` | OSCAR | Planificado |

## Uso

Para utilizar un adaptador EMR específico:

```typescript
import { EMRAdapterFactory } from './EMRAdapterFactory';

// Obtener un adaptador para un sistema específico
const epicAdapter = EMRAdapterFactory.getAdapter('EPIC', {
  apiKey: 'your-api-key',
  baseUrl: 'https://epic-api-endpoint.com'
});

// Verificar conexión
const connected = await epicAdapter.testConnection();

// Obtener datos de un paciente
const patientData = await epicAdapter.getPatientData('patient-id-123');

// Realizar una búsqueda de pacientes
const searchResults = await epicAdapter.searchPatients({
  name: 'García'
}, 10);
```

## Implementación de Nuevos Adaptadores

Para implementar un adaptador para un nuevo sistema EMR:

1. Crear una nueva clase que implemente la interfaz `EMRAdapter`
2. Registrar el adaptador en `EMRAdapterFactory`
3. Implementar todas las operaciones requeridas
4. Asegurar que los datos sean normalizados al formato esperado por MapleHealth AI

## Consideraciones de Seguridad

- Todos los adaptadores deben implementar mecanismos seguros para conectarse a sus respectivos sistemas EMR.
- La información sensible de los pacientes debe estar encriptada durante la transmisión y almacenamiento.
- Se debe respetar la legislación local de protección de datos (HIPAA, GDPR, etc.).

## Registros y Auditoría

Cada adaptador mantiene registros detallados de todas las operaciones para fines de auditoría y cumplimiento normativo. Estos registros incluyen:

- Quién accedió a qué información
- Cuándo se realizó el acceso
- Qué operación se realizó
- Resultado de la operación
