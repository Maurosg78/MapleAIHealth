import * as React from 'react';
import { EvidenceLevel } from '../../services/ai/types';

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
  showTooltip = true,
}) => {
  // Mapeo de tamaños a clases de Tailwind
  const sizeClasses = {
    small: 'px-2 py-0.5 text-xs',
    medium: 'px-3 py-1 text-sm',
    large: 'px-4 py-2 text-base',
  };

  // Mapeo de niveles a colores de Tailwind
  const colorClasses = {
    A: 'bg-green-500 text-white border border-green-600',
    B: 'bg-blue-500 text-white border border-blue-600',
    C: 'bg-yellow-500 text-white border border-yellow-600',
    D: 'bg-red-500 text-white border border-red-600',
  };

  // Textos para etiquetas y tooltips
  const labels: Record<EvidenceLevel, string> = {
    A: 'Evidencia Alta',
    B: 'Evidencia Moderada',
    C: 'Evidencia Limitada',
    D: 'Evidencia Insuficiente',
  };

  const tooltips: Record<EvidenceLevel, string> = {
    A: 'Evidencia de alta calidad de múltiples fuentes verificadas.',
    B: 'Evidencia de calidad moderada de fuentes verificadas.',
    C: 'Evidencia limitada con verificación parcial.',
    D: 'Evidencia muy limitada o no verificable.',
  };

  return (
    React.createElement('div', {
      className: `inline-flex items-center rounded-full font-semibold m-1 transition-all duration-200 hover:shadow-md ${sizeClasses[size] ${colorClasses[level]}`}
      title: showTooltip ? tooltips[level] : undefined
      aria-label: labels[level]
      role: "status"
    }, 
      <span className="text-base font-bold mr-1">{level}</span>
      {showLabel && <span className="text-sm font-medium">{labels[level]}</span>}
    )
    null
  );
};

export default EvidenceBadge;
