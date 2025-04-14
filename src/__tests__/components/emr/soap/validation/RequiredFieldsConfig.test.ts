import '@testing-library/jest-dom';
import { 
  validateRequiredFields, 
  getRequiredFields 
} from '../../../../../components/emr/soap/validation/RequiredFieldsConfig';
import { SubjectiveData, ObjectiveData, SpecialtyType } from '../../../../../types/clinical';

describe('RequiredFieldsConfig', () => {
  describe('getRequiredFields', () => {
    test('returns the correct fields for a given specialty and section', () => {
      const physiotherapySubjectiveFields = getRequiredFields('physiotherapy', 'subjective');
      const generalObjectiveFields = getRequiredFields('general', 'objective');
      
      // Verificar que existan campos requeridos para fisioterapia en sección subjetiva
      expect(physiotherapySubjectiveFields.length).toBeGreaterThan(0);
      
      // Verificar que alguno de los campos tenga el campo esperado
      const hasPainIntensityField = physiotherapySubjectiveFields.some(
        field => field.field === 'painIntensity'
      );
      expect(hasPainIntensityField).toBe(true);
      
      // Verificar que existan campos para medicina general en sección objetiva
      expect(generalObjectiveFields.length).toBeGreaterThan(0);
    });
    
    test('falls back to general configuration if specialty is not found', () => {
      // Esto es una prueba para una especialidad no definida específicamente
      const unknownSpecialtyFields = getRequiredFields('unknownSpecialty' as SpecialtyType, 'subjective');
      const generalFields = getRequiredFields('general', 'subjective');
      
      // Debería utilizar la configuración general como fallback
      expect(unknownSpecialtyFields).toEqual(generalFields);
    });
  });
  
  describe('validateRequiredFields', () => {
    test('validates correctly when all required fields are present', () => {
      const mockSubjectiveData: Partial<SubjectiveData> = {
        chiefComplaint: 'Dolor lumbar',
        painIntensity: 7,
        medicalHistory: 'Sin antecedentes relevantes'
      };
      
      const result = validateRequiredFields(
        mockSubjectiveData as SubjectiveData,
        'general',
        'subjective'
      );
      
      expect(result.valid).toBe(true);
      expect(result.errors.length).toBe(0);
    });
    
    test('returns errors when required fields are missing', () => {
      const mockSubjectiveData: Partial<SubjectiveData> = {
        // chiefComplaint está ausente
        painIntensity: 7
        // medicalHistory está ausente
      };
      
      const result = validateRequiredFields(
        mockSubjectiveData as SubjectiveData,
        'general',
        'subjective'
      );
      
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      
      // Verificar que los mensajes de error contienen referencias a los campos faltantes
      const errorMessages = result.errors.join(' ');
      expect(errorMessages).toContain('motivo de consulta');
      expect(errorMessages).toContain('antecedentes médicos');
    });
    
    test('validates conditional fields based on data', () => {
      // Primer caso: sin condición para activar la validación condicional
      const mockDataWithoutCondition: Partial<SubjectiveData> = {
        chiefComplaint: 'Contractura muscular', // No contiene 'dolor'
        painIntensity: 5,
        medicalHistory: 'Sin antecedentes'
      };
      
      const result1 = validateRequiredFields(
        mockDataWithoutCondition as SubjectiveData,
        'physiotherapy',
        'subjective'
      );
      
      // La validación debería pasar aunque painLocation no esté presente
      // porque la condición no se cumple (chiefComplaint no contiene 'dolor')
      expect(result1.valid).toBe(true);
      
      // Segundo caso: con condición que activa la validación condicional
      const mockDataWithCondition: Partial<SubjectiveData> = {
        chiefComplaint: 'Dolor en la zona lumbar', // Contiene 'dolor'
        painIntensity: 7,
        medicalHistory: 'Sin antecedentes'
        // painLocation está ausente
      };
      
      const result2 = validateRequiredFields(
        mockDataWithCondition as SubjectiveData,
        'physiotherapy',
        'subjective'
      );
      
      // La validación debería fallar porque painLocation es requerido
      // cuando chiefComplaint contiene 'dolor'
      expect(result2.valid).toBe(false);
      expect(result2.errors).toContain('La localización del dolor es obligatoria para dolor musculoesquelético');
    });
    
    test('handles empty objects and arrays correctly', () => {
      const mockObjectiveData: Partial<ObjectiveData> = {
        observation: 'Normal',
        palpation: 'Sin hallazgos',
        rangeOfMotion: {} // Objeto vacío
      };
      
      const result = validateRequiredFields(
        mockObjectiveData as ObjectiveData,
        'physiotherapy',
        'objective'
      );
      
      // Debería fallar porque rangeOfMotion es un objeto vacío
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Es necesario incluir al menos una medición de rango de movimiento');
    });
  });
}); 