import React from 'react';
import { RecentEvaluation } from '../../types/dashboard';
import { Card } from '../common/Card';
import EvidenceBadge from '../evidence/EvidenceBadge';

interface RecentEvaluationsCardProps {
  evaluations: RecentEvaluation[];
}

/**
 * Tarjeta que muestra las evaluaciones recientes de evidencia clínica
 */
const RecentEvaluationsCard: React.FC<RecentEvaluationsCardProps> = ({ evaluations }) => {
  // Función para formatear la fecha relativa
  const formatRelativeTime = (timestamp: string): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();

    const diffSecs = Math.floor(diffMs / 1000);
    if (diffSecs < 60) return `Hace ${diffSecs} segundos`;

    const diffMins = Math.floor(diffSecs / 60);
    if (diffMins < 60) return `Hace ${diffMins} minutos`;

    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `Hace ${diffHours} horas`;

    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 30) return `Hace ${diffDays} días`;

    const diffMonths = Math.floor(diffDays / 30);
    return `Hace ${diffMonths} meses`;
  };

  return (
    <Card className="p-4 shadow-sm hover:shadow-md transition-shadow duration-200">
      <h3 className="text-lg font-semibold mb-3">Evaluaciones Recientes</h3>

      <div className="space-y-4">
        {evaluations.map(evaluation => (
          <div
            key={evaluation.id}
            className="border-b border-gray-100 pb-3 last:border-b-0"
          >
            <div className="flex justify-between items-start mb-2">
              <h4 className="text-md font-medium text-gray-800">{evaluation.content}</h4>
              <EvidenceBadge level={evaluation.evidenceLevel} showLabel={false} size="small" />
            </div>

            <div className="flex justify-between items-center text-sm">
              <div className="text-gray-500">
                {formatRelativeTime(evaluation.timestamp)}
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center text-gray-500">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  <span>{evaluation.confidenceScore}% confianza</span>
                </div>
                <div className="flex items-center text-gray-500">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
                  </svg>
                  <span>{evaluation.sources} fuentes</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 text-center">
        <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
          Ver todas las evaluaciones
        </button>
      </div>
    </Card>
  );
};

export default RecentEvaluationsCard;
