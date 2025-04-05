import * as React from 'react';
import { memo } from 'react';
import Alert from '../common/Alert';

export type ClinicalAlertSeverity = 'critical' | 'high' | 'moderate' | 'low' | 'info';
export type ClinicalAlertType = 'contraindication' | 'interaction' | 'monitoring' | 'advisory' | 'clinical-decision';

export interface ClinicalAlertProps {
  id: string;
  title: string;
  description: string;
  severity: ClinicalAlertSeverity;
  type: ClinicalAlertType;
  timestamp: Date;
  acknowledged?: boolean;
  relatedItems?: Array<{
    id: string;
    name: string;
    type: 'medication' | 'condition' | 'patient' | 'appointment';
  }>;
  actions?: Array<{
    id: string;
    label: string;
    action: 'dismiss' | 'view' | 'custom';
    url?: string;
  }>;
  relatedPatientId?: string;
  relatedMedication?: string;
  relatedCondition?: string;
  relatedProcedure?: string;
  source?: string;
  recommendations?: string[];
  evidence?: {
    level: 'A' | 'B' | 'C' | 'D';
    source: string;
  };
  onDismiss?: (id: string) => void;
  onAction?: (id: string, action: string) => void;
  className?: string;
}

/**
 * Componente especializado para mostrar alertas clínicas.
 * Permite categorizar y priorizar alertas médicas según su severidad y tipo.
 */
const ClinicalAlert: React.FC<ClinicalAlertProps> = memo(({
  id,
  title,
  description,
  severity,
  type,
  timestamp,
  relatedPatientId,
  relatedMedication,
  relatedCondition,
  relatedProcedure,
  source,
  recommendations = [],
  evidence,
  onDismiss,
  onAction,
  className = '',
}) => {
  // Mapear la severidad clínica a la variante del componente Alert
  const mapSeverityToVariant = (): 'error' | 'warning' | 'info' | 'success' => {
    switch (severity) {
      case 'critical':
      case 'high':
        return 'error';
      case 'moderate':
        return 'warning';
      case 'low':
      case 'info':
        return 'info';
      default:
        return 'info';
    }
  };

  // Obtener la fecha formateada para mostrar
  const formattedDate = timestamp ? new Intl.DateTimeFormat('es', {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(timestamp) : '';

  // Icono personalizado según el tipo de alerta
  const getCustomIcon = () => {
    switch (type) {
      case 'contraindication':
        return (
          <svg className="w-5 h-5 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"></path>
          </svg>
        );
      case 'interaction':
        return (
          <svg className="w-5 h-5 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
          </svg>
        );
      case 'monitoring':
        return (
          <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
          </svg>
        );
      case 'clinical-decision':
        return (
          <svg className="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
        );
    }
  };

  const handleDismiss = () => {
    if (onDismiss) {
      onDismiss(id);
    }
  };

  return (
    <Alert
      variant={mapSeverityToVariant()}
      title={title}
      icon={getCustomIcon()}
      onClose={onDismiss ? handleDismiss : undefined}
      className={`clinical-alert ${className}`}
    >
      <div className="space-y-2">
        <p>{description}</p>

        {/* Metadatos de la alerta */}
        <div className="flex flex-wrap text-xs gap-x-4 gap-y-1 mt-2">
          <span className="text-gray-600 dark:text-gray-400">
            <strong>Tipo:</strong> {type}
          </span>
          <span className="text-gray-600 dark:text-gray-400">
            <strong>Fecha:</strong> {formattedDate}
          </span>
          {source && (
            <span className="text-gray-600 dark:text-gray-400">
              <strong>Fuente:</strong> {source}
            </span>
          )}
          {evidence && (
            <span className="text-gray-600 dark:text-gray-400">
              <strong>Evidencia:</strong> Nivel {evidence.level} ({evidence.source})
            </span>
          )}
        </div>

        {/* Información contextual */}
        {(relatedPatientId || relatedMedication || relatedCondition || relatedProcedure) && (
          <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
            <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Información relacionada:</p>
            <div className="flex flex-wrap text-xs gap-x-4 gap-y-1">
              {relatedPatientId && (
                <span className="text-gray-600 dark:text-gray-400">
                  <strong>Paciente:</strong> {relatedPatientId}
                </span>
              )}
              {relatedMedication && (
                <span className="text-gray-600 dark:text-gray-400">
                  <strong>Medicamento:</strong> {relatedMedication}
                </span>
              )}
              {relatedCondition && (
                <span className="text-gray-600 dark:text-gray-400">
                  <strong>Condición:</strong> {relatedCondition}
                </span>
              )}
              {relatedProcedure && (
                <span className="text-gray-600 dark:text-gray-400">
                  <strong>Procedimiento:</strong> {relatedProcedure}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Mostrar recomendaciones si existen */}
        {recommendations.length > 0 && (
          <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
            <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Recomendaciones:</p>
            <ul className="list-disc pl-5 text-xs text-gray-600 dark:text-gray-400 space-y-1">
              {recommendations.map((recommendation, index) => (
                <li key={index}>{recommendation}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Botones de acción */}
        {onAction && (
          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={() => onAction(id, 'view-details')}
              className="px-3 py-1 text-xs rounded bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Ver detalles
            </button>
            {severity === 'critical' || severity === 'high' ? (
              <button
                onClick={() => onAction(id, 'intervene')}
                className="px-3 py-1 text-xs rounded bg-red-100 hover:bg-red-200 dark:bg-red-900/30 dark:hover:bg-red-900/50 text-red-700 dark:text-red-300 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                Intervenir
              </button>
            ) : (
              <button
                onClick={() => onAction(id, 'acknowledge')}
                className="px-3 py-1 text-xs rounded bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 text-blue-700 dark:text-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Confirmar
              </button>
            )}
          </div>
        )}
      </div>
    </Alert>
  );
});

ClinicalAlert.displayName = 'ClinicalAlert';

export default ClinicalAlert;
