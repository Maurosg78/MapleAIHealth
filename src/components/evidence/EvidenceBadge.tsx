import React from 'react';
import { EvidenceLevel } from '../../services/ai/types';
import './EvidenceBadge.css';

interface EvidenceBadgeProps {
  level: EvidenceLevel;
  showLabel?: boolean;
  size?: 'small' | 'medium' | 'large';
  showTooltip?: boolean;
}

/**
 * Componente que muestra visualmente el nivel de evidencia clínica.
 * Utiliza colores y etiquetas para indicar la calidad de la evidencia médica.
 */
const EvidenceBadge: React.FC<EvidenceBadgeProps> = ({
  level,
  showLabel = true,
  size = 'medium',
  showTooltip = true
}) => {
  // Determinar la clase de estilo según el nivel de evidencia
  const badgeClass = `evidence-badge evidence-level-${level.toLowerCase()} evidence-size-${size}`;

  // Textos para etiquetas y tooltips
  const labels: Record<EvidenceLevel, string> = {
    'A': 'Evidencia Alta',
    'B': 'Evidencia Moderada',
    'C': 'Evidencia Limitada',
    'D': 'Evidencia Insuficiente'
  };

  const tooltips: Record<EvidenceLevel, string> = {
    'A': 'Evidencia de alta calidad de múltiples fuentes verificadas.',
    'B': 'Evidencia de calidad moderada de fuentes verificadas.',
    'C': 'Evidencia limitada con verificación parcial.',
    'D': 'Evidencia muy limitada o no verificable.'
  };

  return (
    <div
      className={badgeClass}
      title={showTooltip ? tooltips[level] : undefined}
      aria-label={labels[level]}
      role="status"
    >
      <span className="evidence-letter">{level}</span>
      {showLabel && <span className="evidence-label">{labels[level]}</span>}
    </div>
  );
};

export default EvidenceBadge;
