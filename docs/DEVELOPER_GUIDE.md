# Guía para Desarrolladores: Implementación de Adaptadores EMR

Este documento describe el proceso para desarrollar e integrar nuevos adaptadores EMR en MapleHealth AI. Sigue estas instrucciones para crear un adaptador compatible con cualquier sistema de Registro Médico Electrónico.

## Arquitectura de Adaptadores

Los adaptadores EMR siguen un patrón de diseño Adapter, permitiendo a nuestra aplicación trabajar con diferentes sistemas EMR a través de una interfaz estandarizada.

### Componentes Principales

1. **EMRAdapter (Interfaz)**: Define el contrato que todos los adaptadores deben implementar
2. **Implementaciones específicas**: Clases concretas para cada sistema EMR (OSCAR, ClinicCloud, EPIC, etc.)
3. **EMRAdapterFactory**: Fábrica que gestiona la creación y acceso a los adaptadores

## Implementación de un Nuevo Adaptador

### 1. Crear la Clase del Adaptador

Crea un nuevo archivo en `src/services/emr/implementations/[NombreSistema]Adapter.ts`.

Estructura básica:

```typescript
import {
  EMRAdapter,
  EMRConsultation,
  EMRDiagnosis,
  EMRHistoryOptions,
  EMRPatientHistory,
  EMRPatientMetrics,
  EMRPatientSearchResult,
  EMRSearchQuery,
  EMRTreatment
} from '../EMRAdapter';
import { PatientData } from '../../ai/types';
import { Logger } from '../../../lib/logger';

/**
 * Adaptador para integración con [NombreSistema]
 * Breve descripción del sistema EMR
 */
export class NuevoSistemaAdapter implements EMRAdapter {
  public readonly name = 'Nombre del Adaptador';
  private readonly logger: Logger;

  // Propiedades específicas del adaptador
  private readonly apiUrl: string;
  private readonly apiKey: string;
  // Otras propiedades necesarias...

  constructor(config: {
    // Parámetros de configuración requeridos
    apiUrl: string;
    apiKey: string;
    // Otros parámetros...
  }) {
    this.logger = new Logger('NuevoSistemaAdapter');
    this.apiUrl = config.apiUrl;
    this.apiKey = config.apiKey;
    // Inicializar otras propiedades...

    this.logger.info('Inicializado adaptador para NuevoSistema', {
      apiUrl: this.apiUrl
    });
  }

  // Implementar todos los métodos requeridos por la interfaz EMRAdapter
  public async testConnection(): Promise<boolean> {
    // Implementación...
  }

  public async getPatientData(patientId: string): Promise<PatientData> {
    // Implementación...
  }

  public async searchPatients(query: EMRSearchQuery, limit = 10): Promise<EMRPatientSearchResult[]> {
    // Implementación...
  }

  public async getPatientHistory(patientId: string, options?: EMRHistoryOptions): Promise<EMRPatientHistory> {
    // Implementación...
  }

  public async saveConsultation(consultation: EMRConsultation): Promise<string> {
    // Implementación...
  }

  public async updateConsultation(consultationId: string, updates: Partial<EMRConsultation>): Promise<boolean> {
    // Implementación...
  }

  public async registerTreatment(treatment: EMRTreatment): Promise<string> {
    // Implementación...
  }

  public async getPatientMetrics(patientId: string, metricTypes: string[]): Promise<EMRPatientMetrics> {
    // Implementación...
  }

  // Métodos auxiliares privados específicos del adaptador
  private async authenticate(): Promise<string> {
    // Lógica de autenticación específica del sistema
  }

  private async fetchData(endpoint: string): Promise<any> {
    // Lógica para obtener datos de la API
  }

  private async postData(endpoint: string, data: Record<string, any>): Promise<any> {
    // Lógica para enviar datos a la API
  }

  // Métodos de conversión de formatos de datos
  private convertToPatientData(data: any): PatientData {
    // Convertir de formato del EMR al formato de la aplicación
  }

  // Otros métodos de conversión necesarios...
}
```

### 2. Registrar el Adaptador en la Fábrica

Modifica `src/services/emr/EMRAdapterFactory.ts` para incluir tu nuevo adaptador:

1. Importa la clase del adaptador:
```typescript
import { NuevoSistemaAdapter } from './implementations/NuevoSistemaAdapter';
```

