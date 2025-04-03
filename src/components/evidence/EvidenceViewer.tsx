import React, { useState } from 'react';
import { EvidenceEvaluationResult, Recommendation } from '../../services/ai/types';
import EvidenceBadge from './EvidenceBadge';
import EvidenceDetails from './EvidenceDetails';
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
  className = ''
}) => {
  const [expandedRecommendation, setExpandedRecommendation] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'summary' | 'detail'>('summary');

  if (!result && recommendations.length === 0) {
    return (
      <div className={`evidence-viewer evidence-viewer-empty ${className}`}>
        <p className="evidence-viewer-no-data">
          No hay datos de evidencia disponibles para mostrar.
        </p>
      </div>
    );
  }

  // Manejar clic en cambio de modo de visualización
  const handleViewModeChange = (mode: 'summary' | 'detail') => {
    setViewMode(mode);
  };

  // Manejar clic en recomendación para expandir/colapsar
  const toggleRecommendation = (id: string) => {
    if (expandedRecommendation === id) {
      setExpandedRecommendation(null);
    } else {
      setExpandedRecommendation(id);
    }
  };

  // Renderizar la evaluación principal de evidencia
  const renderMainEvaluation = () => {
    if (!result) return null;

    return (
      <div className="evidence-viewer-main">
        <div className="evidence-viewer-header">
          <h3 className="evidence-viewer-title">Evaluación de Evidencia</h3>
          <div className="evidence-viewer-view-controls">
            <button
              className={`evidence-viewer-view-button ${viewMode === 'summary' ? 'active' : ''}`}
              onClick={() => handleViewModeChange('summary')}
            >
              Resumen
            </button>
            <button
              className={`evidence-viewer-view-button ${viewMode === 'detail' ? 'active' : ''}`}
              onClick={() => handleViewModeChange('detail')}
            >
              Detalle
            </button>
          </div>
        </div>

        {viewMode === 'summary' ? (
          <div className="evidence-viewer-summary">
            <div className="evidence-viewer-badge-container">
              <EvidenceBadge
                level={result.evidenceLevel}
                showLabel={true}
                size="large"
              />
              {result.confidenceScore !== undefined && (
                <div className="evidence-viewer-confidence">
                  <span className="evidence-viewer-confidence-value">
                    {result.confidenceScore}%
                  </span>
                  <span className="evidence-viewer-confidence-label">
                    Confianza
                  </span>
                </div>
              )}
            </div>
            <p className="evidence-viewer-description">
              {result.details.description}
            </p>
          </div>
        ) : (
          <div className="evidence-viewer-detail">
            <EvidenceDetails
              level={result.evidenceLevel}
              details={result.details}
              confidenceScore={result.confidenceScore}
              showSources={true}
            />
          </div>
        )}

        {showLimitationsNotes && result.limitationsNotes && (
          <div className="evidence-viewer-limitations">
            <h4 className="evidence-viewer-section-title">Limitaciones</h4>
            <p>{result.limitationsNotes}</p>
          </div>
        )}

        {showAlternatives && result.suggestedAlternatives && result.suggestedAlternatives.length > 0 && (
          <div className="evidence-viewer-alternatives">
            <h4 className="evidence-viewer-section-title">Alternativas Sugeridas</h4>
            <ul className="evidence-viewer-alternatives-list">
              {result.suggestedAlternatives.map((alternative, index) => (
                <li key={index} className="evidence-viewer-alternative-item">
                  {alternative}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  };

  // Renderizar la lista de recomendaciones
  const renderRecommendations = () => {
    if (recommendations.length === 0) return null;

    return (
      <div className="evidence-viewer-recommendations">
        <h3 className="evidence-viewer-title">Recomendaciones Basadas en Evidencia</h3>
        <div className="evidence-viewer-recommendations-list">
          {recommendations.map((recommendation, index) => {
            const isExpanded = expandedRecommendation === `rec-${index}`;
            const hasEvidence = recommendation.evidenceLevel && recommendation.evidenceDetails;

            return (
              <div
                key={`rec-${index}`}
                className={`evidence-viewer-recommendation ${
                  isExpanded ? 'expanded' : ''
                }`}
              >
                <div
                  className="evidence-viewer-recommendation-header"
                  onClick={() => toggleRecommendation(`rec-${index}`)}
                >
                  <div className="evidence-viewer-recommendation-title-row">
                    <h4 className="evidence-viewer-recommendation-title">
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
                  <div className="evidence-viewer-recommendation-meta">
                    <span className="evidence-viewer-recommendation-type">
                      {recommendation.type}
                    </span>
                    {recommendation.priority && (
                      <span
                        className={`evidence-viewer-recommendation-priority evidence-viewer-priority-${recommendation.priority}`}
                      >
                        {recommendation.priority}
                      </span>
                    )}
                  </div>
                </div>

                {isExpanded && (
                  <div className="evidence-viewer-recommendation-details">
                    <p className="evidence-viewer-recommendation-description">
                      {recommendation.description}
                    </p>

                    {recommendation.rationale && (
                      <div className="evidence-viewer-recommendation-rationale">
                        <h5>Justificación:</h5>
                        <p>{recommendation.rationale}</p>
                      </div>
                    )}

                    {hasEvidence && (
                      <div className="evidence-viewer-recommendation-evidence">
                        <h5>Evidencia Clínica:</h5>
                        <EvidenceDetails
                          level={recommendation.evidenceLevel!}
                          details={recommendation.evidenceDetails}
                          compact={true}
                        />
                      </div>
                    )}

                    {recommendation.timeframe && (
                      <div className="evidence-viewer-recommendation-timeframe">
                        <h5>Marco temporal:</h5>
                        <p>{recommendation.timeframe}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className={`evidence-viewer ${className}`}>
      {renderMainEvaluation()}
      {renderRecommendations()}
    </div>
  );
};

export default EvidenceViewer;
