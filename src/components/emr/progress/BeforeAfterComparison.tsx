import React from 'react';
import { RangeOfMotionData, StrengthMeasurementData } from '../../../types/clinical';;;;;
import { ImprovementIndicator } from './ImprovementIndicator';;;;;

interface BeforeAfterComparisonProps {
  initialDate: string;
  currentDate: string;
  romData?: {
    [jointId: string]: {
      initial: RangeOfMotionData;
      current: RangeOfMotionData;
      label: string;
    }
  };
  strengthData?: {
    [muscleId: string]: {
      initial: StrengthMeasurementData;
      current: StrengthMeasurementData;
      label: string;
    }
  };
  className?: string;
}

export const BeforeAfterComparison: React.FC<BeforeAfterComparisonProps> = ({
  initialDate,
  currentDate,
  romData,
  strengthData,
  className
}) => {
  // Formatear fechas para mostrar
  const formatDate = (dateString: string): void => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <div className={`bg-white rounded-lg shadow p-6 ${className}`}>
      <h3 className="text-lg font-medium text-gray-900 mb-4">Comparativa de Progreso</h3>
      
      <div className="mb-3 flex justify-between">
        <div className="text-sm font-medium">
          Evaluación Inicial: <span className="text-primary-600">{formatDate(initialDate)}</span>
        </div>
        <div className="text-sm font-medium">
          Evaluación Actual: <span className="text-primary-600">{formatDate(currentDate)}</span>
        </div>
      </div>
      
      {/* Rango de Movimiento */}
      {romData && Object.keys(romData).length > 0 && (
        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-900 mb-3 border-b pb-2">Rango de Movimiento</h4>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Articulación</th>
                  <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Inicial (A/P)</th>
                  <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actual (A/P)</th>
                  <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mejora</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {Object.entries(romData).map(([jointId, data]) => (
                  <tr key={jointId}>
                    <td className="px-3 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {data.label}
                    </td>
                    <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">
                      {data.initial.active || '–'}° / {data.initial.passive || '–'}°
                    </td>
                    <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">
                      {data.current.active || '–'}° / {data.current.passive || '–'}°
                    </td>
                    <td className="px-3 py-4 whitespace-nowrap">
                      <ImprovementIndicator
                        initialValue={data.initial.active}
                        currentValue={data.current.active}
                        normalValue={data.current.normal}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      
      {/* Fuerza Muscular */}
      {strengthData && Object.keys(strengthData).length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-3 border-b pb-2">Fuerza Muscular</h4>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Grupo Muscular</th>
                  <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Inicial</th>
                  <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actual</th>
                  <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mejora</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {Object.entries(strengthData).map(([muscleId, data]) => (
                  <tr key={muscleId}>
                    <td className="px-3 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {data.label}
                    </td>
                    <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">
                      {data.initial.value}/5
                    </td>
                    <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">
                      {data.current.value}/5
                    </td>
                    <td className="px-3 py-4 whitespace-nowrap">
                      <ImprovementIndicator
                        initialValue={data.initial.value}
                        currentValue={data.current.value}
                        normalValue={5}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      
      {(!romData || Object.keys(romData).length === 0) && 
       (!strengthData || Object.keys(strengthData).length === 0) && (
        <div className="py-8 text-center text-gray-500">
          No hay datos suficientes para mostrar una comparación
        </div>
      )}
    </div>
  );
}; 