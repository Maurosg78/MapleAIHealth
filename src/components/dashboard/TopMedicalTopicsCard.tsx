import React from 'react';
import { MedicalTopic } from '../../types/dashboard';
import { Card } from '../common/Card';
import EvidenceBadge from '../evidence/EvidenceBadge';

interface TopMedicalTopicsCardProps {
  topics: MedicalTopic[];
}

/**
 * Tarjeta que muestra los temas médicos más frecuentes
 */
const TopMedicalTopicsCard: React.FC<TopMedicalTopicsCardProps> = ({ topics }) => {
  // Encontrar el tema con el mayor número para escalar barras
  const maxCount = topics.reduce((max, topic) => Math.max(max, topic.count), 0);

  return (
    <Card className="p-4 shadow-sm hover:shadow-md transition-shadow duration-200">
      <h3 className="text-lg font-semibold mb-3">Temas Médicos Principales</h3>

      <div className="mt-2 space-y-4">
        {topics.map(topic => (
          <div key={topic.name} className="flex items-center">
            <div className="text-sm font-medium text-gray-700 w-40 truncate" title={topic.name}>
              {topic.name}
            </div>

            <div className="flex-1 mx-2">
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className="h-2.5 rounded-full bg-blue-600"
                  style={{ width: `${(topic.count / maxCount) * 100}%` }}
                ></div>
              </div>
            </div>

            <div className="w-16 text-sm text-gray-700 text-right">
              {topic.count}
            </div>

            <div className="w-10 ml-2">
              <EvidenceBadge
                level={topic.averageEvidenceLevel}
                showLabel={false}
                size="small"
              />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-3 border-t border-gray-100 text-xs text-gray-500">
        El nivel de evidencia mostrado es el nivel promedio para cada tema.
      </div>
    </Card>
  );
};

export default TopMedicalTopicsCard;
