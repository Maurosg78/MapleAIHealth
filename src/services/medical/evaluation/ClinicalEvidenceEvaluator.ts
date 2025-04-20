import { ClinicalEvidence, EvidenceSource } from '../../../types/clinicalDashboard';
import { EvidenceLevel } from '../../clinicalRules';

export interface EvaluationCriteria {
  sourceReliability: number;  // 0-1
  evidenceLevel: EvidenceLevel;
  relevance: number;         // 0-1
  recentness: number;        // 0-1
  methodologyQuality: number; // 0-1
}

export interface EvaluationResult {
  score: number;            // 0-1
  confidence: number;       //0-1
  criteria: EvaluationCriteria;
  recommendations: string[];
  limitations: string[];
}

export class ClinicalEvidenceEvaluator {
  private static instance: ClinicalEvidenceEvaluator;

  private constructor() {}

  public static getInstance(): ClinicalEvidenceEvaluator {
    if (!ClinicalEvidenceEvaluator.instance) {
      ClinicalEvidenceEvaluator.instance = new ClinicalEvidenceEvaluator();
    }
    return ClinicalEvidenceEvaluator.instance;
  }

  /**
   * Evalúa una pieza de evidencia clínica
   */
  public evaluateEvidence(evidence: ClinicalEvidence, source: EvidenceSource): EvaluationResult {
    const criteria = this.evaluateCriteria(evidence, source);
    const score = this.calculateScore(criteria);
    const confidence = this.calculateConfidence(criteria);
    
    return {
      score,
      confidence,
      criteria,
      recommendations: this.generateRecommendations(criteria),
      limitations: this.identifyLimitations(criteria)
    };
  }

  /**
   * Evalúa los criterios individuales de la evidencia
   */
  private evaluateCriteria(evidence: ClinicalEvidence, source: EvidenceSource): EvaluationCriteria {
    return {
      sourceReliability: this.evaluateSourceReliability(source),
      evidenceLevel: this.determineEvidenceLevel(evidence, source),
      relevance: this.evaluateRelevance(evidence),
      recentness: this.evaluateRecentness(evidence),
      methodologyQuality: this.evaluateMethodology(evidence, source)
    };
  }

  /**
   * Evalúa la fiabilidad de la fuente
   */
  private evaluateSourceReliability(source: EvidenceSource): number {
    const reliabilityFactors = {
      'journal': 0.9,
      'systematic_review': 1.0,
      'meta_analysis': 0.95,
      'guideline': 0.85,
      'study': 0.8,
      'expert_opinion': 0.6,
      'other': 0.4
    };

    const baseReliability = reliabilityFactors[source.type] || 0.4;
    const verificationBonus = source.verificationStatus === 'verified' ? 0.1 : 0;
    
    return Math.min(1, baseReliability + verificationBonus);
  }

  /**
   * Determina el nivel de evidencia
   */
  private determineEvidenceLevel(evidence: ClinicalEvidence, source: EvidenceSource): EvidenceLevel {
    if (source.type === 'systematic_review' || source.type === 'meta_analysis') {
      return EvidenceLevel.HIGH;
    }
    
    if (source.type === 'journal' && source.reliability >= 4) {
      return EvidenceLevel.HIGH;
    }
    
    if (source.type === 'study' || (source.type === 'journal' && source.reliability >= 3)) {
      return EvidenceLevel.MODERATE;
    }
    
    if (source.type === 'guideline' || source.type === 'expert_opinion') {
      return EvidenceLevel.LOW;
    }
    
    return EvidenceLevel.VERY_LOW;
  }

  /**
   * Evalúa la relevancia de la evidencia
   */
  private evaluateRelevance(evidence: ClinicalEvidence): number {
    // Usar el score de relevancia existente como base
    let relevanceScore = evidence.relevanceScore / 100;
    
    // Ajustar basado en otros factores
    if (evidence.conditionTags.length > 0) relevanceScore *= 1.1;
    if (evidence.treatmentTags.length > 0) relevanceScore *= 1.1;
    if (evidence.categoryTags.length > 0) relevanceScore *= 1.05;
    
    return Math.min(1, relevanceScore);
  }

  /**
   * Evalúa la actualidad de la evidencia
   */
  private evaluateRecentness(evidence: ClinicalEvidence): number {
    const publicationDate = new Date(evidence.lastUpdated);
    const now = new Date();
    const ageInYears = (now.getTime() - publicationDate.getTime()) / (1000 * 60 * 60 * 24 * 365);
    
    if (ageInYears <= 1) return 1;
    if (ageInYears <= 3) return 0.8;
    if (ageInYears <= 5) return 0.6;
    if (ageInYears <= 10) return 0.4;
    return 0.2;
  }

  /**
   * Evalúa la calidad metodológica
   */
  private evaluateMethodology(evidence: ClinicalEvidence, source: EvidenceSource): number {
    let methodologyScore = 0.5; // Puntuación base

    // Ajustar según el tipo de fuente
    if (source.type === 'systematic_review' || source.type === 'meta_analysis') {
      methodologyScore += 0.3;
    }

    // Ajustar según la verificación
    if (source.verificationStatus === 'verified') {
      methodologyScore += 0.2;
    }

    return Math.min(1, methodologyScore);
  }

  /**
   * Calcula la puntuación general
   */
  private calculateScore(criteria: EvaluationCriteria): number {
    const weights = {
      sourceReliability: 0.25,
      evidenceLevel: 0.25,
      relevance: 0.2,
      recentness: 0.15,
      methodologyQuality: 0.15
    };

    return (
      criteria.sourceReliability * weights.sourceReliability +
      (criteria.evidenceLevel * weights.evidenceLevel) +
      criteria.relevance * weights.relevance +
      criteria.recentness * weights.recentness +
      criteria.methodologyQuality * weights.methodologyQuality
    );
  }

  /**
   * Calcula el nivel de confianza en la evaluación
   */
  private calculateConfidence(criteria: EvaluationCriteria): number {
    // La confianza se basa en qué tan completa y verificable es la información
    let confidence = 0.5; // Base confidence

    if (criteria.sourceReliability > 0.8) confidence += 0.2;
    if (criteria.evidenceLevel >= EvidenceLevel.HIGH) confidence += 0.2;
    if (criteria.methodologyQuality > 0.7) confidence += 0.1;

    return Math.min(1, confidence);
  }

  /**
   * Genera recomendaciones basadas en la evaluación
   */
  private generateRecommendations(criteria: EvaluationCriteria): string[] {
    const recommendations: string[] = [];

    const totalScore = this.calculateScore(criteria);
    
    if (totalScore >= 0.8) {
      recommendations.push('Esta evidencia es altamente confiable y puede ser utilizada para la toma de decisiones clínicas.');
    }

    if (criteria.recentness < 0.6) {
      recommendations.push('Considerar buscar evidencia más reciente para complementar esta información.');
    }

    if (criteria.methodologyQuality < 0.7) {
      recommendations.push('Se recomienda contrastar con otras fuentes de mayor calidad metodológica.');
    }

    return recommendations;
  }

  /**
   * Identifica limitaciones en la evidencia
   */
  private identifyLimitations(criteria: EvaluationCriteria): string[] {
    const limitations: string[] = [];

    if (criteria.evidenceLevel < EvidenceLevel.HIGH) {
      limitations.push('El nivel de evidencia no es el más alto disponible.');
    }

    if (criteria.recentness < 0.4) {
      limitations.push('La evidencia podría estar desactualizada.');
    }

    if (criteria.methodologyQuality < 0.5) {
      limitations.push('La calidad metodológica tiene limitaciones significativas.');
    }

    return limitations;
  }
} 