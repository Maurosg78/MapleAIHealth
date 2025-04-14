import React, { useState, useCallback } from 'react';
import { SmartSuggestionPanel, ClinicalSuggestion } from './SmartSuggestionPanel';
import { SOAPData, SpecialtyType } from '../../../types/clinical';

interface ClinicalAssistantProps {
  soapData: SOAPData;
  specialty: SpecialtyType;
  activeSection: 'subjective' | 'objective' | 'assessment' | 'plan';
  onFieldFocus?: (section: string, field: string) => void;
  className?: string;
}

/**
 * Asistente clínico inteligente para ayudar en la documentación médica
 * Analiza los datos ingresados y proporciona sugerencias contextuales
 */
export const ClinicalAssistant: React.FC<ClinicalAssistantProps> = ({
  soapData,
  specialty,
  activeSection,
  onFieldFocus,
  className = '',
}) => {
  // Estado para almacenar las sugerencias seleccionadas
  const [selectedSuggestion, setSelectedSuggestion] = useState<ClinicalSuggestion | null>(null);

  // Función para manejar cuando se selecciona una sugerencia
  const handleSuggestionSelected = useCallback((suggestion: ClinicalSuggestion) => {
    setSelectedSuggestion(suggestion);
    
    // Si hay un campo específico, enfocarlo
    if (suggestion.field && onFieldFocus) {
      onFieldFocus(suggestion.section, suggestion.field);
    }
  }, [onFieldFocus]);

  // Función para manejar cuando se descarta una sugerencia
  const handleDismissSuggestion = useCallback(() => {
    setSelectedSuggestion(null);
  }, []);

  return (
    <div className={`clinical-assistant ${className}`}>
      <div className="mb-4">
        {selectedSuggestion && (
          <div className="bg-blue-50 p-4 rounded-lg mb-4">
            <div className="flex justify-between">
              <h3 className="text-lg font-medium text-blue-900">{selectedSuggestion.title}</h3>
              <button 
                onClick={handleDismissSuggestion}
                className="text-blue-500 hover:text-blue-700"
              >
                <span className="sr-only">Cerrar</span>
                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
            <p className="text-blue-700 mt-2">{selectedSuggestion.description}</p>
            {selectedSuggestion.field && (
              <button
                onClick={() => onFieldFocus && onFieldFocus(selectedSuggestion.section, selectedSuggestion.field!)}
                className="mt-3 inline-flex items-center px-3 py-1.5 border border-blue-300 text-sm leading-4 font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Ir al campo
              </button>
            )}
          </div>
        )}
      </div>

      <SmartSuggestionPanel
        subjective={soapData.subjective}
        objective={soapData.objective}
        assessment={soapData.assessment}
        plan={soapData.plan}
        specialty={specialty}
        activeSection={activeSection}
        onSuggestionSelected={handleSuggestionSelected}
        onDismissSuggestion={handleDismissSuggestion}
      />
    </div>
  );
}; 