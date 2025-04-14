# Sistema de Validación de SOAP

## Descripción General

El sistema de validación de SOAP es una arquitectura diseñada para validar los datos ingresados en cada sección del formato SOAP (Subjetivo, Objetivo, Evaluación, Plan) en el registro médico electrónico. La validación es adaptable por especialidad médica y permite tanto validación manual como validación automática en tiempo real.

## Componentes Principales

### 1. ValidationErrorsDisplay

Componente visual para mostrar los errores de validación de manera clara y accesible.

```tsx
<ValidationErrorsDisplay 
  errors={['Error 1', 'Error 2']} 
  className="custom-class" 
/>
```

### 2. ValidationContainer

Contenedor que gestiona la lógica de validación para una sección específica y muestra los errores cuando corresponde.

```tsx
<ValidationContainer 
  data={sectionData}
  specialty="physiotherapy"
  section="subjective"
  showValidation={true}
/>
```

### 3. RequiredFieldsConfig

Contiene la configuración de los campos requeridos por especialidad y sección, así como funciones para validar los datos.

```ts
const requiredFieldsConfig: Record<SpecialtyType, Record<SOAPSection, RequiredField[]>>
```

## Características del Sistema

### Validación por Especialidad

El sistema permite definir conjuntos específicos de reglas de validación para cada especialidad médica. Por ejemplo, fisioterapia, medicina general, pediatría, etc.

### Validación Condicional

Soporta reglas condicionales que determinan si un campo es requerido basado en el valor de otros campos:

```ts
{
  field: 'painLocation', 
  message: 'La localización del dolor es obligatoria para dolor musculoesquelético',
  conditional: (data) => (data as SubjectiveData).chiefComplaint?.toLowerCase().includes('dolor')
}
```

### Modos de Validación

1. **Validación Manual**: El usuario puede validar explícitamente haciendo clic en el botón "Validar".
2. **Validación Automática**: El sistema puede validar automáticamente mientras el usuario escribe, con un debounce para evitar validaciones excesivas.
3. **Validación Global**: Permite validar todas las secciones simultáneamente al guardar el SOAP completo.

### Extensibilidad

El sistema está diseñado para ser fácilmente extensible con nuevas reglas y tipos de validación.

## Integración con React Hook Form

El sistema se integra de manera transparente con React Hook Form para la gestión de formularios:

```tsx
// Observar los cambios en el formulario para validación en tiempo real
useEffect(() => {
  const subscription = watch((data) => {
    updateFormData(data as SubjectiveData);
  });
  
  return () => subscription.unsubscribe();
}, [watch, updateFormData]);
```

## Funciones de Utilidad

### getRequiredFields

Obtiene los campos requeridos para una especialidad y sección específica:

```ts
const fields = getRequiredFields('physiotherapy', 'subjective');
```

### validateRequiredFields

Valida los datos contra las reglas definidas:

```ts
const result = validateRequiredFields(data, 'physiotherapy', 'subjective');
// result = { valid: boolean, errors: string[] }
```

## Rendimiento

El sistema utiliza estrategias para optimizar el rendimiento:

1. Memorización de resultados de validación con useMemo
2. Debounce para validación en tiempo real
3. Renderizado condicional para evitar cálculos innecesarios

## Pruebas

El sistema cuenta con pruebas unitarias completas para cada componente y función de validación, garantizando su fiabilidad y correcto funcionamiento.

## Uso Recomendado

Para implementar la validación en un nuevo componente:

1. Importar el componente ValidationContainer
2. Configurar el estado para mostrar la validación
3. Mantener los datos del formulario actualizados
4. Renderizar el ValidationContainer en el JSX con los datos y configuración apropiados
5. Opcional: Implementar validación automática con debounce

## Ejemplos

Ver los componentes SubjectiveContainer, ObjectiveContainer, AssessmentContainer y PlanContainer para ejemplos de implementación. 