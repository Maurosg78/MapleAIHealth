import * as React from 'react';
import { useEffect, useRef, memo, useMemo, useCallback } from 'react';
import { SourceVerificationStats } from '../../types/dashboard';
import { Card } from '../common/Card';
import './SourceVerificationsCard.css';

interface SourceVerificationsCardProps {
  stats: SourceVerificationStats;
  className?: string;
}

/**
 * Tarjeta que muestra estadísticas de verificación de fuentes médicas
 * Optimizada con memoización y mejoras de accesibilidad
 */
const SourceVerificationsCard: React.FC<SourceVerificationsCardProps> = memo(({
  stats,
  className = '',
}) => {
  // Extraer datos y calcular porcentajes de forma memoizada
  const { verificationData, total } = useMemo(() => {
    const { verified, unverified, pending, byDatabase } = stats;
    const totalSources = verified + unverified + pending;

    return {
      verificationData: {
        verified: {
          count: verified,
          percent: Math.round((verified / totalSources) * 100),
        },
        pending: {
          count: pending,
          percent: Math.round((pending / totalSources) * 100),
        },
        unverified: {
          count: unverified,
          percent: Math.round((unverified / totalSources) * 100),
        },
        byDatabase: byDatabase.map(db => ({
          ...db,
          percent: Math.round((db.count / totalSources) * 100),
        })),
      },
      total: totalSources,
    };
  }, [stats]);

  // Referencias para barras de progreso
  const verifiedBarRef = useRef<HTMLDivElement>(null);
  const pendingBarRef = useRef<HTMLDivElement>(null);
  const unverifiedBarRef = useRef<HTMLDivElement>(null);

  // Función para asignar variables CSS de forma optimizada
  const setCssVariable = useCallback((
    ref: React.RefObject<HTMLDivElement>,
    percentVar: string,
    percent: number,
    count: number
  ) => {
    if (ref.current) {
      ref.current.style.setProperty(percentVar, `${percent}%`);
      ref.current.style.setProperty('--min-bar-width', count > 0 && percent === 0 ? '0.25rem' : '0%');
    }
  }, []);

  // Actualizar variables CSS cuando cambien los porcentajes
  useEffect(() => {
    const { verified, pending, unverified } = verificationData;

    setCssVariable(verifiedBarRef, '--verified-percent', verified.percent, verified.count);
    setCssVariable(pendingBarRef, '--pending-percent', pending.percent, pending.count);
    setCssVariable(unverifiedBarRef, '--unverified-percent', unverified.percent, unverified.count);
  }, [verificationData, setCssVariable]);

  // Renderizar las barras de base de datos de forma memoizada
  const databaseBars = useMemo(() =>
    verificationData.byDatabase.map((db, index) => {
      const dbId = `db-${index}-${db.name.replace(/\s+/g, '')}`;

      return (
        <div key={db.name} className="flex items-center mb-3 last:mb-0">
          <div className="text-sm w-28 truncate" title={db.name}>
            {db.name}
          </div>
          <div className="flex-1 mx-2">
            <div
              className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden"
              role="presentation"
            >
              <div
                id={dbId}
                className="database-bar h-2 rounded-full"
                ref={el => {
                  if (el) {
                    el.style.setProperty('--db-percent', `${db.percent}%`);
                    el.style.setProperty('--min-bar-width', db.count > 0 && db.percent === 0 ? '0.25rem' : '0%');
                    el.setAttribute('aria-hidden', 'true');
                  }
                }}
              />
            </div>
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400 w-20 text-right">
            {db.count} ({db.percent}%)
          </div>
        </div>
    null
  );
    }),
  [verificationData.byDatabase]);

  const { verified, pending, unverified } = verificationData;

  return (
    <Card className={`p-4 shadow-sm hover:shadow-md transition-shadow duration-200 ${className}`}>
      <h3 className="text-lg font-semibold mb-3 text-gray-800 dark:text-gray-200">Verificación de Fuentes</h3>

      <div className="mb-4">
        <div
          className="flex w-full h-4 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700"
          role="img"
          aria-label={`Estado de verificación: ${verified.percent}% verificadas, ${pending.percent}% pendientes, ${unverified.percent}% no verificadas`}
        >
          <div
            ref={verifiedBarRef}
            className="verified-bar progress-bar"
            aria-hidden="true"
          />
          <div
            ref={pendingBarRef}
            className="pending-bar progress-bar"
            aria-hidden="true"
          />
          <div
            ref={unverifiedBarRef}
            className="unverified-bar progress-bar"
            aria-hidden="true"
          />
        </div>

        <div className="flex justify-between mt-2 text-xs text-gray-600 dark:text-gray-400">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-green-500 rounded-full mr-1" aria-hidden="true" />
            <span>
              Verificadas: {verified.count} ({verified.percent}%)
            </span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-yellow-500 rounded-full mr-1" aria-hidden="true" />
            <span>
              Pendientes: {pending.count} ({pending.percent}%)
            </span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-red-400 rounded-full mr-1" aria-hidden="true" />
            <span>
              No verificadas: {unverified.count} ({unverified.percent}%)
            </span>
          </div>
        </div>
      </div>

      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        Por Base de Datos
      </h4>
      <div className="space-y-1" aria-label="Verificaciones por base de datos">
        {databaseBars}
      </div>

      <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400">
        Total de fuentes analizadas: {total}
      </div>
    </Card>
    null
  );
});

SourceVerificationsCard.displayName = 'SourceVerificationsCard';

export default SourceVerificationsCard;
