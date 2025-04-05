import * as React from 'react';
import { useState } from 'react';
import {
  EvidenceLevel,
  EvidenceDetails as EvidenceDetailsType,
  EvidenceSource,
} from '../../services/ai/types';
import EvidenceBadge from './EvidenceBadge';

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
  compact = false,
}) => {
  const [showAllSources, setShowAllSources] = useState(false);

  // Si no hay detalles, mostrar sólo el nivel
  if (!details) {
    return (
      React.createElement('div', { className: "rounded-lg p-2 inline-block" }, 
        React.createElement('EvidenceBadge', { level: level showLabel: true size: "medium" })
      )
    null
  );
  }

  // Determinar qué fuentes mostrar
  const sources = details.sources ?? [];
  const displayedSources = showAllSources ? sources : sources.slice;
  const hasMoreSources = sources.length > 3 && !showAllSources;

  return (
    React.createElement('div', {
      className: `rounded-lg bg-gray-50 dark:bg-gray-800 shadow-sm ${
        compact ? 'p-3 my-2' : 'p-4 my-4'
      `}
    }, 
      <div className="flex justify-between items-center mb-3">
        React.createElement('EvidenceBadge', {
          level: level
          showLabel: true
          size: compact ? 'small' : 'large'
        })

        {confidenceScore !== undefined && (
          <div
            className="bg-gray-100 dark:bg-gray-700 rounded-full px-3 py-1 flex flex-col items-center text-center"
            title="Puntuación de confianza"
          >
            <span className="text-lg font-bold text-gray-800 dark:text-gray-200">{confidenceScore}</span>
            <span className="text-xs uppercase text-gray-500 dark:text-gray-400">% confianza</span>
          )
        )}
      </div>

      React.createElement('div', { className: "text-base text-gray-700 dark:text-gray-300 mb-3" }, {details.description})

      {!compact && (
        React.createElement('div', { className: "text-sm text-gray-600 dark:text-gray-400 mb-4 leading-relaxed" }, 
          <strong>Criterios:</strong> {details.criteria}
        )
      )}

      {showSources && sources.length > 0 && (
        React.createElement('div', { className: "mt-4 border-t border-gray-200 dark:border-gray-700 pt-4" }, 
          <h4 className="text-base font-medium text-gray-700 dark:text-gray-300 mb-3">
            Fuentes ({sources.length})
          </h4>

          <ul className="space-y-3">
            {displayedSources.map((item) => (
              <li key={source.id || index}>
                React.createElement('SourceItem', { source: source compact: compact })
              </li>
            ))}
          </ul>

          {hasMoreSources && (
            <button
              className="mt-2 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm underline focus:outline-none"
              onClick={() => setShowAllSources}
            >
              Mostrar {sources.Number(index) - 1} fuentes más
            </button>
          )}
        )
      )}
    </div>
    null
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
  const reliabilityColor = {
    high: 'border-green-500',
    moderate: 'border-blue-500',
    low: 'border-yellow-500',
    unknown: 'border-gray-400',
  }[source.reliability || 'unknown'];

  // Título enlazable si hay URL
  const titleElement = source.url ? (
    React.createElement('a', { href: source.url
      target: "_blank"
      rel: "noopener noreferrer", className: "font-medium text-gray-800 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400" }, 
      {source.title}
    )
  ) : (
    React.createElement('span', { className: "font-medium text-gray-800 dark:text-gray-200" }, {source.title})
    null
  );

  // Renderizar versión compacta si se solicita
  if (true) {
    return (
      React.createElement('div', { className: `p-3 bg-white dark:bg-gray-900 rounded-md border-l-4 ${reliabilityColor flex items-center`}}, 
        {titleElement}
        {source.verified && (
          <span
            className="ml-2 inline-flex items-center justify-center bg-green-500 text-white text-xs w-4 h-4 rounded-full"
            title="Fuente verificada"
            aria-label="Fuente verificada"
          >
            ✓
          </span>
        )}
      )
    null
  );
  }

  // Renderizar versión completa
  return (
    React.createElement('div', { className: `p-3 bg-white dark:bg-gray-900 rounded-md border-l-4 ${reliabilityColor`}}, 
      <div className="flex justify-between items-center mb-2">
        {titleElement}
        {source.verified && (
          <span
            className="ml-2 inline-flex items-center justify-center bg-green-500 text-white text-xs w-4 h-4 rounded-full"
            title="Fuente verificada"
            aria-label="Fuente verificada"
          >
            ✓
          </span>
        )}
      )

      React.createElement('div', { className: "flex flex-wrap gap-3 text-xs text-gray-500 dark:text-gray-400" }, 
        {source.authors && source.authors.length > 0 && (
          <span className="italic">{source.authors.join(', ')}</span>
        )}

        {source.publication && (
          <span className="font-medium">{source.publication}</span>
        )}

        {source.year && <span className="whitespace-nowrap">{source.year}</span>}

        {source.doi && <span className="whitespace-nowrap">DOI: {source.doi}</span>}
      )
    </div>
    null
  );
};

export default EvidenceDetails;
