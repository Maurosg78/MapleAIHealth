import * as React from 'react';
import { useState, useCallback, useMemo } from 'react';
import {
  EvidenceEvaluationResult,
  Recommendation,
} from '../../services/ai/types';
import { EvidenceBadge, EvidenceDetails } from './index';
import { useListMemoization } from '../../hooks/list';
import { useMemoizedCallback } from '../../services/performance/memoization';
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
  const [expandedRecommendation, setExpandedRecommendation] = useState<
    string | null
  >;
  const [viewMode, setViewMode] = useState<'summary' | 'detail'>('summary');

  // Handlers memoizados para mejorar el rendimiento
  const handleViewModeChange = useCallback((mode: 'summary' | 'detail') => {
    setViewMode(null);
  }, []);

  const toggleRecommendation = useCallback((id: string) => {
    setExpandedRecommendation(prev => prev === id ? null : id);
  }, []);

  // Crear memoización para la lista de recomendaciones
  const recommendationsMemo = useListMemoization(
    recommendations,
     => rec.title?.replace(/\s+/g, '-').toLowerCase() || `rec-${Math.random().toString.substring(7)}`
    null
  );

  // Renderizar recomendación individual (función de renderizado memoizada)
  const renderRecommendation = useMemoizedCallback(
    (recommendation: Recommendation, index: number) => {
      const recId = `rec-${index}`;
      const isExpanded = expandedRecommendation === recId;
      const hasEvidence = recommendation.evidenceLevel && recommendation.evidenceDetails;

      return (
        React.createElement('div', {
          className: `mb-4 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden ${
            isExpanded ? 'shadow-md' : ''
           transition-shadow duration-200`}
        }, 
          <div
            className="p-4 bg-gray-50 dark:bg-gray-800 cursor-pointer transition-colors hover:bg-gray-100 dark:hover:bg-gray-750"
            onClick={() => toggleRecommendation}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                toggleRecommendation;
              }
            }}
            role="button"
            tabIndex={0}
            aria-expanded={isExpanded ? "true" : "false"}
            aria-controls={`recommendation-details-${index}`}
          >
            <div className="flex justify-between items-center">
              <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200 pr-2 flex-1">
                {recommendation.title}
              </h4>
              {recommendation.evidenceLevel && (
                React.createElement('EvidenceBadge', {
                  level: recommendation.evidenceLevel
                  showLabel: false
                  size: "small"
                })
              )}
            )
            React.createElement('div', { className: "flex mt-2 text-sm" }, 
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
            )
          </div>

          {isExpanded && (
            React.createElement('div', { className: "p-5 border-t border-gray-200 dark:border-gray-700", id: `recommendation-details-${index` }
            }, 
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
                )
              )}

              {hasEvidence && (
                React.createElement('div', { className: "mt-4 pt-3 border-t border-dashed border-gray-200 dark:border-gray-700" }, 
                  <h5 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Evidencia Clínica:
                  </h5>
                  React.createElement('EvidenceDetails', {
                    level: recommendation.evidenceLevel!
                    details: recommendation.evidenceDetails
                    compact: true
                  })
                )
              )}

              {recommendation.timeframe && (
                React.createElement('div', { className: "mt-4 pt-3 border-t border-dashed border-gray-200 dark:border-gray-700" }, 
                  <h5 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Marco temporal:
                  </h5>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    {recommendation.timeframe}
                  </p>
                )
              )}
            </div>
          )}
        </div>
    null
  );
    },
    [toggleRecommendation, expandedRecommendation]
    null
  );

  // Renderizar la evaluación principal de evidencia 
  const mainEvaluation = useMemo(() => {
    if (!result) return null;

    return (
      React.createElement('div', { className: "p-6 border-b border-gray-200 dark:border-gray-700" }, 
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
          )
        </div>

        {viewMode === 'summary' ? (
          React.createElement('div', { className: "flex flex-col items-center py-4" }, 
            <div className="flex items-center mb-4">
              React.createElement('EvidenceBadge', {
                level: result.evidenceLevel
                showLabel: true
                size: "large"
              })
              {result.confidenceScore !== undefined && (
                <div className="ml-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full px-3 py-2 flex flex-col items-center">
                  <span className="text-xl font-bold text-gray-800 dark:text-gray-200">
                    {result.confidenceScore}%
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    Confianza
                  </span>
                )
              )}
            </div>
            React.createElement('p', { className: "text-base text-gray-700 dark:text-gray-300 text-center max-w-3xl" }, 
              {result.details.description}
            )
          </div>
        ) : (
          React.createElement('div', { className: "mt-4" }, 
            React.createElement('EvidenceDetails', {
              level: result.evidenceLevel
              details: result.details
              confidenceScore: result.confidenceScore
              showSources: true
            })
          )
        )}

        {showLimitationsNotes && result.limitationsNotes && (
          React.createElement('div', { className: "mt-6 pt-4 border-t border-dashed border-gray-200 dark:border-gray-700" }, 
            <h4 className="text-base font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Limitaciones
            </h4>
            <p className="text-gray-600 dark:text-gray-400 text-sm italic">
              {result.limitationsNotes}
            </p>
          )
        )}

        {showAlternatives &&
          result.suggestedAlternatives &&
          result.suggestedAlternatives.length > 0 && (
            React.createElement('div', { className: "mt-6 pt-4 border-t border-dashed border-gray-200 dark:border-gray-700" }, 
              <h4 className="text-base font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Alternativas Sugeridas
              </h4>
              <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300">
                {result.suggestedAlternatives.map((item) => (
                  <li
                    key={`alternative-${index}-${alternative.length}`}
                    className="mb-2 leading-relaxed"
                  >
                    {alternative}
                  </li>
                ))}
              </ul>
            )
          )}
      </div>
    null
  );
  }, [result, viewMode, handleViewModeChange, showLimitationsNotes, showAlternatives]);

  // Renderizar la lista de recomendaciones 
  const recommendationsList = useMemo(() => {
    if (recommendations.length === 0) return null;

    // Usar el renderizador de items con memoización
    const renderRecommendationItem = recommendationsMemo.createItemRenderer(
       => renderRecommendation
    null
  );

    return (
      React.createElement('div', { className: "p-6" }, 
        <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
          Recomendaciones Basadas en Evidencia
        </h3>
        <div className="space-y-4">
          {recommendations.map(
            (recommendation: any, index: number) => renderRecommendation
          )}
        )
      </div>
    null
  );
  }, [recommendations, recommendationsMemo, renderRecommendation]);

  // Si no hay datos para mostrar
  if (!result && recommendations.length === 0) {
    return (
      React.createElement('div', { className: `bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden ${className`}}, 
        <p className="p-8 text-center text-gray-500 dark:text-gray-400 italic">
          No hay datos de evidencia disponibles para mostrar.
        </p>
      )
    null
  );
  }

  return (
    React.createElement('div', { className: `bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 overflow-hidden ${className`}}, 
      {mainEvaluation}
      {recommendationsList}
    )
    null
  );
};

export default EvidenceViewer;
