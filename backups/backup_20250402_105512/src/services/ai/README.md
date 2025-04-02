# AIService - Documentación Técnica

El AIService es el componente central de MapleAIHealth, responsable de procesar y analizar datos médicos utilizando modelos de inteligencia artificial.

## Arquitectura

AIService sigue un patrón Singleton para asegurar una única instancia a lo largo de la aplicación. Incorpora varios subsistemas:

- **Sistema de logging**: Registro detallado de operaciones
- **Sistema de caché**: Almacenamiento eficiente de respuestas previas
- **Mecanismo de reintentos**: Manejo resiliente de errores transitorios
- **Proveedores de IA**: Abstracción para múltiples motores de IA

## Interfaces Principales

### `AIService`

```typescript
class AIService {
  // Singleton
  static getInstance(): AIService;

  // Análisis de datos
  analyzeEMRData(emrData: EMRData): Promise<AIResponse>;
  analyzeUnstructuredNotes(patientId: string, notes: UnstructuredNote[]): Promise<AIResponse>;
  analyzeUnstructuredNote(note: UnstructuredNote): Promise<AIResponse>;

  // Gestión de proveedores
  getAvailableProviders(): AIProvider[];
  estimateCost(providerId: string, queryCount: number): number;

  // Operaciones de sistema
  query(query: AIQuery): Promise<AIResponse>;
  getLogs(level?: 'info' | 'warn' | 'error' | 'debug'): LogEntry[];
  clearLogs(): void;
}
```

### `AIServiceInternals` (métodos privados)

```typescript
interface AIServiceInternals {
  getEMRData(patientId: string): Promise<EMRData>;
  executeWithRetry<T>(operation: () => Promise<T>, retries?: number): Promise<T>;
  generateSimulatedResponse(query: AIQuery): Promise<AIResponse>;
  detectContradictions(emrData: EMRData, notes: UnstructuredNote[]): Insight[];
  generateInsights(response: AIResponse, emrData: EMRData): Insight[];
  generateRecommendations(response: AIResponse): Recommendation[];
}
```

## Flujo de Datos

1. **Entrada**: El servicio recibe datos médicos (EMR) o notas no estructuradas
2. **Procesamiento**:
   - Verifica el caché para respuestas existentes
   - Prepara el contexto para la consulta de IA
   - Realiza la consulta al modelo de IA (con reintentos si es necesario)
   - Analiza la respuesta para generar insights
   - Detecta contradicciones en los datos
3. **Salida**: Devuelve una respuesta estructurada con análisis, insights y recomendaciones

## Manejo de Errores

El servicio implementa un sistema robusto de manejo de errores:

- **AIServiceError**: Clase personalizada para encapsular errores
- **Reintentos automáticos**: Intenta nuevamente operaciones fallidas
- **Logging detallado**: Registro de errores para análisis posterior

```typescript
try {
  // Operación que podría fallar
} catch (error) {
  this.logger.error('Error específico', { error, contexto });
  throw new AIServiceError('Mensaje para el usuario', error as Error);
}
```

## Sistema de Logging

El servicio incluye un sistema de logging detallado:

- **Niveles**: info, warn, error, debug
- **Metadatos**: Incluye timestamp, servicio, y datos adicionales
- **Límite de memoria**: Mantiene un número controlado de logs en memoria
- **Consulta**: Permite filtrar logs por nivel

## Sistema de Caché

La implementación del caché optimiza el rendimiento:

- **Almacenamiento** de consultas frecuentes
- **Metadatos** como proveedor, costo y tiempo de procesamiento
- **Claves** generadas a partir de la consulta completa

## Detección de Contradicciones

Un aspecto clave del AIService es su capacidad para identificar contradicciones:

- **Medicamentos**: Detecta discrepancias entre medicamentos mencionados en notas y registrados en EMR
- **Diagnósticos**: Identifica diagnósticos inconsistentes entre distintas notas
- **Severidad**: Asigna niveles de severidad a las contradicciones

## Uso en Testing

Para realizar pruebas, se puede acceder a los métodos privados a través de la interfaz `AIServiceInternals`:

```typescript
// Ejemplo de test
it('should detect contradictions', async () => {
  // Mock de los métodos internos
  vi.spyOn(aiService as unknown as AIServiceInternals, 'getEMRData')
    .mockResolvedValue(mockEMRData);

  // Llamada al método público
  const result = await aiService.analyzeUnstructuredNotes('patientId', mockNotes);

  // Verificación del resultado
  expect(result.insights.some(i => i.type === 'contradiction')).toBe(true);
});
```

## Consideraciones de Rendimiento

- El servicio está optimizado para manejar operaciones costosas
- Caché para consultas repetidas
- Optimizaciones de memoria para logging
- Procesamiento eficiente de datos complejos

## Futuras Mejoras

- Implementación de proveedores reales de IA
- Mejora de algoritmos de detección de contradicciones
- Expansión de capacidades de análisis
- Implementación de análisis predictivo
