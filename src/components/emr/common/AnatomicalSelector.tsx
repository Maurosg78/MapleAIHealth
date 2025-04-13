import React, { useState, useMemo, useCallback, memo } from 'react';

interface AnatomicalSelectorProps {
  value: string[];
  onChange: (locations: string[]) => void;
  readOnly?: boolean;
  id?: string;
  label?: string;
  description?: string;
}

// Definimos las regiones anatómicas fuera del componente, ya que son constantes
const ANATOMICAL_REGIONS = {
  anterior: [
    { id: 'head_anterior', label: 'Cabeza', polygon: '120,20 140,20 140,40 120,40' },
    { id: 'neck_anterior', label: 'Cuello', polygon: '120,40 140,40 140,55 120,55' },
    { id: 'chest', label: 'Pecho', polygon: '110,55 150,55 150,90 110,90' },
    { id: 'abdomen', label: 'Abdomen', polygon: '110,90 150,90 150,120 110,120' },
    { id: 'pelvis', label: 'Pelvis', polygon: '110,120 150,120 150,140 110,140' },
    { id: 'left_shoulder', label: 'Hombro Izquierdo', polygon: '95,55 110,55 110,70 95,70' },
    { id: 'right_shoulder', label: 'Hombro Derecho', polygon: '150,55 165,55 165,70 150,70' },
    { id: 'left_arm', label: 'Brazo Izquierdo', polygon: '85,70 95,70 95,100 85,100' },
    { id: 'right_arm', label: 'Brazo Derecho', polygon: '165,70 175,70 175,100 165,100' },
    { id: 'left_elbow', label: 'Codo Izquierdo', polygon: '80,100 95,100 95,110 80,110' },
    { id: 'right_elbow', label: 'Codo Derecho', polygon: '165,100 180,100 180,110 165,110' },
    { id: 'left_forearm', label: 'Antebrazo Izquierdo', polygon: '75,110 90,110 90,140 75,140' },
    { id: 'right_forearm', label: 'Antebrazo Derecho', polygon: '170,110 185,110 185,140 170,140' },
    { id: 'left_hand', label: 'Mano Izquierda', polygon: '70,140 85,140 85,155 70,155' },
    { id: 'right_hand', label: 'Mano Derecha', polygon: '175,140 190,140 190,155 175,155' },
    { id: 'left_thigh', label: 'Muslo Izquierdo', polygon: '110,140 125,140 125,180 110,180' },
    { id: 'right_thigh', label: 'Muslo Derecho', polygon: '135,140 150,140 150,180 135,180' },
    { id: 'left_knee', label: 'Rodilla Izquierda', polygon: '110,180 125,180 125,195 110,195' },
    { id: 'right_knee', label: 'Rodilla Derecha', polygon: '135,180 150,180 150,195 135,195' },
    { id: 'left_leg', label: 'Pierna Izquierda', polygon: '110,195 125,195 125,235 110,235' },
    { id: 'right_leg', label: 'Pierna Derecha', polygon: '135,195 150,195 150,235 135,235' },
    { id: 'left_foot', label: 'Pie Izquierdo', polygon: '110,235 125,235 125,250 110,250' },
    { id: 'right_foot', label: 'Pie Derecho', polygon: '135,235 150,235 150,250 135,250' },
  ],
  posterior: [
    { id: 'head_posterior', label: 'Cabeza (posterior)', polygon: '220,20 240,20 240,40 220,40' },
    { id: 'neck_posterior', label: 'Cuello (posterior)', polygon: '220,40 240,40 240,55 220,55' },
    { id: 'upper_back', label: 'Espalda Superior', polygon: '210,55 250,55 250,90 210,90' },
    { id: 'lower_back', label: 'Espalda Inferior', polygon: '210,90 250,90 250,120 210,120' },
    { id: 'buttocks', label: 'Glúteos', polygon: '210,120 250,120 250,140 210,140' },
    { id: 'left_shoulder_back', label: 'Hombro Izquierdo (posterior)', polygon: '195,55 210,55 210,70 195,70' },
    { id: 'right_shoulder_back', label: 'Hombro Derecho (posterior)', polygon: '250,55 265,55 265,70 250,70' },
    { id: 'left_arm_back', label: 'Brazo Izquierdo (posterior)', polygon: '185,70 195,70 195,100 185,100' },
    { id: 'right_arm_back', label: 'Brazo Derecho (posterior)', polygon: '265,70 275,70 275,100 265,100' },
    { id: 'left_elbow_back', label: 'Codo Izquierdo (posterior)', polygon: '180,100 195,100 195,110 180,110' },
    { id: 'right_elbow_back', label: 'Codo Derecho (posterior)', polygon: '265,100 280,100 280,110 265,110' },
    { id: 'left_forearm_back', label: 'Antebrazo Izquierdo (posterior)', polygon: '175,110 190,110 190,140 175,140' },
    { id: 'right_forearm_back', label: 'Antebrazo Derecho (posterior)', polygon: '270,110 285,110 285,140 270,140' },
    { id: 'left_hand_back', label: 'Mano Izquierda (posterior)', polygon: '170,140 185,140 185,155 170,155' },
    { id: 'right_hand_back', label: 'Mano Derecha (posterior)', polygon: '275,140 290,140 290,155 275,155' },
    { id: 'left_thigh_back', label: 'Muslo Izquierdo (posterior)', polygon: '210,140 225,140 225,180 210,180' },
    { id: 'right_thigh_back', label: 'Muslo Derecho (posterior)', polygon: '235,140 250,140 250,180 235,180' },
    { id: 'left_knee_back', label: 'Rodilla Izquierda (posterior)', polygon: '210,180 225,180 225,195 210,195' },
    { id: 'right_knee_back', label: 'Rodilla Derecha (posterior)', polygon: '235,180 250,180 250,195 235,195' },
    { id: 'left_leg_back', label: 'Pierna Izquierda (posterior)', polygon: '210,195 225,195 225,235 210,235' },
    { id: 'right_leg_back', label: 'Pierna Derecha (posterior)', polygon: '235,195 250,195 250,235 235,235' },
    { id: 'left_foot_back', label: 'Pie Izquierdo (posterior)', polygon: '210,235 225,235 225,250 210,250' },
    { id: 'right_foot_back', label: 'Pie Derecho (posterior)', polygon: '235,235 250,235 250,250 235,250' },
  ]
};

