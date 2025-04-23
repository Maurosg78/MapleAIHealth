import { ClinicalEvidenceEvaluator } from '../ClinicalEvidenceEvaluator';;;;;
import { ClinicalEvidence, EvidenceSource } from '../../../../types/clinicalDashboard';;;;;
import { EvidenceLevel } from '../../../clinicalRules';;;;;

describe('ClinicalEvidenceEvaluator', () => {
  let evaluator: ClinicalEvidenceEvaluator;
  
  beforeEach(() => {
    evaluator = ClinicalEvidenceEvaluator.getInstance();
  });

  describe('evaluateEvidence', () => {
    it('debería evaluar correctamente una evidencia de alta calidad', () => {
      const evidence: ClinicalEvidence = {
        id: '1',
        title: 'Estudio de alta calidad',
        summary: 'Resumen del estudio',
        content: 'Contenido detallado',
        source: 'PubMed Central',
        reliability: 5,
        relevanceScore: 90,
        conditionTags: ['diabetes'],
        treatmentTags: ['insulin'],
        categoryTags: ['endocrinology'],
        lastUpdated: new Date().toISOString()
      };

      const source: EvidenceSource = {
        id: '1',
        name: 'PubMed Central',
        type: 'systematic_review',
        reliability: 5,
        verificationStatus: 'verified',
        lastUpdated: new Date().toISOString()
      };

      const result = evaluator.evaluateEvidence(evidence, source);

      expect(result.score).toBeGreaterThan(0.8);
      expect(result.confidence).toBeGreaterThan(0.8);
      expect(result.criteria.evidenceLevel).toBe(EvidenceLevel.HIGH);
      expect(result.recommendations.length).toBeGreaterThan(0);
      expect(result.limitations.length).toBe(0);
    });

    it('debería evaluar correctamente una evidencia de baja calidad', () => {
      const evidence: ClinicalEvidence = {
        id: '2',
        title: 'Opinión de experto',
        summary: 'Resumen de la opinión',
        content: 'Contenido detallado',
        source: 'Blog médico',
        reliability: 2,
        relevanceScore: 50,
        conditionTags: ['headache'],
        treatmentTags: ['rest'],
        categoryTags: ['general'],
        lastUpdated: '2020-01-01'
      };

      const source: EvidenceSource = {
        id: '2',
        name: 'Blog médico',
        type: 'expert_opinion',
        reliability: 2,
        verificationStatus: 'unverified',
        lastUpdated: '2020-01-01'
      };

      const result = evaluator.evaluateEvidence(evidence, source);

      expect(result.score).toBeLessThan(0.6);
      expect(result.confidence).toBeLessThan(0.7);
      expect(result.criteria.evidenceLevel).toBe(EvidenceLevel.LOW);
      expect(result.recommendations.length).toBeGreaterThan(1);
      expect(result.limitations.length).toBeGreaterThan(1);
    });
  });

  describe('evaluación de criterios individuales', () => {
    it('debería evaluar correctamente la fiabilidad de la fuente', () => {
      const evidence: ClinicalEvidence = {
        id: '3',
        title: 'Estudio clínico',
        summary: 'Resumen del estudio',
        content: 'Contenido detallado',
        source: 'Journal of Medicine',
        reliability: 4,
        relevanceScore: 85,
        conditionTags: ['arthritis'],
        treatmentTags: ['exercise'],
        categoryTags: ['rheumatology'],
        lastUpdated: new Date().toISOString()
      };

      const source: EvidenceSource = {
        id: '3',
        name: 'Journal of Medicine',
        type: 'journal',
        reliability: 4,
        verificationStatus: 'verified',
        lastUpdated: new Date().toISOString()
      };

      const result = evaluator.evaluateEvidence(evidence, source);
      expect(result.criteria.sourceReliability).toBeGreaterThan(0.8);
    });

    it('debería evaluar correctamente la actualidad de la evidencia', () => {
      const oldEvidence: ClinicalEvidence = {
        id: '4',
        title: 'Estudio antiguo',
        summary: 'Resumen del estudio',
        content: 'Contenido detallado',
        source: 'Old Journal',
        reliability: 3,
        relevanceScore: 70,
        conditionTags: ['asthma'],
        treatmentTags: ['inhaler'],
        categoryTags: ['pulmonology'],
        lastUpdated: '2015-01-01'
      };

      const oldSource: EvidenceSource = {
        id: '4',
        name: 'Old Journal',
        type: 'journal',
        reliability: 3,
        verificationStatus: 'verified',
        lastUpdated: '2015-01-01'
      };

      const result = evaluator.evaluateEvidence(oldEvidence, oldSource);
      expect(result.criteria.recentness).toBeLessThan(0.5);
      expect(result.recommendations).toContain('Considerar buscar evidencia más reciente para complementar esta información.');
    });
  });

  describe('generación de recomendaciones', () => {
    it('debería generar recomendaciones apropiadas para evidencia de alta calidad', () => {
      const evidence: ClinicalEvidence = {
        id: '5',
        title: 'Meta-análisis reciente',
        summary: 'Resumen del meta-análisis',
        content: 'Contenido detallado',
        source: 'Cochrane Review',
        reliability: 5,
        relevanceScore: 95,
        conditionTags: ['hypertension'],
        treatmentTags: ['medication'],
        categoryTags: ['cardiology'],
        lastUpdated: new Date().toISOString()
      };

      const source: EvidenceSource = {
        id: '5',
        name: 'Cochrane Review',
        type: 'meta_analysis',
        reliability: 5,
        verificationStatus: 'verified',
        lastUpdated: new Date().toISOString()
      };

      const result = evaluator.evaluateEvidence(evidence, source);
      expect(result.recommendations).toContain('Esta evidencia es altamente confiable y puede ser utilizada para la toma de decisiones clínicas.');
    });

    it('debería identificar limitaciones apropiadas para evidencia de baja calidad', () => {
      const evidence: ClinicalEvidence = {
        id: '6',
        title: 'Reporte de caso',
        summary: 'Resumen del caso',
        content: 'Contenido detallado',
        source: 'Medical Blog',
        reliability: 2,
        relevanceScore: 40,
        conditionTags: ['rare_disease'],
        treatmentTags: ['experimental'],
        categoryTags: ['research'],
        lastUpdated: '2019-01-01'
      };

      const source: EvidenceSource = {
        id: '6',
        name: 'Medical Blog',
        type: 'other',
        reliability: 2,
        verificationStatus: 'unverified',
        lastUpdated: '2019-01-01'
      };

      const result = evaluator.evaluateEvidence(evidence, source);
      expect(result.limitations).toContain('El nivel de evidencia no es el más alto disponible.');
      expect(result.limitations).toContain('La calidad metodológica tiene limitaciones significativas.');
    });
  });
}); 