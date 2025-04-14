import React, { useMemo } from 'react';
import { SpecialtyType, SubjectiveData, ObjectiveData, AssessmentData, PlanData } from '../../../../types/clinical';
import { validateRequiredFields } from './RequiredFieldsConfig';
import { ValidationErrorsDisplay } from './ValidationErrorsDisplay';

type SOAPSection = 'subjective' | 'objective' | 'assessment' | 'plan';
type SOAPData = SubjectiveData | ObjectiveData | AssessmentData | PlanData;

interface ValidationContainerProps {
  data: SOAPData;
  specialty: SpecialtyType;
  section: SOAPSection;
  showValidation: boolean;
  className?: string;
}

/**
 * Contenedor que valida los datos SOAP y muestra errores si existen
 * 
 * @param data - Datos de la sección SOAP actual
 * @param specialty - Especialidad médica actual
 * @param section - Sección SOAP actual (subjective, objective, assessment, plan)
 * @param showValidation - Indica si se debe mostrar la validación
 * @param className - Clases CSS adicionales
 */
export const ValidationContainer: React.FC<ValidationContainerProps> = ({
  data,
  specialty,
  section,
  showValidation,
  className = '',
}) => {
  // Memoizamos el resultado de la validación para evitar cálculos innecesarios
  const validationResult = useMemo(() => {
    if (!showValidation) return { valid: true, errors: [] };
    return validateRequiredFields(data, specialty, section);
  }, [data, specialty, section, showValidation]);

  // Si no hay errores o no se debe mostrar la validación, no renderizamos nada
  if (!showValidation || validationResult.valid) {
    return null;
  }

  return (
    <ValidationErrorsDisplay 
      errors={validationResult.errors}
      className={className}
    />
  );
}; 