import * as React from 'react';
import { useState, useCallback, useMemo } from 'react';
import {
  EvidenceEvaluationResult,
  Recommendation,
} from '../../services/ai/types';
import { EvidenceBadge, EvidenceDetails } from './index';
import './EvidenceViewer.css';

interface EvidenceViewerProps {
  result?: EvidenceEvaluationResult;
  recommendations?: Recommendation[];
  showLimitationsNotes?: boolean;
  showAlternatives?: boolean;
  className?: string;
}

/**
 * Componente para visualizar resultados de evaluación de evidencia clínica
 * Muestra tanto el nivel general como detalles específicos y recomendaciones
 */
const EvidenceViewer: React.FC<EvidenceViewerProps> = ({
  result,
  recommendations = [],
  showLimitationsNotes = true,
  showAlternatives = true,
  className = '',
}) => {
  const [expandedRecommendation, setExpandedRecommendation] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'summary' | 'detail'>('summary');

  // Handlers memoizados para mejorar el rendimiento
  const handleViewModeChange = useCallback((mode: 'summary' | 'detail') => {
    setViewMode(mode);
  }, []);

  const toggleRecommendation = useCallback((id: string) => {
    setExpandedRecommendation(prev => prev === id ? null : id);
  }, []);

  // Renderizar recomendación individual
  const renderRecommendation = useCallback(
    (recommendation: Recommendation, index: number) => {
      const recId = `rec-${index}`;
      const isExpanded = expandedRecommendation === recId;
      const hasEvidence = recommendation.evidenceLevel && recommendation.evidenceDetails;

      return (
        <div className={`mb-4 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden ${
          isExpanded ? 'shadow-md' : ''
        } transition-shadow duration-200`}>
          <div
            className="p-4 bg-gray-50 dark:bg-gray-800 cursor-pointer transition-colors hover:bg-gray-100 dark:hover:bg-gray-750"
            onClick={() => toggleRecommendation(recId)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                toggleRecommendation(recId);
              }
            }}
            role="button"
            tabIndex={0}
            aria-controls={`recommendation-details-${index}`}
          >
            <div className="flex justify-between items-center">
              <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200 pr-2 flex-1">
                {recommendation.title}
              </h4>
              {recommendation.evidenceLevel && (
                <EvidenceBadge
                  level={recommendation.evidenceLevel}
                  showLabel={false}
                  size="small"
                />
              )}
            </div>
            <div className="flex mt-2 text-sm">
              <span className="px-2 py-1 bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded mr-2 capitalize">
                {recommendation.type}
              </span>
              {recommendation.priority && (
                <span
                  className={`px-2 py-1 rounded uppercase text-xs font-semibold ${
                    recommendation.priority === 'high'
                      ? 'bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-300'
                      : recommendation.priority === 'medium'
                      ? 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900 dark:text-yellow-300'
                      : 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300'
                  }`}
                >
                  {recommendation.priority}
                </span>
              )}
            </div>
          </div>

          {isExpanded && (
            <div className="p-5 border-t border-gray-200 dark:border-gray-700" id={`recommendation-details-${index}`}>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                {recommendation.description}
              </p>

              {recommendation.rationale && (
                <div className="mt-4 pt-3 border-t border-dashed border-gray-200 dark:border-gray-700">
                  <h5 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Justificación:
                  </h5>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    {recommendation.rationale}
                  </p>
                </div>
              )}

              {hasEvidence && (
                <div className="mt-4 pt-3 border-t border-dashed border-gray-200 dark:border-gray-700">
                  <h5 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Evidencia Clínica:
                  </h5>
                  <EvidenceDetails
                    level={recommendation.evidenceLevel!}
                    details={recommendation.evidenceDetails!}
                    compact={true}
                  />
                </div>
              )}

              {recommendation.timeframe && (
                <div className="mt-4 pt-3 border-t border-dashed border-gray-200 dark:border-gray-700">
                  <h5 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Marco temporal:
                  </h5>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    {recommendation.timeframe}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      );
    },
    [toggleRecommendation, expandedRecommendation]
  );

  // Renderizar la evaluación principal de evidencia
  const mainEvaluation = useMemo(() => {
    if (!result) return null;

    return (
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
            Evaluación de Evidencia
          </h3>
          <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
            <button
              className={`px-4 py-2 text-sm border-none ${
                viewMode === 'summary'
                ? 'bg-blue-600 text-white font-medium'
                : 'bg-transparent text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
              onClick={() => handleViewModeChange('summary')}
            >
              Resumen
            </button>
            <button
              className={`px-4 py-2 text-sm border-none ${
                viewMode === 'detail'
                ? 'bg-blue-600 text-white font-medium'
                : 'bg-transparent text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
              onClick={() => handleViewModeChange('detail')}
            >
              Detalle
            </button>
          </div>
        </div>

        {viewMode === 'summary' ? (
          <div className="flex flex-col items-center py-4">
            <div className="flex items-center mb-4">
              <EvidenceBadge
                level={result.evidenceLevel}
                showLabel={true}
                size="large"
              />
              {result.confidenceScore !== undefined && (
                <div className="ml-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full px-3 py-2 flex flex-col items-center">
                  <span className="text-xl font-bold text-gray-800 dark:text-gray-200">
                    {`${result.confidenceScore}%`}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    Confianza
                  </span>
                </div>
              )}
            </div>
            <p className="text-base text-gray-700 dark:text-gray-300 text-center max-w-3xl">
              {result.details.description}
            </p>
          </div>
        ) : (
          <div className="mt-4">
            <EvidenceDetails
              level={result.evidenceLevel}
              details={result.details}
              confidenceScore={result.confidenceScore}
              showSources={true}
            />
          </div>
        )}

        {showLimitationsNotes && result.limitationsNotes && (
          <div className="mt-6 pt-4 border-t border-dashed border-gray-200 dark:border-gray-700">
            <h4 className="text-base font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Limitaciones
            </h4>
            <p className="text-gray-600 dark:text-gray-400 text-sm italic">
              {result.limitationsNotes}
            </p>
          </div>
        )}

        {showAlternatives &&
          result.suggestedAlternatives &&
          result.suggestedAlternatives.length > 0 && (
            <div className="mt-6 pt-4 border-t border-dashed border-gray-200 dark:border-gray-700">
              <h4 className="text-base font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Alternativas Sugeridas
              </h4>
              <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300">
                {result.suggestedAlternatives.map((item, index) => (
                  <li
                    key={`alternative-${index}-${item.length}`}
                    className="mb-2 leading-relaxed"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}
      </div>
    );
  }, [result, viewMode, handleViewModeChange, showLimitationsNotes, showAlternatives]);

  // Renderización principal del componente
  return (
    <div className={`evidence-viewer ${className}`}>
      {result && mainEvaluation}

      {recommendations && recommendations.length > 0 && (
        <div className="mt-6">
          <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
            Recomendaciones
          </h3>
          <div className="space-y-4">
            {recommendations.map((recommendation, idx) => (
              <div key={`recommendation-${idx}`}>
                {renderRecommendation(recommendation, idx)}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default EvidenceViewer;
