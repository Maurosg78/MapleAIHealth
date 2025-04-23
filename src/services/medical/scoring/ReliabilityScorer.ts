import { EvidenceSource } from '../../../types/clinicalDashboard';;;;;

export interface ScoringFactors {
  sourceType: number;
  peerReviewed: number;
  impactFactor?: number;
  citations?: number;
  publicationDate?: number;
  conflictsOfInterest?: number;
}

export class ReliabilityScorer {
  private readonly defaultFactors: ScoringFactors = {
    sourceType: 0.3,
    peerReviewed: 0.25,
    impactFactor: 0.2,
    citations: 0.15,
    publicationDate: 0.1,
    conflictsOfInterest: -0.1
  };

  /**
   * Calcula el puntaje de fiabilidad para una fuente
   */
  public async calculateScore(source: EvidenceSource): Promise<number> {
    const factors = await this.evaluateFactors(source);
    return this.computeScore(factors);
  }

  /**
   * Calcula la fiabilidad basada en el puntaje
   */
  public calculateReliability(score: number): number {
    // Escala de 1-5 basada en el puntaje
    if (score >= 0.9) return 5;
    if (score >= 0.8) return 4;
    if (score >= 0.6) return 3;
    if (score >= 0.4) return 2;
    return 1;
  }

  /**
   * Evalúa los factores de puntuación para una fuente
   */
  private async evaluateFactors(source: EvidenceSource): Promise<ScoringFactors> {
    const factors: ScoringFactors = { ...this.defaultFactors };

    // Evaluar tipo de fuente
    factors.sourceType = this.evaluateSourceType(source.type);

    // TODO: Implementar evaluación real de otros factores
    // Por ahora usamos valores por defecto
    factors.peerReviewed = 1;
    factors.impactFactor = 0.8;
    factors.citations = 0.7;
    factors.publicationDate = this.evaluatePublicationDate(source.lastUpdated);
    factors.conflictsOfInterest = 0;

    return factors;
  }

  /**
   * Evalúa el tipo de fuente
   */
  private evaluateSourceType(type: string): number {
    const typeScores: Record<string, number> = {
      'systematic_review': 1.0,
      'meta_analysis': 1.0,
      'guideline': 0.9,
      'journal': 0.8,
      'study': 0.7,
      'expert_opinion': 0.5,
      'other': 0.3
    };

    return typeScores[type] || 0.3;
  }

  /**
   * Evalúa la fecha de publicación
   */
  private evaluatePublicationDate(lastUpdated: string): number {
    const publicationDate = new Date(lastUpdated);
    const now = new Date();
    const yearsDiff = (now.getTime() - publicationDate.getTime()) / (1000 * 60 * 60 * 24 * 365);

    if (yearsDiff <= 1) return 1.0;
    if (yearsDiff <= 3) return 0.8;
    if (yearsDiff <= 5) return 0.6;
    if (yearsDiff <= 10) return 0.4;
    return 0.2;
  }

  /**
   * Calcula el puntaje final basado en los factores
   */
  private computeScore(factors: ScoringFactors): number {
    let score = 0;
    let totalWeight = 0;

    // Calcular puntaje ponderado
    for (const [factor, weight] of Object.entries(this.defaultFactors)) {
      const value = factors[factor as keyof ScoringFactors];
      if (value !== undefined) {
        score += value * weight;
        totalWeight += Math.abs(weight);
      }
    }

    // Normalizar el puntaje
    return totalWeight > 0 ? score / totalWeight : 0;
  }
} 