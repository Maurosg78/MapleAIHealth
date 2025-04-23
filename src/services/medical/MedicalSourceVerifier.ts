import { EvidenceSource } from '../../types/clinicalDashboard';;;;;
import { ReliabilityScorer } from './scoring/ReliabilityScorer';;;;;
import { SourceVerificationCache } from './cache/SourceVerificationCache';;;;;
import { PubMedSource } from './sources/PubMedSource';;;;;
import { CochraneSource } from './sources/CochraneSource';;;;;
import { medicalConfig } from '../../config/medicalConfig';;;;;

export interface VerificationResult {
  source: EvidenceSource;
  score: number;
  reliability: number;
  lastVerified: Date;
  verificationDetails: {
    sourceType: string;
    publicationDate?: Date;
    peerReviewed: boolean;
    impactFactor?: number;
    citations?: number;
    conflictsOfInterest?: string[];
    externalVerification?: {
      exists: boolean;
      source: string;
      details?: {
        title: string;
        authors: string[];
        abstract?: string;
        publicationDate?: Date;
        journal: string;
      };
    };
  };
}

export interface VerificationOptions {
  forceRefresh?: boolean;
  includeDetails?: boolean;
  minReliability?: number;
  verifyExternally?: boolean;
}

export class MedicalSourceVerifier {
  private static instance: MedicalSourceVerifier;
  private scorer: ReliabilityScorer;
  private cache: SourceVerificationCache;
  private verificationInProgress: Map<string, Promise<VerificationResult>>;
  private pubmedSource: PubMedSource;
  private cochraneSource: CochraneSource;

  private constructor() {
    this.scorer = new ReliabilityScorer();
    this.cache = new SourceVerificationCache(medicalConfig.cache.ttl, medicalConfig.cache.maxSize);
    this.verificationInProgress = new Map();
    this.pubmedSource = new PubMedSource();
    this.cochraneSource = new CochraneSource(medicalConfig.cochrane.apiKey);
  }

  public static getInstance(): MedicalSourceVerifier {
    if (!MedicalSourceVerifier.instance) {
      MedicalSourceVerifier.instance = new MedicalSourceVerifier();
    }
    return MedicalSourceVerifier.instance;
  }

  /**
   * Verifica una fuente médica
   */
  public async verifySource(
    source: EvidenceSource,
    options: VerificationOptions = {}
  ): Promise<VerificationResult> {
    // Verificar si ya está en proceso de verificación
    const cacheKey = this.generateCacheKey(source);
    if (this.verificationInProgress.has(cacheKey)) {
      return this.verificationInProgress.get(cacheKey)!;
    }

    // Verificar caché si no se fuerza actualización
    if (!options.forceRefresh) {
      const cachedResult = await this.cache.get(cacheKey);
      if (cachedResult) {
        return cachedResult;
      }
    }

    // Iniciar verificación
    const verificationPromise = this.performVerification(source, options);
    this.verificationInProgress.set(cacheKey, verificationPromise);

    try {
      const result = await verificationPromise;
      await this.cache.set(cacheKey, result);
      return result;
    } finally {
      this.verificationInProgress.delete(cacheKey);
    }
  }

  /**
   * Realiza la verificación de una fuente
   */
  private async performVerification(
    source: EvidenceSource,
    options: VerificationOptions
  ): Promise<VerificationResult> {
    // Calcular puntaje base
    const score = await this.scorer.calculateScore(source);
    const reliability = this.scorer.calculateReliability(score);

    // Verificar externamente si se solicita
    let externalVerification;
    if (options.verifyExternally) {
      externalVerification = await this.verifyExternally(source);
    }

    return {
      source,
      score,
      reliability,
      lastVerified: new Date(),
      verificationDetails: {
        sourceType: source.type,
        peerReviewed: true, // TODO: Verificar realmente
        conflictsOfInterest: [], // TODO: Extraer de la fuente
        externalVerification
      }
    };
  }

  /**
   * Verifica la fuente en fuentes externas
   */
  private async verifyExternally(source: EvidenceSource) {
    // Intentar verificar en PubMed primero
    const pubmedResult = await this.pubmedSource.verify(source);
    if (pubmedResult.exists) {
      return {
        exists: true,
        source: 'PubMed',
        details: pubmedResult.details
      };
    }

    // Si no se encuentra en PubMed, intentar en Cochrane
    const cochraneResult = await this.cochraneSource.verify(source);
    if (cochraneResult.exists) {
      return {
        exists: true,
        source: 'Cochrane',
        details: cochraneResult.details
      };
    }

    return {
      exists: false,
      source: 'none'
    };
  }

  /**
   * Genera una clave única para el caché
   */
  private generateCacheKey(source: EvidenceSource): string {
    return `${source.id}-${source.type}-${source.lastUpdated}`;
  }

  /**
   * Limpia el caché de verificación
   */
  public async clearCache(): Promise<void> {
    await this.cache.clear();
  }
} 