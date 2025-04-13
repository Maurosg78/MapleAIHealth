import { useMemo } from 'react';
import clsx from 'clsx';
import { RangeOfMotionData } from '../../../types/clinical';
import { ImprovementIndicator } from './ImprovementIndicator';

interface ROMProgressChartProps {
  data: {
    date: string;
    rom: RangeOfMotionData;
  }[];
  joint: string;
  className?: string;
  showNormal?: boolean;
}

const MAX_BAR_HEIGHT = 200;
const MIN_BAR_HEIGHT = 10;

export const ROMProgressChart = ({ 
  data, 
  joint, 
  className, 
  showNormal = true 
}: ROMProgressChartProps) => {
  // Procesar los datos para la visualización
  const { chartData, maxValue, initialValues, latestValues } = useMemo(() => {
    if (!data || data.length === 0) {
      return { chartData: [], maxValue: 100, initialValues: {}, latestValues: {} };
    }

    // Ordenar los datos por fecha
    const sortedData = [...data].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    // Guardar valores iniciales y actuales para cálculo de mejora
    const initialValues = sortedData[0].rom;
    const latestValues = sortedData[sortedData.length - 1].rom;

    // Encontrar el valor máximo para escalar las barras
    let max = 0;
    data.forEach(item => {
      if (item.rom.active && item.rom.active > max) max = item.rom.active;
      if (item.rom.passive && item.rom.passive > max) max = item.rom.passive;
      if (showNormal && item.rom.normal && item.rom.normal > max) max = item.rom.normal;
    });

    // Asegurar un valor máximo razonable
    const maxValue = Math.max(max, 90);

    return {
      chartData: sortedData,
      maxValue,
      initialValues,
      latestValues
    };
  }, [data, showNormal]);

  // Calcular la altura de la barra basada en el valor y el valor máximo
  const calculateBarHeight = (value: number | undefined) => {
    if (!value) return MIN_BAR_HEIGHT;
    const height = (value / maxValue) * MAX_BAR_HEIGHT;
    return Math.max(height, MIN_BAR_HEIGHT);
  };

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-40 bg-gray-50 rounded-lg">
        <p className="text-gray-500">No hay datos disponibles para {joint}</p>
      </div>
    );
  }

  return (
    <div className={clsx("p-4 bg-white rounded-lg shadow", className)}>
      <div className="flex justify-between items-start mb-4">
        <h3 className="font-medium text-gray-900">Progreso ROM: {joint}</h3>
        
        {data.length > 1 && (
          <div className="flex flex-col space-y-1">
            <div className="flex items-center">
              <span className="text-xs text-gray-500 mr-2">Activo:</span>
              <ImprovementIndicator 
                initialValue={initialValues.active}
                currentValue={latestValues.active}
                normalValue={latestValues.normal}
              />
            </div>
            <div className="flex items-center">
              <span className="text-xs text-gray-500 mr-2">Pasivo:</span>
              <ImprovementIndicator 
                initialValue={initialValues.passive}
                currentValue={latestValues.passive}
                normalValue={latestValues.normal}
              />
            </div>
          </div>
        )}
      </div>
      
      <div className="flex flex-col">
        <div className="flex justify-between mb-2">
          <div className="flex items-center">
            <span className="w-3 h-3 bg-blue-500 rounded-full mr-2"></span>
            <span className="text-sm">Activo</span>
          </div>
          <div className="flex items-center">
            <span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
            <span className="text-sm">Pasivo</span>
          </div>
          {showNormal && (
            <div className="flex items-center">
              <span className="w-3 h-3 border border-gray-400 rounded-full mr-2"></span>
              <span className="text-sm">Normal</span>
            </div>
          )}
        </div>

        <div className="relative h-[250px]">
          {/* Líneas de referencia */}
          <div className="absolute left-0 right-0 top-0 bottom-0">
            {[0, 25, 50, 75, 100].map((percent) => (
              <div 
                key={percent} 
                className="absolute left-0 right-0 border-t border-gray-200" 
                style={{ top: `${100 - percent}%` }}
              >
                <span className="absolute -left-7 -translate-y-1/2 text-xs text-gray-500">
                  {Math.round(maxValue * (percent / 100))}°
                </span>
              </div>
            ))}
          </div>

          {/* Barras del gráfico */}
          <div className="absolute left-0 right-0 bottom-0 flex items-end justify-around h-full">
            {chartData.map((item, index) => (
              <div key={index} className="flex flex-col items-center group w-16">
                {/* Barras de datos */}
                <div className="relative flex items-end space-x-1 mb-2">
                  {/* Valor Normal (línea) */}
                  {showNormal && item.rom.normal && item.rom.normal > 0 && (
                    <div 
                      className="absolute w-12 border-t border-gray-400 border-dashed"
                      style={{ bottom: `${calculateBarHeight(item.rom.normal)}px` }}
                    />
                  )}
                  
                  {/* Valor Activo */}
                  <div 
                    className="w-5 bg-blue-500 rounded-t"
                    style={{ height: `${calculateBarHeight(item.rom.active)}px` }}
                  >
                    <div className="opacity-0 group-hover:opacity-100 absolute -top-6 left-0 bg-blue-700 text-white px-1 rounded text-xs whitespace-nowrap">
                      Activo: {item.rom.active || 0}°
                    </div>
                  </div>
                  
                  {/* Valor Pasivo */}
                  <div 
                    className="w-5 bg-green-500 rounded-t"
                    style={{ height: `${calculateBarHeight(item.rom.passive)}px` }}
                  >
                    <div className="opacity-0 group-hover:opacity-100 absolute -top-6 right-0 bg-green-700 text-white px-1 rounded text-xs whitespace-nowrap">
                      Pasivo: {item.rom.passive || 0}°
                    </div>
                  </div>
                </div>
                
                {/* Fecha */}
                <span className="text-xs text-gray-500 transform -rotate-45 origin-top-left mt-2">
                  {new Date(item.date).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' })}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}; 