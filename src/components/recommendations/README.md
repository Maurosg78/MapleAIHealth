# Componentes de Recomendaciones Clínicas

Este directorio contiene componentes React para la visualización y gestión de recomendaciones clínicas generadas mediante el servicio `ClinicalCopilotService`.

## Componentes Principales

### 1. ClinicalRecommendationCard

Tarjeta que muestra una recomendación clínica individual, con información detallada sobre:

- Título y descripción de la recomendación
- Tipo de recomendación (medicación, prueba, seguimiento, etc.)
- Nivel de urgencia
- Nivel de evidencia médica
- Confianza de la IA en la recomendación
- Fuentes médicas que respaldan la recomendación
- Posibles contraindicaciones

**Uso básico:**

```tsx
import { ClinicalRecommendationCard } from '../components/recommendations';

<ClinicalRecommendationCard
  id="rec123"
  title="Iniciar metformina 850mg"
  description="Se recomienda iniciar tratamiento con metformina..."
  type="medication"
  urgency="soon"
  confidence={0.92}
  evidenceLevel="A"
  onAction={(action, id) => console.log(`Acción ${action} para ${id}`)}
/>
```

### 2. RecommendationsList

Componente que muestra una lista filtrable de recomendaciones clínicas, con características:

- Filtrado por tipo, urgencia y nivel de evidencia
- Agrupación por nivel de urgencia
- Búsqueda por texto
- Estados de carga y error
- Opciones para mostrar/ocultar contraindicaciones

**Uso básico:**

```tsx
import { RecommendationsList } from '../components/recommendations';

<RecommendationsList
  recommendations={recommendations}
  patientName="García Martínez, Juan"
  onRecommendationAction={handleRecommendationAction}
  loading={false}
/>
```

### 3. DemoPage

Página de demostración que muestra el uso completo de los componentes de recomendaciones, incluyendo:

- Tabs para cambiar entre diferentes pacientes
- Datos de ejemplo para probar la funcionalidad
- Notificaciones para las acciones del usuario
- Simulación de carga de datos

## Hook Personalizado

Para facilitar la integración con el backend, se ha creado un hook personalizado:

```tsx
import { useClinicalRecommendations } from '../hooks';

function MyComponent() {
  const {
    recommendations,
    loading,
    error,
    fetchRecommendations
  } = useClinicalRecommendations({
    maxSuggestions: 10,
    minConfidence: 0.7,
    includeContraindications: true,
    includeEvidenceDetails: true
  });

  useEffect(() => {
    // Obtener recomendaciones para un paciente específico
    fetchRecommendations(patientNotes, {
      patientId: 'patient123',
      age: 65,
      gender: 'male',
      mainCondition: 'Diabetes tipo 2',
      allergies: ['penicilina'],
      currentMedications: ['enalapril 10mg']
    });
  }, [fetchRecommendations]);

  return (
    <RecommendationsList
      recommendations={recommendations}
      loading={loading}
      error={error}
      patientName="García Martínez, Juan"
    />
  );
}
```

## Personalización

Los componentes de recomendaciones están construidos sobre Material UI y se pueden personalizar a través de las propiedades y temas de Material UI:

- Colores basados en el nivel de urgencia y evidencia
- Estilos consistentes con el resto de la aplicación
- Diseño responsivo para diferentes tamaños de pantalla
- Soporte para modo claro/oscuro a través del tema de Material UI

## Integración con el Sistema EMR

Estos componentes están diseñados para integrarse con los servicios de IA y EMR existentes:

1. El hook `useClinicalRecommendations` se conecta con `ClinicalCopilotService`
2. Los componentes visualizan información de `EvidenceEvaluationService`
3. Los datos de pacientes provienen de los adaptadores EMR

## Roadmap

- Desarrollo de análisis estadísticos sobre recomendaciones aplicadas
- Integración con flujos de trabajo clínicos
- Exportación de recomendaciones a formatos estándar médicos
- Visualización de tendencias temporales en recomendaciones
