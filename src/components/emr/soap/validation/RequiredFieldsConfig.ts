import { SpecialtyType, SubjectiveData, ObjectiveData, AssessmentData, PlanData } from '../../../../types/clinical';

/**
 * Configuración de campos requeridos para los componentes SOAP
 * Adaptable por especialidad médica
 */

export interface RequiredField {
  field: string;
  message: string;
  conditional?: boolean | ((data: SubjectiveData | ObjectiveData | AssessmentData | PlanData) => boolean);
}

type SOAPSection = 'subjective' | 'objective' | 'assessment' | 'plan';

/**
 * Define los campos requeridos para cada sección SOAP según la especialidad
 */
export const requiredFieldsConfig: Record<SpecialtyType, Record<SOAPSection, RequiredField[]>> = {
  physiotherapy: {
    subjective: [
      { field: 'chiefComplaint', message: 'El motivo de consulta es obligatorio' },
      { field: 'painIntensity', message: 'La intensidad del dolor es obligatoria' },
      { field: 'medicalHistory', message: 'Los antecedentes médicos son obligatorios' },
      { 
        field: 'painLocation', 
        message: 'La localización del dolor es obligatoria para dolor musculoesquelético',
        conditional: (data) => (data as SubjectiveData).chiefComplaint?.toLowerCase().includes('dolor')
      }
    ],
    objective: [
      { field: 'observation', message: 'La observación es obligatoria' },
      { field: 'palpation', message: 'Los hallazgos a la palpación son obligatorios' },
      { 
        field: 'rangeOfMotion', 
        message: 'Es necesario incluir al menos una medición de rango de movimiento',
        conditional: (data) => {
          const rom = (data as ObjectiveData).rangeOfMotion;
          return rom === undefined || Object.keys(rom).length === 0;
        }
      },
      {
        field: 'inspection',
        message: 'La inspección física es obligatoria para evaluación MSK',
      },
      {
        field: 'muscleStrength',
        message: 'Es necesario incluir al menos una medición de fuerza muscular',
        conditional: (data) => {
          const strength = (data as ObjectiveData).muscleStrength;
          return strength === undefined || Object.keys(strength).length === 0;
        }
      },
      {
        field: 'specialTests',
        message: 'Es necesario incluir al menos un test especial relevante para la condición',
        conditional: (data) => {
          // Solo obligatorio si hay dolor en articulaciones específicas
          const chiefComplaint = (data as ObjectiveData).observation?.toLowerCase() || '';
          const hasPain = chiefComplaint.includes('dolor') || 
                          chiefComplaint.includes('molestia') || 
                          chiefComplaint.includes('limitación');
          
          if (hasPain) {
            const tests = (data as ObjectiveData).specialTests;
            return tests === undefined || Object.keys(tests).length === 0;
          }
          return false;
        }
      }
    ],
    assessment: [
      { field: 'diagnosis', message: 'El diagnóstico es obligatorio' },
      { field: 'impression', message: 'La impresión diagnóstica es obligatoria' },
      { field: 'problemList', message: 'La lista de problemas es obligatoria' },
      { field: 'reasoning', message: 'El razonamiento clínico es obligatorio' },
      { field: 'prognosis', message: 'El pronóstico es obligatorio' }
    ],
    plan: [
      { field: 'goals', message: 'Los objetivos del tratamiento son obligatorios' },
      { field: 'treatment', message: 'El plan de tratamiento es obligatorio' },
      { field: 'homeExerciseProgram', message: 'El programa de ejercicios para casa es obligatorio' },
      { field: 'followUpPlan', message: 'El plan de seguimiento es obligatorio' },
      { 
        field: 'precautions', 
        message: 'Las precauciones son obligatorias para este tipo de paciente',
        conditional: (data) => (data as PlanData).goals?.some((goal: string) => 
          goal.toLowerCase().includes('dolor') || goal.toLowerCase().includes('movilidad')
        )
      }
    ]
  },
  // Para otras especialidades se agregarán sus configuraciones específicas
  // Por ahora, usaremos una configuración básica común para las demás
  general: {
    subjective: [
      { field: 'chiefComplaint', message: 'El motivo de consulta es obligatorio' },
      { field: 'medicalHistory', message: 'Los antecedentes médicos son obligatorios' }
    ],
    objective: [
      { field: 'observation', message: 'La observación es obligatoria' }
    ],
    assessment: [
      { field: 'diagnosis', message: 'El diagnóstico es obligatorio' }
    ],
    plan: [
      { field: 'treatment', message: 'El plan de tratamiento es obligatorio' }
    ]
  },
  pediatrics: {
    subjective: [
      { field: 'chiefComplaint', message: 'El motivo de consulta es obligatorio' },
      { field: 'medicalHistory', message: 'Los antecedentes médicos son obligatorios' }
    ],
    objective: [
      { field: 'observation', message: 'La observación es obligatoria' }
    ],
    assessment: [
      { field: 'diagnosis', message: 'El diagnóstico es obligatorio' }
    ],
    plan: [
      { field: 'treatment', message: 'El plan de tratamiento es obligatorio' }
    ]
  },
  nutrition: {
    subjective: [
      { field: 'chiefComplaint', message: 'El motivo de consulta es obligatorio' },
      { field: 'medicalHistory', message: 'Los antecedentes médicos son obligatorios' }
    ],
    objective: [
      { field: 'observation', message: 'La observación es obligatoria' }
    ],
    assessment: [
      { field: 'diagnosis', message: 'El diagnóstico es obligatorio' }
    ],
    plan: [
      { field: 'treatment', message: 'El plan de tratamiento es obligatorio' }
    ]
  },
  psychology: {
    subjective: [
      { field: 'chiefComplaint', message: 'El motivo de consulta es obligatorio' },
      { field: 'medicalHistory', message: 'Los antecedentes médicos son obligatorios' }
    ],
    objective: [
      { field: 'observation', message: 'La observación es obligatoria' }
    ],
    assessment: [
      { field: 'diagnosis', message: 'El diagnóstico es obligatorio' }
    ],
    plan: [
      { field: 'treatment', message: 'El plan de tratamiento es obligatorio' }
    ]
  }
};

