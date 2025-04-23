import { ClinicalEvidence } from '../../../types/clinicalDashboard';;;;;

export enum EvidenceLevel {
  A = 'A', // Alta calidad - Meta-análisis, revisiones sistemáticas
  B = 'B', // Buena calidad - Ensayos clínicos
  C = 'C', // Moderada calidad - Estudios observacionales
  D = 'D'  // Baja calidad - Opinión de expertos
}

export interface EvidenceScore {
  level: EvidenceLevel;
  score: number;
  confidence: number;
  criteria: string[];
}

export class EvidenceEvaluationService {
  private static instance: EvidenceEvaluationService;

  private constructor() { super(); }

  public static getInstance(): EvidenceEvaluationService {
    if (!EvidenceEvaluationService.instance) {
      EvidenceEvaluationService.instance = new EvidenceEvaluationService();
    }
    return EvidenceEvaluationService.instance;
  }

  public evaluateEvidence(evidence: ClinicalEvidence): EvidenceScore {
    const methodologyScore = this.evaluateMethodology(evidence);
    const sourceScore = this.evaluateSource(evidence);
    const relevanceScore = this.evaluateRelevance(evidence);
    
    const totalScore = (methodologyScore + sourceScore + relevanceScore) / 3;
    const level = this.determineEvidenceLevel(totalScore);
    
    return {
      level,
      score: totalScore,
      confidence: this.calculateConfidence(evidence),
      criteria: this.getEvaluationCriteria(evidence)
    };
  }

  private evaluateMethodology(evidence: ClinicalEvidence): number {
    let score = 0;
    const criteria = [];

    // Evaluar diseño del estudio
    if (evidence.categoryTags.includes('meta_analysis')) {
      score += 5;
      criteria.push('Meta-análisis');
    } else if (evidence.categoryTags.includes('systematic_review')) {
      score += 4;
      criteria.push('Revisión sistemática');
    } else if (evidence.categoryTags.includes('rct')) {
      score += 3;
      criteria.push('Ensayo clínico aleatorizado');
    }

    // Evaluar tamaño de muestra y metodología
    if (evidence.reliability >= 4) {
      score += 2;
      criteria.push('Alta fiabilidad metodológica');
    }

    return (score / 7) * 100; // Normalizar a escala 0-100
  }

  private evaluateSource(evidence: ClinicalEvidence): number {
    let score = 0;

    // Evaluar fuente de publicación
    if (evidence.source.toLowerCase().includes('journal')) {
      score += 3;
    }

    // Evaluar año de publicación
    const publicationDate = new Date(evidence.lastUpdated);
    const yearsOld = new Date().getFullYear() - publicationDate.getFullYear();
    if (yearsOld <= 2) score += 2;
    else if (yearsOld <= 5) score += 1;

    return (score / 5) * 100; // Normalizar a escala 0-100
  }

  private evaluateRelevance(evidence: ClinicalEvidence): number {
    return evidence.relevanceScore || 0;
  }

  private determineEvidenceLevel(score: number): EvidenceLevel {
    if (score >= 80) return EvidenceLevel.A;
    if (score >= 60) return EvidenceLevel.B;
    if (score >= 40) return EvidenceLevel.C;
    return EvidenceLevel.D;
  }

  private calculateConfidence(evidence: ClinicalEvidence): number {
    // Implementar cálculo de intervalo de confianza
    return Math.min(evidence.reliability * 20, 100);
  }

  private getEvaluationCriteria(evidence: ClinicalEvidence): string[] {
    const criteria: string[] = [];
    
    // Criterios metodológicos
    if (evidence.categoryTags.includes('meta_analysis')) {
      criteria.push('Meta-análisis de alta calidad');
    }
    if (evidence.reliability >= 4) {
      criteria.push('Alta fiabilidad metodológica');
    }
    
    // Criterios de relevancia
    if (evidence.relevanceScore >= 80) {
      criteria.push('Alta relevancia clínica');
    }
    
    // Criterios de actualidad
    const publicationDate = new Date(evidence.lastUpdated);
    const yearsOld = new Date().getFullYear() - publicationDate.getFullYear();
    if (yearsOld <= 2) {
      criteria.push('Evidencia reciente (<2 años)');
    }
    
    return criteria;
  }
} 