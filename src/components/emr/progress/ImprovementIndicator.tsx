import React from 'react';
import { ArrowUpIcon, ArrowDownIcon, MinusIcon } from '@heroicons/react/solid';

interface ImprovementIndicatorProps {
  initialValue: number | undefined;
  currentValue: number | undefined;
  normalValue?: number;
  className?: string;
}

export const ImprovementIndicator: React.FC<ImprovementIndicatorProps> = ({
  initialValue,
  currentValue,
  normalValue,
  className
}) => {
  // No podemos calcular si falta algún valor
  if (initialValue === undefined || currentValue === undefined) {
    return null;
  }

  // Calcular la diferencia absoluta y el porcentaje
  const difference = currentValue - initialValue;
  const percentChange = initialValue !== 0 
    ? Math.round((difference / initialValue) * 100) 
    : 0;
  
  // Determinar si es una mejora o empeoramiento según contexto
  const isNormalHigherBetter = !normalValue || normalValue >= initialValue;
  const isImprovement = isNormalHigherBetter ? difference > 0 : difference < 0;
  
  // Calcular el porcentaje respecto al valor normal si está disponible
  const percentOfNormal = normalValue 
    ? Math.round((currentValue / normalValue) * 100) 
    : null;

  // Determinar el color según si hay mejora
  const valueColor = isImprovement ? 'text-green-500' : difference < 0 ? 'text-red-500' : 'text-gray-500';
  
  return (
    <div className={`flex flex-col ${className}`}>
      <div className={`flex items-center ${valueColor}`}>
        {difference === 0 ? (
          <MinusIcon className="w-4 h-4 mr-1" />
        ) : isImprovement ? (
          <ArrowUpIcon className="w-4 h-4 mr-1" />
        ) : (
          <ArrowDownIcon className="w-4 h-4 mr-1" />
        )}
        
        <span className="font-medium">
          {difference > 0 ? '+' : ''}{difference}° ({percentChange > 0 ? '+' : ''}{percentChange}%)
        </span>
      </div>
      
      {normalValue && percentOfNormal !== null && (
        <div className="text-xs text-gray-500 mt-1">
          {currentValue}/{normalValue}° ({percentOfNormal}% del normal)
        </div>
      )}
    </div>
  );
}; 