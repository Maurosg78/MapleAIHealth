import { AISuggestion } from '../AIHealthService';
import { EvidenceLevel, ClinicalRelevance } from '../clinicalRules';
import { ApiClient } from '../api/ApiClient';

export interface FeedbackData {
  suggestionId: string;
  isHelpful: boolean;
  timestamp: Date;
  therapistId: string;
  comments?: string;
  metadata: {
    specialty: string;
    section: string;
    confidence: number;
    evidenceLevel: EvidenceLevel;
    clinicalRelevance: ClinicalRelevance;
  };
}

export interface FeedbackStats {
  totalFeedback: number;
  helpfulFeedback: number;
  unhelpfulFeedback: number;
  averageConfidence: number;
  specialtyBreakdown: Record<string, {
    total: number;
    helpful: number;
    unhelpful: number;
  }>;
  sectionBreakdown: Record<string, {
    total: number;
    helpful: number;
    unhelpful: number;
  }>;
}

export interface UserFeedback {
  id: string;
  content: string;
  rating: number;
  timestamp: Date;
}

export interface Metrics {
  feedbackSent: number;
  feedbackErrors: number;
}

export class FeedbackManager {
  private static instance: FeedbackManager;
  private feedbackData: Map<string, FeedbackData[]>;
  private feedbackStats: Map<string, FeedbackStats>;
  private feedbackQueue: UserFeedback[] = [];
  private apiClient: ApiClient;
  private metrics: Metrics;

  constructor(apiClient: ApiClient) {
    this.feedbackData = new Map();
    this.feedbackStats = new Map();
    this.apiClient = apiClient;
    this.metrics = {
      feedbackSent: 0,
      feedbackErrors: 0
    };
  }

  public static getInstance(): FeedbackManager {
    if (!FeedbackManager.instance) {
      FeedbackManager.instance = new FeedbackManager(new ApiClient());
    }
    return FeedbackManager.instance;
  }

  public recordFeedback(
    suggestion: AISuggestion,
    isHelpful: boolean,
    therapistId: string,
    comments?: string
  ): void {
    const feedback: FeedbackData = {
      suggestionId: suggestion.id,
      isHelpful,
      timestamp: new Date(),
      therapistId,
      comments,
      metadata: {
        specialty: suggestion.metadata?.specialtySpecific ? 'physiotherapy' : 'general',
        section: suggestion.section,
        confidence: suggestion.confidence || 0,
        evidenceLevel: suggestion.metadata?.evidenceLevel || EvidenceLevel.VERY_LOW,
        clinicalRelevance: suggestion.metadata?.clinicalRelevance || ClinicalRelevance.OPTIONAL
      }
    };

    // Almacenar feedback individual
    if (!this.feedbackData.has(suggestion.id)) {
      this.feedbackData.set(suggestion.id, []);
    }
    this.feedbackData.get(suggestion.id)?.push(feedback);

    // Actualizar estadísticas
    this.updateStats(suggestion.id, feedback);
  }

  private updateStats(suggestionId: string, feedback: FeedbackData): void {
    const { specialty, section } = feedback.metadata;

    // Inicializar estadísticas si no existen
    if (!this.feedbackStats.has(suggestionId)) {
      this.feedbackStats.set(suggestionId, {
        totalFeedback: 0,
        helpfulFeedback: 0,
        unhelpfulFeedback: 0,
        averageConfidence: 0,
        specialtyBreakdown: {},
        sectionBreakdown: {}
      });
    }

    const stats = this.feedbackStats.get(suggestionId)!;

    // Actualizar estadísticas generales
    stats.totalFeedback++;
    if (feedback.isHelpful) {
      stats.helpfulFeedback++;
    } else {
      stats.unhelpfulFeedback++;
    }
    stats.averageConfidence = (stats.averageConfidence * (stats.totalFeedback - 1) + feedback.metadata.confidence) / stats.totalFeedback;

    // Actualizar desglose por especialidad
    if (!stats.specialtyBreakdown[specialty]) {
      stats.specialtyBreakdown[specialty] = { total: 0, helpful: 0, unhelpful: 0 };
    }
    const specialtyStats = stats.specialtyBreakdown[specialty];
    specialtyStats.total++;
    if (feedback.isHelpful) {
      specialtyStats.helpful++;
    } else {
      specialtyStats.unhelpful++;
    }

    // Actualizar desglose por sección
    if (!stats.sectionBreakdown[section]) {
      stats.sectionBreakdown[section] = { total: 0, helpful: 0, unhelpful: 0 };
    }
    const sectionStats = stats.sectionBreakdown[section];
    sectionStats.total++;
    if (feedback.isHelpful) {
      sectionStats.helpful++;
    } else {
      sectionStats.unhelpful++;
    }
  }

  public getFeedbackStats(suggestionId: string): FeedbackStats | undefined {
    return this.feedbackStats.get(suggestionId);
  }

  public getFeedbackHistory(suggestionId: string): FeedbackData[] | undefined {
    return this.feedbackData.get(suggestionId);
  }

  public getEffectivenessScore(suggestionId: string): number {
    const stats = this.feedbackStats.get(suggestionId);
    if (!stats || stats.totalFeedback === 0) return 0;
    return stats.helpfulFeedback / stats.totalFeedback;
  }

  public getSpecialtyEffectiveness(specialty: string): number {
    let total = 0;
    let helpful = 0;

    for (const stats of this.feedbackStats.values()) {
      const specialtyStats = stats.specialtyBreakdown[specialty];
      if (specialtyStats) {
        total += specialtyStats.total;
        helpful += specialtyStats.helpful;
      }
    }

    return total > 0 ? helpful / total : 0;
  }

  public getSectionEffectiveness(section: string): number {
    let total = 0;
    let helpful = 0;

    for (const stats of this.feedbackStats.values()) {
      const sectionStats = stats.sectionBreakdown[section];
      if (sectionStats) {
        total += sectionStats.total;
        helpful += sectionStats.helpful;
      }
    }

    return total > 0 ? helpful / total : 0;
  }

  public async submitFeedback(feedback: UserFeedback): Promise<void> {
    this.feedbackQueue.push(feedback);
    await this.processFeedbackQueue();
  }

  private async processFeedbackQueue(): Promise<void> {
    try {
      const feedback = this.feedbackQueue.shift();
      if (feedback) {
        await this.apiClient.post('/feedback', feedback);
        this.metrics.feedbackSent++;
      }
    } catch {
      this.metrics.feedbackErrors++;
      console.error('Error al procesar el feedback');
    }
  }

  private async retryFailedFeedback(): Promise<void> {
    try {
      const feedback = this.feedbackQueue[0];
      if (feedback) {
        await this.apiClient.post('/feedback', feedback);
        this.feedbackQueue.shift();
        this.metrics.feedbackSent++;
      }
    } catch {
      this.metrics.feedbackErrors++;
      console.error('Error al reintentar el envío de feedback');
    }
  }

  public getMetrics(): Metrics {
    return { ...this.metrics };
  }
} 