import * as React from 'react';
import { useMemo, memo } from 'react';
import { MedicalTopic } from '../../types/dashboard';
import { Card } from '../common/Card';
import EvidenceBadge from '../evidence/EvidenceBadge';

interface TopMedicalTopicsCardProps {
  topics: MedicalTopic[];
}

/**
 * Tarjeta que muestra los temas médicos más frecuentes
 * Optimizada con memoización y mejoras de accesibilidad
 */
const TopMedicalTopicsCard: React.FC<TopMedicalTopicsCardProps> = memo(({
  topics,
}) => {
  // Encontrar el tema con el mayor número para escalar barras
  const { topicBars } = useMemo(() => {
    const max = topics.reduce((max, topic) => Math.max(max, topic.count), 0);

    // Renderizar las barras de temas de forma memoizada
    const bars = topics.map((topic) => {
      const percent = (topic.count / max) * 100;
      const topicId = `topic-${topic.name.replace(/\s+/g, '-').toLowerCase()}`;

      return (
        <div key={topic.name} className="flex items-center">
          <div
            className="text-sm font-medium text-gray-700 dark:text-gray-300 w-40 truncate"
            title={topic.name}
          >
            {topic.name}
          </div>

          <div className="flex-1 mx-2">
            <div
              className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5"
              role="presentation"
            >
              <div
                id={topicId}
                className="h-2.5 rounded-full bg-blue-600 dark:bg-blue-500"
                style={{ width: `${percent}%` }}
                aria-hidden="true"
              />
            </div>
          </div>

          <div className="w-16 text-sm text-gray-700 dark:text-gray-300 text-right">
            {topic.count}
          </div>

          <div className="w-10 ml-2">
            <EvidenceBadge
              level={topic.averageEvidenceLevel}
              showLabel={false}
              size="small"
            />
          </div>
          <span className="sr-only">
            {topic.name}: {topic.count} ocurrencias, nivel de evidencia promedio {topic.averageEvidenceLevel}
          </span>
        </div>
    null
  );
    });

    return { topicBars: bars };
  }, [topics]);

  return (
    <Card className="p-4 shadow-sm hover:shadow-md transition-shadow duration-200">
      <h3 className="text-lg font-semibold mb-3 text-gray-800 dark:text-gray-200">
        Temas Médicos Principales
      </h3>

      <div className="mt-2 space-y-4">
        {topicBars}
      </div>

      <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400">
        El nivel de evidencia mostrado es el nivel promedio para cada tema.
      </div>
    </Card>
    null
  );
});

// Asignar displayName para mejor depuración
TopMedicalTopicsCard.displayName = 'TopMedicalTopicsCard';

export default TopMedicalTopicsCard;
