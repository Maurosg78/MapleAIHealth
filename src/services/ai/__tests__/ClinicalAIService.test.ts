import { clinicalAIService } from '../ClinicalAIService';
import { MedicalSpecialty, AIContext } from '../types';

describe('ClinicalAIService', () => {
  const testContext: AIContext = {
    specialty: 'physiotherapy',
    currentSection: 'SOAP - Subjective',
    patientContext: {
      patientId: 'test-patient-id'
    }
  };

  beforeEach(() => {
    // Configurar el servicio antes de cada prueba
    clinicalAIService.setApiKey('test_api_key');
    clinicalAIService.setContext(testContext);
  });

  describe('processQuery', () => {
    it('debería rechazar si no hay API key configurada', async () => {
      clinicalAIService.setApiKey('');
      await expect(clinicalAIService.processQuery('test query'))
        .rejects
        .toThrow('API key no configurada');
    });

    it('debería rechazar si no hay contexto configurado', async () => {
      // @ts-ignore - Forzamos null para probar el caso de error
      clinicalAIService.setContext(undefined);
      await expect(clinicalAIService.processQuery('test query'))
        .rejects
        .toThrow('Contexto no inicializado');
    });
  });

  describe('getSuggestions', () => {
    it('debería devolver un array de sugerencias', async () => {
      const suggestions = await clinicalAIService.getSuggestions({});
      expect(Array.isArray(suggestions)).toBe(true);
      expect(suggestions.length).toBeGreaterThan(0);
    });
  });

  describe('validateClinicalData', () => {
    it('debería validar datos clínicos correctamente', async () => {
      const result = await clinicalAIService.validateClinicalData({});
      expect(result).toHaveProperty('isValid');
      expect(result).toHaveProperty('suggestions');
    });
  });
}); 