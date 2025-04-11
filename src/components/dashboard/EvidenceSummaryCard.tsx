import * as React from 'react';
import { useMemo, memo } from 'react';
import { EvidenceSummary } from '../../types/dashboard';
import { Card } from '../common/Card';
import { EvidenceBadge } from '../evidence/EvidenceBadge';

interface EvidenceSummaryCardProps {
  summary: EvidenceSummary;
}

/**
 * Tarjeta que muestra un resumen de las evaluaciones de evidencia clínica
 * Optimizada con memoización y mejoras de accesibilidad
 */
const EvidenceSummaryCard: React.FC<EvidenceSummaryCardProps> = memo(({
  summary,
}) => {
  const { totalEvaluations, byLevel, averageConfidenceScore } = summary;

  // Calcular porcentajes para la visualización de forma memoizada
  const levelPercentages = useMemo(() => {
    const levels = ['A', 'B', 'C', 'D'] as const;
    return levels.reduce((acc, level) => {
      acc[level] = Math.round((byLevel[level] / totalEvaluations) * 100);
      return acc;
    }, {} as Record<'A' | 'B' | 'C' | 'D', number>);
  }, [byLevel, totalEvaluations]);

  // Mapeamos los niveles a colores y descripciones para accesibilidad
  const levelConfig = useMemo(() => ({
    A: {
      color: 'bg-green-500',
      description: 'Evidencia Alta'
    },
    B: {
      color: 'bg-blue-500',
      description: 'Evidencia Moderada'
    },
    C: {
      color: 'bg-amber-500',
      description: 'Evidencia Limitada'
    },
    D: {
      color: 'bg-red-500',
      description: 'Evidencia Insuficiente'
    },
  }), []);

  // Renderizado de las barras de evidencia memoizado
  const evidenceLevelBars = useMemo(() => (
    (['A', 'B', 'C', 'D'] as const).map((level) => (
      <div key={level} className="flex items-center">
        <div className="w-16">
          <EvidenceBadge level={level} showLabel={false} size="small" />
        </div>
        <div className="flex-1 ml-2">
          <div
            className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5"
            role="presentation"
          >
            <div
              className={`h-2.5 rounded-full ${levelConfig[level].color}`}
              style={{ width: `${levelPercentages[level]}%` }}
              aria-hidden="true"
            />
          </div>
        </div>
        <div className="ml-2 text-sm text-gray-700 dark:text-gray-300 w-16 text-right">
          {byLevel[level]} ({levelPercentages[level]}%)
        </div>
        <span className="sr-only">
          {levelConfig[level].description}: {byLevel[level]} evaluaciones, {levelPercentages[level]}% del total
        </span>
      </div>
    ))
  ), [byLevel, levelPercentages, levelConfig]);

  return (
    <Card className="p-4 shadow-sm hover:shadow-md transition-shadow duration-200">
      <h3 className="text-lg font-semibold mb-3 text-gray-800 dark:text-gray-200">
        Resumen de Evidencia Clínica
      </h3>

      <div className="flex justify-between mb-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{totalEvaluations}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400">Evaluaciones</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{averageConfidenceScore}%</div>
          <div className="text-xs text-gray-500 dark:text-gray-400">Confianza Media</div>
        </div>
      </div>

      <div className="space-y-3">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Distribución por Nivel
        </h4>

        {evidenceLevelBars}
      </div>

      <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
        <p>A: Alta, B: Moderada, C: Limitada, D: Insuficiente</p>
      </div>
    </Card>
  );
});

// Asignar displayName para mejor depuración
EvidenceSummaryCard.displayName = 'EvidenceSummaryCard';

export { EvidenceSummaryCard };
