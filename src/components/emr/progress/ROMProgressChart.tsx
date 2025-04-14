import React, { useMemo } from 'react';
import clsx from 'clsx';
import { RangeOfMotionData } from '../../../types/clinical';
import { ImprovementIndicator } from './ImprovementIndicator';
import { validateROMValues } from '../../../utils/validation';

interface ROMProgressChartProps {
  data: Array<{
    date: string;
    rom: RangeOfMotionData;
  }>;
  joint: string;
  className?: string;
  showNormal?: boolean;
}

const MIN_BAR_HEIGHT = 10;

// Componente de barra individual memoizado
const BarComponent = React.memo(({ 
  value, 
  maxValue, 
  color, 
  label 
}: { 
  value?: number; 
  maxValue: number; 
  color: string; 
  label: string;
}) => {
  // Calcular la altura de la barra basada en el valor y el valor máximo
  const height = useMemo(() => {
    if (value === undefined) return 0;
    const calculatedHeight = (value / maxValue) * 150;
    return Math.max(calculatedHeight, MIN_BAR_HEIGHT);
  }, [value, maxValue]);

  if (!value && value !== 0) return null;

  return (
    <div 
      className={`w-5 bg-${color}-500 rounded-t`}
      style={{ height: `${height}px` }}
    >
      <div className="opacity-0 group-hover:opacity-100 absolute -top-6 bg-blue-700 text-white px-1 rounded text-xs whitespace-nowrap">
        {label}: {value || 0}°
      </div>
    </div>
  );
});

BarComponent.displayName = 'BarComponent';

// Componente para la línea normal
const NormalLine = React.memo(({ value, maxValue }: { value?: number; maxValue: number }) => {
  const height = useMemo(() => {
    if (value === undefined) return 0;
    return (value / maxValue) * 150;
  }, [value, maxValue]);

  if (!value) return null;

  return (
    <div 
      className="absolute w-12 border-t border-gray-400 border-dashed"
      style={{ bottom: `${height}px` }}
    />
  );
});

NormalLine.displayName = 'NormalLine';

// Componente para una barra de datos (conjunto de active, passive, normal)
const DataBar = React.memo(({ 
  item, 
  maxValue, 
  showNormal
}: { 
  item: { date: string; rom: RangeOfMotionData }; 
  maxValue: number; 
  showNormal: boolean;
}) => {
  const formattedDate = useMemo(() => {
    return new Date(item.date).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' });
  }, [item.date]);

  return (
    <div className="flex flex-col items-center group w-16">
      <div className="relative flex items-end space-x-1 mb-2">
        {showNormal && item.rom.normal && item.rom.normal > 0 && (
          <NormalLine value={item.rom.normal} maxValue={maxValue} />
        )}
        
        <BarComponent 
          value={item.rom.active} 
          maxValue={maxValue} 
          color="blue" 
          label="Activo" 
        />
        
        <BarComponent 
          value={item.rom.passive} 
          maxValue={maxValue} 
          color="green" 
          label="Pasivo" 
        />
      </div>
      
      <span className="text-xs text-gray-500 transform -rotate-45 origin-top-left mt-2">
        {formattedDate}
      </span>
    </div>
  );
});

DataBar.displayName = 'DataBar';

// Componente principal optimizado con React.memo
export const ROMProgressChart = React.memo(({
  data,
  joint,
  className,
  showNormal = true
}: ROMProgressChartProps) => {
  // Procesar los datos para la visualización de manera optimizada
  const { chartData, maxValue, initialValues, latestValues, hasValidData } = useMemo(() => {
    // Definir valores por defecto
    const defaultResult = { 
      chartData: [] as Array<{date: string; rom: RangeOfMotionData}>, 
      maxValue: 100, 
      initialValues: { active: undefined, passive: undefined, normal: undefined } as RangeOfMotionData, 
      latestValues: { active: undefined, passive: undefined, normal: undefined } as RangeOfMotionData,
      hasValidData: false
    };
    
    if (!data || data.length === 0) {
      return defaultResult;
    }

    // Filtramos datos con valores válidos en una sola pasada
    const validData = data.filter(item => item.rom && validateROMValues(item.rom));
    
    if (validData.length === 0) {
      return defaultResult;
    }

    // Ordenar los datos por fecha
    const sortedData = [...validData].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    // Extraer valores iniciales y finales para comparación
    const initialValues: RangeOfMotionData = {...sortedData[0].rom};
    const latestValues: RangeOfMotionData = {...sortedData[sortedData.length - 1].rom};

    // Encontrar el valor máximo para escalar las barras en una sola pasada
    const max = validData.reduce((maxVal, item) => {
      const { active, passive, normal } = item.rom;
      let localMax = maxVal;
      
      if (active !== undefined && active > localMax) localMax = active;
      if (passive !== undefined && passive > localMax) localMax = passive;
      if (showNormal && normal !== undefined && normal > localMax) localMax = normal;
      
      return localMax;
    }, 0);

    return {
      chartData: sortedData,
      maxValue: max || 100, // Asegurar un valor mínimo de 100 si no hay datos
      initialValues,
      latestValues,
      hasValidData: true
    };
  }, [data, showNormal]);

  // Generar valores de referencia en función del máximo
  const referenceValues = useMemo(() => {
    return [0, 25, 50, 75, 100].map(percent => ({
      percent,
      value: Math.round(maxValue * (percent / 100))
    }));
  }, [maxValue]);

  // Si no hay datos válidos, mostrar mensaje apropiado
  if (!hasValidData) {
    return (
      <div className="text-center p-4 text-gray-500">
        {!data || data.length === 0 
          ? `No hay datos de progreso disponibles para ${joint}` 
          : `Los datos de ROM no son válidos para ${joint}`}
      </div>
    );
  }

  return (
    <div className={clsx("p-4 bg-white rounded-lg shadow", className)}>
      <div className="flex justify-between items-start mb-4">
        <h3 className="font-medium text-gray-900">Progreso ROM: {joint}</h3>
        
        {hasValidData && (
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
            {referenceValues.map(({ percent, value }) => (
              <div 
                key={percent} 
                className="absolute left-0 right-0 border-t border-gray-200" 
                style={{ top: `${100 - percent}%` }}
              >
                <span className="absolute -left-7 -translate-y-1/2 text-xs text-gray-500">
                  {value}°
                </span>
              </div>
            ))}
          </div>

          {/* Barras del gráfico */}
          <div className="absolute left-0 right-0 bottom-0 flex items-end justify-around h-full">
            {chartData.map((item, index) => (
              <DataBar 
                key={`${item.date}-${index}`}
                item={item}
                maxValue={maxValue}
                showNormal={showNormal}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}); 