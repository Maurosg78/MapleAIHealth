import { useState, useCallback } from 'react';
import { clinicalCopilotService } from '../services/ai/ClinicalCopilotService';
import { UnstructuredNote } from '../services/ai/types';
import {
  ClinicalRecommendationCardProps,
  RecommendationType,
  UrgencyLevel,
  EvidenceLevel
} from '../components/recommendations/ClinicalRecommendationCard';

export interface PatientContext {
  patientId: string;
  age?: number;
  gender?: string;
  mainCondition?: string;
  allergies?: string[];
  currentMedications?: string[];
}

export interface UseClinicalRecommendationsOptions {
  maxSuggestions?: number;
  minConfidence?: number;
  includeContraindications?: boolean;
  includeEvidenceDetails?: boolean;
}

export interface UseClinicalRecommendationsResult {
  recommendations: ClinicalRecommendationCardProps[];
  loading: boolean;
  error: string | null;
  fetchRecommendations: (
    notes: UnstructuredNote[],
    patientContext: PatientContext
  ) => Promise<void>;
  clearRecommendations: () => void;
}

// Definir los tipos para los objetos de sugerencias y fuentes
interface ClinicalSuggestion {
  id: string;
  title: string;
  description?: string;
  recommendation?: string;
  type: string;
  urgency: string;
  confidence: number;
  evidenceLevel?: string;
  sources?: EvidenceSource[];
  contraindications?: Contraindication[];
}

interface EvidenceSource {
  id: string;
  title: string;
  publication?: string;
  year?: number;
  verified?: boolean;
}

interface Contraindication {
  id?: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
}

/**
 * Hook personalizado para obtener recomendaciones clínicas
 * basadas en notas médicas no estructuradas y contexto del paciente
 */
export const useClinicalRecommendations = (
  options: UseClinicalRecommendationsOptions = {}
): UseClinicalRecommendationsResult => {
  const [recommendations, setRecommendations] = useState<ClinicalRecommendationCardProps[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Función para transformar sugerencias del servicio al formato de la UI
  const transformSuggestionsToRecommendations = useCallback(
    (suggestions: ClinicalSuggestion[]): ClinicalRecommendationCardProps[] => {
      return suggestions.map(suggestion => ({
        id: suggestion.id,
        title: suggestion.title,
        description: suggestion.description || suggestion.recommendation || '',
        type: suggestion.type as RecommendationType,
        urgency: suggestion.urgency as UrgencyLevel,
        confidence: suggestion.confidence,
        evidenceLevel: suggestion.evidenceLevel as EvidenceLevel | undefined,
        sources: suggestion.sources?.map((source) => ({
          id: source.id,
          title: source.title,
          publication: source.publication,
          year: source.year,
          verified: source.verified
        })),
        contraindications: suggestion.contraindications?.map((c) => ({
          id: c.id || `contraind-${Math.random().toString(36).substring(2, 9)}`,
          description: c.description,
          severity: c.severity
        }))
      }));
    },
    []
  );

  // Función para obtener recomendaciones basadas en notas y contexto
  const fetchRecommendations = useCallback(
    async (notes: UnstructuredNote[], patientContext: PatientContext): Promise<void> => {
      setLoading(true);
      setError(null);

      try {
        // Obtener sugerencias del servicio
        const suggestions = await clinicalCopilotService.generateSuggestions(
          notes,
          {
            patientContext,
            maxSuggestions: options.maxSuggestions,
            minConfidence: options.minConfidence,
            includeContraindications: options.includeContraindications,
            includeEvidenceDetails: options.includeEvidenceDetails
          }
        );

        // Transformar las sugerencias al formato de la UI
        const recommendationsData = transformSuggestionsToRecommendations(suggestions);
        setRecommendations(recommendationsData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al obtener recomendaciones');
        console.error('Error obteniendo recomendaciones:', err);
      } finally {
        setLoading(false);
      }
    },
    [options, transformSuggestionsToRecommendations]
  );

  // Función para limpiar las recomendaciones
  const clearRecommendations = useCallback(() => {
    setRecommendations([]);
    setError(null);
  }, []);

  return {
    recommendations,
    loading,
    error,
    fetchRecommendations,
    clearRecommendations
  };
};

export default useClinicalRecommendations;