2. Añade la configuración específica en el tipo `EMRAdapterConfig` si es necesario:
```typescript
export type EMRAdapterConfig = {
  // Campos existentes...

  // Nuevos campos específicos para tu adaptador
  nuevoParámetro?: string;
};
```

3. Añade la lógica de creación en el método `createAdapter`:
```typescript
private static createAdapter(name: string, config: EMRAdapterConfig): EMRAdapter {
  switch (name) {
    // Casos existentes...

    case 'NUEVOSISTEMA':
      if (!config.apiUrl || !config.apiKey) {
        throw new Error('Se requiere apiUrl y apiKey para el adaptador NuevoSistema');
      }
      return new NuevoSistemaAdapter({
        apiUrl: config.apiUrl,
        apiKey: config.apiKey,
        // Otros parámetros de configuración
      });

    default:
      // Código existente...
  }
}
```

4. Actualiza el método `getAdaptersInfo` para incluir información sobre tu adaptador:
```typescript
public static getAdaptersInfo(): Array<{ id: string; name: string; description: string }> {
  return [
    // Adaptadores existentes...

    {
      id: 'NUEVOSISTEMA',
      name: 'Nombre del Nuevo Sistema EMR',
      description: 'Descripción breve del adaptador'
    }
  ];
}
```

## Consideraciones de Implementación

### Gestión de Autenticación

La mayoría de los sistemas EMR requieren autenticación. Implementa un mecanismo robusto:

- Gestión de tokens
- Renovación automática de credenciales
- Manejo de errores de autenticación

### Conversión de Formatos

Cada sistema EMR tendrá sus propios formatos y estructuras de datos:

- Implementa conversores entre el formato del EMR y los formatos internos de la aplicación
- Asegúrate de mapear correctamente todos los campos requeridos
- Maneja valores nulos o faltantes adecuadamente

### Manejo de Errores

Implementa un manejo robusto de errores:

- Captura y clasifica los tipos de errores
- Utiliza la clase Logger para registrar problemas
- Proporciona mensajes de error significativos

### Pruebas

Escribe pruebas unitarias para tu adaptador:

- Prueba la autenticación
- Prueba la conversión de datos
- Utiliza mocks para simular respuestas de API
- Crea escenarios para casos de éxito y error

## Ejemplo: Método de Búsqueda de Pacientes

```typescript
public async searchPatients(query: EMRSearchQuery, limit = 10): Promise<EMRPatientSearchResult[]> {
  try {
    this.logger.info('Buscando pacientes en NuevoSistema', { query, limit });

    // Asegurar autenticación
    await this.ensureAuthenticated();

    // Construir parámetros de búsqueda según la API del sistema
    const searchParams = new URLSearchParams();

    if (query.name) {
      searchParams.append('nombreCompleto', query.name);
    }

    if (query.documentId) {
      searchParams.append('documento', query.documentId);
    }

    // Añadir límite
    searchParams.append('limit', limit.toString());

    // Realizar la búsqueda
    const results = await this.fetchData(`/pacientes/buscar?${searchParams.toString()}`);

    // Convertir resultados al formato estándar
    return results.items.map((item: any) => ({
      id: item.id,
      name: `${item.nombre} ${item.apellidos}`.trim(),
      birthDate: item.fechaNacimiento,
      gender: this.mapGender(item.genero),
      mrn: item.numeroHistoria || ''
    }));
  } catch (error) {
    this.logger.error('Error al buscar pacientes', { error, query });
    throw new Error(`Error en búsqueda de pacientes: ${(error as Error).message}`);
  }
}
```

## Recursos y Documentación

- [Interfaz EMRAdapter](../src/services/emr/EMRAdapter.ts) - Documentación de la interfaz base
- [Ejemplos de adaptadores existentes](../src/services/emr/implementations/) - Referencia de implementaciones
- [Guía de estilo de código](./CODE_STYLE.md) - Convenciones de código del proyecto

## Lista de Verificación para Nuevos Adaptadores

- [ ] Implementa todos los métodos requeridos por la interfaz EMRAdapter
- [ ] Gestiona adecuadamente la autenticación y tokens de acceso
- [ ] Maneja errores de forma robusta con mensajes claros
- [ ] Documenta los requisitos de configuración del adaptador
- [ ] Implementa conversión bidireccional de datos
- [ ] Registra el adaptador en EMRAdapterFactory
- [ ] Escribe pruebas unitarias
- [ ] Actualiza la documentación de desarrolladores si es necesario