/**
 * Obtiene los campos requeridos para una sección y especialidad específicas
 */
export function getRequiredFields(
  specialty: SpecialtyType,
  section: SOAPSection
): RequiredField[] {
  // Usar configuración específica de la especialidad o la configuración general si no existe
  return (
    requiredFieldsConfig[specialty]?.[section] ||
    requiredFieldsConfig.general[section]
  );
}

/**
 * Valida que todos los campos requeridos estén presentes
 */
export function validateRequiredFields(
  data: SubjectiveData | ObjectiveData | AssessmentData | PlanData,
  specialty: SpecialtyType,
  section: SOAPSection
): { valid: boolean; errors: string[] } {
  const requiredFields = getRequiredFields(specialty, section);
  const errors: string[] = [];

  requiredFields.forEach((field) => {
    const value = getFieldValue(data, field.field);
    const shouldValidate = field.conditional === undefined || 
      (typeof field.conditional === 'function' ? field.conditional(data) : field.conditional);

    if (shouldValidate) {
      if (value === undefined || value === null || value === '' || 
          (Array.isArray(value) && value.length === 0) ||
          (typeof value === 'object' && Object.keys(value).length === 0)) {
        errors.push(field.message);
      }
    }
  });

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Obtiene el valor de un campo, soportando notación de puntos para campos anidados
 */
function getFieldValue<T>(obj: T, path: string): unknown {
  return path.split('.').reduce((acc, part) => {
    if (acc === null || acc === undefined || typeof acc !== 'object') {
      return undefined;
    }
    return (acc as Record<string, unknown>)[part];
  }, obj as unknown);
} 