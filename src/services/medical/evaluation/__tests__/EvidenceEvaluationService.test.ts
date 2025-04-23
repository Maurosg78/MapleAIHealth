import { EvidenceEvaluationService, EvidenceLevel } from '../EvidenceEvaluationService';;;;;
import { ClinicalEvidence } from '../../../../types/clinicalDashboard';;;;;

describe('EvidenceEvaluationService', () => {
  let service: EvidenceEvaluationService;
  let mockEvidence: ClinicalEvidence;

  beforeEach(() => {
    service = EvidenceEvaluationService.getInstance();
    mockEvidence = {
      id: 'test-1',
      title: 'Test Evidence',
      summary: 'Test Summary',
      content: 'Test Content',
      source: 'Medical Journal',
      reliability: 4,
      relevanceScore: 85,
      conditionTags: ['condition1'],
      treatmentTags: ['treatment1'],
      categoryTags: ['meta_analysis'],
      lastUpdated: new Date().toISOString()
    };
  });

  describe('evaluateEvidence', () => {
    it('debería asignar nivel A a evidencia de alta calidad', () => {
      const result = service.evaluateEvidence(mockEvidence);
      expect(result.level).toBe(EvidenceLevel.A);
      expect(result.score).toBeGreaterThanOrEqual(80);
    });

    it('debería asignar nivel B a evidencia de buena calidad', () => {
      mockEvidence.categoryTags = ['systematic_review'];
      mockEvidence.reliability = 3;
      const result = service.evaluateEvidence(mockEvidence);
      expect(result.level).toBe(EvidenceLevel.B);
      expect(result.score).toBeGreaterThanOrEqual(60);
    });

    it('debería asignar nivel C a evidencia de calidad moderada', () => {
      mockEvidence.categoryTags = ['observational_study'];
      mockEvidence.reliability = 2;
      const result = service.evaluateEvidence(mockEvidence);
      expect(result.level).toBe(EvidenceLevel.C);
      expect(result.score).toBeGreaterThanOrEqual(40);
    });

    it('debería asignar nivel D a evidencia de baja calidad', () => {
      mockEvidence.categoryTags = ['expert_opinion'];
      mockEvidence.reliability = 1;
      mockEvidence.relevanceScore = 30;
      const result = service.evaluateEvidence(mockEvidence);
      expect(result.level).toBe(EvidenceLevel.D);
      expect(result.score).toBeLessThan(40);
    });
  });

  describe('evaluación de criterios', () => {
    it('debería incluir criterios metodológicos', () => {
      const result = service.evaluateEvidence(mockEvidence);
      expect(result.criteria).toContain('Meta-análisis de alta calidad');
      expect(result.criteria).toContain('Alta fiabilidad metodológica');
    });

    it('debería evaluar la actualidad de la evidencia', () => {
      const result = service.evaluateEvidence(mockEvidence);
      expect(result.criteria).toContain('Evidencia reciente (<2 años)');
    });

    it('debería evaluar la relevancia clínica', () => {
      const result = service.evaluateEvidence(mockEvidence);
      expect(result.criteria).toContain('Alta relevancia clínica');
    });
  });

  describe('cálculo de confianza', () => {
    it('debería calcular correctamente el nivel de confianza', () => {
      const result = service.evaluateEvidence(mockEvidence);
      expect(result.confidence).toBe(80); // 4 * 20 = 80
    });

    it('debería limitar el nivel de confianza a 100', () => {
      mockEvidence.reliability = 6;
      const result = service.evaluateEvidence(mockEvidence);
      expect(result.confidence).toBe(100);
    });
  });
}); 