// Componente para el botón de selección de vista
const ViewButton = memo(({ 
  label, 
  isActive, 
  onClick, 
  isDisabled, 
  ariaLabel 
}: { 
  label: string; 
  isActive: boolean; 
  onClick: () => void; 
  isDisabled: boolean; 
  ariaLabel: string;
}) => (
  <button
    type="button"
    onClick={onClick}
    className={`px-4 py-2 text-sm font-medium rounded-md ${
      isActive
        ? 'bg-primary-600 text-white'
        : 'bg-white text-gray-700 border border-gray-300'
    }`}
    disabled={isDisabled}
    aria-label={ariaLabel}
  >
    {label}
  </button>
));

// Componente para una región anatómica seleccionable
const AnatomicalRegion = memo(({ 
  region, 
  isSelected, 
  onClick, 
  onKeyDown, 
  onFocus, 
  isReadOnly, 
  focusId 
}: { 
  region: typeof ANATOMICAL_REGIONS.anterior[0];
  isSelected: boolean;
  onClick: () => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  onFocus: () => void;
  isReadOnly: boolean;
  focusId?: string;
}) => (
  <polygon
    key={region.id}
    points={region.polygon}
    fill={isSelected ? "rgba(79, 70, 229, 0.5)" : "transparent"}
    stroke="rgba(79, 70, 229, 0.8)"
    strokeWidth="1"
    onClick={onClick}
    onKeyDown={onKeyDown}
    onFocus={onFocus}
    className="transition-colors duration-200 hover:fill-indigo-200"
    data-testid={`region-${region.id}`}
    role="button"
    tabIndex={isReadOnly ? -1 : 0}
    aria-label={`${region.label}${isSelected ? ' (seleccionada)' : ''}`}
    aria-describedby={focusId}
  >
    <title>{region.label}</title>
  </polygon>
));

