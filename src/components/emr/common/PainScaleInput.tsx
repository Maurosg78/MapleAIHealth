import React, { useMemo, memo } from 'react';

interface PainScaleInputProps {
  value: number;
  onChange: (value: number) => void;
  readOnly?: boolean;
  id?: string;
  label?: string;
}

// Definimos los niveles de dolor fuera del componente, ya que son constantes
const PAIN_LEVELS = [
  { value: 0, label: 'Sin dolor', color: 'bg-green-500' },
  { value: 1, label: 'Muy leve', color: 'bg-green-400' },
  { value: 2, label: 'Leve', color: 'bg-green-300' },
  { value: 3, label: 'Leve-Moderado', color: 'bg-yellow-300' },
  { value: 4, label: 'Moderado', color: 'bg-yellow-400' },
  { value: 5, label: 'Moderado-Intenso', color: 'bg-yellow-500' },
  { value: 6, label: 'Intenso', color: 'bg-orange-400' },
  { value: 7, label: 'Muy intenso', color: 'bg-orange-500' },
  { value: 8, label: 'Muy muy intenso', color: 'bg-red-400' },
  { value: 9, label: 'Insoportable', color: 'bg-red-500' },
  { value: 10, label: 'El peor dolor posible', color: 'bg-red-600' },
];

// Componente para los marcadores de nivel
const PainLevelMarkers = memo(() => (
  <div className="flex justify-between text-xs text-gray-500" aria-hidden="true">
    <span>0</span>
    <span>5</span>
    <span>10</span>
  </div>
));

// Componente para la barra de color
const PainLevelBar = memo(({ currentValue }: { currentValue: number }) => (
  <div className="mt-2 flex rounded-md overflow-hidden h-3" aria-hidden="true">
    {PAIN_LEVELS.map((level) => (
      <div
        key={level.value}
        className={`${level.color} ${
          currentValue >= level.value ? 'opacity-100' : 'opacity-30'
        } flex-1`}
        title={`${level.value}: ${level.label}`}
      />
    ))}
  </div>
));

/**
 * Componente de escala de dolor (0-10)
 * Reutilizable para cualquier especialidad médica
 */
export const PainScaleInput: React.FC<PainScaleInputProps> = memo(({
  value,
  onChange,
  readOnly = false,
  id = 'pain-scale-input',
  label = 'Nivel de dolor'
}) => {
  // Memoizar el texto descriptivo actual para evitar búsquedas repetitivas
  const currentLevelLabel = useMemo(() => 
    PAIN_LEVELS.find((level) => level.value === value)?.label || '',
  [value]);

  // Memoizar el texto para lectores de pantalla
  const ariaValueText = useMemo(() => 
    PAIN_LEVELS.find((level) => level.value === value)?.label || '',
  [value]);

  return (
    <div className="w-full">
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <div className="flex items-center mb-2">
        <input
          id={id}
          type="range"
          min={0}
          max={10}
          step={1}
          value={value}
          onChange={(e) => onChange(parseInt(e.target.value, 10))}
          disabled={readOnly}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          aria-label={label}
          aria-valuetext={ariaValueText}
        />
        <span className="ml-2 font-medium text-lg w-8 text-center" aria-hidden="true">{value}</span>
      </div>
      
      <PainLevelMarkers />
      <PainLevelBar currentValue={value} />
      
      <div className="mt-1 text-sm text-gray-700">
        {currentLevelLabel}
      </div>
    </div>
  );
}); 