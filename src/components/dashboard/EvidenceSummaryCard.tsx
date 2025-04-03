import React from 'react';
import { EvidenceSummary } from '../../types/dashboard';
import { Card } from '../common/Card';
import EvidenceBadge from '../evidence/EvidenceBadge';

interface EvidenceSummaryCardProps {
  summary: EvidenceSummary;
}

/**
 * Tarjeta que muestra un resumen de las evaluaciones de evidencia clínica
 */
const EvidenceSummaryCard: React.FC<EvidenceSummaryCardProps> = ({ summary }) => {
  const { totalEvaluations, byLevel, averageConfidenceScore } = summary;

  // Calcular porcentajes para la visualización
  const getLevelPercentage = (level: 'A' | 'B' | 'C' | 'D'): number => {
    return Math.round((byLevel[level] / totalEvaluations) * 100);
  };

  return (
    <Card className="p-4 shadow-sm hover:shadow-md transition-shadow duration-200">
      <h3 className="text-lg font-semibold mb-3">Resumen de Evidencia Clínica</h3>

      <div className="flex justify-between mb-4">
        <div className="text-center">
          <div className="text-2xl font-bold">{totalEvaluations}</div>
          <div className="text-xs text-gray-500">Evaluaciones</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold">{averageConfidenceScore}%</div>
          <div className="text-xs text-gray-500">Confianza Media</div>
        </div>
      </div>

      <div className="space-y-3">
        <h4 className="text-sm font-medium text-gray-700">Distribución por Nivel</h4>

        {(['A', 'B', 'C', 'D'] as const).map(level => (
          <div key={level} className="flex items-center">
            <div className="w-16">
              <EvidenceBadge level={level} showLabel={false} size="small" />
            </div>
            <div className="flex-1 ml-2">
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className={`h-2.5 rounded-full
                    ${level === 'A' ? 'bg-green-500' :
                      level === 'B' ? 'bg-blue-500' :
                      level === 'C' ? 'bg-amber-500' : 'bg-red-500'
                    }`}
                  style={{ width: `${getLevelPercentage(level)}%` }}
                ></div>
              </div>
            </div>
            <div className="ml-2 text-sm text-gray-700 w-16 text-right">
              {byLevel[level]} ({getLevelPercentage(level)}%)
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 text-xs text-gray-500">
        <p>A: Alta, B: Moderada, C: Limitada, D: Insuficiente</p>
      </div>
    </Card>
  );
};

export default EvidenceSummaryCard;