// Componente para una etiqueta de región seleccionada
const SelectedRegionTag = memo(({ 
  label, 
  onRemove, 
  readOnly 
}: { 
  label: string; 
  onRemove: () => void; 
  readOnly: boolean;
}) => (
  <li className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
    {label}
    {!readOnly && (
      <button
        type="button"
        onClick={onRemove}
        className="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full text-indigo-400 hover:bg-indigo-200 hover:text-indigo-500 focus:outline-none focus:bg-indigo-200"
        aria-label={`Eliminar ${label}`}
      >
        ×
      </button>
    )}
  </li>
));

/**
 * Componente selector anatómico para marcar zonas del cuerpo afectadas
 * Diseñado para ser reutilizable en diferentes especialidades médicas
 */
export const AnatomicalSelector: React.FC<AnatomicalSelectorProps> = memo(({
  value = [],
  onChange,
  readOnly = false,
  id = 'anatomical-selector',
  label = 'Selector de regiones anatómicas',
  description = 'Seleccione las áreas del cuerpo afectadas haciendo clic en la imagen o usando la tecla Enter al navegar con el teclado.'
}) => {
  const [activeView, setActiveView] = useState<'anterior' | 'posterior'>('anterior');
  const [focusedRegion, setFocusedRegion] = useState<string | null>(null);
  
  // Usar useCallback para las funciones principales
  const toggleRegion = useCallback((regionId: string) => {
    if (readOnly) return;
    
    const isSelected = value.includes(regionId);
    const newValue = isSelected
      ? value.filter(id => id !== regionId)
      : [...value, regionId];
    
    onChange(newValue);
    
    // Actualizar el estado de enfoque
    setFocusedRegion(regionId);
  }, [readOnly, value, onChange, setFocusedRegion]);
  
  const handleKeyDown = useCallback((event: React.KeyboardEvent, regionId: string) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      toggleRegion(regionId);
    }
  }, [toggleRegion]);

  const handleViewChange = useCallback((view: 'anterior' | 'posterior') => {
    setActiveView(view);
  }, []);
  
  // Memoizar los datos filtrados para evitar cálculos en cada renderizado
  const activeRegions = useMemo(() => ANATOMICAL_REGIONS[activeView], [activeView]);
  
  // Memoizar la descripción de la región enfocada para evitar recálculos
  const focusDescription = useMemo(() => {
    if (!focusedRegion) return '';
    
    const region = 
      ANATOMICAL_REGIONS.anterior.find(r => r.id === focusedRegion) ||
      ANATOMICAL_REGIONS.posterior.find(r => r.id === focusedRegion);
    
    const isSelected = value.includes(focusedRegion);
    
    return region
      ? `${region.label} ${isSelected ? 'seleccionada' : 'no seleccionada'}. Presione Enter para ${isSelected ? 'deseleccionar' : 'seleccionar'}.`
      : '';
  }, [focusedRegion, value]);

  // Memoizar las regiones seleccionadas para la lista
  const selectedRegions = useMemo(() => {
    return value.map(regionId => {
      const region = 
        ANATOMICAL_REGIONS.anterior.find(r => r.id === regionId) ||
        ANATOMICAL_REGIONS.posterior.find(r => r.id === regionId);
      
      return region ? { id: regionId, label: region.label } : null;
    }).filter(Boolean);
  }, [value]);
  
  return (
    <div className="w-full">
      <div className="mb-2">
        <label id={`${id}-label`} className="block text-sm font-medium text-gray-700">
          {label}
        </label>
        <p id={`${id}-description`} className="mt-1 text-sm text-gray-500">
          {description}
        </p>
      </div>
      
      <div className="flex justify-center space-x-4 mb-4">
        <ViewButton
          label="Vista Anterior"
          isActive={activeView === 'anterior'}
          onClick={() => handleViewChange('anterior')}
          isDisabled={readOnly}
          ariaLabel={`Ver vista anterior del cuerpo${activeView === 'anterior' ? ' (seleccionada)' : ''}`}
        />
        <ViewButton
          label="Vista Posterior"
          isActive={activeView === 'posterior'}
          onClick={() => handleViewChange('posterior')}
          isDisabled={readOnly}
          ariaLabel={`Ver vista posterior del cuerpo${activeView === 'posterior' ? ' (seleccionada)' : ''}`}
        />
      </div>
      
      <div 
        className="relative w-full h-[300px] border border-gray-300 rounded-lg overflow-hidden bg-gray-50"
        aria-labelledby={`${id}-label`}
        aria-describedby={`${id}-description`}
        role="group"
      >
        {/* Imagen base del cuerpo humano - Simplificada para este ejemplo */}
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 360 280"
          xmlns="http://www.w3.org/2000/svg"
          className={`${readOnly ? 'pointer-events-none' : 'cursor-pointer'}`}
          role="img"
          aria-label={`Selección anatómica - Vista ${activeView === 'anterior' ? 'anterior' : 'posterior'}`}
        >
          {/* Silueta base del cuerpo humano */}
          <path
            d="M130,20 C130,20 110,30 110,50 C110,70 120,80 120,100 C120,120 100,140 100,160 C100,180 110,190 110,220 C110,250 100,280 100,280 L150,280 C150,280 140,250 140,220 C140,190 150,180 150,160 C150,140 130,120 130,100 C130,80 140,70 140,50 C140,30 130,20 130,20 Z"
            fill="#f3f4f6"
            stroke="#d1d5db"
            strokeWidth="1"
            opacity={activeView === 'anterior' ? '1' : '0'}
            aria-hidden="true"
          />
          <path
            d="M230,20 C230,20 210,30 210,50 C210,70 220,80 220,100 C220,120 200,140 200,160 C200,180 210,190 210,220 C210,250 200,280 200,280 L250,280 C250,280 240,250 240,220 C240,190 250,180 250,160 C250,140 230,120 230,100 C230,80 240,70 240,50 C240,30 230,20 230,20 Z"
            fill="#f3f4f6"
            stroke="#d1d5db"
            strokeWidth="1"
            opacity={activeView === 'posterior' ? '1' : '0'}
            aria-hidden="true"
          />
          
          {/* Regiones anatómicas seleccionables */}
          {activeRegions.map((region) => (
            <AnatomicalRegion
              key={region.id}
              region={region}
              isSelected={value.includes(region.id)}
              onClick={() => toggleRegion(region.id)}
              onKeyDown={(e) => handleKeyDown(e, region.id)}
              onFocus={() => setFocusedRegion(region.id)}
              isReadOnly={readOnly}
              focusId={focusedRegion === region.id ? `${id}-focus-description` : undefined}
            />
          ))}
        </svg>
        
        {/* Descripción para lectores de pantalla sobre la región enfocada */}
        {focusedRegion && (
          <div className="sr-only" id={`${id}-focus-description`}>
            {focusDescription}
          </div>
        )}
      </div>
      
      {/* Lista de regiones seleccionadas */}
      {selectedRegions.length > 0 && (
        <div className="mt-4" aria-live="polite">
          <h4 className="text-sm font-medium text-gray-700 mb-2" id={`${id}-selected-regions`}>Regiones seleccionadas:</h4>
          <ul className="flex flex-wrap gap-2" aria-labelledby={`${id}-selected-regions`}>
            {selectedRegions.map(region => region && (
              <SelectedRegionTag
                key={region.id}
                label={region.label}
                onRemove={() => toggleRegion(region.id)}
                readOnly={readOnly}
              />
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}); 