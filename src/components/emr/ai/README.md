# Asistente Clínico Inteligente para MapleAI Health

Este módulo implementa un asistente clínico inteligente que analiza la información ingresada en tiempo real durante la documentación SOAP y proporciona sugerencias contextuales para mejorar la completitud y calidad de la documentación médica.

## Componentes principales

### `SmartSuggestionPanel`

Panel inteligente que muestra sugerencias basadas en el análisis de los datos SOAP. Detecta patrones específicos y genera recomendaciones contextuales para ayudar al profesional clínico durante la documentación.

**Características:**
- Detecta menciones de condiciones específicas (ej. prótesis total de rodilla)
- Identifica información potencialmente faltante o incompleta
- Prioriza sugerencias según importancia clínica
- Permite descartar sugerencias no relevantes
- Ofrece navegación directa a los campos que requieren atención

### `ClinicalAssistant`

Componente de integración que conecta el panel de sugerencias con el flujo de trabajo SOAP, proporcionando una interfaz consistente para las sugerencias inteligentes.

**Características:**
- Gestiona el estado de las sugerencias seleccionadas
- Proporciona navegación entre secciones SOAP
- Se integra con el diseño general de la aplicación
- Adaptable a diferentes especialidades médicas

## Reglas y sistema de detección

El sistema implementa un conjunto de reglas específicas para diferentes condiciones clínicas. Actualmente, se han implementado reglas para:

- **Prótesis Total de Rodilla (PTR)**:
  - Verificación de fecha de cirugía
  - Documentación de medicación actual (especialmente anticoagulantes)
  - Evaluación bilateral (rodilla contralateral)
  - Referencias a imágenes radiográficas

## Uso

```tsx
// Importar componentes
import { ClinicalAssistant } from '../components/emr/ai';
import SoapContainer from '../components/emr/soap/SoapContainer';

// Integración en un componente de página
function PatientPage() {
  return (
    <div className="container">
      <SoapContainer 
        patientId="PAT-12345"
        specialty="physiotherapy"
        visitId="VISIT-56789"
        showAssistant={true}
      />
    </div>
  );
}
```

## Próximas mejoras

- Expansión de reglas para otras condiciones clínicas (lumbalgia, cervicalgia, etc.)
- Integración de algoritmos NLP más avanzados para análisis de texto
- Sistema de aprendizaje basado en las respuestas del usuario
- Personalización de sugerencias según especialidad
- Integración con guías clínicas basadas en evidencia 