import React from 'react';
import { SourceVerificationStats } from '../../types/dashboard';
import { Card } from '../common/Card';

interface SourceVerificationsCardProps {
  stats: SourceVerificationStats;
}

/**
 * Tarjeta que muestra estadísticas de verificación de fuentes médicas
 */
const SourceVerificationsCard: React.FC<SourceVerificationsCardProps> = ({ stats }) => {
  const { verified, unverified, pending, byDatabase } = stats;
  const total = verified + unverified + pending;

  // Calcular porcentajes
  const verifiedPercent = Math.round((verified / total) * 100);
  const unverifiedPercent = Math.round((unverified / total) * 100);
  const pendingPercent = Math.round((pending / total) * 100);

  return (
    <Card className="p-4 shadow-sm hover:shadow-md transition-shadow duration-200">
      <h3 className="text-lg font-semibold mb-3">Verificación de Fuentes</h3>

      <div className="mb-4">
        <div className="flex w-full h-4 rounded-full overflow-hidden">
          <div
            className="bg-green-500"
            style={{ width: `${verifiedPercent}%` }}
            title={`Verificadas: ${verified} (${verifiedPercent}%)`}
          ></div>
          <div
            className="bg-yellow-500"
            style={{ width: `${pendingPercent}%` }}
            title={`Pendientes: ${pending} (${pendingPercent}%)`}
          ></div>
          <div
            className="bg-red-400"
            style={{ width: `${unverifiedPercent}%` }}
            title={`No verificadas: ${unverified} (${unverifiedPercent}%)`}
          ></div>
        </div>

        <div className="flex justify-between mt-2 text-xs text-gray-600">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-green-500 rounded-full mr-1"></div>
            <span>Verificadas: {verified} ({verifiedPercent}%)</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-yellow-500 rounded-full mr-1"></div>
            <span>Pendientes: {pending} ({pendingPercent}%)</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-red-400 rounded-full mr-1"></div>
            <span>No verificadas: {unverified} ({unverifiedPercent}%)</span>
          </div>
        </div>
      </div>

      <h4 className="text-sm font-medium text-gray-700 mb-2">Por Base de Datos</h4>
      <div className="space-y-3">
        {byDatabase.map(db => {
          const dbPercent = Math.round((db.count / total) * 100);
          return (
            <div key={db.name} className="flex items-center">
              <div className="text-sm w-28 truncate" title={db.name}>
                {db.name}
              </div>
              <div className="flex-1 mx-2">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="h-2 rounded-full bg-blue-400"
                    style={{ width: `${dbPercent}%` }}
                  ></div>
                </div>
              </div>
              <div className="text-sm text-gray-600 w-20 text-right">
                {db.count} ({dbPercent}%)
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 pt-3 border-t border-gray-100 text-xs text-gray-500">
        Total de fuentes: {total}
      </div>
    </Card>
  );
};

export default SourceVerificationsCard;
