import React, { useState } from 'react';
import { EvidenceLevel, EvidenceDetails as EvidenceDetailsType, EvidenceSource } from '../../services/ai/types';
import EvidenceBadge from './EvidenceBadge';
import './EvidenceDetails.css';

interface EvidenceDetailsProps {
  level: EvidenceLevel;
  details?: EvidenceDetailsType;
  confidenceScore?: number;
  showSources?: boolean;
  compact?: boolean;
}

/**
 * Componente que muestra detalles completos sobre la evidencia médica
 * incluidas las fuentes, criterios de evaluación y puntuación de confianza.
 */
const EvidenceDetails: React.FC<EvidenceDetailsProps> = ({
  level,
  details,
  confidenceScore,
  showSources = true,
  compact = false
}) => {
  const [showAllSources, setShowAllSources] = useState(false);

  // Si no hay detalles, mostrar sólo el nivel
  if (!details) {
    return (
      <div className="evidence-details-container evidence-details-minimal">
        <EvidenceBadge level={level} showLabel={true} size="medium" />
      </div>
    );
  }

  // Determinar qué fuentes mostrar
  const sources = details.sources || [];
  const displayedSources = showAllSources ? sources : sources.slice(0, 3);
  const hasMoreSources = sources.length > 3 && !showAllSources;

  return (
    <div className={`evidence-details-container ${compact ? 'evidence-details-compact' : ''}`}>
      <div className="evidence-details-header">
        <EvidenceBadge level={level} showLabel={true} size={compact ? 'small' : 'large'} />

        {confidenceScore !== undefined && (
          <div className="evidence-confidence" title="Puntuación de confianza">
            <span className="evidence-confidence-value">{confidenceScore}</span>
            <span className="evidence-confidence-label">% confianza</span>
          </div>
        )}
      </div>

      <div className="evidence-description">
        {details.description}
      </div>

      {!compact && (
        <div className="evidence-criteria">
          <strong>Criterios:</strong> {details.criteria}
        </div>
      )}

      {showSources && sources.length > 0 && (
        <div className="evidence-sources-container">
          <h4 className="evidence-sources-title">Fuentes ({sources.length})</h4>

          <ul className="evidence-sources-list">
            {displayedSources.map((source, index) => (
              <li key={source.id || index} className="evidence-source-item">
                <SourceItem source={source} compact={compact} />
              </li>
            ))}
          </ul>

          {hasMoreSources && (
            <button
              className="evidence-show-more-button"
              onClick={() => setShowAllSources(true)}
            >
              Mostrar {sources.length - 3} fuentes más
            </button>
          )}
        </div>
      )}
    </div>
  );
};

interface SourceItemProps {
  source: EvidenceSource;
  compact?: boolean;
}

/**
 * Componente interno para mostrar una fuente individual
 */
const SourceItem: React.FC<SourceItemProps> = ({ source, compact }) => {
  const reliabilityClass = `source-reliability-${source.reliability}`;

  // Título enlazable si hay URL
  const titleElement = source.url ? (
    <a
      href={source.url}
      target="_blank"
      rel="noopener noreferrer"
      className="source-title"
    >
      {source.title}
    </a>
  ) : (
    <span className="source-title">{source.title}</span>
  );

  // Renderizar versión compacta si se solicita
  if (compact) {
    return (
      <div className={`source-item ${reliabilityClass}`}>
        {titleElement}
        {source.verified && (
          <span className="source-verified-badge" title="Fuente verificada">✓</span>
        )}
      </div>
    );
  }

  // Renderizar versión completa
  return (
    <div className={`source-item ${reliabilityClass}`}>
      <div className="source-header">
        {titleElement}
        {source.verified && (
          <span className="source-verified-badge" title="Fuente verificada">✓</span>
        )}
      </div>

      <div className="source-meta">
        {source.authors && source.authors.length > 0 && (
          <span className="source-authors">
            {source.authors.join(', ')}
          </span>
        )}

        {source.publication && (
          <span className="source-publication">
            {source.publication}
          </span>
        )}

        {source.year && (
          <span className="source-year">
            {source.year}
          </span>
        )}

        {source.doi && (
          <span className="source-doi">
            DOI: {source.doi}
          </span>
        )}
      </div>
    </div>
  );
};

export default EvidenceDetails;
