import React, { useState } from 'react';
import { XCircleIcon, ExclamationIcon } from '@heroicons/react/solid';;;;;

interface MissingDataAlertProps {
  missingFields: string[];
  onRequestData: () => void;
}

/**
 * Componente de alerta que muestra información faltante y solicita al médico completarla
 * 
 * ADVERTENCIA DE SEGURIDAD MÉDICA - PRIORIDAD ALTA
 * Este sistema nunca generará datos médicos faltantes y siempre solicitará
 * al profesional médico que complete la información necesaria antes de realizar
 * cualquier tipo de análisis o recomendación.
 */
export const MissingDataAlert: React.FC<MissingDataAlertProps> = ({ 
  missingFields,
  onRequestData
}) => {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible || missingFields.length === 0) {
    return null;
  }

  return (
    <div className="rounded-md bg-red-50 p-4 mb-6 border border-red-200 shadow-sm">
      <div className="flex">
        <div className="flex-shrink-0">
          <ExclamationIcon className="h-5 w-5 text-red-600" aria-hidden="true" />
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium text-red-800">
            Información clínica incompleta - Se requiere acción
          </h3>
          <div className="mt-2 text-sm text-red-700">
            <p className="mb-2">
              No es posible proporcionar asistencia clínica sin la siguiente información:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              {missingFields.map((field, index) => (
                <li key={index}>{field}</li>
              ))}
            </ul>
          </div>
          <div className="mt-4">
            <div className="-mx-2 -my-1.5 flex">
              <button
                type="button"
                className="bg-red-50 px-3 py-1.5 rounded-md text-sm font-medium text-red-800 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-600"
                onClick={onRequestData}
              >
                Completar información
              </button>
              <button
                type="button"
                className="ml-3 bg-red-50 px-2 py-1.5 rounded-md text-sm font-medium text-red-800 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-600"
                onClick={() => setIsVisible(false)}
              >
                Descartar
              </button>
            </div>
          </div>
          <div className="mt-3 border-t border-red-200 pt-2">
            <p className="text-xs text-red-700 font-medium">
              ADVERTENCIA: La generación de análisis o recomendaciones médicas sin información completa 
              constituye una infracción grave. El asistente AIDUX nunca proporcionará información médica basada en datos incompletos.
            </p>
          </div>
        </div>
        <div className="ml-auto pl-3">
          <div className="-mx-1.5 -my-1.5">
            <button
              type="button"
              className="inline-flex bg-red-50 rounded-md p-1.5 text-red-500 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-600"
              onClick={() => setIsVisible(false)}
            >
              <span className="sr-only">Descartar</span>
              <XCircleIcon className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}; 