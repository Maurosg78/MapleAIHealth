# Análisis de Coherencia entre Componentes SOAP

Este documento analiza la coherencia y consistencia entre los componentes del módulo SOAP (Subjetivo, Objetivo, Evaluación, Plan) para garantizar su correcta integración y funcionamiento dentro del EMR.

## 1. Estructura de Props

### Inconsistencias Identificadas:

| Componente | Props | Inconsistencias |
|------------|-------|-----------------|
| SoapContainer | `patientId: string` (requerido)<br>`specialty: SpecialtyType` (requerido)<br>`visitId?: string` (opcional)<br>`readOnly?: boolean` (opcional) | Coherente con el resto |
| SubjectiveContainer | `patientId: string` (requerido)<br>`specialty: SpecialtyType` (requerido)<br>`visitId?: string` (opcional)<br>`readOnly?: boolean` (opcional) | Coherente con SoapContainer |
| ObjectiveContainer | `patientId: string` (requerido)<br>`specialty: SpecialtyType` (requerido)<br>`visitId?: string` (opcional)<br>`readOnly?: boolean` (opcional) | Coherente con SoapContainer |
| AssessmentContainer | `patientId: string` (requerido)<br>`specialty: SpecialtyType` (requerido)<br>`visitId?: string` (opcional)<br>`readOnly?: boolean` (opcional) | Coherente con SoapContainer |
| PlanContainer | `patientId?: string` (opcional)<br>`visitId?: string` (opcional)<br>`specialty: SpecialtyType` (requerido)<br>`onDataChange?: (data: PlanData) => void` (opcional)<br>`initialData?: PlanData` (opcional)<br>`readOnly?: boolean` (opcional) | **Inconsistente:**<br>- `patientId` es opcional mientras que es requerido en los otros<br>- Tiene props adicionales (`onDataChange`, `initialData`)<br>- Usa `Readonly<PlanContainerProps>` en la firma de la función |

### Recomendación:
- Estandarizar la estructura de props para todos los componentes:
  - Hacer que `patientId` sea obligatorio en `PlanContainer` igual que en los demás componentes
  - Evaluar si agregar `onDataChange` e `initialData` en todos los componentes para consistencia
  - Usar `Readonly<>` en todos los componentes o en ninguno para consistencia

## 2. Uso del patrón "Specialty Config"

### Inconsistencias Identificadas:

| Componente | Nombre de función | Implementación |
|------------|-------------------|----------------|
| SubjectiveContainer | `getSpecialtyFields()` | Implementado con opciones para fisioterapia |
| ObjectiveContainer | `getSpecialtyConfig()` | Implementado con opciones para fisioterapia |
| AssessmentContainer | `getSpecialtyConfig()` | Implementado con `eslint-disable-next-line` para variable no usada |
| PlanContainer | `getSpecialtyConfig()` | Implementado con opciones detalladas para fisioterapia |

### Recomendación:
- Estandarizar el nombre de la función a `getSpecialtyConfig()` en todos los componentes
- Asegurar que el eslint-disable en AssessmentContainer sea necesario o eliminarlo
- Evaluar unificar la lógica de configuración en un archivo centralizado para toda la especialidad

## 3. Manejo de Estado y Efecto

### Inconsistencias Identificadas:

| Componente | Manejo de Estado | useEffect |
|------------|-----------------|-----------|
| SubjectiveContainer | Estado simple | useEffect dependiendo de `[visitId, setValue]` |
| ObjectiveContainer | Estado simple | useEffect dependiendo de `[visitId, setValue]` |
| AssessmentContainer | Estado simple | useEffect dependiendo de `[visitId, setValue]` |
| PlanContainer | Estado complejo con useRef y múltiples useEffect | Múltiples dependencias, incluyendo values de watch() |

### Recomendación:
- Unificar el patrón de manejo de estado en todos los componentes
- Resolver la complejidad en PlanContainer para que sea coherente con los demás
- Evaluar necesidad de useRef y simplificar los efectos en PlanContainer

## 4. Manejo de Carga de Datos

### Inconsistencias Identificadas:

| Componente | Carga de Datos Iniciales |
|------------|--------------------------|
| SubjectiveContainer | Simulación con timeout (500ms) |
| ObjectiveContainer | Simulación con timeout (500ms) |
| AssessmentContainer | Simulación con timeout (500ms) |
| PlanContainer | Usa `initialData` prop + simulación |

### Recomendación:
- Estandarizar: usar simulación o props para todos los componentes
- Definir un patrón claro para carga de datos que sea coherente en toda la aplicación

## 5. Tipado y Tipos "any"

### Inconsistencias Identificadas:
- Uso de ESLint-disable para evitar advertencias tipo en AssessmentContainer
- Uso de tipos genéricos Record<string, any> en varios lugares
- Conversión de tipos con `as unknown as` en PlanContainer

### Recomendación:
- Definir interfaces más específicas para evitar el uso de "any"
- Eliminar ESLint-disable cuando sea posible
- Usar tipado consistente en todos los componentes

## 6. Props no Utilizadas

### Inconsistencias Identificadas:
- `patientId` está marcado como no utilizado en varios componentes
- Comentarios inconsistentes justificando la inclusión de variables no utilizadas

### Recomendación:
- Si `patientId` se incluye por coherencia, documentarlo consistentemente
- Considerar usar un hook o contexto para compartir datos del paciente si realmente es necesario

## 7. Jerarquía de Componentes

### Inconsistencias Identificadas:
- SoapContainer usa imports directos a cada subcomponente
- No existe un mecanismo para compartir datos entre componentes SOAP

### Recomendación:
- Considerar el uso de React Context para compartir estado común
- Implementar un mecanismo para integrar datos entre los componentes SOAP

## 8. Acción Siguiente

Para implementar estas mejoras, se recomienda:

1. Estandarizar las interfaces de props para todos los componentes SOAP
2. Centralizar las configuraciones de especialidad en un archivo único
3. Implementar un Context para compartir datos entre componentes SOAP
4. Refactorizar PlanContainer para simplificar su lógica y hacerla coherente con el resto
5. Mejorar el tipado para eliminar "any" y conversiones de tipo forzadas 